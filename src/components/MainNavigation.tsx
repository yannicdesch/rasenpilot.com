
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X, Leaf, MessageSquare, Cloud, Calendar, UserRound, LogOut, FileText } from "lucide-react";
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface User {
  id: string;
  email: string;
  name?: string;
}

const MainNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      try {
        // We're now always configured, but keep the checks for robustness
        if (!isSupabaseConfigured()) {
          console.log('Supabase is not configured in MainNavigation');
          setLoading(false);
          return;
        }

        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name,
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Set up auth listener
    try {
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name,
          });
        } else {
          setUser(null);
        }
      });
  
      return () => {
        if (authListener?.subscription) {
          authListener.subscription.unsubscribe();
        }
      };
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      return () => {};
    }
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleSignOut = async () => {
    if (!isSupabaseConfigured()) {
      console.error('Supabase is not configured properly');
      toast.error('Supabase-Konfiguration fehlt. Bitte verwenden Sie gültige Anmeldedaten.');
      return;
    }

    try {
      await supabase!.auth.signOut();
      navigate('/');
      toast.success('Du wurdest erfolgreich abgemeldet');
    } catch (error: any) {
      toast.error(`Fehler beim Abmelden: ${error.message}`);
    }
  };

  // Updated menuItems to include links to both free offerings and authenticated routes
  const menuItems = [
    { name: 'Startseite', path: '/', icon: <Leaf size={18} className="mr-1" /> },
    { name: 'Kostenloser Pflegeplan', path: '/free-care-plan', icon: <Calendar size={18} className="mr-1" /> },
    { name: 'Kostenloser Chat', path: '/free-chat', icon: <MessageSquare size={18} className="mr-1" /> },
    { name: 'Kostenlose Wetterberatung', path: '/free-weather', icon: <Cloud size={18} className="mr-1" /> },
    { name: 'Rasenanalyse', path: '/free-analysis', icon: <Leaf size={18} className="mr-1" /> },
    { name: 'Blog', path: '/blog', icon: <FileText size={18} className="mr-1" /> },
  ];

  // Auth-dependent menuItems
  const authMenuItems = user ? [
    { name: 'Dashboard', path: '/dashboard', icon: <Leaf size={18} className="mr-1" /> },
    { name: 'Mein Pflegeplan', path: '/care-plan', icon: <Calendar size={18} className="mr-1" /> },
    { name: 'Fragen an Rasenpilot', path: '/chat', icon: <MessageSquare size={18} className="mr-1" /> },
    { name: 'Wetterberatung', path: '/weather', icon: <Cloud size={18} className="mr-1" /> },
  ] : [];

  return (
    <nav className="bg-green-50 shadow-sm border-b border-green-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center mr-2">
                <span className="text-white font-bold">R</span>
              </div>
              <span className="text-xl font-bold text-green-700">Rasenpilot</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center">
            {menuItems.map((item) => (
              <Link 
                key={item.name}
                to={item.path}
                className="ml-8 text-green-800 hover:text-green-600 px-2 py-1 rounded-md text-sm font-medium flex items-center hover:bg-green-100 transition-all"
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            
            {!loading && (
              <>
                {user ? (
                  <div className="ml-8 flex items-center gap-2">
                    <Link to="/profile">
                      <Avatar className="h-8 w-8 hover:ring-2 hover:ring-green-400 transition-all">
                        <AvatarFallback className="bg-green-100 text-green-800 text-sm">
                          {user.name?.charAt(0) || user.email.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={handleSignOut}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={18} />
                    </Button>
                  </div>
                ) : (
                  <Link to="/auth">
                    <Button className="ml-8 bg-green-600 hover:bg-green-700" size="sm">
                      Anmelden
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleMenu}
              aria-label="Menü"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-2 space-y-1">
            {menuItems.map((item) => (
              <Link 
                key={item.name}
                to={item.path}
                className="block px-3 py-2 text-green-800 hover:bg-green-100 hover:text-green-600 rounded-md flex items-center"
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </Link>
            ))}
            
            {!loading && user && authMenuItems.map((item) => (
              <Link 
                key={item.name}
                to={item.path}
                className="block px-3 py-2 text-green-800 hover:bg-green-100 hover:text-green-600 rounded-md flex items-center"
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </Link>
            ))}
            
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="block px-3 py-2 text-green-800 hover:bg-green-100 hover:text-green-600 rounded-md flex items-center"
                      onClick={() => setIsOpen(false)}
                    >
                      <UserRound size={18} className="mr-2" />
                      <span>Mein Profil</span>
                    </Link>
                    <div className="px-3 py-2">
                      <Button 
                        className="w-full flex items-center justify-center" 
                        variant="outline"
                        onClick={handleSignOut}
                      >
                        <LogOut size={18} className="mr-2" />
                        Abmelden
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="px-3 py-2">
                    <Link to="/auth">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Anmelden
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default MainNavigation;
