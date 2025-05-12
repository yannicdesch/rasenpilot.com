
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

// This would be replaced by an actual API call in production
export const generateCarePlan = (profile: LawnProfile): Promise<CarePlanTask[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Here we generate tasks based on the lawn profile
      // This is a simplified mock version
      const today = new Date();
      const taskTypes: Array<'mowing' | 'fertilizing' | 'watering' | 'weeding'> = ['mowing', 'fertilizing', 'watering', 'weeding'];
      
      const tasks: CarePlanTask[] = [];
      
      for (let i = 0; i < 5; i++) {
        const taskDate = new Date(today);
        taskDate.setDate(today.getDate() + i * 2);
        
        tasks.push({
          id: i + 1,
          date: taskDate.toISOString().split('T')[0],
          title: getTaskTitle(taskTypes[i % taskTypes.length], profile.grassType),
          description: getTaskDescription(taskTypes[i % taskTypes.length], profile),
          completed: i === 0, // First task is completed
          type: taskTypes[i % taskTypes.length],
        });
      }
      
      resolve(tasks);
    }, 1000);
  });
};

const getTaskTitle = (type: string, grassType: string): string => {
  switch (type) {
    case 'mowing': return `Mähen Sie Ihren ${grassType}-Rasen`;
    case 'fertilizing': return 'Düngen Sie Ihren Rasen';
    case 'watering': return 'Bewässern Sie den Rasen (früh morgens)';
    case 'weeding': return 'Unkraut entfernen';
    default: return 'Rasen pflegen';
  }
};

const getTaskDescription = (type: string, profile: LawnProfile): string => {
  switch (type) {
    case 'mowing':
      return profile.grassType === 'Bermuda' || profile.grassType === 'bermuda'
        ? 'Schneiden Sie auf 2,5 cm Höhe für optimales Wachstum'
        : 'Schneiden Sie auf 3-4 cm Höhe für gesundes Wachstum';
    case 'fertilizing':
      return profile.lawnGoal === 'greener' || profile.lawnGoal === 'Grünerer Rasen'
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

// This would be replaced by an actual weather API call in production
export const fetchWeatherData = async (zipCode: string): Promise<WeatherData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock weather data
      resolve({
        location: zipCode ? `Bereich ${zipCode}` : "Berlin",
        current: {
          temp: 22,
          condition: "Sonnig",
          humidity: 65,
          windSpeed: 8,
          icon: "sun"
        },
        forecast: [
          { day: "Heute", high: 22, low: 15, condition: "Sonnig", icon: "sun", chanceOfRain: 0 },
          { day: "Morgen", high: 24, low: 16, condition: "Teilweise bewölkt", icon: "cloud-sun", chanceOfRain: 10 },
          { day: "Mittwoch", high: 20, low: 14, condition: "Regen", icon: "cloud-rain", chanceOfRain: 70 },
          { day: "Donnerstag", high: 19, low: 13, condition: "Vereinzelte Schauer", icon: "cloud-drizzle", chanceOfRain: 50 },
          { day: "Freitag", high: 21, low: 14, condition: "Teilweise bewölkt", icon: "cloud-sun", chanceOfRain: 20 }
        ]
      });
    }, 800);
  });
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

  // Season-based advice (simplified)
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
