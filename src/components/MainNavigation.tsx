
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Leaf, Menu, X, User, Camera, Calendar, Home, Crown, FileText, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLawn } from '@/context/LawnContext';
import { useSubscription } from '@/hooks/useSubscription';

const MainNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated: contextAuth } = useLawn();
  const { isPremium } = useSubscription();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      // Check admin status
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        setIsAdmin(profile?.role === 'admin');
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsAuthenticated(!!session);
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          setIsAdmin(profile?.role === 'admin');
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [contextAuth]);

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
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
            <Leaf className="h-8 w-8 text-green-600" />
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-green-800">Rasenpilot</span>
              {isPremium && <Badge className="bg-yellow-500 text-white"><Crown className="h-3 w-3 mr-1" />Premium</Badge>}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Public Blog Link */}
            <Link 
              to="/blog-overview" 
              className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                isActive('/blog-overview') 
                  ? 'bg-green-100 text-green-700' 
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <BookOpen size={18} />
              <span>Blog</span>
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                    isActive('/dashboard') 
                      ? 'bg-green-100 text-green-700' 
                      : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <Home size={18} />
                  <span>Dashboard</span>
                </Link>
                
                <Link 
                  to="/care-plan" 
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                    isActive('/care-plan') 
                      ? 'bg-green-100 text-green-700' 
                      : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <Calendar size={18} />
                  <span>Pflegeplan</span>
                </Link>
                
                <Link 
                  to="/onboarding" 
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                    isActive('/onboarding') 
                      ? 'bg-green-100 text-green-700' 
                      : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <Camera size={18} />
                  <span>Foto-Analyzer</span>
                </Link>
                
                {/* Admin Blog Management Link */}
                {isAdmin && (
                  <Link 
                    to="/blog" 
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                      isActive('/blog') 
                        ? 'bg-green-100 text-green-700' 
                        : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                    }`}
                  >
                    <FileText size={18} />
                    <span>Blog-Admin</span>
                  </Link>
                )}
                
                <Link 
                  to="/subscription" 
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                    isActive('/subscription') 
                      ? 'bg-green-100 text-green-700' 
                      : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <Crown size={18} />
                  <span>Mitgliedschaft</span>
                </Link>
                
                <Link 
                  to="/profile" 
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                    isActive('/profile') 
                      ? 'bg-green-100 text-green-700' 
                      : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <User size={18} />
                  <span>Profil</span>
                </Link>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSignOut}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Abmelden
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Anmelden
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="text-gray-700"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-2">
              {/* Public Blog Link */}
              <Link 
                to="/blog-overview" 
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive('/blog-overview') 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
                onClick={closeMenu}
              >
                <BookOpen size={18} />
                <span>Blog</span>
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      isActive('/dashboard') 
                        ? 'bg-green-100 text-green-700' 
                        : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                    }`}
                    onClick={closeMenu}
                  >
                    <Home size={18} />
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link 
                    to="/care-plan" 
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      isActive('/care-plan') 
                        ? 'bg-green-100 text-green-700' 
                        : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                    }`}
                    onClick={closeMenu}
                  >
                    <Calendar size={18} />
                    <span>Pflegeplan</span>
                  </Link>
                  
                  <Link 
                    to="/onboarding" 
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      isActive('/onboarding') 
                        ? 'bg-green-100 text-green-700' 
                        : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                    }`}
                    onClick={closeMenu}
                  >
                    <Camera size={18} />
                    <span>Foto-Analyzer</span>
                  </Link>
                  
                  {/* Admin Blog Management Link */}
                  {isAdmin && (
                    <Link 
                      to="/blog" 
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                        isActive('/blog') 
                          ? 'bg-green-100 text-green-700' 
                          : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                      }`}
                      onClick={closeMenu}
                    >
                      <FileText size={18} />
                      <span>Blog-Admin</span>
                    </Link>
                  )}
                  
                  <Link 
                    to="/subscription" 
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      isActive('/subscription') 
                        ? 'bg-green-100 text-green-700' 
                        : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                    }`}
                    onClick={closeMenu}
                  >
                    <Crown size={18} />
                    <span>Mitgliedschaft</span>
                  </Link>
                  
                  <Link 
                    to="/profile" 
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      isActive('/profile') 
                        ? 'bg-green-100 text-green-700' 
                        : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                    }`}
                    onClick={closeMenu}
                  >
                    <User size={18} />
                    <span>Profil</span>
                  </Link>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSignOut}
                    className="justify-start border-gray-300 text-gray-700 hover:bg-gray-50 w-full"
                  >
                    Abmelden
                  </Button>
                </>
              ) : (
                <Link to="/auth" onClick={closeMenu}>
                  <Button className="bg-green-600 hover:bg-green-700 text-white w-full">
                    Anmelden
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default MainNavigation;
