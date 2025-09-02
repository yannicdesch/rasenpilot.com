
import { LawnProfile } from '../context/LawnContext';

export interface CarePlanTask {
  id: number;
  date: string;
  title: string;
  description: string;
  completed: boolean;
  type: 'mowing' | 'fertilizing' | 'watering' | 'weeding' | 'other';
}

export interface WeatherData {
  location: string;
  current: {
    temp: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  };
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    chanceOfRain: number;
  }>;
}

// Generate care plan based on profile
export const generateCarePlan = (profile: LawnProfile): Promise<CarePlanTask[]> => {
  return new Promise((resolve, reject) => {
    // First check if we have saved tasks
    const savedTasks = localStorage.getItem('lawnTasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks) as CarePlanTask[];
        if (parsedTasks && parsedTasks.length > 0) {
          console.log("Using saved tasks from localStorage:", parsedTasks.length);
          return resolve(parsedTasks);
        }
      } catch (e) {
        console.error("Error parsing saved tasks:", e);
        // Continue with generating new tasks
      }
    }
    
    if (!profile) {
      console.error("No profile provided to generateCarePlan");
      return reject(new Error("No profile provided"));
    }
    
    console.log("Generating new care plan tasks for profile:", profile);
    
    // Generate new tasks if no saved tasks or parsing failed
    setTimeout(() => {
      try {
        // Generate tasks based on the lawn profile
        const today = new Date();
        const taskTypes: Array<'mowing' | 'fertilizing' | 'watering' | 'weeding'> = ['mowing', 'fertilizing', 'watering', 'weeding'];
        
        const tasks: CarePlanTask[] = [];
        
        // Generate 14 day plan (increased from 5 tasks)
        for (let i = 0; i < 14; i++) {
          const taskDate = new Date(today);
          taskDate.setDate(today.getDate() + i);
          
          tasks.push({
            id: i + 1,
            date: taskDate.toISOString().split('T')[0],
            title: getTaskTitle(taskTypes[i % taskTypes.length], profile.grassType || 'Standard'),
            description: getTaskDescription(taskTypes[i % taskTypes.length], profile),
            completed: false, // All tasks start as not completed
            type: taskTypes[i % taskTypes.length],
          });
        }
        
        // Save generated tasks to localStorage
        localStorage.setItem('lawnTasks', JSON.stringify(tasks));
        
        // Also update timeline tasks
        updateTimelineTasks(tasks);
        
        console.log("Generated and saved new tasks:", tasks.length);
        
        resolve(tasks);
      } catch (error) {
        console.error("Error generating care plan:", error);
        reject(error);
      }
    }, 1000);
  });
};

// Helper function to update timeline tasks based on care plan
const updateTimelineTasks = (carePlanTasks: CarePlanTask[]) => {
  try {
    const timelineTasks = carePlanTasks.slice(0, 5).map((task, index) => ({
      id: index + 1,
      title: task.title,
      dueDate: task.date,
      category: task.type.charAt(0).toUpperCase() + task.type.slice(1),
      completed: task.completed
    }));
    
    // Save to localStorage
    localStorage.setItem('lawnTimelineTasks', JSON.stringify(timelineTasks));
    console.log("Updated timeline tasks:", timelineTasks.length);
  } catch (error) {
    console.error("Error updating timeline tasks:", error);
  }
};

// Export task title and description functions so they can be used in other components
export const getTaskTitle = (type: string, grassType: string): string => {
  switch (type) {
    case 'mowing': return `Mähen Sie Ihren ${grassType}-Rasen`;
    case 'fertilizing': return 'Düngen Sie Ihren Rasen';
    case 'watering': return 'Bewässern Sie den Rasen (früh morgens)';
    case 'weeding': return 'Unkraut entfernen';
    default: return 'Rasen pflegen';
  }
};

export const getTaskDescription = (type: string, profile: LawnProfile): string => {
  const grassType = profile?.grassType || 'Standard';
  const lawnGoal = profile?.lawnGoal || 'health';
  
  switch (type) {
    case 'mowing':
      return grassType === 'Bermuda' || grassType === 'bermuda'
        ? 'Schneiden Sie auf 2,5 cm Höhe für optimales Wachstum'
        : 'Schneiden Sie auf 3-4 cm Höhe für gesundes Wachstum';
    case 'fertilizing':
      return lawnGoal === 'greener' || lawnGoal === 'Grünerer Rasen'
        ? 'Verwenden Sie einen stickstoffreichen Dünger für satteres Grün'
        : 'Verwenden Sie einen ausgewogenen Dünger für ganzheitliches Wachstum';
    case 'watering':
      return 'Gründlich bewässern (ca. 2,5 cm) für tiefes Wurzelwachstum';
    case 'weeding':
      return 'Entfernen Sie Unkraut gezielt, um Ihren Rasen gesund zu halten';
    default:
      return 'Führen Sie regelmäßige Pflege durch';
  }
};

// Fetch weather data based on ZIP code
export const fetchWeatherData = async (zipCode: string): Promise<WeatherData> => {
  console.log("fetchWeatherData called with zipCode:", zipCode);
  
  if (!zipCode || zipCode.trim() === "") {
    console.error("Invalid ZIP code provided:", zipCode);
    
    // Check if we have a zipCode in localStorage as fallback
    const storedProfile = localStorage.getItem('lawnProfile');
    if (storedProfile) {
      try {
        const parsedProfile = JSON.parse(storedProfile);
        if (parsedProfile.zipCode) {
          console.log("Using zipCode from localStorage:", parsedProfile.zipCode);
          zipCode = parsedProfile.zipCode;
        }
      } catch (e) {
        console.error("Error parsing stored profile:", e);
      }
    }
    
    if (!zipCode || zipCode.trim() === "") {
      throw new Error("Invalid ZIP code and no fallback available");
    }
  }
  
  try {
    console.log("Fetching weather data from Supabase for ZIP code:", zipCode);
    
    // Import supabase client
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Call the get-weather-data edge function
    const { data, error } = await supabase.functions.invoke('get-weather-data', {
      body: { zipCode, countryCode: 'DE' }
    });

    if (error) {
      console.error("Error calling weather function:", error);
      throw new Error(`Weather API error: ${error.message}`);
    }

    if (!data?.success) {
      console.error("Weather API returned error:", data);
      throw new Error(`Weather API failed: ${data?.error || 'Unknown error'}`);
    }

    const weatherResult = data.data;
    console.log("Weather data received:", weatherResult);

    // Transform the API response to match our WeatherData interface
    const weatherData: WeatherData = {
      location: weatherResult.location,
      current: {
        temp: weatherResult.current.temp,
        condition: weatherResult.current.condition,
        humidity: weatherResult.current.humidity,
        windSpeed: weatherResult.current.windSpeed,
        icon: weatherResult.current.icon
      },
      forecast: weatherResult.forecast.map((day: any) => ({
        day: day.day,
        high: day.high,
        low: day.low,
        condition: day.condition,
        icon: day.icon,
        chanceOfRain: Math.round(day.chanceOfRain)
      }))
    };

    return weatherData;
    
  } catch (error) {
    console.error("Error fetching weather data:", error);
    
    // Fallback to mock data if API fails
    console.log("Falling back to mock weather data for ZIP code:", zipCode);
    
    const isGermanZipCode = /^\d{5}$/.test(zipCode);
    
    const fallbackWeatherData: WeatherData = {
      location: isGermanZipCode ? `Bereich ${zipCode}, Deutschland` : "Berlin, Deutschland",
      current: {
        temp: 18, // Temperatures in Celsius for Germany
        condition: "Teilweise bewölkt",
        humidity: 65,
        windSpeed: 12,
        icon: "cloud-sun"
      },
      forecast: [
        { day: "Heute", high: 18, low: 10, condition: "Teilweise bewölkt", icon: "cloud-sun", chanceOfRain: 10 },
        { day: "Morgen", high: 19, low: 11, condition: "Überwiegend sonnig", icon: "sun", chanceOfRain: 5 },
        { day: "Mittwoch", high: 17, low: 9, condition: "Regen", icon: "cloud-rain", chanceOfRain: 80 },
        { day: "Donnerstag", high: 15, low: 8, condition: "Leichter Regen", icon: "cloud-drizzle", chanceOfRain: 60 },
        { day: "Freitag", high: 16, low: 9, condition: "Teilweise bewölkt", icon: "cloud-sun", chanceOfRain: 20 }
      ]
    };
    
    return fallbackWeatherData;
  }
};

// Add ability to manually regenerate the care plan
export const regenerateCarePlan = async (profile: LawnProfile): Promise<CarePlanTask[]> => {
  // Clear existing tasks
  localStorage.removeItem('lawnTasks');
  
  // Generate new care plan
  return generateCarePlan(profile);
};

export const getWeatherBasedAdvice = (weatherData: WeatherData): string[] => {
  const advice: string[] = [];

  // Temperature-based advice
  if (weatherData.current.temp > 25) {
    advice.push("Bei hohen Temperaturen früh morgens oder spät abends bewässern, um Verdunstung zu minimieren.");
  }

  // Rain forecast advice
  const rainInNext48Hours = weatherData.forecast.slice(0, 2).some(day => day.chanceOfRain > 30);
  if (rainInNext48Hours) {
    advice.push("Regen in den nächsten 48 Stunden erwartet. Bewässerung überspringen und natürliche Feuchtigkeit nutzen.");
  }

  // Seasonal advice (simplified)
  const currentMonth = new Date().getMonth();
  if (currentMonth >= 2 && currentMonth <= 4) { // Spring
    advice.push("Frühling ist ideal für Düngung und Nachsaat kahler Stellen.");
  } else if (currentMonth >= 5 && currentMonth <= 7) { // Summer
    advice.push("Im Sommer höher schneiden (3-4 cm), um Wurzeln vor der Hitze zu schützen.");
  } else if (currentMonth >= 8 && currentMonth <= 10) { // Fall
    advice.push("Herbst ist perfekt für Bodenbelüftung und Winterdünger.");
  } else { // Winter
    advice.push("Im Winter weniger mähen und Rasen vor Frost schützen.");
  }

  return advice;
};

// Add ability to send reminders based on user preferences and tasks
export const sendReminder = async (
  userId: string, 
  task: CarePlanTask, 
  reminderType: 'email' | 'push' | 'both' = 'email'
): Promise<boolean> => {
  // This would connect to a backend service in a real app
  console.log(`Sending ${reminderType} reminder to user ${userId} for task: ${task.title}`);
  
  // In a real app, this would make an API call to your backend service
  // which would schedule and send the reminder
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate successful reminder scheduling
      resolve(true);
    }, 500);
  });
};

// Function to schedule reminders for all upcoming tasks
export const scheduleReminders = async (
  userId: string, 
  tasks: CarePlanTask[], 
  reminderPreferences: any
): Promise<number> => {
  if (!userId || !tasks || !tasks.length) {
    return 0;
  }
  
  let scheduledCount = 0;
  
  // Filter for incomplete tasks in the future
  const upcomingTasks = tasks.filter(task => {
    const taskDate = new Date(task.date);
    const today = new Date();
    return !task.completed && taskDate > today;
  });
  
  // Schedule reminders for upcoming tasks
  for (const task of upcomingTasks) {
    try {
      await sendReminder(userId, task, reminderPreferences?.method || 'email');
      scheduledCount++;
    } catch (error) {
      console.error(`Failed to schedule reminder for task ${task.id}:`, error);
    }
  }
  
  return scheduledCount;
};
