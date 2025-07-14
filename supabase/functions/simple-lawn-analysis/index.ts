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

  const startTime = Date.now();
  
  try {
    console.log('=== SIMPLE LAWN ANALYSIS EDGE FUNCTION START ===');
    console.log('⏱️ Function started at:', startTime);
    
    const parseStart = Date.now();
    const { imageUrl, imageBase64, grassType, lawnGoal } = await req.json();
    console.log('⏱️ Request parsing took:', Date.now() - parseStart, 'ms');
    console.log('Request received:', { 
      hasImageUrl: !!imageUrl, 
      hasImageBase64: !!imageBase64, 
      grassType, 
      lawnGoal 
    });

    // Use base64 if provided, otherwise fall back to URL
    const imageToUse = imageBase64 || imageUrl;
    
    if (!imageToUse) {
      throw new Error('Either imageBase64 or imageUrl is required');
    }

    // Get OpenAI API key
    const keyStart = Date.now();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('⏱️ API key retrieval took:', Date.now() - keyStart, 'ms');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('⏱️ Starting OpenAI call at:', Date.now() - startTime, 'ms');
    console.log('Calling OpenAI Vision API...');
    console.log('Using model: gpt-4o-mini (switching from gpt-4.1 for better reliability)');

    // Create a timeout promise (reduced to 15 seconds for faster response)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI API call timed out after 15 seconds')), 15000);
    });

    // Call OpenAI Vision API with timeout
    const openaiStart = Date.now();
    const apiCall = fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using more reliable model
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
                  url: imageToUse
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      }),
    });

    const response = await Promise.race([apiCall, timeoutPromise]);

    console.log('⏱️ OpenAI API call took:', Date.now() - openaiStart, 'ms');
    console.log('⏱️ Total function time so far:', Date.now() - startTime, 'ms');
    console.log('OpenAI response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('OpenAI response received, parsing...');
    console.log('Response data:', JSON.stringify(result, null, 2));

    let analysisResult;
    try {
      // Try to parse the JSON response from OpenAI
      const content = result.choices[0].message.content;
      console.log('Raw OpenAI content:', content);
      
      // Extract JSON from the content if it's wrapped in markdown or other text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
        console.log('Successfully parsed JSON from OpenAI response');
      } else {
        // If no JSON found, try parsing the entire content
        analysisResult = JSON.parse(content);
        console.log('Successfully parsed entire content as JSON');
      }
    } catch (parseError) {
      // If JSON parsing fails, create a structured response
      console.log('JSON parsing failed, using fallback structure');
      console.log('Parse error:', parseError.message);
      const content = result.choices[0].message.content;
      analysisResult = {
        overall_health: "75",
        grass_condition: content,
        problems: ["JSON-Parsing fehlgeschlagen - Vollständige Analyse verfügbar"],
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