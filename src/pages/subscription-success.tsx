import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import SEO from '@/components/SEO';

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const { checkSubscription } = useSubscription();

  useEffect(() => {
    // Refresh subscription status after successful payment
    const timer = setTimeout(() => {
      checkSubscription();
    }, 2000);

    return () => clearTimeout(timer);
  }, [checkSubscription]);

  return (
    <>
      <SEO 
        title="Subscription Successful - Welcome to Premium"
        description="Your subscription has been successfully activated. Welcome to premium membership with unlimited access to all features."
      />
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-3xl">Welcome to Premium!</CardTitle>
            <CardDescription className="text-lg">
              Your subscription has been successfully activated
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Thank you for subscribing! You now have unlimited access to all premium features.
              </p>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
                <ul className="text-sm text-green-700 space-y-1 text-left">
                  <li>• Explore all premium features</li>
                  <li>• Access priority support</li>
                  <li>• Enjoy unlimited usage</li>
                  <li>• Manage your subscription anytime</li>
                </ul>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/')} variant="default">
                Get Started
              </Button>
              <Button onClick={() => navigate('/subscription')} variant="outline">
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}