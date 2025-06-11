
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, User, MapPin, Leaf, Target, Calendar, Home } from 'lucide-react';
import { useLawn } from '@/context/LawnContext';
import { toast } from 'sonner';

const ProfileCompletion: React.FC = () => {
  const { profile, setProfile, syncProfileWithSupabase } = useLawn();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    zipCode: profile?.zipCode || '',
    grassType: profile?.grassType || '',
    lawnSize: profile?.lawnSize || '',
    lawnGoal: profile?.lawnGoal || '',
    soilType: profile?.soilType || '',
    hasChildren: profile?.hasChildren || false,
    hasPets: profile?.hasPets || false,
    lastMowed: profile?.lastMowed || '',
    lastFertilized: profile?.lastFertilized || '',
  });

  // Calculate completion percentage
  const calculateCompletion = () => {
    const requiredFields = ['name', 'zipCode', 'grassType', 'lawnSize', 'lawnGoal'];
    const optionalFields = ['soilType', 'lastMowed', 'lastFertilized'];
    
    const requiredCompleted = requiredFields.filter(field => formData[field as keyof typeof formData]).length;
    const optionalCompleted = optionalFields.filter(field => formData[field as keyof typeof formData]).length;
    
    // Required fields are worth 70%, optional fields 30%
    const requiredScore = (requiredCompleted / requiredFields.length) * 70;
    const optionalScore = (optionalCompleted / optionalFields.length) * 30;
    
    return Math.round(requiredScore + optionalScore);
  };

  const completionPercentage = calculateCompletion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedProfile = {
        ...profile,
        ...formData,
      };
      
      setProfile(updatedProfile);
      await syncProfileWithSupabase();
      
      toast.success('Profil aktualisiert', {
        description: `Ihr Profil ist jetzt zu ${completionPercentage}% vollständig.`
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Fehler beim Speichern des Profils');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3 mb-4">
          <User className="h-6 w-6 text-green-600" />
          <CardTitle className="text-xl">Profil vervollständigen</CardTitle>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Vollständigkeit</span>
            <span className="font-medium">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          <p className="text-sm text-gray-600">
            Vervollständigen Sie Ihr Profil für bessere Empfehlungen
          </p>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User className="h-4 w-4" />
              Grunddaten
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ihr Name"
                />
              </div>
              
              <div>
                <Label htmlFor="zipCode">Postleitzahl *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="z.B. 12345"
                />
              </div>
            </div>
          </div>

          {/* Lawn Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Leaf className="h-4 w-4" />
              Rasen-Informationen
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grassType">Rasentyp *</Label>
                <Select value={formData.grassType} onValueChange={(value) => handleInputChange('grassType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rasentyp auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sport">Sportrasen</SelectItem>
                    <SelectItem value="zier">Zierrasen</SelectItem>
                    <SelectItem value="gebrauch">Gebrauchsrasen</SelectItem>
                    <SelectItem value="schatten">Schattenrasen</SelectItem>
                    <SelectItem value="weiss-nicht">Weiß nicht</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="lawnSize">Rasenfläche *</Label>
                <Select value={formData.lawnSize} onValueChange={(value) => handleInputChange('lawnSize', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Größe auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="klein">Klein (bis 100m²)</SelectItem>
                    <SelectItem value="mittel">Mittel (100-500m²)</SelectItem>
                    <SelectItem value="gross">Groß (über 500m²)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lawnGoal">Ziel *</Label>
                <Select value={formData.lawnGoal} onValueChange={(value) => handleInputChange('lawnGoal', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ziel auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gesund">Gesunder grüner Rasen</SelectItem>
                    <SelectItem value="dicht">Dichter Rasen</SelectItem>
                    <SelectItem value="unkraut">Unkraut bekämpfen</SelectItem>
                    <SelectItem value="pflegeleicht">Pflegeleichter Rasen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="soilType">Bodentyp</Label>
                <Select value={formData.soilType} onValueChange={(value) => handleInputChange('soilType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Bodentyp auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lehm">Lehmboden</SelectItem>
                    <SelectItem value="sand">Sandboden</SelectItem>
                    <SelectItem value="ton">Tonboden</SelectItem>
                    <SelectItem value="weiss-nicht">Weiß nicht</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Home className="h-4 w-4" />
              Zusätzliche Informationen
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lastMowed">Letztes Mähen</Label>
                <Input
                  id="lastMowed"
                  type="date"
                  value={formData.lastMowed}
                  onChange={(e) => handleInputChange('lastMowed', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="lastFertilized">Letzte Düngung</Label>
                <Input
                  id="lastFertilized"
                  type="date"
                  value={formData.lastFertilized}
                  onChange={(e) => handleInputChange('lastFertilized', e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label htmlFor="hasChildren">Kinder im Haushalt</Label>
                <p className="text-sm text-gray-600">Beeinflusst Produktempfehlungen</p>
              </div>
              <Switch
                id="hasChildren"
                checked={formData.hasChildren}
                onCheckedChange={(checked) => handleInputChange('hasChildren', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label htmlFor="hasPets">Haustiere</Label>
                <p className="text-sm text-gray-600">Beeinflusst Produktempfehlungen</p>
              </div>
              <Switch
                id="hasPets"
                checked={formData.hasPets}
                onCheckedChange={(checked) => handleInputChange('hasPets', checked)}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Speichere...' : 'Profil speichern'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletion;
