
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Leaf, Menu, X, BookOpen, Trophy, Settings, Camera, Calendar, MessageSquare } from 'lucide-react';

const MainNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

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
              to="/chat-assistant" 
              className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                isActive('/chat-assistant') 
                  ? 'bg-green-100 text-green-700' 
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <MessageSquare size={18} />
              <span>Chat</span>
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
            
            <Link 
              to="/admin-panel" 
              className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                isActive('/admin-panel') 
                  ? 'bg-green-100 text-green-700' 
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <Settings size={18} />
              <span>Admin</span>
            </Link>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 p-2"
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
                      to="/care-plan" 
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-lg ${
                        isActive('/care-plan') 
                          ? 'bg-green-100 text-green-700 font-medium' 
                          : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                      }`}
                      onClick={closeMenu}
                    >
                      <Calendar size={20} />
                      <span>Pflegeplan</span>
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
                      to="/chat-assistant" 
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-lg ${
                        isActive('/chat-assistant') 
                          ? 'bg-green-100 text-green-700 font-medium' 
                          : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                      }`}
                      onClick={closeMenu}
                    >
                      <MessageSquare size={20} />
                      <span>Chat</span>
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
