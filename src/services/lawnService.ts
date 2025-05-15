
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

// Diese Funktion würde durch einen tatsächlichen API-Aufruf ersetzt
export const generateCarePlan = (profile: LawnProfile): Promise<CarePlanTask[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Hier generieren wir Aufgaben basierend auf dem Rasenprofil
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
          completed: i === 0, // Erste Aufgabe ist erledigt
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

// Diese Funktion würde durch einen tatsächlichen Wetter-API-Aufruf ersetzt
export const fetchWeatherData = async (zipCode: string): Promise<WeatherData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Für deutsche Postleitzahlen spezifische Daten
      const isGermanZipCode = /^\d{5}$/.test(zipCode);
      
      resolve({
        location: isGermanZipCode ? `Bereich ${zipCode}, Deutschland` : "Berlin, Deutschland",
        current: {
          temp: 18, // Temperaturen in Celsius für Deutschland
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
      });
    }, 800);
  });
};

export const getWeatherBasedAdvice = (weatherData: WeatherData): string[] => {
  const advice: string[] = [];

  // Temperaturbasierter Rat
  if (weatherData.current.temp > 25) {
    advice.push("Bei hohen Temperaturen früh morgens oder spät abends bewässern, um Verdunstung zu minimieren.");
  }

  // Regenvorhersage-Ratschlag
  const rainInNext48Hours = weatherData.forecast.slice(0, 2).some(day => day.chanceOfRain > 30);
  if (rainInNext48Hours) {
    advice.push("Regen in den nächsten 48 Stunden erwartet. Bewässerung überspringen und natürliche Feuchtigkeit nutzen.");
  }

  // Jahreszeitenbasierter Rat (vereinfacht)
  const currentMonth = new Date().getMonth();
  if (currentMonth >= 2 && currentMonth <= 4) { // Frühling
    advice.push("Frühling ist ideal für Düngung und Nachsaat kahler Stellen.");
  } else if (currentMonth >= 5 && currentMonth <= 7) { // Sommer
    advice.push("Im Sommer höher schneiden (3-4 cm), um Wurzeln vor der Hitze zu schützen.");
  } else if (currentMonth >= 8 && currentMonth <= 10) { // Herbst
    advice.push("Herbst ist perfekt für Bodenbelüftung und Winterdünger.");
  } else { // Winter
    advice.push("Im Winter weniger mähen und Rasen vor Frost schützen.");
  }

  return advice;
};
