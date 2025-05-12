
import React, { useState, useEffect } from 'react';
import MainNavigation from '@/components/MainNavigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Cloud, CloudRain, Droplet, Sun, Thermometer, Wind } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/use-toast';
import { useLawn } from '@/context/LawnContext';
import { fetchWeatherData, getWeatherBasedAdvice, WeatherData } from '@/services/lawnService';
import { Link } from 'react-router-dom';

interface WeatherFormData {
  zipCode: string;
}

const WeatherAdvice = () => {
  const { profile } = useLawn();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string[]>([]);
  
  const form = useForm<WeatherFormData>({
    defaultValues: {
      zipCode: profile?.zipCode || ""
    }
  });
  
  useEffect(() => {
    if (profile?.zipCode) {
      loadWeatherData(profile.zipCode);
    }
  }, [profile]);

  const loadWeatherData = (zipCode: string) => {
    setLoading(true);
    
    fetchWeatherData(zipCode)
      .then(data => {
        setWeatherData(data);
        setAdvice(getWeatherBasedAdvice(data));
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching weather data:", error);
        toast({
          title: "Fehler",
          description: "Wetterdaten konnten nicht abgerufen werden.",
          variant: "destructive"
        });
        setLoading(false);
      });
  };
  
  const onSubmit = (data: WeatherFormData) => {
    loadWeatherData(data.zipCode);
  };
  
  // Helper function to get weather icon
  const getWeatherIcon = (icon: string) => {
    switch(icon) {
      case "sun": return <Sun size={24} className="text-yellow-500" />;
      case "cloud-sun": return <Cloud size={24} className="text-gray-400" />;
      case "cloud-rain": return <CloudRain size={24} className="text-blue-500" />;
      case "cloud-drizzle": return <CloudRain size={24} className="text-blue-400" />;
      default: return <Cloud size={24} className="text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <MainNavigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
            <p className="mt-4 text-green-800">Wetterinformationen werden geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MainNavigation />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Wetter-intelligente Rasenberatung</h1>
          <p className="text-gray-600 mb-6">Erhalten Sie personalisierte Rasenpflegeempfehlungen basierend auf Ihrer lokalen Wettervorhersage</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weather Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xl font-bold">Aktuelles Wetter</CardTitle>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full max-w-sm items-center space-x-2">
                    <Input
                      placeholder="PLZ eingeben"
                      {...form.register("zipCode")}
                      className="max-w-[180px]"
                    />
                    <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
                      {loading ? "Laden..." : "Aktualisieren"}
                    </Button>
                  </form>
                </CardHeader>
                <CardContent>
                  {weatherData ? (
                    <div className="flex flex-col md:flex-row justify-between items-center">
                      <div className="flex items-center mb-4 md:mb-0">
                        {weatherData.current.condition === "Sonnig" ? (
                          <Sun size={64} className="text-yellow-500 mr-4" />
                        ) : weatherData.current.condition.includes("Regen") ? (
                          <CloudRain size={64} className="text-blue-500 mr-4" />
                        ) : (
                          <Cloud size={64} className="text-gray-400 mr-4" />
                        )}
                        <div>
                          <div className="text-4xl font-bold">{weatherData.current.temp}°C</div>
                          <div className="text-gray-500">{weatherData.current.condition}</div>
                          <div className="text-sm text-gray-500">{weatherData.location}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        <div className="flex items-center">
                          <Wind size={20} className="text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-500">Wind</div>
                            <div>{weatherData.current.windSpeed} km/h</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Droplet size={20} className="text-blue-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-500">Luftfeuchtigkeit</div>
                            <div>{weatherData.current.humidity}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Geben Sie Ihre Postleitzahl ein, um Wetterdaten zu laden</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {weatherData && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">5-Tage-Vorhersage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {weatherData.forecast.map((day, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-gray-100 text-center">
                          <p className="font-medium">{day.day}</p>
                          <div className="my-2 flex justify-center">
                            {getWeatherIcon(day.icon)}
                          </div>
                          <p className="text-sm">{day.condition}</p>
                          <div className="flex justify-between text-sm mt-2">
                            <span className="text-red-500">{day.high}°</span>
                            <span className="text-blue-500">{day.low}°</span>
                          </div>
                          {day.chanceOfRain > 0 && (
                            <div className="mt-1 text-xs flex items-center justify-center text-blue-500">
                              <Droplet size={12} className="mr-1" />
                              {day.chanceOfRain}%
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Weather-Based Advice */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="bg-green-50 pb-2">
                  <CardTitle className="text-lg">Heutige Rasenpflege-Tipps</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {weatherData ? (
                    <div className="space-y-4">
                      {advice.map((item, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-md border border-gray-100">
                          <div className="flex items-center">
                            <div className="mr-3">{idx % 2 === 0 ? <Sun size={24} className="text-yellow-500" /> : <Droplet size={24} className="text-blue-500" />}</div>
                            <div>
                              <p className="text-sm text-gray-600">{item}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Geben Sie Ihre Postleitzahl ein, um personalisierte Tipps zu erhalten</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Saisonale Tipps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm">
                      <span className="font-medium">Frühjahrsperiode:</span> Dies ist eine wichtige Zeit für die gesunde Wurzelentwicklung. Konzentrieren Sie sich auf richtige Bewässerungstechniken.
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Mähen:</span> Halten Sie Gras während der aktuellen Wachstumsperiode auf 6-8 cm für optimale Gesundheit.
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Schädlinge:</span> Achten Sie in den nächsten Wochen auf Anzeichen von häufigen Frühjahrsschädlingen wie Engerlinge und Wanzen.
                    </p>
                    <Link to="/chat">
                      <Button variant="link" className="px-0 text-green-600">
                        Mehr saisonale Beratung anzeigen
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              <Link to="/care-plan">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Calendar className="mr-2 h-5 w-5" />
                  Ihren Pflegeplan ansehen
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white py-6 border-t border-gray-200 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
};

export default WeatherAdvice;
