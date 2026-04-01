import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { emailLayout, greeting, paragraph, ctaButton, featureList, signoff } from '../_shared/email-template.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Nicht autorisiert");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Nicht autorisiert");

    const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: user.id });
    if (!isAdmin) throw new Error("Nur Admins können E-Mails senden");

    const { email } = await req.json();
    if (!email) throw new Error("E-Mail-Adresse erforderlich");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY nicht konfiguriert");

    const registerUrl = `https://www.rasenpilot.com/auth?tab=register&email=${encodeURIComponent(email)}`;

    const htmlContent = emailLayout(
      greeting('Hallo') +
      paragraph('Vielen Dank, dass du dich für <strong>Rasenpilot Premium</strong> entschieden hast! 🎉') +
      paragraph('Wir haben bemerkt, dass du dein Premium-Abo erfolgreich abgeschlossen hast, aber noch kein Konto bei uns erstellt hast. Um alle Premium-Vorteile nutzen zu können, registriere dich bitte mit dieser E-Mail-Adresse:') +
      `<div style="background:#f0f9f0;border-radius:8px;padding:16px;margin:16px 0;text-align:center;">
        <span style="font-family:monospace;font-size:16px;color:#166534;font-weight:600;">${email}</span>
      </div>` +
      featureList([
        '🔍 Unbegrenzte KI-Rasenanalysen',
        '📊 Persönliches Premium-Dashboard',
        '📅 Individueller Pflegekalender',
        '💬 KI-Chat mit Rasenexperte',
        '📈 Fortschritt messen mit Vorher/Nachher-Vergleich',
      ]) +
      ctaButton('Jetzt kostenlos registrieren →', registerUrl) +
      paragraph('Die Registrierung dauert nur 30 Sekunden. Nutze unbedingt die oben genannte E-Mail-Adresse, damit dein Premium-Abo automatisch verknüpft wird.') +
      paragraph('Bei Fragen antworten Sie einfach auf diese E-Mail — wir helfen gerne!') +
      signoff('Dein Rasenpilot-Team 🌱'),
      'Aktiviere jetzt dein Rasenpilot-Premium-Konto'
    );

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "Rasenpilot <rasenpilot@gmail.com>",
        to: [email],
        subject: "🌱 Aktiviere jetzt dein Rasenpilot-Premium!",
        html: htmlContent,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("[SEND-REG-EMAIL] Resend error:", result);
      throw new Error(result.message || "E-Mail konnte nicht gesendet werden");
    }

    console.log(`[SEND-REG-EMAIL] Email sent to ${email}:`, result.id);

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("[SEND-REG-EMAIL] Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
