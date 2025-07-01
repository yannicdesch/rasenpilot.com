
import { supabase } from '@/integrations/supabase/client';

export const uploadImageToStorage = async (
  compressedFile: File,
  userId?: string
): Promise<string> => {
  try {
    // Create unique file path
    const fileExt = compressedFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = userId ? `${userId}/${fileName}` : `anonymous/${fileName}`;
    
    console.log('=== STORAGE UPLOAD DEBUG ===');
    console.log('User ID:', userId || 'anonymous');
    console.log('Original file name:', compressedFile.name);
    console.log('Generated file name:', fileName);
    console.log('Full file path:', filePath);
    console.log('File size:', compressedFile.size, 'bytes');
    console.log('File type:', compressedFile.type);
    
    console.log('Starting storage upload to bucket: lawn-images');
    
    // Upload with longer timeout and retry logic
    const uploadWithRetry = async (retryCount = 0): Promise<any> => {
      const maxRetries = 2;
      const timeoutMs = 60000; // 60 seconds
      
      try {
        const uploadPromise = supabase.storage
          .from('lawn-images')
          .upload(filePath, compressedFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Upload timeout after ${timeoutMs/1000} seconds`)), timeoutMs)
        );
        
        const result = await Promise.race([uploadPromise, timeoutPromise]) as any;
        
        console.log('=== STORAGE UPLOAD RESPONSE ===');
        console.log('Upload data:', result.data);
        console.log('Upload error:', result.error);
        
        if (result.error) {
          throw new Error(result.error.message);
        }
        
        return result;
      } catch (error) {
        console.error(`Upload attempt ${retryCount + 1} failed:`, error);
        
        if (retryCount < maxRetries && (
          error instanceof Error && (
            error.message.includes('timeout') || 
            error.message.includes('network') ||
            error.message.includes('fetch')
          )
        )) {
          console.log(`Retrying upload... (${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1))); // Exponential backoff
          return uploadWithRetry(retryCount + 1);
        }
        
        throw error;
      }
    };
    
    const { data: uploadData, error: uploadError } = await uploadWithRetry();
    
    if (uploadError) {
      console.error('=== STORAGE UPLOAD ERROR DETAILS ===');
      console.error('Error message:', uploadError.message);
      console.error('Error details:', uploadError);
      
      // Provide more specific error messages
      if (uploadError.message.includes('bucket')) {
        throw new Error('Storage bucket configuration error. Please contact support.');
      }
      if (uploadError.message.includes('policy')) {
        throw new Error('Storage permission denied. Please check your account status.');
      }
      if (uploadError.message.includes('size')) {
        throw new Error('File too large for storage. Please choose a smaller image.');
      }
      
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    
    if (!uploadData || !uploadData.path) {
      console.error('Upload succeeded but no path returned');
      throw new Error('Upload succeeded but no file path returned');
    }
    
    console.log('=== STORAGE UPLOAD SUCCESS ===');
    console.log('Final upload path:', uploadData.path);
    
    return uploadData.path;
    
  } catch (error) {
    console.error('=== STORAGE SERVICE ERROR ===');
    console.error('Error in uploadImageToStorage:', error);
    throw error;
  }
};
