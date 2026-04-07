
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  is_trial?: boolean;
  trial_start?: string | null;
  trial_end?: string | null;
}

export type PlanTier = 'free' | 'premium' | 'pro';

function getTierFromSubscription(tier: string | null): PlanTier {
  if (!tier) return 'free';
  const t = tier.toLowerCase();
  if (t.startsWith('pro')) return 'pro';
  if (t.startsWith('premium') || t === 'monthly' || t === 'yearly') return 'premium';
  return 'free';
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    is_trial: false,
    trial_start: null,
    trial_end: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const checkSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        setSubscription({
          subscribed: false,
          subscription_tier: 'free',
          subscription_end: null,
          is_trial: false,
          trial_start: null,
          trial_end: null
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) throw error;

      setSubscription(data || {
        subscribed: false,
        subscription_tier: 'free',
        subscription_end: null,
        is_trial: false,
        trial_start: null,
        trial_end: null
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check subscription';
      setError(errorMessage);
      setSubscription({
        subscribed: false,
        subscription_tier: 'free',
        subscription_end: null,
        is_trial: false,
        trial_start: null,
        trial_end: null
      });
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async (priceType: string, guestEmail?: string) => {
    try {
      // Use guest email, or fall back to logged-in user's email
      let email = guestEmail;
      if (!email) {
        const { data: { user } } = await supabase.auth.getUser();
        email = user?.email || undefined;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceType, email }
      });

      if (error) throw error;

      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Fehler",
        description: "Checkout konnte nicht gestartet werden",
        variant: "destructive",
      });
    }
  };

  const openCustomerPortal = async () => {
    try {
      toast({
        title: "Wird geladen...",
        description: "Stripe-Portal wird geöffnet...",
      });

      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Keine Portal-URL erhalten');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Fehler",
        description: "Stripe-Portal konnte nicht geöffnet werden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkSubscription();

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        checkSubscription();
      }
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  const planTier = getTierFromSubscription(subscription.subscription_tier);
  const isPremium = subscription.subscribed && (planTier === 'premium' || planTier === 'pro');
  const isPro = subscription.subscribed && planTier === 'pro';

  return {
    subscription,
    loading,
    error,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    isPremium,
    isPro,
    planTier,
    isSubscribed: subscription.subscribed,
    subscriptionTier: subscription.subscription_tier,
    subscriptionEnd: subscription.subscription_end,
    isTrial: subscription.is_trial || false,
    trialEnd: subscription.trial_end,
    trialStart: subscription.trial_start
  };
};
