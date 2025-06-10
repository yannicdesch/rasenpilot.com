
import React from 'react';
import { Button } from '@/components/ui/button';

interface RegistrationButtonsProps {
  onRegister: () => void;
  onContinueWithoutRegistration: () => void;
}

const RegistrationButtons: React.FC<RegistrationButtonsProps> = ({ 
  onRegister, 
  onContinueWithoutRegistration 
}) => {
  return (
    <div className="space-y-3 mt-4">
      <Button 
        onClick={onRegister}
        variant="outline"
        className="w-full border-green-600 text-green-700 hover:bg-green-50"
      >
        Zur vollständigen Registrierung
      </Button>
    </div>
  );
};

export default RegistrationButtons;
