
import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock, Droplet, Sun, Wind } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Mock care plan data (would come from API/OpenAI in production)
const mockCarePlan = {
  userProfile: {
    zipCode: "78701",
    grassType: "Bermuda",
    lawnSize: 5000,
    goal: "Greener Lawn",
  },
  currentWeather: {
    condition: "Sunny",
    temperature: 82,
    chanceOfRain: 0,
  },
  tasks: [
    {
      id: 1,
      date: "2025-05-12",
      title: "Mow your lawn",
      description: "Cut to 2 inches height for Bermuda grass in your region",
      completed: true,
      type: "mowing"
    },
    {
      id: 2,
      date: "2025-05-14",
      title: "Apply nitrogen-rich fertilizer",
      description: "Use 1 lb nitrogen per 1000 sq ft to promote green growth",
      completed: false,
      type: "fertilizing"
    },
    {
      id: 3,
      date: "2025-05-15",
      title: "Water deeply (early morning)",
      description: "Apply 1 inch of water to encourage deep root growth",
      completed: false,
      type: "watering"
    },
    {
      id: 4,
      date: "2025-05-19",
      title: "Spot treat weeds",
      description: "Use selective herbicide for broadleaf weeds appearing in your Bermuda grass",
      completed: false,
      type: "weeding"
    },
    {
      id: 5,
      date: "2025-05-20",
      title: "Mow your lawn",
      description: "Maintain 2 inch height, following the 1/3 rule (don't cut more than 1/3 of height)",
      completed: false,
      type: "mowing"
    }
  ],
  tips: [
    "For your Bermuda grass in ZIP 78701, May is an ideal time to focus on fertilization",
    "Your current soil conditions may benefit from a pH test before applying additional amendments",
    "Based on your goal for a greener lawn, focus on nitrogen-rich fertilizers and proper watering",
    "Expected high temperatures this week may require additional morning watering sessions",
    "Consider aeration in the coming weeks to improve nutrient absorption"
  ]
};

const getTaskIcon = (type: string) => {
  switch(type) {
    case "mowing":
      return <Sun size={18} className="text-yellow-500" />;
    case "fertilizing":
      return <Droplet size={18} className="text-green-600" />;
    case "watering":
      return <Droplet size={18} className="text-blue-500" />;
    case "weeding":
      return <Sun size={18} className="text-red-500" />;
    default:
      return <Clock size={18} className="text-gray-500" />;
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

const CarePlan = () => {
  // In a real app, we would fetch the care plan from an API based on the user's profile
  const carePlan = mockCarePlan;

  const markComplete = (id: number) => {
    // In a real app, update task completion status in the database
    toast({
      title: "Task marked as complete",
      description: "Your care plan has been updated."
    });
  };

  const setReminder = (id: number) => {
    // In a real app, this would integrate with Zapier/Twilio for reminders
    toast({
      title: "Reminder set",
      description: "You'll receive a notification when it's time for this task."
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MainNavigation />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            {/* Main Content */}
            <div className="w-full lg:w-2/3 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-green-800">Your Lawn Care Plan</h1>
                  <p className="text-gray-600">Customized for {carePlan.userProfile.grassType} grass in {carePlan.userProfile.zipCode}</p>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Calendar className="mr-2 h-4 w-4" /> Sync to Calendar
                </Button>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Upcoming Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {carePlan.tasks.map((task) => (
                      <div key={task.id} className="flex items-start p-3 rounded-md border border-gray-100 bg-white shadow-sm">
                        <div className="mr-4">
                          <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                            {getTaskIcon(task.type)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">{task.title}</h3>
                            <span className="text-sm text-gray-500">{formatDate(task.date)}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          {!task.completed && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-green-200 text-green-700 hover:bg-green-50"
                                onClick={() => markComplete(task.id)}
                              >
                                <CheckCircle className="mr-1 h-4 w-4" /> Mark Complete
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                onClick={() => setReminder(task.id)}
                              >
                                <Clock className="mr-1 h-4 w-4" /> Set Reminder
                              </Button>
                            </div>
                          )}
                          {task.completed && (
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="mr-1 h-3 w-3" /> Completed
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Seasonal Advice</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {carePlan.tips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-800 text-xs mr-2 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar */}
            <div className="w-full lg:w-1/3 space-y-6">
              <Card>
                <CardHeader className="bg-green-50 pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sun className="text-yellow-500" size={20} />
                    Weather Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold">{carePlan.currentWeather.temperature}°F</div>
                    <div className="text-sm">{carePlan.currentWeather.condition}</div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    {carePlan.currentWeather.chanceOfRain > 0 ? (
                      <div className="p-3 bg-blue-50 rounded-md flex items-center">
                        <Wind className="text-blue-500 mr-2" size={18} />
                        <div>
                          <p className="font-medium text-blue-700">Rain Expected</p>
                          <p className="text-blue-600">Skip watering today - precipitation expected</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-yellow-50 rounded-md flex items-center">
                        <Sun className="text-yellow-500 mr-2" size={18} />
                        <div>
                          <p className="font-medium text-yellow-700">Hot and Dry</p>
                          <p className="text-yellow-600">Water in early morning to prevent evaporation</p>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-gray-600">
                      Weather data is used to adjust your care plan recommendations and help conserve water.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Your Lawn Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">ZIP Code</span>
                      <span className="font-medium">{carePlan.userProfile.zipCode}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Grass Type</span>
                      <span className="font-medium">{carePlan.userProfile.grassType}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Lawn Size</span>
                      <span className="font-medium">{carePlan.userProfile.lawnSize} sq ft</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-gray-500">Primary Goal</span>
                      <span className="font-medium">{carePlan.userProfile.goal}</span>
                    </div>
                    
                    <Button variant="outline" className="w-full mt-2">
                      Update Lawn Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white py-6 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} LawnBuddy. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default CarePlan;
