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
    console.log('=== DAILY REMINDER SCHEDULER ===');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call the send-reminders function
    const { data: reminderData, error: reminderError } = await supabase.functions.invoke('send-reminders');

    if (reminderError) {
      console.error('Error calling send-reminders:', reminderError);
    }

    console.log('Send reminders result:', reminderData);

    // Also send daily email report if configured
    const { data: settingsData, error: settingsError } = await supabase
      .from('site_settings')
      .select('email_reports')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    let emailReportResult = null;
    if (!settingsError && settingsData?.email_reports?.enabled) {
      console.log('Email reports enabled, sending daily report...');
      
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-email-report', {
        body: { 
          recipient: settingsData.email_reports.recipientEmail,
          isTest: false 
        }
      });

      if (emailError) {
        console.error('Error sending email report:', emailError);
      } else {
        console.log('Email report sent successfully:', emailData);
        emailReportResult = emailData;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Daily jobs completed',
        reminders: reminderData,
        emailReport: emailReportResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== DAILY REMINDER SCHEDULER ERROR ===');
    console.error('Error details:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to run daily reminder job' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});