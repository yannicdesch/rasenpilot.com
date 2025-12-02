
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use the service role key to perform writes (upsert) in Supabase
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    // ALWAYS verify with Stripe if we have a key - don't trust local DB alone
    if (stripeKey) {
      logStep("Stripe key found, verifying subscription with Stripe");
      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      
      if (customers.data.length === 0) {
        logStep("No Stripe customer found, user has no subscription");
        
        // Update database to reflect no subscription
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
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          is_trial: false,
          trial_start: null,
          trial_end: null,
          verified_with_stripe: true
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      const customerId = customers.data[0].id;
      logStep("Found Stripe customer", { customerId });

      // Check for active subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });
      
      const hasActiveSub = subscriptions.data.length > 0;
      let subscriptionTier = null;
      let subscriptionEnd = null;
      let isTrial = false;
      let trialStart = null;
      let trialEnd = null;

      if (hasActiveSub) {
        const subscription = subscriptions.data[0];
        subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
        
        // Check for trial
        if (subscription.trial_end) {
          const trialEndDate = new Date(subscription.trial_end * 1000);
          if (trialEndDate > new Date()) {
            isTrial = true;
            trialEnd = trialEndDate.toISOString();
            if (subscription.trial_start) {
              trialStart = new Date(subscription.trial_start * 1000).toISOString();
            }
          }
        }
        
        // Determine subscription tier from price
        const priceId = subscription.items.data[0].price.id;
        const price = await stripe.prices.retrieve(priceId);
        const amount = price.unit_amount || 0;
        
        if (amount === 999) {
          subscriptionTier = "Monthly";
        } else if (amount === 9900) {
          subscriptionTier = "Yearly";
        } else {
          subscriptionTier = "Premium";
        }
        logStep("Determined subscription tier", { priceId, amount, subscriptionTier, isTrial });
      } else {
        logStep("No active subscription found in Stripe");
      }

      // Update database with verified Stripe data
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

      logStep("Updated database with verified Stripe info", { subscribed: hasActiveSub, subscriptionTier });
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

    // No Stripe key - fall back to local database (should not happen in production)
    logStep("No Stripe key configured, falling back to local database");
    const { data: localSubscriber, error: localError } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("email", user.email)
      .maybeSingle();

    if (localSubscriber && !localError) {
      // Update user_id if it's not set
      if (!localSubscriber.user_id) {
        await supabaseClient.from("subscribers").update({
          user_id: user.id,
          updated_at: new Date().toISOString(),
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

    // No local record and no Stripe key
    return new Response(JSON.stringify({ 
      subscribed: false,
      subscription_tier: null,
      subscription_end: null,
      is_trial: false,
      trial_start: null,
      trial_end: null,
      verified_with_stripe: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
