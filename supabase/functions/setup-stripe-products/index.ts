import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check — only admins
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    if (!userData.user) throw new Error("Not authenticated");

    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminRole) throw new Error("Admin access required");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

    const products = [
      {
        product_id: "premium_monthly",
        name: "Rasenpilot Premium",
        description: "Unbegrenzte KI-Analysen, Pflegekalender, Wetter-Integration",
        price_type: "premium_monthly",
        amount: 999,
        interval: "month" as const,
      },
      {
        product_id: "premium_yearly",
        name: "Rasenpilot Premium Jährlich",
        description: "Spare 2 Monate — 79,99€/Jahr",
        price_type: "premium_yearly",
        amount: 7999,
        interval: "year" as const,
      },
      {
        product_id: "pro_monthly",
        name: "Rasenpilot Pro",
        description: "Für Perfektionisten — 3 Rasenflächen, Experten-Check",
        price_type: "pro_monthly",
        amount: 1999,
        interval: "month" as const,
      },
      {
        product_id: "pro_yearly",
        name: "Rasenpilot Pro Jährlich",
        description: "Spare 2 Monate — 159,99€/Jahr",
        price_type: "pro_yearly",
        amount: 15999,
        interval: "year" as const,
      },
    ];

    const results = [];

    for (const p of products) {
      // Check if product already exists in our DB
      const { data: existing } = await supabase
        .from("stripe_products")
        .select("stripe_price_id, stripe_product_id")
        .eq("product_id", p.product_id)
        .maybeSingle();

      if (existing?.stripe_price_id) {
        console.log(`Product ${p.product_id} already exists, skipping`);
        results.push({ product_id: p.product_id, status: "exists", price_id: existing.stripe_price_id });
        continue;
      }

      // Create Stripe product
      const stripeProduct = await stripe.products.create({
        name: p.name,
        description: p.description,
        metadata: { product_id: p.product_id, price_type: p.price_type },
      });

      // Create Stripe price
      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        currency: "eur",
        unit_amount: p.amount,
        recurring: { interval: p.interval },
      });

      // Store in Supabase
      await supabase.from("stripe_products").upsert({
        product_id: p.product_id,
        product_name: p.name,
        price_type: p.price_type,
        stripe_product_id: stripeProduct.id,
        stripe_price_id: stripePrice.id,
        amount: p.amount,
        currency: "eur",
        interval: p.interval,
        active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "product_id" });

      console.log(`Created ${p.product_id}: ${stripePrice.id}`);
      results.push({ product_id: p.product_id, status: "created", price_id: stripePrice.id });
    }

    return new Response(JSON.stringify({ success: true, products: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
