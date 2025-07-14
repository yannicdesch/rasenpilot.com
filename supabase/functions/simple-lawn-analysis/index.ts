import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== SIMPLE LAWN ANALYSIS ===');
    
    const { imageUrl, grassType, lawnGoal } = await req.json();
    console.log('Request received:', { imageUrl: !!imageUrl, grassType, lawnGoal });

    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Calling OpenAI Vision API...');

    // Call OpenAI Vision API directly
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `Du bist ein professioneller Rasenexperte. Analysiere das Rasenbild und gib eine umfassende Analyse auf Deutsch zurück.
            
            Konzentriere dich auf:
            - Rasengesundheit (Bewertung 0-100)
            - Identifizierte Probleme
            - Spezifische Empfehlungen
            - Zeitplan für Verbesserungen
            
            Gib deine Antwort als JSON-Objekt mit folgender Struktur zurück:
            {
              "overall_health": "Prozentzahl (0-100)",
              "grass_condition": "Detaillierte Beschreibung auf Deutsch",
              "problems": ["Liste der identifizierten Probleme"],
              "recommendations": ["Liste spezifischer Empfehlungen"],
              "timeline": "Erwarteter Verbesserungszeitplan",
              "score": "Gesamtbewertung des Rasens (0-100)"
            }`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Bitte analysiere diesen Rasen. Rasentyp: ${grassType || 'unbekannt'}, Ziel: ${lawnGoal || 'Allgemeine Verbesserung'}. Gib eine detaillierte Analyse auf Deutsch.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('OpenAI response received');

    let analysisResult;
    try {
      // Try to parse the JSON response from OpenAI
      const content = result.choices[0].message.content;
      analysisResult = JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response
      console.log('Using fallback analysis structure');
      analysisResult = {
        overall_health: "75",
        grass_condition: result.choices[0].message.content,
        problems: ["Analyse konnte nicht vollständig strukturiert werden"],
        recommendations: ["Detaillierte Analyse im Grass Condition Feld verfügbar"],
        timeline: "2-4 Wochen",
        score: "75"
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
    console.error('Analysis error:', error);
    
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