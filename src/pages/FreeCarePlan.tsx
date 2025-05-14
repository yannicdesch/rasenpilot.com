
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import DailyTaskCard from '@/components/DailyTaskCard';
import FreePlanForm from '@/components/FreePlanForm';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Info, MessageSquare, UserRound, Camera, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLawn } from '@/context/LawnContext';
import { fetchWeatherData, WeatherData } from '@/services/lawnService';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import FeatureCallToAction from '@/components/FeatureCallToAction';

// Task type definition
interface DailyTask {
  id: number;
  day: number;
  date: string;
  title: string;
  description: string;
  weatherTip?: string;
  completed: boolean;
}

const FreeCarePlan: React.FC = () => {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const { temporaryProfile } = useLawn();
  const navigate = useNavigate();
  
  // Generate tasks for the 14-day plan
  const generateTasks = (zipCode: string): DailyTask[] => {
    const today = new Date();
    const tasks: DailyTask[] = [];
    
    const taskTitles = [
      "Rasen mähen",
      "Rasen bewässern",
      "Unkraut entfernen",
      "Rasen düngen",
      "Kahle Stellen nachsäen",
      "Rasenrand trimmen",
      "Boden belüften",
      "Rasenschnitt entfernen",
      "Moos bekämpfen",
      "Rasen vertikutieren",
      "Schädlinge bekämpfen",
      "Pilzkrankheiten behandeln",
      "Rasen kalken",
      "Herbstdüngung auftragen",
    ];
    
    const taskDescriptions = [
      "Schneiden Sie den Rasen auf 3-4 cm Höhe, um ein gesundes Wachstum zu fördern.",
      "Bewässern Sie Ihren Rasen gründlich früh am Morgen oder spät am Abend für optimale Wasseraufnahme.",
      "Entfernen Sie Unkraut manuell oder mit einem selektiven Herbizid, um Nährstoffkonkurrenz zu vermeiden.",
      "Tragen Sie einen ausgewogenen Rasendünger auf, um Wachstum und Farbe zu verbessern.",
      "Bereiten Sie kahle Stellen vor und säen Sie neues Gras für einen dichteren Rasen.",
      "Trimmen Sie die Rasenkanten für ein sauberes und gepflegtes Aussehen.",
      "Stechen Sie Löcher in den Boden, um die Sauerstoffzufuhr zu verbessern und Verdichtung zu reduzieren.",
      "Entfernen Sie Schnittgut, um Pilzkrankheiten vorzubeugen und das Erscheinungsbild zu verbessern.",
      "Behandeln Sie Mooswuchs und verbessern Sie die Wachstumsbedingungen für den Rasen.",
      "Vertikutieren Sie den Rasen, um abgestorbenes Material zu entfernen und die Wasserdurchlässigkeit zu erhöhen.",
      "Identifizieren und behandeln Sie Schädlinge wie Engerlinge oder Ameisen mit geeigneten Mitteln.",
      "Erkennen und behandeln Sie Pilzerkrankungen mit fungiziden Mitteln oder natürlichen Alternativen.",
      "Passen Sie den pH-Wert Ihres Rasens mit Kalk an, wenn der Boden zu sauer ist.",
      "Bereiten Sie Ihren Rasen mit spezieller Herbstdüngung auf den Winter vor."
    ];
    
    const weatherTips = [
      "Perfektes Mähwetter heute! Nicht zu heiß, nicht zu nass.",
      "Heute wird es regnen, daher können Sie die Bewässerung überspringen.",
      "Aufgrund der Hitze sollten Sie früh morgens oder spät abends arbeiten.",
      "Leichter Wind heute - ideal für das Ausbringen von Dünger.",
      "Feuchtigkeit und milde Temperaturen - perfekt für die Nachsaat.",
      null,
      "Trockene Bedingungen machen das Belüften einfacher.",
      null,
      "Heutiger Regen hilft bei der Aufnahme von Anti-Moos-Mitteln.",
      "Trockenheit vorhergesagt - optimal zum Vertikutieren.",
      null,
      "Die milde Witterung heute unterstützt die Wirksamkeit von Behandlungen.",
      null,
      "Herbstliche Temperaturen - perfekt für die Wintervorbereitung."
    ];
    
    // Create tasks for the next 14 days
    for (let i = 0; i < 14; i++) {
      const taskDate = new Date(today);
      taskDate.setDate(today.getDate() + i);
      
      const taskIndex = i % taskTitles.length;
      
      tasks.push({
        id: i + 1,
        day: i + 1,
        date: taskDate.toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric' }),
        title: taskTitles[taskIndex],
        description: taskDescriptions[taskIndex],
        weatherTip: weatherTips[taskIndex],
        completed: false
      });
    }
    
    return tasks;
  };
  
  useEffect(() => {
    // Redirect to home if there's no temporary profile
    if (!temporaryProfile) {
      toast({
        description: "Bitte fülle zuerst das Rasenformular aus."
      });
      navigate('/free-plan');
      return;
    }

    // Generate tasks based on the profile
    const newTasks = generateTasks(temporaryProfile.zipCode);
    setTasks(newTasks);
    
    // Fetch weather data for the user's location
    const getWeather = async () => {
      try {
        const data = await fetchWeatherData(temporaryProfile.zipCode);
        setWeatherData(data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };
    
    getWeather();
  }, [temporaryProfile, navigate]);
  
  const handleTaskComplete = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = true;
    setTasks(updatedTasks);
    
    toast({
      description: "Aufgabe als erledigt markiert"
    });
  };

  const handlePhotoUpload = () => {
    // Show upgrade prompt after first attempt to upload photo
    setShowUpgradePrompt(true);
    toast({
      description: "Foto-Checks sind Teil des Pro-Plans. Registriere dich jetzt!"
    });
  };
  
  const handleChatbotRedirect = () => {
    navigate('/free-chat');
  };
  
  const handleRegister = () => {
    navigate('/auth');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-green-800 mb-2">Dein 14-Tage Rasenpflegeplan</h1>
            <p className="text-gray-600">Tägliche Aufgaben für einen gesünderen Rasen, angepasst an dein Profil und das Wetter</p>
          </div>
          
          {weatherData && (
            <div className="mb-8">
              <Card className="border-blue-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span>Wetter in {weatherData.location}</span>
                    <span className="text-sm font-normal text-gray-500">| Heute {weatherData.current.temp}°C</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium">{weatherData.current.condition}</span>
                    </div>
                    <span className="text-gray-400">|</span>
                    <div>
                      <span>Luftfeuchtigkeit: {weatherData.current.humidity}%</span>
                    </div>
                    <span className="text-gray-400">|</span>
                    <div>
                      <span>Wind: {weatherData.current.windSpeed} km/h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Task List */}
          <div className="space-y-6">
            {tasks.map((task, index) => (
              <DailyTaskCard 
                key={task.id}
                day={task.day}
                date={task.date}
                title={task.title}
                description={task.description}
                weatherTip={task.weatherTip}
                isToday={index === 0}
                completed={task.completed}
                onComplete={() => handleTaskComplete(index)}
                onPhotoUpload={handlePhotoUpload}
              />
            ))}
          </div>
          
          {/* Pro Upgrade Section */}
          {showUpgradePrompt && (
            <div className="mt-8">
              <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-400">Möchten Sie Ihren Rasen auf das nächste Level bringen?</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Upgraden Sie auf den Pro-Plan für unbegrenzte Foto-Checks, detaillierte Analysen und personalisierte Empfehlungen.
                </AlertDescription>
                <div className="mt-4">
                  <Button 
                    onClick={handleRegister} 
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Jetzt registrieren
                  </Button>
                </div>
              </Alert>
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="mt-10 mb-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">Schnellzugriff</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="flex flex-col h-auto py-4 gap-2" onClick={() => navigate('/free-analysis')}>
                <Camera className="h-5 w-5" />
                <span>Rasen analysieren</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-auto py-4 gap-2" onClick={handleChatbotRedirect}>
                <MessageSquare className="h-5 w-5" />
                <span>Chatbot fragen</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-auto py-4 gap-2" onClick={handleRegister}>
                <Calendar className="h-5 w-5" />
                <span>Zum Kalender</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-auto py-4 gap-2" onClick={handleRegister}>
                <UserRound className="h-5 w-5" />
                <span>Konto erstellen</span>
              </Button>
            </div>
          </div>
          
          {/* Pro Benefits */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-green-800 mb-4">Pro-Funktionen freischalten</h2>
            <FeatureCallToAction />
          </div>
        </div>
      </main>
      
      <footer className="bg-white py-6 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
};

export default FreeCarePlan;
