import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://esm.sh/zod@3.23.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const BodySchema = z.object({
  analysis_id: z.string().uuid().nullable().optional(),
  user_id: z.string().uuid().nullable().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional().nullable(),
});

const ADMIN_EMAIL = 'rasenpilot.kontakt@gmail.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    const { analysis_id, user_id, rating, comment } = parsed.data;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await supabase
      .from('analysis_feedback')
      .insert({
        analysis_id: analysis_id ?? null,
        user_id: user_id ?? null,
        rating,
        comment: comment?.trim() || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Insert error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fire-and-forget admin notification via Resend
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (resendKey) {
      const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #007B43; margin: 0 0 12px;">Neues Analyse-Feedback</h2>
          <p style="font-size: 24px; margin: 8px 0;">${stars} <span style="color:#666;font-size:14px">(${rating}/5)</span></p>
          ${comment ? `<div style="background:#DFF0D8;padding:16px;border-radius:8px;margin:16px 0;color:#222;"><strong>Kommentar:</strong><br/>${escapeHtml(comment)}</div>` : '<p style="color:#666;font-style:italic;">Kein Kommentar.</p>'}
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
          <p style="color:#666;font-size:12px;">
            Analyse-ID: ${analysis_id ?? '—'}<br/>
            User-ID: ${user_id ?? 'anonym'}<br/>
            Feedback-ID: ${data.id}
          </p>
        </div>
      `;

      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Rasenpilot Feedback <feedback@rasenpilot.com>',
          to: [ADMIN_EMAIL],
          subject: `🌱 Neues Feedback (${rating}/5 Sterne)`,
          html,
        }),
      }).catch((e) => console.error('Resend error:', e));
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Unexpected error:', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br/>');
}
