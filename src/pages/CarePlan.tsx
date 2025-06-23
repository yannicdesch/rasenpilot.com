
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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
        navigate('/auth');
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
      toast.error('Failed to load care plan');
    } finally {
      setLoading(false);
    }
  };

  const generateCarePlan = (analysisResult: any) => {
    const plan = {
      score: analysisResult.score,
      timeframe: '4-6 weeks',
      tasks: [
        {
          week: 1,
          title: 'Soil Preparation',
          tasks: [
            'Test soil pH and nutrient levels',
            'Apply pre-emergent herbicide if needed',
            'Remove debris and dead grass'
          ],
          completed: false
        },
        {
          week: 2,
          title: 'Fertilization',
          tasks: [
            'Apply nitrogen-rich fertilizer',
            'Water thoroughly after application',
            'Monitor for early growth signs'
          ],
          completed: false
        },
        {
          week: 3,
          title: 'Overseeding',
          tasks: [
            'Overseed thin areas with appropriate grass type',
            'Keep soil consistently moist',
            'Avoid heavy foot traffic'
          ],
          completed: false
        },
        {
          week: 4,
          title: 'Maintenance',
          tasks: [
            'Begin regular mowing schedule',
            'Adjust watering based on weather',
            'Monitor for pests and diseases'
          ],
          completed: false
        }
      ]
    };

    setCarePlan(plan);
  };

  const getDefaultCarePlan = () => ({
    score: 75,
    timeframe: '4-6 weeks',
    tasks: [
      {
        week: 1,
        title: 'Assessment & Preparation',
        tasks: [
          'Take photos of current lawn condition',
          'Test soil pH and nutrient levels',
          'Plan your lawn care schedule'
        ],
        completed: false
      },
      {
        week: 2,
        title: 'Initial Treatment',
        tasks: [
          'Apply appropriate fertilizer',
          'Address any weed issues',
          'Set up proper watering schedule'
        ],
        completed: false
      }
    ]
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your care plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-800 mb-4">
              Your Personalized Lawn Care Plan
            </h1>
            <p className="text-gray-600 text-lg">
              Follow this step-by-step plan to improve your lawn health
            </p>
          </div>

          {carePlan && (
            <>
              {/* Plan Overview */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Plan Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {carePlan.score}/100
                      </div>
                      <p className="text-gray-600">Current Score</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {carePlan.timeframe}
                      </div>
                      <p className="text-gray-600">Estimated Timeline</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {carePlan.tasks.length}
                      </div>
                      <p className="text-gray-600">Phases</p>
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
                        Week {phase.week}: {phase.title}
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
              <div className="mt-8 text-center">
                <Button 
                  onClick={() => navigate('/lawn-analysis')}
                  className="bg-green-600 hover:bg-green-700 mr-4"
                >
                  Analyze Another Photo
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.print()}
                >
                  Print Plan
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarePlan;
