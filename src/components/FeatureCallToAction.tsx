
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const FeatureCallToAction = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(!!data.session);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />;
  }

  if (isAuthenticated) {
    return null; // Don't show for authenticated users
  }

  return (
    <Card className="border-green-100 dark:border-green-800 bg-gradient-to-r from-green-50 to-white dark:from-gray-800 dark:to-gray-900 hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center flex-shrink-0">
            <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-green-800 dark:text-green-400 mb-1">
              Premium-Funktionen freischalten
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Mit einem kostenlosen Konto erhalten Sie personalisierte Pflegepläne, Aufgabenmanagement, 
              KI-Chatverläufe und vieles mehr.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-6 py-4 bg-green-50 dark:bg-gray-800/50 flex justify-between items-center">
        <Button 
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => navigate('/features')}
        >
          Alle Premium-Funktionen ansehen
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          className="text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-gray-700"
          onClick={() => navigate('/auth')}
        >
          Registrieren
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FeatureCallToAction;
