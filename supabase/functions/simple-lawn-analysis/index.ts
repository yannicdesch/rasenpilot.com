import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== SIMPLE LAWN ANALYSIS START ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request - returning CORS headers');
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    console.log('Parsing request body...');
    const { imageBase64, grassType, lawnGoal } = await req.json();
    console.log('Request data:', { 
      hasImageBase64: !!imageBase64,
      base64Length: imageBase64?.length || 0,
      grassType, 
      lawnGoal 
    });

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    console.log('OpenAI API key found');

    // Prepare image for OpenAI
    let imageToUse = imageBase64;
    if (imageBase64 && !imageBase64.startsWith('data:')) {
      imageToUse = `data:image/jpeg;base64,${imageBase64}`;
    }
    
    if (!imageToUse) {
      throw new Error('No image provided');
    }
    console.log('Image prepared for OpenAI');

    // Call OpenAI API
    console.log('Calling OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein Rasenexperte. Analysiere das Rasenbild und gib eine JSON-Antwort mit: overall_health (0-100), grass_condition (Beschreibung), problems (Array), recommendations (Array), timeline (Text), score (0-100).'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analysiere diesen Rasen. Typ: ${grassType || 'unbekannt'}, Ziel: ${lawnGoal || 'Verbesserung'}.`
              },
              {
                type: 'image_url',
                image_url: { url: imageToUse }
              }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    console.log('OpenAI response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('OpenAI response received');
    
    let analysisResult;
    try {
      const content = result.choices[0].message.content;
      console.log('Raw content:', content);
      
      // Try to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = JSON.parse(content);
      }
    } catch (parseError) {
      console.log('JSON parsing failed, using fallback');
      analysisResult = {
        overall_health: "75",
        grass_condition: result.choices[0].message.content,
        problems: ["Analyse verfügbar in grass_condition"],
        recommendations: ["Siehe detaillierte Analyse"],
        timeline: "2-4 Wochen",
        score: "75"
      };
    }

    console.log('Analysis completed successfully');
    console.log('Total time:', Date.now() - startTime, 'ms');

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: analysisResult 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Analysis failed'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});