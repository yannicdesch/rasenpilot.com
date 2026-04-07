import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { emailLayout, greeting, paragraph, heading, featureList, ctaButton, warningCard, signoff, infoCard } from '../_shared/email-template.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

const acknowledge = (payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), { status: 200, headers: jsonHeaders });

const err = (e: unknown) => (e instanceof Error ? e.message : String(e));

// ── helpers ──────────────────────────────────────────────────────────────────

async function upsertSubscriber(
  supabase: ReturnType<typeof createClient>,
  stripe: Stripe,
  subscription: Stripe.Subscription,
  email: string,
  customerId?: string,
) {
  const isActive =
    subscription.status === "active" || subscription.status === "trialing";
  const isTrialing = subscription.status === "trialing";

  const ts = (unix: number | null | undefined) =>
    unix ? new Date(unix * 1000).toISOString() : null;

  const priceId = subscription.items.data[0]?.price.id;
  const { data: product } = await supabase
    .from("stripe_products")
    .select("price_type")
    .eq("stripe_price_id", priceId)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  const { error } = await supabase.from("subscribers").upsert(
    {
      email,
      user_id: profile?.id || null,
      stripe_customer_id: customerId || (subscription.customer as string),
      subscribed: isActive,
      subscription_tier: product?.price_type || "monthly",
      subscription_end: ts(subscription.current_period_end),
      is_trial: isTrialing,
      trial_start: ts(subscription.trial_start),
      trial_end: ts(subscription.trial_end),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" },
  );

  if (error) {
    console.error("[STRIPE-WEBHOOK] Subscriber upsert error:", error);
  } else {
    console.log("[STRIPE-WEBHOOK] Subscriber upserted for", email);
  }
}

async function getCustomerEmail(
  stripe: Stripe,
  customerId: string,
): Promise<string | null> {
  const customer = await stripe.customers.retrieve(customerId);
  return "email" in customer ? customer.email : null;
}

async function sendEmail(email: string, resendKey: string, subject: string, html: string) {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rasenpilot <noreply@rasenpilot.com>",
        to: email,
        subject,
        html,
      }),
    });
    const data = await res.text();
    console.log(`[STRIPE-WEBHOOK] Email sent (${subject}):`, res.status, data);
  } catch (e) {
    console.error(`[STRIPE-WEBHOOK] Failed to send email (${subject}):`, err(e));
  }
}

async function sendTrialWelcomeEmail(email: string, resendKey: string, userName?: string) {
  const name = userName || email.split('@')[0];
  const content = `
    <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:16px;color:#1f2937;line-height:1.6;margin:0 0 16px;">
      Hey <strong>${name}</strong>!
    </p>
    ${paragraph('Schön dass du da bist. 🌱')}
    ${paragraph('<strong>Eine Sache kannst du jetzt sofort tun:</strong><br/>Mach ein Foto von deinem Rasen und lade es hoch — du bekommst in 30 Sekunden deinen persönlichen Lawn Score.')}
    ${ctaButton('Jetzt ersten Rasen analysieren →', 'https://www.rasenpilot.com/lawn-analysis')}
    ${infoCard('Tipp', 'Fotografiere bei Tageslicht von oben für das beste Ergebnis.', '📸', '#f0fdf4', '#bbf7d0')}
    ${paragraph('Die meisten Gartenbesitzer in Deutschland haben einen Score unter 65 — <strong>wie gut ist deiner?</strong>')}
    <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:14px;color:#6b7280;margin:24px 0 0;line-height:1.6;">
      — Yannic von Rasenpilot
    </p>
    <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:13px;color:#9ca3af;margin:12px 0 0;line-height:1.6;">
      PS: Falls du Fragen hast, antworte einfach auf diese Email. Ich lese jede Nachricht persönlich.
    </p>
  `;
  await sendEmail(email, resendKey, `Dein Rasen wartet auf seine erste Analyse 📸`, emailLayout(content, 'Mach jetzt dein erstes Rasenfoto und erhalte deinen Lawn Score'));
}

async function sendRegistrationPromptEmail(email: string, resendKey: string) {
  const content = `
    ${greeting('Rasenfreund')}
    ${paragraph('Vielen Dank für dein Rasenpilot-Abo! 🎉 Deine <strong>7-tägige kostenlose Testphase</strong> ist aktiv.')}
    ${paragraph('Damit du alle Premium-Funktionen nutzen kannst, erstelle jetzt dein kostenloses Konto:')}
    ${featureList([
      { icon: '📸', text: '<strong>KI-Rasenanalyse</strong> – Unbegrenzte Analysen mit detaillierten Ergebnissen' },
      { icon: '📅', text: '<strong>Persönlicher Pflegekalender</strong> – Tägliche Aufgaben basierend auf deinem Rasen' },
      { icon: '🌤️', text: '<strong>Wöchentliche Wetter-Tipps</strong> – Personalisiert für deine Region' },
      { icon: '💬', text: '<strong>KI-Experten-Chat</strong> – Sofort Antworten auf alle Rasenfragen' },
    ])}
    ${infoCard('Wichtig', 'Bitte registriere dich mit der gleichen E-Mail-Adresse (<strong>' + email + '</strong>), damit dein Abo automatisch verknüpft wird.', '📌', '#fef3c7', '#fde68a')}
    ${ctaButton('Jetzt Konto erstellen →', 'https://www.rasenpilot.com/auth?tab=register')}
    ${paragraph('Die Registrierung dauert nur 30 Sekunden. Danach kannst du sofort loslegen! 🚀')}
    ${signoff()}
  `;
  await sendEmail(email, resendKey, "🌱 Erstelle dein Konto und starte mit Rasenpilot Premium!", emailLayout(content, 'Dein Premium-Abo ist aktiv – erstelle jetzt dein Konto'));
}

async function sendTrialEndingEmail(email: string, resendKey: string) {
  const content = `
    ${greeting('Rasenfreund')}
    ${paragraph('In <strong>2 Tagen</strong> endet deine kostenlose Rasenpilot Premium Testphase.')}
    ${warningCard('⚠️ Das verlierst du danach:', [
      '❌ Detaillierte Rasen-Analyse mit Teilbewertungen',
      '❌ Personalisierter Pflegekalender',
      '❌ Rasen-Score Verlauf & Fortschritt',
      '❌ Unbegrenzte KI-Beratung',
      '❌ Wetter-basierte Empfehlungen',
    ])}
    ${paragraph('Wenn du zufrieden bist, musst du <strong>nichts tun</strong> – dein Abo wird automatisch aktiviert.')}
    ${paragraph('Falls du nicht fortfahren möchtest, kannst du jederzeit kündigen:')}
    ${ctaButton('Abonnement verwalten', 'https://www.rasenpilot.com/subscription-management')}
    ${signoff()}
  `;
  await sendEmail(email, resendKey, "⏰ Deine Testphase endet in 2 Tagen", emailLayout(content, 'Deine Premium-Testphase endet bald – sichere dir deinen Zugang'));
}

// ── event processor ──────────────────────────────────────────────────────────

async function processStripeEvent(
  event: Stripe.Event,
  stripe: Stripe,
  supabase: ReturnType<typeof createClient>,
) {
  switch (event.type) {
    // ── checkout completed ─────────────────────────────────────────────────
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("[STRIPE-WEBHOOK] checkout.session.completed:", session.id);

      const customerEmail =
        session.customer_email || session.customer_details?.email;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      // Get user_id from metadata (if user was logged in)
      const userId = session.metadata?.user_id || 
                     session.metadata?.supabase_user_id ||
                     session.client_reference_id;

      if (!customerEmail) {
        console.warn("[STRIPE-WEBHOOK] Missing email in checkout", session.id);
        return;
      }
      if (!subscriptionId) {
        console.log("[STRIPE-WEBHOOK] No subscription in checkout, skipping");
        return;
      }

      const subscription =
        await stripe.subscriptions.retrieve(subscriptionId);

      await upsertSubscriber(
        supabase,
        stripe,
        subscription,
        customerEmail,
        customerId,
      );

      // Check if user already has a profile
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", customerEmail)
        .maybeSingle();

      if (existingProfile) {
        // User exists — link subscriber
        await supabase
          .from("subscribers")
          .update({ user_id: existingProfile.id, updated_at: new Date().toISOString() })
          .eq("email", customerEmail);
        console.log("[STRIPE-WEBHOOK] Linked subscription to existing user:", existingProfile.id);
      } else if (userId) {
        // User was logged in but profile wasn't found by email — link by userId
        await supabase
          .from("subscribers")
          .update({ user_id: userId, updated_at: new Date().toISOString() })
          .eq("email", customerEmail);
      } else {
        // No account exists — auto-create Supabase user
        console.log("[STRIPE-WEBHOOK] No account for", customerEmail, "- auto-creating user");
        
        try {
          const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
          const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
          const adminSupabase = createClient(supabaseUrl, serviceRoleKey);
          
          const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
            email: customerEmail,
            email_confirm: true,
            user_metadata: {
              stripe_customer_id: customerId,
              subscription_tier: 'premium',
              full_name: customerEmail.split('@')[0],
            },
          });

          if (createError) {
            console.error("[STRIPE-WEBHOOK] Failed to create user:", createError);
            // Log as orphaned if user creation fails
            await supabase.from("orphaned_subscriptions").insert({
              stripe_session_id: session.id,
              stripe_customer_id: customerId,
              customer_email: customerEmail,
              price_type: session.metadata?.price_type || "unknown",
              notes: `Auto-create failed: ${createError.message}`,
            });
          } else if (newUser?.user) {
            console.log("[STRIPE-WEBHOOK] Auto-created user:", newUser.user.id);
            
            // Link subscriber to new user
            await supabase
              .from("subscribers")
              .update({ user_id: newUser.user.id, updated_at: new Date().toISOString() })
              .eq("email", customerEmail);

            // Send password setup email via Supabase recovery link
            try {
              const { error: linkError } = await adminSupabase.auth.admin.generateLink({
                type: 'recovery',
                email: customerEmail,
                options: {
                  redirectTo: 'https://www.rasenpilot.com/reset-password',
                },
              });
              
              if (linkError) {
                console.error("[STRIPE-WEBHOOK] Failed to generate recovery link:", linkError);
              } else {
                console.log("[STRIPE-WEBHOOK] Password setup email sent to:", customerEmail);
              }

              // Also send welcome email via Resend
              const resendKey = Deno.env.get("RESEND_API_KEY");
              if (resendKey) {
                const welcomeContent = `
                  ${greeting('Premium-Mitglied')}
                  ${paragraph('Dein Rasenpilot Premium Account ist bereit! 🎉')}
                  ${paragraph('Klick auf den Button unten, um dein Passwort zu setzen und direkt loszulegen:')}
                  ${ctaButton('Passwort setzen →', 'https://www.rasenpilot.com/auth')}
                  ${infoCard('Wichtig', 'Bitte setze dein Passwort innerhalb von 24 Stunden. Danach kannst du dich jederzeit einloggen und alle Premium-Features nutzen.', '📌', '#eff6ff', '#bfdbfe')}
                  ${heading('Was dich erwartet')}
                  ${featureList([
                    { icon: '📸', text: '<strong>Unbegrenzte KI-Rasenanalysen</strong>' },
                    { icon: '📅', text: '<strong>Persönlicher Pflegekalender</strong>' },
                    { icon: '💬', text: '<strong>KI-Experten-Chat</strong>' },
                    { icon: '🌤️', text: '<strong>Wöchentliche Wetter-Tipps</strong>' },
                  ])}
                  ${signoff()}
                `;
                await sendEmail(
                  customerEmail, 
                  resendKey, 
                  "🌱 Willkommen bei Rasenpilot — Passwort setzen", 
                  emailLayout(welcomeContent, 'Dein Premium-Account ist bereit!')
                );
              }
            } catch (emailErr) {
              console.error("[STRIPE-WEBHOOK] Email sending failed:", err(emailErr));
            }
          }
        } catch (autoCreateErr) {
          console.error("[STRIPE-WEBHOOK] Auto-create error:", err(autoCreateErr));
          await supabase.from("orphaned_subscriptions").insert({
            stripe_session_id: session.id,
            stripe_customer_id: customerId,
            customer_email: customerEmail,
            price_type: session.metadata?.price_type || "unknown",
            notes: `Auto-create exception: ${err(autoCreateErr)}`,
          });
        }
      }
      return;
    }

    // ── subscription created ───────────────────────────────────────────────
    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("[STRIPE-WEBHOOK] subscription.created:", subscription.id);

      const email = await getCustomerEmail(
        stripe,
        subscription.customer as string,
      );
      if (!email) {
        console.warn("[STRIPE-WEBHOOK] No email for subscription.created");
        return;
      }

      await upsertSubscriber(supabase, stripe, subscription, email);

      // Send personalized welcome email for trial subscribers
      if (subscription.status === "trialing") {
        const resendKey = Deno.env.get("RESEND_API_KEY");
        if (resendKey) {
          // Look up user's name from profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, full_name")
            .eq("email", email)
            .maybeSingle();
          const userName = profile?.first_name || profile?.full_name?.split(' ')[0] || undefined;
          await sendTrialWelcomeEmail(email, resendKey, userName);
        }
      }
      return;
    }

    // ── subscription updated ───────────────────────────────────────────────
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("[STRIPE-WEBHOOK] subscription.updated:", subscription.id);

      const email = await getCustomerEmail(
        stripe,
        subscription.customer as string,
      );
      if (!email) {
        console.warn("[STRIPE-WEBHOOK] No email for subscription.updated");
        return;
      }

      await upsertSubscriber(supabase, stripe, subscription, email);
      return;
    }

    // ── subscription deleted (cancelled) ───────────────────────────────────
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("[STRIPE-WEBHOOK] subscription.deleted:", subscription.id);

      const email = await getCustomerEmail(
        stripe,
        subscription.customer as string,
      );
      if (!email) return;

      const { error } = await supabase
        .from("subscribers")
        .update({
          subscribed: false,
          is_trial: false,
          subscription_end: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("email", email);

      if (error) {
        console.error("[STRIPE-WEBHOOK] Error canceling subscription:", error);
      } else {
        console.log("[STRIPE-WEBHOOK] Subscription cancelled for", email);
      }
      return;
    }

    // ── trial ending soon ──────────────────────────────────────────────────
    case "customer.subscription.trial_will_end": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(
        "[STRIPE-WEBHOOK] trial_will_end:",
        subscription.id,
      );

      const email = await getCustomerEmail(
        stripe,
        subscription.customer as string,
      );
      if (!email) {
        console.warn("[STRIPE-WEBHOOK] No email for trial_will_end");
        return;
      }

      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        await sendTrialEndingEmail(email, resendKey);
      } else {
        console.warn(
          "[STRIPE-WEBHOOK] RESEND_API_KEY not set, cannot send trial-ending email",
        );
      }
      return;
    }

    // ── product / price sync ───────────────────────────────────────────────
    case "product.created":
    case "product.updated": {
      const product = event.data.object as Stripe.Product;
      const priceType = product.metadata?.price_type;
      const productId = product.metadata?.product_id;
      if (!priceType || !productId) return;

      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
        limit: 1,
      });
      if (!prices.data.length) return;

      const price = prices.data[0];
      const { error } = await supabase.from("stripe_products").upsert(
        {
          product_id: productId,
          product_name: product.name,
          price_type: priceType,
          stripe_product_id: product.id,
          stripe_price_id: price.id,
          amount: price.unit_amount || 0,
          currency: price.currency,
          interval: price.recurring?.interval || "month",
          active: product.active,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "product_id" },
      );
      if (error) console.error("[STRIPE-WEBHOOK] Product upsert error:", error);
      return;
    }

    case "price.created":
    case "price.updated": {
      const price = event.data.object as Stripe.Price;
      const product = await stripe.products.retrieve(
        price.product as string,
      );
      const priceType = product.metadata?.price_type;
      const productId = product.metadata?.product_id;
      if (!priceType || !productId) return;

      const { error } = await supabase
        .from("stripe_products")
        .update({
          stripe_price_id: price.id,
          amount: price.unit_amount || 0,
          currency: price.currency,
          interval: price.recurring?.interval || "month",
          active: price.active && product.active,
          updated_at: new Date().toISOString(),
        })
        .eq("product_id", productId);
      if (error) console.error("[STRIPE-WEBHOOK] Price update error:", error);
      return;
    }

    case "product.deleted": {
      const product = event.data.object as Stripe.Product;
      const productId = product.metadata?.product_id;
      if (!productId) return;

      const { error } = await supabase
        .from("stripe_products")
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq("product_id", productId);
      if (error)
        console.error("[STRIPE-WEBHOOK] Product deactivation error:", error);
      return;
    }

    default:
      console.log(`[STRIPE-WEBHOOK] Unhandled event type: ${event.type}`);
  }
}

// ── main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      console.error("[STRIPE-WEBHOOK] Missing env vars", {
        stripe: !!stripeKey,
        webhook: !!webhookSecret,
        url: !!supabaseUrl,
        service: !!supabaseServiceKey,
      });
      return acknowledge({ received: true, processed: false, error: "config" });
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("[STRIPE-WEBHOOK] Missing stripe-signature header");
      return acknowledge({ received: true, processed: false, error: "no_sig" });
    }

    const body = await req.text();
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
        undefined,
        Stripe.createSubtleCryptoProvider(),
      );
      console.log("[STRIPE-WEBHOOK] ✓ Verified", event.id, event.type);
    } catch (sigErr) {
      console.error("[STRIPE-WEBHOOK] Sig failed:", err(sigErr));
      return acknowledge({ received: true, processed: false, error: "bad_sig" });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
      await processStripeEvent(event, stripe, supabase);
      return acknowledge({ received: true, processed: true, event_type: event.type });
    } catch (procErr) {
      console.error(`[STRIPE-WEBHOOK] Processing error (${event.type}):`, err(procErr));
      return acknowledge({ received: true, processed: false, event_type: event.type, error: "processing_error" });
    }
  } catch (unhandled) {
    console.error("[STRIPE-WEBHOOK] Unhandled:", err(unhandled));
    return acknowledge({ received: true, processed: false, error: "unhandled" });
  }
});