import { supabase } from '@/integrations/supabase/client';

export type ConversionStage = 
  | 'visitor' 
  | 'signup_started' 
  | 'signup_completed' 
  | 'analysis_started'
  | 'analysis_completed'
  | 'premium_viewed'
  | 'checkout_started'
  | 'payment_completed';

export interface ConversionEvent {
  stage: ConversionStage;
  metadata?: Record<string, any>;
}

/**
 * Track conversion funnel events
 */
export const trackConversion = async (event: ConversionEvent) => {
  try {
    const { error } = await supabase
      .from('events')
      .insert({
        category: 'conversion_funnel',
        action: event.stage,
        label: event.stage,
        value: 1,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Error tracking conversion:', error);
    } else {
      console.log('✅ Conversion tracked:', event.stage, event.metadata);
    }
  } catch (error) {
    console.error('Failed to track conversion:', error);
  }
};

/**
 * Track visitor landing on site
 */
export const trackVisitor = () => {
  trackConversion({ stage: 'visitor' });
};

/**
 * Track signup flow started
 */
export const trackSignupStarted = (metadata?: Record<string, any>) => {
  trackConversion({ stage: 'signup_started', metadata });
};

/**
 * Track signup completed
 */
export const trackSignupCompleted = (userId: string, email: string) => {
  trackConversion({ 
    stage: 'signup_completed',
    metadata: { userId, email }
  });
};

/**
 * Track analysis started
 */
export const trackAnalysisStarted = (userId?: string) => {
  trackConversion({ 
    stage: 'analysis_started',
    metadata: { userId }
  });
};

/**
 * Track analysis completed
 */
export const trackAnalysisCompleted = (userId: string, score: number) => {
  trackConversion({ 
    stage: 'analysis_completed',
    metadata: { userId, score }
  });
};

/**
 * Track premium page viewed
 */
export const trackPremiumViewed = (source?: string) => {
  trackConversion({ 
    stage: 'premium_viewed',
    metadata: { source }
  });
};

/**
 * Track checkout started
 */
export const trackCheckoutStarted = (priceType: string) => {
  trackConversion({ 
    stage: 'checkout_started',
    metadata: { priceType }
  });
};

/**
 * Track payment completed
 */
export const trackPaymentCompleted = (userId: string, priceType: string, amount: number) => {
  trackConversion({ 
    stage: 'payment_completed',
    metadata: { userId, priceType, amount }
  });
};

/**
 * Get conversion funnel stats for analytics
 */
export const getConversionFunnelStats = async (days: number = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('events')
      .select('action, count')
      .eq('category', 'conversion_funnel')
      .gte('timestamp', startDate.toISOString());

    if (error) throw error;

    // Aggregate counts by stage
    const stats = (data || []).reduce((acc: Record<string, number>, event: any) => {
      acc[event.action] = (acc[event.action] || 0) + 1;
      return acc;
    }, {});

    return {
      visitors: stats['visitor'] || 0,
      signupStarted: stats['signup_started'] || 0,
      signupCompleted: stats['signup_completed'] || 0,
      analysisStarted: stats['analysis_started'] || 0,
      analysisCompleted: stats['analysis_completed'] || 0,
      premiumViewed: stats['premium_viewed'] || 0,
      checkoutStarted: stats['checkout_started'] || 0,
      paymentCompleted: stats['payment_completed'] || 0
    };
  } catch (error) {
    console.error('Error fetching conversion stats:', error);
    return null;
  }
};
