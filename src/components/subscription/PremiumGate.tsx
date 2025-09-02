
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Star, Lock } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PremiumGateProps {
  feature: string;
  description: string;
  children?: React.ReactNode;
}

const PremiumGate: React.FC<PremiumGateProps> = ({ feature, description, children }) => {
  const { isPremium, createCheckout } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();

  // If user is not authenticated, show login prompt
  if (!user) {
    return (
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-blue-700">
            <Lock className="h-6 w-6" />
            Anmeldung erforderlich
          </CardTitle>
          <CardDescription className="text-blue-600">
            {feature}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">{description}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-blue-700">
              <Lock className="h-4 w-4" />
              <span>Bitte melden Sie sich an, um diese Funktion zu nutzen</span>
            </div>
          </div>
          <Button 
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
            onClick={() => navigate('/auth')}
          >
            Jetzt anmelden
          </Button>
        </CardContent>
      </Card>
    );
  }

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
          onClick={() => createCheckout('monthly')}
        >
          Jetzt Premium werden - €9,99/Monat
        </Button>
      </CardContent>
    </Card>
  );
};

export default PremiumGate;
