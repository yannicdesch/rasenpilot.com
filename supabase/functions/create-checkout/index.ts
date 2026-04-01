import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log(`[CREATE-CHECKOUT] Function started, method: ${req.method}`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priceType, email } = await req.json();
    console.log(`[CREATE-CHECKOUT] Request data:`, { priceType, email: email || 'not provided' });
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe configuration error: Missing API key");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if email already has an active subscription in Stripe
    if (email) {
      console.log(`[CREATE-CHECKOUT] Checking for existing subscription for: ${email}`);
      const customers = await stripe.customers.list({ email: email.toLowerCase(), limit: 100 });
      
      if (customers.data.length > 0) {
        for (const customer of customers.data) {
          const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: "active",
            limit: 1,
          });
          
          if (subscriptions.data.length > 0) {
            return new Response(JSON.stringify({ 
              error: "already_subscribed",
              message: "Diese E-Mail-Adresse hat bereits ein aktives Abo. Bitte melde dich an, um dein Abo zu verwalten."
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            });
          }
          
          const trialingSubscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: "trialing",
            limit: 1,
          });
          
          if (trialingSubscriptions.data.length > 0) {
            return new Response(JSON.stringify({ 
              error: "already_subscribed",
              message: "Diese E-Mail-Adresse hat bereits ein aktives Probe-Abo. Bitte melde dich an, um dein Abo zu verwalten."
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            });
          }
        }
      }
    }

    // Map old price types to new ones for backwards compatibility
    const mappedPriceType = priceType === 'monthly' ? 'premium_monthly' 
                          : priceType === 'yearly' ? 'premium_yearly' 
                          : priceType;

    // Initialize Supabase client to fetch stored price IDs
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the stored Stripe price ID for this price type
    const { data: stripeProduct, error: fetchError } = await supabase
      .from("stripe_products")
      .select("stripe_price_id, amount, price_type")
      .eq("price_type", mappedPriceType)
      .eq("active", true)
      .single();

    if (fetchError || !stripeProduct?.stripe_price_id) {
      // Fallback: try the original priceType (for backwards compat with old 'monthly'/'yearly')
      const { data: fallbackProduct } = await supabase
        .from("stripe_products")
        .select("stripe_price_id, amount, price_type")
        .eq("price_type", priceType)
        .eq("active", true)
        .single();

      if (!fallbackProduct?.stripe_price_id) {
        console.error("[CREATE-CHECKOUT] No price found for:", priceType, "or", mappedPriceType);
        throw new Error("Product not synced with Stripe. Please contact support or run product sync.");
      }

      // Use fallback
      Object.assign(stripeProduct || {}, fallbackProduct);
    }

    const finalProduct = stripeProduct || {};
    console.log(`[CREATE-CHECKOUT] Using Stripe price ID: ${finalProduct.stripe_price_id}`);

    const origin = req.headers.get("origin") || "https://www.rasenpilot.com";

    const session = await stripe.checkout.sessions.create({
      customer_email: email || undefined,
      line_items: [
        {
          price: finalProduct.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 7,
      },
      success_url: `${origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscription?ref=canceled`,
      metadata: {
        price_type: mappedPriceType,
        user_email: email || "",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[CREATE-CHECKOUT] Error:", error.message);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: "Stripe checkout error - check logs"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
