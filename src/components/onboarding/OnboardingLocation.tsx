
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, MapPin, Thermometer } from 'lucide-react';
import { OnboardingData } from './OnboardingFlow';

interface OnboardingLocationProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface WeatherData {
  temperature: number;
  description: string;
  location: string;
}

const OnboardingLocation: React.FC<OnboardingLocationProps> = ({ 
  data, 
  updateData, 
  onNext, 
  onBack 
}) => {
  const [zipCode, setZipCode] = useState(data.standort);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeatherData = async (zip: string) => {
    if (zip.length !== 5) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Mock weather data - in production you'd use a real weather API
      setTimeout(() => {
        setWeatherData({
          temperature: Math.round(Math.random() * 15 + 10),
          description: 'Teilweise bewölkt',
          location: `${zip}, Deutschland`
        });
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Wetterdaten konnten nicht geladen werden');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (zipCode.length === 5) {
      fetchWeatherData(zipCode);
    }
  }, [zipCode]);

  const handleNext = () => {
    if (zipCode.length !== 5) {
      setError('Bitte gib eine gültige 5-stellige Postleitzahl ein');
      return;
    }
    
    updateData({ 
      standort: zipCode,
      wetterzone: weatherData?.location || zipCode
    });
    onNext();
  };

  return (
    <Card className="border-green-100">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-green-800">
          Standort & Klima
        </CardTitle>
        <p className="text-gray-600">
          Damit wir dir regionsspezifische Tipps geben können
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="zipcode" className="text-sm font-medium">
            Deine Postleitzahl
          </Label>
          <div className="relative mt-1">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="zipcode"
              type="text"
              placeholder="12345"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              className="pl-10"
              maxLength={5}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 mt-1">{error}</p>
          )}
        </div>

        {/* Weather Display */}
        {loading && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-700">Lade Wetterdaten...</span>
            </div>
          </div>
        )}

        {weatherData && !loading && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <Thermometer className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-green-800">
                  {weatherData.temperature}°C - {weatherData.description}
                </div>
                <div className="text-sm text-green-600">
                  {weatherData.location}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>
          <Button 
            onClick={handleNext}
            disabled={zipCode.length !== 5}
            className="bg-green-600 hover:bg-green-700"
          >
            Weiter
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingLocation;
