
import { supabase } from '@/integrations/supabase/client';
import { TestResultData } from './TestResult';

export const runStorageTest = async (): Promise<TestResultData[]> => {
  const results: TestResultData[] = [];
  
  try {
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) throw bucketsError;

    const expectedBuckets = ['avatars', 'lawn-images'];
    const foundBuckets = buckets?.map(b => b.name) || [];
    const missingBuckets = expectedBuckets.filter(b => !foundBuckets.includes(b));

    results.push({
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
          
          results.push({
            name: 'File Upload Test',
            status: 'success',
            message: 'File upload/delete test successful',
            details: `Tested on bucket: ${foundBuckets[0]}`
          });
        } else {
          results.push({
            name: 'File Upload Test',
            status: 'warning',
            message: 'File upload test failed',
            details: uploadError.message
          });
        }
      } catch (uploadErr: any) {
        results.push({
          name: 'File Upload Test',
          status: 'warning',
          message: 'Could not test file upload',
          details: uploadErr.message
        });
      }
    }
  } catch (error: any) {
    results.push({
      name: 'Storage System',
      status: 'error',
      message: 'Storage system error',
      details: error.message
    });
  }

  return results;
};
