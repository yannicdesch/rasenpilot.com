// Cron-driven processor: sends scheduled payment-failed recovery emails.
// Run daily via pg_cron — picks up any `pending` rows with scheduled_at <= now().
// Cancels remaining retries when the invoice has been paid in Stripe.

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14.21.0';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface RetryRow {
  id: string;
  user_id: string | null;
  email: string;
  stripe_customer_id: string | null;
  stripe_invoice_id: string;
  attempt_number: number;
}

async function sendEmail(row: RetryRow, firstName: string | null): Promise<void> {
  const html = `<!DOCTYPE html><html lang="de"><body style="font-family:Poppins,Arial,sans-serif;background:#ffffff;color:#1f2937;padding:24px;">
    <div style="max-width:560px;margin:0 auto;border:1px solid #DFF0D8;border-radius:12px;padding:28px;">
      <h1 style="color:#007B43;font-family:'DM Serif Display',serif;margin:0 0 12px;">Erinnerung: Zahlung noch offen (Versuch ${row.attempt_number}/3)</h1>
      <p>${firstName ? `Hi ${firstName},` : 'Hi,'}</p>
      <p>Wir konnten deine Premium-Zahlung weiterhin nicht einziehen. Bitte aktualisiere deine Zahlungsmethode, damit dein Zugang aktiv bleibt.</p>
      <p style="text-align:center;margin:28px 0;">
        <a href="https://www.rasenpilot.com/subscription-management"
           style="background:#007B43;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:600;display:inline-block;">
          Jetzt aktualisieren
        </a>
      </p>
      ${row.attempt_number === 3
        ? '<p style="color:#b91c1c;font-size:14px;"><strong>Letzte Erinnerung:</strong> Nach diesem Versuch wird dein Premium-Abo automatisch pausiert.</p>'
        : ''}
      <p style="margin-top:24px;">Viele Grüße,<br/>Yannic von Rasenpilot</p>
    </div></body></html>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Yannic von Rasenpilot <yannic@rasenpilot.com>',
      to: [row.email],
      subject: `Erinnerung ${row.attempt_number}/3 – Zahlungsmethode aktualisieren`,
      html,
      tags: [{ name: 'category', value: 'payment-failed-recovery' }],
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { data: due, error } = await supabase
      .from('payment_retry_schedule')
      .select('id, user_id, email, stripe_customer_id, stripe_invoice_id, attempt_number')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .limit(100);
    if (error) throw error;

    const rows = (due ?? []) as RetryRow[];
    const results: Array<Record<string, unknown>> = [];

    for (const row of rows) {
      try {
        // If invoice was paid in the meantime → cancel remaining attempts and clear flag
        const invoice = await stripe.invoices.retrieve(row.stripe_invoice_id);
        if (invoice.status === 'paid') {
          await supabase
            .from('payment_retry_schedule')
            .update({ status: 'resolved', updated_at: new Date().toISOString() })
            .eq('stripe_invoice_id', row.stripe_invoice_id);
          if (row.user_id) {
            await supabase
              .from('profiles')
              .update({ payment_status: 'ok', payment_issue_since: null })
              .eq('id', row.user_id);
          }
          results.push({ id: row.id, action: 'resolved' });
          continue;
        }

        let firstName: string | null = null;
        if (row.user_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('id', row.user_id)
            .maybeSingle();
          firstName = profile?.first_name ?? null;
        }

        await sendEmail(row, firstName);
        await supabase
          .from('payment_retry_schedule')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', row.id);
        results.push({ id: row.id, action: 'sent' });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        await supabase
          .from('payment_retry_schedule')
          .update({ last_error: msg, updated_at: new Date().toISOString() })
          .eq('id', row.id);
        results.push({ id: row.id, action: 'error', message: msg });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('process-payment-retries error', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
