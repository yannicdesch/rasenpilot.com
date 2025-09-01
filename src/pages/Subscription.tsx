
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw, ExternalLink } from 'lucide-react';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';

export default function Subscription() {
  const [guestEmail, setGuestEmail] = useState('');
  const [user, setUser] = useState<any>(null);
  const { subscription, loading, checkSubscription, openCustomerPortal, isSubscribed, subscriptionTier } = useSubscription();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const subscriptionPlans = [
    {
      title: "Monthly Premium",
      description: "Perfect for getting started",
      price: "$9.99",
      interval: "month",
      priceType: "monthly" as const,
      features: [
        "Unlimited access to all features",
        "Priority support",
        "Advanced analytics",
        "Custom integrations"
      ],
      isCurrentPlan: isSubscribed && subscriptionTier === "Monthly"
    },
    {
      title: "Yearly Premium",
      description: "Best value - Save $20!",
      price: "$99.00",
      interval: "year",
      priceType: "yearly" as const,
      features: [
        "Everything in Monthly",
        "2 months free",
        "Priority onboarding",
        "Dedicated account manager"
      ],
      isPopular: true,
      isCurrentPlan: isSubscribed && subscriptionTier === "Yearly"
    }
  ];

  return (
    <>
      <SEO 
        title="Subscription Plans - Choose Your Premium Plan"
        description="Choose between monthly ($9.99) or yearly ($99) premium subscription plans. Get unlimited access to all features with flexible pricing options."
      />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Unlock premium features with our flexible subscription options
          </p>
          
          {isSubscribed && (
            <div className="mb-6">
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-lg px-4 py-2">
                ✓ Premium Member - {subscriptionTier} Plan
              </Badge>
              {subscription.subscription_end && (
                <p className="text-sm text-muted-foreground mt-2">
                  Renews on: {new Date(subscription.subscription_end).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Guest Email Input */}
        {!user && (
          <Card className="mb-8 max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Guest Checkout</CardTitle>
              <CardDescription>
                Enter your email to proceed with guest checkout
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="guest-email">Email Address</Label>
                <Input
                  id="guest-email"
                  type="email"
                  placeholder="your@email.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {subscriptionPlans.map((plan, index) => (
            <SubscriptionCard
              key={index}
              {...plan}
              userEmail={user?.email || guestEmail}
            />
          ))}
        </div>

        {/* Subscription Management */}
        {isSubscribed && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Manage Your Subscription
                <Badge variant="secondary">Active</Badge>
              </CardTitle>
              <CardDescription>
                Update your payment method, billing details, or cancel your subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button onClick={checkSubscription} variant="outline" disabled={loading}>
                  <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Status
                </Button>
                <Button onClick={openCustomerPortal} variant="default">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Information */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Why Choose Premium?</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="space-y-2">
              <h3 className="font-semibold">Unlimited Access</h3>
              <p className="text-sm text-muted-foreground">
                Get unlimited access to all premium features and content
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Priority Support</h3>
              <p className="text-sm text-muted-foreground">
                Get help when you need it with our priority support team
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Advanced Features</h3>
              <p className="text-sm text-muted-foreground">
                Access to advanced tools and integrations for power users
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
