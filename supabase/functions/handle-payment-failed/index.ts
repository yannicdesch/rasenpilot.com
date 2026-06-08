// Stripe webhook handler for `invoice.payment_failed`.
// 1) Sets the user's profile.payment_status to 'payment_issue'
// 2) Schedules 3 retry attempts over 7 days (Day 1, 3, 7)
// 3) Sends the first reactivation email immediately via Resend
//
// Public endpoint (no JWT) — authenticity is verified via the Stripe signature.

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14.21.0';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface RetryPlan {
  attempt: 1 | 2 | 3;
  scheduledAt: Date;
}

function buildRetrySchedule(now: Date): RetryPlan[] {
  const day = 24 * 60 * 60 * 1000;
  return [
    { attempt: 1, scheduledAt: new Date(now.getTime() + 1 * day) },
    { attempt: 2, scheduledAt: new Date(now.getTime() + 3 * day) },
    { attempt: 3, scheduledAt: new Date(now.getTime() + 7 * day) },
  ];
}

function buildEmailHtml(opts: {
  firstName?: string | null;
  amountDue?: string;
  billingUrl: string;
}): string {
  const greeting = opts.firstName ? `Hi ${opts.firstName},` : 'Hi,';
  return `<!DOCTYPE html>
<html lang="de"><body style="font-family:Poppins,Arial,sans-serif;background:#ffffff;color:#1f2937;padding:24px;">
  <div style="max-width:560px;margin:0 auto;border:1px solid #DFF0D8;border-radius:12px;padding:28px;">
    <h1 style="color:#007B43;font-family:'DM Serif Display',serif;margin:0 0 12px;">Deine Zahlung ist fehlgeschlagen</h1>
    <p>${greeting}</p>
    <p>Leider konnten wir deine letzte Rasenpilot-Premium-Zahlung${opts.amountDue ? ` über <strong>${opts.amountDue}</strong>` : ''} nicht einziehen.</p>
    <p>Damit du deine Premium-Vorteile (Verlauf, Pflege-Kalender, Pro Chat) nicht verlierst, aktualisiere bitte kurz deine Zahlungsmethode:</p>
    <p style="text-align:center;margin:28px 0;">
      <a href="${opts.billingUrl}"
         style="background:#007B43;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:600;display:inline-block;">
        Zahlungsmethode aktualisieren
      </a>
    </p>
    <p style="color:#6b7280;font-size:14px;">Wir versuchen die Abbuchung in den nächsten 7 Tagen automatisch noch dreimal. Danach pausieren wir dein Premium-Abo automatisch.</p>
    <p style="margin-top:24px;">Viele Grüße,<br/>Yannic von Rasenpilot</p>
  </div>
</body></html>`;
}

async function sendRecoveryEmail(opts: {
  to: string;
  firstName?: string | null;
  amountDue?: string;
  billingUrl: string;
}): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Yannic von Rasenpilot <yannic@rasenpilot.com>',
      to: [opts.to],
      subject: 'Deine Premium-Zahlung ist fehlgeschlagen – bitte kurz aktualisieren',
      html: buildEmailHtml({
        firstName: opts.firstName,
        amountDue: opts.amountDue,
        billingUrl: opts.billingUrl,
      }),
      tags: [{ name: 'category', value: 'payment-failed-recovery' }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend failed ${res.status}: ${text}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing signature' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Signature verification failed', err);
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Always ACK 200 to Stripe even when we no-op
  if (event.type !== 'invoice.payment_failed') {
    return new Response(JSON.stringify({ received: true, ignored: event.type }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
    const email = invoice.customer_email ?? null;
    const amountDue = invoice.amount_due
      ? `${(invoice.amount_due / 100).toFixed(2)} ${(invoice.currency ?? 'eur').toUpperCase()}`
      : undefined;

    if (!email && !customerId) {
      console.warn('Invoice without email or customer', invoice.id);
      return new Response(JSON.stringify({ received: true, skipped: 'no_recipient' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Resolve recipient email via Stripe if missing
    let recipientEmail = email;
    if (!recipientEmail && customerId) {
      const cust = await stripe.customers.retrieve(customerId);
      if (!('deleted' in cust) || !cust.deleted) {
        recipientEmail = (cust as Stripe.Customer).email ?? null;
      }
    }
    if (!recipientEmail) {
      return new Response(JSON.stringify({ received: true, skipped: 'no_email' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find profile by email (via subscribers join or direct profile lookup)
    let userId: string | null = null;
    let firstName: string | null = null;
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, first_name')
      .eq('email', recipientEmail)
      .maybeSingle();
    if (profile) {
      userId = profile.id;
      firstName = profile.first_name;
    }

    // 1) Mark payment_status on profile
    if (userId) {
      await supabase
        .from('profiles')
        .update({
          payment_status: 'payment_issue',
          payment_issue_since: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    }

    // 2) Schedule 3 retry attempts (idempotent via UNIQUE invoice+attempt)
    const plan = buildRetrySchedule(new Date());
    const rows = plan.map((p) => ({
      user_id: userId,
      email: recipientEmail,
      stripe_customer_id: customerId ?? null,
      stripe_invoice_id: invoice.id,
      attempt_number: p.attempt,
      scheduled_at: p.scheduledAt.toISOString(),
      status: 'pending' as const,
    }));
    const { error: insertErr } = await supabase
      .from('payment_retry_schedule')
      .upsert(rows, { onConflict: 'stripe_invoice_id,attempt_number', ignoreDuplicates: true });
    if (insertErr) console.error('retry insert error', insertErr);

    // 3) Send first recovery email immediately
    const billingUrl = `${SUPABASE_URL.replace('.supabase.co', '.lovable.app').replace('https://ugaxwcslhoppflrbuwxv', 'https://www.rasenpilot.com').replace('.lovable.app', '')}/subscription-management`;
    const safeBillingUrl = 'https://www.rasenpilot.com/subscription-management';
    try {
      await sendRecoveryEmail({
        to: recipientEmail,
        firstName,
        amountDue,
        billingUrl: safeBillingUrl,
      });
    } catch (e) {
      console.error('Initial recovery email failed', e);
    }

    return new Response(
      JSON.stringify({ received: true, user_id: userId, scheduled: rows.length }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('handle-payment-failed error', err);
    // Still 200 — we don't want Stripe to keep retrying our handler indefinitely
    return new Response(JSON.stringify({ received: true, error: String(err) }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
