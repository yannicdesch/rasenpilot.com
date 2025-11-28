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
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe configuration error: Missing API key");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    console.log("[CREATE-CHECKOUT-NEW] Stripe client initialized");

    // Initialize Supabase client to fetch stored price IDs
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the stored Stripe price ID for this price type
    const { data: stripeProduct, error: fetchError } = await supabase
      .from("stripe_products")
      .select("stripe_price_id, amount")
      .eq("price_type", priceType)
      .eq("active", true)
      .single();

    if (fetchError || !stripeProduct?.stripe_price_id) {
      console.error("[CREATE-CHECKOUT-NEW] No synced price found for type:", priceType);
      console.error("[CREATE-CHECKOUT-NEW] Error:", fetchError);
      throw new Error(
        "Product not synced with Stripe. Please contact support or run product sync."
      );
    }

    console.log(`[CREATE-CHECKOUT-NEW] Using Stripe price ID: ${stripeProduct.stripe_price_id}`);
    console.log(`[CREATE-CHECKOUT-NEW] Creating session for ${priceType} subscription: €${stripeProduct.amount/100}`);

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price: stripeProduct.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 7,
      },
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