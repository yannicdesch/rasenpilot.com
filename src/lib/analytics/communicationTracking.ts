import { trackEvent } from './tracking';
import { supabase } from '@/lib/supabase';

// SMS and WhatsApp tracking utilities
export interface CommunicationEvent {
  channel: 'sms' | 'whatsapp' | 'email';
  eventType: 'sent' | 'delivered' | 'read' | 'clicked' | 'replied' | 'failed';
  messageId: string;
  userId?: string;
  phoneNumber?: string;
  content?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CommunicationContact {
  userId: string;
  phoneNumber: string;
  countryCode: string;
  whatsappOptIn: boolean;
  smsOptIn: boolean;
  lastSmsDate?: string;
  lastWhatsappDate?: string;
  totalSmsCount: number;
  totalWhatsappCount: number;
}

// Track SMS events
export const trackSMSEvent = async (
  eventType: CommunicationEvent['eventType'],
  messageId: string,
  phoneNumber: string,
  userId?: string,
  metadata?: Record<string, any>
) => {
  try {
    // Store in events table for general analytics
    await trackEvent('sms_communication', eventType, messageId, undefined);
    
    // Store detailed communication event using raw query since table is new
    const { error } = await supabase
      .rpc('track_communication_event', {
        p_channel: 'sms',
        p_event_type: eventType,
        p_message_id: messageId,
        p_user_id: userId || null,
        p_phone_number: phoneNumber,
        p_metadata: metadata || {}
      });

    if (error) {
      console.error('Error storing SMS event:', error);
    }

    console.log(`📱 SMS ${eventType}: ${messageId}`, { phoneNumber, userId, metadata });
    
    return true;
  } catch (error) {
    console.error('Error tracking SMS event:', error);
    return false;
  }
};

// Track WhatsApp events
export const trackWhatsAppEvent = async (
  eventType: CommunicationEvent['eventType'],
  messageId: string,
  phoneNumber: string,
  userId?: string,
  metadata?: Record<string, any>
) => {
  try {
    // Store in events table for general analytics
    await trackEvent('whatsapp_communication', eventType, messageId, undefined);
    
    // Store detailed communication event using raw query since table is new
    const { error } = await supabase
      .rpc('track_communication_event', {
        p_channel: 'whatsapp',
        p_event_type: eventType,
        p_message_id: messageId,
        p_user_id: userId || null,
        p_phone_number: phoneNumber,
        p_metadata: metadata || {}
      });

    if (error) {
      console.error('Error storing WhatsApp event:', error);
    }

    console.log(`💬 WhatsApp ${eventType}: ${messageId}`, { phoneNumber, userId, metadata });
    
    return true;
  } catch (error) {
    console.error('Error tracking WhatsApp event:', error);
    return false;
  }
};

// Add/update contact information
export const updateCommunicationContact = async (
  userId: string,
  phoneNumber: string,
  countryCode: string,
  preferences: { whatsappOptIn?: boolean; smsOptIn?: boolean }
) => {
  try {
    const { error } = await supabase
      .rpc('update_communication_contact', {
        p_user_id: userId,
        p_phone_number: phoneNumber,
        p_country_code: countryCode,
        p_whatsapp_opt_in: preferences.whatsappOptIn || false,
        p_sms_opt_in: preferences.smsOptIn || false
      });

    if (error) {
      console.error('Error updating communication contact:', error);
      return false;
    }

    console.log(`📞 Updated contact preferences for ${userId}`, { phoneNumber, preferences });
    return true;
  } catch (error) {
    console.error('Error updating communication contact:', error);
    return false;
  }
};

// Get communication analytics
export const getCommunicationAnalytics = async (timeframe: 'day' | 'week' | 'month' = 'week') => {
  try {
    const { data, error } = await supabase
      .rpc('get_communication_analytics', { 
        p_timeframe: timeframe 
      });

    if (error) {
      console.error('Error fetching communication analytics:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting communication analytics:', error);
    return null;
  }
};

// Track link clicks in SMS/WhatsApp messages
export const trackCommunicationClick = async (
  channel: 'sms' | 'whatsapp',
  messageId: string,
  linkUrl: string,
  phoneNumber?: string,
  userId?: string
) => {
  const eventFunction = channel === 'sms' ? trackSMSEvent : trackWhatsAppEvent;
  
  await eventFunction('clicked', messageId, phoneNumber || '', userId, {
    linkUrl,
    clickedAt: new Date().toISOString()
  });
};

// Track message replies
export const trackCommunicationReply = async (
  channel: 'sms' | 'whatsapp',
  originalMessageId: string,
  replyContent: string,
  phoneNumber: string,
  userId?: string
) => {
  const eventFunction = channel === 'sms' ? trackSMSEvent : trackWhatsAppEvent;
  
  await eventFunction('replied', originalMessageId, phoneNumber, userId, {
    replyContent,
    repliedAt: new Date().toISOString()
  });
};