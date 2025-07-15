
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
              onClick={() => navigate('/')}
            >
              Startseite
            </Button>
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
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Simple Analyzer - Start directly with upload */}
          <div className="mb-8">
            <SimpleLawnAnalyzer />
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Multi-LLM Ensemble</h3>
              <p className="text-gray-600 leading-relaxed">Kombiniert die Stärken von GPT-4, Claude und Gemini für unübertroffene Präzision bei der Rasendiagnose</p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Instant-Analyse</h3>
              <p className="text-gray-600 leading-relaxed">Fortschrittliche Vision AI erkennt Rasenprobleme in Sekunden und liefert sofortige Lösungsansätze</p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Experten-Empfehlungen</h3>
              <p className="text-gray-600 leading-relaxed">Personalisierte Pflegetipps basierend auf jahrzehntelanger Gartenbau-Expertise und modernster KI-Technologie</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawnAnalysis;
