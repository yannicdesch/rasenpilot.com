
import React, { useState } from 'react';
import MainNavigation from '@/components/MainNavigation';
import WeatherWidget from '@/components/WeatherWidget';
import TaskTimeline from '@/components/TaskTimeline';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Check, Clock, Plus } from 'lucide-react';

// Mock lawn details
const mockLawnDetails = {
  grassType: "Bermuda",
  area: 4500,
  soilType: "Clay Loam",
  sunExposure: "Full Sun",
  irrigationType: "In-ground Sprinkler",
  lastFertilized: "2025-04-10",
  lastMowed: "2025-04-20",
};

// Mock stats
const mockStats = [
  {
    title: "Tasks Completed",
    value: 12,
    trend: "up",
    trendValue: "3",
  },
  {
    title: "Upcoming Tasks",
    value: 5,
    trend: "neutral",
    trendValue: "0",
  },
  {
    title: "Watering Days",
    value: 3,
    trend: "down",
    trendValue: "1",
  },
  {
    title: "Lawn Health",
    value: "Good",
    trend: "up",
    trendValue: "5%",
  },
];

// Monthly task breakdown
const mockMonthlyTasks = [
  { month: "Jan", tasks: 2 },
  { month: "Feb", tasks: 3 },
  { month: "Mar", tasks: 5 },
  { month: "Apr", tasks: 8 },
  { month: "May", tasks: 10 },
  { month: "Jun", tasks: 7 },
  { month: "Jul", tasks: 6 },
  { month: "Aug", tasks: 4 },
  { month: "Sep", tasks: 6 },
  { month: "Oct", tasks: 8 },
  { month: "Nov", tasks: 4 },
  { month: "Dec", tasks: 2 },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MainNavigation />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            {/* Main Content */}
            <div className="w-full lg:w-2/3 space-y-6">
              <h1 className="text-3xl font-bold text-lawn-green-dark">Lawn Care Dashboard</h1>
              
              <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="w-full bg-white border">
                  <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                  <TabsTrigger value="calendar" className="flex-1">Calendar</TabsTrigger>
                  <TabsTrigger value="lawn-details" className="flex-1">Lawn Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {mockStats.map((stat, index) => (
                      <Card key={index} className="lawn-card">
                        <CardContent className="p-4">
                          <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                          <div className="flex justify-between items-end mt-2">
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className={`flex items-center text-xs ${
                              stat.trend === "up" ? "text-green-600" :
                              stat.trend === "down" ? "text-red-600" :
                              "text-gray-500"
                            }`}>
                              {stat.trend === "up" && "↑"}
                              {stat.trend === "down" && "↓"}
                              {stat.trendValue}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="lawn-card">
                      <CardHeader>
                        <CardTitle className="text-lg">Monthly Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-end justify-between">
                          {mockMonthlyTasks.map((item) => (
                            <div key={item.month} className="flex flex-col items-center">
                              <div 
                                className="w-6 bg-lawn-green rounded-t-md" 
                                style={{ height: `${item.tasks * 6}px` }} 
                              />
                              <div className="mt-2 text-xs">{item.month}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="lawn-card">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Clock size={18} />
                          <span>Recent Activity</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                              <Check size={16} className="text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium">Mowed Lawn</div>
                              <div className="text-xs text-gray-500">April 20, 2025</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Check size={16} className="text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">Applied Fertilizer</div>
                              <div className="text-xs text-gray-500">April 10, 2025</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                              <Check size={16} className="text-purple-600" />
                            </div>
                            <div>
                              <div className="font-medium">Treated for Weeds</div>
                              <div className="text-xs text-gray-500">April 5, 2025</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="calendar" className="mt-4">
                  <Card className="lawn-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar size={20} />
                        <span>Lawn Care Calendar</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">Calendar View</h3>
                        <p className="text-muted-foreground">
                          A detailed calendar view would be implemented here showing tasks by date.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="lawn-details" className="mt-4">
                  <Card className="lawn-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Lawn Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {Object.entries(mockLawnDetails).map(([key, value]) => (
                          <div key={key} className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                      <Button className="mt-6 bg-lawn-green hover:bg-lawn-green-dark">
                        <Plus size={16} className="mr-2" />
                        Edit Lawn Profile
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Sidebar */}
            <div className="w-full lg:w-1/3 space-y-6">
              <WeatherWidget />
              <TaskTimeline />
              
              <Card className="lawn-card">
                <CardHeader>
                  <CardTitle className="text-lg">Lawn Tips</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <p className="text-sm">
                      <span className="font-medium">Watering:</span> Best time is early morning, between 4-10am.
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Mowing:</span> Keep Bermuda grass between 1-2 inches for optimal health.
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Fertilizing:</span> Next application recommended in 3 weeks.
                    </p>
                    
                    <Button variant="link" className="px-0 text-lawn-green">
                      View more personalized tips
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
          &copy; {new Date().getFullYear()} LawnRadar. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
