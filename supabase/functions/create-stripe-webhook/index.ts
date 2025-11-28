import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe API key not configured");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // The webhook URL
    const webhookUrl = "https://ugaxwcslhoppflrbuwxv.supabase.co/functions/v1/stripe-webhook";

    // Events to listen to
    const enabledEvents = [
      "checkout.session.completed",
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "product.created",
      "product.updated",
      "product.deleted",
      "price.created",
      "price.updated",
    ];

    console.log("[CREATE-WEBHOOK] Creating webhook endpoint...");

    // Check if webhook already exists
    const existingWebhooks = await stripe.webhookEndpoints.list({
      limit: 100,
    });

    const existingWebhook = existingWebhooks.data.find(
      (wh) => wh.url === webhookUrl
    );

    if (existingWebhook) {
      console.log("[CREATE-WEBHOOK] Webhook already exists, updating...");
      
      const updated = await stripe.webhookEndpoints.update(
        existingWebhook.id,
        {
          enabled_events: enabledEvents as any,
        }
      );

      return new Response(
        JSON.stringify({
          id: updated.id,
          url: updated.url,
          status: updated.status,
          secret: updated.secret,
          message: "Webhook already existed and was updated",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Create new webhook
    const webhook = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: enabledEvents as any,
      description: "Rasenpilot Subscription Webhook",
    });

    console.log("[CREATE-WEBHOOK] Webhook created successfully:", webhook.id);

    return new Response(
      JSON.stringify({
        id: webhook.id,
        url: webhook.url,
        status: webhook.status,
        secret: webhook.secret,
        message: "Webhook created successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("[CREATE-WEBHOOK] Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: "Failed to create webhook endpoint",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
