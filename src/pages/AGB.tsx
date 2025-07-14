import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MainNavigation from '@/components/MainNavigation';

const AGB = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Allgemeine Geschäftsbedingungen (AGB)</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-3">1. Geltungsbereich</h2>
                <p>
                  Diese AGB gelten für alle Dienstleistungen von Rasenpilot, insbesondere die Nutzung der KI-basierten Rasenanalyse und Pflegepläne.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">2. Vertragsschluss</h2>
                <p>
                  Ein Vertrag kommt zustande, sobald Sie eine Analyse oder Dienstleistung auf unserer Website beauftragen.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">3. Leistungen von Rasenpilot</h2>
                <p>
                  Wir bieten KI-gestützte Empfehlungen für die Rasenpflege. Die Umsetzung obliegt dem Nutzer. Eine Erfolgsgarantie kann nicht gegeben werden.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">4. Preise und Zahlung</h2>
                <p>
                  Alle angegebenen Preise verstehen sich inklusive Mehrwertsteuer. Die Zahlung erfolgt per Kreditkarte oder Online-Zahlungsdienstleister.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">5. Haftung</h2>
                <p>
                  Rasenpilot haftet nur für Schäden, die auf vorsätzlichem oder grob fahrlässigem Verhalten beruhen.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">6. Schlussbestimmungen</h2>
                <p>
                  Es gilt deutsches Recht. Gerichtsstand ist, soweit zulässig, Heidelberg.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AGB;