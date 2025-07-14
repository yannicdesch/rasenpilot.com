import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import imageCompression from 'browser-image-compression';

interface AnalysisResult {
  overall_health: string;
  grass_condition: string;
  problems: string[];
  recommendations: string[];
  timeline: string;
  score: string;
}

interface UseSimpleLawnAnalysisReturn {
  analyze: (imageFile: File, grassType?: string, lawnGoal?: string) => Promise<AnalysisResult>;
  isLoading: boolean;
  error: string | null;
}

export const useSimpleLawnAnalysis = (): UseSimpleLawnAnalysisReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (
    imageFile: File, 
    grassType?: string, 
    lawnGoal?: string
  ): Promise<AnalysisResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const startTime = Date.now();
      console.log('=== SIMPLE ANALYSIS START ===');
      console.log('File:', imageFile.name, imageFile.size, 'bytes');

      // Step 0: Compress image if it's large
      let processedFile = imageFile;
      if (imageFile.size > 1024 * 1024) { // If larger than 1MB
        console.log('⏱️ Starting compression at:', Date.now() - startTime, 'ms');
        const compressionStart = Date.now();
        
        const options = {
          maxSizeMB: 1, // Max 1MB
          maxWidthOrHeight: 1920, // Max dimension
          useWebWorker: true,
          fileType: 'image/jpeg'
        };
        
        try {
          processedFile = await imageCompression(imageFile, options);
          console.log('⏱️ Compression completed in:', Date.now() - compressionStart, 'ms');
          console.log('📦 File size reduced from', imageFile.size, 'to', processedFile.size, 'bytes');
        } catch (compressionError) {
          console.warn('⚠️ Compression failed, using original file:', compressionError);
        }
      }

      // Step 1: Upload image to storage
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const filePath = `temp/${fileName}`;
      
      console.log('⏱️ Starting upload at:', Date.now() - startTime, 'ms');
      console.log('Uploading to storage...');
      const uploadStart = Date.now();
      
      const { error: uploadError } = await supabase.storage
        .from('lawn-images')
        .upload(filePath, processedFile);

      console.log('⏱️ Upload completed in:', Date.now() - uploadStart, 'ms');

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Step 2: Get public URL
      const urlStart = Date.now();
      const { data: publicUrlData } = supabase.storage
        .from('lawn-images')
        .getPublicUrl(filePath);

      console.log('⏱️ URL generation took:', Date.now() - urlStart, 'ms');

      if (!publicUrlData?.publicUrl) {
        throw new Error('Failed to get image URL');
      }

      console.log('Image uploaded, calling analysis...');
      console.log('Public URL:', publicUrlData.publicUrl);

      // Step 3: Call simple analysis function
      console.log('⏱️ Starting API call at:', Date.now() - startTime, 'ms');
      console.log('Invoking edge function...');
      const apiStart = Date.now();
      
      const { data, error: functionError } = await supabase.functions.invoke('simple-lawn-analysis', {
        body: {
          imageUrl: publicUrlData.publicUrl,
          grassType: grassType || 'unknown',
          lawnGoal: lawnGoal || 'Umfassende Rasenanalyse'
        }
      });

      console.log('⏱️ API call completed in:', Date.now() - apiStart, 'ms');
      console.log('⏱️ Total time so far:', Date.now() - startTime, 'ms');
      console.log('Edge function response:', { data, error: functionError });

      if (functionError) {
        throw new Error(`Analysis failed: ${functionError.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Analysis failed');
      }

      console.log('Analysis completed!');
      
      // Step 4: Clean up temp file (optional)
      supabase.storage.from('lawn-images').remove([filePath]).catch(console.warn);

      return data.analysis;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Analysis error:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { analyze, isLoading, error };
};