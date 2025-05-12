
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock, Droplet, Sun, Wind } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useLawn } from '@/context/LawnContext';
import { generateCarePlan, CarePlanTask } from '@/services/lawnService';

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
  const { profile, isProfileComplete } = useLawn();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<CarePlanTask[]>([]);

  useEffect(() => {
    // Redirect to home if there's no profile
    if (!isProfileComplete) {
      toast({
        title: "Profil unvollständig",
        description: "Bitte erstellen Sie erst Ihr Rasenprofil.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    // Generate care plan based on profile
    setLoading(true);
    generateCarePlan(profile!)
      .then((carePlanTasks) => {
        setTasks(carePlanTasks);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error generating care plan:", error);
        toast({
          title: "Fehler",
          description: "Beim Generieren Ihres Pflegeplans ist ein Fehler aufgetreten.",
          variant: "destructive"
        });
        setLoading(false);
      });
  }, [profile, isProfileComplete, navigate]);

  const markComplete = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: true } : task
    ));
    
    toast({
      title: "Aufgabe als erledigt markiert",
      description: "Ihr Pflegeplan wurde aktualisiert."
    });
  };

  const setReminder = (id: number) => {
    toast({
      title: "Erinnerung gesetzt",
      description: "Sie erhalten eine Benachrichtigung, wenn es Zeit für diese Aufgabe ist."
    });
  };

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
                  <h1 className="text-3xl font-bold text-green-800">Ihr Rasenpflegeplan</h1>
                  <p className="text-gray-600">Maßgeschneidert für {profile?.grassType} Rasen in {profile?.zipCode}</p>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Calendar className="mr-2 h-4 w-4" /> In Kalender exportieren
                </Button>
              </div>
              
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
              
              <Card>
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
              <Card>
                <CardHeader className="bg-green-50 pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sun className="text-yellow-500" size={20} />
                    Wettereinfluss
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold">22°C</div>
                    <div className="text-sm">Sonnig</div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-yellow-50 rounded-md flex items-center">
                      <Sun className="text-yellow-500 mr-2" size={18} />
                      <div>
                        <p className="font-medium text-yellow-700">Heiß und trocken</p>
                        <p className="text-yellow-600">Früh morgens bewässern, um Verdunstung zu vermeiden</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-600">
                      Wetterdaten werden verwendet, um Ihre Pflegeplanempfehlungen anzupassen und Wasser zu sparen.
                    </p>
                  </div>
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
