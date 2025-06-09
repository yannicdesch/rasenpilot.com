
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
        className="flex items-center gap-1.5 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <div className="bg-green-100 p-1 rounded-full">
          <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
        </div>
        <span className="text-base sm:text-lg font-bold text-green-700">Rasenpilot</span>
      </div>
      
      {showTagline && (
        <p className={`text-xs text-green-600 mt-0.5 ${isMobile ? 'ml-0.5' : 'ml-1'}`}>
          Weltweit erste KI für Rasen-Enthusiasten
        </p>
      )}
    </div>
  );
};

export default Logo;
