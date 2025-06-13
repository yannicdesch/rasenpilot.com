
import React from 'react';
import { CheckCircle, Target } from 'lucide-react';

interface Solution {
  category: string;
  tasks: string[];
}

interface SolutionsTabProps {
  solutions: Solution[];
}

const SolutionsTab: React.FC<SolutionsTabProps> = ({ solutions }) => {
  return (
    <div className="space-y-4 mt-4">
      {solutions.map((solution, index) => (
        <div key={index} className="border rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            {solution.category}
          </h4>
          <div className="space-y-2">
            {solution.tasks.map((task, taskIndex) => (
              <div key={taskIndex} className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{task}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SolutionsTab;
