
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== START ANALYSIS FUNCTION ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Read and log the raw request body
    const requestText = await req.text();
    console.log('Raw request body:', requestText);
    
    let requestBody;
    try {
      requestBody = JSON.parse(requestText);
      console.log('Parsed request body:', requestBody);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      throw new Error('Invalid JSON in request body');
    }
    
    const { jobId } = requestBody;
    console.log('Extracted jobId:', jobId);
    
    if (!jobId) {
      console.error('Job ID is missing from request body');
      throw new Error('Job ID is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check:');
    console.log('SUPABASE_URL exists:', !!supabaseUrl);
    console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseServiceKey);
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update job status to processing
    console.log('Updating job status to processing for job:', jobId);
    const { error: updateError } = await supabase
      .from('analysis_jobs')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (updateError) {
      console.error('Error updating job status:', updateError);
      throw new Error('Failed to update job status');
    }

    console.log('Job status updated to processing');

    // Start background processing (call process-analysis function)
    console.log('Invoking process-analysis function with jobId:', jobId);
    const { error: processError } = await supabase.functions.invoke('process-analysis', {
      body: { jobId }
    });

    if (processError) {
      console.error('Error starting background processing:', processError);
      
      // Update job status to failed
      await supabase
        .from('analysis_jobs')
        .update({ 
          status: 'failed',
          error_message: 'Failed to start background processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);
      
      throw new Error('Failed to start background processing');
    }

    console.log('Background processing started successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Analysis started successfully',
        jobId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== START ANALYSIS ERROR ===');
    console.error('Error details:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to start analysis' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
