
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { useLawn } from '@/context/LawnContext';
import { toast } from 'sonner';

type LawnTask = {
  id: number;
  title: string;
  dueDate: string;
  category: string;
  completed: boolean;
};

const mockTasks: LawnTask[] = [
  {
    id: 1,
    title: "Vorbeugungsmittel gegen Unkraut auftragen",
    dueDate: "2025-04-25",
    category: "Unkrautbekämpfung",
    completed: false,
  },
  {
    id: 2,
    title: "Erste Düngung durchführen",
    dueDate: "2025-04-26",
    category: "Düngung",
    completed: false,
  },
  {
    id: 3,
    title: "Rasen mähen (7-9 cm Höhe halten)",
    dueDate: "2025-04-27",
    category: "Pflege",
    completed: false,
  },
  {
    id: 4,
    title: "Bewässerungssystem überprüfen",
    dueDate: "2025-04-30",
    category: "Bewässerung",
    completed: true,
  },
  {
    id: 5,
    title: "Boden belüften",
    dueDate: "2025-05-05",
    category: "Pflege",
    completed: false,
  },
];

const TaskTimeline = () => {
  const { profile } = useLawn();
  const [tasks, setTasks] = useState<LawnTask[]>(mockTasks);

  useEffect(() => {
    // Try to load tasks from localStorage
    const savedTasks = localStorage.getItem('lawnTimelineTasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks) as LawnTask[];
        if (parsedTasks && parsedTasks.length > 0) {
          console.log("Retrieved timeline tasks from localStorage:", parsedTasks.length);
          setTasks(parsedTasks);
        }
      } catch (e) {
        console.error("Error parsing saved timeline tasks:", e);
        toast.error("Fehler beim Laden der gespeicherten Aufgaben");
      }
    }
  }, []);

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
    switch(category) {
      case 'Unkrautbekämpfung': return 'bg-purple-100 text-purple-800';
      case 'Düngung': return 'bg-blue-100 text-blue-800';
      case 'Pflege': return 'bg-amber-100 text-amber-800';
      case 'Bewässerung': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border-green-100 bg-white">
      <CardHeader className="bg-green-50">
        <CardTitle className="flex items-center gap-2">
          <Clock size={20} className="text-green-600" />
          <span>Rasen-Pflegeplan</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-2 text-gray-500 uppercase tracking-wider">Anstehende Aufgaben</h3>
            {upcomingTasks.length > 0 ? (
              <div className="space-y-2">
                {upcomingTasks.map(task => (
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
                {completedTasks.map(task => (
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
