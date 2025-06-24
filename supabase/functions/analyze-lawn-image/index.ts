
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageBase64, grassType, lawnGoal } = await req.json()
    
    console.log('Analyzing base64 image with grass type:', grassType, 'and goal:', lawnGoal);
    console.log('Base64 image length:', imageBase64?.length || 0);
    
    // Get OpenAI API key from Supabase secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment');
      throw new Error('OpenAI API key not configured')
    }

    console.log('OpenAI API key found, making request...');

    // Prepare the prompt for lawn analysis
    const prompt = `Analysiere dieses Rasenfoto und erstelle eine detaillierte Bewertung. Kontext:
    - Rasensorte: ${grassType || 'Unbekannt'}
    - Rasenziel: ${lawnGoal || 'Allgemeine Gesundheit'}
    
    Bitte identifiziere:
    1. Allgemeine Rasengesundheit (Skala 1-10)
    2. Sichtbare Probleme (Krankheiten, Schädlinge, Nährstoffmängel, Unkraut)
    3. Bodenzustandsindikatoren
    4. Spezifische Verbesserungsempfehlungen
    5. Vertrauensgrad für jede Diagnose
    
    Gib deine Analyse in diesem JSON-Format zurück:
    {
      "overallHealth": number,
      "issues": [
        {
          "issue": "string",
          "confidence": number (0-1),
          "severity": "low|medium|high",
          "recommendations": ["string array"]
        }
      ],
      "generalRecommendations": ["string array"]
    }`;

    // Call OpenAI Vision API with base64 image
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein Experte für Rasenpflege mit jahrelanger Erfahrung in der Diagnose von Rasenproblemen anhand von Bildern. Gib detaillierte, umsetzbare Ratschläge auf Deutsch.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
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
    
    const analysisText = data.choices[0].message.content;
    console.log('Analysis text:', analysisText);

    // Try to parse JSON response, fallback to text processing
    let analysisResult;
    try {
      // Extract JSON from the response if it's wrapped in text
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = JSON.parse(analysisText);
      }
      console.log('Successfully parsed JSON analysis:', analysisResult);
    } catch (parseError) {
      console.log('Failed to parse JSON, creating fallback structure:', parseError);
      // Fallback: convert text response to structured format
      analysisResult = {
        overallHealth: 7,
        issues: [
          {
            issue: "KI-Analyse Ergebnis",
            confidence: 0.8,
            severity: "medium",
            recommendations: analysisText.split('\n').filter(line => line.trim().length > 0).slice(0, 4)
          }
        ],
        generalRecommendations: ["Folge der detaillierten Analyse oben"]
      };
    }

    return new Response(
      JSON.stringify({ success: true, analysis: analysisResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing lawn image:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to analyze image' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
