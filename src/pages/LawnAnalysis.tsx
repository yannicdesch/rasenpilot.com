
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Sparkles, CheckCircle, Star, Zap, Leaf } from 'lucide-react';
import { SimpleLawnAnalyzer } from '@/components/SimpleLawnAnalyzer';

const LawnAnalysis = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-green-800">Rasenpilot</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/highscore')}
            >
              Bestenliste
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/blog-overview')}
            >
              Ratgeber
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/auth')}
            >
              Anmelden
            </Button>
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-green-800 mb-4">
              KI-Rasenanalyse mit ChatGPT
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Einfach, schnell und zuverlässig - Lade ein Foto hoch und erhalte sofort eine detaillierte Analyse
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 bg-white p-4 rounded-lg shadow-sm">
                <Zap className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Sofortige Ergebnisse</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white p-4 rounded-lg shadow-sm">
                <Star className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">ChatGPT Vision</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white p-4 rounded-lg shadow-sm">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">Einfach zu benutzen</span>
              </div>
            </div>
          </div>

          {/* Simple Analyzer */}
          <div className="mb-8">
            <SimpleLawnAnalyzer />
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Einfache KI-Analyse</h3>
              <p className="text-gray-600">Upload, Analysieren, Fertig - so einfach geht's mit ChatGPT Vision</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Sofortige Ergebnisse</h3>
              <p className="text-gray-600">Keine Wartezeit - erhalte deine Rasenanalyse innerhalb von Sekunden</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Detaillierte Empfehlungen</h3>
              <p className="text-gray-600">Erhalte spezifische Ratschläge für deinen Rasen auf Deutsch</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawnAnalysis;
