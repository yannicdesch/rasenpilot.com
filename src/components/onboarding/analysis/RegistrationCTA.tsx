
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Leaf } from 'lucide-react';

interface RegistrationCTAProps {
  onRegister: () => void;
}

const RegistrationCTA: React.FC<RegistrationCTAProps> = ({ onRegister }) => {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center mb-4">
            <Leaf className="h-8 w-8 text-green-600 mr-2" />
            <h3 className="text-xl font-semibold text-green-800">
              Werde Rasen-Experte mit Premium-Features
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3">✅ Premium-Analyse:</h4>
              <ul className="text-sm text-gray-700 space-y-1 text-left">
                <li>• Detaillierte Bodenanalyse-Empfehlungen</li>
                <li>• Monatliche Pflegepläne</li>
                <li>• Produktvergleiche mit Preisen</li>
                <li>• Wetterbasierte Anpassungen</li>
                <li>• Foto-Verlaufstracking</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-600 mb-3">❌ Basis-Version:</h4>
              <ul className="text-sm text-gray-600 space-y-1 text-left">
                <li>• Nur eine Analyse pro Gerät</li>
                <li>• Grundlegende Empfehlungen</li>
                <li>• Keine Verlaufsspeicherung</li>
                <li>• Keine Updates</li>
              </ul>
            </div>
          </div>

          <Button 
            onClick={onRegister}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Jetzt kostenlos Premium testen
          </Button>
          
          <p className="text-xs text-gray-600 mt-2">
            30 Tage kostenlos • Jederzeit kündbar • Keine versteckten Kosten
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegistrationCTA;
