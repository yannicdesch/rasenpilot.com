
import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import DebugPanel from '@/components/DebugPanel';

const DebugPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MainNavigation />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-green-800 mb-6">AI Integration Debug</h1>
          <DebugPanel />
        </div>
      </main>
    </div>
  );
};

export default DebugPage;
