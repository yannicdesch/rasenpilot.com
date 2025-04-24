
import React, { useState } from 'react';
import MainNavigation from '@/components/MainNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock seasonal tasks
const mockSeasonalTasks = {
  spring: [
    { id: 1, task: "Apply pre-emergent herbicide", timing: "Early Spring", description: "Prevent summer weeds before they germinate by applying pre-emergent when soil temperatures reach 55°F." },
    { id: 2, task: "Apply first fertilizer treatment", timing: "Mid-Spring", description: "Use a balanced fertilizer with a higher nitrogen content to promote vigorous growth." },
    { id: 3, task: "Mow regularly", timing: "Throughout Spring", description: "Begin mowing when grass starts actively growing. Set mower to recommended height for your grass type." },
    { id: 4, task: "Treat for weeds", timing: "Mid to Late Spring", description: "Apply post-emergent herbicide for visible weeds that escaped pre-emergent treatment." },
    { id: 5, task: "Aerate lawn", timing: "Late Spring", description: "Aerate to reduce soil compaction and allow water, air, and nutrients to reach grass roots." }
  ],
  summer: [
    { id: 1, task: "Adjust watering schedule", timing: "Early Summer", description: "Water deeply 2-3 times per week instead of daily light watering. Water early morning for best results." },
    { id: 2, task: "Raise mower height", timing: "Throughout Summer", description: "Cut grass higher in summer to shade roots and help retain moisture." },
    { id: 3, task: "Monitor for pests", timing: "Mid-Summer", description: "Watch for signs of insect damage and treat promptly if detected." },
    { id: 4, task: "Apply summer fertilizer", timing: "Mid-Summer", description: "Use a slow-release fertilizer formulated for summer conditions." }
  ],
  fall: [
    { id: 1, task: "Apply fall fertilizer", timing: "Early Fall", description: "Use a formula with higher potassium content to strengthen roots for winter." },
    { id: 2, task: "Overseed bare spots", timing: "Early to Mid-Fall", description: "Best time for overseeding cool-season grasses when temperatures moderate." },
    { id: 3, task: "Continue mowing", timing: "Throughout Fall", description: "Continue mowing until grass stops actively growing." },
    { id: 4, task: "Clean up leaves", timing: "Mid to Late Fall", description: "Don't let fallen leaves smother your lawn. Mulch with mower or rake regularly." },
    { id: 5, task: "Final fertilization", timing: "Late Fall", description: "Apply winterizer fertilizer to prepare grass for dormancy and spring green-up." }
  ],
  winter: [
    { id: 1, task: "Reduce watering", timing: "Throughout Winter", description: "Water only when needed, typically much less than in growing season." },
    { id: 2, task: "Clean and store equipment", timing: "Early Winter", description: "Clean, sharpen, and properly store lawn equipment for next season." },
    { id: 3, task: "Plan for next season", timing: "Late Winter", description: "Review last year's lawn care routine and plan improvements for spring." },
    { id: 4, task: "Monitor for snow mold", timing: "Throughout Winter", description: "In snowy regions, be alert for signs of snow mold and address when weather permits." }
  ]
};

// Grass type recommendations by region
const grassTypesByRegion = {
  "Northeast": ["Kentucky Bluegrass", "Perennial Ryegrass", "Fine Fescue"],
  "Midwest": ["Kentucky Bluegrass", "Perennial Ryegrass", "Tall Fescue"],
  "Southeast": ["Bermuda", "Zoysia", "St. Augustine", "Centipede"],
  "Southwest": ["Bermuda", "Buffalograss", "Zoysia"],
  "West": ["Tall Fescue", "Kentucky Bluegrass", "Perennial Ryegrass"],
  "Northwest": ["Perennial Ryegrass", "Fine Fescue", "Kentucky Bluegrass"]
};

const SeasonGuide = () => {
  const [activeRegion, setActiveRegion] = useState("Southeast");
  const [activeSeason, setActiveSeason] = useState("spring");
  
  // Get current season (simplified logic)
  const currentMonth = new Date().getMonth();
  const seasons = ["winter", "winter", "spring", "spring", "spring", "summer", "summer", "summer", "fall", "fall", "fall", "winter"];
  const currentSeason = seasons[currentMonth];
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MainNavigation />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-lawn-green-dark mb-2">Seasonal Lawn Care Guide</h1>
          <p className="text-lg text-gray-600 mb-8">
            Your year-round guide for a healthy, vibrant lawn in every season.
          </p>
          
          {/* Region Selection */}
          <Card className="mb-8">
            <CardHeader className="bg-lawn-earth-light/30 pb-4">
              <CardTitle className="text-lg">Select Your Region</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {Object.keys(grassTypesByRegion).map((region) => (
                  <Button
                    key={region}
                    variant={activeRegion === region ? "default" : "outline"}
                    className={activeRegion === region ? "bg-lawn-green hover:bg-lawn-green-dark" : ""}
                    onClick={() => setActiveRegion(region)}
                  >
                    {region}
                  </Button>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-lawn-green-light/20 rounded-md">
                <h3 className="font-medium mb-2">Recommended Grass Types for {activeRegion}:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {grassTypesByRegion[activeRegion as keyof typeof grassTypesByRegion].map((grass) => (
                    <li key={grass}>{grass}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          
          {/* Seasonal Guides */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-4">Seasonal Care Calendar</h2>
            <Tabs defaultValue={currentSeason} className="w-full" onValueChange={setActiveSeason}>
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger 
                  value="spring" 
                  className={`${activeSeason === "spring" ? "data-[state=active]:bg-green-500 data-[state=active]:text-white" : ""}`}
                >
                  Spring
                </TabsTrigger>
                <TabsTrigger 
                  value="summer"
                  className={`${activeSeason === "summer" ? "data-[state=active]:bg-yellow-500 data-[state=active]:text-white" : ""}`}
                >
                  Summer
                </TabsTrigger>
                <TabsTrigger 
                  value="fall"
                  className={`${activeSeason === "fall" ? "data-[state=active]:bg-orange-500 data-[state=active]:text-white" : ""}`}
                >
                  Fall
                </TabsTrigger>
                <TabsTrigger 
                  value="winter"
                  className={`${activeSeason === "winter" ? "data-[state=active]:bg-blue-500 data-[state=active]:text-white" : ""}`}
                >
                  Winter
                </TabsTrigger>
              </TabsList>
              
              {['spring', 'summer', 'fall', 'winter'].map((season) => (
                <TabsContent key={season} value={season} className="mt-0">
                  <div className={`p-6 rounded-lg mb-6 ${
                    season === 'spring' ? "bg-green-50 border border-green-100" :
                    season === 'summer' ? "bg-yellow-50 border border-yellow-100" :
                    season === 'fall' ? "bg-orange-50 border border-orange-100" :
                    "bg-blue-50 border border-blue-100"
                  }`}>
                    <h3 className="text-xl font-bold mb-2 capitalize">{season} Care Guide</h3>
                    <p className="mb-4">
                      {season === 'spring' && "Spring is a critical time for establishing a healthy lawn foundation. Focus on preventing weeds, promoting growth, and preparing for the growing season."}
                      {season === 'summer' && "Summer brings heat stress and potential drought. Your lawn needs extra attention to watering, pest monitoring, and proper mowing height."}
                      {season === 'fall' && "Fall is ideal for lawn recovery and winter preparation. The cooling temperatures provide perfect conditions for strengthening roots and replenishing nutrients."}
                      {season === 'winter' && "Winter is a time for minimal maintenance and planning. Proper care now will ensure a quicker green-up in spring."}
                    </p>
                    
                    <div className="space-y-4 mt-6">
                      {mockSeasonalTasks[season as keyof typeof mockSeasonalTasks].map((item) => (
                        <Card key={item.id} className="border-l-4 border-l-lawn-green">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-lg">{item.task}</h4>
                                <p className="text-sm text-gray-500 mb-2">{item.timing}</p>
                                <p className="text-sm">{item.description}</p>
                              </div>
                              <Button size="sm" variant="outline" className="border-lawn-green text-lawn-green hover:bg-lawn-green/10">
                                Add to Tasks
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  <Card className="lawn-card">
                    <CardHeader>
                      <CardTitle className="text-lg capitalize">{season} Lawn Tips for {activeRegion}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h4 className="font-medium">Watering Needs:</h4>
                          <p className="text-sm">
                            {season === 'spring' && "1-1.5 inches per week, adjusting based on rainfall. Water deeply but infrequently to encourage deep root growth."}
                            {season === 'summer' && "1.5-2 inches per week, preferably in the early morning. Increase frequency during periods of extreme heat."}
                            {season === 'fall' && "1 inch per week, reducing as temperatures cool. Continue watering until the ground freezes."}
                            {season === 'winter' && "Minimal watering needed. Water only during extended dry periods when temperatures are above freezing."}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="font-medium">Mowing Height:</h4>
                          <p className="text-sm">
                            {season === 'spring' && "Start at a slightly lower setting for the first mow, then raise to recommended height for your grass type."}
                            {season === 'summer' && "Raise mower blade to the higher end of your grass's recommended range to protect roots from heat stress."}
                            {season === 'fall' && "Lower mower blade slightly as the season progresses to prevent matting during winter."}
                            {season === 'winter' && "Final mow should be shorter to prevent snow mold. Minimal or no mowing needed during dormant period."}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="font-medium">Common Challenges:</h4>
                          <p className="text-sm">
                            {season === 'spring' && "Weed germination, soil compaction from winter, thin spots from winter damage."}
                            {season === 'summer' && "Heat stress, drought, insect pests (grubs, chinch bugs), fungal diseases in humid conditions."}
                            {season === 'fall' && "Fallen leaves smothering grass, weed seeds depositing for next year, preparing for winter stress."}
                            {season === 'winter' && "Cold damage, snow mold, salt damage near roadways, crown hydration in fluctuating temperatures."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
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

export default SeasonGuide;
