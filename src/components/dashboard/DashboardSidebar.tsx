
import React from 'react';
import WeatherWidget from '@/components/WeatherWidget';
import TaskTimeline from '@/components/TaskTimeline';

const DashboardSidebar: React.FC = () => {
  return (
    <div className="w-full md:w-1/3 space-y-6">
      <WeatherWidget />
      <TaskTimeline />
    </div>
  );
};

export default DashboardSidebar;
