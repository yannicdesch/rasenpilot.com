import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WeatherData {
  location: string;
  current: {
    temp: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    icon: string;
    uvIndex?: number;
    soilTemp?: number;
    dewPoint?: number;
    evapotranspiration?: number;
    lawnCareConditions?: {
      mowing?: boolean;
      fertilizing?: boolean;
      watering?: boolean;
      seeding?: boolean;
    };
  };
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
    chanceOfRain: number;
    soilTemp?: number;
    evapotranspiration?: number;
  }>;
}

interface WeatherEnhancedResultsProps {
  zipCode?: string;
  recommendations?: string[];
}

const WeatherEnhancedResults: React.FC<WeatherEnhancedResultsProps> = ({ 
  zipCode, 
  recommendations = [] 
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (zipCode) {
      fetchWeatherData();
    }
  }, [zipCode]);

  const fetchWeatherData = async () => {
    if (!zipCode) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-weather-data', {
        body: { zipCode, countryCode: 'DE' }
      });

      if (data?.success) {
        setWeatherData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes('rain') || lower.includes('regen')) return <CloudRain className="h-5 w-5" />;
    if (lower.includes('cloud') || lower.includes('wolke')) return <Cloud className="h-5 w-5" />;
    return <Sun className="h-5 w-5" />;
  };

  const getTimingRecommendation = () => {
    if (!weatherData) return [];
    
    const advice = [];
    const nextRain = weatherData.forecast.find(day => day.chanceOfRain > 50);
    
    if (nextRain) {
      advice.push(`🌧️ Regen erwartet (${nextRain.day}): Bewässerung pausieren`);
    }
    
    if (weatherData.current.temp > 25) {
      advice.push('🌡️ Hohe Temperaturen: Nur früh morgens oder abends bewässern');
    }
    
    if (weatherData.current.humidity < 40) {
      advice.push('💧 Niedrige Luftfeuchtigkeit: Häufiger, aber kürzer bewässern');
    }

  return advice;
  };

  const combinedRecs = Array.from(new Set([...(getTimingRecommendation() as string[]), ...recommendations]));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Wetterdaten werden geladen...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!weatherData) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getWeatherIcon(weatherData.current.condition)}
            Aktuelle Wetterbedingungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-primary" />
              <span>{weatherData.current.temp}°C</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-primary" />
              <span>{weatherData.current.humidity}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-muted-foreground" />
              <span>{weatherData.current.windSpeed} km/h</span>
            </div>
            <div>
              <Badge variant="outline">{weatherData.current.condition}</Badge>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">5-Tage Prognose:</h4>
            <div className="grid grid-cols-5 gap-2">
              {weatherData.forecast.map((day, index) => (
                <div key={index} className="text-center p-2 bg-muted rounded">
                  <div className="text-sm font-medium">{day.day}</div>
                  <div className="text-xs">{day.high}°/{day.low}°</div>
                  <div className="text-xs text-primary">{day.chanceOfRain}%</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {combinedRecs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🎯 RasenPilot empfiehlt</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {combinedRecs.map((tip, index) => (
                <li key={index} className="text-sm bg-muted p-2 rounded">{tip}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default WeatherEnhancedResults;