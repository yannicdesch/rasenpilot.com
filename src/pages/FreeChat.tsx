
import React, { useEffect } from 'react';
import MainNavigation from '@/components/MainNavigation';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useLawn } from '@/context/LawnContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, MessageSquare, UserRound } from 'lucide-react';
import FeatureCallToAction from '@/components/FeatureCallToAction';

const FreeChat = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useLawn();
  
  useEffect(() => {
    // If user is already authenticated, redirect them to the full chat
    if (isAuthenticated) {
      navigate('/chat');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <MainNavigation />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-green-800 dark:text-green-400 mb-4">KI-Rasenberatung</h1>
          
          <Card className="mb-8">
            <CardHeader className="text-center bg-green-50 dark:bg-green-900/30">
              <div className="mx-auto bg-white dark:bg-gray-800 rounded-full p-4 shadow-sm mb-4 w-16 h-16 flex items-center justify-center">
                <Lock className="h-8 w-8 text-green-600 dark:text-green-500" />
              </div>
              <CardTitle className="text-2xl text-green-800 dark:text-green-400">
                Premium-Funktion
              </CardTitle>
              <CardDescription className="text-lg">
                Der KI-Rasenberater ist nur für registrierte Nutzer verfügbar
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    Unbegrenzte KI-Beratung
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Stellen Sie unserem KI-Assistenten unbegrenzt viele Fragen zu Ihrem Rasen. 
                    Die KI wurde mit tausenden von Rasendaten und Expertenwissen trainiert, 
                    um Ihnen präzise und personalisierte Antworten zu geben.
                  </p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    Persönlicher Rasenberater
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Unser KI-Assistent berücksichtigt Ihren spezifischen Rasentyp, 
                    Standort und Pflegeziele, um maßgeschneiderte Empfehlungen zu geben.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <p className="text-center text-gray-600 dark:text-gray-300">
                Registrieren Sie sich kostenlos, um Zugang zu unserem KI-Rasenberater zu erhalten.
              </p>
              <Button 
                className="w-full md:w-auto md:px-8 bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/auth')}
              >
                <UserRound className="mr-2 h-4 w-4" />
                Kostenlos registrieren
              </Button>
            </CardFooter>
          </Card>
          
          <div className="mt-8">
            <FeatureCallToAction variant="minimal" />
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

export default FreeChat;
