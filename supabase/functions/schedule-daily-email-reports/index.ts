import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.4.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[WEEKLY-EMAIL-CRON] Starting weekly email report job');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('email_reports')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (settingsError || !settings?.email_reports) {
      console.log('[WEEKLY-EMAIL-CRON] No email report settings found');
      return new Response(
        JSON.stringify({ message: 'No email report settings configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailConfig = settings.email_reports;
    
    if (!emailConfig.enabled || !emailConfig.recipientEmail) {
      console.log('[WEEKLY-EMAIL-CRON] Email reports disabled or no recipient');
      return new Response(
        JSON.stringify({ message: 'Email reports disabled or no recipient' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[WEEKLY-EMAIL-CRON] Sending weekly report to:', emailConfig.recipientEmail);
    const { data, error } = await supabase.functions.invoke('send-email-report', {
      body: { recipient: emailConfig.recipientEmail, isTest: false }
    });

    if (error) {
      console.error('[WEEKLY-EMAIL-CRON] Error:', error);
      throw error;
    }

    console.log('[WEEKLY-EMAIL-CRON] Weekly report sent successfully');
    return new Response(
      JSON.stringify({ success: true, message: 'Weekly email report sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[WEEKLY-EMAIL-CRON] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
