
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";

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
    title: "Apply pre-emergent herbicide",
    dueDate: "2025-04-25",
    category: "weed control",
    completed: false,
  },
  {
    id: 2,
    title: "First fertilizer application",
    dueDate: "2025-04-26",
    category: "fertilizer",
    completed: false,
  },
  {
    id: 3,
    title: "Mow lawn (keep at 3-3.5 inches)",
    dueDate: "2025-04-27",
    category: "maintenance",
    completed: false,
  },
  {
    id: 4,
    title: "Check sprinkler system",
    dueDate: "2025-04-30",
    category: "watering",
    completed: true,
  },
  {
    id: 5,
    title: "Aerate soil",
    dueDate: "2025-05-05",
    category: "maintenance",
    completed: false,
  },
];

const TaskTimeline = () => {
  const [tasks, setTasks] = useState<LawnTask[]>(mockTasks);

  const toggleTaskCompletion = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  // Get upcoming tasks
  const upcomingTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Get completed tasks
  const completedTasks = tasks.filter(task => task.completed);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'weed control': return 'bg-purple-100 text-purple-800';
      case 'fertilizer': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-amber-100 text-amber-800';
      case 'watering': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border-lawn-earth-light">
      <CardHeader className="bg-lawn-earth-light/30">
        <CardTitle className="flex items-center gap-2">
          <Clock size={20} className="text-lawn-earth" />
          <span>Lawn Care Timeline</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-2 text-gray-500 uppercase tracking-wider">Upcoming Tasks</h3>
            {upcomingTasks.length > 0 ? (
              <div className="space-y-2">
                {upcomingTasks.map(task => (
                  <div key={task.id} className="task-item">
                    <Checkbox 
                      id={`task-${task.id}`} 
                      checked={task.completed}
                      onCheckedChange={() => toggleTaskCompletion(task.id)} 
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
              <div className="p-4 text-center text-gray-500">No upcoming tasks</div>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold text-sm mb-2 text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Check size={16} className="text-lawn-green" />
              <span>Completed</span>
            </h3>
            {completedTasks.length > 0 ? (
              <div className="space-y-2">
                {completedTasks.map(task => (
                  <div key={task.id} className="task-item bg-gray-50">
                    <Checkbox 
                      id={`task-${task.id}`} 
                      checked={task.completed}
                      onCheckedChange={() => toggleTaskCompletion(task.id)} 
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
              <div className="p-4 text-center text-gray-500">No completed tasks</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskTimeline;
