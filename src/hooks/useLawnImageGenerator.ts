import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GeneratedImage {
  imageData: string; // base64 data
  type: 'before' | 'after';
}

export const useLawnImageGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{
    before?: string;
    after?: string;
  }>({});

  const generateLawnImages = async () => {
    setIsGenerating(true);
    
    try {
      // Generate "before" image (bad lawn)
      const beforePrompt = "A residential lawn in poor condition with patchy yellow grass, brown spots, weeds, bare soil patches, uneven growth, and visible lawn problems. The grass looks unhealthy, dry, and neglected. Photographed from a medium distance showing the full lawn area with a house partially visible in the background. Realistic photography style, natural lighting, suburban setting.";
      
      const beforeResponse = await supabase.functions.invoke('generate-lawn-images', {
        body: { 
          prompt: beforePrompt,
          type: 'before'
        }
      });

      if (beforeResponse.error) {
        throw new Error(beforeResponse.error.message);
      }

      // Generate "after" image (good lawn)  
      const afterPrompt = "A beautiful, perfectly maintained residential lawn with lush green grass, uniform growth, vibrant emerald color, no weeds or bare spots. The grass is thick, healthy, and evenly cut with perfect lawn stripes. Photographed from a medium distance showing the full pristine lawn area with a house partially visible in the background. Realistic photography style, natural lighting, suburban setting.";
      
      const afterResponse = await supabase.functions.invoke('generate-lawn-images', {
        body: { 
          prompt: afterPrompt,
          type: 'after'
        }
      });

      if (afterResponse.error) {
        throw new Error(afterResponse.error.message);
      }

      const beforeImageData = `data:image/webp;base64,${beforeResponse.data.imageData}`;
      const afterImageData = `data:image/webp;base64,${afterResponse.data.imageData}`;

      setGeneratedImages({
        before: beforeImageData,
        after: afterImageData
      });

      toast.success('Lawn images generated successfully!');
      return { before: beforeImageData, after: afterImageData };

    } catch (error) {
      console.error('Error generating lawn images:', error);
      toast.error(`Failed to generate images: ${error.message}`);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateLawnImages,
    isGenerating,
    generatedImages
  };
};