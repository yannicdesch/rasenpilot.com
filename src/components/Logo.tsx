
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', showTagline = false }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className={`flex flex-col ${className}`}>
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <div className="bg-green-100 p-1.5 rounded-full">
          <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
        </div>
        <span className="text-lg sm:text-xl font-bold text-green-700">Rasenpilot</span>
      </div>
      
      {showTagline && (
        <p className={`text-xs sm:text-sm text-green-600 mt-1 ${isMobile ? 'ml-1' : 'ml-2'}`}>
          Weltweit erste KI für Rasen-Enthusiasten
        </p>
      )}
    </div>
  );
};

export default Logo;
