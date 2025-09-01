import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// WhatsApp Business API integration
interface WhatsAppRequest {
  to: string;
  message: string;
  userId?: string;
  messageType?: string;
  templateName?: string;
  templateParams?: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== WHATSAPP SENDING SERVICE ===');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const whatsappPhoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
    
    if (!whatsappToken || !whatsappPhoneNumberId) {
      throw new Error('WhatsApp credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { to, message, userId, messageType, templateName, templateParams }: WhatsAppRequest = await req.json();

    if (!to || (!message && !templateName)) {
      throw new Error('Phone number and message/template are required');
    }

    // Check if user has opted in for WhatsApp
    if (userId) {
      const { data: contact } = await supabase
        .from('communication_contacts')
        .select('whatsapp_opt_in')
        .eq('user_id', userId)
        .single();

      if (!contact?.whatsapp_opt_in) {
        throw new Error('User has not opted in for WhatsApp communications');
      }
    }

    const messageId = `whatsapp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const whatsappUrl = `https://graph.facebook.com/v18.0/${whatsappPhoneNumberId}/messages`;
    
    // Prepare message payload
    let messagePayload: any;
    
    if (templateName) {
      // Template message
      messagePayload = {
        messaging_product: "whatsapp",
        to: to,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: "de"
          },
          components: templateParams ? [
            {
              type: "body",
              parameters: templateParams.map(param => ({ type: "text", text: param }))
            }
          ] : []
        }
      };
    } else {
      // Text message
      messagePayload = {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: {
          body: message
        }
      };
    }

    // Send WhatsApp message
    const whatsappResponse = await fetch(whatsappUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messagePayload)
    });

    if (!whatsappResponse.ok) {
      const error = await whatsappResponse.text();
      console.error('WhatsApp error:', error);
      throw new Error(`Failed to send WhatsApp message: ${error}`);
    }

    const whatsappResult = await whatsappResponse.json();
    console.log('WhatsApp message sent successfully:', whatsappResult.messages[0].id);

    // Track WhatsApp event
    const { error: trackError } = await supabase
      .from('communication_events')
      .insert([{
        channel: 'whatsapp',
        event_type: 'sent',
        message_id: whatsappResult.messages[0].id,
        user_id: userId,
        phone_number: to,
        content: message || `Template: ${templateName}`,
        metadata: {
          messageType,
          templateName,
          templateParams,
          whatsappMessageId: whatsappResult.messages[0].id
        },
        timestamp: new Date().toISOString()
      }]);

    if (trackError) {
      console.error('Error tracking WhatsApp event:', trackError);
    }

    // Update contact statistics
    if (userId) {
      await supabase.rpc('increment_whatsapp_count', { 
        user_id: userId,
        phone_number: to 
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        messageId: whatsappResult.messages[0].id,
        status: 'sent',
        message: 'WhatsApp message sent successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== WHATSAPP SENDING ERROR ===');
    console.error('Error details:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send WhatsApp message' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});