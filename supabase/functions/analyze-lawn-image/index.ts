
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
    console.log('=== EDGE FUNCTION START ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));

    const requestBody = await req.json();
    console.log('Request body keys:', Object.keys(requestBody));
    console.log('imageBase64 length:', requestBody.imageBase64?.length || 0);
    console.log('grassType:', requestBody.grassType);
    console.log('lawnGoal:', requestBody.lawnGoal);

    const { imageBase64, grassType, lawnGoal } = requestBody;
    
    if (!imageBase64) {
      console.error('No imageBase64 provided');
      throw new Error('No image data provided');
    }
    
    // Get OpenAI API key from Supabase secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('=== CHECKING OPENAI API KEY ===');
    console.log('OpenAI API key present:', !!openaiApiKey);
    console.log('OpenAI API key length:', openaiApiKey?.length || 0);
    
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment');
      throw new Error('OpenAI API key not configured');
    }

    console.log('=== PREPARING OPENAI REQUEST ===');

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
          "recommendations": ["string array"],
          "timeline": "string",
          "cost": "string",
          "products": ["string array"]
        }
      ],
      "generalRecommendations": ["string array"],
      "seasonalAdvice": ["string array"],
      "preventionTips": ["string array"],
      "monthlyPlan": [{"month": "string", "tasks": ["string array"]}]
    }`;

    console.log('=== CALLING OPENAI API ===');
    const requestStart = Date.now();

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

    const requestDuration = Date.now() - requestStart;
    console.log('=== OPENAI RESPONSE ===');
    console.log('OpenAI response status:', response.status);
    console.log('OpenAI response time:', requestDuration + 'ms');
    console.log('OpenAI response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error details:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('=== OPENAI RESPONSE DATA ===');
    console.log('Response data keys:', Object.keys(data));
    console.log('Choices length:', data.choices?.length || 0);
    console.log('Usage:', data.usage);
    
    const analysisText = data.choices[0].message.content;
    console.log('Analysis text length:', analysisText?.length || 0);
    console.log('Analysis text preview:', analysisText?.substring(0, 200) + '...');

    // Try to parse JSON response, fallback to text processing
    let analysisResult;
    try {
      // Extract JSON from the response if it's wrapped in text
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
        console.log('=== JSON PARSING SUCCESS ===');
        console.log('Parsed analysis keys:', Object.keys(analysisResult));
      } else {
        analysisResult = JSON.parse(analysisText);
        console.log('=== DIRECT JSON PARSING SUCCESS ===');
      }
    } catch (parseError) {
      console.log('=== JSON PARSING FAILED ===');
      console.log('Parse error:', parseError);
      console.log('Creating fallback structure from text response');
      
      // Fallback: convert text response to structured format
      analysisResult = {
        overallHealth: 7,
        issues: [
          {
            issue: "KI-Analyse Ergebnis",
            confidence: 0.8,
            severity: "medium",
            timeline: "2-4 Wochen",
            cost: "25-50€",
            products: ["Rasen-Dünger", "Bodenverbesserer"],
            recommendations: analysisText.split('\n').filter(line => line.trim().length > 0).slice(0, 4)
          }
        ],
        generalRecommendations: ["Folge der detaillierten Analyse oben"],
        seasonalAdvice: ["Angepasste Pflege je nach Jahreszeit"],
        preventionTips: ["Regelmäßige Überwachung"],
        monthlyPlan: [
          { month: "Aktueller Monat", tasks: ["Umsetzung der Empfehlungen"] }
        ]
      };
    }

    console.log('=== RETURNING SUCCESS RESPONSE ===');
    return new Response(
      JSON.stringify({ success: true, analysis: analysisResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== EDGE FUNCTION ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
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
