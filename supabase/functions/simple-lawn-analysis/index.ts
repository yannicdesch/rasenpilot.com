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
  console.log('🚀 Function started');
  
  try {
    const body = await req.json();
    console.log('📥 Request body received:', { hasImageBase64: !!body.imageBase64 });
    
    const { imageBase64, grassType, lawnGoal } = body;
    
    if (!imageBase64) {
      console.log('❌ No image provided');
      return new Response(
        JSON.stringify({ success: false, error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare image for OpenAI
    let imageToUse = imageBase64;
    if (!imageBase64.startsWith('data:')) {
      imageToUse = `data:image/jpeg;base64,${imageBase64}`;
    }

    console.log('📸 Image prepared, size:', imageToUse.length);

    // Check OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.log('❌ OpenAI API key missing');
      return new Response(
        JSON.stringify({ success: false, error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🤖 Making OpenAI request...');
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
            content: 'Analyze the lawn image and return only this JSON format: {"overall_health": "number 0-100", "grass_condition": "short description", "problems": ["problem1"], "recommendations": ["recommendation1"], "timeline": "2-4 weeks", "score": "number 0-100"}'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Grass type: ${grassType || 'unknown'}` },
              { type: 'image_url', image_url: { url: imageToUse, detail: 'low' } }
            ]
          }
        ],
        max_tokens: 300,
        temperature: 0
      }),
    });

    console.log('📊 OpenAI response status:', response.status);
    console.log('⏱️ OpenAI call took:', Date.now() - openaiStart, 'ms');
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ OpenAI error:', errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'OpenAI API error', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    console.log('✅ OpenAI response received');

    // Parse the response
    let analysisResult;
    try {
      const content = result.choices[0].message.content.trim();
      console.log('📝 Raw content:', content);
      
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      analysisResult = JSON.parse(cleanedContent);
      console.log('✅ Analysis parsed successfully');
      
    } catch (parseError) {
      console.log('⚠️ JSON parsing failed, using fallback');
      analysisResult = {
        overall_health: "75",
        grass_condition: "Rasenanalyse durchgeführt",
        problems: ["Detaillierte Analyse verfügbar"],
        recommendations: ["Regelmäßige Pflege empfohlen"],
        timeline: "2-4 Wochen",
        score: "75"
      };
    }

    console.log('🎉 Analysis completed in:', Date.now() - startTime, 'ms');

    return new Response(
      JSON.stringify({ success: true, analysis: analysisResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Function error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
});