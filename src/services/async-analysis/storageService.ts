
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
    
    // Check if bucket exists first
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
        throw new Error(`Cannot access storage: ${bucketsError.message}`);
      }
      
      const lawnImagesBucket = buckets?.find(bucket => bucket.name === 'lawn-images');
      if (!lawnImagesBucket) {
        console.error('lawn-images bucket not found');
        throw new Error('Storage bucket "lawn-images" does not exist. Please contact support.');
      }
      
      console.log('Bucket exists, proceeding with upload...');
    } catch (bucketCheckError) {
      console.error('Error checking bucket:', bucketCheckError);
      throw bucketCheckError;
    }
    
    // Upload with timeout
    const uploadPromise = supabase.storage
      .from('lawn-images')
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: false
      });
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000)
    );
    
    const { data: uploadData, error: uploadError } = await Promise.race([
      uploadPromise,
      timeoutPromise
    ]) as any;
    
    console.log('=== STORAGE UPLOAD RESPONSE ===');
    console.log('Upload data:', uploadData);
    console.log('Upload error:', uploadError);
    
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
