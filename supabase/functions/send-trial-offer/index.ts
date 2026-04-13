import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, score } = await req.json();
    
    if (!email) {
      return new Response(JSON.stringify({ error: "Email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userName = name || "dort";
    const userScore = score || 58;

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) throw new Error("RESEND_API_KEY not set");

    const resend = new Resend(resendApiKey);

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #f5f5f0; padding: 20px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    
    <div style="background: linear-gradient(135deg, #2d5a3d 0%, #4a8c5c 100%); padding: 30px 25px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 22px; margin: 0;">🌿 Rasenpilot</h1>
      <p style="color: rgba(255,255,255,0.85); font-size: 13px; margin: 8px 0 0;">Dein smarter Rasenberater</p>
    </div>
    
    <div style="padding: 30px 25px;">
      <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 15px;">Hey ${userName}! 👋</h2>
      
      <p style="color: #333; font-size: 15px; line-height: 1.6; margin: 0 0 15px;">
        Schön, dass du bei Rasenpilot dabei bist! Ich habe gesehen, dass du bereits eine Analyse gemacht hast:
      </p>
      
      <div style="background: linear-gradient(135deg, #f0f7f2, #e8f5e9); border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
        <p style="color: #666; font-size: 13px; margin: 0 0 5px; text-transform: uppercase; letter-spacing: 1px;">Dein Rasen-Score</p>
        <p style="color: #2d5a3d; font-size: 42px; font-weight: bold; margin: 0;">${userScore}<span style="font-size: 18px; color: #888;">/100</span></p>
        <p style="color: #666; font-size: 13px; margin: 5px 0 0;">Da geht noch was! 💪</p>
      </div>
      
      <p style="color: #333; font-size: 15px; line-height: 1.6; margin: 0 0 15px;">
        Mit dem <strong>kostenlosen 7-Tage-Premium-Trial</strong> holst du das Maximum aus deinem Rasen:
      </p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <tr><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 15px; color: #333;">📊 <strong>Unbegrenzte Analysen</strong></td><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: right; color: #2d5a3d; font-size: 13px;">Fortschritt tracken</td></tr>
        <tr><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 15px; color: #333;">📅 <strong>Persönlicher Pflegekalender</strong></td><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: right; color: #2d5a3d; font-size: 13px;">Wöchentlich angepasst</td></tr>
        <tr><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 15px; color: #333;">🌤️ <strong>Wetter-Tipps</strong></td><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: right; color: #2d5a3d; font-size: 13px;">Richtig pflegen</td></tr>
        <tr><td style="padding: 10px 0; font-size: 15px; color: #333;">💬 <strong>KI-Rasenberater</strong></td><td style="padding: 10px 0; text-align: right; color: #2d5a3d; font-size: 13px;">Sofort Antworten</td></tr>
      </table>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://rasenpilot.lovable.app/subscription?ref=email-trial&utm_source=email&utm_medium=trial-offer&utm_campaign=personal-trial" 
           style="display: inline-block; background: linear-gradient(135deg, #2d5a3d, #4a8c5c); color: #ffffff; text-decoration: none; padding: 16px 44px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 12px rgba(45,90,61,0.3);">
          🚀 Jetzt 7 Tage kostenlos testen
        </a>
      </div>
      
      <p style="color: #888; font-size: 13px; text-align: center; margin: 0 0 20px;">
        Keine Kreditkarte nötig · Jederzeit kündbar · Erste Abbuchung nach 7 Tagen
      </p>
      
      <p style="color: #333; font-size: 15px; line-height: 1.6; margin: 20px 0 0;">
        Viele Grüße,<br>
        <strong>Yannic von Rasenpilot</strong> 🌿
      </p>
    </div>
    
    <div style="background: #f9f9f6; padding: 15px 25px; text-align: center;">
      <p style="color: #999; font-size: 11px; margin: 0;">
        Du erhältst diese E-Mail, weil du dich bei rasenpilot.lovable.app registriert hast.
      </p>
    </div>
  </div>
</body>
</html>`;

    const data = await resend.emails.send({
      from: "Yannic von Rasenpilot <onboarding@resend.dev>",
      to: [email],
      subject: `${userName}, dein Rasen-Score ist ${userScore} — mit Premium schaffst du 80+ 🌿`,
      html,
    });

    console.log("Trial offer email sent:", JSON.stringify(data));

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
