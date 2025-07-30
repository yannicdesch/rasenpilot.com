import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, Info, Leaf, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import SEO from '@/components/SEO';

const CarePlan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [carePlan, setCarePlan] = useState<any>(null);

  useEffect(() => {
    checkAuthAndLoadPlan();
  }, []);

  const checkAuthAndLoadPlan = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/lawn-analysis');
        return;
      }

      setIsAuthenticated(true);
      
      // Get analysis result from navigation state or generate a plan
      const analysisResult = location.state?.analysisResult;
      
      if (analysisResult) {
        generateCarePlan(analysisResult);
      } else {
        // Load existing care plan or create a default one
        setCarePlan(getDefaultCarePlan());
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Fehler beim Laden des Pflegeplans');
    } finally {
      setLoading(false);
    }
  };

  const generateCarePlan = (analysisResult: any) => {
    const plan = {
      score: analysisResult.score,
      timeframe: '4-6 Wochen',
      tasks: [
        {
          week: 1,
          title: 'Bodenvorbereitung',
          tasks: [
            'pH-Wert und Nährstoffgehalt des Bodens testen',
            'Vorauflaufherbizid anwenden falls erforderlich',
            'Unkraut und abgestorbenes Gras entfernen'
          ],
          completed: false
        },
        {
          week: 2,
          title: 'Düngung',
          tasks: [
            'Stickstoffreichen Dünger ausbringen',
            'Nach der Anwendung gründlich wässern',
            'Erste Wachstumszeichen beobachten'
          ],
          completed: false
        },
        {
          week: 3,
          title: 'Nachsaat',
          tasks: [
            'Kahle Stellen mit geeignetem Grassamen nachsäen',
            'Boden gleichmäßig feucht halten',
            'Starke Belastung vermeiden'
          ],
          completed: false
        },
        {
          week: 4,
          title: 'Pflege',
          tasks: [
            'Regelmäßigen Mähplan beginnen',
            'Bewässerung je nach Wetterlage anpassen',
            'Auf Schädlinge und Krankheiten überwachen'
          ],
          completed: false
        }
      ]
    };

    setCarePlan(plan);
  };

  const getDefaultCarePlan = () => ({
    score: 75,
    timeframe: '4-6 Wochen',
    tasks: [
      {
        week: 1,
        title: 'Bestandsaufnahme & Vorbereitung',
        tasks: [
          'Fotos vom aktuellen Rasenzustand machen',
          'pH-Wert und Nährstoffgehalt des Bodens testen',
          'Ihren Rasenpflegeplan erstellen'
        ],
        completed: false
      },
      {
        week: 2,
        title: 'Erste Behandlung',
        tasks: [
          'Geeigneten Dünger ausbringen',
          'Unkrautprobleme angehen',
          'Bewässerungsplan einrichten'
        ],
        completed: false
      }
    ]
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <SEO 
          title="Personalisierter Rasenpflegeplan - Schritt-für-Schritt Anleitung | Rasenpilot"
          description="Ihr individueller, KI-generierter Rasenpflegeplan mit detaillierten Schritt-für-Schritt Anleitungen. Zeitplan, Düngeempfehlungen und saisonale Pflegetipps."
          canonical="/care-plan"
          keywords="Rasenpflegeplan, Rasen Pflegeplan, individueller Rasenpflegeplan, Rasen Zeitplan, Düngeplan Rasen"
          noindex={false}
        />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ihr Pflegeplan wird geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <SEO 
        title="Personalisierter Rasenpflegeplan - Schritt-für-Schritt Anleitung | Rasenpilot"
        description="Ihr individueller, KI-generierter Rasenpflegeplan mit detaillierten Schritt-für-Schritt Anleitungen. Zeitplan, Düngeempfehlungen und saisonale Pflegetipps."
        canonical="/care-plan"
        keywords="Rasenpflegeplan, Rasen Pflegeplan, individueller Rasenpflegeplan, Rasen Zeitplan, Düngeplan Rasen"
        noindex={false}
      />
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-green-800">Rasenpilot</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/highscore')}
            >
              Bestenliste
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/blog-overview')}
            >
              Ratgeber
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Startseite
            </Button>
          </div>
        </nav>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-800 mb-4">
              Ihr persönlicher Rasenpflegeplan
            </h1>
            <p className="text-gray-600 text-lg">
              Befolgen Sie diesen Schritt-für-Schritt Plan um Ihre Rasengesundheit zu verbessern
            </p>
          </div>

          {carePlan && (
            <>
              {/* Plan Overview */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Plan-Übersicht
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {carePlan.score}/100
                      </div>
                      <p className="text-gray-600">Aktueller Score</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {carePlan.timeframe}
                      </div>
                      <p className="text-gray-600">Geschätzte Dauer</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {carePlan.tasks.length}
                      </div>
                      <p className="text-gray-600">Phasen</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Tasks */}
              <div className="space-y-6">
                {carePlan.tasks.map((phase: any, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Woche {phase.week}: {phase.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {phase.tasks.map((task: string, taskIndex: number) => (
                          <li key={taskIndex} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            <span className="text-gray-700">{task}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 text-center space-y-4">
                <Button 
                  onClick={() => navigate('/lawn-analysis')}
                  className="bg-green-600 hover:bg-green-700 mr-4"
                >
                  Neues Foto analysieren
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.print()}
                >
                  Plan drucken
                </Button>
                
                <div className="bg-green-50 p-6 rounded-lg border border-green-200 mt-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    💡 Tipp: Unbegrenzte Analysen
                  </h3>
                  <p className="text-green-700">
                    Sie können jederzeit neue Fotos Ihres Rasens hochladen und analysieren lassen. 
                    Beobachten Sie den Fortschritt und passen Sie Ihren Pflegeplan entsprechend an!
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarePlan;
