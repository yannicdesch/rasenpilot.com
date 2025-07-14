
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
          <div className="text-center mb-16">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border border-green-200">
                <Sparkles className="h-4 w-4 mr-2" />
                Professionelle KI-Rasenanalyse
              </span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Revolutionäre Rasenanalyse mit
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Multi-LLM Technologie</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Unsere fortschrittliche KI-Plattform kombiniert ChatGPT Vision, Claude, und weitere Large Language Models für präzise Rasendiagnosen in Sekundenschnelle
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              <div className="flex items-center justify-center gap-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <Zap className="h-6 w-6 text-yellow-500" />
                <span className="text-sm font-semibold text-gray-800">Blitzschnell</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <Star className="h-6 w-6 text-blue-500" />
                <span className="text-sm font-semibold text-gray-800">Multi-LLM Power</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-sm font-semibold text-gray-800">Profi-Qualität</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <Camera className="h-6 w-6 text-purple-500" />
                <span className="text-sm font-semibold text-gray-800">Vision AI</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 max-w-2xl mx-auto border border-green-100">
              <p className="text-sm text-gray-700 font-medium">
                <span className="text-green-600">✨ Powered by:</span> GPT-4 Vision • Claude 3 • Gemini Pro • LLaMA 3
              </p>
            </div>
          </div>

          {/* Simple Analyzer */}
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
