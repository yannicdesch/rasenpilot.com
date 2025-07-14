import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== SIMPLE LAWN ANALYSIS START ===');
    
    const { imageBase64, grassType, lawnGoal } = await req.json();
    console.log('Request received with image base64 length:', imageBase64?.length);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let imageToUse = imageBase64;
    if (imageBase64 && !imageBase64.startsWith('data:')) {
      imageToUse = `data:image/jpeg;base64,${imageBase64}`;
    }

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
            content: 'Analysiere das Rasenbild. Antworte nur mit einem JSON-Objekt: {"overall_health": "Zahl 0-100", "grass_condition": "Beschreibung", "problems": ["Problem1", "Problem2"], "recommendations": ["Empfehlung1", "Empfehlung2"], "timeline": "Zeitangabe", "score": "Zahl 0-100"}'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Rasentyp: ${grassType || 'unbekannt'}, Ziel: ${lawnGoal || 'Verbesserung'}`
              },
              {
                type: 'image_url',
                image_url: { url: imageToUse }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    console.log('OpenAI response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;
    console.log('OpenAI response content:', content);
    
    let analysisResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysisResult = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (parseError) {
      console.log('Using fallback response');
      analysisResult = {
        overall_health: "70",
        grass_condition: content || "Analyse erfolgreich durchgeführt",
        problems: ["Detaillierte Analyse verfügbar"],
        recommendations: ["Siehe Analyseergebnis"],
        timeline: "2-4 Wochen",
        score: "70"
      };
    }

    console.log('Analysis completed successfully');
    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: analysisResult 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});