
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import WeatherInfo from '@/components/WeatherInfo';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock, Info, MessageSquare, UserRound } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useLawn } from '@/context/LawnContext';
import { CarePlanTask, fetchWeatherData, WeatherData } from '@/services/lawnService';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import FeatureCallToAction from '@/components/FeatureCallToAction';

// Funktion, um ein Datum zu formatieren
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

// Funktion, um ein Symbol für den Aufgabentyp zu erhalten
const getTaskIcon = (type: string) => {
  switch(type) {
    case "mowing":
      return <CheckCircle size={18} className="text-yellow-500" />;
    case "fertilizing":
      return <CheckCircle size={18} className="text-green-600" />;
    case "watering":
      return <CheckCircle size={18} className="text-blue-500" />;
    case "weeding":
      return <CheckCircle size={18} className="text-red-500" />;
    default:
      return <Clock size={18} className="text-gray-500" />;
  }
};

// Mocken Sie die Generierung eines kostenlosen Pflegeplans
const generateFreePlan = (grassType: string, zipCode: string, lawnGoal: string): CarePlanTask[] => {
  const today = new Date();
  const tasks: CarePlanTask[] = [];
  const taskTypes: Array<'mowing' | 'fertilizing' | 'watering' | 'weeding' | 'other'> = ['mowing', 'fertilizing', 'watering', 'weeding', 'other'];
  const titles = [
    "Mähen Sie Ihren Rasen",
    "Düngen Sie Ihren Rasen",
    "Bewässern Sie den Rasen (früh morgens)",
    "Unkraut entfernen",
    "Rasen belüften"
  ];
  const descriptions = [
    `Schneiden Sie Ihren ${grassType}-Rasen auf 3-4 cm Höhe für gesundes Wachstum`,
    "Verwenden Sie einen ausgewogenen Dünger für ganzheitliches Wachstum",
    "Gründlich bewässern (ca. 2,5 cm) für tiefes Wurzelwachstum",
    "Entfernen Sie Unkraut gezielt, um Ihren Rasen gesund zu halten",
    "Belüften Sie den Rasen mit einer Gartengabel oder einem Vertikutierer"
  ];

  for (let i = 0; i < 14; i++) {
    const taskDate = new Date(today);
    taskDate.setDate(today.getDate() + i);
    
    if (i % 3 === 0 || i % 5 === 0) {  // Nicht jeden Tag eine Aufgabe
      const taskIndex = i % taskTypes.length;
      tasks.push({
        id: i + 1,
        date: taskDate.toISOString().split('T')[0],
        title: titles[taskIndex],
        description: descriptions[taskIndex],
        completed: false,
        type: taskTypes[taskIndex],
      });
    }
  }
  
  return tasks;
};

const FreeCarePlan = () => {
  const { temporaryProfile } = useLawn();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<CarePlanTask[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    // Redirect to home if there's no temporary profile
    if (!temporaryProfile) {
      toast({
        title: "Keine Daten vorhanden",
        description: "Bitte füllen Sie zuerst das Rasenformular aus."
      });
      navigate('/free-plan');
      return;
    }

    // Simulieren Sie die Generierung eines Pflegeplans
    setLoading(true);
    setTimeout(() => {
      const generatedTasks = generateFreePlan(
        temporaryProfile.grassType, 
        temporaryProfile.zipCode,
        temporaryProfile.lawnGoal
      );
      setTasks(generatedTasks);
      setLoading(false);
    }, 1500);
    
    // Fetch weather data
    if (temporaryProfile?.zipCode) {
      setWeatherLoading(true);
      fetchWeatherData(temporaryProfile.zipCode)
        .then(data => {
          setWeatherData(data);
          setWeatherLoading(false);
        })
        .catch(error => {
          console.error("Error fetching weather data:", error);
          setWeatherLoading(false);
        });
    }
  }, [temporaryProfile, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <MainNavigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
            <p className="mt-4 text-green-800">Generiere Ihren personalisierten Pflegeplan...</p>
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
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            {/* Main Content */}
            <div className="w-full lg:w-2/3 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-green-800">Ihr 14-Tage-Rasenpflegeplan</h1>
                  <p className="text-gray-600">Kostenlose Vorschau für {temporaryProfile?.grassType} Rasen in {temporaryProfile?.zipCode}</p>
                </div>
              </div>
              
              <Alert className="bg-amber-50 border-amber-200">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Kostenlose Vorschau</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Dies ist eine Vorschau Ihres Pflegeplans. Um Ihren Plan zu speichern und auf weitere Funktionen zuzugreifen, erstellen Sie bitte ein kostenloses Konto.
                </AlertDescription>
              </Alert>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Anstehende Aufgaben</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-start p-3 rounded-md border border-gray-100 bg-white shadow-sm">
                        <div className="mr-4">
                          <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                            {getTaskIcon(task.type)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">{task.title}</h3>
                            <span className="text-sm text-gray-500">{formatDate(task.date)}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Saisonale Tipps</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {[
                      `Für Ihren ${temporaryProfile?.grassType} Rasen ist jetzt die ideale Zeit für regelmäßige Bewässerung.`,
                      "Achten Sie auf die Schnitthöhe - nie mehr als ein Drittel der Halmlänge auf einmal schneiden.",
                      "Bei Trockenheit bewässern Sie früh morgens, um Verdunstung zu minimieren.",
                      "Beobachten Sie Ihren Rasen auf Anzeichen von Schädlingen oder Krankheiten.",
                      "Überlegen Sie einen Bodentest durchzuführen, um den pH-Wert und Nährstoffbedarf zu bestimmen."
                    ].map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-800 text-xs mr-2 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-bold text-green-800">Möchten Sie mehr?</h2>
                <p className="text-gray-700">
                  Mit einem kostenlosen Konto können Sie Ihren Pflegeplan speichern, auf erweiterte Funktionen zugreifen und personalisierte Empfehlungen erhalten.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => navigate('/auth')}>
                    <UserRound className="mr-2 h-4 w-4" /> Jetzt kostenlos registrieren
                  </Button>
                  <Button variant="outline" className="border-green-200" onClick={() => navigate('/free-chat')}>
                    <MessageSquare className="mr-2 h-4 w-4" /> Rasen-KI-Chat ausprobieren
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="w-full lg:w-1/3 space-y-6">
              <WeatherInfo weatherData={weatherData} loading={weatherLoading} />
              
              <Card>
                <CardHeader className="bg-green-50 pb-2">
                  <CardTitle className="text-lg">Premium-Funktionen</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                      <span>Umfassender monatlicher Pflegeplan</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                      <span>Speichern & Verwalten Ihrer Pflegepläne</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                      <span>Unbegrenzter Zugang zum Rasen-KI-Assistenten</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                      <span>Upload und Speicherung von Rasenfotos</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                      <span>Aufgaben- und Erinnerungsmanagement</span>
                    </li>
                  </ul>
                  
                  <Button 
                    className="w-full mt-4 bg-green-600 hover:bg-green-700" 
                    onClick={() => navigate('/auth')}
                  >
                    Jetzt kostenlos registrieren
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Ihr Rasenprofil</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">PLZ</span>
                      <span className="font-medium">{temporaryProfile?.zipCode}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Rasentyp</span>
                      <span className="font-medium">{temporaryProfile?.grassType}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Rasenfläche</span>
                      <span className="font-medium">{temporaryProfile?.lawnSize} m²</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-gray-500">Hauptziel</span>
                      <span className="font-medium">{temporaryProfile?.lawnGoal}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white py-6 border-t border-gray-200 mt-8">
        <div className="container mx-auto px-4">
          <FeatureCallToAction variant="minimal" className="mb-4" />
          <div className="text-center text-sm text-gray-500 mt-4">
            &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FreeCarePlan;
