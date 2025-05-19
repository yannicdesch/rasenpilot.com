
import { trackEvent } from './tracking';

// Registration funnel tracking functions
export const trackRegistrationStart = () => {
  trackEvent('funnel_registration', 'view_form', 'User viewed registration form');
};

export const trackRegistrationStep = (step: string, details?: string) => {
  trackEvent('funnel_registration', 'complete_step', `Step: ${step}${details ? ` - ${details}` : ''}`);
};

export const trackRegistrationComplete = (method: string = 'email') => {
  trackEvent('funnel_registration', 'complete', `Registration method: ${method}`);
};

export const trackRegistrationAbandoned = (step: string) => {
  trackEvent('funnel_registration', 'abandon', `Abandoned at step: ${step}`);
};

// Track form interactions
export const trackFormInteraction = (formName: string, action: 'submit' | 'error' | 'field_complete', details?: string) => {
  trackEvent('form_interaction', action, `Form: ${formName}${details ? ` - ${details}` : ''}`);
};
