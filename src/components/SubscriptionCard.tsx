import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
      console.log('Starting checkout with:', { priceType, email: userEmail || 'guest@example.com' });
      
      const response = await fetch(`https://ugaxwcslhoppflrbuwxv.supabase.co/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ`,
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ'
        },
        body: JSON.stringify({
          priceType,
          email: userEmail || 'guest@example.com'
        })
      });

      const result = await response.text();
      console.log('Raw response:', { status: response.status, statusText: response.statusText, body: result });

      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        console.error('Error body:', result);
        throw new Error(`Server error: ${response.status} - ${result}`);
      }

      const data = JSON.parse(result);
      console.log('Parsed response:', data);

      if (!data?.url) {
        console.error('No checkout URL returned:', data);
        throw new Error('Keine Checkout-URL erhalten');
      }

      console.log('Opening checkout in new tab:', data.url);
      // Open Stripe checkout in a new tab to avoid iframe restrictions
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      
      // Show more detailed error message
      let errorMessage = "Checkout-Prozess konnte nicht gestartet werden";
      if (error?.message) {
        errorMessage += `: ${error.message}`;
      }
      
      toast({
        title: "Fehler",
        description: errorMessage,
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
            Beliebt
          </Badge>
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Aktueller Plan
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
          {loading ? "Verarbeitung..." : isCurrentPlan ? "Aktueller Plan" : interval === 'month' ? 'Monatlich abonnieren' : 'Jährlich abonnieren'}
        </Button>
      </CardFooter>
    </Card>
  );
}