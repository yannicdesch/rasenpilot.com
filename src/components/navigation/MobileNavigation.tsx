
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import NavigationLinks from './NavigationLinks';

interface MobileNavigationProps {
  isMenuOpen: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isActive: (path: string) => boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onSignOut: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isMenuOpen,
  isAuthenticated,
  isAdmin,
  isActive,
  onToggleMenu,
  onCloseMenu,
  onSignOut
}) => {
  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleMenu}
          className="text-gray-700"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 py-4">
          <div className="flex flex-col space-y-2">
            <NavigationLinks
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              isActive={isActive}
              onCloseMenu={onCloseMenu}
              onSignOut={onSignOut}
              isMobile={true}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNavigation;
