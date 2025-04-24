
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const MainNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Content Library', path: '/content' },
    { name: 'Season Guide', path: '/season-guide' },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="h-8 w-8 bg-lawn-green rounded-full flex items-center justify-center mr-2">
                <span className="text-white font-bold">L</span>
              </div>
              <span className="text-xl font-bold text-lawn-green-dark">LawnRadar</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center">
            {menuItems.map((item) => (
              <Link 
                key={item.name}
                to={item.path}
                className="ml-8 text-gray-700 hover:text-lawn-green-dark px-2 py-1 rounded-md text-sm font-medium"
              >
                {item.name}
              </Link>
            ))}
            <Button className="ml-8 bg-lawn-green hover:bg-lawn-green-dark" size="sm">Sign In</Button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleMenu}
              aria-label="Menu"
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
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-lawn-green-dark rounded-md"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="px-3 py-2">
              <Button className="w-full bg-lawn-green hover:bg-lawn-green-dark">Sign In</Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default MainNavigation;
