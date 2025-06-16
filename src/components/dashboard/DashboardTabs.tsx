
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Calendar, MessageSquare, RefreshCw, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TaskTimeline from '@/components/TaskTimeline';

interface DashboardTabsProps {
  profile: any;
  loading: boolean;
  onGenerateCarePlan: () => Promise<void>;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ profile, loading, onGenerateCarePlan }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-100 hover:shadow-md transition-shadow bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="text-green-600" size={18} />
              Pflegeplan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Personalisierte Aufgaben für Ihren Rasen
            </p>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => navigate('/care-plan')}
            >
              Plan öffnen
            </Button>
          </CardContent>
        </Card>
        
        <Card className="border-green-100 hover:shadow-md transition-shadow bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="text-green-600" size={18} />
              KI-Assistent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Fragen Sie unseren ChatGPT-Rasenexperten
            </p>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => navigate('/chat')}
            >
              Chat starten
            </Button>
          </CardContent>
        </Card>
        
        <Card className="border-green-100 hover:shadow-md transition-shadow bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckSquare className="text-green-600" size={18} />
              Aufgaben
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Verwalten Sie Ihre Rasenpflege-Aufgaben
            </p>
            {loading ? (
              <div className="flex items-center justify-center py-2">
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-green-600 border-r-transparent"></div>
                <span className="ml-2 text-sm text-gray-500">Laden...</span>
              </div>
            ) : (
              <Button 
                variant="outline"
                className="w-full"
                onClick={onGenerateCarePlan}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Aktualisieren
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Task Timeline - This is the main care plan display, no duplication needed */}
      <TaskTimeline />
    </div>
  );
};

export default DashboardTabs;
