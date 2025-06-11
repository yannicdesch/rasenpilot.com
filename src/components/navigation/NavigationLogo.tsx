
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Leaf, Crown } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface NavigationLogoProps {
  onCloseMenu: () => void;
}

const NavigationLogo: React.FC<NavigationLogoProps> = ({ onCloseMenu }) => {
  const { isPremium } = useSubscription();

  return (
    <Link to="/" className="flex items-center space-x-2" onClick={onCloseMenu}>
      <Leaf className="h-8 w-8 text-green-600" />
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-green-800">Rasenpilot</span>
        {isPremium && (
          <Badge className="bg-yellow-500 text-white">
            <Crown className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        )}
      </div>
    </Link>
  );
};

export default NavigationLogo;
