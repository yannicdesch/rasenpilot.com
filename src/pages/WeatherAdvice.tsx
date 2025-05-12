import React, { useState } from 'react';
import MainNavigation from '@/components/MainNavigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Cloud, CloudRain, Droplet, Sun, Thermometer, Wind } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface WeatherFormData {
  zipCode: string;
}

// Mock weather data (would come from OpenWeatherMap API in production)
const mockWeatherData = {
  location: "Austin, TX",
  current: {
    temp: 82,
    condition: "Sunny",
    humidity: 65,
    windSpeed: 8,
    icon: "sun"
  },
  forecast: [
    { day: "Today", high: 82, low: 68, condition: "Sunny", icon: "sun", chanceOfRain: 0 },
    { day: "Tomorrow", high: 84, low: 69, condition: "Partly Cloudy", icon: "cloud-sun", chanceOfRain: 10 },
    { day: "Wednesday", high: 79, low: 67, condition: "Rain", icon: "cloud-rain", chanceOfRain: 70 },
    { day: "Thursday", high: 75, low: 64, condition: "Scattered Showers", icon: "cloud-drizzle", chanceOfRain: 50 },
    { day: "Friday", high: 77, low: 63, condition: "Partly Cloudy", icon: "cloud-sun", chanceOfRain: 20 }
  ]
};

const getAdvice = (data: typeof mockWeatherData) => {
  const advice = [];
  
  // Watering advice
  const rainInNext48Hours = data.forecast.slice(0, 2).some(day => day.chanceOfRain > 30);
  if (rainInNext48Hours) {
    advice.push({
      title: "Skip Watering",
      description: "Rain is forecasted in the next 48 hours, conserve water by skipping your regular watering schedule.",
      icon: <CloudRain size={24} className="text-blue-500" />
    });
  } else if (data.current.temp > 80) {
    advice.push({
      title: "Water Early Morning",
      description: "High temperatures expected. Water before 10am to minimize evaporation and prevent fungal growth.",
      icon: <Droplet size={24} className="text-blue-500" />
    });
  }
  
  // Mowing advice
  const highWinds = data.current.windSpeed > 15;
  if (highWinds) {
    advice.push({
      title: "Delay Mowing",
      description: "Wind speeds are high today. Consider delaying mowing to prevent uneven cuts.",
      icon: <Wind size={24} className="text-gray-500" />
    });
  } else if (data.current.condition.toLowerCase().includes("rain")) {
    advice.push({
      title: "Avoid Mowing",
      description: "Mowing wet grass can lead to uneven cuts and clumping. Wait until it's dry.",
      icon: <Cloud size={24} className="text-gray-500" />
    });
  } else {
    advice.push({
      title: "Good Day for Mowing",
      description: "Weather conditions are ideal for mowing your lawn today.",
      icon: <Sun size={24} className="text-yellow-500" />
    });
  }
  
  // Fertilizing advice
  const rainyDays = data.forecast.filter(day => day.chanceOfRain > 40).length;
  if (rainyDays >= 2) {
    advice.push({
      title: "Hold on Fertilizing",
      description: "Multiple rainy days ahead could wash away fertilizer. Wait for drier conditions.",
      icon: <CloudRain size={24} className="text-blue-500" />
    });
  } else if (data.current.temp > 85) {
    advice.push({
      title: "Avoid Fertilizing",
      description: "Temperatures are too high for fertilizing. Wait for cooler conditions to prevent burning your lawn.",
      icon: <Thermometer size={24} className="text-red-500" />
    });
  }
  
  return advice;
};

const WeatherAdvice = () => {
  const [weatherData, setWeatherData] = useState(mockWeatherData);
  const [loading, setLoading] = useState(false);
  
  const form = useForm<WeatherFormData>({
    defaultValues: {
      zipCode: ""
    }
  });
  
  const onSubmit = (data: WeatherFormData) => {
    setLoading(true);
    
    // In a real app, we would fetch weather data from OpenWeatherMap API
    // For the demo, we'll just simulate a loading state
    setTimeout(() => {
      setLoading(false);
      // Keep using the mock data for now
    }, 1000);
  };
  
  const advice = getAdvice(weatherData);
  
  // Helper function to get weather icon
  const getWeatherIcon = (icon: string) => {
    switch(icon) {
      case "sun": return <Sun size={24} className="text-yellow-500" />;
      case "cloud-sun": return <Cloud size={24} className="text-gray-400" />;
      case "cloud-rain": return <CloudRain size={24} className="text-blue-500" />;
      case "cloud-drizzle": return <CloudRain size={24} className="text-blue-400" />;
      default: return <Cloud size={24} className="text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MainNavigation />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Weather-Smart Lawn Advice</h1>
          <p className="text-gray-600 mb-6">Get personalized lawn care recommendations based on your local weather forecast</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weather Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xl font-bold">Current Weather</CardTitle>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full max-w-sm items-center space-x-2">
                    <Input
                      placeholder="Enter ZIP Code"
                      {...form.register("zipCode")}
                      className="max-w-[180px]"
                    />
                    <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
                      {loading ? "Loading..." : "Update"}
                    </Button>
                  </form>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center mb-4 md:mb-0">
                      {weatherData.current.condition === "Sunny" ? (
                        <Sun size={64} className="text-yellow-500 mr-4" />
                      ) : weatherData.current.condition.includes("Rain") ? (
                        <CloudRain size={64} className="text-blue-500 mr-4" />
                      ) : (
                        <Cloud size={64} className="text-gray-400 mr-4" />
                      )}
                      <div>
                        <div className="text-4xl font-bold">{weatherData.current.temp}°F</div>
                        <div className="text-gray-500">{weatherData.current.condition}</div>
                        <div className="text-sm text-gray-500">{weatherData.location}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                      <div className="flex items-center">
                        <Wind size={20} className="text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-500">Wind</div>
                          <div>{weatherData.current.windSpeed} mph</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Droplet size={20} className="text-blue-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-500">Humidity</div>
                          <div>{weatherData.current.humidity}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">5-Day Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {weatherData.forecast.map((day, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-gray-100 text-center">
                        <p className="font-medium">{day.day}</p>
                        <div className="my-2 flex justify-center">
                          {getWeatherIcon(day.icon)}
                        </div>
                        <p className="text-sm">{day.condition}</p>
                        <div className="flex justify-between text-sm mt-2">
                          <span className="text-red-500">{day.high}°</span>
                          <span className="text-blue-500">{day.low}°</span>
                        </div>
                        {day.chanceOfRain > 0 && (
                          <div className="mt-1 text-xs flex items-center justify-center text-blue-500">
                            <Droplet size={12} className="mr-1" />
                            {day.chanceOfRain}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Weather-Based Advice */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="bg-green-50 pb-2">
                  <CardTitle className="text-lg">Today's Lawn Care Advice</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {advice.map((item, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-md border border-gray-100">
                        <div className="flex items-center">
                          <div className="mr-3">{item.icon}</div>
                          <div>
                            <h3 className="font-medium text-gray-900">{item.title}</h3>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Seasonal Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm">
                      <span className="font-medium">Spring Growth:</span> This is a critical time for healthy root development. Focus on proper watering techniques.
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Mowing:</span> Keep grass at 2.5-3 inches during the current growing season for optimal health.
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Pests:</span> Watch for signs of common spring pests like grubs and chinch bugs during the next few weeks.
                    </p>
                    <Button variant="link" className="px-0 text-green-600">
                      View more seasonal advice
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Calendar className="mr-2 h-5 w-5" />
                View Your Care Plan
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white py-6 border-t border-gray-200 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} LawnBuddy. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default WeatherAdvice;
