
import React, { useState, useEffect } from 'react';
import MainNavigation from '@/components/MainNavigation';
import WeatherWidget from '@/components/WeatherWidget';
import TaskTimeline from '@/components/TaskTimeline';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Check, Clock, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLawn } from '@/context/LawnContext';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { profile } = useLawn();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <MainNavigation />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            {/* Main Content */}
            <div className="w-full lg:w-2/3 space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-green-800 dark:text-green-400">
                  Willkommen zurück{profile?.name ? `, ${profile.name}` : ''}
                </h1>
                <Button onClick={() => navigate('/profile')} variant="outline">
                  Profil bearbeiten
                </Button>
              </div>
              
              <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="w-full bg-white dark:bg-gray-800 border">
                  <TabsTrigger value="overview" className="flex-1">Übersicht</TabsTrigger>
                  <TabsTrigger value="calendar" className="flex-1">Kalender</TabsTrigger>
                  <TabsTrigger value="photos" className="flex-1">Meine Fotos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="border-green-100 dark:border-green-800 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Calendar className="text-green-600 dark:text-green-500" size={18} />
                          Nächste Aufgaben
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          className="w-full justify-start text-left"
                          variant="ghost"
                          onClick={() => navigate('/care-plan')}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          <span>Pflegeplan öffnen</span>
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-green-100 dark:border-green-800 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Clock className="text-green-600 dark:text-green-500" size={18} />
                          KI-Assistent
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          className="w-full justify-start text-left"
                          variant="ghost"
                          onClick={() => navigate('/chat')}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          <span>Neue Frage stellen</span>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="calendar" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pflegeplan Kalender</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                        Ihr personalisierter Kalender wird hier angezeigt.
                        <br />
                        <Button 
                          className="mt-4"
                          onClick={() => navigate('/care-plan')}
                        >
                          Zum Pflegeplan
                        </Button>
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="photos" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Meine Rasenfotos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                        Hier können Sie Fotos Ihres Rasens hochladen und den Fortschritt dokumentieren.
                        <br />
                        <Button 
                          className="mt-4"
                          onClick={() => navigate('/profile')}
                        >
                          Fotos verwalten
                        </Button>
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Sidebar */}
            <div className="w-full lg:w-1/3 space-y-6">
              <WeatherWidget />
              <TaskTimeline />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white dark:bg-gray-800 py-6 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
