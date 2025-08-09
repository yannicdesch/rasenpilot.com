import React from 'react';
import { Button } from '@/components/ui/button';
import { useLawnImageGenerator } from '@/hooks/useLawnImageGenerator';
import { Loader2, Wand2 } from 'lucide-react';

interface LawnImageGeneratorProps {
  onImagesGenerated?: (images: { before: string; after: string }) => void;
}

const LawnImageGenerator: React.FC<LawnImageGeneratorProps> = ({ onImagesGenerated }) => {
  const { generateLawnImages, isGenerating, generatedImages } = useLawnImageGenerator();

  const handleGenerate = async () => {
    try {
      const images = await generateLawnImages();
      if (images && onImagesGenerated) {
        onImagesGenerated(images);
      }
    } catch (error) {
      console.error('Failed to generate images:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="bg-green-600 hover:bg-green-700"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Images...
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-4 w-4" />
            Generate Before/After Images
          </>
        )}
      </Button>

      {generatedImages.before && generatedImages.after && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Before (Bad Lawn)</h4>
            <img 
              src={generatedImages.before} 
              alt="Bad lawn before treatment"
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">After (Good Lawn)</h4>
            <img 
              src={generatedImages.after} 
              alt="Good lawn after treatment"
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LawnImageGenerator;