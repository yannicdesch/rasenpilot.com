
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { problem, hasImage } = await req.json();

    console.log('Analyzing lawn problem:', problem, 'with image:', hasImage);

    if (!problem) {
      return new Response(
        JSON.stringify({ error: 'Problem description is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('OpenAI API key found, making request...');

    const systemPrompt = `Du bist ein Rasenexperte und hilfst Gartenbesitzern bei der Diagnose und Behandlung von Rasenproblemen. 
    Analysiere das beschriebene Problem und gib praktische, umsetzbare Ratschläge auf Deutsch.
    
    Strukturiere deine Antwort folgendermaßen:
    🌱 **Vermutete Diagnose**
    🛠️ **Empfohlene Behandlung**
    💡 **Vorbeugung**
    🛒 **Mögliche Produkte**
    
    Sei spezifisch und praktisch. Verwende deutsche Begriffe und beziehe dich auf in Deutschland verfügbare Produkte.`;

    const userPrompt = `Rasenproblem: ${problem}
    ${hasImage ? 'Ein Bild des Rasens wurde hochgeladen und kann bei der Diagnose helfen.' : ''}
    
    Bitte analysiere dieses Problem und gib detaillierte Empfehlungen.`;

    console.log('Calling OpenAI API with problem:', problem);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    const analysis = data.choices[0].message.content;
    console.log('Analysis completed successfully');

    return new Response(
      JSON.stringify({ analysis }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in analyze-lawn-problem function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Analysis failed', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
