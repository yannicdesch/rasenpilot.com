
import React from 'react';

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-gray-50" id="so-funktionierts">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Drei einfache Schritte zum <span className="text-green-600">Traumrasen</span>
          </h2>
          <p className="text-lg text-gray-700">
            Unsere revolutionäre KI-Technologie macht Rasenpflege so einfach wie nie zuvor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 shadow-lg">
              <span className="text-white text-3xl font-bold">1</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Foto hochladen</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Laden Sie einfach ein Foto Ihres Rasens hoch. Unsere KI analysiert sofort über 200 mögliche Probleme, 
              Krankheiten und Nährstoffmängel mit wissenschaftlicher Präzision.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg">
              <span className="text-white text-3xl font-bold">2</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">KI-Analyse erhalten</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              In nur 60 Sekunden erhalten Sie eine detaillierte Diagnose mit konkreten Lösungsvorschlägen, 
              Produktempfehlungen und einem personalisierten Behandlungsplan.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg">
              <span className="text-white text-3xl font-bold">3</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Erfolg garantiert</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Befolgen Sie unseren wissenschaftlich fundierten Pflegeplan und erleben Sie sichtbare Verbesserungen 
              in nur 14 Tagen - garantiert!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
