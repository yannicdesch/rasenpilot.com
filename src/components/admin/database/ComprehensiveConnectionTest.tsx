
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, Shield, FileImage, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: string;
}

const ComprehensiveConnectionTest = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      // Test 1: Basic Supabase Connection
      addResult({ name: 'Basic Connection', status: 'pending', message: 'Testing...' });
      
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        addResult({ 
          name: 'Basic Connection', 
          status: 'success', 
          message: 'Supabase client initialized successfully',
          details: `Session status: ${data.session ? 'Active' : 'No active session'}`
        });
      } catch (error: any) {
        addResult({ 
          name: 'Basic Connection', 
          status: 'error', 
          message: 'Failed to connect to Supabase',
          details: error.message 
        });
      }

      // Test 2: Database Tables Check
      addResult({ name: 'Database Tables', status: 'pending', message: 'Checking tables...' });
      
      const tableChecks = [
        { table: 'profiles', description: 'User profiles' },
        { table: 'page_views', description: 'Analytics page views' },
        { table: 'events', description: 'Analytics events' },
        { table: 'lawn_profiles', description: 'Lawn profile data' }
      ];

      let tablesFound = 0;
      let tableDetails = [];

      for (const { table, description } of tableChecks) {
        try {
          const { error } = await supabase.from(table).select('count').limit(1);
          if (!error) {
            tablesFound++;
            tableDetails.push(`✓ ${table} (${description})`);
          } else {
            tableDetails.push(`✗ ${table} - ${error.message}`);
          }
        } catch (err) {
          tableDetails.push(`✗ ${table} - Connection error`);
        }
      }

      addResult({
        name: 'Database Tables',
        status: tablesFound === tableChecks.length ? 'success' : tablesFound > 0 ? 'warning' : 'error',
        message: `${tablesFound}/${tableChecks.length} tables accessible`,
        details: tableDetails.join('\n')
      });

      // Test 3: Authentication System
      addResult({ name: 'Authentication', status: 'pending', message: 'Testing auth...' });
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Test profile creation/access
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          addResult({
            name: 'Authentication',
            status: 'success',
            message: 'User authenticated with profile access',
            details: `User ID: ${user.id}, Profile: ${profile ? 'Found' : 'Not found'}`
          });
        } else {
          addResult({
            name: 'Authentication',
            status: 'warning',
            message: 'No active user session',
            details: 'Authentication system is functional but no user is logged in'
          });
        }
      } catch (error: any) {
        addResult({
          name: 'Authentication',
          status: 'error',
          message: 'Authentication system error',
          details: error.message
        });
      }

      // Test 4: Storage Buckets
      addResult({ name: 'Storage System', status: 'pending', message: 'Checking storage...' });
      
      try {
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) throw bucketsError;

        const expectedBuckets = ['avatars', 'lawn-images'];
        const foundBuckets = buckets?.map(b => b.name) || [];
        const missingBuckets = expectedBuckets.filter(b => !foundBuckets.includes(b));

        addResult({
          name: 'Storage System',
          status: missingBuckets.length === 0 ? 'success' : 'warning',
          message: `Storage accessible - ${foundBuckets.length} buckets found`,
          details: `Found: ${foundBuckets.join(', ') || 'None'}\nMissing: ${missingBuckets.join(', ') || 'None'}`
        });

        // Test file upload capability (small test)
        if (foundBuckets.length > 0) {
          try {
            const testContent = new Blob(['test'], { type: 'text/plain' });
            const testPath = `test-${Date.now()}.txt`;
            
            const { error: uploadError } = await supabase.storage
              .from(foundBuckets[0])
              .upload(testPath, testContent);

            if (!uploadError) {
              // Clean up test file
              await supabase.storage.from(foundBuckets[0]).remove([testPath]);
              
              addResult({
                name: 'File Upload Test',
                status: 'success',
                message: 'File upload/delete test successful',
                details: `Tested on bucket: ${foundBuckets[0]}`
              });
            } else {
              addResult({
                name: 'File Upload Test',
                status: 'warning',
                message: 'File upload test failed',
                details: uploadError.message
              });
            }
          } catch (uploadErr: any) {
            addResult({
              name: 'File Upload Test',
              status: 'warning',
              message: 'Could not test file upload',
              details: uploadErr.message
            });
          }
        }
      } catch (error: any) {
        addResult({
          name: 'Storage System',
          status: 'error',
          message: 'Storage system error',
          details: error.message
        });
      }

      // Test 5: Analytics Tracking
      addResult({ name: 'Analytics System', status: 'pending', message: 'Testing analytics...' });
      
      try {
        const testEvent = {
          category: 'test',
          action: 'connection_check',
          label: 'comprehensive_test',
          timestamp: new Date().toISOString()
        };

        const { error: analyticsError } = await supabase
          .from('events')
          .insert(testEvent);

        if (!analyticsError) {
          addResult({
            name: 'Analytics System',
            status: 'success',
            message: 'Analytics tracking functional',
            details: 'Successfully logged test event'
          });
        } else {
          addResult({
            name: 'Analytics System',
            status: 'error',
            message: 'Analytics tracking failed',
            details: analyticsError.message
          });
        }
      } catch (error: any) {
        addResult({
          name: 'Analytics System',
          status: 'error',
          message: 'Analytics system error',
          details: error.message
        });
      }

      // Show summary
      const successCount = results.filter(r => r.status === 'success').length;
      const totalTests = results.length;

      if (successCount === totalTests) {
        toast.success('All systems operational!', {
          description: 'Supabase connection and all services are working properly.'
        });
      } else if (successCount > totalTests / 2) {
        toast.warning('Partial functionality', {
          description: `${successCount}/${totalTests} tests passed. Some features may need attention.`
        });
      } else {
        toast.error('Connection issues detected', {
          description: 'Multiple system failures detected. Please check configuration.'
        });
      }

    } catch (error: any) {
      toast.error('Test execution failed', {
        description: error.message
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
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

  const getStatusBadge = (status: TestResult['status']) => {
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
          <Button onClick={runAllTests} disabled={isRunning}>
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
              <div key={index} className="border rounded-lg p-3">
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComprehensiveConnectionTest;
