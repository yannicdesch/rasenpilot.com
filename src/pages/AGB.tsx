import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MainNavigation from '@/components/MainNavigation';
import SEO from '@/components/SEO';

const AGB = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO noindex={true} title="AGB | Rasenpilot" description="Allgemeine Geschäftsbedingungen von Rasenpilot." canonical="/agb" />
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Allgemeine Geschäftsbedingungen (AGB)</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none space-y-6">
              <p className="text-sm text-muted-foreground">Stand: April 2026</p>

              <div>
                <h2 className="text-xl font-semibold mb-3">1. Geltungsbereich</h2>
                <p>
                  Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Dienstleistungen von Rasenpilot (Yannic Desch, Am Hocholzergraben 56, 69190 Walldorf), insbesondere die Nutzung der KI-basierten Rasenanalyse, Pflegepläne, Blog-Inhalte und Premium-Abonnements über die Website rasenpilot.com.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">2. Vertragsschluss</h2>
                <p>
                  Ein Vertrag über die Nutzung kostenpflichtiger Dienste kommt zustande, wenn Sie ein Abonnement (Premium oder Pro) über unsere Website abschließen und die Zahlung über unseren Zahlungsdienstleister Stripe erfolgreich verarbeitet wird. Die kostenlose Rasenanalyse kann ohne Registrierung genutzt werden.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">3. Leistungen von Rasenpilot</h2>
                <p>
                  Rasenpilot bietet KI-gestützte Empfehlungen für die Rasenpflege. Die Analysen basieren auf Bildverarbeitung durch künstliche Intelligenz (OpenAI GPT-4o Vision) und dienen als Orientierungshilfe. Eine Erfolgsgarantie wird nicht gegeben. Die Umsetzung der Empfehlungen erfolgt eigenverantwortlich durch den Nutzer.
                </p>
                <p>
                  Die verfügbaren Leistungen unterscheiden sich je nach gewähltem Tarif (Kostenlos, Premium, Pro). Details zu den enthaltenen Funktionen finden Sie auf unserer Preisseite.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">4. Preise und Zahlung</h2>
                <p>
                  Alle angegebenen Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer. Die Zahlung erfolgt über den Zahlungsdienstleister Stripe per Kreditkarte, Debitkarte oder andere von Stripe unterstützte Zahlungsmethoden.
                </p>
                <p>
                  Abonnements verlängern sich automatisch um den jeweiligen Abrechnungszeitraum (monatlich oder jährlich), sofern sie nicht vor Ablauf gekündigt werden.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">5. Kostenlose Testphase</h2>
                <p>
                  Premium- und Pro-Abonnements können mit einer 7-tägigen kostenlosen Testphase beginnen. Während der Testphase können Sie jederzeit kündigen, ohne dass Kosten entstehen. Wird nicht vor Ablauf der Testphase gekündigt, wird das Abonnement automatisch zum regulären Preis fortgesetzt.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">6. Kündigung</h2>
                <p>
                  Sie können Ihr Abonnement jederzeit ohne Angabe von Gründen kündigen. Die Kündigung wird zum Ende des aktuellen Abrechnungszeitraums wirksam. Bereits gezahlte Beträge für den laufenden Zeitraum werden nicht erstattet. Die Kündigung erfolgt über das Kundenportal (Stripe Customer Portal) oder per E-Mail an rasenpilot@gmail.com.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">7. Widerrufsrecht</h2>
                <p>
                  Als Verbraucher haben Sie ein 14-tägiges Widerrufsrecht. Der Widerruf ist in Textform (z. B. per E-Mail) an rasenpilot@gmail.com zu richten. Nach Beginn der Ausführung digitaler Inhalte (z. B. Durchführung einer KI-Analyse) kann das Widerrufsrecht erlöschen, sofern Sie dem ausdrücklich zugestimmt haben.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">8. Affiliate-Links und Produktempfehlungen</h2>
                <p>
                  Rasenpilot enthält Affiliate-Links, insbesondere zum Amazon PartnerNet (Amazon Associates). Wenn Sie über diese Links Produkte kaufen, erhält Rasenpilot eine Provision. Der Kaufpreis für Sie bleibt unverändert.
                </p>
                <p>
                  Produktempfehlungen basieren auf der KI-Analyse und dienen als Orientierung. Rasenpilot übernimmt keine Haftung für die Qualität, Verfügbarkeit oder Eignung der empfohlenen Produkte. Die Kaufentscheidung liegt beim Nutzer.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">9. Haftung</h2>
                <p>
                  Rasenpilot haftet nur für Schäden, die auf vorsätzlichem oder grob fahrlässigem Verhalten beruhen. Die Haftung für leichte Fahrlässigkeit ist ausgeschlossen, soweit keine wesentlichen Vertragspflichten betroffen sind. Die KI-generierten Empfehlungen stellen keine professionelle Gartenberatung dar und ersetzen nicht die Einschätzung eines Fachmanns.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">10. Datenschutz</h2>
                <p>
                  Informationen zur Verarbeitung personenbezogener Daten finden Sie in unserer{' '}
                  <a href="/datenschutz" className="text-green-600 hover:text-green-800">Datenschutzerklärung</a>.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">11. Schlussbestimmungen</h2>
                <p>
                  Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Gerichtsstand ist, soweit gesetzlich zulässig, Heidelberg. Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
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