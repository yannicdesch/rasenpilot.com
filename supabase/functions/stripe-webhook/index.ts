import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

const acknowledge = (payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), {
    status: 200,
    headers: jsonHeaders,
  });

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

async function processStripeEvent(
  event: Stripe.Event,
  stripe: Stripe,
  supabase: ReturnType<typeof createClient>,
) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("[STRIPE-WEBHOOK] Processing checkout.session.completed:", session.id);

      const customerEmail = session.customer_email || session.customer_details?.email;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (!customerEmail) {
        console.warn("[STRIPE-WEBHOOK] Missing customer email in checkout session", session.id);
        return;
      }

      if (!subscriptionId) {
        console.log("[STRIPE-WEBHOOK] Checkout had no subscription id, skipping subscriber upsert");
        return;
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const isActive = subscription.status === "active" || subscription.status === "trialing";
      const isTrialing = subscription.status === "trialing";
      const subscriptionEnd = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null;
      const trialEnd = subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null;
      const trialStart = subscription.trial_start
        ? new Date(subscription.trial_start * 1000).toISOString()
        : null;

      const priceId = subscription.items.data[0]?.price.id;
      const { data: product } = await supabase
        .from("stripe_products")
        .select("price_type")
        .eq("stripe_price_id", priceId)
        .maybeSingle();

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", customerEmail)
        .maybeSingle();

      const userId = profile?.id || null;

      const { error: upsertError } = await supabase
        .from("subscribers")
        .upsert(
          {
            email: customerEmail,
            user_id: userId,
            stripe_customer_id: customerId,
            subscribed: isActive,
            subscription_tier: product?.price_type || "monthly",
            subscription_end: subscriptionEnd,
            is_trial: isTrialing,
            trial_start: trialStart,
            trial_end: trialEnd,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "email",
          },
        );

      if (upsertError) {
        console.error("[STRIPE-WEBHOOK] Error upserting subscriber from checkout:", upsertError);
      } else {
        console.log("[STRIPE-WEBHOOK] Subscriber updated from checkout.session.completed");
      }
      return;
    }

    case "product.created":
    case "product.updated": {
      const product = event.data.object as Stripe.Product;
      console.log(`[STRIPE-WEBHOOK] Processing ${event.type}:`, product.id);

      const priceType = product.metadata?.price_type;
      const productId = product.metadata?.product_id;

      if (!priceType || !productId) {
        return;
      }

      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
        limit: 1,
      });

      if (!prices.data.length) {
        return;
      }

      const price = prices.data[0];

      const { error } = await supabase
        .from("stripe_products")
        .upsert(
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
          {
            onConflict: "product_id",
          },
        );

      if (error) {
        console.error("[STRIPE-WEBHOOK] Error updating product:", error);
      }
      return;
    }

    case "price.created":
    case "price.updated": {
      const price = event.data.object as Stripe.Price;
      console.log(`[STRIPE-WEBHOOK] Processing ${event.type}:`, price.id);

      const product = await stripe.products.retrieve(price.product as string);
      const priceType = product.metadata?.price_type;
      const productId = product.metadata?.product_id;

      if (!priceType || !productId) {
        return;
      }

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

      if (error) {
        console.error("[STRIPE-WEBHOOK] Error updating price:", error);
      }
      return;
    }

    case "product.deleted": {
      const product = event.data.object as Stripe.Product;
      const productId = product.metadata?.product_id;

      if (!productId) {
        return;
      }

      const { error } = await supabase
        .from("stripe_products")
        .update({
          active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("product_id", productId);

      if (error) {
        console.error("[STRIPE-WEBHOOK] Error deactivating product:", error);
      }
      return;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`[STRIPE-WEBHOOK] Processing ${event.type}:`, subscription.id);

      const customer = await stripe.customers.retrieve(subscription.customer as string);
      const email = "email" in customer ? customer.email : null;

      if (!email) {
        console.warn("[STRIPE-WEBHOOK] Subscription event missing customer email");
        return;
      }

      const isActive = subscription.status === "active" || subscription.status === "trialing";
      const isTrialing = subscription.status === "trialing";
      const subscriptionEnd = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null;
      const trialEnd = subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null;
      const trialStart = subscription.trial_start
        ? new Date(subscription.trial_start * 1000).toISOString()
        : null;

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

      const userId = profile?.id || null;

      const { error } = await supabase
        .from("subscribers")
        .upsert(
          {
            email,
            user_id: userId,
            stripe_customer_id: subscription.customer as string,
            subscribed: isActive,
            subscription_tier: product?.price_type || "monthly",
            subscription_end: subscriptionEnd,
            is_trial: isTrialing,
            trial_start: trialStart,
            trial_end: trialEnd,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "email",
          },
        );

      if (error) {
        console.error("[STRIPE-WEBHOOK] Error updating subscription:", error);
      }
      return;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      const email = "email" in customer ? customer.email : null;

      if (!email) {
        return;
      }

      const { error } = await supabase
        .from("subscribers")
        .update({
          subscribed: false,
          subscription_end: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("email", email);

      if (error) {
        console.error("[STRIPE-WEBHOOK] Error canceling subscription:", error);
      }
      return;
    }

    default:
      console.log(`[STRIPE-WEBHOOK] Unhandled event type: ${event.type}`);
  }
}

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
      console.error("[STRIPE-WEBHOOK] Missing required environment variables", {
        hasStripeSecretKey: !!stripeKey,
        hasWebhookSecret: !!webhookSecret,
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseServiceRoleKey: !!supabaseServiceKey,
      });
      return acknowledge({
        received: true,
        processed: false,
        error: "Missing required server configuration",
      });
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("[STRIPE-WEBHOOK] Missing stripe-signature header");
      return acknowledge({
        received: true,
        processed: false,
        error: "Missing stripe-signature header",
      });
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
      console.log("[STRIPE-WEBHOOK] Signature verified", event.id, event.type);
    } catch (verificationError) {
      console.error(
        "[STRIPE-WEBHOOK] Signature verification failed:",
        getErrorMessage(verificationError),
      );
      return acknowledge({
        received: true,
        processed: false,
        error: "Invalid webhook signature",
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
      await processStripeEvent(event, stripe, supabase);
      return acknowledge({
        received: true,
        processed: true,
        event_type: event.type,
      });
    } catch (processingError) {
      console.error(
        `[STRIPE-WEBHOOK] Event processing failed for ${event.type}:`,
        getErrorMessage(processingError),
      );
      return acknowledge({
        received: true,
        processed: false,
        event_type: event.type,
        error: "Event processing failed",
      });
    }
  } catch (unhandledError) {
    console.error("[STRIPE-WEBHOOK] Unhandled webhook error:", getErrorMessage(unhandledError));
    return acknowledge({
      received: true,
      processed: false,
      error: "Unhandled webhook error",
    });
  }
});