
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Leaf, 
  Menu, 
  X, 
  Home, 
  Calendar, 
  MessageSquare, 
  Image, 
  Cloud, 
  UserRound, 
  LogOut,
  BookOpen
} from 'lucide-react';
import { useLawn } from '@/context/LawnContext';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from '@/hooks/use-mobile';

const MainNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, clearProfile } = useLawn();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearProfile();
    toast.success("Erfolgreich abgemeldet");
    navigate('/');
  };
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo section */}
          <NavLink to="/" className="flex items-center space-x-2">
            <Leaf className="h-6 w-6 text-green-600" />
            <span className="font-bold text-lg md:text-xl text-green-800">Rasenpilot</span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {isAuthenticated ? (
              // Authenticated user menu
              <>
                <NavLink to="/dashboard" className={({isActive}) => 
                  `px-3 py-2 rounded-md text-sm font-medium 
                  ${isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-600 hover:bg-gray-50'}`
                }>
                  Dashboard
                </NavLink>
                <NavLink to="/care-plan" className={({isActive}) => 
                  `px-3 py-2 rounded-md text-sm font-medium 
                  ${isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-600 hover:bg-gray-50'}`
                }>
                  Pflegeplan
                </NavLink>
                <NavLink to="/chat" className={({isActive}) => 
                  `px-3 py-2 rounded-md text-sm font-medium 
                  ${isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-600 hover:bg-gray-50'}`
                }>
                  Rasenpilot-KI
                </NavLink>
                <NavLink to="/blog-overview" className={({isActive}) => 
                  `px-3 py-2 rounded-md text-sm font-medium 
                  ${isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-600 hover:bg-gray-50'}`
                }>
                  Blog
                </NavLink>
                
                {/* User dropdown menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="ml-2 px-3">
                      <UserRound className="h-5 w-5 text-gray-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Mein Konto</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <UserRound className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/blog')}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>Blog</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Abmelden</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // Unauthenticated user menu
              <>
                <NavLink to="/free-plan" className={({isActive}) => 
                  `px-3 py-2 rounded-md text-sm font-medium 
                  ${isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-600 hover:bg-gray-50'}`
                }>
                  Kostenloser Plan
                </NavLink>
                <NavLink to="/free-analysis" className={({isActive}) => 
                  `px-3 py-2 rounded-md text-sm font-medium 
                  ${isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-600 hover:bg-gray-50'}`
                }>
                  Rasen-Analyzer
                </NavLink>
                <NavLink to="/free-chat" className={({isActive}) => 
                  `px-3 py-2 rounded-md text-sm font-medium 
                  ${isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-600 hover:bg-gray-50'}`
                }>
                  Rasenpilot-KI
                </NavLink>
                <NavLink to="/blog-overview" className={({isActive}) => 
                  `px-3 py-2 rounded-md text-sm font-medium 
                  ${isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-600 hover:bg-gray-50'}`
                }>
                  Blog
                </NavLink>
                <Button 
                  variant="outline" 
                  className="ml-2"
                  onClick={() => navigate('/auth', { state: { tab: 'login' } })}
                >
                  Anmelden
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 ml-2"
                  onClick={() => navigate('/auth', { state: { tab: 'register' } })}
                >
                  Registrieren
                </Button>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Hauptmenü"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-3 space-y-1">
            {isAuthenticated ? (
              // Authenticated mobile menu
              <>
                <NavLink to="/dashboard" className={({isActive}) => 
                  `flex items-center px-3 py-2 rounded-md text-base font-medium 
                  ${isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-600'}`
                } onClick={() => setIsOpen(false)}>
                  <Home className="mr-3 h-5 w-5" />
                  Dashboard
                </NavLink>
                <NavLink to="/care-plan" className={({isActive}) => 
                  `flex items-center px-3 py-2 rounded-md text-base font-medium 
                  ${isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-600'}`
                } onClick={() => setIsOpen(false)}>
                  <Calendar className="mr-3 h-5 w-5" />
                  Pflegeplan
                </NavLink>
                <NavLink to="/chat" className={({isActive}) => 
                  `flex items-center px-3 py-2 rounded-md text-base font-medium 
                  ${isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-600'}`
                } onClick={() => setIsOpen(false)}>
                  <MessageSquare className="mr-3 h-5 w-5" />
                  Rasenpilot-KI
                </NavLink>
                <NavLink to="/profile" className={({isActive}) => 
                  `flex items-center px-3 py-2 rounded-md text-base font-medium 
                  ${isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-600'}`
                } onClick={() => setIsOpen(false)}>
                  <UserRound className="mr-3 h-5 w-5" />
                  Profil
                </NavLink>
                <NavLink to="/blog-overview" className={({isActive}) => 
                  `flex items-center px-3 py-2 rounded-md text-base font-medium 
                  ${isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-600'}`
                } onClick={() => setIsOpen(false)}>
                  <BookOpen className="mr-3 h-5 w-5" />
                  Blog
                </NavLink>
                <div className="pt-2">
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Abmelden
                  </Button>
                </div>
              </>
            ) : (
              // Unauthenticated mobile menu
              <>
                <NavLink to="/free-plan" className={({isActive}) => 
                  `flex items-center px-3 py-2 rounded-md text-base font-medium 
                  ${isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-600'}`
                } onClick={() => setIsOpen(false)}>
                  <Calendar className="mr-3 h-5 w-5" />
                  Kostenloser Plan
                </NavLink>
                <NavLink to="/free-analysis" className={({isActive}) => 
                  `flex items-center px-3 py-2 rounded-md text-base font-medium 
                  ${isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-600'}`
                } onClick={() => setIsOpen(false)}>
                  <Image className="mr-3 h-5 w-5" />
                  Rasen-Analyzer
                </NavLink>
                <NavLink to="/free-chat" className={({isActive}) => 
                  `flex items-center px-3 py-2 rounded-md text-base font-medium 
                  ${isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-600'}`
                } onClick={() => setIsOpen(false)}>
                  <MessageSquare className="mr-3 h-5 w-5" />
                  Rasenpilot-KI
                </NavLink>
                <NavLink to="/blog-overview" className={({isActive}) => 
                  `flex items-center px-3 py-2 rounded-md text-base font-medium 
                  ${isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-600'}`
                } onClick={() => setIsOpen(false)}>
                  <BookOpen className="mr-3 h-5 w-5" />
                  Blog
                </NavLink>
                <NavLink to="/free-weather" className={({isActive}) => 
                  `flex items-center px-3 py-2 rounded-md text-base font-medium 
                  ${isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-600'}`
                } onClick={() => setIsOpen(false)}>
                  <Cloud className="mr-3 h-5 w-5" />
                  Wetter
                </NavLink>
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      navigate('/auth', { state: { tab: 'login' } });
                      setIsOpen(false);
                    }}
                  >
                    Anmelden
                  </Button>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      navigate('/auth', { state: { tab: 'register' } });
                      setIsOpen(false);
                    }}
                  >
                    Registrieren
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default MainNavigation;
