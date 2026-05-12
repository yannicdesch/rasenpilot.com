import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://esm.sh/zod@3.23.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// REWARD: 1 free month of premium for every 3 successful referrals (referrer-only).
const REWARDS_THRESHOLD = 3;
const REWARD_DAYS = 30;

const BodySchema = z.object({
  referral_code: z.string().trim().min(4).max(16),
  user_id: z.string().uuid(),
  email: z.string().trim().email(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const code = parsed.data.referral_code.toUpperCase();
    const newUserId = parsed.data.user_id;
    const newUserEmail = parsed.data.email.toLowerCase();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Find the referrer
    const { data: referrerId } = await supabase.rpc('lookup_referrer_by_code', { _code: code });
    if (!referrerId) return json({ ok: false, reason: 'unknown_code' }, 200);
    if (referrerId === newUserId) return json({ ok: false, reason: 'self_referral' }, 200);

    // Mark/insert the referral row as completed
    const { data: existing } = await supabase
      .from('referrals')
      .select('id, status')
      .eq('referrer_user_id', referrerId)
      .ilike('referred_email', newUserEmail)
      .maybeSingle();

    if (existing) {
      if (existing.status === 'completed' || existing.status === 'rewarded') {
        return json({ ok: true, reason: 'already_completed' });
      }
      await supabase
        .from('referrals')
        .update({
          status: 'completed',
          referred_user_id: newUserId,
          completed_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('referrals').insert({
        referrer_user_id: referrerId,
        referred_email: newUserEmail,
        referred_user_id: newUserId,
        referral_code: code,
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
    }

    // Increment the referrer counter
    const { data: refProfile } = await supabase
      .from('profiles')
      .select('referral_count, email, first_name, full_name')
      .eq('id', referrerId)
      .single();
    const newCount = (refProfile?.referral_count ?? 0) + 1;
    await supabase
      .from('profiles')
      .update({ referral_count: newCount })
      .eq('id', referrerId);

    // Award 1 month premium when threshold reached
    let rewarded = false;
    if (newCount > 0 && newCount % REWARDS_THRESHOLD === 0 && refProfile?.email) {
      const { data: sub } = await supabase
        .from('subscribers')
        .select('id, subscription_end, subscribed')
        .eq('user_id', referrerId)
        .maybeSingle();

      const base = sub?.subscription_end && new Date(sub.subscription_end) > new Date()
        ? new Date(sub.subscription_end)
        : new Date();
      const newEnd = new Date(base);
      newEnd.setDate(newEnd.getDate() + REWARD_DAYS);

      if (sub) {
        await supabase
          .from('subscribers')
          .update({
            subscribed: true,
            subscription_tier: 'premium',
            subscription_end: newEnd.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', sub.id);
      } else {
        await supabase.from('subscribers').insert({
          user_id: referrerId,
          email: refProfile.email,
          subscribed: true,
          subscription_tier: 'premium',
          subscription_end: newEnd.toISOString(),
        });
      }

      // Mark all completed referrals as rewarded
      await supabase
        .from('referrals')
        .update({ status: 'rewarded' })
        .eq('referrer_user_id', referrerId)
        .eq('status', 'completed');

      rewarded = true;
    }

    // Send welcome emails via Resend
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (resendKey) {
      const referrerName =
        refProfile?.first_name ||
        refProfile?.full_name?.split(' ')[0] ||
        'Ein Freund';

      // To the new user
      const newUserHtml = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
          <h2 style="color:#007B43;font-family:'DM Serif Display',serif;">Willkommen bei Rasenpilot 🌱</h2>
          <p>Schön, dass du da bist! ${escapeHtml(referrerName)} hat dich eingeladen — du startest mit deiner ersten kostenlosen KI-Rasenanalyse.</p>
          <div style="text-align:center;margin:24px 0;">
            <a href="https://www.rasenpilot.com/lawn-analysis" style="background:#007B43;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Jetzt loslegen</a>
          </div>
        </div>`;
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Rasenpilot <willkommen@rasenpilot.com>',
          to: [newUserEmail],
          subject: 'Willkommen bei Rasenpilot 🌱',
          html: newUserHtml,
        }),
      }).catch((e) => console.error('Resend (new user):', e));

      // To the referrer
      if (refProfile?.email) {
        const refHtml = `
          <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
            <h2 style="color:#007B43;font-family:'DM Serif Display',serif;">Deine Einladung wurde angenommen 🎉</h2>
            <p>Super! ${escapeHtml(newUserEmail)} hat sich über deinen Link registriert.</p>
            <p>Du hast jetzt insgesamt <strong>${newCount}</strong> erfolgreiche Einladung${newCount === 1 ? '' : 'en'}.</p>
            ${rewarded
              ? `<div style="background:#DFF0D8;padding:16px;border-radius:8px;margin:16px 0;">
                  <strong style="color:#007B43;">🎁 Belohnung freigeschaltet!</strong><br/>
                  Du erhältst <strong>1 Monat Premium gratis</strong>. Aktiv bis zum nächsten Abrechnungszeitraum.
                </div>`
              : `<p style="color:#666;">Noch ${REWARDS_THRESHOLD - (newCount % REWARDS_THRESHOLD)} Einladung${(REWARDS_THRESHOLD - (newCount % REWARDS_THRESHOLD)) === 1 ? '' : 'en'} bis zur nächsten Belohnung (1 Monat Premium gratis).</p>`}
            <div style="text-align:center;margin:24px 0;">
              <a href="https://www.rasenpilot.com/referral" style="background:#007B43;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Mehr Freunde einladen</a>
            </div>
          </div>`;
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Rasenpilot <einladung@rasenpilot.com>',
            to: [refProfile.email],
            subject: rewarded
              ? '🎁 1 Monat Premium freigeschaltet — danke fürs Einladen!'
              : 'Deine Einladung wurde angenommen 🌱',
            html: refHtml,
          }),
        }).catch((e) => console.error('Resend (referrer):', e));
      }
    }

    return json({ ok: true, rewarded, count: newCount });
  } catch (e) {
    console.error('Unexpected:', e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
