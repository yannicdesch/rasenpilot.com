import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) {
      throw new Error("Stripe configuration error: Missing API key");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      console.error("[STRIPE-WEBHOOK] No signature provided");
      return new Response(JSON.stringify({ error: "No signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.text();
    let event: Stripe.Event;

    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        console.log("[STRIPE-WEBHOOK] Signature verified successfully");
      } catch (err) {
        console.error("[STRIPE-WEBHOOK] Signature verification failed:", err.message);
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      console.warn("[STRIPE-WEBHOOK] No webhook secret configured, skipping verification");
      event = JSON.parse(body);
    }

    console.log(`[STRIPE-WEBHOOK] Received event: ${event.type}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different event types
    switch (event.type) {
      case "product.created":
      case "product.updated": {
        const product = event.data.object as Stripe.Product;
        console.log(`[STRIPE-WEBHOOK] Processing product ${event.type}:`, product.id);

        // Check if this is one of our subscription products
        const priceType = product.metadata?.price_type;
        const productId = product.metadata?.product_id;

        if (priceType && productId) {
          // Get the default price for this product
          const prices = await stripe.prices.list({
            product: product.id,
            active: true,
            limit: 1,
          });

          if (prices.data.length > 0) {
            const price = prices.data[0];
            
            const { error } = await supabase
              .from("stripe_products")
              .upsert({
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
              }, {
                onConflict: "product_id",
              });

            if (error) {
              console.error("[STRIPE-WEBHOOK] Error updating product:", error);
            } else {
              console.log("[STRIPE-WEBHOOK] Successfully updated product in database");
            }
          }
        }
        break;
      }

      case "price.created":
      case "price.updated": {
        const price = event.data.object as Stripe.Price;
        console.log(`[STRIPE-WEBHOOK] Processing price ${event.type}:`, price.id);

        // Get the product details
        const product = await stripe.products.retrieve(price.product as string);
        const priceType = product.metadata?.price_type;
        const productId = product.metadata?.product_id;

        if (priceType && productId) {
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
          } else {
            console.log("[STRIPE-WEBHOOK] Successfully updated price in database");
          }
        }
        break;
      }

      case "product.deleted": {
        const product = event.data.object as Stripe.Product;
        console.log(`[STRIPE-WEBHOOK] Processing product deletion:`, product.id);

        const productId = product.metadata?.product_id;
        if (productId) {
          const { error } = await supabase
            .from("stripe_products")
            .update({
              active: false,
              updated_at: new Date().toISOString(),
            })
            .eq("product_id", productId);

          if (error) {
            console.error("[STRIPE-WEBHOOK] Error deactivating product:", error);
          } else {
            console.log("[STRIPE-WEBHOOK] Successfully deactivated product in database");
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[STRIPE-WEBHOOK] Processing subscription ${event.type}:`, subscription.id);

        // Get customer email
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const email = (customer as Stripe.Customer).email;

        if (email) {
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

          // Determine tier based on price
          const priceId = subscription.items.data[0]?.price.id;
          const { data: product } = await supabase
            .from("stripe_products")
            .select("price_type")
            .eq("stripe_price_id", priceId)
            .single();

          const { error } = await supabase
            .from("subscribers")
            .upsert({
              email,
              stripe_customer_id: subscription.customer as string,
              subscribed: isActive,
              subscription_tier: product?.price_type || "monthly",
              subscription_end: subscriptionEnd,
              is_trial: isTrialing,
              trial_start: trialStart,
              trial_end: trialEnd,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: "email",
            });

          if (error) {
            console.error("[STRIPE-WEBHOOK] Error updating subscription:", error);
          } else {
            console.log("[STRIPE-WEBHOOK] Successfully updated subscription in database");
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[STRIPE-WEBHOOK] Processing subscription deletion:`, subscription.id);

        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const email = (customer as Stripe.Customer).email;

        if (email) {
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
          } else {
            console.log("[STRIPE-WEBHOOK] Successfully canceled subscription in database");
          }
        }
        break;
      }

      default:
        console.log(`[STRIPE-WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("[STRIPE-WEBHOOK] Error:", error.message);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: "Webhook processing failed",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
