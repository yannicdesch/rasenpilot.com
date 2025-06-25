
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== TESTING OPENAI API KEY ===');
    
    // Check if OpenAI API key exists
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('OpenAI API key present:', !!openaiApiKey);
    console.log('OpenAI API key length:', openaiApiKey?.length || 0);
    console.log('OpenAI API key first 10 chars:', openaiApiKey?.substring(0, 10) || 'N/A');
    
    if (!openaiApiKey) {
      const errorResponse = {
        success: false, 
        error: 'OPENAI_API_KEY not found in environment',
        keyPresent: false,
        keyValid: false
      };
      console.log('Returning error response:', errorResponse);
      return new Response(
        JSON.stringify(errorResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Test simple OpenAI API call
    console.log('=== TESTING SIMPLE OPENAI CALL ===');
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
            role: 'user',
            content: 'Say "Hello, OpenAI API is working!"'
          }
        ],
        max_tokens: 50
      }),
    });

    console.log('OpenAI response status:', response.status);
    console.log('OpenAI response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      const errorResponse = {
        success: false, 
        error: `OpenAI API error: ${response.status} - ${errorText}`,
        keyPresent: true,
        keyValid: false
      };
      console.log('Returning API error response:', errorResponse);
      return new Response(
        JSON.stringify(errorResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('OpenAI response success:', data);

    const successResponse = {
      success: true, 
      message: 'OpenAI API key is working correctly!',
      keyPresent: true,
      keyValid: true,
      response: data.choices[0].message.content
    };
    
    console.log('Returning success response:', successResponse);
    return new Response(
      JSON.stringify(successResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Test error:', error);
    const errorResponse = {
      success: false, 
      error: error.message,
      keyPresent: !!Deno.env.get('OPENAI_API_KEY'),
      keyValid: false
    };
    console.log('Returning catch error response:', errorResponse);
    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
