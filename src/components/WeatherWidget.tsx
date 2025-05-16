
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, CloudRain, Thermometer, Wind, Clock } from 'lucide-react';
import { useLawn } from '@/context/LawnContext';
import { fetchWeatherData } from '@/services/lawnService';
import { toast } from 'sonner';

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
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset state when profile changes
    setLoading(true);
    setError(false);
    
    const loadWeather = async () => {
      if (!profile?.zipCode) {
        setLoading(false);
        // Don't show an error if no zip code is available yet
        return;
      }
      
      try {
        console.log("Fetching weather data for ZIP:", profile.zipCode);
        const data = await fetchWeatherData(profile.zipCode);
        
        console.log("Weather data received:", data);
        setWeatherData({
          location: data.location || "Deutschland",
          temperature: data.current.temp,
          condition: data.current.condition,
          humidity: data.current.humidity,
          windSpeed: data.current.windSpeed,
          updated: "10 min"
        });
        setLoading(false);
      } catch (error) {
        console.error("Fehler beim Laden der Wetterdaten:", error);
        setError(true);
        setLoading(false);
        toast.error("Wetterdaten konnten nicht geladen werden");
      }
    };
    
    loadWeather();
  }, [profile?.zipCode]);

  // Function for the appropriate weather icon
  const getWeatherIcon = (condition: string) => {
    const lowercaseCondition = condition.toLowerCase();
    if (lowercaseCondition.includes('regen') || lowercaseCondition.includes('schauer')) {
      return <CloudRain size={28} className="text-blue-500" />;
    } else {
      return <Thermometer size={28} className="text-green-600" />;
    }
  };

  if (loading) {
    return (
      <Card className="overflow-hidden border-green-100 bg-white">
        <CardHeader className="bg-blue-50 py-3">
          <CardTitle className="text-lg font-semibold">Wetterdaten laden...</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex justify-center items-center h-20">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="overflow-hidden border-green-100 bg-white">
        <CardHeader className="bg-red-50 py-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Wind className="text-red-500" size={20} />
            Wetterdaten nicht verfügbar
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-gray-600">Aktuelle Wetterdaten konnten nicht geladen werden.</p>
          <button 
            onClick={() => {
              setLoading(true);
              setError(false);
              fetchWeatherData(profile?.zipCode || "").then(data => {
                setWeatherData({
                  location: data.location || "Deutschland",
                  temperature: data.current.temp,
                  condition: data.current.condition,
                  humidity: data.current.humidity,
                  windSpeed: data.current.windSpeed,
                  updated: "gerade eben"
                });
                setLoading(false);
              }).catch(error => {
                console.error("Fehler beim erneuten Laden der Wetterdaten:", error);
                setError(true);
                setLoading(false);
              });
            }}
            className="mt-2 px-4 py-1 text-sm text-green-600 border border-green-300 rounded hover:bg-green-50"
          >
            Erneut versuchen
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-green-100 bg-white">
      <CardHeader className="bg-blue-50 py-3">
        <CardTitle className="flex justify-between items-center text-lg">
          <span className="font-semibold">{weatherData.location}</span>
          {getWeatherIcon(weatherData.condition)}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-3xl font-bold">{weatherData.temperature}°C</div>
            <div className="text-sm text-gray-500">{weatherData.condition}</div>
          </div>
          <div className="grid grid-cols-1 gap-1 text-sm">
            <div className="flex items-center gap-1">
              <Clock size={14} className="text-gray-500" />
              <span>Aktualisiert: vor {weatherData.updated}</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind size={14} className="text-gray-500" />
              <span>Wind: {weatherData.windSpeed} km/h</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
