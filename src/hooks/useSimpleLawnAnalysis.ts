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
      console.log('=== FAST ANALYSIS START (NO UPLOAD) ===');
      console.log('File:', imageFile.name, imageFile.size, 'bytes');

      // Step 1: Compress image if it's large
      let processedFile = imageFile;
      if (imageFile.size > 512 * 1024) { // If larger than 512KB
        console.log('⏱️ Starting compression at:', Date.now() - startTime, 'ms');
        const compressionStart = Date.now();
        
        const options = {
          maxSizeMB: 0.5, // Max 500KB for faster processing
          maxWidthOrHeight: 1024, // Smaller max dimension
          useWebWorker: true,
          fileType: 'image/jpeg',
          quality: 0.8
        };
        
        try {
          processedFile = await imageCompression(imageFile, options);
          console.log('⏱️ Compression completed in:', Date.now() - compressionStart, 'ms');
          console.log('📦 File size reduced from', imageFile.size, 'to', processedFile.size, 'bytes');
        } catch (compressionError) {
          console.warn('⚠️ Compression failed, using original file:', compressionError);
        }
      }

      // Step 2: Convert to base64 (MUCH FASTER than upload)
      console.log('⏱️ Converting to base64 at:', Date.now() - startTime, 'ms');
      const base64Start = Date.now();
      
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(processedFile);
      });

      console.log('⏱️ Base64 conversion took:', Date.now() - base64Start, 'ms');

      // Step 3: Call analysis function directly with base64
      console.log('⏱️ Starting API call at:', Date.now() - startTime, 'ms');
      console.log('Calling analysis with base64 image...');
      const apiStart = Date.now();
      
      // Add timeout to the Supabase function call
      const functionCall = supabase.functions.invoke('simple-lawn-analysis', {
        body: {
          imageBase64: base64,
          grassType: grassType || 'unknown',
          lawnGoal: lawnGoal || 'Umfassende Rasenanalyse'
        }
      });

      // Add a timeout wrapper (increased to 30 seconds to allow for server processing)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Function call timed out after 30 seconds')), 30000);
      });

      const result = await Promise.race([functionCall, timeoutPromise]);
      const { data, error: functionError } = result;

      console.log('⏱️ API call completed in:', Date.now() - apiStart, 'ms');
      console.log('⏱️ Total time:', Date.now() - startTime, 'ms');
      console.log('Edge function response:', { data, error: functionError });

      if (functionError) {
        throw new Error(`Analysis failed: ${functionError.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Analysis failed');
      }

      console.log('Analysis completed!');
      
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