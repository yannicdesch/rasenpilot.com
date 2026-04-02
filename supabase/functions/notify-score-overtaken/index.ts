import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts';
import { emailLayout, greeting, paragraph, heading, infoCard, ctaButton, signoff, scoreDisplay } from '../_shared/email-template.ts';

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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      return new Response(JSON.stringify({ error: 'Email not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const plzPrefix = zipCode.substring(0, 2);

    // Get all scores in same PLZ region for ranking
    const { data: allScores, error } = await supabase
      .from('lawn_highscores')
      .select('user_id, user_name, lawn_score, zip_code')
      .not('zip_code', 'is', null);

    if (error) throw error;

    const regionScores = (allScores || [])
      .filter((u: any) => u.zip_code?.substring(0, 2) === plzPrefix)
      .sort((a: any, b: any) => b.lawn_score - a.lawn_score);

    const totalInRegion = regionScores.length;

    // Find users who were overtaken
    const overtaken = regionScores.filter(
      (u: any) => u.user_id !== userId && u.lawn_score < newScore
    );

    console.log(`Found ${overtaken.length} overtaken neighbors in PLZ ${plzPrefix}xxx`);

    let emailsSent = 0;

    for (const neighbor of overtaken) {
      // Get profile + check rate limit
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name, email_preferences, last_overtaken_notification')
        .eq('id', neighbor.user_id)
        .single();

      if (!profile?.email) continue;

      // Check email preferences
      const prefs = profile.email_preferences as any;
      if (prefs && prefs.reminders === false) continue;

      // Rate limit: max 1 per 24h
      if (profile.last_overtaken_notification) {
        const lastNotif = new Date(profile.last_overtaken_notification);
        const hoursSince = (Date.now() - lastNotif.getTime()) / (1000 * 60 * 60);
        if (hoursSince < 24) {
          console.log(`Skipping ${profile.email} — notified ${Math.round(hoursSince)}h ago`);
          continue;
        }
      }

      const neighborName = profile.full_name?.split(' ')[0] || 'Rasenfreund';
      const difference = newScore - neighbor.lawn_score;

      // Calculate old and new rank
      const newRank = regionScores.filter((u: any) =>
        u.user_id === neighbor.user_id ? false : u.lawn_score > neighbor.lawn_score
      ).length + 1 + 1; // +1 for the new scorer pushing them down
      const oldRank = newRank - 1;

      // Get last analysis for quick tips
      const { data: analysis } = await supabase
        .from('analyses')
        .select('step_1, step_2, score, created_at')
        .eq('user_id', neighbor.user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const tip1 = analysis?.step_1 || 'Regelmäßig mähen — nicht kürzer als 4 cm';
      const tip2 = analysis?.step_2 || 'Bewässerung am frühen Morgen für bestes Ergebnis';

      const content = `
        ${greeting(neighborName)}
        ${paragraph(`In PLZ <strong>${plzPrefix}xxx</strong> hat jemand gerade deinen Rasen-Score überholt!`)}

        ${infoCard(
          '📊 Dein Ranking',
          `Dein Rang vorher: <strong>Platz ${oldRank}</strong> von ${totalInRegion}<br>Dein Rang jetzt: <strong>Platz ${newRank}</strong> von ${totalInRegion}`,
          '📉', '#fef3c7', '#fde68a'
        )}

        ${infoCard(
          '⚡ Score-Vergleich',
          `Dein Score: <strong>${neighbor.lawn_score}/100</strong><br>Neuer Konkurrent: <strong>${newScore}/100</strong><br>Differenz: nur <strong>${difference} Punkte</strong>!`,
          '⚡', '#fee2e2', '#fecaca'
        )}

        ${heading('💡 So holst du schnell auf')}
        ${infoCard('Schritt 1', tip1, '→', '#f0fdf4', '#bbf7d0')}
        ${infoCard('Schritt 2', tip2, '→', '#f0fdf4', '#bbf7d0')}

        ${ctaButton('Jetzt Analyse starten und aufholen →', 'https://www.rasenpilot.com/lawn-analysis?ref=overtaken-email')}
        ${paragraph('Niemand will den schlechtesten Rasen in der Nachbarschaft — oder? 😄')}
        ${signoff('Das Rasenpilot Team')}
      `;

      const html = emailLayout(content, `Jemand hat deinen Rasen-Score überholt!`);

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` },
          body: JSON.stringify({
            from: 'Rasenpilot <noreply@rasenpilot.com>',
            to: [profile.email],
            subject: `😱 ${neighborName}, jemand hat deinen Rasen-Score überholt!`,
            html,
          }),
        });

        if (res.ok) {
          emailsSent++;
          // Update rate limit timestamp
          await supabase
            .from('profiles')
            .update({ last_overtaken_notification: new Date().toISOString() })
            .eq('id', neighbor.user_id);
          console.log(`Overtaken notification sent to ${profile.email}`);
        } else {
          console.error(`Failed to send to ${profile.email}:`, await res.text());
        }
      } catch (emailErr) {
        console.error(`Email error for ${profile.email}:`, emailErr);
      }
    }

    return new Response(JSON.stringify({
      success: true, overtakenCount: overtaken.length, emailsSent
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('Error in notify-score-overtaken:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
