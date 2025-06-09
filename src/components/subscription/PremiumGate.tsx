
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Star } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface PremiumGateProps {
  feature: string;
  description: string;
  children?: React.ReactNode;
}

const PremiumGate: React.FC<PremiumGateProps> = ({ feature, description, children }) => {
  const { isPremium, createCheckout } = useSubscription();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-yellow-700">
          <Crown className="h-6 w-6" />
          Premium Feature
        </CardTitle>
        <CardDescription className="text-yellow-600">
          {feature}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-gray-600">{description}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-yellow-700">
            <Star className="h-4 w-4" />
            <span>Nur für Premium-Mitglieder</span>
          </div>
        </div>
        <Button 
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
          onClick={createCheckout}
        >
          Jetzt Premium werden - €9,99/Monat
        </Button>
      </CardContent>
    </Card>
  );
};

export default PremiumGate;
