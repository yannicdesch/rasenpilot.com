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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const { priceType, email } = await req.json();
    console.log(`[CREATE-CHECKOUT] Request data:`, { priceType, email: email || 'not provided' });
    
    // Debug: Log all environment variables
    const allEnvVars = Deno.env.toObject();
    console.log(`[CREATE-CHECKOUT] Available environment variables:`, Object.keys(allEnvVars));
    
    // Check if Stripe secret key is available
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    console.log(`[CREATE-CHECKOUT] Environment check: STRIPE_SECRET_KEY exists: ${!!stripeKey}`);
    if (!stripeKey) {
      console.error("[CREATE-CHECKOUT] STRIPE_SECRET_KEY not found in environment");
      console.error("[CREATE-CHECKOUT] Available env keys:", Object.keys(allEnvVars));
      throw new Error("Stripe configuration error: Missing API key");
    }
    console.log(`[CREATE-CHECKOUT] Stripe key found: ${stripeKey.substring(0, 10)}...`);
    
    let userEmail = email;
    let userId = null;

    // Try to get authenticated user, fallback to guest email
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabaseClient.auth.getUser(token);
        if (data.user?.email) {
          userEmail = data.user.email;
          userId = data.user.id;
          console.log(`[CREATE-CHECKOUT] Authenticated user found: ${userEmail}`);
        }
      } catch (error) {
        console.log("[CREATE-CHECKOUT] Auth failed, proceeding as guest");
      }
    }

    if (!userEmail || !userEmail.includes('@')) {
      console.error(`[CREATE-CHECKOUT] Invalid email: ${userEmail}`);
      throw new Error("Gültige E-Mail-Adresse ist erforderlich");
    }

    console.log(`[CREATE-CHECKOUT] Using email: ${userEmail}`);

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    console.log("[CREATE-CHECKOUT] Stripe client initialized");
    
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log(`[CREATE-CHECKOUT] Existing customer found: ${customerId}`);
    } else {
      console.log("[CREATE-CHECKOUT] No existing customer found");
    }

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

    console.log(`[CREATE-CHECKOUT] Creating session for ${interval}ly subscription: €${unitAmount/100}`);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
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
        user_id: userId || "",
        price_type: priceType,
        user_email: userEmail,
      },
    });

    console.log(`[CREATE-CHECKOUT] Session created successfully: ${session.id}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[CREATE-CHECKOUT] Error:", error.message);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: "Überprüfen Sie die Stripe-Konfiguration"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});