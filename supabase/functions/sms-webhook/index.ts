import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Webhook to handle SMS status updates from Twilio
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== SMS WEBHOOK ===');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse Twilio webhook data
    const formData = await req.formData();
    const messageSid = formData.get('MessageSid')?.toString();
    const messageStatus = formData.get('MessageStatus')?.toString();
    const to = formData.get('To')?.toString();
    const from = formData.get('From')?.toString();
    const errorCode = formData.get('ErrorCode')?.toString();
    const errorMessage = formData.get('ErrorMessage')?.toString();

    console.log('SMS webhook data:', {
      messageSid,
      messageStatus,
      to,
      from,
      errorCode,
      errorMessage
    });

    if (!messageSid || !messageStatus) {
      throw new Error('Missing required webhook data');
    }

    // Map Twilio statuses to our event types
    const statusMapping: Record<string, string> = {
      'delivered': 'delivered',
      'failed': 'failed',
      'undelivered': 'failed',
      'read': 'read'
    };

    const eventType = statusMapping[messageStatus] || messageStatus;

    // Update communication event
    const { error: updateError } = await supabase
      .from('communication_events')
      .update({
        event_type: eventType,
        metadata: {
          status: messageStatus,
          errorCode,
          errorMessage,
          updatedAt: new Date().toISOString()
        }
      })
      .eq('message_id', messageSid)
      .eq('channel', 'sms');

    if (updateError) {
      console.error('Error updating SMS event:', updateError);
    }

    // Create a new tracking event for status updates
    const { error: trackError } = await supabase
      .from('communication_events')
      .insert([{
        channel: 'sms',
        event_type: eventType,
        message_id: messageSid,
        phone_number: to,
        metadata: {
          originalStatus: messageStatus,
          errorCode,
          errorMessage,
          webhookReceived: true
        },
        timestamp: new Date().toISOString()
      }]);

    if (trackError) {
      console.error('Error tracking SMS status event:', trackError);
    }

    console.log(`SMS ${eventType} tracked for message ${messageSid}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'SMS status updated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== SMS WEBHOOK ERROR ===');
    console.error('Error details:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to process SMS webhook' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});