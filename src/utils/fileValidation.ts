
// File upload security utilities

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_DIMENSIONS = 4096; // 4K max width/height

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateImageFile = (file: File): FileValidationResult => {
  const errors: string[] = [];

  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    errors.push(`Ungültiger Dateityp. Erlaubt: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`Datei zu groß. Maximum: ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  // Check file name for malicious patterns
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    errors.push('Ungültiger Dateiname');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateImageDimensions = (file: File): Promise<FileValidationResult> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      const errors: string[] = [];
      
      if (img.width > MAX_IMAGE_DIMENSIONS || img.height > MAX_IMAGE_DIMENSIONS) {
        errors.push(`Bildabmessungen zu groß. Maximum: ${MAX_IMAGE_DIMENSIONS}x${MAX_IMAGE_DIMENSIONS}px`);
      }
      
      resolve({
        isValid: errors.length === 0,
        errors
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        isValid: false,
        errors: ['Ungültiges Bild oder beschädigte Datei']
      });
    };
    
    img.src = url;
  });
};

export const sanitizeFileName = (fileName: string): string => {
  // Remove potentially dangerous characters
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
};

export const generateSecureFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop()?.toLowerCase() || '';
  
  return `${timestamp}_${randomString}.${extension}`;
};
