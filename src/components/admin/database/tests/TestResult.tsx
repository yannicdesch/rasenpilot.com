
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

export interface TestResultData {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: string;
}

interface TestResultProps {
  result: TestResultData;
}

const TestResult = ({ result }: TestResultProps) => {
  const getStatusIcon = (status: TestResultData['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
    }
  };

  const getStatusBadge = (status: TestResultData['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary',
      pending: 'outline'
    } as const;

    return (
      <Badge variant={variants[status]} className="ml-2">
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon(result.status)}
          <span className="font-medium">{result.name}</span>
          {getStatusBadge(result.status)}
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
      {result.details && (
        <pre className="text-xs bg-muted p-2 rounded mt-2 whitespace-pre-wrap">
          {result.details}
        </pre>
      )}
    </div>
  );
};

export default TestResult;
