
import React, { useState } from 'react';
import MainNavigation from '@/components/MainNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Saisonale Rasen-Aufgaben
const mockSeasonalTasks = {
  spring: [
    { id: 1, task: "Vorauflaufherbizid anwenden", timing: "Früh-Frühling", description: "Verhindere Sommerunkraut, bevor es keimt, durch Anwendung eines Vorauflaufherbizids bei Bodentemperaturen von 13°C." },
    { id: 2, task: "Erste Düngung durchführen", timing: "Mitte Frühling", description: "Verwende einen ausgewogenen Dünger mit höherem Stickstoffgehalt für kräftiges Wachstum." },
    { id: 3, task: "Regelmäßig mähen", timing: "Durchgehend Frühling", description: "Beginne mit dem Mähen, wenn das Gras aktiv zu wachsen beginnt. Stelle den Mäher auf die empfohlene Höhe für deinen Rasentyp ein." },
    { id: 4, task: "Unkraut behandeln", timing: "Mitte bis Ende Frühling", description: "Wende Nachauflaufherbizid für sichtbares Unkraut an, das der Vorbehandlung entkommen ist." },
    { id: 5, task: "Rasen belüften", timing: "Ende Frühling", description: "Belüfte den Rasen, um Bodenverdichtung zu reduzieren und Wasser, Luft und Nährstoffe zu den Graswurzeln gelangen zu lassen." }
  ],
  summer: [
    { id: 1, task: "Bewässerungsplan anpassen", timing: "Früh-Sommer", description: "Bewässere tief 2-3 mal pro Woche statt täglich oberflächlich. Bewässere früh morgens für beste Ergebnisse." },
    { id: 2, task: "Mähhöhe erhöhen", timing: "Durchgehend Sommer", description: "Schneide das Gras im Sommer höher, um die Wurzeln zu beschatten und Feuchtigkeit zu bewahren." },
    { id: 3, task: "Auf Schädlinge überwachen", timing: "Mitte Sommer", description: "Achte auf Anzeichen von Insektenschäden und behandle umgehend bei Entdeckung." },
    { id: 4, task: "Sommerdünger ausbringen", timing: "Mitte Sommer", description: "Verwende einen Langzeitdünger, der für Sommerbedingungen formuliert ist." }
  ],
  fall: [
    { id: 1, task: "Herbstdünger ausbringen", timing: "Früh-Herbst", description: "Verwende eine Formel mit höherem Kaliumgehalt, um die Wurzeln für den Winter zu stärken." },
    { id: 2, task: "Kahle Stellen nachsäen", timing: "Früh- bis Mitte Herbst", description: "Beste Zeit für Nachsaat von Kühlsaison-Gräsern bei moderaten Temperaturen." },
    { id: 3, task: "Weiter mähen", timing: "Durchgehend Herbst", description: "Mähe weiter, bis das Gras aufhört aktiv zu wachsen." },
    { id: 4, task: "Laub entfernen", timing: "Mitte bis Ende Herbst", description: "Lass nicht zu, dass herabgefallenes Laub deinen Rasen erstickt. Mulche mit dem Mäher oder harke regelmäßig." },
    { id: 5, task: "Abschlussdüngung", timing: "Ende Herbst", description: "Wende Winterdünger an, um das Gras auf die Ruhephase und das Frühjahrsgrün vorzubereiten." }
  ],
  winter: [
    { id: 1, task: "Bewässerung reduzieren", timing: "Durchgehend Winter", description: "Bewässere nur bei Bedarf, normalerweise viel weniger als in der Wachstumszeit." },
    { id: 2, task: "Geräte reinigen und lagern", timing: "Früh-Winter", description: "Reinige, schärfe und lagere Rasengeräte ordnungsgemäß für die nächste Saison." },
    { id: 3, task: "Nächste Saison planen", timing: "Ende Winter", description: "Überprüfe die letztjährige Rasenpflege und plane Verbesserungen für den Frühling." },
    { id: 4, task: "Auf Schneeschimmel überwachen", timing: "Durchgehend Winter", description: "In schneereichen Gebieten auf Anzeichen von Schneeschimmel achten und behandeln, wenn das Wetter es erlaubt." }
  ]
};

// Grasarten-Empfehlungen nach Region
const grassTypesByRegion = {
  "Norddeutschland": ["Deutsches Weidelgras", "Wiesenrispe", "Festuca"],
  "Mitteldeutschland": ["Wiesenrispe", "Deutsches Weidelgras", "Rotschwingel"],
  "Süddeutschland": ["Zierrasen-Mischung", "Spielrasen", "Schattenrasen"],
  "Küstenregionen": ["Salztolerante Mischung", "Deutsches Weidelgras", "Rotschwingel"],
  "Alpenregion": ["Bergwiesen-Mischung", "Wiesenrispe", "Festuca"],
  "Trockengebiete": ["Trockenrasen-Mischung", "Straußgras", "Festuca"]
};

const SeasonGuide = () => {
  const [activeRegion, setActiveRegion] = useState("Süddeutschland");
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
          <h1 className="text-3xl font-bold text-lawn-green-dark mb-2">Saisonaler Rasenpflege-Leitfaden</h1>
          <p className="text-lg text-gray-600 mb-8">
            Ihr ganzjähriger Leitfaden für einen gesunden, lebendigen Rasen in jeder Jahreszeit.
          </p>
          
          {/* Region Selection */}
          <Card className="mb-8">
            <CardHeader className="bg-lawn-earth-light/30 pb-4">
              <CardTitle className="text-lg">Wählen Sie Ihre Region</CardTitle>
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
                <h3 className="font-medium mb-2">Empfohlene Grasarten für {activeRegion}:</h3>
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
            <h2 className="text-2xl font-bold mb-4">Saisonaler Pflegekalender</h2>
            <Tabs defaultValue={currentSeason} className="w-full" onValueChange={setActiveSeason}>
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger 
                  value="spring" 
                  className={`${activeSeason === "spring" ? "data-[state=active]:bg-green-500 data-[state=active]:text-white" : ""}`}
                >
                  Frühling
                </TabsTrigger>
                <TabsTrigger 
                  value="summer"
                  className={`${activeSeason === "summer" ? "data-[state=active]:bg-yellow-500 data-[state=active]:text-white" : ""}`}
                >
                  Sommer
                </TabsTrigger>
                <TabsTrigger 
                  value="fall"
                  className={`${activeSeason === "fall" ? "data-[state=active]:bg-orange-500 data-[state=active]:text-white" : ""}`}
                >
                  Herbst
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
                    <h3 className="text-xl font-bold mb-2 capitalize">
                      {season === 'spring' && "Frühlings-Pflegeleitfaden"}
                      {season === 'summer' && "Sommer-Pflegeleitfaden"}
                      {season === 'fall' && "Herbst-Pflegeleitfaden"}
                      {season === 'winter' && "Winter-Pflegeleitfaden"}
                    </h3>
                    <p className="mb-4">
                      {season === 'spring' && "Der Frühling ist eine kritische Zeit für die Etablierung einer gesunden Rasenbasis. Konzentrieren Sie sich auf Unkrautprävention, Wachstumsförderung und Vorbereitung auf die Wachstumszeit."}
                      {season === 'summer' && "Der Sommer bringt Hitzestress und potenzielle Dürre. Ihr Rasen benötigt besondere Aufmerksamkeit bei der Bewässerung, Schädlingsüberwachung und der richtigen Mähhöhe."}
                      {season === 'fall' && "Der Herbst ist ideal für die Rasen-Regeneration und Wintervorbereitung. Die kühleren Temperaturen bieten perfekte Bedingungen zur Wurzelstärkung und Nährstoffanreicherung."}
                      {season === 'winter' && "Der Winter ist eine Zeit für minimale Wartung und Planung. Die richtige Pflege jetzt sorgt für schnelleres Grünwerden im Frühling."}
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
                                Zu Aufgaben hinzufügen
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  <Card className="lawn-card">
                    <CardHeader>
                      <CardTitle className="text-lg capitalize">
                        {season === 'spring' && "Frühlings"}
                        {season === 'summer' && "Sommer"}
                        {season === 'fall' && "Herbst"}
                        {season === 'winter' && "Winter"}-Rasentipps für {activeRegion}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h4 className="font-medium">Bewässerungsbedarf:</h4>
                          <p className="text-sm">
                            {season === 'spring' && "2,5-3,8 cm pro Woche, angepasst an Regenfälle. Tief aber selten gießen, um tiefes Wurzelwachstum zu fördern."}
                            {season === 'summer' && "3,8-5 cm pro Woche, vorzugsweise früh morgens. Häufigkeit bei extremer Hitze erhöhen."}
                            {season === 'fall' && "2,5 cm pro Woche, reduzieren bei kühleren Temperaturen. Weitergießen bis der Boden friert."}
                            {season === 'winter' && "Minimale Bewässerung nötig. Nur bei längeren Trockenperioden und Temperaturen über dem Gefrierpunkt gießen."}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="font-medium">Mähhöhe:</h4>
                          <p className="text-sm">
                            {season === 'spring' && "Beginnen Sie mit einer etwas niedrigeren Einstellung für das erste Mähen, dann erhöhen auf empfohlene Höhe für Ihren Grastyp."}
                            {season === 'summer' && "Mähklingen auf den höheren Bereich der empfohlenen Höhe einstellen, um Wurzeln vor Hitzestress zu schützen."}
                            {season === 'fall' && "Mähklingen leicht senken, während die Saison voranschreitet, um Verfilzung im Winter zu verhindern."}
                            {season === 'winter' && "Letzter Schnitt sollte kürzer sein, um Schneeschimmel zu verhindern. Minimales oder kein Mähen während der Ruhephase nötig."}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="font-medium">Häufige Herausforderungen:</h4>
                          <p className="text-sm">
                            {season === 'spring' && "Unkrautkeimung, Bodenverdichtung vom Winter, dünne Stellen durch Winterschäden."}
                            {season === 'summer' && "Hitzestress, Dürre, Insektenschädlinge (Engerlinge, Wanzen), Pilzkrankheiten bei feuchten Bedingungen."}
                            {season === 'fall' && "Herabgefallenes Laub erstickt Gras, Unkrautsamen lagern sich ab für nächstes Jahr, Vorbereitung auf Winterstress."}
                            {season === 'winter' && "Kälteschäden, Schneeschimmel, Salzschäden nahe Straßen, Kronenhydration bei schwankenden Temperaturen."}
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
          &copy; {new Date().getFullYear()} RasenPilot. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
};

export default SeasonGuide;
