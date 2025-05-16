
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock, RefreshCcw } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useLawn } from '@/context/LawnContext';
import { toast } from 'sonner';
import { generateCarePlan, regenerateCarePlan } from '@/services/lawnService';

type LawnTask = {
  id: number;
  title: string;
  dueDate: string;
  category: string;
  completed: boolean;
};

const TaskTimeline = () => {
  const { profile } = useLawn();
  const [tasks, setTasks] = useState<LawnTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [profile]);

  const loadTasks = async () => {
    setLoading(true);
    setError(false);
    
    // Try to load tasks from localStorage
    const savedTasks = localStorage.getItem('lawnTimelineTasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks) as LawnTask[];
        if (parsedTasks && parsedTasks.length > 0) {
          console.log("Retrieved timeline tasks from localStorage:", parsedTasks.length);
          setTasks(parsedTasks);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Error parsing saved timeline tasks:", e);
      }
    }
    
    // If no tasks found or error parsing, try to generate new ones
    if (profile) {
      try {
        // Generate care plan which will also update timeline tasks
        await generateCarePlan(profile);
        
        // Now try to read the updated timeline tasks
        const newSavedTasks = localStorage.getItem('lawnTimelineTasks');
        if (newSavedTasks) {
          const parsedTasks = JSON.parse(newSavedTasks) as LawnTask[];
          if (parsedTasks && parsedTasks.length > 0) {
            setTasks(parsedTasks);
            setLoading(false);
            return;
          }
        }
        
        setError(true);
        toast.error("Fehler beim Laden der Aufgaben");
      } catch (error) {
        console.error("Error generating care plan:", error);
        setError(true);
        toast.error("Pflegeplan konnte nicht erstellt werden");
      }
    } else {
      console.log("No profile available, can't generate tasks");
      setError(true);
    }
    
    setLoading(false);
  };

  const handleRegenerate = async () => {
    if (!profile) {
      toast.error("Kein Profil verfügbar");
      return;
    }
    
    setLoading(true);
    try {
      await regenerateCarePlan(profile);
      await loadTasks(); // This will load the newly generated tasks
      toast.success("Pflegeplan wurde aktualisiert");
    } catch (error) {
      console.error("Error regenerating care plan:", error);
      setError(true);
      toast.error("Pflegeplan konnte nicht aktualisiert werden");
      setLoading(false);
    }
  };

  const toggleTaskCompletion = (taskId: number) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    
    setTasks(updatedTasks);
    
    // Save updated tasks to localStorage
    localStorage.setItem('lawnTimelineTasks', JSON.stringify(updatedTasks));
    
    // Show confirmation toast
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const isNowCompleted = !task.completed;
      toast[isNowCompleted ? 'success' : 'info'](
        isNowCompleted ? 'Aufgabe erledigt!' : 'Aufgabe wieder offen',
        { description: task.title }
      );
    }
  };

  // Anstehende Aufgaben abrufen
  const upcomingTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Abgeschlossene Aufgaben abrufen
  const completedTasks = tasks.filter(task => task.completed);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('de-DE', options);
  };

  const getCategoryColor = (category: string) => {
    const normalizedCategory = category.toLowerCase();
    if (normalizedCategory.includes('unkraut')) return 'bg-purple-100 text-purple-800';
    if (normalizedCategory.includes('düng')) return 'bg-blue-100 text-blue-800';
    if (normalizedCategory.includes('pflege') || normalizedCategory.includes('mäh')) return 'bg-amber-100 text-amber-800';
    if (normalizedCategory.includes('wässer') || normalizedCategory.includes('bewässer')) return 'bg-cyan-100 text-cyan-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card className="border-green-100 bg-white">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} className="text-green-600" />
            <span>Rasen-Pflegeplan wird geladen...</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-40 flex items-center justify-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-green-100 bg-white">
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} className="text-red-600" />
            <span>Fehler beim Laden des Pflegeplans</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-center space-y-4">
            <p className="text-gray-600">Der Pflegeplan konnte nicht geladen werden.</p>
            <Button 
              onClick={loadTasks}
              className="bg-green-600 hover:bg-green-700"
            >
              Erneut versuchen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-100 bg-white">
      <CardHeader className="bg-green-50">
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center">
            <Clock size={20} className="text-green-600 mr-2" />
            <span>Rasen-Pflegeplan</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={handleRegenerate}
            title="Pflegeplan aktualisieren"
          >
            <RefreshCcw size={16} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-2 text-gray-500 uppercase tracking-wider">Anstehende Aufgaben</h3>
            {upcomingTasks.length > 0 ? (
              <div className="space-y-2">
                {upcomingTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-start gap-2 p-2 rounded border border-gray-100 bg-white">
                    <Checkbox 
                      id={`task-${task.id}`} 
                      checked={task.completed}
                      onCheckedChange={() => toggleTaskCompletion(task.id)} 
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={`task-${task.id}`}
                        className="font-medium cursor-pointer"
                      >
                        {task.title}
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{formatDate(task.dueDate)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(task.category)}`}>
                          {task.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {upcomingTasks.length > 3 && (
                  <Button 
                    variant="ghost" 
                    className="w-full text-sm text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => window.location.href = '/care-plan'}
                  >
                    {upcomingTasks.length - 3} weitere Aufgaben anzeigen...
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">Keine anstehenden Aufgaben</div>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold text-sm mb-2 text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Check size={16} className="text-green-600" />
              <span>Erledigt</span>
            </h3>
            {completedTasks.length > 0 ? (
              <div className="space-y-2">
                {completedTasks.slice(0, 2).map(task => (
                  <div key={task.id} className="flex items-start gap-2 p-2 rounded border border-gray-100 bg-green-50">
                    <Checkbox 
                      id={`task-${task.id}`} 
                      checked={task.completed}
                      onCheckedChange={() => toggleTaskCompletion(task.id)} 
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={`task-${task.id}`}
                        className="font-medium cursor-pointer line-through text-gray-500"
                      >
                        {task.title}
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{formatDate(task.dueDate)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600`}>
                          {task.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">Keine erledigten Aufgaben</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskTimeline;
