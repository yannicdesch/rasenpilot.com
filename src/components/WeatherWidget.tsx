
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, CloudRain, Thermometer, Wind, Clock, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
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
    if (profile) {
      loadWeather();
    } else {
      // Try to load profile from localStorage if context doesn't have it yet
      const storedProfile = localStorage.getItem('lawnProfile');
      if (storedProfile) {
        try {
          const parsedProfile = JSON.parse(storedProfile);
          if (parsedProfile.zipCode) {
            console.log("Using zipCode from localStorage:", parsedProfile.zipCode);
            loadWeatherByZipCode(parsedProfile.zipCode);
          } else {
            setLoading(false);
            setError(true);
          }
        } catch (e) {
          console.error("Error parsing stored profile:", e);
          setLoading(false);
          setError(true);
        }
      } else {
        console.log("No profile available in context or localStorage");
        setLoading(false);
        setError(true);
      }
    }
  }, [profile]);

  const loadWeather = async () => {
    if (!profile?.zipCode) {
      console.log("No ZIP code available in profile:", profile);
      setLoading(false);
      setError(true);
      return;
    }
    
    await loadWeatherByZipCode(profile.zipCode);
  };
  
  const loadWeatherByZipCode = async (zipCode: string) => {
    setLoading(true);
    setError(false);
    
    try {
      console.log("Fetching weather data for ZIP:", zipCode);
      const data = await fetchWeatherData(zipCode);
      
      console.log("Weather data received:", data);
      
      // Check if we received valid data
      if (!data || !data.current) {
        console.error("Invalid weather data received:", data);
        setError(true);
        setLoading(false);
        toast.error("Ungültige Wetterdaten erhalten");
        return;
      }
      
      setWeatherData({
        location: data.location || "Deutschland",
        temperature: data.current.temp,
        condition: data.current.condition,
        humidity: data.current.humidity,
        windSpeed: data.current.windSpeed,
        updated: "gerade eben"
      });
      setLoading(false);
    } catch (error) {
      console.error("Fehler beim Laden der Wetterdaten:", error);
      setError(true);
      setLoading(false);
      toast.error("Wetterdaten konnten nicht geladen werden");
    }
  };

  // Function for the appropriate weather icon
  const getWeatherIcon = (condition: string) => {
    const lowercaseCondition = condition?.toLowerCase() || '';
    if (lowercaseCondition.includes('regen') || lowercaseCondition.includes('schauer')) {
      return <CloudRain size={28} className="text-blue-500" />;
    } else {
      return <Thermometer size={28} className="text-green-600" />;
    }
  };

  // Function to retry loading weather data
  const retryLoadWeather = async () => {
    // Get the most up-to-date zipCode
    if (profile?.zipCode) {
      await loadWeatherByZipCode(profile.zipCode);
    } else {
      // Fallback to localStorage
      const storedProfile = localStorage.getItem('lawnProfile');
      if (storedProfile) {
        try {
          const parsedProfile = JSON.parse(storedProfile);
          if (parsedProfile.zipCode) {
            await loadWeatherByZipCode(parsedProfile.zipCode);
            return;
          }
        } catch (e) {
          console.error("Error parsing stored profile:", e);
        }
      }
      
      toast.error("Keine PLZ verfügbar");
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
          <p className="text-gray-600">Aktuelle Wetterdaten konnten nicht geladen werden. Bitte stellen Sie sicher, dass eine gültige PLZ in Ihrem Profil hinterlegt ist.</p>
          <Button 
            onClick={retryLoadWeather}
            className="mt-4 bg-green-600 hover:bg-green-700"
          >
            <RefreshCw size={16} className="mr-2" />
            Wetterdaten aktualisieren
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-green-100 bg-white">
      <CardHeader className="bg-blue-50 py-3">
        <CardTitle className="flex justify-between items-center text-lg">
          <span className="font-semibold">{weatherData.location}</span>
          <button 
            onClick={retryLoadWeather} 
            className="p-1 rounded-full hover:bg-blue-100 transition-colors"
            title="Wetter aktualisieren"
          >
            {getWeatherIcon(weatherData.condition)}
          </button>
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
              <span>Aktualisiert: {weatherData.updated}</span>
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
