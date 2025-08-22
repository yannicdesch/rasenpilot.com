import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  firstName: string;
  analysisScore: number;
  analysisId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, analysisScore, analysisId }: WelcomeEmailRequest = await req.json();

    console.log("Sending welcome email to:", email, "with score:", analysisScore);

    const resultUrl = `https://www.rasenpilot.com/analysis-result/${analysisId}`;
    
    const emailResponse = await resend.emails.send({
      from: "RasenPilot <noreply@rasenpilot.com>",
      to: [email],
      subject: `🌱 Willkommen bei RasenPilot! Dein Rasen-Score: ${analysisScore}/100`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Willkommen bei RasenPilot</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2d5a27; margin-bottom: 10px;">🌱 Willkommen bei RasenPilot!</h1>
            <p style="color: #666; font-size: 16px;">Hallo ${firstName}, deine Rasenanalyse ist bereit!</p>
          </div>

          <div style="background: linear-gradient(135deg, #2d5a27 0%, #4a7c59 100%); color: white; padding: 25px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 10px 0; font-size: 24px;">Dein Rasen-Score</h2>
            <div style="font-size: 48px; font-weight: bold; margin: 10px 0;">${analysisScore}/100</div>
            <p style="margin: 0; opacity: 0.9;">
              ${analysisScore >= 80 ? "Ausgezeichnet! 🎉" : 
                analysisScore >= 60 ? "Gut, mit Verbesserungspotential 📈" : 
                "Dein Rasen braucht Aufmerksamkeit 🔧"}
            </p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #2d5a27; margin-top: 0;">Was passiert als nächstes?</h3>
            <ul style="padding-left: 20px;">
              <li style="margin-bottom: 8px;">📊 <strong>Detaillierte Analyse:</strong> Sieh dir deine vollständigen Ergebnisse an</li>
              <li style="margin-bottom: 8px;">📋 <strong>Persönlicher Pflegeplan:</strong> Lade deinen individuellen 3-Schritte-Plan herunter</li>
              <li style="margin-bottom: 8px;">📧 <strong>Automatische Erinnerungen:</strong> Wir erinnern dich an wichtige Pflegetermine</li>
              <li style="margin-bottom: 8px;">🌦️ <strong>Wetterbasierte Tipps:</strong> Optimale Zeiten für Bewässerung und Düngung</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resultUrl}" 
               style="background: linear-gradient(135deg, #2d5a27 0%, #4a7c59 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              🔍 Vollständige Analyse ansehen
            </a>
          </div>

          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="color: #2d5a27; margin-top: 0;">💡 Dein erster Tipp:</h4>
            <p style="margin-bottom: 0;">
              ${analysisScore < 60 ? 
                "Starte mit einer gründlichen Bewässerung am frühen Morgen. Das ist die Basis für alle weiteren Maßnahmen!" :
                analysisScore < 80 ?
                "Dein Rasen ist auf dem richtigen Weg! Konzentriere dich auf regelmäßige Pflege für optimale Ergebnisse." :
                "Fantastischer Rasen! Halte die aktuelle Pflegeroutine bei und dokumentiere deinen Erfolg."}
            </p>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="color: #856404; margin-top: 0;">📅 Deine nächste Erinnerung</h4>
            <p style="margin-bottom: 0; color: #856404;">
              Wir senden dir in 3 Tagen eine Motivations-E-Mail mit weiteren Tipps. 
              Danach erhältst du regelmäßige Erinnerungen für den optimalen Pflegezeitpunkt.
            </p>
          </div>

          <div style="text-align: center; padding: 20px 0; border-top: 1px solid #eee; margin-top: 30px;">
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
              Du erhältst diese E-Mail, weil du dich für RasenPilot-Erinnerungen angemeldet hast.
            </p>
            <p style="color: #666; font-size: 14px; margin: 0;">
              <strong>RasenPilot</strong> - Dein digitaler Rasenexperte<br>
              <a href="https://www.rasenpilot.com" style="color: #2d5a27;">www.rasenpilot.com</a>
            </p>
          </div>

        </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);