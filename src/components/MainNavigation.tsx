
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import NavigationLogo from './navigation/NavigationLogo';
import DesktopNavigation from './navigation/DesktopNavigation';
import MobileNavigation from './navigation/MobileNavigation';
import { useNavigationAuth } from './navigation/useNavigationAuth';

const MainNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useNavigationAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
    closeMenu();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <NavigationLogo onCloseMenu={closeMenu} />

          <DesktopNavigation
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            isActive={isActive}
            onCloseMenu={closeMenu}
            onSignOut={handleSignOut}
          />

          <MobileNavigation
            isMenuOpen={isMenuOpen}
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            isActive={isActive}
            onToggleMenu={toggleMenu}
            onCloseMenu={closeMenu}
            onSignOut={handleSignOut}
          />
        </div>
      </div>
    </nav>
  );
};

export default MainNavigation;
