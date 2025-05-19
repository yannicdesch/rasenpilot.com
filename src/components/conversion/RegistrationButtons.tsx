
import React from 'react';
import { Button } from "@/components/ui/button";
import { trackRegistrationStep, trackRegistrationAbandoned } from '@/lib/analytics';

interface RegistrationButtonsProps {
  onRegister: () => void;
  onContinueWithoutRegistration: () => void;
}

const RegistrationButtons: React.FC<RegistrationButtonsProps> = ({ 
  onRegister, 
  onContinueWithoutRegistration 
}) => {
  const handleNavToRegister = () => {
    trackRegistrationStep('full_register_selected');
    onRegister();
  };

  const handleContinueWithoutReg = () => {
    trackRegistrationAbandoned('conversion_prompt');
    onContinueWithoutRegistration();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <Button 
        className="py-6 text-lg bg-green-600 hover:bg-green-700" 
        onClick={handleNavToRegister}
      >
        Vollständig registrieren
      </Button>
      <Button 
        variant="outline"
        className="border-green-200"
        onClick={handleContinueWithoutReg}
      >
        Ohne Registrierung fortfahren
      </Button>
    </div>
  );
};

export default RegistrationButtons;
