import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

interface InteractionEvent {
  type: 'click' | 'input' | 'focus' | 'blur' | 'submit' | 'validation_error' | 'navigation' | 'custom';
  target?: string;
  field?: string;
  value?: string;
  message?: string;
  timestamp: number;
  meta?: Record<string, unknown>;
}

interface ErrorEvent {
  type: 'js_error' | 'unhandled_rejection' | 'auth_error' | 'network_error';
  message: string;
  stack?: string;
  source?: string;
  line?: number;
  column?: number;
  timestamp: number;
}

interface TrackSessionPayload {
  user_session: string;
  page_path: string;
  interactions?: InteractionEvent[];
  errors?: ErrorEvent[];
  user_agent?: string;
  user_id?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as TrackSessionPayload;

    if (!body?.user_session || !body?.page_path) {
      return new Response(
        JSON.stringify({ error: 'user_session and page_path are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Only accept tracking for auth funnel paths (defensive scope)
    const allowed = ['/auth', '/signup', '/login', '/welcome', '/subscription'];
    const isAllowed = allowed.some((p) => body.page_path.startsWith(p));
    if (!isAllowed) {
      return new Response(JSON.stringify({ skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const interactions = Array.isArray(body.interactions) ? body.interactions.slice(-200) : [];
    const errors = Array.isArray(body.errors) ? body.errors.slice(-50) : [];

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Upsert-style merge: try to update an existing row for this session+path,
    // otherwise insert a new one.
    const { data: existing } = await supabase
      .from('session_recordings')
      .select('id, interactions_json, errors_json')
      .eq('user_session', body.user_session)
      .eq('page_path', body.page_path)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      const mergedInteractions = [
        ...((existing.interactions_json as InteractionEvent[]) || []),
        ...interactions,
      ].slice(-500);
      const mergedErrors = [
        ...((existing.errors_json as ErrorEvent[]) || []),
        ...errors,
      ].slice(-100);

      const { error } = await supabase
        .from('session_recordings')
        .update({
          interactions_json: mergedInteractions,
          errors_json: mergedErrors,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, id: existing.id, merged: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data, error } = await supabase
      .from('session_recordings')
      .insert({
        user_session: body.user_session,
        page_path: body.page_path,
        interactions_json: interactions,
        errors_json: errors,
        user_agent: body.user_agent ?? req.headers.get('user-agent') ?? null,
        user_id: body.user_id ?? null,
      })
      .select('id')
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('track-session error', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'unknown' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
