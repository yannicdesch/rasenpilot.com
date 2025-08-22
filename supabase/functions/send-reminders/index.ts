import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReminderRecord {
  id: string;
  user_id: string;
  kind: string;
  message_key: string;
  payload_url: string;
  last_score: number;
  profiles: {
    first_name: string;
    email: string;
    consent_marketing: boolean;
  };
}

const emailTemplates = {
  motivation_3d: {
    subject: (name: string) => `${name}, 3 Tage sind rum – hol dir +8 Punkte!`,
    content: (name: string, score: number, url: string) => `
      <p>Dein letzter Rasen-Score: ${score}/100. Mit etwas Pflege knackst du locker die nächste Stufe. Mach schnell ein neues Foto – wir checken den Fortschritt.</p>
      <p><a href="${url}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">👉 Jetzt neues Foto hochladen</a></p>
    `
  },
  tip_7d: {
    subject: () => `Kurzer Rasentipp für diese Woche 🌱`,
    content: (name: string, score: number, url: string) => `
      <p>Regelmäßig wässern (morgens/abends) wirkt jetzt am besten. Lade ein Bild hoch – ich sag dir, ob sich die Dichte schon verbessert hat.</p>
      <p><a href="${url}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">👉 Fortschritt prüfen</a></p>
    `
  },
  progress_14d: {
    subject: () => `Zeit für den Fortschritts-Check 📸`,
    content: (name: string, score: number, url: string) => `
      <p>Zwei Wochen vorbei – ideal, um deinen Rasen erneut zu prüfen. Vielleicht neuer Bestwert?</p>
      <p><a href="${url}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">👉 Jetzt analysieren</a></p>
    `
  },
  season_30d: {
    subject: () => `Monats-Check: Das ist jetzt wichtig für deinen Rasen`,
    content: (name: string, score: number, url: string) => {
      const month = new Date().getMonth();
      let seasonTip = '';
      
      if (month >= 2 && month <= 4) { // März-Mai
        seasonTip = 'Jetzt ist der perfekte Zeitpunkt für die Frühjahrspflege und erste Düngung.';
      } else if (month >= 5 && month <= 7) { // Juni-August
        seasonTip = 'Achte auf gleichmäßige Bewässerung in den warmen Wochen.';
      } else if (month >= 8 && month <= 9) { // September-Oktober
        seasonTip = 'Herbst ist Nachsaat-Zeit für eine dichte Narbe im Frühjahr.';
      } else { // November-Februar
        seasonTip = 'Schonend behandeln, Fußverkehr reduzieren, Moos kontrollieren.';
      }
      
      return `
        <p>Im aktuellen Monat zählt: ${seasonTip} Foto hochladen und wir geben dir den 3-Schritte-Plan.</p>
        <p><a href="${url}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">👉 Neuen Plan holen</a></p>
      `;
    }
  },
  compare_region_60d: {
    subject: () => `Schaffst du mehr Punkte als der Schnitt in deiner Region?`,
    content: (name: string, score: number, url: string) => `
      <p>Du lagst bei ${score}/100. Viele Nutzer steigern sich bis Tag 60 deutlich. Neues Foto – wir messen deinen Fortschritt.</p>
      <p><a href="${url}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">👉 Fortschritt messen</a></p>
    `
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== SEND REMINDERS FUNCTION ===');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    // Get pending reminders that are due
    const { data: dueReminders, error: reminderError } = await supabase
      .from('reminders')
      .select(`
        *,
        profiles:user_id (
          first_name,
          email,
          consent_marketing
        )
      `)
      .eq('status', 'pending')
      .lte('send_at', new Date().toISOString());

    if (reminderError) {
      console.error('Error fetching reminders:', reminderError);
      throw reminderError;
    }

    console.log(`Found ${dueReminders?.length || 0} due reminders`);

    let sentCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const reminder of (dueReminders as ReminderRecord[]) || []) {
      try {
        // Check consent
        if (!reminder.profiles.consent_marketing) {
          await supabase
            .from('reminders')
            .update({ status: 'skipped' })
            .eq('id', reminder.id);
          skippedCount++;
          continue;
        }

        // Get email template
        const template = emailTemplates[reminder.message_key as keyof typeof emailTemplates];
        if (!template) {
          console.error(`Unknown message template: ${reminder.message_key}`);
          continue;
        }

        const firstName = reminder.profiles.first_name || 'Rasen-Fan';
        const subject = template.subject(firstName);
        const content = template.content(firstName, reminder.last_score, reminder.payload_url);

        // Send email
        const emailResponse = await resend.emails.send({
          from: 'Rasenpilot <noreply@rasenpilot.com>',
          to: [reminder.profiles.email],
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #22c55e;">Rasenpilot</h2>
              ${content}
              <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #666;">
                Du kannst Erinnerungen jederzeit abbestellen: 
                <a href="https://www.rasenpilot.com/account-settings" style="color: #22c55e;">Einstellungen öffnen</a>
              </p>
            </div>
          `
        });

        console.log(`Email sent to ${reminder.profiles.email}:`, emailResponse);

        // Mark as sent
        await supabase
          .from('reminders')
          .update({ status: 'sent' })
          .eq('id', reminder.id);

        sentCount++;

      } catch (error) {
        console.error(`Error sending reminder ${reminder.id}:`, error);
        errors.push(`Reminder ${reminder.id}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        sent: sentCount,
        skipped: skippedCount,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== SEND REMINDERS ERROR ===');
    console.error('Error details:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send reminders' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});