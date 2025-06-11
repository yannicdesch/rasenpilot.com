
import React from 'react';
import NavigationLinks from './NavigationLinks';

interface DesktopNavigationProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isActive: (path: string) => boolean;
  onCloseMenu: () => void;
  onSignOut: () => void;
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  isAuthenticated,
  isAdmin,
  isActive,
  onCloseMenu,
  onSignOut
}) => {
  return (
    <div className="hidden md:flex items-center space-x-6">
      <NavigationLinks
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        isActive={isActive}
        onCloseMenu={onCloseMenu}
        onSignOut={onSignOut}
        isMobile={false}
      />
    </div>
  );
};

export default DesktopNavigation;
