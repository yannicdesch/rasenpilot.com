
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
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lawn-images')
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: false
      });
    
    console.log('=== STORAGE UPLOAD RESPONSE ===');
    console.log('Upload data:', uploadData);
    console.log('Upload error:', uploadError);
    
    if (uploadError) {
      console.error('=== STORAGE UPLOAD ERROR DETAILS ===');
      console.error('Error message:', uploadError.message);
      console.error('Error details:', uploadError);
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
