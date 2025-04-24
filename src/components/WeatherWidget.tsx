
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CloudRain, Thermometer, Wind } from 'lucide-react';

type WeatherData = {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
};

// Mock weather data (would come from API in production)
const mockWeatherData: WeatherData = {
  location: "Austin, TX",
  temperature: 82,
  condition: "Partly Cloudy",
  humidity: 65,
  windSpeed: 8
};

const getWeatherIcon = (condition: string) => {
  // This would be more comprehensive in a real app
  if (condition.toLowerCase().includes('rain')) {
    return <CloudRain size={28} className="text-lawn-blue" />;
  } else {
    return <Thermometer size={28} className="text-lawn-green" />;
  }
};

const WeatherWidget = () => {
  // In a real app, we would fetch weather data from an API
  const weatherData = mockWeatherData;

  return (
    <Card className="overflow-hidden border-lawn-earth-light">
      <CardHeader className="bg-lawn-blue-light py-3">
        <CardTitle className="flex justify-between items-center text-lg">
          <span className="font-semibold">{weatherData.location}</span>
          {getWeatherIcon(weatherData.condition)}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-3xl font-bold">{weatherData.temperature}°F</div>
            <div className="text-sm text-muted-foreground">{weatherData.condition}</div>
          </div>
          <div className="grid grid-cols-1 gap-1 text-sm">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>Updated: 10 min ago</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind size={14} />
              <span>Wind: {weatherData.windSpeed} mph</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
