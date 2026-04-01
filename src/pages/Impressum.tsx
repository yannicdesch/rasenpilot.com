import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MainNavigation from '@/components/MainNavigation';
import SEO from '@/components/SEO';

const Impressum = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title="Impressum | Rasenpilot" description="Impressum und Kontaktdaten von Rasenpilot." canonical="/impressum" />
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Impressum</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none space-y-6">
              <div>
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
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Haftungsausschluss</h2>

                <h3 className="text-lg font-semibold mb-2">Haftung für Inhalte</h3>
                <p>
                  Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                </p>

                <h3 className="text-lg font-semibold mb-2 mt-4">Haftung für Links</h3>
                <p>
                  Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                </p>

                <h3 className="text-lg font-semibold mb-2 mt-4">Urheberrecht</h3>
                <p>
                  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Hinweis zu Affiliate-Links</h2>
                <p>
                  Diese Website enthält sogenannte Affiliate-Links zu externen Anbietern, insbesondere zu Amazon (Amazon PartnerNet / Amazon Associates). Wenn Sie über diese Links ein Produkt kaufen, erhalten wir eine kleine Provision. Der Preis für Sie ändert sich dadurch nicht. Diese Einnahmen helfen uns, die Website und den kostenlosen Rasenanalyse-Service zu finanzieren.
                </p>
                <p>
                  Affiliate-Links sind auf unserer Website entsprechend gekennzeichnet. Die Produktempfehlungen basieren auf unserer KI-Analyse und dienen als Hilfestellung — eine Kaufverpflichtung besteht nicht.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">EU-Streitschlichtung</h2>
                <p>
                  Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
                  <a href="https://ec.europa.eu/consumers/odr/" className="text-green-600 hover:text-green-800" target="_blank" rel="noopener noreferrer">
                    https://ec.europa.eu/consumers/odr/
                  </a>.
                </p>
                <p>
                  Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Impressum;