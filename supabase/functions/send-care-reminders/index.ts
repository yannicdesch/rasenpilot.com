import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.4.0';
import { corsHeaders } from '../_shared/cors.ts';
import { emailLayout, paragraph, ctaButton, infoCard } from '../_shared/email-template.ts';

const AFFILIATE_TAG = 'rasenpilot21-21';

const problemProductMap: Record<string, { asin: string; name: string; reason: string }> = {
  'stickstoff': { asin: 'B0CHN4LSWQ', name: 'Turbogrün Extra-Power Rasendünger 10kg', reason: 'Behebt Stickstoffmangel und fördert sattes Grün' },
  'moos': { asin: 'B00UT2LM2O', name: 'COMPO Rasendünger gegen Moos', reason: '3 Monate Langzeitwirkung gegen Moos' },
  'kahl': { asin: 'B00IUPTZVC', name: 'Rasensamen Nachsaat schnellkeimend', reason: 'Füllt kahle Stellen schnell auf' },
  'verdicht': { asin: 'B0001E3W7S', name: 'Gardena Rasenlüfter', reason: 'Lockert verdichteten Boden für besseres Wachstum' },
  'trocken': { asin: 'B0749P42HT', name: 'Gardena Bewässerungscomputer', reason: 'Automatische Bewässerung zur optimalen Zeit' },
  'pilz': { asin: 'B00FDFI4Z2', name: 'COMPO FLORANID Rasendünger', reason: 'Stärkt den Rasen gegen Pilzbefall' },
  'unkraut': { asin: 'B00UT2LM2O', name: 'COMPO Rasendünger gegen Moos', reason: 'Bekämpft Unkraut und stärkt den Rasen' },
  'düng': { asin: 'B0CHN4LSWQ', name: 'Turbogrün Extra-Power Rasendünger 10kg', reason: 'Optimale Nährstoffversorgung für deinen Rasen' },
};

function findProduct(text: string): { asin: string; name: string; reason: string } | null {
  const lower = text.toLowerCase();
  for (const [keyword, product] of Object.entries(problemProductMap)) {
    if (lower.includes(keyword)) return product;
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    await req.json().catch(() => ({}));

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, first_name, email_preferences')
      .not('email_preferences', 'is', null);

    if (profilesError) throw profilesError;

    const usersWithReminders = (profiles || []).filter((p: any) => {
      try {
        const prefs = typeof p.email_preferences === 'string' ? JSON.parse(p.email_preferences) : p.email_preferences;
        if (!prefs?.reminders) return false;
        if (prefs.frequency === 'weekly' && today.getDay() !== 1) return false;
        return true;
      } catch { return false; }
    });

    if (usersWithReminders.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No users to send reminders to' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ success: true, message: 'RESEND_API_KEY not set' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let remindersSent = 0;
    const errors: string[] = [];

    for (const user of usersWithReminders) {
      try {
        // Check duplicate
        const { data: existingLogs } = await supabase
          .from('reminder_logs')
          .select('task_type')
          .eq('user_id', user.id)
          .eq('task_date', todayStr)
          .eq('task_type', 'care_reminder');

        if (existingLogs && existingLogs.length > 0) continue;

        // Get last analysis
        const { data: analysis } = await supabase
          .from('analyses')
          .select('score, step_1, step_2, step_3, summary_short, density_note, moisture_note, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!analysis) continue; // Only send to users with analyses

        const userName = user.first_name || user.full_name?.split(' ')[0] || 'Rasenfreund';
        const score = analysis.score;
        const step1 = analysis.step_1 || 'Regelmäßig bewässern';
        const nextGoal = Math.min(100, score + 8);
        const analysisDate = new Date(analysis.created_at).toLocaleDateString('de-DE', {
          day: '2-digit', month: '2-digit', year: 'numeric'
        });

        // Find matching product from analysis text
        const searchText = [analysis.step_1, analysis.step_2, analysis.step_3, analysis.summary_short, analysis.density_note, analysis.moisture_note].filter(Boolean).join(' ');
        const product = findProduct(searchText);

        let productSection = '';
        if (product) {
          const amazonUrl = `https://www.amazon.de/dp/${product.asin}?tag=${AFFILIATE_TAG}`;
          productSection = `
            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:20px;margin:20px 0;">
              <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:600;color:#92400e;margin:0 0 6px;">🛒 Dein Produkt-Tipp</p>
              <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:15px;color:#1f2937;margin:0 0 4px;"><strong>${product.name}</strong></p>
              <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:13px;color:#6b7280;margin:0 0 12px;">${product.reason}</p>
              <a href="${amazonUrl}" style="display:inline-block;font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:600;color:#92400e;text-decoration:underline;">Auf Amazon ansehen →</a>
              <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:10px;color:#9ca3af;margin:8px 0 0;">* Affiliate-Link – wir erhalten eine kleine Provision</p>
            </div>
          `;
        }

        const content = `
          <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:16px;color:#1f2937;line-height:1.6;margin:0 0 16px;">
            Hey <strong>${userName}</strong>!
          </p>
          ${paragraph(`Basierend auf deiner Analyse vom <strong>${analysisDate}</strong>:`)}
          ${infoCard('Diese Woche empfohlen', `→ ${step1}`, '📋', '#f0fdf4', '#bbf7d0')}
          ${productSection}
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
            <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:13px;color:#6b7280;margin:0 0 4px;">Dein aktueller Score</p>
            <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:32px;font-weight:700;color:#16a34a;margin:0;">${score}<span style="font-size:16px;color:#9ca3af;">/100</span></p>
            <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:13px;color:#6b7280;margin:8px 0 0;">🎯 Nächstes Ziel: ${nextGoal}/100</p>
          </div>
          ${ctaButton('Neue Analyse starten →', 'https://www.rasenpilot.com/lawn-analysis')}
          <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:14px;color:#6b7280;margin:24px 0 0;line-height:1.6;">
            — Das Rasenpilot Team
          </p>
        `;

        const subject = `🌱 ${userName}, dein Rasen braucht diese Woche: ${step1.substring(0, 40)}${step1.length > 40 ? '...' : ''}`;

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            from: 'Rasenpilot <noreply@rasenpilot.com>',
            reply_to: 'info@rasenpilot.com',
            to: [user.email],
            subject,
            html: emailLayout(content, `${step1} — Score: ${score}/100`),
          })
        });

        if (response.ok) {
          await supabase.from('reminder_logs').insert({
            user_id: user.id, task_type: 'care_reminder', task_date: todayStr, email_sent: true
          });
          remindersSent++;
          console.log(`[CARE] Sent to ${user.email}, score: ${score}, product: ${product?.name || 'none'}`);
        } else {
          const errText = await response.text();
          console.error(`[CARE] Failed for ${user.email}: ${errText}`);
          errors.push(`Failed: ${user.email}`);
        }
      } catch (error) {
        errors.push(`Error: ${user.email}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, remindersSent, totalUsers: usersWithReminders.length, errors: errors.length > 0 ? errors : undefined }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[CARE] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
