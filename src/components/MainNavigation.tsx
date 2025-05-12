
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X, Leaf, MessageSquare, Cloud, Calendar } from "lucide-react";

const MainNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const menuItems = [
    { name: 'Startseite', path: '/', icon: <Leaf size={18} className="mr-1" /> },
    { name: 'Mein Pflegeplan', path: '/care-plan', icon: <Calendar size={18} className="mr-1" /> },
    { name: 'Fragen an Rasenpilot', path: '/chat', icon: <MessageSquare size={18} className="mr-1" /> },
    { name: 'Wetterberatung', path: '/weather', icon: <Cloud size={18} className="mr-1" /> },
  ];

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
            <Button className="ml-8 bg-green-600 hover:bg-green-700" size="sm">Anmelden</Button>
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
            <div className="px-3 py-2">
              <Button className="w-full bg-green-600 hover:bg-green-700">Anmelden</Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default MainNavigation;
