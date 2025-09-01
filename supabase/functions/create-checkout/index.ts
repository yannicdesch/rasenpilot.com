import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log(`[CREATE-CHECKOUT-NEW] Function started, method: ${req.method}`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priceType, email } = await req.json();
    console.log(`[CREATE-CHECKOUT-NEW] Request data:`, { priceType, email: email || 'not provided' });
    
    // Debug: Log all environment variables
    const allEnvVars = Deno.env.toObject();
    console.log(`[CREATE-CHECKOUT-NEW] Available environment variables:`, Object.keys(allEnvVars));
    
    // Check if Stripe secret key is available
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    console.log(`[CREATE-CHECKOUT-NEW] STRIPE_SECRET_KEY exists: ${!!stripeKey}`);
    
    if (!stripeKey) {
      console.error("[CREATE-CHECKOUT-NEW] STRIPE_SECRET_KEY not found in environment");
      console.error("[CREATE-CHECKOUT-NEW] Available env keys:", Object.keys(allEnvVars));
      throw new Error("Stripe configuration error: Missing API key");
    }
    
    console.log(`[CREATE-CHECKOUT-NEW] Stripe key found: ${stripeKey.substring(0, 10)}...`);

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    console.log("[CREATE-CHECKOUT-NEW] Stripe client initialized");

    // Determine price based on priceType
    let unitAmount, interval;
    if (priceType === "monthly") {
      unitAmount = 999; // €9.99
      interval = "month";
    } else if (priceType === "yearly") {
      unitAmount = 9900; // €99.00
      interval = "year";
    } else {
      throw new Error("Ungültiger Preistyp. Muss 'monthly' oder 'yearly' sein");
    }

    console.log(`[CREATE-CHECKOUT-NEW] Creating session for ${interval}ly subscription: €${unitAmount/100}`);

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { 
              name: "Rasenpilot Premium",
              description: "Unbegrenzter Zugang zu allen Premium-Features"
            },
            unit_amount: unitAmount,
            recurring: { interval },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/subscription?ref=canceled`,
      metadata: {
        price_type: priceType,
        user_email: email,
      },
    });

    console.log(`[CREATE-CHECKOUT-NEW] Session created successfully: ${session.id}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[CREATE-CHECKOUT-NEW] Error:", error.message);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: "Stripe checkout error - check logs"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});