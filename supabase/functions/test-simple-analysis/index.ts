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
  console.log('=== TESTING SIMPLE ANALYSIS ===');
  console.log('Function started at:', startTime);

  try {
    // Test OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('OpenAI API key present:', !!openAIApiKey);
    
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'OpenAI API key not configured' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Simple test call to OpenAI
    console.log('Making simple OpenAI test call...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: 'Say "API working" in JSON format: {"status": "API working"}' }
        ],
        max_tokens: 50,
        temperature: 0
      }),
    });

    console.log('OpenAI response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `OpenAI API error: ${response.status}`,
          details: errorText
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const result = await response.json();
    console.log('OpenAI response:', result);
    
    const totalTime = Date.now() - startTime;
    console.log('Total execution time:', totalTime, 'ms');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OpenAI API is working',
        execution_time: totalTime,
        openai_response: result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Test failed:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        execution_time: Date.now() - startTime
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});