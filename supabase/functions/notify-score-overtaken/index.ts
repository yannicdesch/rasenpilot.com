import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { emailLayout } from "../_shared/email-template.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userName, newScore, zipCode } = await req.json();

    if (!userId || !newScore || !zipCode) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Email not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Find neighbors in same PLZ region (first 2 digits) who now have a lower score
    const plzPrefix = zipCode.substring(0, 2);

    const { data: overtakenUsers, error } = await supabase
      .from('lawn_highscores')
      .select('user_id, user_name, lawn_score, zip_code')
      .neq('user_id', userId)
      .lt('lawn_score', newScore)
      .not('zip_code', 'is', null);

    if (error) {
      console.error('Error fetching overtaken users:', error);
      throw error;
    }

    // Filter by PLZ prefix in code (Supabase doesn't have startsWith)
    const neighbors = (overtakenUsers || []).filter(
      u => u.zip_code?.substring(0, 2) === plzPrefix
    );

    console.log(`Found ${neighbors.length} overtaken neighbors in PLZ ${plzPrefix}xxx`);

    let emailsSent = 0;

    for (const neighbor of neighbors) {
      // Get neighbor's email from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name, email_preferences')
        .eq('id', neighbor.user_id)
        .single();

      if (!profile?.email) continue;

      // Check if user has reminders enabled
      const prefs = profile.email_preferences as any;
      if (prefs && prefs.reminders === false) continue;

      const scoreDiff = newScore - neighbor.lawn_score;
      const neighborName = profile.full_name?.split(' ')[0] || 'Rasenfreund';

      const emailContent = `
        <tr>
          <td class="content-block" style="padding:32px 40px;">
            <h1 class="hero-title" style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:24px;font-weight:700;color:#1a1a1a;margin:0 0 16px;line-height:1.3;">
              ${neighborName}, ein Nachbar hat dich überholt! 🏃‍♂️
            </h1>
            
            <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:15px;color:#555;line-height:1.6;margin:0 0 24px;">
              Jemand in deiner Nachbarschaft (PLZ ${plzPrefix}xxx) hat jetzt einen besseren Rasen-Score als du!
            </p>

            <!-- Score Comparison -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
              <tr>
                <td style="padding:16px;background:#fef3c7;border-radius:12px;text-align:center;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="45%" style="text-align:center;padding:8px;">
                        <p style="font-family:'Inter',Arial,sans-serif;font-size:12px;color:#92400e;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.5px;">Dein Score</p>
                        <p style="font-family:'Inter',Arial,sans-serif;font-size:32px;font-weight:800;color:#b45309;margin:0;">${neighbor.lawn_score}</p>
                      </td>
                      <td width="10%" style="text-align:center;">
                        <p style="font-size:20px;margin:0;">⚡</p>
                      </td>
                      <td width="45%" style="text-align:center;padding:8px;">
                        <p style="font-family:'Inter',Arial,sans-serif;font-size:12px;color:#166534;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.5px;">Nachbar</p>
                        <p style="font-family:'Inter',Arial,sans-serif;font-size:32px;font-weight:800;color:#16a34a;margin:0;">${newScore}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:15px;color:#555;line-height:1.6;margin:0 0 24px;">
              Du liegst <strong>${scoreDiff} Punkte</strong> hinter deinem Nachbarn. Mit der richtigen Pflege kannst du deinen Score schnell verbessern!
            </p>

            <!-- CTA Button -->
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
              <tr>
                <td style="border-radius:12px;background:linear-gradient(135deg,#166534,#16a34a);">
                  <a href="https://www.rasenpilot.com/lawn-analysis?ref=overtaken-email" 
                     class="cta-button"
                     style="display:inline-block;padding:14px 32px;font-family:'Inter',Arial,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px;">
                    🔍 Neue Analyse starten & aufsteigen
                  </a>
                </td>
              </tr>
            </table>

            <!-- Tips -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
              <tr>
                <td style="padding:16px;background:#f0fdf4;border-radius:12px;border-left:4px solid #16a34a;">
                  <p style="font-family:'Inter',Arial,sans-serif;font-size:13px;font-weight:600;color:#166534;margin:0 0 8px;">💡 Tipp: So überholst du zurück</p>
                  <p style="font-family:'Inter',Arial,sans-serif;font-size:13px;color:#555;line-height:1.5;margin:0;">
                    Starte eine neue Rasenanalyse und folge den personalisierten Pflegetipps. Premium-Nutzer verbessern ihren Score 3x schneller!
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;

      const html = emailLayout(emailContent, `Ein Nachbar hat deinen Rasen-Score überholt! Dein Score: ${neighbor.lawn_score} → Nachbar: ${newScore}`);

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'Rasenpilot <noreply@rasenpilot.com>',
            to: [profile.email],
            subject: `🏃 Ein Nachbar hat deinen Rasen-Score überholt! (${neighbor.lawn_score} → ${newScore})`,
            html,
          }),
        });

        if (res.ok) {
          emailsSent++;
          console.log(`Notification sent to ${profile.email}`);
        } else {
          const errText = await res.text();
          console.error(`Failed to send to ${profile.email}:`, errText);
        }
      } catch (emailErr) {
        console.error(`Email send error for ${profile.email}:`, emailErr);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      overtakenCount: neighbors.length,
      emailsSent 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Error in notify-score-overtaken:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
