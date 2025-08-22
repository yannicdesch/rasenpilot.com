import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Calendar, Target, TrendingUp, Clock, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LawnJourneyTrackerProps {
  analysisScore: number;
  analysisId: string;
  recommendations: any;
}

interface TaskStep {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timeframe: string;
  completed: boolean;
  dueDate?: Date;
  category: 'immediate' | 'weekly' | 'monthly';
}

const LawnJourneyTracker: React.FC<LawnJourneyTrackerProps> = ({
  analysisScore,
  analysisId,
  recommendations
}) => {
  const [tasks, setTasks] = useState<TaskStep[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'immediate' | 'establishment' | 'optimization'>('immediate');

  useEffect(() => {
    initializeTasks();
  }, [recommendations]);

  const initializeTasks = () => {
    const initialTasks: TaskStep[] = [
      // Immediate tasks (0-2 weeks)
      {
        id: 'water-1',
        title: 'Bewässerung optimieren',
        description: 'Täglich morgens oder abends bewässern, bis der Boden feucht ist',
        priority: 'high',
        timeframe: 'Täglich',
        completed: false,
        category: 'immediate',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'fertilize-1',
        title: 'Erste Düngung',
        description: 'Hochwertigen Rasendünger gleichmäßig ausbringen',
        priority: 'high',
        timeframe: 'Diese Woche',
        completed: false,
        category: 'immediate',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'verticut-1',
        title: 'Vertikutieren',
        description: 'Moos und Rasenfilz entfernen für bessere Luftzirkulation',
        priority: 'medium',
        timeframe: 'Nächste 2 Wochen',
        completed: false,
        category: 'immediate',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'reseed-1',
        title: 'Nachsaat',
        description: 'Kahle Stellen mit passender Rasensaat schließen',
        priority: 'medium',
        timeframe: 'Nach Vertikutieren',
        completed: false,
        category: 'immediate',
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
      },
      // Weekly maintenance
      {
        id: 'mow-weekly',
        title: 'Regelmäßig mähen',
        description: 'Rasen wöchentlich auf 4-5cm Höhe mähen',
        priority: 'medium',
        timeframe: 'Wöchentlich',
        completed: false,
        category: 'weekly',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'check-progress',
        title: 'Fortschritt dokumentieren',
        description: 'Wöchentlich Fotos machen und Verbesserungen notieren',
        priority: 'low',
        timeframe: 'Wöchentlich',
        completed: false,
        category: 'weekly',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      // Monthly optimization
      {
        id: 'soil-test',
        title: 'Boden pH-Wert testen',
        description: 'pH-Wert messen und bei Bedarf Kalk ausbringen',
        priority: 'low',
        timeframe: 'Monatlich',
        completed: false,
        category: 'monthly',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'seasonal-care',
        title: 'Saisonale Pflege',
        description: 'Jahreszeitlich angepasste Pflegemaßnahmen durchführen',
        priority: 'medium',
        timeframe: 'Saisonal',
        completed: false,
        category: 'monthly',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    ];

    setTasks(initialTasks);
    setCompletedCount(0);
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => {
      const updated = prev.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      setCompletedCount(updated.filter(t => t.completed).length);
      return updated;
    });
  };

  const getPhaseProgress = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  };

  const getPhaseDescription = () => {
    const progress = getPhaseProgress();
    if (progress < 25) {
      return "Beginnen Sie mit den wichtigsten Sofortmaßnahmen";
    } else if (progress < 50) {
      return "Großartig! Die Grundlagen sind gelegt";
    } else if (progress < 75) {
      return "Ihr Rasen zeigt bereits erste Verbesserungen";
    } else {
      return "Exzellent! Ihr Rasen ist auf dem besten Weg";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryTasks = (category: string) => {
    return tasks.filter(task => task.category === category);
  };

  const formatDaysUntilDue = (dueDate?: Date) => {
    if (!dueDate) return '';
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Überfällig';
    if (diffDays === 0) return 'Heute fällig';
    if (diffDays === 1) return 'Morgen fällig';
    return `In ${diffDays} Tagen`;
  };

  return (
    <div className="space-y-6">
      {/* Journey Overview */}
      <Card className="bg-gradient-to-br from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Ihr Rasen-Verbesserungs-Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Gesamtfortschritt</span>
              <span className="text-sm text-gray-600">{completedCount}/{tasks.length} Aufgaben</span>
            </div>
            <Progress value={getPhaseProgress()} className="h-3" />
            <p className="text-sm text-gray-700">{getPhaseDescription()}</p>
            
            {/* Phase indicators */}
            <div className="flex gap-2 mt-4">
              <Badge variant={getPhaseProgress() >= 25 ? "default" : "outline"} className="text-xs">
                Phase 1: Sofortmaßnahmen
              </Badge>
              <Badge variant={getPhaseProgress() >= 50 ? "default" : "outline"} className="text-xs">
                Phase 2: Etablierung
              </Badge>
              <Badge variant={getPhaseProgress() >= 75 ? "default" : "outline"} className="text-xs">
                Phase 3: Optimierung
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Immediate Actions (0-2 weeks) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Clock className="h-5 w-5" />
            Sofortmaßnahmen (0-2 Wochen)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getCategoryTasks('immediate').map(task => (
              <div key={task.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="mt-1"
                >
                  {task.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {task.title}
                    </h4>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                  </div>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-500">{task.timeframe}</span>
                    {task.dueDate && (
                      <span className="text-xs text-orange-600 font-medium">
                        {formatDaysUntilDue(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600">
            <Calendar className="h-5 w-5" />
            Wöchentliche Pflege
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getCategoryTasks('weekly').map(task => (
              <div key={task.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="mt-1"
                >
                  {task.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {task.title}
                    </h4>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                  </div>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <span className="text-xs text-gray-500">{task.timeframe}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <TrendingUp className="h-5 w-5" />
            Langzeit-Optimierung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getCategoryTasks('monthly').map(task => (
              <div key={task.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="mt-1"
                >
                  {task.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {task.title}
                    </h4>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                  </div>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <span className="text-xs text-gray-500">{task.timeframe}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success Motivation */}
      {getPhaseProgress() >= 75 && (
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="font-bold text-gray-800 mb-2">Fantastischer Fortschritt! 🎉</h3>
            <p className="text-sm text-gray-700 mb-4">
              Sie haben bereits {Math.round(getPhaseProgress())}% Ihres Rasenpflegeplans abgeschlossen. 
              Ihr Rasen wird sich in den nächsten Wochen deutlich verbessern!
            </p>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => window.location.href = '/lawn-analysis'}
            >
              Neue Analyse starten und Fortschritt messen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LawnJourneyTracker;