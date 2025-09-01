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
    // Store in events table
    await trackEvent('sms_communication', eventType, messageId, undefined);
    
    // Store detailed communication event
    const { error } = await supabase
      .from('communication_events')
      .insert([{
        channel: 'sms',
        event_type: eventType,
        message_id: messageId,
        user_id: userId,
        phone_number: phoneNumber,
        metadata: metadata || {},
        timestamp: new Date().toISOString()
      }]);

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
    // Store in events table
    await trackEvent('whatsapp_communication', eventType, messageId, undefined);
    
    // Store detailed communication event
    const { error } = await supabase
      .from('communication_events')
      .insert([{
        channel: 'whatsapp',
        event_type: eventType,
        message_id: messageId,
        user_id: userId,
        phone_number: phoneNumber,
        metadata: metadata || {},
        timestamp: new Date().toISOString()
      }]);

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
      .from('communication_contacts')
      .upsert([{
        user_id: userId,
        phone_number: phoneNumber,
        country_code: countryCode,
        whatsapp_opt_in: preferences.whatsappOptIn || false,
        sms_opt_in: preferences.smsOptIn || false,
        updated_at: new Date().toISOString()
      }], {
        onConflict: 'user_id'
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
    const daysBack = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Get SMS analytics
    const { data: smsEvents, error: smsError } = await supabase
      .from('communication_events')
      .select('*')
      .eq('channel', 'sms')
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false });

    // Get WhatsApp analytics
    const { data: whatsappEvents, error: whatsappError } = await supabase
      .from('communication_events')
      .select('*')
      .eq('channel', 'whatsapp')
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false });

    if (smsError || whatsappError) {
      console.error('Error fetching communication analytics:', { smsError, whatsappError });
    }

    // Calculate metrics
    const smsMetrics = calculateMetrics(smsEvents || []);
    const whatsappMetrics = calculateMetrics(whatsappEvents || []);

    return {
      sms: smsMetrics,
      whatsapp: whatsappMetrics,
      combined: {
        totalSent: smsMetrics.sent + whatsappMetrics.sent,
        totalDelivered: smsMetrics.delivered + whatsappMetrics.delivered,
        totalRead: smsMetrics.read + whatsappMetrics.read,
        totalClicked: smsMetrics.clicked + whatsappMetrics.clicked,
        totalReplied: smsMetrics.replied + whatsappMetrics.replied,
        deliveryRate: ((smsMetrics.delivered + whatsappMetrics.delivered) / (smsMetrics.sent + whatsappMetrics.sent)) * 100 || 0,
        readRate: ((smsMetrics.read + whatsappMetrics.read) / (smsMetrics.delivered + whatsappMetrics.delivered)) * 100 || 0,
        clickRate: ((smsMetrics.clicked + whatsappMetrics.clicked) / (smsMetrics.delivered + whatsappMetrics.delivered)) * 100 || 0
      }
    };
  } catch (error) {
    console.error('Error getting communication analytics:', error);
    return null;
  }
};

// Helper function to calculate metrics
const calculateMetrics = (events: any[]) => {
  const metrics = {
    sent: 0,
    delivered: 0,
    read: 0,
    clicked: 0,
    replied: 0,
    failed: 0
  };

  events.forEach(event => {
    if (metrics.hasOwnProperty(event.event_type)) {
      metrics[event.event_type as keyof typeof metrics]++;
    }
  });

  return {
    ...metrics,
    deliveryRate: metrics.sent > 0 ? (metrics.delivered / metrics.sent) * 100 : 0,
    readRate: metrics.delivered > 0 ? (metrics.read / metrics.delivered) * 100 : 0,
    clickRate: metrics.delivered > 0 ? (metrics.clicked / metrics.delivered) * 100 : 0
  };
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