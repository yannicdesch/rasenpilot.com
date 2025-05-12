
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { Image, Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

interface Photo {
  id: string;
  created_at: string;
  url: string;
  comment: string;
  title: string;
  user_id: string;
}

const PhotoGallery = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoComment, setPhotoComment] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewPhoto, setViewPhoto] = useState<Photo | null>(null);

  const fetchPhotos = async (): Promise<Photo[]> => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return [];
    }
    
    // This would be a real query to your Supabase table
    const { data, error } = await supabase
      .from('lawn_photos')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching photos:', error);
      throw new Error(error.message);
    }
    
    return data || [];
  };

  const { data: photos = [], refetch: refetchPhotos, isLoading } = useQuery({
    queryKey: ['lawn-photos'],
    queryFn: fetchPhotos,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Bitte wählen Sie ein Foto aus.');
      return;
    }
    
    setIsUploading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Sie müssen angemeldet sein, um Fotos hochzuladen.');
        return;
      }
      
      // Upload to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('lawn_photos')
        .upload(`${session.user.id}/${fileName}`, selectedFile);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data: publicUrl } = supabase.storage
        .from('lawn_photos')
        .getPublicUrl(`${session.user.id}/${fileName}`);
      
      // Store metadata in the database
      const { error: dbError } = await supabase
        .from('lawn_photos')
        .insert({
          user_id: session.user.id,
          url: publicUrl.publicUrl,
          title: photoTitle || 'Mein Rasen',
          comment: photoComment,
        });
      
      if (dbError) {
        throw dbError;
      }
      
      toast.success('Foto wurde erfolgreich hochgeladen!');
      setSelectedFile(null);
      setPhotoTitle('');
      setPhotoComment('');
      refetchPhotos();
      
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast.error(`Fehler beim Hochladen: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      const { error } = await supabase
        .from('lawn_photos')
        .delete()
        .eq('id', photoId);
      
      if (error) {
        throw error;
      }
      
      toast.success('Foto wurde gelöscht');
      refetchPhotos();
      setViewPhoto(null);
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error deleting photo:', error);
      toast.error(`Fehler beim Löschen: ${error.message}`);
    }
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
            
            <Button type="submit" className="w-full" disabled={isUploading || !selectedFile}>
              {isUploading ? 'Wird hochgeladen...' : 'Hochladen'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Meine Rasenfotos</h3>
        
        {isLoading ? (
          <div className="text-center py-8">Lade Fotos...</div>
        ) : photos.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Image className="h-16 w-16 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500 dark:text-gray-400">Keine Fotos vorhanden</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Laden Sie Ihr erstes Foto hoch, um Ihren Fortschritt zu dokumentieren
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <Card 
                key={photo.id} 
                className="overflow-hidden cursor-pointer transition-all hover:shadow-md"
                onClick={() => {
                  setViewPhoto(photo);
                  setIsDialogOpen(true);
                }}
              >
                <div className="aspect-square relative">
                  <img 
                    src={photo.url} 
                    alt={photo.title} 
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardContent className="p-3">
                  <h4 className="font-medium truncate">{photo.title}</h4>
                  <p className="text-xs text-gray-500">
                    {new Date(photo.created_at).toLocaleDateString('de-DE')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {viewPhoto && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{viewPhoto.title}</DialogTitle>
              <DialogDescription>
                {new Date(viewPhoto.created_at).toLocaleDateString('de-DE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </DialogDescription>
            </DialogHeader>
            
            <div className="max-h-[60vh] overflow-hidden">
              <img 
                src={viewPhoto.url} 
                alt={viewPhoto.title}
                className="w-full object-contain"
              />
            </div>
            
            {viewPhoto.comment && (
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                <p className="text-sm">{viewPhoto.comment}</p>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="destructive" 
                onClick={() => handleDeletePhoto(viewPhoto.id)}
              >
                <X className="h-4 w-4 mr-2" />
                Löschen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PhotoGallery;
