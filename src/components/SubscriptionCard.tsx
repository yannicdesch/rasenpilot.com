import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface SubscriptionCardProps {
  title: string;
  description: string;
  price: string;
  interval: string;
  priceType: 'monthly' | 'yearly';
  features: string[];
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  userEmail?: string;
}

export function SubscriptionCard({
  title,
  description,
  price,
  interval,
  priceType,
  features,
  isCurrentPlan = false,
  isPopular = false,
  userEmail
}: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceType,
          email: userEmail || 'guest@example.com'
        }
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`relative ${isCurrentPlan ? 'ring-2 ring-primary' : ''} ${isPopular ? 'border-primary' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge variant="default" className="bg-primary text-primary-foreground">
            Most Popular
          </Badge>
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Current Plan
          </Badge>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-muted-foreground">/{interval}</span>
        </div>
      </CardHeader>

      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleSubscribe}
          disabled={loading || isCurrentPlan}
          variant={isPopular ? "default" : "outline"}
        >
          {loading ? "Processing..." : isCurrentPlan ? "Current Plan" : `Subscribe ${interval}ly`}
        </Button>
      </CardFooter>
    </Card>
  );
}