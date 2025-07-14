import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MainNavigation from '@/components/MainNavigation';

const Impressum = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Impressum</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                <strong>Angaben gemäß § 5 TMG:</strong><br />
                Rasenpilot<br />
                Yannic Desch<br />
                Am Hocholzergraben 56<br />
                69190 Walldorf<br />
                Deutschland
              </p>

              <p>
                <strong>Kontakt:</strong><br />
                E-Mail: <a href="mailto:info@rasenpilot.com" className="text-green-600 hover:text-green-800">info@rasenpilot.com</a>
              </p>

              <p>
                <strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</strong><br />
                Yannic Desch<br />
                Am Hocholzergraben 56<br />
                69190 Walldorf
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Impressum;