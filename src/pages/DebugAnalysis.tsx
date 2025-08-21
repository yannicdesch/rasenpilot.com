import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import AnalysisDebugger from '@/components/AnalysisDebugger';
import SEO from '@/components/SEO';

const DebugAnalysis = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <SEO 
        title="Analysis Debugger - ChatGPT Analyse Testen"
        description="Debug Tool um die ChatGPT Analyse-Funktionalität zu testen"
      />
      
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-3">
            Analysis Debugger
          </h1>
          <p className="text-lg text-slate-700">
            Teste warum die ChatGPT Analyse immer 85% anzeigt
          </p>
        </div>

        <AnalysisDebugger />
      </div>
    </div>
  );
};

export default DebugAnalysis;