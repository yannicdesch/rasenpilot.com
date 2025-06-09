
import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import SubscriptionCard from '@/components/subscription/SubscriptionCard';
import PremiumFeatures from '@/components/subscription/PremiumFeatures';

const Subscription = () => {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MainNavigation />
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-green-600 mb-2">Mitgliedschaft</h1>
          <p className="text-gray-600">Wählen Sie den Plan, der zu Ihnen passt</p>
        </div>
        
        <div className="space-y-12">
          <SubscriptionCard />
          <PremiumFeatures />
        </div>
      </div>
    </div>
  );
};

export default Subscription;
