
import React, { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { Camera, Loader2 } from 'lucide-react';

interface AvatarUploadProps {
  uid: string;
  url: string | null;
  onAvatarUpdate: (url: string) => void;
  name: string | undefined;
  email: string | undefined;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ uid, url, onAvatarUpdate, name, email }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(url);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${uid}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = await supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;
      
      // Update avatar URL in user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(publicUrl);
      onAvatarUpdate(publicUrl);
      toast.success('Profilbild erfolgreich aktualisiert');
    } catch (error: any) {
      toast.error(`Fehler beim Upload: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center">
      <Avatar className="h-24 w-24 cursor-pointer border-2 border-white shadow-md hover:opacity-90" 
        onClick={handleButtonClick}>
        <AvatarImage src={avatarUrl || ''} />
        <AvatarFallback className="bg-green-100 text-green-800 text-xl">
          {name?.charAt(0) || email?.charAt(0) || '?'}
        </AvatarFallback>
      </Avatar>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={uploadAvatar}
        accept="image/*"
        className="hidden"
      />
      
      <Button 
        variant="outline" 
        size="sm"
        className="mt-2 text-xs"
        onClick={handleButtonClick}
        disabled={uploading}
      >
        {uploading ? (
          <>
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Wird hochgeladen...
          </>
        ) : (
          <>
            <Camera className="mr-1 h-3 w-3" />
            Profilbild ändern
          </>
        )}
      </Button>
    </div>
  );
};

export default AvatarUpload;
