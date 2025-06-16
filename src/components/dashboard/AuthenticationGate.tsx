
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from 'lucide-react';
import MainNavigation from '@/components/MainNavigation';

const AuthenticationGate: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">Anmeldung erforderlich</h2>
              <p className="text-gray-600 mb-4">
                Bitte melden Sie sich an, um auf Ihr Dashboard zuzugreifen.
              </p>
              <Button onClick={() => window.location.href = '/auth'}>
                Anmelden
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationGate;
