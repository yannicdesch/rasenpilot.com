import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Leaf, Menu, X } from 'lucide-react';
import { useLawn } from '@/context/LawnContext';
import { clearAuthCache, fetchUserData } from '@/utils/optimizedLawnProfileUtils';

const MainNavigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated, setUserData, setProfile, setTemporaryProfile } = useLawn();
  const [isOnboardingPage, setIsOnboardingPage] = useState(false);

  useEffect(() => {
    setIsOnboardingPage(location.pathname.startsWith('/auth') || location.pathname.startsWith('/onboarding'));
  }, [location.pathname]);

  const handleSignOut = async () => {
    console.log('Signing out...');
    
    // Clear local storage
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.token_expiry');
    localStorage.removeItem('supabase.auth.refresh_token');
    localStorage.removeItem('supabase.auth.user');
    localStorage.removeItem('freeAnalysisUsed');
    
    // Clear LawnContext state
    setIsAuthenticated(false);
    setUserData(null);
    setProfile(null);
    setTemporaryProfile(null);
    clearAuthCache();
    
    // Redirect to home page
    navigate('/');
  };

  return (
    <nav className={`bg-white border-b border-gray-200 ${isOnboardingPage ? 'shadow-sm' : 'shadow-md'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-green-700">Rasenpilot</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!isOnboardingPage && (
              <>
                <NavLink to="/features" className="text-gray-600 hover:text-green-600 transition-colors">
                  Features
                </NavLink>
                <NavLink to="/free-lawn-analysis" className="text-gray-600 hover:text-green-600 transition-colors">
                  Kostenlose Analyse
                </NavLink>
                <NavLink to="/pricing" className="text-gray-600 hover:text-green-600 transition-colors">
                  Preise
                </NavLink>
                <NavLink to="/blog" className="text-gray-600 hover:text-green-600 transition-colors">
                  Blog
                </NavLink>
              </>
            )}
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <NavLink to="/dashboard" className="text-gray-600 hover:text-green-600 transition-colors">
                  Dashboard
                </NavLink>
                <NavLink to="/lawn-analysis" className="text-gray-600 hover:text-green-600 transition-colors">
                  KI-Analyse
                </NavLink>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  Abmelden
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
                    Anmelden
                  </Button>
                </Link>
                <Link to="/auth?tab=register">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    Registrieren
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              {!isOnboardingPage && (
                <>
                  <NavLink to="/features" className="text-gray-600 hover:text-green-600 transition-colors py-2">
                    Features
                  </NavLink>
                  <NavLink to="/free-lawn-analysis" className="text-gray-600 hover:text-green-600 transition-colors py-2">
                    Kostenlose Analyse
                  </NavLink>
                  <NavLink to="/pricing" className="text-gray-600 hover:text-green-600 transition-colors py-2">
                    Preise
                  </NavLink>
                  <NavLink to="/blog" className="text-gray-600 hover:text-green-600 transition-colors py-2">
                    Blog
                  </NavLink>
                </>
              )}
              
              {isAuthenticated ? (
                <>
                  <NavLink to="/dashboard" className="text-gray-600 hover:text-green-600 transition-colors py-2">
                    Dashboard
                  </NavLink>
                  <NavLink to="/lawn-analysis" className="text-gray-600 hover:text-green-600 transition-colors py-2">
                    KI-Analyse
                  </NavLink>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                    className="self-start border-green-200 text-green-700 hover:bg-green-50"
                  >
                    Abmelden
                  </Button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link to="/auth">
                    <Button variant="outline" size="sm" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                      Anmelden
                    </Button>
                  </Link>
                  <Link to="/auth?tab=register">
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Registrieren
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default MainNavigation;
