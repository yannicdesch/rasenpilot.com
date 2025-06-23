
import React from 'react';
import WeatherWidget from '@/components/WeatherWidget';

const DashboardSidebar: React.FC = () => {
  return (
    <div className="w-full md:w-1/3 space-y-6">
      <WeatherWidget />
    </div>
  );
};

export default DashboardSidebar;
