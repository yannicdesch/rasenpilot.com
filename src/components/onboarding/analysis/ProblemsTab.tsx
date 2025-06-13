
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign } from 'lucide-react';

type Severity = 'high' | 'medium' | 'low';

interface MainIssue {
  title: string;
  severity: Severity;
  description: string;
  timeline: string;
  cost: string;
}

interface ProblemsTabProps {
  issues: MainIssue[];
}

const ProblemsTab: React.FC<ProblemsTabProps> = ({ issues }) => {
  const getSeverityColor = (severity: Severity) => {
    if (severity === 'high') return 'bg-red-100 text-red-800';
    if (severity === 'medium') return 'bg-yellow-100 text-yellow-800';
    if (severity === 'low') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getSeverityLabel = (severity: Severity) => {
    if (severity === 'high') return 'Hoch';
    if (severity === 'medium') return 'Mittel';
    if (severity === 'low') return 'Niedrig';
    return severity;
  };

  return (
    <div className="space-y-4 mt-4">
      {issues.map((issue, index) => (
        <div key={index} className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-800">{issue.title}</h4>
            <Badge className={getSeverityColor(issue.severity)}>
              {getSeverityLabel(issue.severity)}
            </Badge>
          </div>
          <p className="text-gray-600 mb-3">{issue.description}</p>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>{issue.timeline}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span>{issue.cost}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProblemsTab;
