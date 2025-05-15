
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
    <div className="min-h-screen flex flex-col bg-white">
      <MainNavigation />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            {/* Main Content */}
            <div className="w-full md:w-2/3 space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-green-800">
                  Willkommen zurück{profile?.name ? `, ${profile.name}` : ''}
                </h1>
                <Button onClick={() => navigate('/profile')} variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                  Profil bearbeiten
                </Button>
              </div>
              
              <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="w-full bg-green-50 border-green-100">
                  <TabsTrigger value="overview" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-green-800">Übersicht</TabsTrigger>
                  <TabsTrigger value="calendar" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-green-800">Kalender</TabsTrigger>
                  <TabsTrigger value="photos" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-green-800">Meine Fotos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-green-100 hover:shadow-md transition-shadow bg-white">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Calendar className="text-green-600" size={18} />
                          Nächste Aufgaben
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          className="w-full justify-start text-left text-green-700"
                          variant="ghost"
                          onClick={() => navigate('/care-plan')}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          <span>Pflegeplan öffnen</span>
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-green-100 hover:shadow-md transition-shadow bg-white">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Clock className="text-green-600" size={18} />
                          KI-Assistent
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          className="w-full justify-start text-left text-green-700"
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
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>Pflegeplan Kalender</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center text-gray-500 py-12">
                        Ihr personalisierter Kalender wird hier angezeigt.
                        <br />
                        <Button 
                          className="mt-4 bg-green-600 hover:bg-green-700"
                          onClick={() => navigate('/care-plan')}
                        >
                          Zum Pflegeplan
                        </Button>
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="photos" className="mt-4">
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>Meine Rasenfotos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center text-gray-500 py-12">
                        Hier können Sie Fotos Ihres Rasens hochladen und den Fortschritt dokumentieren.
                        <br />
                        <Button 
                          className="mt-4 bg-green-600 hover:bg-green-700"
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
            <div className="w-full md:w-1/3 space-y-6">
              <WeatherWidget />
              <TaskTimeline />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white py-6 border-t border-green-100">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
