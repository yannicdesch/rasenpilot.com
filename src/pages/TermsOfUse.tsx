
import React from 'react';
import { Link } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import SEO from '@/components/SEO';

const TermsOfUse = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Nutzungsbedingungen | Rasenpilot"
        description="Nutzungsbedingungen für die Verwendung des Rasenpilot-Services - Informieren Sie sich über die rechtlichen Rahmenbedingungen."
        canonical="https://www.rasenpilot.com/nutzungsbedingungen"
      />
      
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold text-green-800 mb-6">Nutzungsbedingungen</h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 italic mb-6">
              Stand: Mai 2025
            </p>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">1. Geltungsbereich</h2>
            <p>
              Die nachfolgenden Nutzungsbedingungen regeln das Vertragsverhältnis zwischen der Rasenpilot GmbH (nachfolgend "Anbieter") 
              und den Personen, die die Dienste des Anbieters nutzen (nachfolgend "Nutzer").
            </p>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">2. Leistungsbeschreibung</h2>
            <p>
              Der Anbieter stellt eine Online-Plattform zur Verfügung, über die registrierte Nutzer personalisierte Rasenpflegepläne erstellen, 
              Rasenanalysen durchführen und auf einen KI-gestützten Rasenberatungsservice zugreifen können.
            </p>
            <p>
              Der kostenlose Basis-Service umfasst die Erstellung eines 14-tägigen Pflegeplans ohne Registrierung. 
              Erweiterte Funktionen wie langfristige Pflegepläne, Fortschrittsverfolgung und erweiterte KI-Beratung 
              erfordern die Registrierung eines Benutzerkontos und können kostenpflichtig sein.
            </p>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">3. Registrierung</h2>
            <p>
              Die Registrierung ist kostenlos und für die Nutzung der erweiterten Funktionen erforderlich. 
              Der Nutzer verpflichtet sich, wahrheitsgemäße und vollständige Angaben zu machen.
            </p>
            <p>
              Der Nutzer ist für die Geheimhaltung seiner Zugangsdaten verantwortlich. Er haftet für alle Aktivitäten, 
              die unter seiner E-Mail-Adresse und seinem Passwort vorgenommen werden.
            </p>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">4. Pflichten des Nutzers</h2>
            <p>Der Nutzer verpflichtet sich:</p>
            <ul className="list-disc ml-6 mb-4">
              <li>keine falschen Angaben zu machen</li>
              <li>keine Inhalte hochzuladen, die gegen geltendes Recht verstoßen</li>
              <li>die Services nicht missbräuchlich zu verwenden</li>
              <li>keine Schadsoftware zu verbreiten</li>
              <li>keine automatisierten Systeme oder Bots für den Zugriff auf den Service zu verwenden</li>
              <li>die Rechte Dritter zu respektieren</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">5. Verfügbarkeit des Services</h2>
            <p>
              Der Anbieter bemüht sich um eine ständige Verfügbarkeit des Services, kann jedoch keine Garantie hierfür übernehmen. 
              Der Anbieter behält sich vor, den Service zeitweise zu unterbrechen, um Wartungsarbeiten durchzuführen.
            </p>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">6. Haftung und Gewährleistung</h2>
            <p>
              Die bereitgestellten Informationen und Pflegepläne basieren auf allgemeinen Empfehlungen und können nicht alle 
              individuellen Gegebenheiten berücksichtigen. Der Anbieter übernimmt keine Garantie für den Erfolg der empfohlenen Maßnahmen.
            </p>
            <p>
              Der Anbieter haftet nicht für Schäden, die durch unsachgemäße Anwendung der empfohlenen Maßnahmen entstehen. 
              Die Haftung für leichte Fahrlässigkeit ist ausgeschlossen, soweit gesetzlich zulässig.
            </p>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">7. Urheberrecht und Nutzungsrechte</h2>
            <p>
              Sämtliche Inhalte, Grafiken, Designs und Software auf dieser Website unterliegen dem Urheberrecht des Anbieters 
              oder der jeweiligen Rechteinhaber. Eine Nutzung, Vervielfältigung oder Verbreitung bedarf der ausdrücklichen Zustimmung.
            </p>
            <p>
              Der Nutzer räumt dem Anbieter ein einfaches, weltweites, unentgeltliches Nutzungsrecht an den von ihm hochgeladenen 
              Inhalten ein, soweit dies für die Erbringung des Services erforderlich ist.
            </p>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">8. Laufzeit und Kündigung</h2>
            <p>
              Das Nutzungsverhältnis kann vom Nutzer jederzeit durch Löschen des Accounts beendet werden. 
              Der Anbieter kann das Nutzungsverhältnis mit einer Frist von 14 Tagen kündigen.
            </p>
            <p>
              Bei schwerwiegenden Verstößen gegen diese Nutzungsbedingungen kann der Anbieter das Nutzungsverhältnis 
              fristlos kündigen und den Account sperren.
            </p>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">9. Änderungen der Nutzungsbedingungen</h2>
            <p>
              Der Anbieter behält sich vor, diese Nutzungsbedingungen zu ändern. Über wesentliche Änderungen wird der 
              Anbieter die Nutzer informieren. Die weitere Nutzung des Services nach einer Änderung gilt als Zustimmung zu den geänderten Nutzungsbedingungen.
            </p>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">10. Schlussbestimmungen</h2>
            <p>
              Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
            </p>
            <p>
              Erfüllungsort und ausschließlicher Gerichtsstand ist, soweit gesetzlich zulässig, der Sitz des Anbieters.
            </p>
            <p>
              Sollten einzelne Bestimmungen dieser Nutzungsbedingungen unwirksam sein oder werden, so berührt dies die 
              Wirksamkeit der übrigen Bestimmungen nicht.
            </p>
          </div>
        </div>
      </div>
      
      <footer className="bg-white py-6 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
          <div className="mt-2 flex justify-center gap-4">
            <Link to="/impressum" className="text-gray-600 hover:text-green-600">Impressum</Link>
            <span className="text-gray-400">|</span>
            <Link to="/datenschutz" className="text-gray-600 hover:text-green-600">Datenschutz</Link>
            <span className="text-gray-400">|</span>
            <Link to="/nutzungsbedingungen" className="text-gray-600 hover:text-green-600">Nutzungsbedingungen</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsOfUse;

