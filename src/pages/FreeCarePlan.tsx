
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import WeatherInfo from '@/components/WeatherInfo';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Info, MessageSquare, UserRound, Camera, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLawn } from '@/context/LawnContext';
import { fetchWeatherData, WeatherData } from '@/services/lawnService';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import FeatureCallToAction from '@/components/FeatureCallToAction';
import DailyTaskCard from '@/components/DailyTaskCard';

// Function to generate a 14-day care plan based on user profile
const generate14DayPlan = (grassType: string, lawnGoal: string) => {
  const today = new Date();
  const tasks = [];
  
  // Task templates based on different lawn goals and types
  const taskTemplates = {
    'repair': [
      { title: "Rasen vertikutieren", description: "Entferne Rasenfilz und belüfte den Boden." },
      { title: "Kahle Stellen nachsäen", description: "Verwende eine passende Nachsaatmischung für deinen Rasentyp." },
      { title: "Sandig-Torfige Mischung auftragen", description: "Decke die Samen leicht mit einer Mischung aus Sand und Torf ab." },
      { title: "Bewässern", description: "Halte die nachgesäten Stellen konstant feucht." },
    ],
    'appearance': [
      { title: "Rasen mähen", description: "Schneide nicht mehr als ein Drittel der Halmlänge ab." },
      { title: "Kanten trimmen", description: "Sorge für saubere Kanten entlang von Wegen und Beeten." },
      { title: "Düngen", description: "Verwende einen ausgewogenen Rasendünger für satteres Grün." },
      { title: "Unkraut jäten", description: "Entferne manuell größeres Unkraut." },
    ],
    'child-safe': [
      { title: "Bio-Dünger auftragen", description: "Verwende einen kinderfreundlichen organischen Dünger." },
      { title: "Manuelles Unkrautentfernen", description: "Vermeide chemische Unkrautvernichter." },
      { title: "Rasen auf 4-5cm mähen", description: "Etwas längerer Rasen ist weicher und widerstandsfähiger." },
      { title: "Sprinkler-System prüfen", description: "Stelle sicher, dass keine Stolperfallen entstehen." },
    ],
    'default': [
      { title: "Rasen mähen", description: "Schneide auf optimale Höhe je nach Rasentyp." },
      { title: "Bewässern", description: "Morgens gründlich bewässern für gesundes Wurzelwachstum." },
      { title: "Düngen", description: "Passenden Dünger je nach Saison auftragen." },
      { title: "Unkrautbekämpfung", description: "Gezielt gegen aufkommendes Unkraut vorgehen." },
    ]
  };
  
  // Select appropriate task templates based on lawn goal
  const selectedTemplates = taskTemplates[lawnGoal as keyof typeof taskTemplates] || taskTemplates.default;
  
  // Weather tips based on typical conditions
  const weatherTips = [
    "Heute wird es regnen, Du kannst das Bewässern überspringen.",
    "Hohe Temperaturen erwartet - bewässere früh morgens für beste Ergebnisse.",
    "Leicht windig - ideal für Dünger oder Nachsaat.",
    null, // Some days don't have weather tips
    "Nächste Woche wird es trocken - plane jetzt schon zusätzliche Bewässerung ein."
  ];
  
  // Generate tasks for 14 days
  for (let i = 0; i < 14; i++) {
    const taskDate = new Date(today);
    taskDate.setDate(today.getDate() + i);
    const formattedDate = taskDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
    
    // Select a task template, cycling through them
    const templateIndex = i % selectedTemplates.length;
    const template = selectedTemplates[templateIndex];
    
    // Add some variety to the descriptions based on grass type
    let description = template.description;
    if (grassType && grassType !== 'other') {
      description += ` Besonders wichtig für ${grassType}-Rasen.`;
    }
    
    // Randomly select a weather tip (null means no tip for that day)
    const weatherTip = i % 3 === 0 ? weatherTips[Math.floor(Math.random() * weatherTips.length)] : null;
    
    tasks.push({
      day: i + 1,
      date: formattedDate,
      title: template.title,
      description: description,
      weatherTip: weatherTip,
      isToday: i === 0,
      completed: false
    });
  }
  
  return tasks;
};

const FreeCarePlan = () => {
  const { temporaryProfile } = useLawn();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    // Redirect to home if there's no temporary profile
    if (!temporaryProfile) {
      toast({
        description: "Bitte fülle zuerst das Rasenformular aus."
      });
      navigate('/free-plan');
      return;
    }

    // Generate 14-day care plan
    setLoading(true);
    setTimeout(() => {
      const generatedTasks = generate14DayPlan(
        temporaryProfile.grassType, 
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

  const handleCompleteTask = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = true;
    setTasks(updatedTasks);
    
    toast({
      description: "Aufgabe als erledigt markiert",
      variant: "success"
    });
  };

  const handlePhotoUpload = () => {
    // Show upgrade prompt after first attempt to upload photo
    setShowUpgradePrompt(true);
    toast({
      description: "Foto-Checks sind Teil des Pro-Plans. Registriere dich jetzt!",
      action: {
        label: "Upgrade",
        onClick: () => navigate('/auth')
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <MainNavigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
            <p className="mt-4 text-green-800">Generiere deinen personalisierten 14-Tage-Plan...</p>
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
                  <h1 className="text-3xl font-bold text-green-800">Dein 14-Tage-Rasenpflegeplan</h1>
                  <p className="text-gray-600">Personalisierter Plan für {temporaryProfile?.grassType || 'deinen'} Rasen in {temporaryProfile?.zipCode}</p>
                </div>
              </div>
              
              <Alert className="bg-amber-50 border-amber-200">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Kostenlose Vorschau</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Dies ist dein 14-Tage-Pflegeplan. Registriere dich für den Pro-Plan, um erweiterte Funktionen wie Foto-Checks und Smart-Planer zu nutzen.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                {tasks.slice(0, 5).map((task, index) => (
                  <DailyTaskCard 
                    key={index}
                    day={task.day}
                    date={task.date}
                    title={task.title}
                    description={task.description}
                    weatherTip={task.weatherTip}
                    isToday={task.isToday}
                    completed={task.completed}
                    onComplete={() => handleCompleteTask(index)}
                    onPhotoUpload={handlePhotoUpload}
                  />
                ))}

                {/* Preview of more days */}
                <Card className="border-dashed border-gray-300 bg-gray-50">
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500 mb-4">
                      +9 weitere Tage mit personalisierten Aufgaben
                    </p>
                    <Button 
                      onClick={() => navigate('/auth')} 
                      variant="outline"
                      className="border-green-500 text-green-700"
                    >
                      Registrieren für vollständigen Plan
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              {showUpgradePrompt && (
                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-green-800">Upgrade auf Pro für mehr Funktionen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Camera className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-medium">Foto-Analyse</h4>
                          <p className="text-sm text-gray-600">Lade Fotos hoch und erhalte KI-basierte Diagnose deines Rasens</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-medium">Smarter Jahresplaner</h4>
                          <p className="text-sm text-gray-600">Erhalte einen dynamischen Pflegeplan für das ganze Jahr</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MessageSquare className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-medium">Erweiterter KI-Chatbot</h4>
                          <p className="text-sm text-gray-600">Stelle detaillierte Fragen mit Foto-Upload und erhalte personalisierte Antworten</p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-center">
                        <Button 
                          className="bg-green-600 hover:bg-green-700" 
                          onClick={() => navigate('/auth')}
                        >
                          Pro-Plan für nur €4.99/Monat
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Saisonale Tipps</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {[
                      `Für deinen ${temporaryProfile?.grassType || ''} Rasen ist jetzt die ideale Zeit für regelmäßige Bewässerung.`,
                      "Achte auf die Schnitthöhe - nie mehr als ein Drittel der Halmlänge auf einmal schneiden.",
                      "Bei Trockenheit bewässere früh morgens, um Verdunstung zu minimieren.",
                      "Beobachte deinen Rasen auf Anzeichen von Schädlingen oder Krankheiten.",
                      "Überlege einen Bodentest durchzuführen, um den pH-Wert und Nährstoffbedarf zu bestimmen."
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
                <h2 className="text-xl font-bold text-green-800">Möchtest du mehr?</h2>
                <p className="text-gray-700">
                  Mit dem Pro-Konto erhältst du Zugang zu erweiterten Funktionen wie Foto-Analyse, Smart-Planer und unbegrenztem KI-Chat.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => navigate('/auth')}>
                    <UserRound className="mr-2 h-4 w-4" /> Pro-Plan für €4.99/Monat
                  </Button>
                  <Button variant="outline" className="border-green-200" onClick={() => navigate('/free-chat')}>
                    <MessageSquare className="mr-2 h-4 w-4" /> KI-Chat ausprobieren
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="w-full lg:w-1/3 space-y-6">
              <WeatherInfo weatherData={weatherData} loading={weatherLoading} />
              
              <Card>
                <CardHeader className="bg-green-50 pb-2">
                  <CardTitle className="text-lg">Pro-Plan Vorteile</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                      <span>Unbegrenzte Foto-Analysen</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                      <span>Vollständiger KI-Chatbot mit Foto-Upload</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                      <span>Wöchentlicher & saisonaler Pflegeplan</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                      <span>Produkt-Empfehlungen</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                      <span>Smart-Alerts bei Wetterereignissen</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                      <span>PDF-Export des Pflegeplans</span>
                    </li>
                  </ul>
                  
                  <div className="mt-4 space-y-3">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700" 
                      onClick={() => navigate('/auth')}
                    >
                      Monatlich für €4.99
                    </Button>
                    <Button 
                      className="w-full bg-amber-600 hover:bg-amber-700" 
                      onClick={() => navigate('/auth')}
                    >
                      Jährlich für €29 (5 Monate sparen!)
                    </Button>
                    <div className="text-center text-sm text-gray-500">
                      Begrenzte Zeit: Lifetime-Deal für €79
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Dein Rasenprofil</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">PLZ</span>
                      <span className="font-medium">{temporaryProfile?.zipCode}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Rasentyp</span>
                      <span className="font-medium">{temporaryProfile?.grassType || 'Nicht angegeben'}</span>
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
