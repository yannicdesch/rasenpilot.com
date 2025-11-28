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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get email report settings
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('email_reports')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (settingsError || !settings?.email_reports) {
      return new Response(
        JSON.stringify({ 
          status: 'warning',
          message: 'Email reports not configured',
          lastSent: null,
          enabled: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailReports = settings.email_reports;
    const lastSent = emailReports.lastSent ? new Date(emailReports.lastSent) : null;
    const now = new Date();
    
    let status = 'success';
    let message = 'Email reports running normally';

    if (!emailReports.enabled) {
      status = 'inactive';
      message = 'Email reports are disabled';
    } else if (!lastSent) {
      status = 'warning';
      message = 'No emails sent yet';
    } else {
      // Check if last email was sent within expected timeframe (26 hours to allow for some delay)
      const hoursSinceLastSent = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastSent > 26) {
        status = 'error';
        message = `Last email sent ${Math.floor(hoursSinceLastSent)} hours ago`;
      } else if (hoursSinceLastSent > 25) {
        status = 'warning';
        message = 'Email slightly delayed';
      }
    }

    return new Response(
      JSON.stringify({ 
        status,
        message,
        lastSent: lastSent ? lastSent.toISOString() : null,
        enabled: emailReports.enabled,
        recipient: emailReports.recipientEmail,
        sendTime: emailReports.sendTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error checking email report status:', error);
    
    return new Response(
      JSON.stringify({ 
        status: 'error',
        message: error.message || 'Failed to check status',
        error: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
