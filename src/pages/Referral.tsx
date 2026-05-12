import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import SEO from '@/components/SEO';
import ReferralDashboard from '@/components/ReferralDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';

const Referral: React.FC = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <SEO
          title="Freunde einladen | Rasenpilot"
          description="Lade Freunde zu Rasenpilot ein und sichere dir 1 Monat Premium gratis für je 3 erfolgreiche Einladungen."
          canonical="https://www.rasenpilot.com/referral"
          noindex
        />
        <MainNavigation />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <header className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold font-dm-serif text-foreground">
              Freunde einladen
            </h1>
            <p className="text-muted-foreground mt-2">
              Teile Rasenpilot — und sichere dir <strong>1 Monat Premium gratis</strong> für je 3 erfolgreiche Einladungen.
            </p>
          </header>
          <ReferralDashboard />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Referral;
