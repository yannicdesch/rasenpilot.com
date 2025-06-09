
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
  profileName?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ profileName }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
      <div className="w-full md:w-2/3 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-green-800">
            Willkommen zurück{profileName ? `, ${profileName}` : ''}
          </h1>
          <Button 
            onClick={() => navigate('/profile')} 
            variant="outline" 
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            Profil bearbeiten
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
