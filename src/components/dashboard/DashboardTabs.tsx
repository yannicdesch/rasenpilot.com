
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Calendar, Check, Clock, Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateCarePlan } from '@/services/lawnService';

interface DashboardTabsProps {
  profile: any;
  loading: boolean;
  onGenerateCarePlan: () => Promise<void>;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ profile, loading, onGenerateCarePlan }) => {
  const navigate = useNavigate();

  return (
    <Tabs defaultValue="overview" className="w-full">
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
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start text-left text-green-700"
                  variant="ghost"
                  onClick={() => navigate('/care-plan')}
                >
                  <Check className="mr-2 h-4 w-4" />
                  <span>Pflegeplan öffnen</span>
                </Button>
                
                <Button 
                  className="w-full justify-start text-left text-green-700"
                  variant="ghost"
                  onClick={() => navigate('/free-care-plan')}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>14-Tage-Pflegeplan anzeigen</span>
                </Button>
                
                {loading ? (
                  <div className="flex items-center justify-center py-2">
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-green-600 border-r-transparent"></div>
                    <span className="ml-2 text-sm text-gray-500">Plan wird erstellt...</span>
                  </div>
                ) : (
                  <Button 
                    className="w-full justify-start text-left text-blue-600"
                    variant="ghost"
                    onClick={onGenerateCarePlan}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span>Pflegeplan neu generieren</span>
                  </Button>
                )}
              </div>
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
  );
};

export default DashboardTabs;
