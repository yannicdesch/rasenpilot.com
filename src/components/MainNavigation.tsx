
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Leaf, Menu, X, BookOpen, Trophy } from 'lucide-react';

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
              <span>Home</span>
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
              <Link 
                to="/" 
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive('/') 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
                onClick={closeMenu}
              >
                <span>Home</span>
              </Link>
              
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
                <span>Ratgeber</span>
              </Link>
              
              <Link 
                to="/highscore" 
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive('/highscore') 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
                onClick={closeMenu}
              >
                <Trophy size={18} />
                <span>Bestenliste</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default MainNavigation;
