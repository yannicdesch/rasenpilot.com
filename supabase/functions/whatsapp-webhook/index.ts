import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Webhook to handle WhatsApp status updates and incoming messages
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== WHATSAPP WEBHOOK ===');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle webhook verification
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      if (mode === 'subscribe' && token === verifyToken) {
        console.log('WhatsApp webhook verified successfully');
        return new Response(challenge, { status: 200 });
      } else {
        console.error('WhatsApp webhook verification failed');
        return new Response('Forbidden', { status: 403 });
      }
    }

    // Handle incoming webhook data
    const webhookData = await req.json();
    console.log('WhatsApp webhook data:', JSON.stringify(webhookData, null, 2));

    if (!webhookData.entry || !webhookData.entry[0]) {
      return new Response('No entry data', { status: 200 });
    }

    const entry = webhookData.entry[0];
    const changes = entry.changes || [];

    for (const change of changes) {
      if (change.field === 'messages') {
        const value = change.value;
        
        // Handle message statuses
        if (value.statuses) {
          for (const status of value.statuses) {
            await handleMessageStatus(supabase, status);
          }
        }

        // Handle incoming messages (replies)
        if (value.messages) {
          for (const message of value.messages) {
            await handleIncomingMessage(supabase, message, value.contacts?.[0]);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'WhatsApp webhook processed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== WHATSAPP WEBHOOK ERROR ===');
    console.error('Error details:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to process WhatsApp webhook' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Handle message status updates
async function handleMessageStatus(supabase: any, status: any) {
  const messageId = status.id;
  const statusValue = status.status; // sent, delivered, read, failed
  const recipientId = status.recipient_id;
  const timestamp = status.timestamp;

  console.log(`WhatsApp status update: ${messageId} -> ${statusValue}`);

  // Map WhatsApp statuses to our event types
  const statusMapping: Record<string, string> = {
    'sent': 'sent',
    'delivered': 'delivered',
    'read': 'read',
    'failed': 'failed'
  };

  const eventType = statusMapping[statusValue] || statusValue;

  // Update existing communication event
  const { error: updateError } = await supabase
    .from('communication_events')
    .update({
      event_type: eventType,
      metadata: {
        status: statusValue,
        timestamp: timestamp,
        updatedAt: new Date().toISOString()
      }
    })
    .eq('message_id', messageId)
    .eq('channel', 'whatsapp');

  if (updateError) {
    console.error('Error updating WhatsApp event:', updateError);
  }

  // Create a new tracking event for status updates
  const { error: trackError } = await supabase
    .from('communication_events')
    .insert([{
      channel: 'whatsapp',
      event_type: eventType,
      message_id: messageId,
      phone_number: recipientId,
      metadata: {
        originalStatus: statusValue,
        timestamp: timestamp,
        webhookReceived: true
      },
      timestamp: new Date().toISOString()
    }]);

  if (trackError) {
    console.error('Error tracking WhatsApp status event:', trackError);
  }
}

// Handle incoming messages (replies)
async function handleIncomingMessage(supabase: any, message: any, contact: any) {
  const messageId = message.id;
  const from = message.from;
  const messageType = message.type;
  const timestamp = message.timestamp;
  
  let content = '';
  if (messageType === 'text') {
    content = message.text?.body || '';
  } else if (messageType === 'button') {
    content = message.button?.text || '';
  }

  console.log(`WhatsApp incoming message from ${from}: ${content}`);

  // Find user by phone number
  const { data: contactData } = await supabase
    .from('communication_contacts')
    .select('user_id')
    .eq('phone_number', from)
    .single();

  // Track the reply
  const { error: trackError } = await supabase
    .from('communication_events')
    .insert([{
      channel: 'whatsapp',
      event_type: 'replied',
      message_id: messageId,
      user_id: contactData?.user_id,
      phone_number: from,
      content: content,
      metadata: {
        messageType: messageType,
        timestamp: timestamp,
        contactName: contact?.profile?.name,
        isIncoming: true
      },
      timestamp: new Date().toISOString()
    }]);

  if (trackError) {
    console.error('Error tracking WhatsApp reply:', trackError);
  }

  // You could also implement auto-responses here
  // For example, respond to specific keywords or forward to customer service
}