
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Crown } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

const SubscriptionCard = () => {
  const { subscription, isPremium, createCheckout, openCustomerPortal, loading } = useSubscription();

  if (loading) {
    return (
      <Card className="border-green-200">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Free Plan */}
      <Card className={`border-gray-200 ${!isPremium ? 'ring-2 ring-green-600' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Free Plan
            {!isPremium && <Badge className="bg-green-600 text-white">Aktueller Plan</Badge>}
          </CardTitle>
          <CardDescription>Grundlegende Rasenpflege-Features</CardDescription>
          <div className="text-2xl font-bold">€0 <span className="text-sm font-normal text-gray-500">für immer</span></div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm">2-Wochen Pflegeplan</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm">5 KI-Fragen pro Tag</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm">Basis Wetterinfo</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Premium Plan */}
      <Card className={`border-green-200 ${isPremium ? 'ring-2 ring-green-600 bg-green-50' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Premium Plan
            {isPremium && <Badge className="bg-green-600 text-white">Aktueller Plan</Badge>}
          </CardTitle>
          <CardDescription>Vollständige Rasenpflege-Lösung</CardDescription>
          <div className="text-2xl font-bold">€9,99 <span className="text-sm font-normal text-gray-500">pro Monat</span></div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Star className="h-4 w-4 text-green-600" />
              <span className="text-sm">Ganzjahres-Pflegeplan</span>
            </li>
            <li className="flex items-center gap-2">
              <Star className="h-4 w-4 text-green-600" />
              <span className="text-sm">Unbegrenzte KI-Fragen</span>
            </li>
            <li className="flex items-center gap-2">
              <Star className="h-4 w-4 text-green-600" />
              <span className="text-sm">Wetter-Alerts & Tipps</span>
            </li>
            <li className="flex items-center gap-2">
              <Star className="h-4 w-4 text-green-600" />
              <span className="text-sm">Email-Erinnerungen</span>
            </li>
            <li className="flex items-center gap-2">
              <Star className="h-4 w-4 text-green-600" />
              <span className="text-sm">Fortschritts-Tracking</span>
            </li>
            <li className="flex items-center gap-2">
              <Star className="h-4 w-4 text-green-600" />
              <span className="text-sm">Priority Support</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          {isPremium ? (
            <div className="w-full space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={openCustomerPortal}
              >
                Abo verwalten
              </Button>
              {subscription.subscription_end && (
                <p className="text-xs text-gray-500 text-center">
                  Nächste Zahlung: {new Date(subscription.subscription_end).toLocaleDateString('de-DE')}
                </p>
              )}
            </div>
          ) : (
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => createCheckout('monthly')}
            >
              Premium upgraden
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubscriptionCard;
