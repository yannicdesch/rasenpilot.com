
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Leaf, Menu, BookOpen, Trophy, Settings, Camera, Crown, User, LogOut, LogIn, CloudSun, MessageCircle, LayoutDashboard, CreditCard, Shield, History, Calendar, Flame } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { useAnalysisStreak } from '@/hooks/useAnalysisStreak';

const MainNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isPremium } = useSubscription();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { streak, streakAboutToBreak } = useAnalysisStreak();

  const closeMenu = () => setIsMenuOpen(false);
  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string, premium = false) =>
    `flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
      isActive(path)
        ? premium ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
        : premium ? 'text-yellow-700 hover:text-yellow-600 hover:bg-yellow-50' : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
    }`;

  const mobileLinkClass = (path: string, premium = false) =>
    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-lg ${
      isActive(path)
        ? premium ? 'bg-yellow-100 text-yellow-700 font-medium' : 'bg-green-100 text-green-700 font-medium'
        : premium ? 'text-yellow-700 hover:text-yellow-600 hover:bg-yellow-50' : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
    }`;

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
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className={navLinkClass('/')}>
              <span>Startseite</span>
            </Link>
            
            <Link to="/lawn-analysis" className={navLinkClass('/lawn-analysis')}>
              <Camera size={18} />
              <span>KI-Analyse</span>
            </Link>
            
            <Link to="/blog-overview" className={navLinkClass('/blog-overview')}>
              <BookOpen size={18} />
              <span>Ratgeber</span>
            </Link>
            
            <Link to="/highscore" className={navLinkClass('/highscore')}>
              <Trophy size={18} />
              <span>Bestenliste</span>
            </Link>

            {/* Premium dropdown for premium users */}
            {user && isPremium ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors text-yellow-700 hover:text-yellow-600 hover:bg-yellow-50 ${
                    ['/premium-dashboard', '/weather-advice', '/chat'].includes(location.pathname) ? 'bg-yellow-100' : ''
                  }`}>
                    <Crown size={18} />
                    <span>Premium</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem asChild>
                    <Link to="/premium-dashboard" className="flex items-center gap-2">
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/weather-advice" className="flex items-center gap-2">
                      <CloudSun size={16} />
                      Wetterberatung
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/chat" className="flex items-center gap-2">
                      <MessageCircle size={16} />
                      KI-Berater
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/analysis-history" className="flex items-center gap-2">
                      <History size={16} />
                      Rasen-Verlauf
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/care-calendar" className="flex items-center gap-2">
                      <Calendar size={16} />
                      Pflegekalender
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/subscription/manage" className="flex items-center gap-2">
                      <CreditCard size={16} />
                      Abonnement verwalten
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : !user ? (
              <Button asChild size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <Link to="/subscription">
                  <Crown size={16} className="mr-1" />
                  Premium
                </Link>
              </Button>
            ) : (
              <Link to="/subscription" className={navLinkClass('/subscription', true)}>
                <Crown size={18} />
                <span>Premium werden</span>
              </Link>
            )}

            {/* Streak Counter */}
            {user && streak > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold cursor-default">
                      <Flame size={16} className="text-orange-500" />
                      <span>{streak}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Dein Streak: {streak} Woche{streak !== 1 ? 'n' : ''} — verliere ihn nicht! 🔥</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden lg:inline">{user.email?.split('@')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/account-settings" className="flex items-center gap-2">
                      <Settings size={16} />
                      Konto-Einstellungen
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin-panel" className="flex items-center gap-2">
                        <Shield size={16} />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="flex items-center gap-2">
                    <LogOut size={16} />
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="ghost">
                <Link to="/auth">
                  <LogIn size={16} className="mr-1" />
                  Anmelden
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="border-2 border-green-600 text-green-600 hover:bg-green-50 p-3 shadow-sm">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-white">
                <div className="flex flex-col h-full">
                  <div className="flex items-center space-x-2 mb-8 pt-4">
                    <Leaf className="h-8 w-8 text-green-600" />
                    <span className="text-xl font-bold text-green-800">Rasenpilot</span>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <Link to="/" className={mobileLinkClass('/')} onClick={closeMenu}>
                      <Leaf size={20} />
                      <span>Startseite</span>
                    </Link>
                    
                    <Link to="/lawn-analysis" className={mobileLinkClass('/lawn-analysis')} onClick={closeMenu}>
                      <Camera size={20} />
                      <span>KI-Analyse</span>
                    </Link>
                    
                    <Link to="/blog-overview" className={mobileLinkClass('/blog-overview')} onClick={closeMenu}>
                      <BookOpen size={20} />
                      <span>Ratgeber</span>
                    </Link>
                    
                    <Link to="/highscore" className={mobileLinkClass('/highscore')} onClick={closeMenu}>
                      <Trophy size={20} />
                      <span>Bestenliste</span>
                    </Link>

                    {user ? (
                      <>
                        {isPremium ? (
                          <>
                            <div className="border-t pt-3 mt-3">
                              <p className="px-4 py-1 text-xs font-semibold text-yellow-600 uppercase tracking-wider">Premium</p>
                            </div>
                            <Link to="/premium-dashboard" className={mobileLinkClass('/premium-dashboard', true)} onClick={closeMenu}>
                              <LayoutDashboard size={20} />
                              <span>Dashboard</span>
                            </Link>
                            <Link to="/weather-advice" className={mobileLinkClass('/weather-advice', true)} onClick={closeMenu}>
                              <CloudSun size={20} />
                              <span>Wetterberatung</span>
                            </Link>
                            <Link to="/chat" className={mobileLinkClass('/chat', true)} onClick={closeMenu}>
                              <MessageCircle size={20} />
                              <span>KI-Berater</span>
                            </Link>
                            <Link to="/analysis-history" className={mobileLinkClass('/analysis-history', true)} onClick={closeMenu}>
                              <History size={20} />
                              <span>Rasen-Verlauf</span>
                            </Link>
                            <Link to="/care-calendar" className={mobileLinkClass('/care-calendar', true)} onClick={closeMenu}>
                              <Calendar size={20} />
                              <span>Pflegekalender</span>
                            </Link>
                            <Link to="/subscription/manage" className={mobileLinkClass('/subscription/manage')} onClick={closeMenu}>
                              <CreditCard size={20} />
                              <span>Abonnement</span>
                            </Link>
                          </>
                        ) : (
                          <Link to="/subscription" className={mobileLinkClass('/subscription', true)} onClick={closeMenu}>
                            <Crown size={20} />
                            <span>Premium werden</span>
                          </Link>
                        )}
                        
                        {isAdmin && (
                          <Link to="/admin-panel" className={mobileLinkClass('/admin-panel')} onClick={closeMenu}>
                            <Shield size={20} />
                            <span>Admin</span>
                          </Link>
                        )}

                        <div className="border-t pt-4 mt-4">
                          <Link to="/account-settings" className={mobileLinkClass('/account-settings')} onClick={closeMenu}>
                            <User size={20} />
                            <span>Konto</span>
                          </Link>
                          <button
                            onClick={() => { signOut(); closeMenu(); }}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-lg text-gray-700 hover:text-green-600 hover:bg-green-50"
                          >
                            <LogOut size={20} />
                            <span>Abmelden</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="border-t pt-4 mt-4 space-y-2">
                        <Link to="/auth" className="flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-lg bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 font-medium" onClick={closeMenu}>
                          <LogIn size={20} />
                          <span>Anmelden</span>
                        </Link>
                        <Link to="/subscription" className="flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 font-medium" onClick={closeMenu}>
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
