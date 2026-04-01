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
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      const isServiceRole = token === serviceRoleKey;
      
      if (!isServiceRole) {
        const { data: userData } = await supabase.auth.getUser(token);
        if (!userData.user) throw new Error("Not authenticated");

        const { data: adminRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userData.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (!adminRole) throw new Error("Admin access required");
      }
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

    const products = [
      {
        product_id: "premium_monthly",
        name: "Rasenpilot Premium",
        description: "Unbegrenzter Zugang zu allen Premium-Features",
        features: [
          "Unbegrenzte KI-Rasenanalysen mit GPT-4o Vision",
          "Erkennung von 50+ Rasenproblemen (Moos, Pilze, Nährstoffmängel)",
          "Personalisierter Pflegekalender mit Erinnerungen",
          "Wetter-basierte Pflegetipps für deine Region",
          "Rasen-Fortschritt messen mit Vorher/Nachher-Vergleich",
          "PLZ-basiertes Rasen-Ranking in deiner Nachbarschaft",
          "KI-Chat für individuelle Rasenberatung",
          "Score-Verlauf & Analyse-Historie",
        ],
        price_type: "premium_monthly",
        amount: 999,
        interval: "month" as const,
      },
      {
        product_id: "premium_yearly",
        name: "Rasenpilot Premium Jährlich",
        description: "Spare 2 Monate — alle Premium-Features zum Jahrespreis",
        features: [
          "Alle Premium-Features inklusive",
          "2 Monate gratis (79,99€ statt 119,88€/Jahr)",
          "Unbegrenzte KI-Analysen & Pflegekalender",
          "Wetter-Integration & regionale Tipps",
          "Fortschritts-Tracking & Nachbarschafts-Ranking",
        ],
        price_type: "premium_yearly",
        amount: 7999,
        interval: "year" as const,
      },
      {
        product_id: "pro_monthly",
        name: "Rasenpilot Pro",
        description: "Maximale Kontrolle für Rasen-Perfektionisten",
        features: [
          "Alles aus Premium inklusive",
          "Bis zu 3 Rasenflächen gleichzeitig verwalten",
          "Experten-Check: Detaillierte Profi-Analyse",
          "Prioritäts-Support (Antwort innerhalb 2 Stunden)",
          "Early Access zu neuen Features",
          "Erweiterte Analyse-Berichte mit PDF-Export",
        ],
        price_type: "pro_monthly",
        amount: 1999,
        interval: "month" as const,
      },
      {
        product_id: "pro_yearly",
        name: "Rasenpilot Pro Jährlich",
        description: "Maximale Kontrolle zum besten Preis — 2 Monate gratis",
        features: [
          "Alle Pro-Features inklusive",
          "2 Monate gratis (159,99€ statt 239,88€/Jahr)",
          "3 Rasenflächen, Experten-Check, Prioritäts-Support",
          "Early Access & erweiterte Berichte",
        ],
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

      if (existing?.stripe_price_id && existing?.stripe_product_id) {
        // Update existing product description and features in Stripe
        console.log(`Updating description for existing product ${p.product_id}`);
        await stripe.products.update(existing.stripe_product_id, {
          name: p.name,
          description: p.description,
          features: p.features.map(f => ({ name: f })),
          metadata: { product_id: p.product_id, price_type: p.price_type },
        });
        results.push({ product_id: p.product_id, status: "updated", price_id: existing.stripe_price_id });
        continue;
      }

      // Create Stripe product with features
      const stripeProduct = await stripe.products.create({
        name: p.name,
        description: p.description,
        features: p.features.map(f => ({ name: f })),
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
