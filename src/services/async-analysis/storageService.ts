
import { supabase } from '@/integrations/supabase/client';

export const uploadImageToStorage = async (
  compressedFile: File,
  userId?: string
): Promise<string> => {
  // Create unique file path
  const fileExt = compressedFile.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = userId ? `${userId}/${fileName}` : `anonymous/${fileName}`;
  
  console.log('Uploading to path:', filePath);
  console.log('Starting storage upload...');
  console.log('Bucket: lawn-images, File path:', filePath, 'File size:', compressedFile.size);
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('lawn-images')
    .upload(filePath, compressedFile);
  
  if (uploadError) {
    console.error('Upload error details:', uploadError);
    console.error('Upload error message:', uploadError.message);
    throw new Error(`Upload failed: ${uploadError.message}`);
  }
  
  console.log('Upload successful:', uploadData);
  console.log('Upload path confirmed:', uploadData.path);
  
  return filePath;
};
