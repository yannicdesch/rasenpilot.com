
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Home, Calendar, Camera, FileText, Crown, User } from 'lucide-react';

interface NavigationLinksProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isActive: (path: string) => boolean;
  onCloseMenu: () => void;
  onSignOut: () => void;
  isMobile?: boolean;
}

const NavigationLinks: React.FC<NavigationLinksProps> = ({
  isAuthenticated,
  isAdmin,
  isActive,
  onCloseMenu,
  onSignOut,
  isMobile = false
}) => {
  const linkClassName = (path: string) => 
    `flex items-center ${isMobile ? 'space-x-2' : 'space-x-1'} px-3 py-2 rounded-md transition-colors ${
      isActive(path) 
        ? 'bg-green-100 text-green-700' 
        : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
    }`;

  return (
    <>
      {/* Public Blog Link */}
      <Link 
        to="/blog-overview" 
        className={linkClassName('/blog-overview')}
        onClick={onCloseMenu}
      >
        <BookOpen size={18} />
        <span>Blog</span>
      </Link>
      
      {isAuthenticated ? (
        <>
          <Link 
            to="/dashboard" 
            className={linkClassName('/dashboard')}
            onClick={onCloseMenu}
          >
            <Home size={18} />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to="/care-plan" 
            className={linkClassName('/care-plan')}
            onClick={onCloseMenu}
          >
            <Calendar size={18} />
            <span>Pflegeplan</span>
          </Link>
          
          <Link 
            to="/onboarding" 
            className={linkClassName('/onboarding')}
            onClick={onCloseMenu}
          >
            <Camera size={18} />
            <span>Foto-Analyzer</span>
          </Link>
          
          {/* Admin Blog Management Link */}
          {isAdmin && (
            <Link 
              to="/blog" 
              className={linkClassName('/blog')}
              onClick={onCloseMenu}
            >
              <FileText size={18} />
              <span>Blog-Admin</span>
            </Link>
          )}
          
          <Link 
            to="/subscription" 
            className={linkClassName('/subscription')}
            onClick={onCloseMenu}
          >
            <Crown size={18} />
            <span>Mitgliedschaft</span>
          </Link>
          
          <Link 
            to="/profile" 
            className={linkClassName('/profile')}
            onClick={onCloseMenu}
          >
            <User size={18} />
            <span>Profil</span>
          </Link>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={onSignOut}
            className={`${isMobile ? 'justify-start w-full' : ''} border-gray-300 text-gray-700 hover:bg-gray-50`}
          >
            Abmelden
          </Button>
        </>
      ) : (
        <Link to="/auth" onClick={onCloseMenu}>
          <Button className={`bg-green-600 hover:bg-green-700 text-white ${isMobile ? 'w-full' : ''}`}>
            Anmelden
          </Button>
        </Link>
      )}
    </>
  );
};

export default NavigationLinks;
