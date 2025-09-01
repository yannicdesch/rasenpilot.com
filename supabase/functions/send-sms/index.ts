import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Twilio integration for SMS
interface SMSRequest {
  to: string;
  message: string;
  userId?: string;
  messageType?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== SMS SENDING SERVICE ===');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
    
    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error('Twilio credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { to, message, userId, messageType }: SMSRequest = await req.json();

    if (!to || !message) {
      throw new Error('Phone number and message are required');
    }

    // Check if user has opted in for SMS
    if (userId) {
      const { data: contact } = await supabase
        .from('communication_contacts')
        .select('sms_opt_in')
        .eq('user_id', userId)
        .single();

      if (!contact?.sms_opt_in) {
        throw new Error('User has not opted in for SMS communications');
      }
    }

    // Prepare Twilio API call
    const messageId = `sms_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('To', to);
    formData.append('From', twilioPhoneNumber);
    formData.append('Body', message);
    formData.append('StatusCallback', `${supabaseUrl}/functions/v1/sms-webhook`);

    // Send SMS via Twilio
    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    if (!twilioResponse.ok) {
      const error = await twilioResponse.text();
      console.error('Twilio error:', error);
      throw new Error(`Failed to send SMS: ${error}`);
    }

    const twilioResult = await twilioResponse.json();
    console.log('SMS sent successfully:', twilioResult.sid);

    // Track SMS event
    const { error: trackError } = await supabase
      .from('communication_events')
      .insert([{
        channel: 'sms',
        event_type: 'sent',
        message_id: twilioResult.sid,
        user_id: userId,
        phone_number: to,
        content: message,
        metadata: {
          messageType,
          twilioSid: twilioResult.sid,
          status: twilioResult.status
        },
        timestamp: new Date().toISOString()
      }]);

    if (trackError) {
      console.error('Error tracking SMS event:', trackError);
    }

    // Update contact statistics
    if (userId) {
      await supabase.rpc('increment_sms_count', { 
        user_id: userId,
        phone_number: to 
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        messageId: twilioResult.sid,
        status: twilioResult.status,
        message: 'SMS sent successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== SMS SENDING ERROR ===');
    console.error('Error details:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send SMS' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});