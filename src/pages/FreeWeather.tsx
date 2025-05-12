
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cloud, CloudRain, Thermometer, Wind, Sun, Info, UserRound, Leaf, Check } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useLawn } from '@/context/LawnContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchWeatherData, getWeatherBasedAdvice, WeatherData } from '@/services/lawnService';
import FeatureCallToAction from '@/components/FeatureCallToAction';

const FreeWeather = () => {
  const { temporaryProfile } = useLawn();
  const navigate = useNavigate();
  const [zipCode, setZipCode] = useState(temporaryProfile?.zipCode || '');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [advice, setAdvice] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleWeatherFetch = async () => {
    if (!zipCode.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine PLZ ein.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const data = await fetchWeatherData(zipCode);
      setWeatherData(data);
      
      // Erhalten Sie Ratschläge basierend auf Wetterdaten
      const weatherAdvice = getWeatherBasedAdvice(data);
      setAdvice(weatherAdvice);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      toast({
        title: "Fehler",
        description: "Beim Abrufen der Wetterdaten ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wenn eine PLZ im temporären Profil vorhanden ist, laden Sie die Wetterdaten automatisch
    if (temporaryProfile?.zipCode) {
      handleWeatherFetch();
    }
  }, [temporaryProfile]);

  // Funktion, um das Wettersymbol basierend auf der Bedingung zu erhalten
  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('regen')) {
      return <CloudRain className="h-8 w-8 text-blue-500" />;
    } else if (lowerCondition.includes('wolke') || lowerCondition.includes('bewölkt')) {
      return <Cloud className="h-8 w-8 text-gray-400" />;
    } else {
      return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-950">
      <MainNavigation />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-400 mb-4">Wetterbasierte Rasenberatung</h1>
            
            <Alert className="mb-6 bg-amber-50 border-amber-200">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Kostenlose Vorschau</AlertTitle>
              <AlertDescription className="text-amber-700">
                Dies ist eine Vorschau der wetterbasierten Beratung. Für personalisierte und standortgenaue Empfehlungen registrieren Sie sich bitte.
              </AlertDescription>
            </Alert>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Wetterdaten für Ihren Standort</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-grow">
                    <Input
                      placeholder="Geben Sie Ihre PLZ ein"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="max-w-xs"
                    />
                  </div>
                  <Button 
                    onClick={handleWeatherFetch} 
                    disabled={loading} 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Cloud className="mr-2 h-4 w-4" />
                    {loading ? 'Lädt...' : 'Wetter abrufen'}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {weatherData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card className="col-span-1 md:col-span-1">
                    <CardHeader className="bg-sky-50 dark:bg-sky-900/30 pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Thermometer className="text-red-500" />
                        Aktuelles Wetter
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold">{weatherData.current.temp}°C</div>
                          <div className="text-gray-600 dark:text-gray-400">{weatherData.current.condition}</div>
                        </div>
                        <div>
                          {getWeatherIcon(weatherData.current.condition)}
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Wind size={14} className="text-blue-500" />
                          <span>Wind: {weatherData.current.windSpeed} km/h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CloudRain size={14} className="text-blue-500" />
                          <span>Feuchtigkeit: {weatherData.current.humidity}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="col-span-1 md:col-span-2">
                    <CardHeader className="bg-sky-50 dark:bg-sky-900/30 pb-2">
                      <CardTitle className="text-lg">5-Tage-Vorhersage</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-5 gap-2">
                        {weatherData.forecast.slice(0, 5).map((day, index) => (
                          <div key={index} className="text-center">
                            <div className="text-sm font-medium">{day.day}</div>
                            <div className="my-1">{getWeatherIcon(day.condition)}</div>
                            <div className="text-xs">{day.high}° / {day.low}°</div>
                            <div className="text-xs text-blue-500">{day.chanceOfRain}%</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Leaf className="text-green-600" />
                      Wetterbasierte Rasenpflege-Tipps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {advice.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <div className="mr-2 mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center">
                            <Check size={12} className="text-green-600" />
                          </div>
                          <span>{tip}</span>
                        </li>
                      ))}
                      <li className="flex items-start">
                        <div className="mr-2 mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center">
                          <Check size={12} className="text-green-600" />
                        </div>
                        <span>Bei den aktuellen Bedingungen sollten Sie Ihren Rasen {weatherData.current.temp > 25 ? 'früh morgens' : 'am späten Vormittag'} gießen.</span>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-2 mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center">
                          <Check size={12} className="text-green-600" />
                        </div>
                        <span>Achten Sie in den nächsten Tagen auf {weatherData.forecast[0].chanceOfRain > 50 ? 'ausreichende Drainage, um Staunässe zu vermeiden' : 'ausreichende Bewässerung, insbesondere bei Hitze'}.</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Premium-Funktionen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-gray-600">
                      Mit einem kostenlosen Konto erhalten Sie automatisch an Ihre PLZ angepasste Wettervorhersagen und personalisierte Pflegeempfehlungen.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">Automatische Wetter-Integration</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Ihr Pflegeplan passt sich automatisch an die Wetterbedingungen an, ohne dass Sie manuell Daten abrufen müssen.
                        </p>
                      </div>
                      
                      <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                        <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">Personalisierte Bewässerungsempfehlungen</h3>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Erhalten Sie genaue Bewässerungsempfehlungen basierend auf Ihrem Rasentyp und den lokalen Wetterbedingungen.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-center">
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => navigate('/auth')}
                      >
                        <UserRound className="mr-2 h-4 w-4" />
                        Kostenlos registrieren
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            
            {!weatherData && !loading && (
              <Card className="text-center p-8">
                <div className="flex flex-col items-center">
                  <Cloud className="h-16 w-16 text-blue-300 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Noch keine Wetterdaten</h3>
                  <p className="text-gray-600 mb-4">
                    Geben Sie Ihre PLZ ein, um wetterbasierte Rasenpflegetipps zu erhalten.
                  </p>
                </div>
              </Card>
            )}
            
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-4 text-blue-800">Wetterdaten werden abgerufen...</p>
              </div>
            )}

            <div className="mt-8">
              <FeatureCallToAction />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white dark:bg-gray-800 py-6 border-t border-gray-200 dark:border-gray-700 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
};

export default FreeWeather;
