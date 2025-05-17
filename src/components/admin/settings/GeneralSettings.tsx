
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Save, Trash2 } from 'lucide-react';

interface GeneralSettingsProps {
  settings: {
    siteName: string;
    siteTagline: string;
    siteEmail: string;
    sitePhone: string;
    siteAddress: string;
    googleAnalyticsId: string;
    showLovableBadge: boolean;
  };
  isLoading: boolean;
  onSave: (settings: any) => Promise<boolean>;
  onClearCache: () => Promise<boolean>;
}

const GeneralSettings = ({ settings, isLoading, onSave, onClearCache }: GeneralSettingsProps) => {
  const [localSettings, setLocalSettings] = React.useState({ ...settings });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          <Label htmlFor="siteName">Website Name</Label>
          <Input
            id="siteName"
            name="siteName"
            value={localSettings.siteName}
            onChange={handleChange}
            placeholder="Your website name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="siteTagline">Tagline</Label>
          <Input
            id="siteTagline"
            name="siteTagline"
            value={localSettings.siteTagline}
            onChange={handleChange}
            placeholder="Your website tagline"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="siteEmail">Contact Email</Label>
            <Input
              id="siteEmail"
              name="siteEmail"
              type="email"
              value={localSettings.siteEmail}
              onChange={handleChange}
              placeholder="contact@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sitePhone">Contact Phone</Label>
            <Input
              id="sitePhone"
              name="sitePhone"
              value={localSettings.sitePhone}
              onChange={handleChange}
              placeholder="+1 234 567 8901"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="siteAddress">Business Address</Label>
          <Input
            id="siteAddress"
            name="siteAddress"
            value={localSettings.siteAddress}
            onChange={handleChange}
            placeholder="123 Main St, City, Country"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
          <Input
            id="googleAnalyticsId"
            name="googleAnalyticsId"
            value={localSettings.googleAnalyticsId}
            onChange={handleChange}
            placeholder="G-XXXXXXXXXX"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="showLovableBadge" className="text-base font-medium">Show "Powered by Lovable" Badge</Label>
            <p className="text-sm text-muted-foreground">Display a small badge in the footer</p>
          </div>
          <Switch
            id="showLovableBadge"
            checked={localSettings.showLovableBadge}
            onCheckedChange={(checked) => 
              setLocalSettings(prev => ({ ...prev, showLovableBadge: checked }))
            }
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col md:flex-row gap-3 pt-6 border-t">
        <Button 
          className="w-full md:w-auto" 
          onClick={handleSaveSettings} 
          disabled={isLoading}
        >
          <Save className="mr-2 h-4 w-4" />
          Save General Settings
        </Button>
        <Button 
          variant="outline"
          className="w-full md:w-auto" 
          onClick={onClearCache}
          disabled={isLoading}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear Cache
        </Button>
      </CardFooter>
    </>
  );
};

export default GeneralSettings;
