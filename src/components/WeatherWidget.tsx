
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CloudRain, Thermometer, Wind } from 'lucide-react';
import { useLawn } from '@/context/LawnContext';
import { fetchWeatherData } from '@/services/lawnService';

const WeatherWidget = () => {
  const { profile } = useLawn();
  const [weatherData, setWeatherData] = useState({
    location: "Wird geladen...",
    temperature: 0,
    condition: "Wird geladen...",
    humidity: 0,
    windSpeed: 0,
    updated: "gerade eben"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.zipCode) {
      setLoading(true);
      fetchWeatherData(profile.zipCode)
        .then(data => {
          setWeatherData({
            location: data.location || "Deutschland",
            temperature: data.current.temp,
            condition: data.current.condition,
            humidity: data.current.humidity,
            windSpeed: data.current.windSpeed,
            updated: "10 min"
          });
          setLoading(false);
        })
        .catch(error => {
          console.error("Fehler beim Laden der Wetterdaten:", error);
          setLoading(false);
        });
    }
  }, [profile?.zipCode]);

  // Funktion für das passende Wettersymbol
  const getWeatherIcon = (condition: string) => {
    const lowercaseCondition = condition.toLowerCase();
    if (lowercaseCondition.includes('regen') || lowercaseCondition.includes('schauer')) {
      return <CloudRain size={28} className="text-blue-500" />;
    } else {
      return <Thermometer size={28} className="text-green-600" />;
    }
  };

  // Celsius zu Fahrenheit Umrechnung (falls nötig)
  const celsiusToFahrenheit = (celsius: number) => {
    return Math.round((celsius * 9/5) + 32);
  };

  return (
    <Card className="overflow-hidden border-green-100">
      <CardHeader className="bg-blue-50 py-3">
        <CardTitle className="flex justify-between items-center text-lg">
          <span className="font-semibold">{weatherData.location}</span>
          {getWeatherIcon(weatherData.condition)}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="flex justify-center items-center h-20">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <div>
              <div className="text-3xl font-bold">{weatherData.temperature}°C</div>
              <div className="text-sm text-muted-foreground">{weatherData.condition}</div>
            </div>
            <div className="grid grid-cols-1 gap-1 text-sm">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>Aktualisiert: vor {weatherData.updated} Min.</span>
              </div>
              <div className="flex items-center gap-1">
                <Wind size={14} />
                <span>Wind: {weatherData.windSpeed} km/h</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
