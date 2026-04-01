import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if user is admin
    const { data: adminRole } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (adminRole) {
      logStep("User is admin, granting pro access");
      return new Response(JSON.stringify({
        subscribed: true,
        subscription_tier: "pro_monthly",
        subscription_end: null,
        is_trial: false,
        trial_start: null,
        trial_end: null,
        verified_with_stripe: false,
        is_admin: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    if (stripeKey) {
      logStep("Verifying subscription with Stripe");
      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      const customers = await stripe.customers.list({ email: user.email, limit: 100 });
      
      if (customers.data.length === 0) {
        logStep("No Stripe customer found");
        await supabaseClient.from("subscribers").upsert({
          email: user.email,
          user_id: user.id,
          stripe_customer_id: null,
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          is_trial: false,
          trial_start: null,
          trial_end: null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });
        
        return new Response(JSON.stringify({ 
          subscribed: false, subscription_tier: null, subscription_end: null,
          is_trial: false, trial_start: null, trial_end: null, verified_with_stripe: true
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Find active/trialing subscription
      let activeSubscription = null;
      let customerId = null;
      
      for (const customer of customers.data) {
        for (const status of ["active", "trialing"] as const) {
          const subs = await stripe.subscriptions.list({
            customer: customer.id, status, limit: 1,
          });
          if (subs.data.length > 0) {
            activeSubscription = subs.data[0];
            customerId = customer.id;
            break;
          }
        }
        if (activeSubscription) break;
      }

      if (!customerId) customerId = customers.data[0].id;
      
      const hasActiveSub = !!activeSubscription;
      let subscriptionTier = null;
      let subscriptionEnd = null;
      let isTrial = false;
      let trialStart = null;
      let trialEnd = null;

      if (hasActiveSub && activeSubscription) {
        subscriptionEnd = new Date(activeSubscription.current_period_end * 1000).toISOString();
        
        if (activeSubscription.trial_end) {
          const trialEndDate = new Date(activeSubscription.trial_end * 1000);
          if (trialEndDate > new Date()) {
            isTrial = true;
            trialEnd = trialEndDate.toISOString();
            if (activeSubscription.trial_start) {
              trialStart = new Date(activeSubscription.trial_start * 1000).toISOString();
            }
          }
        }
        
        // Determine tier from price — check stripe_products table first
        const priceId = activeSubscription.items.data[0].price.id;
        const { data: product } = await supabaseClient
          .from("stripe_products")
          .select("price_type, amount")
          .eq("stripe_price_id", priceId)
          .maybeSingle();

        if (product?.price_type) {
          subscriptionTier = product.price_type;
        } else {
          // Fallback: determine by amount
          const price = await stripe.prices.retrieve(priceId);
          const amount = price.unit_amount || 0;
          const interval = price.recurring?.interval;
          
          if (amount >= 1500) {
            subscriptionTier = interval === "year" ? "pro_yearly" : "pro_monthly";
          } else if (amount > 0) {
            subscriptionTier = interval === "year" ? "premium_yearly" : "premium_monthly";
          } else {
            subscriptionTier = "premium_monthly";
          }
        }
        
        logStep("Determined tier", { priceId, subscriptionTier, isTrial });
      }

      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: customerId,
        subscribed: hasActiveSub,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
        is_trial: isTrial,
        trial_start: trialStart,
        trial_end: trialEnd,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

      return new Response(JSON.stringify({
        subscribed: hasActiveSub,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
        is_trial: isTrial,
        trial_start: trialStart,
        trial_end: trialEnd,
        verified_with_stripe: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // No Stripe key fallback
    const { data: localSubscriber } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("email", user.email)
      .maybeSingle();

    if (localSubscriber) {
      if (!localSubscriber.user_id) {
        await supabaseClient.from("subscribers").update({
          user_id: user.id, updated_at: new Date().toISOString(),
        }).eq("email", user.email);
      }
      return new Response(JSON.stringify({
        subscribed: localSubscriber.subscribed,
        subscription_tier: localSubscriber.subscription_tier,
        subscription_end: localSubscriber.subscription_end,
        is_trial: localSubscriber.is_trial || false,
        trial_start: localSubscriber.trial_start,
        trial_end: localSubscriber.trial_end,
        verified_with_stripe: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ 
      subscribed: false, subscription_tier: null, subscription_end: null,
      is_trial: false, trial_start: null, trial_end: null, verified_with_stripe: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
