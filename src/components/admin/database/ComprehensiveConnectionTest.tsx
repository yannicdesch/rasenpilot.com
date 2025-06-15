
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Database, Shield } from 'lucide-react';
import TestResult, { TestResultData } from './tests/TestResult';
import { runAllTests, showTestSummary } from './tests/TestRunner';

const ComprehensiveConnectionTest = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResultData[]>([]);

  const addResult = (result: TestResultData) => {
    setResults(prev => [...prev, result]);
  };

  const handleRunTests = async () => {
    setIsRunning(true);
    setResults([]);

    await runAllTests(addResult);
    
    // Show summary after a short delay to ensure all results are added
    setTimeout(() => {
      showTestSummary(results);
      setIsRunning(false);
    }, 500);
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Comprehensive Supabase Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Test all Supabase services: Database, Authentication, Storage, and Analytics
          </p>
          <Button onClick={handleRunTests} disabled={isRunning}>
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Run All Tests
              </>
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Test Results:</h4>
            {results.map((result, index) => (
              <TestResult key={index} result={result} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComprehensiveConnectionTest;
