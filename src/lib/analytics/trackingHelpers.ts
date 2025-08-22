
import { trackEvent } from './tracking';
import { trackGAConversion, trackGAEvent } from './initialize';

// Enhanced registration funnel tracking functions
export const trackRegistrationStart = () => {
  trackEvent('registration', 'registration_start', 'User viewed registration form');
  trackGAEvent('registration_start', 'conversion', 'Registration Form View');
};

export const trackRegistrationStep = (step: string, details?: string) => {
  const label = `Step: ${step}${details ? ` - ${details}` : ''}`;
  trackEvent('registration', 'registration_step', label);
  trackGAEvent('registration_step', 'conversion', label);
};

export const trackRegistrationComplete = (method: string = 'email') => {
  const label = `Registration method: ${method}`;
  trackEvent('registration', 'registration_complete', label);
  trackGAConversion('sign_up', {
    method: method,
    event_label: 'User Registration Complete'
  });
  trackGAEvent('registration_complete', 'conversion', label, 1);
};

export const trackRegistrationAbandoned = (step: string) => {
  const label = `Abandoned at step: ${step}`;
  trackEvent('registration', 'registration_abandoned', label);
  trackGAEvent('registration_abandoned', 'conversion', label);
};

// Enhanced form interaction tracking
export const trackFormInteraction = (formName: string, action: 'submit' | 'error' | 'field_complete', details?: string) => {
  const label = `Form: ${formName}${details ? ` - ${details}` : ''}`;
  trackEvent('form_interaction', action, label);
  trackGAEvent(action, 'form_interaction', label);
};

// New conversion tracking functions
export const trackAnalysisStart = (analysisType: string = 'lawn_analysis') => {
  trackEvent('conversion', 'analysis_start', `Analysis type: ${analysisType}`);
  trackGAEvent('analysis_start', 'conversion', analysisType);
};

export const trackAnalysisComplete = (score: number, analysisType: string = 'lawn_analysis') => {
  trackEvent('conversion', 'analysis_complete', `Score: ${score}, Type: ${analysisType}`, score);
  trackGAConversion('analysis_complete', {
    event_label: 'Lawn Analysis Complete',
    custom_parameter_score: score,
    custom_parameter_type: analysisType,
    value: score
  });
  trackGAEvent('analysis_complete', 'conversion', `${analysisType} - Score: ${score}`, score);
};

export const trackSubscriptionStart = (planType: string) => {
  trackEvent('conversion', 'subscription_start', `Plan: ${planType}`);
  trackGAEvent('subscription_start', 'conversion', planType);
};

export const trackSubscriptionComplete = (planType: string, value: number) => {
  trackEvent('conversion', 'subscription_complete', `Plan: ${planType}`, value);
  trackGAConversion('purchase', {
    transaction_id: `sub_${Date.now()}`,
    value: value,
    currency: 'EUR',
    items: [{
      item_id: planType,
      item_name: `${planType} Subscription`,
      item_category: 'subscription',
      quantity: 1,
      price: value
    }]
  });
  trackGAEvent('subscription_complete', 'conversion', planType, value);
};

export const trackEmailSignup = (source: string = 'newsletter') => {
  trackEvent('conversion', 'email_signup', `Source: ${source}`);
  trackGAConversion('email_signup', {
    event_label: 'Email Newsletter Signup',
    custom_parameter_source: source
  });
  trackGAEvent('email_signup', 'conversion', source, 1);
};

export const trackDownload = (itemName: string, itemType: string = 'care_plan') => {
  trackEvent('conversion', 'download', `${itemType}: ${itemName}`);
  trackGAEvent('download', 'conversion', `${itemType} - ${itemName}`, 1);
};
