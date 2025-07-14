import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MainNavigation from '@/components/MainNavigation';

const Datenschutz = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Datenschutzerklärung</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none space-y-6">
              <p>
                Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Wir verarbeiten Ihre Daten daher ausschließlich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, TMG).
              </p>

              <div>
                <h2 className="text-xl font-semibold mb-3">Verantwortlicher</h2>
                <p>
                  Rasenpilot<br />
                  Yannic Desch<br />
                  Am Hocholzergraben 56<br />
                  69190 Walldorf<br />
                  E-Mail: <a href="mailto:info@rasenpilot.com" className="text-green-600 hover:text-green-800">info@rasenpilot.com</a>
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Erhebung und Verarbeitung personenbezogener Daten</h2>
                <p>
                  Wir verarbeiten Ihre Daten zur Nutzung unserer Plattform, Analyseanfragen und Kontaktformulare. Die Verarbeitung erfolgt auf Basis Ihrer Einwilligung oder vertraglicher Notwendigkeit.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Cookies</h2>
                <p>
                  Unsere Website verwendet Cookies, um die Benutzererfahrung zu verbessern. Sie können die Speicherung von Cookies in Ihrem Browser deaktivieren.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Analyse-Tools</h2>
                <p>
                  Wir nutzen Google Analytics zur anonymisierten Auswertung der Nutzung unserer Website. Die Daten dienen ausschließlich zur Verbesserung unseres Angebots.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Ihre Rechte</h2>
                <p>
                  Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung und Widerspruch. Kontaktieren Sie uns unter <a href="mailto:info@rasenpilot.com" className="text-green-600 hover:text-green-800">info@rasenpilot.com</a>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Datenschutz;