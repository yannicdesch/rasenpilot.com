
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { CheckSquare, Plus, X } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

const TaskManager = () => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaskTitle.trim()) {
      toast.error('Bitte geben Sie einen Titel für die Aufgabe ein');
      return;
    }
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      completed: false,
      created_at: new Date().toISOString()
    };
    
    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
    toast.success('Aufgabe erstellt (lokale Speicherung)');
  };
  
  const handleToggleTask = (taskId: string, completed: boolean) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed } : task
    ));
  };
  
  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast.success('Aufgabe gelöscht');
  };
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Aufgabenverwaltung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Hinweis:</strong> Die Aufgaben werden lokal gespeichert und gehen beim Neuladen der Seite verloren. 
              Für dauerhafte Speicherung ist eine Anmeldung erforderlich.
            </p>
          </div>
          
          <form onSubmit={handleCreateTask} className="flex gap-2 mb-6">
            <Input
              placeholder="Neue Aufgabe hinzufügen..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </form>
          
          {tasks.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <CheckSquare className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">Keine Aufgaben vorhanden</p>
              <p className="text-sm text-gray-500 mt-1">
                Fügen Sie Ihre erste Aufgabe hinzu
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  className={`flex items-start justify-between p-3 rounded-md ${
                    task.completed 
                      ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-500' 
                      : 'bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={task.completed}
                      onCheckedChange={(checked) => {
                        handleToggleTask(task.id, checked === true);
                      }}
                      className="mt-0.5"
                    />
                    <div>
                      <p className={`${task.completed ? 'line-through' : ''}`}>
                        {task.title}
                      </p>
                      <div className="text-xs text-gray-500 mt-1">
                        Erstellt: {formatDate(task.created_at)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskManager;
