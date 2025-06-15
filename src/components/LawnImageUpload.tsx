
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Upload, Image } from 'lucide-react';
import { toast } from 'sonner';

interface LawnImageUploadProps {
  onImageSelected: (imageUrl: string) => void;
  currentImage?: string;
}

const LawnImageUpload: React.FC<LawnImageUploadProps> = ({ onImageSelected, currentImage }) => {
  const [preview, setPreview] = useState<string | undefined>(currentImage);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB - increased from 5MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Das Bild ist zu groß", {
        description: "Bitte wähle ein Bild unter 10MB."
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Ungültiger Dateityp", {
        description: "Bitte wähle ein Bild (JPG, PNG, etc.)."
      });
      return;
    }

    setIsUploading(true);

    // Create a URL for preview
    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
    onImageSelected(imageUrl);
    
    // In a real-world scenario, you would upload the image to a server or storage service here
    // For now, we'll just simulate a delay
    setTimeout(() => {
      setIsUploading(false);
      toast.success("Bild erfolgreich hochgeladen", {
        description: "Dein Rasenbild wurde gespeichert."
      });
    }, 1000);
  };

  const triggerFileInput = () => {
    document.getElementById('lawn-image-input')?.click();
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
        {preview ? (
          <div className="relative w-full">
            <AspectRatio ratio={16/9} className="bg-gray-100 rounded-md overflow-hidden">
              <img 
                src={preview} 
                alt="Vorschau deines Rasens" 
                className="w-full h-full object-cover"
              />
            </AspectRatio>
            <Button 
              variant="outline" 
              size="sm" 
              className="absolute bottom-2 right-2 bg-white shadow-md"
              onClick={triggerFileInput}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Ändern
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <Button 
              onClick={triggerFileInput}
              disabled={isUploading}
              className="bg-green-600 hover:bg-green-700 text-white mb-2"
            >
              <Upload className="h-4 w-4 mr-2" />
              Rasenbild hochladen
            </Button>
            <span className="text-sm text-gray-500 font-medium">oder hier klicken zum Hochladen</span>
            <span className="text-xs text-gray-400 mt-1">JPG, PNG (max. 10MB)</span>
          </div>
        )}
        <input 
          id="lawn-image-input"
          type="file" 
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>
      
      {isUploading && (
        <div className="text-sm text-center text-gray-500">
          Bild wird hochgeladen...
        </div>
      )}
    </div>
  );
};

export default LawnImageUpload;
