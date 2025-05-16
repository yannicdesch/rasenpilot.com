
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <div 
      className={`flex items-center gap-2 cursor-pointer ${className}`}
      onClick={() => navigate('/')}
    >
      <div className="bg-green-100 p-1.5 rounded-full">
        <Leaf className="h-6 w-6 text-green-600" />
      </div>
      <span className="text-xl font-bold text-green-700">Rasenpilot</span>
    </div>
  );
};

export default Logo;
