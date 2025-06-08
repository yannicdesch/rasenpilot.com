
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Loader2, TestTube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const DebugPanel = () => {
  const [isTestingOpenAI, setIsTestingOpenAI] = useState(false);
  const [isTestingStorage, setIsTestingStorage] = useState(false);
  const [openAIResult, setOpenAIResult] = useState<any>(null);
  const [storageResult, setStorageResult] = useState<any>(null);

  const testOpenAIConnection = async () => {
    setIsTestingOpenAI(true);
    setOpenAIResult(null);
    
    try {
      console.log('Testing OpenAI connection...');
      
      const { data, error } = await supabase.functions.invoke('test-openai-connection');
      
      console.log('OpenAI test result:', data, error);
      
      if (error) {
        setOpenAIResult({ success: false, error: error.message });
        toast({
          title: "OpenAI Test Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setOpenAIResult(data);
        toast({
          title: data.success ? "OpenAI Test Successful" : "OpenAI Test Failed",
          description: data.message || data.error,
          variant: data.success ? "default" : "destructive"
        });
      }
    } catch (error) {
      console.error('Error testing OpenAI:', error);
      setOpenAIResult({ success: false, error: error.message });
      toast({
        title: "Test Error",
        description: "Failed to run OpenAI connection test",
        variant: "destructive"
      });
    } finally {
      setIsTestingOpenAI(false);
    }
  };

  const testStorageSetup = async () => {
    setIsTestingStorage(true);
    setStorageResult(null);
    
    try {
      console.log('Testing storage setup...');
      
      // First, try to create the bucket
      const { data: createData, error: createError } = await supabase.functions.invoke('create-lawn-images-bucket');
      
      console.log('Bucket creation result:', createData, createError);
      
      // Then, list buckets to verify
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      console.log('Available buckets:', buckets, listError);
      
      const lawnImagesBucket = buckets?.find(bucket => bucket.id === 'lawn-images');
      
      setStorageResult({
        bucketExists: !!lawnImagesBucket,
        bucketPublic: lawnImagesBucket?.public,
        totalBuckets: buckets?.length || 0,
        createResult: createData,
        createError: createError?.message,
        listError: listError?.message
      });
      
      toast({
        title: lawnImagesBucket ? "Storage Bucket Found" : "Storage Bucket Missing",
        description: lawnImagesBucket ? "lawn-images bucket is properly configured" : "lawn-images bucket needs to be created",
        variant: lawnImagesBucket ? "default" : "destructive"
      });
      
    } catch (error) {
      console.error('Error testing storage:', error);
      setStorageResult({ error: error.message });
      toast({
        title: "Storage Test Error",
        description: "Failed to test storage setup",
        variant: "destructive"
      });
    } finally {
      setIsTestingStorage(false);
    }
  };

  const testLawnProblemAnalysis = async () => {
    try {
      console.log('Testing lawn problem analysis...');
      
      const { data, error } = await supabase.functions.invoke('analyze-lawn-problem', {
        body: {
          problem: 'Test problem: My lawn has yellow spots',
          hasImage: false
        }
      });
      
      console.log('Lawn problem analysis test result:', data, error);
      
      toast({
        title: data?.analysis ? "Lawn Analysis Working" : "Lawn Analysis Failed",
        description: data?.analysis ? "AI analysis is responding correctly" : (error?.message || "No response received"),
        variant: data?.analysis ? "default" : "destructive"
      });
      
    } catch (error) {
      console.error('Error testing lawn analysis:', error);
      toast({
        title: "Lawn Analysis Test Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Debug Panel - AI Integration Tests
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* OpenAI Connection Test */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">OpenAI API Connection</h3>
            <Button 
              onClick={testOpenAIConnection} 
              disabled={isTestingOpenAI}
              size="sm"
            >
              {isTestingOpenAI ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test OpenAI'
              )}
            </Button>
          </div>
          
          {openAIResult && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {openAIResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <Badge variant={openAIResult.success ? "default" : "destructive"}>
                  {openAIResult.success ? "Success" : "Failed"}
                </Badge>
              </div>
              <p className="text-sm">{openAIResult.message || openAIResult.error}</p>
              {openAIResult.testResponse && (
                <p className="text-sm mt-2"><strong>AI Response:</strong> {openAIResult.testResponse}</p>
              )}
            </div>
          )}
        </div>

        {/* Storage Test */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">Storage Bucket Setup</h3>
            <Button 
              onClick={testStorageSetup} 
              disabled={isTestingStorage}
              size="sm"
            >
              {isTestingStorage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Storage'
              )}
            </Button>
          </div>
          
          {storageResult && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {storageResult.bucketExists ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="text-sm">
                    Bucket exists: {storageResult.bucketExists ? 'Yes' : 'No'}
                  </span>
                </div>
                {storageResult.bucketExists && (
                  <div className="text-sm">
                    Public: {storageResult.bucketPublic ? 'Yes' : 'No'}
                  </div>
                )}
                <div className="text-sm">
                  Total buckets: {storageResult.totalBuckets}
                </div>
                {storageResult.error && (
                  <div className="text-sm text-red-600">
                    Error: {storageResult.error}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Lawn Analysis Test */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">Lawn Problem Analysis</h3>
            <Button 
              onClick={testLawnProblemAnalysis} 
              size="sm"
            >
              Test Analysis
            </Button>
          </div>
        </div>

        <div className="text-sm text-gray-600 mt-4 p-3 bg-blue-50 rounded-lg">
          <strong>How to use:</strong>
          <ul className="list-disc ml-4 mt-2 space-y-1">
            <li>Test OpenAI to verify API key and connection</li>
            <li>Test Storage to ensure the lawn-images bucket exists</li>
            <li>Test Analysis to verify the full AI pipeline works</li>
            <li>Check browser console for detailed logs</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugPanel;
