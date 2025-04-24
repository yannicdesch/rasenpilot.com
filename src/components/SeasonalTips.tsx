
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SeasonalTip = {
  id: number;
  title: string;
  description: string;
  season: string;
  tags: string[];
};

// Mock seasonal tips (would come from API/database in production)
const mockSeasonalTips: SeasonalTip[] = [
  {
    id: 1,
    title: "Spring Pre-Emergent Application",
    description: "Apply pre-emergent herbicide when soil temperatures reach 55°F consistently to prevent summer weeds.",
    season: "Spring",
    tags: ["weed control", "spring prep"]
  },
  {
    id: 2,
    title: "Summer Watering Schedule",
    description: "Water deeply 2-3 times per week instead of daily light watering to encourage deep root growth.",
    season: "Summer",
    tags: ["watering", "drought tips"]
  },
  {
    id: 3,
    title: "Fall Fertilization",
    description: "Apply a winterizer fertilizer high in potassium to strengthen grass roots before winter.",
    season: "Fall",
    tags: ["fertilizer", "winter prep"]
  }
];

const SeasonalTips = () => {
  // In a real app, we would filter tips based on current season and location
  const seasonalTips = mockSeasonalTips;
  
  // Get current season (simplified logic)
  const currentMonth = new Date().getMonth();
  const seasons = ["Winter", "Winter", "Spring", "Spring", "Spring", "Summer", "Summer", "Summer", "Fall", "Fall", "Fall", "Winter"];
  const currentSeason = seasons[currentMonth];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Seasonal Tips</h2>
        <span className="lawn-tag">{currentSeason}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {seasonalTips.map((tip) => (
          <Card key={tip.id} className="lawn-card">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold">{tip.title}</CardTitle>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  tip.season === "Spring" ? "bg-green-100 text-green-800" :
                  tip.season === "Summer" ? "bg-yellow-100 text-yellow-800" :
                  tip.season === "Fall" ? "bg-orange-100 text-orange-800" :
                  "bg-blue-100 text-blue-800"
                }`}>
                  {tip.season}
                </span>
              </div>
              <CardDescription>For your lawn in {mockWeatherData.location}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">{tip.description}</p>
              <div className="flex flex-wrap gap-2">
                {tip.tags.map((tag) => (
                  <span key={tag} className="lawn-tag">{tag}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Mock weather data (same as in WeatherWidget)
const mockWeatherData = {
  location: "Austin, TX",
  temperature: 82,
  condition: "Partly Cloudy",
  humidity: 65,
  windSpeed: 8
};

export default SeasonalTips;
