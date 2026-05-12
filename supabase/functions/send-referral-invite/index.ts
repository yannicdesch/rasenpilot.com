import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://esm.sh/zod@3.23.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const BodySchema = z.object({
  email: z.string().trim().email().max(255),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Nicht autorisiert' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Authenticate the caller
    const { data: userData, error: userErr } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', ''),
    );
    if (userErr || !userData.user) return json({ error: 'Ungültige Sitzung' }, 401);
    const referrer = userData.user;

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const email = parsed.data.email.toLowerCase();

    if (email === referrer.email?.toLowerCase()) {
      return json({ error: 'Du kannst dich nicht selbst einladen.' }, 400);
    }

    // Get referrer profile (referral_code + name)
    const { data: profile } = await supabase
      .from('profiles')
      .select('referral_code, first_name, full_name')
      .eq('id', referrer.id)
      .single();

    if (!profile?.referral_code) return json({ error: 'Kein Referral-Code gefunden' }, 500);

    // Insert referral row (unique constraint will catch duplicates)
    const { error: insertErr } = await supabase.from('referrals').insert({
      referrer_user_id: referrer.id,
      referred_email: email,
      referral_code: profile.referral_code,
      status: 'pending',
    });

    if (insertErr) {
      if (insertErr.code === '23505') {
        return json({ error: 'Diese E-Mail wurde bereits eingeladen.' }, 409);
      }
      console.error('Insert error:', insertErr);
      return json({ error: insertErr.message }, 500);
    }

    // Send invitation via Resend
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (resendKey) {
      const referrerName = profile.first_name || profile.full_name?.split(' ')[0] || 'Ein Freund';
      const inviteUrl = `https://www.rasenpilot.com/lawn-analysis?ref=${profile.referral_code}`;
      const html = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fff;">
          <h2 style="color:#007B43;font-family:'DM Serif Display',serif;margin:0 0 16px;">${escapeHtml(referrerName)} hat dich zu Rasenpilot eingeladen 🌱</h2>
          <p style="color:#222;font-size:16px;line-height:1.6;">
            Hi! ${escapeHtml(referrerName)} nutzt Rasenpilot, um den eigenen Rasen mit KI zu analysieren —
            und denkt, du würdest das auch lieben.
          </p>
          <p style="color:#222;font-size:16px;line-height:1.6;">
            Lade einfach ein Foto hoch und erhalte in 30 Sekunden deine persönliche Rasenanalyse. Kostenlos.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${inviteUrl}" style="background:#007B43;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block;">
              Jetzt Rasen analysieren
            </a>
          </div>
          <p style="color:#666;font-size:13px;text-align:center;">
            Dein Einladungs-Code: <strong style="color:#007B43;">${profile.referral_code}</strong>
          </p>
        </div>
      `;

      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Rasenpilot <einladung@rasenpilot.com>',
          to: [email],
          subject: `${referrerName} hat dich zu Rasenpilot eingeladen 🌱`,
          html,
        }),
      });
      if (!resp.ok) console.error('Resend send failed:', await resp.text());
    }

    return json({ success: true });
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
