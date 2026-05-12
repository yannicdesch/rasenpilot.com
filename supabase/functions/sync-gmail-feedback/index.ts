// Sync Gmail replies to user_feedback table
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GMAIL_CLIENT_ID = Deno.env.get("GMAIL_CLIENT_ID")!;
const GMAIL_CLIENT_SECRET = Deno.env.get("GMAIL_CLIENT_SECRET")!;
const GMAIL_REFRESH_TOKEN = Deno.env.get("GMAIL_REFRESH_TOKEN")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GMAIL_CLIENT_ID,
      client_secret: GMAIL_CLIENT_SECRET,
      refresh_token: GMAIL_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`OAuth refresh failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function gmailGet(path: string, token: string) {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Gmail ${path} failed [${res.status}]: ${await res.text()}`);
  return res.json();
}

function decodeBase64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return new TextDecoder("utf-8").decode(
      Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
    );
  } catch {
    return "";
  }
}

function extractBody(payload: any): string {
  if (!payload) return "";
  // Prefer text/plain
  const findPart = (parts: any[], mime: string): any => {
    for (const p of parts || []) {
      if (p.mimeType === mime && p.body?.data) return p;
      if (p.parts) {
        const nested = findPart(p.parts, mime);
        if (nested) return nested;
      }
    }
    return null;
  };
  if (payload.body?.data && payload.mimeType === "text/plain") {
    return decodeBase64Url(payload.body.data);
  }
  const plain = findPart(payload.parts || [], "text/plain");
  if (plain) return decodeBase64Url(plain.body.data);
  const html = findPart(payload.parts || [], "text/html");
  if (html) return decodeBase64Url(html.body.data).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (payload.body?.data) return decodeBase64Url(payload.body.data);
  return "";
}

function getHeader(headers: any[], name: string): string {
  const h = headers?.find((x) => x.name?.toLowerCase() === name.toLowerCase());
  return h?.value || "";
}

function parseFrom(from: string): { email: string; name: string } {
  const m = from.match(/^\s*(?:"?([^"<]*?)"?\s*)?<([^>]+)>\s*$/);
  if (m) return { name: (m[1] || "").trim(), email: m[2].trim().toLowerCase() };
  return { name: "", email: from.trim().toLowerCase() };
}

function deriveSequenceDay(subject: string): number | null {
  const s = subject.toLowerCase();
  if (s.includes("wie läuft") || s.includes("wie laeuft")) return 3;
  if (s.includes("was wünschst du dir") || s.includes("was wuenschst du dir")) return 7;
  if (s.includes("noch dabei")) return 30;
  return null;
}

function cleanReplyBody(body: string): string {
  // Strip quoted lines and common reply markers
  const lines = body.split(/\r?\n/);
  const out: string[] = [];
  for (const line of lines) {
    if (/^On .+ wrote:$/i.test(line)) break;
    if (/^Am .+ schrieb /i.test(line)) break;
    if (/^>+/.test(line.trim())) continue;
    if (/^-{2,}\s*Original/i.test(line)) break;
    out.push(line);
  }
  return out.join("\n").trim();
}

async function classifyWithClaude(text: string): Promise<{ sentiment: string | null; topics: string[] }> {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 300,
        system:
          "Analysiere diese Nutzer-Antwort auf eine App-Feedback-E-Mail. Antworte nur mit JSON: {sentiment: 'positive'|'neutral'|'negative', topics: ['feature_request'|'bug'|'praise'|'churn_risk'|'confusion'|'price_concern']}",
        messages: [{ role: "user", content: text.slice(0, 4000) }],
      }),
    });
    const data = await res.json();
    const content = data?.content?.[0]?.text || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { sentiment: null, topics: [] };
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      sentiment: parsed.sentiment ?? null,
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
    };
  } catch (e) {
    console.error("Claude classify failed:", e);
    return { sentiment: null, topics: [] };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const token = await getAccessToken();

    // Unread + last 24h, only replies (Re:)
    const query = encodeURIComponent("is:unread newer_than:1d subject:Re");
    const list = await gmailGet(`users/me/messages?q=${query}&maxResults=50`, token);
    const messages: any[] = list.messages || [];

    const results: any[] = [];

    for (const m of messages) {
      const full = await gmailGet(`users/me/messages/${m.id}?format=full`, token);
      const headers = full.payload?.headers || [];
      const subject = getHeader(headers, "Subject");
      if (!/^re:/i.test(subject.trim())) continue;

      const messageIdHeader = getHeader(headers, "Message-ID") || full.id;
      const fromRaw = getHeader(headers, "From");
      const { email: fromEmail, name: fromName } = parseFrom(fromRaw);

      // Dedup by message id stored in raw_email
      const { data: existing } = await supabase
        .from("user_feedback")
        .select("id")
        .filter("raw_email->>message_id", "eq", messageIdHeader)
        .maybeSingle();

      if (existing) {
        results.push({ id: m.id, skipped: "duplicate" });
        continue;
      }

      const rawBody = extractBody(full.payload);
      const body = cleanReplyBody(rawBody);
      if (!body) {
        results.push({ id: m.id, skipped: "empty_body" });
        continue;
      }

      // Look up profile name
      let userName: string | null = fromName || null;
      if (fromEmail) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, full_name, email")
          .eq("email", fromEmail)
          .maybeSingle();
        if (profile) {
          userName = profile.first_name || profile.full_name || userName;
        }
      }

      const sequenceDay = deriveSequenceDay(subject);

      const { data: inserted, error: insertError } = await supabase
        .from("user_feedback")
        .insert({
          user_email: fromEmail,
          user_name: userName,
          feedback_text: body,
          email_subject: subject,
          sequence_day: sequenceDay,
          raw_email: {
            message_id: messageIdHeader,
            gmail_id: full.id,
            thread_id: full.threadId,
            from: fromRaw,
            snippet: full.snippet,
          },
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Insert failed:", insertError);
        results.push({ id: m.id, error: insertError.message });
        continue;
      }

      // Classify with Claude and update
      const { sentiment, topics } = await classifyWithClaude(body);
      await supabase
        .from("user_feedback")
        .update({ sentiment, topics })
        .eq("id", inserted.id);

      results.push({ id: m.id, feedback_id: inserted.id, sentiment, topics });
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("sync-gmail-feedback error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e.message || String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
