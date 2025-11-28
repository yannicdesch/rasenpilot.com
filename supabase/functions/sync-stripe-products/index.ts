import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log(`[SYNC-STRIPE-PRODUCTS] Function started, method: ${req.method}`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe configuration error: Missing API key");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Define the products to sync
    const productsToSync = [
      {
        product_id: "rasenpilot-premium-monthly",
        product_name: "Rasenpilot Premium",
        price_type: "monthly",
        amount: 999, // €9.99
        interval: "month",
      },
      {
        product_id: "rasenpilot-premium-yearly",
        product_name: "Rasenpilot Premium",
        price_type: "yearly",
        amount: 9900, // €99.00
        interval: "year",
      },
    ];

    const syncedProducts = [];

    for (const productDef of productsToSync) {
      console.log(`[SYNC-STRIPE-PRODUCTS] Syncing ${productDef.product_id}`);

      // Check if product already exists in DB
      const { data: existingProduct } = await supabase
        .from("stripe_products")
        .select("*")
        .eq("product_id", productDef.product_id)
        .single();

      let stripeProductId = existingProduct?.stripe_product_id;
      let stripePriceId = existingProduct?.stripe_price_id;

      // Validate that existing Stripe IDs belong to the CURRENT Stripe account/mode
      if (stripeProductId) {
        try {
          await stripe.products.retrieve(stripeProductId);
        } catch (err) {
          console.log(
            `[SYNC-STRIPE-PRODUCTS] Stored product ${stripeProductId} not found for current Stripe key – recreating for this environment.`,
          );
          stripeProductId = undefined;
          stripePriceId = undefined;
        }
      }

      if (stripePriceId) {
        try {
          await stripe.prices.retrieve(stripePriceId);
        } catch (err) {
          console.log(
            `[SYNC-STRIPE-PRODUCTS] Stored price ${stripePriceId} not found for current Stripe key – recreating for this environment.`,
          );
          stripePriceId = undefined;
        }
      }

      // Create or retrieve Stripe Product
      if (!stripeProductId) {
        console.log(`[SYNC-STRIPE-PRODUCTS] Creating new Stripe product for ${productDef.product_id}`);
        const stripeProduct = await stripe.products.create({
          name: productDef.product_name,
          description: "Unbegrenzter Zugang zu allen Premium-Features",
          metadata: {
            product_id: productDef.product_id,
            price_type: productDef.price_type,
          },
        });
        stripeProductId = stripeProduct.id;
        console.log(`[SYNC-STRIPE-PRODUCTS] Created Stripe product: ${stripeProductId}`);
      } else {
        console.log(`[SYNC-STRIPE-PRODUCTS] Using existing Stripe product: ${stripeProductId}`);
      }

      // Create or retrieve Stripe Price
      if (!stripePriceId) {
        console.log(`[SYNC-STRIPE-PRODUCTS] Creating new Stripe price for ${productDef.product_id}`);
        const stripePrice = await stripe.prices.create({
          product: stripeProductId,
          currency: "eur",
          unit_amount: productDef.amount,
          recurring: { interval: productDef.interval as any },
          metadata: {
            product_id: productDef.product_id,
            price_type: productDef.price_type,
          },
        });
        stripePriceId = stripePrice.id;
        console.log(`[SYNC-STRIPE-PRODUCTS] Created Stripe price: ${stripePriceId}`);
      } else {
        console.log(`[SYNC-STRIPE-PRODUCTS] Using existing Stripe price: ${stripePriceId}`);
      }

      // Upsert to database
      const { error: upsertError } = await supabase
        .from("stripe_products")
        .upsert({
          product_id: productDef.product_id,
          product_name: productDef.product_name,
          price_type: productDef.price_type,
          stripe_product_id: stripeProductId,
          stripe_price_id: stripePriceId,
          amount: productDef.amount,
          currency: "eur",
          interval: productDef.interval,
          active: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "product_id",
        });

      if (upsertError) {
        console.error(`[SYNC-STRIPE-PRODUCTS] Error upserting product ${productDef.product_id}:`, upsertError);
        throw upsertError;
      }

      syncedProducts.push({
        product_id: productDef.product_id,
        stripe_product_id: stripeProductId,
        stripe_price_id: stripePriceId,
      });
    }

    console.log(`[SYNC-STRIPE-PRODUCTS] Successfully synced ${syncedProducts.length} products`);

    return new Response(
      JSON.stringify({
        success: true,
        synced: syncedProducts,
        message: `Successfully synced ${syncedProducts.length} products with Stripe`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[SYNC-STRIPE-PRODUCTS] Error:", error.message);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: "Failed to sync products with Stripe",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
