
import React from 'react';

const FreePlanHero: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-green-100 to-green-50 py-12 md:py-16 border-b border-green-200">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-4">
            Dein persönlicher Rasenpflege-Plan – in 30 Sekunden, kostenlos
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Basierend auf deinem Standort, Rasentyp & Ziel. Sofort starten – ohne Anmeldung.
          </p>
          <p className="text-sm text-green-600 font-medium">
            Registriere dich, um deinen individuellen Pflegeplan zu speichern und jederzeit darauf zuzugreifen.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FreePlanHero;
