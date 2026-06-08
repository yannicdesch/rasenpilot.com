import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface Payload {
  analysisId?: string | null;
  rating: number;
  comment?: string | null;
  userEmail?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json()) as Payload;
    if (typeof body.rating !== 'number' || body.rating < 1 || body.rating > 5) {
      return new Response(JSON.stringify({ error: 'Invalid rating' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY missing');

    const stars = '⭐'.repeat(body.rating) + '☆'.repeat(5 - body.rating);
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px;">
        <h2 style="color:#15803d;margin:0 0 12px;">Neues Analyse-Feedback</h2>
        <p style="font-size:22px;margin:8px 0;">${stars} <strong>(${body.rating}/5)</strong></p>
        <p style="margin:4px 0;"><strong>User:</strong> ${body.userEmail ?? 'Anonym'}</p>
        <p style="margin:4px 0;"><strong>Analysis ID:</strong> ${body.analysisId ?? '-'}</p>
        ${body.comment ? `<div style="margin-top:16px;padding:12px;background:#f0fdf4;border-left:4px solid #16a34a;border-radius:4px;"><strong>Kommentar:</strong><br/>${body.comment.replace(/</g, '&lt;')}</div>` : '<p style="color:#888;">Kein Kommentar.</p>'}
      </div>
    `;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Rasenpilot Feedback <feedback@rasenpilot.com>',
        to: ['admin@rasenpilot.de'],
        subject: `Neues Feedback: ${body.rating}/5 Sterne`,
        html,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return new Response(JSON.stringify({ error: 'Resend failed', details: txt }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
