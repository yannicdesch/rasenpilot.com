
import React from 'react';
import { Link } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import SEO from '@/components/SEO';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Datenschutz | Rasenpilot"
        description="Datenschutzerklärung von Rasenpilot - Erfahren Sie, wie wir Ihre Daten schützen und verwenden."
        canonical="/datenschutz"
      />
      
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold text-green-800 mb-6">Datenschutzerklärung</h1>
          
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">1. Verantwortlicher</h2>
            <p>
              Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br />
              Rasenpilot GmbH<br />
              Musterstraße 123<br />
              12345 Musterstadt<br />
              Deutschland
            </p>
            <p>
              E-Mail: info@rasenpilot.de<br />
              Telefon: +49 123 456789
            </p>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">2. Erhebung und Verarbeitung personenbezogener Daten</h2>
            <p>
              Wenn Sie unsere Website besuchen, erheben wir automatisch bestimmte Informationen über Ihr Gerät, wie z.B. Ihre IP-Adresse, 
              Ihren Browser-Typ, bevorzugte Sprache, Zugriffszeitpunkte und Verweisseiten. Diese Informationen werden benötigt, um die korrekte Darstellung 
              unserer Website zu gewährleisten und die Sicherheit unseres Angebots zu verbessern.
            </p>
            <p>
              Wenn Sie sich für einen Account registrieren oder den Rasenpilot-Service nutzen, erheben wir zusätzlich folgende Daten:
            </p>
            <ul className="list-disc ml-6 mb-4">
              <li>Name und E-Mail-Adresse</li>
              <li>Adressdaten (falls angegeben)</li>
              <li>Rasenspezifische Informationen (Größe, Typ, Standort)</li>
              <li>Von Ihnen hochgeladene Bilder</li>
              <li>Nutzungsdaten und Interaktionen mit dem Service</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">3. Zwecke der Datenverarbeitung</h2>
            <p>Wir verwenden Ihre Daten, um:</p>
            <ul className="list-disc ml-6 mb-4">
              <li>Ihnen unsere Services zur Verfügung zu stellen und zu verbessern</li>
              <li>Ihren personalisierten Rasenpflegeplan zu erstellen</li>
              <li>Mit Ihnen zu kommunizieren</li>
              <li>Ihre Anfragen zu bearbeiten</li>
              <li>Die Sicherheit unserer Services zu gewährleisten</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">4. Cookies</h2>
            <p>
              Wir verwenden Cookies, um unsere Website benutzerfreundlicher zu gestalten. Einige Cookies bleiben auf Ihrem Gerät gespeichert, 
              bis Sie diese löschen. Diese ermöglichen es uns, Ihren Browser beim nächsten Besuch wiederzuerkennen.
            </p>
            <p>
              Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und Cookies nur im Einzelfall erlauben, 
              die Annahme von Cookies für bestimmte Fälle oder generell ausschließen sowie das automatische Löschen der Cookies beim Schließen des Browsers aktivieren. 
              Bei der Deaktivierung von Cookies kann die Funktionalität unserer Website eingeschränkt sein.
            </p>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">5. Google Analytics</h2>
            <p>
              Diese Website nutzt Google Analytics, einen Webanalysedienst der Google Inc. („Google"). Google Analytics verwendet sog. „Cookies", 
              Textdateien, die auf Ihrem Computer gespeichert werden und die eine Analyse der Benutzung der Website durch Sie ermöglichen. 
              Die durch den Cookie erzeugten Informationen über Ihre Benutzung dieser Website werden in der Regel an einen Server von Google 
              in den USA übertragen und dort gespeichert.
            </p>
            <p>
              Mehr Informationen zum Umgang mit Nutzerdaten bei Google Analytics finden Sie in der Datenschutzerklärung von Google: 
              <a href="https://support.google.com/analytics/answer/6004245?hl=de" className="text-green-600 hover:underline">
                https://support.google.com/analytics/answer/6004245?hl=de
              </a>
            </p>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">6. Betroffenenrechte</h2>
            <p>Sie haben folgende Rechte gegenüber uns bezüglich Ihrer personenbezogenen Daten:</p>
            <ul className="list-disc ml-6 mb-4">
              <li>Recht auf Auskunft</li>
              <li>Recht auf Berichtigung oder Löschung</li>
              <li>Recht auf Einschränkung der Verarbeitung</li>
              <li>Recht auf Widerspruch gegen die Verarbeitung</li>
              <li>Recht auf Datenübertragbarkeit</li>
            </ul>
            <p>
              Sie haben zudem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen 
              Daten durch uns zu beschweren.
            </p>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">7. Datensicherheit</h2>
            <p>
              Wir sichern unsere Website und sonstigen Systeme durch technische und organisatorische Maßnahmen gegen Verlust, 
              Zerstörung, Zugriff, Veränderung oder Verbreitung Ihrer Daten durch unbefugte Personen. 
              Trotz regelmäßiger Kontrollen ist ein vollständiger Schutz gegen alle Gefahren jedoch nicht möglich.
            </p>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">8. Aktualität und Änderung dieser Datenschutzerklärung</h2>
            <p>
              Diese Datenschutzerklärung ist aktuell gültig und hat den Stand Mai 2025. Aufgrund geänderter gesetzlicher bzw. 
              behördlicher Vorgaben kann es notwendig werden, diese Datenschutzerklärung anzupassen. 
              Die jeweils aktuelle Datenschutzerklärung kann jederzeit auf dieser Website abgerufen werden.
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

export default PrivacyPolicy;

