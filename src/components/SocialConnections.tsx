
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';
import { Twitter, Facebook, Instagram, Linkedin, Link, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SocialLink {
  platform: string;
  url: string;
  connected: boolean;
}

const SocialConnections: React.FC = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { platform: 'twitter', url: '', connected: false },
    { platform: 'facebook', url: '', connected: false },
    { platform: 'instagram', url: '', connected: false },
    { platform: 'linkedin', url: '', connected: false }
  ]);
  
  const [currentPlatform, setCurrentPlatform] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    const fetchSocialLinks = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.social_links) {
        setSocialLinks(user.user_metadata.social_links);
      }
    };
    
    fetchSocialLinks();
  }, []);
  
  const handleConnect = (platform: string) => {
    setCurrentPlatform(platform);
    const existingLink = socialLinks.find(link => link.platform === platform);
    if (existingLink) {
      setCurrentUrl(existingLink.url);
    } else {
      setCurrentUrl('');
    }
    setOpen(true);
  };
  
  const handleSave = async () => {
    if (!currentPlatform) return;
    
    // Validate URL
    try {
      new URL(currentUrl);
    } catch (_) {
      toast.error('Bitte geben Sie eine gültige URL ein');
      return;
    }
    
    const updatedLinks = socialLinks.map(link => 
      link.platform === currentPlatform 
        ? { ...link, url: currentUrl, connected: true }
        : link
    );
    
    setSocialLinks(updatedLinks);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { social_links: updatedLinks }
      });
      
      if (error) throw error;
      
      toast.success('Social Media Verbindung gespeichert');
      setOpen(false);
    } catch (error: any) {
      toast.error(`Fehler beim Speichern: ${error.message}`);
    }
  };
  
  const getPlatformIcon = (platform: string, connected: boolean) => {
    const commonProps = { size: 18, className: connected ? 'text-green-500' : 'text-muted-foreground' };
    
    switch (platform) {
      case 'twitter':
        return <Twitter {...commonProps} />;
      case 'facebook':
        return <Facebook {...commonProps} />;
      case 'instagram':
        return <Instagram {...commonProps} />;
      case 'linkedin':
        return <Linkedin {...commonProps} />;
      default:
        return <Link {...commonProps} />;
    }
  };
  
  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return 'Twitter';
      case 'facebook':
        return 'Facebook';
      case 'instagram':
        return 'Instagram';
      case 'linkedin':
        return 'LinkedIn';
      default:
        return platform;
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Social Media Verbindungen</h3>
      
      <div className="grid grid-cols-2 gap-2">
        {socialLinks.map((link) => (
          <Button
            key={link.platform}
            variant="outline"
            className="justify-start space-x-2"
            onClick={() => handleConnect(link.platform)}
          >
            {getPlatformIcon(link.platform, link.connected)}
            <span>{getPlatformName(link.platform)}</span>
            {link.connected && <CheckCircle size={14} className="ml-auto text-green-500" />}
          </Button>
        ))}
      </div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentPlatform && getPlatformName(currentPlatform)} verbinden
            </DialogTitle>
            <DialogDescription>
              Geben Sie die URL zu Ihrem {currentPlatform && getPlatformName(currentPlatform)}-Profil ein.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="social-url">Profil URL</Label>
            <Input
              id="social-url"
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              className="mt-2"
              placeholder={`https://${currentPlatform}.com/username`}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SocialConnections;
