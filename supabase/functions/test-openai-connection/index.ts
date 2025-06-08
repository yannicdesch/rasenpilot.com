
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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    console.log('=== OpenAI Connection Test ===');
    console.log('API Key exists:', !!openAIApiKey);
    console.log('API Key length:', openAIApiKey ? openAIApiKey.length : 0);
    console.log('API Key starts with sk-:', openAIApiKey ? openAIApiKey.startsWith('sk-') : false);
    
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'OPENAI_API_KEY not found in environment variables' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Test simple OpenAI API call
    console.log('Making test call to OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: 'Say "Test successful" if you can read this.' }
        ],
        max_tokens: 10,
      }),
    });

    console.log('OpenAI API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `OpenAI API error: ${response.status} - ${errorText}`,
          details: {
            status: response.status,
            statusText: response.statusText
          }
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('OpenAI API response data:', data);
    
    const testMessage = data.choices?.[0]?.message?.content || 'No response content';
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OpenAI API connection successful',
        testResponse: testMessage,
        details: {
          model: data.model,
          usage: data.usage
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error testing OpenAI connection:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Connection test failed', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
