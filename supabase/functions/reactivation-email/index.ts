// Daily job: find users whose trial expired in the last 7 days and send a 20% reactivation offer.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;
const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';

const FROM = 'Yannic von Rasenpilot <yannic@notify.rasenpilot.com>';
const SITE = 'https://www.rasenpilot.com';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = 'COMEBACK20-';
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function emailHtml(firstName: string, code: string): string {
  const name = firstName?.trim() || 'Rasenfreund';
  return `<!doctype html><html><body style="font-family:Poppins,Arial,sans-serif;background:#f6f9f4;padding:24px;color:#1a1a1a">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #DFF0D8">
    <h1 style="font-family:'DM Serif Display',serif;color:#007B43;margin:0 0 12px;font-size:26px">Hey ${name}, dein Rasen vermisst dich 🌱</h1>
    <p style="font-size:15px;line-height:1.6">Dein Premium-Test ist gerade ausgelaufen. Damit du nahtlos weitermachen kannst, schenke ich dir <strong>20% Rabatt</strong> auf dein Premium-Abo:</p>
    <div style="background:#DFF0D8;border:2px dashed #007B43;border-radius:12px;padding:20px;text-align:center;margin:20px 0">
      <div style="font-size:12px;color:#007B43;letter-spacing:1px;text-transform:uppercase">Dein Code</div>
      <div style="font-size:26px;font-weight:700;color:#007B43;letter-spacing:2px;margin-top:6px">${code}</div>
      <div style="font-size:12px;color:#4a6b50;margin-top:6px">Gültig 14 Tage</div>
    </div>
    <p style="text-align:center;margin:24px 0">
      <a href="${SITE}/subscription?code=${code}" style="background:#007B43;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block">Jetzt 20% sichern</a>
    </p>
    <p style="font-size:13px;color:#666;line-height:1.5">Premium gibt dir wöchentliche KI-Analysen, persönlichen Pflegekalender und Pro-Chat.</p>
    <p style="font-size:13px;color:#666;margin-top:24px">Viele Grüße,<br/>Yannic</p>
  </div></body></html>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  const r = await fetch(`${GATEWAY_URL}/emails`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'X-Connection-Api-Key': RESEND_API_KEY,
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
  return r.json();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Trial expired in the last 7 days, not currently subscribed
  const { data: expired, error } = await supabase
    .from('subscribers')
    .select('user_id, email, trial_end, subscribed')
    .eq('subscribed', false)
    .not('trial_end', 'is', null)
    .lte('trial_end', now.toISOString())
    .gte('trial_end', sevenDaysAgo.toISOString());

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let sent = 0, skipped = 0, failed = 0;
  for (const sub of expired ?? []) {
    try {
      // Skip if already emailed
      const { data: already } = await supabase
        .from('reactivation_email_log')
        .select('id').eq('email', sub.email).maybeSingle();
      if (already) { skipped++; continue; }

      // Lookup first name
      let firstName = '';
      if (sub.user_id) {
        const { data: p } = await supabase
          .from('profiles').select('first_name, full_name')
          .eq('id', sub.user_id).maybeSingle();
        firstName = p?.first_name || (p?.full_name?.split(' ')[0] ?? '');
      }
      if (!firstName) firstName = sub.email.split('@')[0];

      // Create discount code
      const code = generateCode();
      const { data: dc, error: dcErr } = await supabase
        .from('discount_codes')
        .insert({
          code, user_id: sub.user_id, email: sub.email,
          percent_off: 20, source: 'trial_reactivation',
        })
        .select('id').single();
      if (dcErr) throw dcErr;

      await sendEmail(sub.email, '🌱 20% Rabatt – dein Rasen wartet auf dich', emailHtml(firstName, code));

      await supabase.from('reactivation_email_log').insert({
        email: sub.email, user_id: sub.user_id, discount_code_id: dc.id,
      });
      sent++;
    } catch (e) {
      console.error('reactivation-email failed for', sub.email, e);
      failed++;
    }
  }

  return new Response(JSON.stringify({ candidates: expired?.length ?? 0, sent, skipped, failed }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
