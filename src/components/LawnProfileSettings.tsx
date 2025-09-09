import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Leaf, MapPin, Target, Sparkles, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LawnProfileData {
  grass_type: string;
  lawn_size: string;
  lawn_goal: string;
  zip_code: string;
  soil_type?: string;
  has_children?: boolean;
  has_pets?: boolean;
}

const LawnProfileSettings = () => {
  const [profile, setProfile] = useState<LawnProfileData>({
    grass_type: '',
    lawn_size: '',
    lawn_goal: '',
    zip_code: '',
    soil_type: '',
    has_children: false,
    has_pets: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('lawn_profiles')
        .select('*')
        .eq('user_id', user.user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        toast.error('Fehler beim Laden des Profils');
        return;
      }

      if (data) {
        setProfile({
          grass_type: data.grass_type || '',
          lawn_size: data.lawn_size || '',
          lawn_goal: data.lawn_goal || '',
          zip_code: data.zip_code || '',
          soil_type: data.soil_type || '',
          has_children: data.has_children || false,
          has_pets: data.has_pets || false
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Fehler beim Laden des Profils');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase
        .from('lawn_profiles')
        .upsert({
          user_id: user.user.id,
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving profile:', error);
        toast.error('Fehler beim Speichern des Profils');
        return;
      }

      toast.success('Rasen-Profil erfolgreich gespeichert!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Fehler beim Speichern des Profils');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof LawnProfileData, value: string | boolean) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            Rasen-Profil
          </CardTitle>
          <CardDescription>
            Verwalten Sie Ihre Rasen-Einstellungen und Präferenzen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-600" />
          Rasen-Profil
        </CardTitle>
        <CardDescription>
          Verwalten Sie Ihre Rasen-Einstellungen und Präferenzen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Grass Type */}
          <div className="space-y-2">
            <Label htmlFor="grass_type" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              Grasart
            </Label>
            <Select value={profile.grass_type} onValueChange={(value) => handleChange('grass_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Grasart auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zier">Zierrasen</SelectItem>
                <SelectItem value="sport">Sportrasen</SelectItem>
                <SelectItem value="schattenrasen">Schattenrasen</SelectItem>
                <SelectItem value="trockenrasen">Trockenrasen</SelectItem>
                <SelectItem value="universalrasen">Universalrasen</SelectItem>
                <SelectItem value="unbekannt">Unbekannt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lawn Size */}
          <div className="space-y-2">
            <Label htmlFor="lawn_size" className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Rasengröße
            </Label>
            <Select value={profile.lawn_size} onValueChange={(value) => handleChange('lawn_size', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Rasengröße auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="klein">Klein (bis 50 m²)</SelectItem>
                <SelectItem value="mittel">Mittel (50-200 m²)</SelectItem>
                <SelectItem value="groß">Groß (200-500 m²)</SelectItem>
                <SelectItem value="sehr-groß">Sehr groß (über 500 m²)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lawn Goal */}
          <div className="space-y-2">
            <Label htmlFor="lawn_goal" className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              Rasenziel
            </Label>
            <Select value={profile.lawn_goal} onValueChange={(value) => handleChange('lawn_goal', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Rasenziel auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gesunder-rasen">Gesunder Rasen</SelectItem>
                <SelectItem value="dicht">Dichter Rasen</SelectItem>
                <SelectItem value="gruen">Grüner Rasen</SelectItem>
                <SelectItem value="unkrautfrei">Unkrautfreier Rasen</SelectItem>
                <SelectItem value="pflegeleicht">Pflegeleichter Rasen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ZIP Code */}
          <div className="space-y-2">
            <Label htmlFor="zip_code" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-600" />
              Postleitzahl
            </Label>
            <Input
              id="zip_code"
              type="text"
              value={profile.zip_code}
              onChange={(e) => handleChange('zip_code', e.target.value)}
              placeholder="z.B. 10115"
              maxLength={5}
            />
          </div>

          {/* Soil Type */}
          <div className="space-y-2">
            <Label htmlFor="soil_type">Bodenart (optional)</Label>
            <Select value={profile.soil_type || ''} onValueChange={(value) => handleChange('soil_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Bodenart auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sand">Sandboden</SelectItem>
                <SelectItem value="lehm">Lehmboden</SelectItem>
                <SelectItem value="ton">Tonboden</SelectItem>
                <SelectItem value="humus">Humusboden</SelectItem>
                <SelectItem value="gemischt">Gemischter Boden</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-medium text-gray-900">Zusätzliche Informationen</h4>
          <div className="flex flex-col space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={profile.has_children}
                onChange={(e) => handleChange('has_children', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Kinder nutzen den Rasen</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={profile.has_pets}
                onChange={(e) => handleChange('has_pets', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Haustiere nutzen den Rasen</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full md:w-auto"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Speichert...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Profil speichern
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LawnProfileSettings;