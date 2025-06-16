
import React from 'react';

interface WelcomeHeaderProps {
  profileName?: string;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ profileName }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-2">
        Willkommen{profileName ? `, ${profileName}` : ''}!
      </h1>
      <p className="text-gray-600">
        Hier ist Ihr persönliches Rasen-Dashboard
      </p>
    </div>
  );
};

export default WelcomeHeader;
