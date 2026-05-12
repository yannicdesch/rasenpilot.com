import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SEQUENCE_TYPE = 'expired_trial';
const FROM_EMAIL = 'Yannic von Rasenpilot <yannic@notify.rasenpilot.com>';
const REPLY_TO = 'rasenpilot.kontakt@gmail.com';

const STEPS: Record<number, { day: number; subject: string; html: (name: string) => string }> = {
  1: {
    day: 1,
    subject: 'Was hat dir gefehlt? 🌱',
    html: (name) => `
      <div style="font-family: -apple-system, sans-serif; max-width: 580px; margin: 0 auto; color: #1a1a1a;">
        <p>Hi ${name},</p>
        <p>schade, dass du dich gegen Premium entschieden hast. Ich würde gerne kurz verstehen: <strong>Was hat dir gefehlt?</strong></p>
        <p>Antworte einfach auf diese Email — jede Rückmeldung hilft mir, Rasenpilot besser zu machen.</p>
        <p>Viele Grüße,<br>Yannic</p>
      </div>`,
  },
  2: {
    day: 3,
    subject: '🎁 20% Rabatt nur für dich',
    html: (name) => `
      <div style="font-family: -apple-system, sans-serif; max-width: 580px; margin: 0 auto; color: #1a1a1a;">
        <p>Hi ${name},</p>
        <p>ich möchte dir noch eine Chance geben, Rasenpilot Premium zu testen — mit <strong>20% Rabatt</strong> auf das Jahresabo.</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="https://www.rasenpilot.com/subscription?promo=COMEBACK20" style="background: #007B43; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Jetzt mit 20% Rabatt sichern</a>
        </p>
        <p>Code: <strong>COMEBACK20</strong> — gültig 48 Stunden.</p>
        <p>Viele Grüße,<br>Yannic</p>
      </div>`,
  },
  3: {
    day: 5,
    subject: 'Letzte Chance — sollen wir kurz telefonieren?',
    html: (name) => `
      <div style="font-family: -apple-system, sans-serif; max-width: 580px; margin: 0 auto; color: #1a1a1a;">
        <p>Hi ${name},</p>
        <p>das ist meine letzte Email zu diesem Thema. Falls du noch Fragen zu Premium hast, biete ich dir gerne ein <strong>kurzes 10-Minuten Telefonat</strong> an — kostenlos und unverbindlich.</p>
        <p>Antworte einfach mit deiner Telefonnummer und einem passenden Zeitfenster, dann melde ich mich.</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="https://www.rasenpilot.com/subscription?promo=COMEBACK20" style="background: #007B43; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Doch direkt Premium starten</a>
        </p>
        <p>Viele Grüße,<br>Yannic</p>
      </div>`,
  },
};

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) throw new Error('RESEND_API_KEY missing');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], reply_to: REPLY_TO, subject, html }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return res.json();
}

function firstName(email: string, full?: string | null) {
  if (full && full.trim()) return full.trim().split(' ')[0];
  return email.split('@')[0];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const stats = { processed: 0, sent: 0, completed: 0, errors: 0, started: 0 };

  try {
    // 1. Find expired trial users (trial_end < now, not subscribed)
    const { data: expired, error: expErr } = await supabase
      .from('subscribers')
      .select('user_id, email, trial_end')
      .eq('subscribed', false)
      .eq('is_trial', true)
      .lt('trial_end', new Date().toISOString())
      .gt('trial_end', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (expErr) throw expErr;

    for (const sub of expired ?? []) {
      // Skip those who later subscribed (double-check)
      const { data: existing } = await supabase
        .from('email_sequences')
        .select('*')
        .eq('email', sub.email)
        .eq('sequence_type', SEQUENCE_TYPE)
        .maybeSingle();

      if (!existing) {
        await supabase.from('email_sequences').insert({
          user_id: sub.user_id,
          email: sub.email,
          sequence_type: SEQUENCE_TYPE,
          current_step: 0,
          completed: false,
        });
        stats.started++;
      }
    }

    // 2. Process active sequences
    const { data: active, error: actErr } = await supabase
      .from('email_sequences')
      .select('*')
      .eq('sequence_type', SEQUENCE_TYPE)
      .eq('completed', false);

    if (actErr) throw actErr;

    for (const seq of active ?? []) {
      stats.processed++;
      const nextStep = seq.current_step + 1;
      const stepDef = STEPS[nextStep];
      if (!stepDef) {
        await supabase.from('email_sequences').update({ completed: true }).eq('id', seq.id);
        stats.completed++;
        continue;
      }

      const baseDate = new Date(seq.last_sent ?? seq.started_at);
      const requiredDay = stepDef.day - (seq.current_step === 0 ? 0 : STEPS[seq.current_step].day);
      const dueAt = new Date(baseDate.getTime() + requiredDay * 24 * 60 * 60 * 1000);
      if (dueAt > new Date()) continue;

      // Skip if user converted in the meantime
      const { data: subCheck } = await supabase
        .from('subscribers')
        .select('subscribed')
        .eq('email', seq.email)
        .maybeSingle();
      if (subCheck?.subscribed) {
        await supabase.from('email_sequences').update({ completed: true }).eq('id', seq.id);
        stats.completed++;
        continue;
      }

      let name = seq.email.split('@')[0];
      if (seq.user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, full_name')
          .eq('id', seq.user_id)
          .maybeSingle();
        name = firstName(seq.email, profile?.first_name || profile?.full_name);
      }

      try {
        await sendEmail(seq.email, stepDef.subject, stepDef.html(name));
        stats.sent++;
        const isLast = !STEPS[nextStep + 1];
        await supabase
          .from('email_sequences')
          .update({
            current_step: nextStep,
            last_sent: new Date().toISOString(),
            completed: isLast,
          })
          .eq('id', seq.id);
        if (isLast) stats.completed++;
      } catch (e) {
        console.error('Send failed', seq.email, e);
        stats.errors++;
      }
    }

    return new Response(JSON.stringify({ success: true, stats }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('expired-trial-sequence error', e);
    return new Response(JSON.stringify({ error: String(e), stats }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
