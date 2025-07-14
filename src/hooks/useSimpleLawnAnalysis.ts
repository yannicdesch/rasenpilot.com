import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
      console.log('=== SIMPLE ANALYSIS START ===');
      console.log('File:', imageFile.name, imageFile.size, 'bytes');

      // Step 1: Upload image to storage
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const filePath = `temp/${fileName}`;
      
      console.log('Uploading to storage...');
      const { error: uploadError } = await supabase.storage
        .from('lawn-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Step 2: Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('lawn-images')
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error('Failed to get image URL');
      }

      console.log('Image uploaded, calling analysis...');
      console.log('Public URL:', publicUrlData.publicUrl);

      // Step 3: Call simple analysis function
      console.log('Invoking edge function...');
      const { data, error: functionError } = await supabase.functions.invoke('simple-lawn-analysis', {
        body: {
          imageUrl: publicUrlData.publicUrl,
          grassType: grassType || 'unknown',
          lawnGoal: lawnGoal || 'Umfassende Rasenanalyse'
        }
      });

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