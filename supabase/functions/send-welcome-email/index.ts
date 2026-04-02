import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { emailLayout, paragraph, ctaButton, infoCard } from "../_shared/email-template.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  firstName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName }: WelcomeEmailRequest = await req.json();
    const name = firstName || email.split('@')[0];

    console.log("Sending welcome email to:", email);

    const content = `
      <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:16px;color:#1f2937;line-height:1.6;margin:0 0 16px;">
        Hey <strong>${name}</strong>!
      </p>
      ${paragraph('Schön dass du da bist. 🌱')}
      ${paragraph('<strong>Eine Sache kannst du jetzt sofort tun:</strong><br/>Mach ein Foto von deinem Rasen und lade es hoch — du bekommst in 30 Sekunden deinen persönlichen Lawn Score.')}
      ${ctaButton('Jetzt ersten Rasen analysieren →', 'https://www.rasenpilot.com/lawn-analysis')}
      ${infoCard('Tipp', 'Fotografiere bei Tageslicht von oben für das beste Ergebnis.', '📸', '#f0fdf4', '#bbf7d0')}
      ${paragraph('Die meisten Gartenbesitzer in Deutschland haben einen Score unter 65 — <strong>wie gut ist deiner?</strong>')}
      <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:14px;color:#6b7280;margin:24px 0 0;line-height:1.6;">
        — Yannic von Rasenpilot
      </p>
      <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:13px;color:#9ca3af;margin:12px 0 0;line-height:1.6;">
        PS: Falls du Fragen hast, antworte einfach auf diese Email. Ich lese jede Nachricht persönlich.
      </p>
    `;

    const emailResponse = await resend.emails.send({
      from: "Yannic von Rasenpilot <noreply@rasenpilot.com>",
      to: [email],
      reply_to: "info@rasenpilot.com",
      subject: "Dein Rasen wartet auf seine erste Analyse 📸",
      html: emailLayout(content, 'Mach jetzt dein erstes Rasenfoto und erhalte deinen Lawn Score'),
    });

    console.log("Welcome email sent successfully:", emailResponse);

    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      return new Response(
        JSON.stringify({ error: emailResponse.error.message || "Failed to send email" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
