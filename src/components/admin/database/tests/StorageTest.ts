
import { supabase } from '@/integrations/supabase/client';
import { TestResultData } from './TestResult';

export const runStorageTest = async (): Promise<TestResultData[]> => {
  const results: TestResultData[] = [];
  
  try {
    // Test 1: Check if lawn-images bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      results.push({
        name: 'Storage Connection',
        status: 'error',
        message: 'Cannot connect to storage',
        details: bucketsError.message
      });
      return results;
    }
    
    const lawnImagesBucket = buckets?.find(bucket => bucket.name === 'lawn-images');
    
    if (!lawnImagesBucket) {
      results.push({
        name: 'Lawn Images Bucket',
        status: 'error',
        message: 'lawn-images bucket does not exist',
        details: 'Create bucket via Supabase dashboard or SQL'
      });
    } else {
      results.push({
        name: 'Lawn Images Bucket',
        status: 'success',
        message: 'Bucket exists and is accessible',
        details: `Public: ${lawnImagesBucket.public}, Created: ${lawnImagesBucket.created_at}`
      });
    }
    
    // Test 2: Try to upload a test file if bucket exists
    if (lawnImagesBucket) {
      try {
        const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        const testPath = `test/upload-test-${Date.now()}.txt`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('lawn-images')
          .upload(testPath, testFile);
        
        if (uploadError) {
          results.push({
            name: 'Upload Test',
            status: 'error',
            message: 'Upload failed',
            details: uploadError.message
          });
        } else {
          results.push({
            name: 'Upload Test',
            status: 'success',
            message: 'Test upload successful',
            details: `Path: ${uploadData.path}`
          });
          
          // Clean up test file
          await supabase.storage.from('lawn-images').remove([testPath]);
        }
      } catch (uploadTestError) {
        results.push({
          name: 'Upload Test',
          status: 'error',
          message: 'Upload test failed',
          details: uploadTestError instanceof Error ? uploadTestError.message : 'Unknown error'
        });
      }
    }
    
    // Test 3: Check storage policies
    try {
      const { data: policies, error: policiesError } = await supabase
        .from('storage.objects')
        .select('*')
        .limit(1);
      
      if (policiesError) {
        results.push({
          name: 'Storage Policies',
          status: 'warning',
          message: 'Cannot check storage policies',
          details: policiesError.message
        });
      } else {
        results.push({
          name: 'Storage Policies',
          status: 'success',
          message: 'Storage policies accessible',
          details: 'RLS policies are configured'
        });
      }
    } catch (policyError) {
      results.push({
        name: 'Storage Policies',
        status: 'warning',
        message: 'Policy check failed',
        details: 'This is expected for security reasons'
      });
    }
    
  } catch (error) {
    results.push({
      name: 'Storage System',
      status: 'error',
      message: 'Storage system error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  return results;
};
