
import React from 'react';
import { Link } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import { Helmet } from 'react-helmet-async';

const Imprint = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Impressum | Rasenpilot</title>
        <meta name="description" content="Impressum der Rasenpilot GmbH - Kontaktinformationen und rechtliche Angaben." />
      </Helmet>
      
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold text-green-800 mb-6">Impressum</h1>
          
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">Angaben gemäß § 5 TMG</h2>
            <p>
              Rasenpilot GmbH<br />
              Musterstraße 123<br />
              12345 Musterstadt<br />
              Deutschland
            </p>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">Kontakt</h2>
            <p>
              Telefon: +49 123 456789<br />
              E-Mail: info@rasenpilot.com
            </p>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">Vertretungsberechtigte Person</h2>
            <p>
              Max Mustermann, Geschäftsführer
            </p>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">Registereintrag</h2>
            <p>
              Eintragung im Handelsregister.<br />
              Registergericht: Amtsgericht Musterstadt<br />
              Registernummer: HRB 12345
            </p>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">Umsatzsteuer-ID</h2>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
              DE123456789
            </p>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">Inhaltlich Verantwortlicher gemäß § 55 RStV</h2>
            <p>
              Max Mustermann (Anschrift wie oben)
            </p>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">EU-Streitschlichtung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
              <a href="https://ec.europa.eu/consumers/odr/" className="text-green-600 hover:underline">
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p>
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">Verbraucherstreitbeilegung/Universalschlichtungsstelle</h2>
            <p>
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">Haftung für Inhalte</h2>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den 
              allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht 
              verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen 
              zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
            <p>
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen 
              Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem 
              Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden 
              Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </p>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">Haftung für Links</h2>
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. 
              Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der 
              verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten 
              Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige 
              Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
            </p>
            <p>
              Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer 
              Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
            
            <h2 className="text-xl font-semibold text-green-700 mt-6 mb-3">Urheberrecht</h2>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen 
              Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der 
              Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. 
              Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
            </p>
            <p>
              Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. 
              Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung 
              aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen 
              werden wir derartige Inhalte umgehend entfernen.
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

export default Imprint;
