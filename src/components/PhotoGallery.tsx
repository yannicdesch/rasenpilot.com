
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { Image, Upload } from 'lucide-react';

// Simplified component that doesn't depend on missing database tables
const PhotoGallery = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoComment, setPhotoComment] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.error('Foto-Upload ist derzeit nicht verfügbar', {
      description: 'Die entsprechenden Datenbanktabellen sind noch nicht eingerichtet.'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Neues Foto hochladen
          </CardTitle>
          <CardDescription>
            Laden Sie ein Foto Ihres Rasens hoch, um den Fortschritt zu dokumentieren
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label htmlFor="photo-title" className="block text-sm font-medium mb-1">Titel</label>
              <Input 
                id="photo-title" 
                value={photoTitle} 
                onChange={(e) => setPhotoTitle(e.target.value)} 
                placeholder="z.B. Rasen nach dem Mähen"
              />
            </div>
            
            <div>
              <label htmlFor="photo-comment" className="block text-sm font-medium mb-1">Kommentar (optional)</label>
              <Textarea 
                id="photo-comment" 
                value={photoComment}
                onChange={(e) => setPhotoComment(e.target.value)}
                placeholder="Beschreiben Sie den aktuellen Zustand Ihres Rasens"
                rows={3}
              />
            </div>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
              <label className="cursor-pointer block">
                <input 
                  type="file" 
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center justify-center py-4">
                  <Image className="h-10 w-10 text-gray-400 mb-2" />
                  {selectedFile ? (
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                  ) : (
                    <span className="text-sm text-gray-500">Klicken Sie hier, um ein Foto auszuwählen</span>
                  )}
                </div>
              </label>
            </div>
            
            <Button type="submit" className="w-full" disabled={!selectedFile}>
              Hochladen (Nicht verfügbar)
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Meine Rasenfotos</h3>
        
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Image className="h-16 w-16 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500 dark:text-gray-400">Foto-Galerie nicht verfügbar</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Die entsprechenden Datenbanktabellen sind noch nicht eingerichtet
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhotoGallery;
