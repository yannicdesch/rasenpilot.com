
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Leaf, Menu, X, BookOpen, Trophy, Settings, Camera, Crown, User, LogOut, LogIn } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';

const MainNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isPremium } = useSubscription();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-green-800">Rasenpilot</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                isActive('/') 
                  ? 'bg-green-100 text-green-700' 
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <span>Startseite</span>
            </Link>
            
            
            <Link 
              to="/lawn-analysis" 
              className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                isActive('/lawn-analysis') 
                  ? 'bg-green-100 text-green-700' 
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <Camera size={18} />
              <span>KI-Analyse</span>
            </Link>
            
            <Link 
              to="/blog-overview" 
              className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                isActive('/blog-overview') 
                  ? 'bg-green-100 text-green-700' 
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <BookOpen size={18} />
              <span>Ratgeber</span>
            </Link>
            
            <Link 
              to="/highscore" 
              className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                isActive('/highscore') 
                  ? 'bg-green-100 text-green-700' 
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <Trophy size={18} />
              <span>Bestenliste</span>
            </Link>

            {user && isPremium && (
              <Link 
                to="/premium-dashboard" 
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  isActive('/premium-dashboard') 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'text-yellow-700 hover:text-yellow-600 hover:bg-yellow-50'
                }`}
              >
                <Crown size={18} />
                <span>Premium</span>
              </Link>
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden lg:inline">{user.email?.split('@')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link to="/account-settings">Konto-Einstellungen</Link>
                  </DropdownMenuItem>
                  {isPremium && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/premium-dashboard">Premium Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/subscription/manage">Abonnement verwalten</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost">
                  <Link to="/auth">Anmelden</Link>
                </Button>
                <Button asChild>
                  <Link to="/subscription">Premium</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-green-600 text-green-600 hover:bg-green-50 p-3 shadow-sm"
                >
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-white">
                <div className="flex flex-col h-full">
                  {/* Logo in mobile menu */}
                  <div className="flex items-center space-x-2 mb-8 pt-4">
                    <Leaf className="h-8 w-8 text-green-600" />
                    <span className="text-xl font-bold text-green-800">Rasenpilot</span>
                  </div>
                  
                  {/* Navigation Links */}
                  <div className="flex flex-col space-y-1">
                    <Link 
                      to="/" 
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-lg ${
                        isActive('/') 
                          ? 'bg-green-100 text-green-700 font-medium' 
                          : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                      }`}
                      onClick={closeMenu}
                    >
                      <Leaf size={20} />
                      <span>Startseite</span>
                    </Link>
                    
                    
                    <Link 
                      to="/lawn-analysis" 
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-lg ${
                        isActive('/lawn-analysis') 
                          ? 'bg-green-100 text-green-700 font-medium' 
                          : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                      }`}
                      onClick={closeMenu}
                    >
                      <Camera size={20} />
                      <span>KI-Analyse</span>
                    </Link>
                    
                    <Link 
                      to="/blog-overview" 
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-lg ${
                        isActive('/blog-overview') 
                          ? 'bg-green-100 text-green-700 font-medium' 
                          : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                      }`}
                      onClick={closeMenu}
                    >
                      <BookOpen size={20} />
                      <span>Ratgeber</span>
                    </Link>
                    
                    <Link 
                      to="/highscore" 
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-lg ${
                        isActive('/highscore') 
                          ? 'bg-green-100 text-green-700 font-medium' 
                          : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                      }`}
                      onClick={closeMenu}
                    >
                      <Trophy size={20} />
                      <span>Bestenliste</span>
                    </Link>

                    {/* Premium/Login Section */}
                    {user ? (
                      <>
                        {isPremium ? (
                          <>
                            <Link 
                              to="/premium-dashboard" 
                              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-lg ${
                                isActive('/premium-dashboard') 
                                  ? 'bg-yellow-100 text-yellow-700 font-medium' 
                                  : 'text-yellow-700 hover:text-yellow-600 hover:bg-yellow-50'
                              }`}
                              onClick={closeMenu}
                            >
                              <Crown size={20} />
                              <span>Premium</span>
                            </Link>
                            <Link 
                              to="/subscription/manage" 
                              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-lg ${
                                isActive('/subscription/manage') 
                                  ? 'bg-green-100 text-green-700 font-medium' 
                                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                              }`}
                              onClick={closeMenu}
                            >
                              <Settings size={20} />
                              <span>Abonnement</span>
                            </Link>
                          </>
                        ) : (
                          <Link 
                            to="/subscription" 
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-lg ${
                              isActive('/subscription') 
                                ? 'bg-yellow-100 text-yellow-700 font-medium' 
                                : 'text-yellow-700 hover:text-yellow-600 hover:bg-yellow-50'
                            }`}
                            onClick={closeMenu}
                          >
                            <Crown size={20} />
                            <span>Premium werden</span>
                          </Link>
                        )}
                        
                        {/* Admin link only for admins */}
                        {isAdmin && (
                          <Link
                            to="/admin-panel" 
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-lg ${
                              isActive('/admin-panel') 
                                ? 'bg-green-100 text-green-700 font-medium' 
                                : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                            }`}
                            onClick={closeMenu}
                          >
                            <Settings size={20} />
                            <span>Admin</span>
                          </Link>
                        )}

                        {/* User Menu */}
                        <div className="border-t pt-4 mt-4">
                          <Link 
                            to="/account-settings" 
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-lg text-gray-700 hover:text-green-600 hover:bg-green-50"
                            onClick={closeMenu}
                          >
                            <User size={20} />
                            <span>Konto</span>
                          </Link>
                          <button
                            onClick={() => {
                              signOut();
                              closeMenu();
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-lg text-gray-700 hover:text-green-600 hover:bg-green-50"
                          >
                            <LogOut size={20} />
                            <span>Abmelden</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="border-t pt-4 mt-4 space-y-2">
                        <Link 
                          to="/auth" 
                          className="flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors text-lg bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 font-medium"
                          onClick={closeMenu}
                        >
                          <LogIn size={20} />
                          <span>Anmelden</span>
                        </Link>
                        <Link 
                          to="/subscription" 
                          className="flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors text-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 font-medium"
                          onClick={closeMenu}
                        >
                          <Crown size={20} />
                          <span>Premium werden</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MainNavigation;
