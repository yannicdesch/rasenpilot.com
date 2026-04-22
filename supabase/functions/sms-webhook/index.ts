import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-twilio-signature',
};

// Validate Twilio request signature: HMAC-SHA1(authToken, fullUrl + sortedFormParamsConcatenated)
// Reference: https://www.twilio.com/docs/usage/security#validating-requests
const validateTwilioSignature = (authToken: string, url: string, params: Record<string, string>, signature: string): boolean => {
  try {
    const sortedKeys = Object.keys(params).sort();
    let data = url;
    for (const key of sortedKeys) data += key + params[key];
    const expected = createHmac('sha1', authToken).update(data).digest('base64');
    // Constant-time compare
    if (expected.length !== signature.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    return diff === 0;
  } catch (e) {
    console.error('Signature validation error:', e);
    return false;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== SMS WEBHOOK ===');

    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const signature = req.headers.get('x-twilio-signature');

    // Read body once as text so we can both validate and parse
    const rawBody = await req.text();
    const formParams: Record<string, string> = {};
    new URLSearchParams(rawBody).forEach((v, k) => { formParams[k] = v; });

    // Verify Twilio request signature — reject forged requests
    if (!authToken) {
      console.error('TWILIO_AUTH_TOKEN not configured — rejecting webhook');
      return new Response(JSON.stringify({ error: 'Webhook not configured' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing signature' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    // Use the public webhook URL Twilio called (must match what's configured in Twilio Console)
    const fullUrl = req.url;
    if (!validateTwilioSignature(authToken, fullUrl, formParams, signature)) {
      console.error('Invalid Twilio signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const messageSid = formParams['MessageSid'];
    const messageStatus = formParams['MessageStatus'];
    const to = formParams['To'];
    const from = formParams['From'];
    const errorCode = formParams['ErrorCode'];
    const errorMessage = formParams['ErrorMessage'];

    console.log('SMS webhook data:', { messageSid, messageStatus, to, from, errorCode, errorMessage });

    if (!messageSid || !messageStatus) {
      throw new Error('Missing required webhook data');
    }

    const statusMapping: Record<string, string> = {
      'delivered': 'delivered',
      'failed': 'failed',
      'undelivered': 'failed',
      'read': 'read'
    };
    const eventType = statusMapping[messageStatus] || messageStatus;

    const { error: updateError } = await supabase
      .from('communication_events')
      .update({
        event_type: eventType,
        metadata: { status: messageStatus, errorCode, errorMessage, updatedAt: new Date().toISOString() }
      })
      .eq('message_id', messageSid)
      .eq('channel', 'sms');
    if (updateError) console.error('Error updating SMS event:', updateError);

    const { error: trackError } = await supabase
      .from('communication_events')
      .insert([{
        channel: 'sms',
        event_type: eventType,
        message_id: messageSid,
        phone_number: to,
        metadata: { originalStatus: messageStatus, errorCode, errorMessage, webhookReceived: true },
        timestamp: new Date().toISOString()
      }]);
    if (trackError) console.error('Error tracking SMS status event:', trackError);

    console.log(`SMS ${eventType} tracked for message ${messageSid}`);

    return new Response(
      JSON.stringify({ success: true, message: 'SMS status updated successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== SMS WEBHOOK ERROR ===', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Failed to process SMS webhook' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
