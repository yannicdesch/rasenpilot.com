
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Cloud, CloudRain, CloudDrizzle, Wind } from 'lucide-react';
import { WeatherData } from '@/services/lawnService';

interface WeatherInfoProps {
  weatherData: WeatherData | null;
  loading?: boolean;
  className?: string;
  error?: boolean;
  onRetry?: () => void;
}

const WeatherInfo = ({ weatherData, loading = false, className = '', error = false, onRetry }: WeatherInfoProps) => {
  // Function to get the appropriate weather icon
  const getWeatherIcon = (condition: string) => {
    const lowercaseCondition = condition.toLowerCase();
    if (lowercaseCondition.includes('sonnig') || lowercaseCondition.includes('klar')) {
      return <Sun className="text-yellow-500" size={20} />;
    } else if (lowercaseCondition.includes('regen')) {
      return <CloudRain className="text-blue-500" size={20} />;
    } else if (lowercaseCondition.includes('schauer') || lowercaseCondition.includes('leicht')) {
      return <CloudDrizzle className="text-blue-400" size={20} />;
    } else if (lowercaseCondition.includes('wolke') || lowercaseCondition.includes('bewölkt')) {
      return <Cloud className="text-gray-400" size={20} />;
    } else {
      return <Sun className="text-yellow-500" size={20} />;
    }
  };

  if (loading) {
    return (
      <Card className={`bg-green-50 ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wind className="text-green-500" size={20} />
            Wettereinfluss wird geladen...
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-24 flex items-center justify-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className={`bg-red-50 ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wind className="text-red-500" size={20} />
            Wettereinfluss nicht verfügbar
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-gray-600">Wetterdaten konnten nicht geladen werden.</p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="mt-2 px-4 py-1 text-sm text-green-600 border border-green-300 rounded hover:bg-green-50"
            >
              Erneut versuchen
            </button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!weatherData) {
    return (
      <Card className={`bg-green-50 ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wind className="text-green-500" size={20} />
            Wettereinfluss
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-gray-600">Wetterdaten sind derzeit nicht verfügbar.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-green-50 ${className}`}>
      <CardHeader className="bg-green-50 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {getWeatherIcon(weatherData.current.condition)}
          Wettereinfluss
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold">{weatherData.current.temp}°C</div>
          <div className="text-sm">{weatherData.current.condition}</div>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-yellow-50 rounded-md flex items-center">
            {getWeatherIcon(weatherData.current.condition)}
            <div className="ml-2">
              <p className="font-medium text-yellow-700">
                {weatherData.current.condition}
              </p>
              <p className="text-yellow-600">
                {weatherData.current.temp > 20 
                  ? 'Früh morgens bewässern, um Verdunstung zu vermeiden' 
                  : 'Normale Bewässerung empfohlen'}
              </p>
            </div>
          </div>
          
          <p className="text-gray-600">
            Wetterdaten werden verwendet, um Ihre Pflegeplanempfehlungen anzupassen und Wasser zu sparen.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherInfo;
