
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import WeatherInfo from '@/components/WeatherInfo';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock, Droplet, Sun, Wind } from 'lucide-react';
import { toast } from "sonner";
import { useLawn } from '@/context/LawnContext';
import { 
  generateCarePlan, 
  CarePlanTask, 
  fetchWeatherData, 
  WeatherData,
  getTaskTitle,
  getTaskDescription
} from '@/services/lawnService';
import ReminderSettings from '@/components/ReminderSettings';

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

const getTaskIcon = (type: string) => {
  switch(type) {
    case "mowing":
      return <Sun size={18} className="text-yellow-500" />;
    case "fertilizing":
      return <Droplet size={18} className="text-green-600" />;
    case "watering":
      return <Droplet size={18} className="text-blue-500" />;
    case "weeding":
      return <Sun size={18} className="text-red-500" />;
    default:
      return <Clock size={18} className="text-gray-500" />;
  }
};

const CarePlan = () => {
  const { profile, isProfileComplete, syncProfileWithSupabase, isAuthenticated, subscriptionDetails } = useLawn();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<CarePlanTask[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [extendPlan, setExtendPlan] = useState(false);

  useEffect(() => {
    // Make sure profile is synced with Supabase
    syncProfileWithSupabase();
    
    // Redirect to home if there's no profile
    if (!isProfileComplete) {
      toast("Profil unvollständig. Bitte erstellen Sie erst Ihr Rasenprofil.");
      navigate('/');
      return;
    }

    // Generate care plan based on profile
    setLoading(true);
    generateCarePlan(profile!)
      .then((carePlanTasks) => {
        setTasks(carePlanTasks);
        // Save tasks to localStorage for persistence
        localStorage.setItem('lawnTasks', JSON.stringify(carePlanTasks));
        setLoading(false);
      })
      .catch(error => {
        console.error("Error generating care plan:", error);
        toast("Beim Generieren Ihres Pflegeplans ist ein Fehler aufgetreten.");
        
        // Try to load from localStorage if available
        const savedTasks = localStorage.getItem('lawnTasks');
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        }
        
        setLoading(false);
      });
      
    // Fetch weather data
    if (profile?.zipCode) {
      setWeatherLoading(true);
      fetchWeatherData(profile.zipCode)
        .then(data => {
          setWeatherData(data);
          setWeatherLoading(false);
        })
        .catch(error => {
          console.error("Error fetching weather data:", error);
          setWeatherLoading(false);
        });
    }
  }, [profile, isProfileComplete, navigate, syncProfileWithSupabase]);

  const markComplete = (id: number) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, completed: true } : task
    );
    
    setTasks(updatedTasks);
    localStorage.setItem('lawnTasks', JSON.stringify(updatedTasks));
    
    toast("Aufgabe als erledigt markiert. Ihr Pflegeplan wurde aktualisiert.");
  };

  const setReminder = (id: number) => {
    if (!isAuthenticated) {
      toast("Melden Sie sich an, um Erinnerungen zu setzen", {
        description: "Diese Funktion erfordert einen Account."
      });
      return;
    }
    
    toast("Erinnerung gesetzt. Sie erhalten eine Benachrichtigung, wenn es Zeit für diese Aufgabe ist.");
  };

  const handleExtendPlan = () => {
    if (!isAuthenticated) {
      toast("Bitte registrieren Sie sich, um Ihren Plan zu erweitern", {
        description: "Die Erweiterung Ihres Pflegeplans erfordert einen Account."
      });
      navigate('/auth', { state: { redirectTo: '/care-plan' } });
      return;
    }
    
    if (subscriptionDetails.plan === 'free') {
      setExtendPlan(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // For paid users, generate extended plan immediately
      toast.success("Ihr erweiterter Pflegeplan wird generiert...");
      setLoading(true);
      
      // Simulate extended plan generation
      setTimeout(() => {
        const extendedTasks = [...tasks];
        const lastDate = new Date(tasks[tasks.length - 1].date);
        
        // Add 8 more tasks (4 weeks)
        for (let i = 1; i <= 8; i++) {
          const newDate = new Date(lastDate);
          newDate.setDate(lastDate.getDate() + i * 2);
          
          extendedTasks.push({
            id: tasks.length + i,
            date: newDate.toISOString().split('T')[0],
            title: `Erweiterte Pflege: ${getTaskTitle('mowing', profile?.grassType || 'Standard')}`,
            description: `Diese Aufgabe ist Teil Ihres erweiterten Pflegeplans. ${getTaskDescription('mowing', profile!)}`,
            completed: false,
            type: i % 4 === 0 ? 'fertilizing' : i % 3 === 0 ? 'watering' : i % 2 === 0 ? 'weeding' : 'mowing',
          });
        }
        
        setTasks(extendedTasks);
        localStorage.setItem('lawnTasks', JSON.stringify(extendedTasks));
        setLoading(false);
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
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
    <div className="min-h-screen flex flex-col bg-white">
      <MainNavigation />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          {extendPlan && subscriptionDetails.plan === 'free' && (
            <Card className="mb-6 border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold text-amber-800">Erweitern Sie Ihren Pflegeplan</h2>
                  <p className="text-gray-600">Für einen umfassenden Jahrespflegeplan benötigen Sie ein Premium-Konto</p>
                </div>
                <div className="flex justify-center">
                  <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => navigate('/auth', { state: { upgradeSubscription: true } })}>
                    Auf Premium upgraden
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            {/* Main Content */}
            <div className="w-full lg:w-2/3 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-green-800">Ihr Rasenpflegeplan</h1>
                  <p className="text-gray-600">Maßgeschneidert für {profile?.grassType} Rasen in {profile?.zipCode}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Calendar className="mr-2 h-4 w-4" /> In Kalender exportieren
                  </Button>
                  <Button variant="outline" onClick={handleExtendPlan}>
                    Plan erweitern
                  </Button>
                </div>
              </div>
              
              <Card className="border border-green-100 shadow-sm bg-white">
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
                          {!task.completed && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-green-200 text-green-700 hover:bg-green-50"
                                onClick={() => markComplete(task.id)}
                              >
                                <CheckCircle className="mr-1 h-4 w-4" /> Als erledigt markieren
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                onClick={() => setReminder(task.id)}
                              >
                                <Clock className="mr-1 h-4 w-4" /> Erinnerung setzen
                              </Button>
                            </div>
                          )}
                          {task.completed && (
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="mr-1 h-3 w-3" /> Erledigt
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-green-100 shadow-sm bg-white">
                <CardHeader className="pb-2">
                  <CardTitle>Saisonale Tipps</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {[
                      `Für Ihren ${profile?.grassType} Rasen ist jetzt die ideale Zeit für regelmäßige Bewässerung.`,
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
            </div>
            
            {/* Sidebar */}
            <div className="w-full lg:w-1/3 space-y-6">
              <WeatherInfo weatherData={weatherData} loading={weatherLoading} />
              
              <Card className="border border-green-100 shadow-sm bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Ihr Rasenprofil</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">PLZ</span>
                      <span className="font-medium">{profile?.zipCode}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Rasentyp</span>
                      <span className="font-medium">{profile?.grassType}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Rasenfläche</span>
                      <span className="font-medium">{profile?.lawnSize} m²</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-gray-500">Hauptziel</span>
                      <span className="font-medium">{profile?.lawnGoal}</span>
                    </div>
                    
                    <Button variant="outline" className="w-full mt-2" onClick={() => navigate('/')}>
                      Rasenprofil aktualisieren
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <ReminderSettings />
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white py-6 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
};

export default CarePlan;
