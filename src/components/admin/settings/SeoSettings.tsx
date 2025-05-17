
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Save } from 'lucide-react';

interface SeoSettingsProps {
  seoSettings: {
    defaultMetaTitle: string;
    defaultMetaDescription: string;
    defaultKeywords: string;
    robotsTxt: string;
  };
  isLoading: boolean;
  onSave: (seoSettings: any) => Promise<boolean>;
}

const SeoSettings = ({ seoSettings, isLoading, onSave }: SeoSettingsProps) => {
  const [localSettings, setLocalSettings] = React.useState({ ...seoSettings });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async () => {
    await onSave(localSettings);
  };

  return (
    <>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label htmlFor="defaultMetaTitle">Default Meta Title</Label>
          <Input
            id="defaultMetaTitle"
            name="defaultMetaTitle"
            value={localSettings.defaultMetaTitle}
            onChange={handleChange}
            placeholder="Default page title for SEO"
          />
          <p className="text-xs text-muted-foreground mt-1">Recommended length: 50-60 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultMetaDescription">Default Meta Description</Label>
          <Textarea
            id="defaultMetaDescription"
            name="defaultMetaDescription"
            value={localSettings.defaultMetaDescription}
            onChange={handleChange}
            placeholder="Default page description for SEO"
            rows={4}
          />
          <p className="text-xs text-muted-foreground mt-1">Recommended length: 150-160 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultKeywords">Default Keywords</Label>
          <Textarea
            id="defaultKeywords"
            name="defaultKeywords"
            value={localSettings.defaultKeywords}
            onChange={handleChange}
            placeholder="keyword1, keyword2, keyword3"
            rows={2}
          />
          <p className="text-xs text-muted-foreground mt-1">Comma-separated list of keywords</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="robotsTxt">robots.txt Content</Label>
          <Textarea
            id="robotsTxt"
            name="robotsTxt"
            value={localSettings.robotsTxt}
            onChange={handleChange}
            placeholder="User-agent: *\nAllow: /"
            rows={6}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">Instructions for search engine crawlers</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end pt-6 border-t">
        <Button 
          onClick={handleSaveSettings} 
          disabled={isLoading}
        >
          <Save className="mr-2 h-4 w-4" />
          Save SEO Settings
        </Button>
      </CardFooter>
    </>
  );
};

export default SeoSettings;
