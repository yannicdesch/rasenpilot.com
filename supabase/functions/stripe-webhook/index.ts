import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

const acknowledge = (payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), { status: 200, headers: jsonHeaders });

const err = (e: unknown) => (e instanceof Error ? e.message : String(e));

// ── helpers ──────────────────────────────────────────────────────────────────

async function upsertSubscriber(
  supabase: ReturnType<typeof createClient>,
  stripe: Stripe,
  subscription: Stripe.Subscription,
  email: string,
  customerId?: string,
) {
  const isActive =
    subscription.status === "active" || subscription.status === "trialing";
  const isTrialing = subscription.status === "trialing";

  const ts = (unix: number | null | undefined) =>
    unix ? new Date(unix * 1000).toISOString() : null;

  const priceId = subscription.items.data[0]?.price.id;
  const { data: product } = await supabase
    .from("stripe_products")
    .select("price_type")
    .eq("stripe_price_id", priceId)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  const { error } = await supabase.from("subscribers").upsert(
    {
      email,
      user_id: profile?.id || null,
      stripe_customer_id: customerId || (subscription.customer as string),
      subscribed: isActive,
      subscription_tier: product?.price_type || "monthly",
      subscription_end: ts(subscription.current_period_end),
      is_trial: isTrialing,
      trial_start: ts(subscription.trial_start),
      trial_end: ts(subscription.trial_end),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" },
  );

  if (error) {
    console.error("[STRIPE-WEBHOOK] Subscriber upsert error:", error);
  } else {
    console.log("[STRIPE-WEBHOOK] Subscriber upserted for", email);
  }
}

async function getCustomerEmail(
  stripe: Stripe,
  customerId: string,
): Promise<string | null> {
  const customer = await stripe.customers.retrieve(customerId);
  return "email" in customer ? customer.email : null;
}

async function sendTrialEndingEmail(email: string, resendKey: string) {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rasenpilot <noreply@rasenpilot.com>",
        to: email,
        subject: "Deine Rasenpilot-Testphase endet bald",
        html: `
          <h2>Hallo!</h2>
          <p>Deine 7-tägige kostenlose Testphase bei <strong>Rasenpilot Premium</strong> endet in Kürze.</p>
          <p>Nach Ablauf wird dein Abonnement automatisch aktiviert. Falls du nicht fortfahren möchtest, kannst du jederzeit vorher kündigen.</p>
          <p>Wir freuen uns, dass du Rasenpilot nutzt! 🌱</p>
          <p><a href="https://www.rasenpilot.com/subscription-management" style="background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Abonnement verwalten</a></p>
          <p>Viele Grüße,<br/>Dein Rasenpilot-Team</p>
        `,
      }),
    });
    const data = await res.text();
    console.log("[STRIPE-WEBHOOK] Trial ending email sent:", res.status, data);
  } catch (e) {
    console.error("[STRIPE-WEBHOOK] Failed to send trial ending email:", err(e));
  }
}

// ── event processor ──────────────────────────────────────────────────────────

async function processStripeEvent(
  event: Stripe.Event,
  stripe: Stripe,
  supabase: ReturnType<typeof createClient>,
) {
  switch (event.type) {
    // ── checkout completed ─────────────────────────────────────────────────
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("[STRIPE-WEBHOOK] checkout.session.completed:", session.id);

      const customerEmail =
        session.customer_email || session.customer_details?.email;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (!customerEmail) {
        console.warn("[STRIPE-WEBHOOK] Missing email in checkout", session.id);
        return;
      }
      if (!subscriptionId) {
        console.log("[STRIPE-WEBHOOK] No subscription in checkout, skipping");
        return;
      }

      const subscription =
        await stripe.subscriptions.retrieve(subscriptionId);
      await upsertSubscriber(
        supabase,
        stripe,
        subscription,
        customerEmail,
        customerId,
      );
      return;
    }

    // ── subscription created ───────────────────────────────────────────────
    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("[STRIPE-WEBHOOK] subscription.created:", subscription.id);

      const email = await getCustomerEmail(
        stripe,
        subscription.customer as string,
      );
      if (!email) {
        console.warn("[STRIPE-WEBHOOK] No email for subscription.created");
        return;
      }

      await upsertSubscriber(supabase, stripe, subscription, email);
      return;
    }

    // ── subscription updated ───────────────────────────────────────────────
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("[STRIPE-WEBHOOK] subscription.updated:", subscription.id);

      const email = await getCustomerEmail(
        stripe,
        subscription.customer as string,
      );
      if (!email) {
        console.warn("[STRIPE-WEBHOOK] No email for subscription.updated");
        return;
      }

      await upsertSubscriber(supabase, stripe, subscription, email);
      return;
    }

    // ── subscription deleted (cancelled) ───────────────────────────────────
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("[STRIPE-WEBHOOK] subscription.deleted:", subscription.id);

      const email = await getCustomerEmail(
        stripe,
        subscription.customer as string,
      );
      if (!email) return;

      const { error } = await supabase
        .from("subscribers")
        .update({
          subscribed: false,
          is_trial: false,
          subscription_end: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("email", email);

      if (error) {
        console.error("[STRIPE-WEBHOOK] Error canceling subscription:", error);
      } else {
        console.log("[STRIPE-WEBHOOK] Subscription cancelled for", email);
      }
      return;
    }

    // ── trial ending soon ──────────────────────────────────────────────────
    case "customer.subscription.trial_will_end": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(
        "[STRIPE-WEBHOOK] trial_will_end:",
        subscription.id,
      );

      const email = await getCustomerEmail(
        stripe,
        subscription.customer as string,
      );
      if (!email) {
        console.warn("[STRIPE-WEBHOOK] No email for trial_will_end");
        return;
      }

      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        await sendTrialEndingEmail(email, resendKey);
      } else {
        console.warn(
          "[STRIPE-WEBHOOK] RESEND_API_KEY not set, cannot send trial-ending email",
        );
      }
      return;
    }

    // ── product / price sync ───────────────────────────────────────────────
    case "product.created":
    case "product.updated": {
      const product = event.data.object as Stripe.Product;
      const priceType = product.metadata?.price_type;
      const productId = product.metadata?.product_id;
      if (!priceType || !productId) return;

      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
        limit: 1,
      });
      if (!prices.data.length) return;

      const price = prices.data[0];
      const { error } = await supabase.from("stripe_products").upsert(
        {
          product_id: productId,
          product_name: product.name,
          price_type: priceType,
          stripe_product_id: product.id,
          stripe_price_id: price.id,
          amount: price.unit_amount || 0,
          currency: price.currency,
          interval: price.recurring?.interval || "month",
          active: product.active,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "product_id" },
      );
      if (error) console.error("[STRIPE-WEBHOOK] Product upsert error:", error);
      return;
    }

    case "price.created":
    case "price.updated": {
      const price = event.data.object as Stripe.Price;
      const product = await stripe.products.retrieve(
        price.product as string,
      );
      const priceType = product.metadata?.price_type;
      const productId = product.metadata?.product_id;
      if (!priceType || !productId) return;

      const { error } = await supabase
        .from("stripe_products")
        .update({
          stripe_price_id: price.id,
          amount: price.unit_amount || 0,
          currency: price.currency,
          interval: price.recurring?.interval || "month",
          active: price.active && product.active,
          updated_at: new Date().toISOString(),
        })
        .eq("product_id", productId);
      if (error) console.error("[STRIPE-WEBHOOK] Price update error:", error);
      return;
    }

    case "product.deleted": {
      const product = event.data.object as Stripe.Product;
      const productId = product.metadata?.product_id;
      if (!productId) return;

      const { error } = await supabase
        .from("stripe_products")
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq("product_id", productId);
      if (error)
        console.error("[STRIPE-WEBHOOK] Product deactivation error:", error);
      return;
    }

    default:
      console.log(`[STRIPE-WEBHOOK] Unhandled event type: ${event.type}`);
  }
}

// ── main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      console.error("[STRIPE-WEBHOOK] Missing env vars", {
        stripe: !!stripeKey,
        webhook: !!webhookSecret,
        url: !!supabaseUrl,
        service: !!supabaseServiceKey,
      });
      return acknowledge({ received: true, processed: false, error: "config" });
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("[STRIPE-WEBHOOK] Missing stripe-signature header");
      return acknowledge({ received: true, processed: false, error: "no_sig" });
    }

    const body = await req.text();
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
        undefined,
        Stripe.createSubtleCryptoProvider(),
      );
      console.log("[STRIPE-WEBHOOK] ✓ Verified", event.id, event.type);
    } catch (sigErr) {
      console.error("[STRIPE-WEBHOOK] Sig failed:", err(sigErr));
      return acknowledge({ received: true, processed: false, error: "bad_sig" });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
      await processStripeEvent(event, stripe, supabase);
      return acknowledge({ received: true, processed: true, event_type: event.type });
    } catch (procErr) {
      console.error(`[STRIPE-WEBHOOK] Processing error (${event.type}):`, err(procErr));
      return acknowledge({ received: true, processed: false, event_type: event.type, error: "processing_error" });
    }
  } catch (unhandled) {
    console.error("[STRIPE-WEBHOOK] Unhandled:", err(unhandled));
    return acknowledge({ received: true, processed: false, error: "unhandled" });
  }
});