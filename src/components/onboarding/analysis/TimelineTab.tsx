
import React from 'react';
import { Calendar } from 'lucide-react';

interface MonthlyTask {
  month: string;
  priority: string;
}

interface TimelineTabProps {
  monthlyTasks: MonthlyTask[];
}

const TimelineTab: React.FC<TimelineTabProps> = ({ monthlyTasks }) => {
  return (
    <div className="space-y-4 mt-4">
      {monthlyTasks.map((task, index) => (
        <div key={index} className="border rounded-lg p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{task.month}</h4>
            <p className="text-gray-600">{task.priority}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineTab;
