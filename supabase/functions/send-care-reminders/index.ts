import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.4.0';
import { corsHeaders } from '../_shared/cors.ts';
import { emailLayout, greeting, paragraph, heading, taskCard, infoCard, ctaButton, signoff } from '../_shared/email-template.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { scheduledRun = false, testUser = false } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    console.log('Starting care reminder job...');
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, email, full_name, email_preferences')
      .not('email_preferences', 'is', null);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    const usersWithReminders = (profiles || []).filter((p: any) => {
      try {
        const prefs = typeof p.email_preferences === 'string' ? JSON.parse(p.email_preferences) : p.email_preferences;
        return prefs?.reminders === true;
      } catch { return false; }
    });

    if (usersWithReminders.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No users to send reminders to' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let remindersSent = 0;
    const errors: string[] = [];

    for (const user of usersWithReminders) {
      try {
        const { data: lawnProfiles } = await supabaseClient
          .from('lawn_profiles')
          .select('id, user_id, name, grass_type, lawn_size, last_mowed, last_fertilized, soil_type')
          .eq('user_id', user.id)
          .limit(1);

        const lawnProfile = lawnProfiles?.[0];
        if (!lawnProfile) continue;

        const tasksForToday = getTasksForToday(lawnProfile, today);
        if (tasksForToday.length === 0) continue;

        const { data: existingLogs } = await supabaseClient
          .from('reminder_logs')
          .select('task_type')
          .eq('user_id', user.id)
          .eq('task_date', todayStr);

        const alreadySentTypes = existingLogs?.map((log: any) => log.task_type) || [];
        const newTasks = tasksForToday.filter(task => !alreadySentTypes.includes(task.type));
        if (newTasks.length === 0) continue;

        const emailSent = await sendReminderEmail(user, lawnProfile, newTasks);

        if (emailSent) {
          for (const task of newTasks) {
            await supabaseClient.from('reminder_logs').insert({ user_id: user.id, task_type: task.type, task_date: todayStr, email_sent: true });
          }
          remindersSent++;
        } else {
          errors.push(`Failed to send reminder to ${user.email}`);
        }
      } catch (error) {
        errors.push(`Error processing ${user.email}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, remindersSent, totalUsers: usersWithReminders.length, errors: errors.length > 0 ? errors : undefined }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-care-reminders function:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

interface CareTask { type: string; title: string; description: string; icon: string; }

function getTasksForToday(profile: any, today: Date): CareTask[] {
  const tasks: CareTask[] = [];
  const month = today.getMonth();
  const isGrowingSeason = month >= 3 && month <= 9;
  const mowingFreq = isGrowingSeason ? 7 : 14;
  const fertilizingFreq = (month >= 2 && month <= 4) || (month >= 8 && month <= 10) ? 45 : 120;

  if (profile.last_mowed) {
    const daysSince = Math.floor((today.getTime() - new Date(profile.last_mowed).getTime()) / 86400000);
    if (daysSince >= mowingFreq) {
      tasks.push({ type: 'mowing', title: 'Zeit zum Mähen', description: `Dein Rasen wurde zuletzt am ${new Date(profile.last_mowed).toLocaleDateString('de-DE')} gemäht – ${daysSince} Tage her.`, icon: '🌿' });
    }
  } else {
    tasks.push({ type: 'mowing', title: 'Rasen mähen', description: 'Du hast noch kein Mähdatum eingetragen. Trage es ein, um bessere Empfehlungen zu erhalten.', icon: '🌿' });
  }

  if (profile.last_fertilized) {
    const daysSince = Math.floor((today.getTime() - new Date(profile.last_fertilized).getTime()) / 86400000);
    if (daysSince >= fertilizingFreq) {
      tasks.push({ type: 'fertilizing', title: 'Düngen empfohlen', description: `Letzte Düngung: ${new Date(profile.last_fertilized).toLocaleDateString('de-DE')} – ${daysSince} Tage her.`, icon: '🧪' });
    }
  }

  return tasks;
}

async function sendReminderEmail(user: any, lawnProfile: any, tasks: CareTask[]): Promise<boolean> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    console.log('RESEND_API_KEY not configured - skipping email to:', user.email);
    return true;
  }

  const taskCards = tasks.map(t => taskCard(t.title, t.description, t.icon)).join('');

  const content = `
    ${greeting(user.full_name || 'Rasenfreund')}
    ${paragraph(`Hier ist dein täglicher Pflegeplan für <strong>${lawnProfile.name || 'deinen Rasen'}</strong>.`)}
    ${heading(`📋 Heute zu erledigen (${tasks.length})`)}
    ${taskCards}
    ${infoCard('Profi-Tipp', 'Mähe bei bedecktem Himmel oder am späten Nachmittag – so vermeidest du Stress für deinen Rasen.', '💡')}
    ${ctaButton('Zur Rasen-Analyse →', 'https://www.rasenpilot.com/lawn-analysis')}
    ${signoff()}
  `;

  const emailHtml = emailLayout(content, `${tasks.length} Rasenpflege-Aufgabe${tasks.length > 1 ? 'n' : ''} für heute`);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: 'Rasenpilot <noreply@rasenpilot.com>',
        to: [user.email],
        subject: `🌿 ${tasks.length} Aufgabe${tasks.length > 1 ? 'n' : ''} für deinen Rasen heute`,
        html: emailHtml
      })
    });
    if (!response.ok) {
      console.error('Email API error:', await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
