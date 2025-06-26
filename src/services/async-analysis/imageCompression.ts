
import imageCompression from 'browser-image-compression';

export const compressImage = async (imageFile: File): Promise<File> => {
  console.log('Starting image compression...');
  console.log('Original file size:', imageFile.size, 'bytes');
  
  const compressedFile = await imageCompression(imageFile, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1024,
    useWebWorker: false
  });
  
  console.log('Compressed file size:', compressedFile.size, 'bytes');
  console.log('Compression ratio:', ((imageFile.size - compressedFile.size) / imageFile.size * 100).toFixed(1) + '%');
  
  return compressedFile;
};
