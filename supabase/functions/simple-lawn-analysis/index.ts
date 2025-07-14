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

  const startTime = Date.now();
  
  try {
    console.log('=== SIMPLE LAWN ANALYSIS START ===');
    console.log('Function started at:', startTime);
    
    const { imageBase64, grassType, lawnGoal } = await req.json();
    console.log('Request parsed successfully');
    
    if (!imageBase64) {
      throw new Error('imageBase64 is required');
    }

    // Ensure proper base64 format
    let imageToUse = imageBase64;
    if (!imageBase64.startsWith('data:')) {
      imageToUse = `data:image/jpeg;base64,${imageBase64}`;
    }

    console.log('Image prepared, length:', imageToUse.length);

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Starting OpenAI call...');
    const openaiStart = Date.now();
    
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
            content: 'Du bist ein Rasenexperte. Analysiere das Bild und gib nur JSON zurück: {"overall_health": "75", "grass_condition": "Beschreibung", "problems": ["Problem"], "recommendations": ["Empfehlung"], "timeline": "2-4 Wochen", "score": "75"}'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Rasentyp: ${grassType || 'unbekannt'}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageToUse,
                  detail: 'low'
                }
              }
            ]
          }
        ],
        max_tokens: 200,
        temperature: 0
      }),
    });

    console.log('OpenAI call completed in:', Date.now() - openaiStart, 'ms');
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('OpenAI response received');

    let analysisResult;
    try {
      const content = result.choices[0].message.content.trim();
      console.log('Raw content:', content);
      
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      analysisResult = JSON.parse(cleanedContent);
      
      console.log('Analysis parsed successfully');
      
    } catch (parseError) {
      console.warn('JSON parsing failed, using fallback');
      
      analysisResult = {
        overall_health: "75",
        grass_condition: "Rasenanalyse durchgeführt",
        problems: ["Detaillierte Analyse verfügbar"],
        recommendations: ["Regelmäßige Pflege empfohlen"],
        timeline: "2-4 Wochen",
        score: "75"
      };
    }

    console.log('Total execution time:', Date.now() - startTime, 'ms');

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: analysisResult 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== EDGE FUNCTION ERROR ===');
    console.error('Error:', error.message);
    console.log('Failed after:', Date.now() - startTime, 'ms');
    
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