import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const getCurrentSeason = (): string => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'Frühling';
  if (month >= 5 && month <= 7) return 'Sommer';
  if (month >= 8 && month <= 10) return 'Herbst';
  return 'Winter';
};

const BASE_PROMPT = `Du bist ein erfahrener deutscher Rasenexperte und hilfst Gartenbesitzern bei allen Fragen rund um die Rasenpflege.
Du gibst praktische, umsetzbare Ratschläge auf Deutsch und bist freundlich und hilfsbereit.
Antworte präzise und strukturiert. Verwende deutsche Begriffe und beziehe dich auf in Deutschland verfügbare Produkte und Methoden.`;

// Simple sanitizer to neutralize prompt-injection attempts in user-supplied context fields
const sanitize = (v: unknown, max = 500): string => {
  if (v === null || v === undefined) return '';
  return String(v).replace(/[\r\n]+/g, ' ').slice(0, max);
};

const buildSystemPrompt = (analysisCtx: any, profileCtx: any): string => {
  let prompt = `${BASE_PROMPT}\nAktuelle Jahreszeit: ${getCurrentSeason()}.`;

  if (analysisCtx && typeof analysisCtx === 'object') {
    const score = Number(analysisCtx.score);
    if (Number.isFinite(score)) prompt += `\n\nRasen-Score des Nutzers: ${Math.max(0, Math.min(100, Math.round(score)))}/100.`;
    if (Array.isArray(analysisCtx.problems) && analysisCtx.problems.length) {
      prompt += `\nErkannte Probleme: ${analysisCtx.problems.slice(0, 8).map((p: unknown) => sanitize(p, 200)).join(', ')}.`;
    }
    if (Array.isArray(analysisCtx.steps) && analysisCtx.steps.length) {
      prompt += `\nLetzter Pflegeplan:\n${analysisCtx.steps.slice(0, 5).map((s: unknown, i: number) => `${i + 1}. ${sanitize(s, 300)}`).join('\n')}`;
    }
    if (analysisCtx.summary) prompt += `\nZusammenfassung: ${sanitize(analysisCtx.summary, 500)}`;
  }

  if (profileCtx && typeof profileCtx === 'object') {
    prompt += `\n\nRasenprofil:`;
    if (profileCtx.zipCode) prompt += `\nPLZ: ${sanitize(profileCtx.zipCode, 10)}`;
    if (profileCtx.grassType) prompt += `\nGrasart: ${sanitize(profileCtx.grassType, 50)}`;
    if (profileCtx.lawnSize) prompt += `\nRasengröße: ${sanitize(profileCtx.lawnSize, 50)}`;
    if (profileCtx.lawnGoal) prompt += `\nZiel: ${sanitize(profileCtx.lawnGoal, 100)}`;
    if (profileCtx.soilType) prompt += `\nBodenart: ${sanitize(profileCtx.soilType, 50)}`;
  }

  return prompt;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authenticated caller — protects against API credit abuse
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const message = typeof body?.message === 'string' ? body.message.slice(0, 4000) : '';
    const conversation_history = Array.isArray(body?.conversation_history) ? body.conversation_history.slice(-20) : [];
    const analysis_context = body?.analysis_context ?? null;
    const profile_context = body?.profile_context ?? null;

    if (!message.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Server-built system prompt — never accept caller-supplied prompts
    const systemPrompt = buildSystemPrompt(analysis_context, profile_context);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversation_history.map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: typeof msg.content === 'string' ? msg.content.slice(0, 4000) : ''
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message) {
      throw new Error('Invalid response from OpenAI API');
    }

    return new Response(
      JSON.stringify({ reply: data.choices[0].message.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-with-ai:', error);
    return new Response(
      JSON.stringify({ error: 'Chat failed', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
