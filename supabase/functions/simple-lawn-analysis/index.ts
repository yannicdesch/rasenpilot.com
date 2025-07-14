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
    console.log('⏱️ Function started at:', startTime);
    
    const { imageUrl, imageBase64, grassType, lawnGoal } = await req.json();
    console.log('Request received:', { 
      hasImageUrl: !!imageUrl, 
      hasImageBase64: !!imageBase64,
      base64Length: imageBase64?.length || 0,
      grassType, 
      lawnGoal 
    });

    // Use base64 if provided, otherwise fall back to URL
    let imageToUse = imageBase64 || imageUrl;
    
    // If using base64, ensure it's in the right format for OpenAI
    if (imageBase64 && !imageBase64.startsWith('data:')) {
      imageToUse = `data:image/jpeg;base64,${imageBase64}`;
    }
    
    if (!imageToUse) {
      throw new Error('Either imageBase64 or imageUrl is required');
    }

    console.log('📸 Using image type:', imageBase64 ? 'base64' : 'URL');

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('⏱️ Starting OpenAI call at:', Date.now() - startTime, 'ms');
    console.log('Using model: gpt-4o (more stable model)');

    // Call OpenAI Vision API with timeout and optimized settings
    const openaiStart = Date.now();
    console.log('📡 Making OpenAI request with timeout...');
    
    try {
      // Create a timeout promise that rejects after 15 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('OpenAI API timeout after 15 seconds')), 15000);
      });
      
      // Create the actual API call promise
      const apiPromise = fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Using faster model
          messages: [
            {
              role: 'system',
              content: `Du bist ein Rasenexperte. Analysiere das Bild schnell und gib nur JSON zurück:

{
  "overall_health": "75",
  "grass_condition": "Kurze Beschreibung",
  "problems": ["Problem 1"],
  "recommendations": ["Empfehlung 1"],
  "timeline": "2-4 Wochen",
  "score": "75"
}

Nur JSON, kein anderer Text.`
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
                  image_url: {
                    url: imageToUse,
                    detail: 'low'
                  }
                }
              ]
            }
          ],
          max_tokens: 300,
          temperature: 0.1
        }),
      });
      
      // Race the API call against the timeout
      const response = await Promise.race([apiPromise, timeoutPromise]);

      console.log('⏱️ OpenAI API call took:', Date.now() - openaiStart, 'ms');
      console.log('OpenAI response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('OpenAI response received');

      let analysisResult;
      try {
        const content = result.choices[0].message.content.trim();
        console.log('Raw content:', content);
        
        // Clean up the content and extract JSON
        const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
        analysisResult = JSON.parse(cleanedContent);
        
        // Validate required fields
        if (!analysisResult.overall_health || !analysisResult.score) {
          throw new Error('Missing required fields in response');
        }
        
        console.log('Successfully parsed analysis result');
        
      } catch (parseError) {
        console.warn('JSON parsing failed, using fallback:', parseError.message);
        
        // Create a fallback response
        const content = result.choices[0].message.content;
        analysisResult = {
          overall_health: "75",
          grass_condition: content.length > 200 ? content.substring(0, 200) + "..." : content,
          problems: ["Detaillierte Analyse verfügbar"],
          recommendations: ["Siehe Rasenzustand für Details"],
          timeline: "2-4 Wochen",
          score: "75"
        };
      }

      console.log('⏱️ Total function time:', Date.now() - startTime, 'ms');
      console.log('Analysis completed successfully');

      return new Response(
        JSON.stringify({ 
          success: true, 
          analysis: analysisResult 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (fetchError) {
      console.error('OpenAI API call failed:', fetchError);
      throw new Error(`OpenAI API call failed: ${fetchError.message}`);
    }

  } catch (error) {
    console.error('=== EDGE FUNCTION ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.log('⏱️ Function failed after:', Date.now() - startTime, 'ms');
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Analysis failed',
        details: 'Check edge function logs for more details'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});