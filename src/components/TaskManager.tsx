
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { CalendarIcon, CheckSquare, Clock, Plus, X } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  user_id: string;
  created_at: string;
}

const TaskManager = () => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const queryClient = useQueryClient();
  
  const fetchTasks = async (): Promise<Task[]> => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data || [];
  };
  
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });
  
  const createTaskMutation = useMutation({
    mutationFn: async (title: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Sie müssen angemeldet sein, um Aufgaben zu erstellen');
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title,
          user_id: session.user.id,
          completed: false,
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      setNewTaskTitle('');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Aufgabe erstellt');
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    }
  });
  
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string, completed: boolean }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId);
      
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    }
  });
  
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Aufgabe gelöscht');
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    }
  });
  
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaskTitle.trim()) {
      toast.error('Bitte geben Sie einen Titel für die Aufgabe ein');
      return;
    }
    
    createTaskMutation.mutate(newTaskTitle.trim());
  };
  
  const handleToggleTask = (taskId: string, completed: boolean) => {
    toggleTaskMutation.mutate({ taskId, completed });
  };
  
  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
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
          <form onSubmit={handleCreateTask} className="flex gap-2 mb-6">
            <Input
              placeholder="Neue Aufgabe hinzufügen..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={createTaskMutation.isPending}>
              <Plus className="h-4 w-4" />
            </Button>
          </form>
          
          {isLoading ? (
            <div className="text-center py-6">Lade Aufgaben...</div>
          ) : tasks.length === 0 ? (
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
                      className="mt-0.5" // Align with first line of text
                    />
                    <div>
                      <p className={`${task.completed ? 'line-through' : ''}`}>
                        {task.title}
                      </p>
                      {task.due_date && (
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(task.due_date)}
                        </div>
                      )}
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
