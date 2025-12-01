
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
      console.log('🔍 Starting subscription check...');

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log('❌ No user found - free tier');
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

      console.log('👤 User found:', { id: user.user.id, email: user.user.email });

      const { data, error } = await supabase.functions.invoke('check-subscription');
      console.log('📡 Subscription check response:', { data, error });

      if (error) {
        console.error('❌ Subscription check error:', error);
        throw error;
      }

      console.log('✅ Setting subscription data:', data);
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
      console.error('💥 Error checking subscription:', err);
      // Set to free tier on error
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

  const createCheckout = async (priceType: 'monthly' | 'yearly' = 'monthly', guestEmail?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceType, email: guestEmail }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process",
        variant: "destructive",
      });
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      // Open customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open customer portal",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkSubscription();

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        checkSubscription();
      }
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  const isPremium = subscription.subscribed && (subscription.subscription_tier === 'Monthly' || subscription.subscription_tier === 'Yearly' || subscription.subscription_tier === 'Premium');
  console.log('🎯 isPremium calculation:', { 
    subscribed: subscription.subscribed, 
    tier: subscription.subscription_tier, 
    isPremium 
  });

  return {
    subscription,
    loading,
    error,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    isPremium,
    isSubscribed: subscription.subscribed,
    subscriptionTier: subscription.subscription_tier,
    subscriptionEnd: subscription.subscription_end,
    isTrial: subscription.is_trial || false,
    trialEnd: subscription.trial_end,
    trialStart: subscription.trial_start
  };
};
