
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb, 
  Calendar, 
  ShoppingCart,
  TrendingUp,
  Clock,
  Euro
} from 'lucide-react';

interface AnalysisResultsProps {
  analysisResults: string | null;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysisResults }) => {
  // Mock comprehensive analysis data (in a real app, this would parse the AI results)
  const mockAnalysis = {
    overallHealth: 72,
    mainIssues: [
      {
        title: "Nährstoffmangel (Stickstoff)",
        severity: "medium" as const,
        confidence: 85,
        description: "Deutliche Anzeichen von Stickstoffmangel erkennbar durch gelbliche Verfärbung",
        urgency: "Innerhalb 2 Wochen behandeln"
      },
      {
        title: "Bodenverdichtung",
        severity: "high" as const,
        confidence: 78,
        description: "Ungleichmäßige Wasseraufnahme deutet auf verdichteten Boden hin",
        urgency: "Sofortige Maßnahmen erforderlich"
      },
      {
        title: "Unkrautbefall (Löwenzahn)",
        severity: "low" as const,
        confidence: 65,
        description: "Beginnender Unkrautbefall in mehreren Bereichen",
        urgency: "Behandlung in den nächsten 4 Wochen"
      }
    ],
    solutions: {
      immediate: [
        "Bodenbelüftung mit Aerifizierer durchführen",
        "pH-Wert des Bodens testen",
        "Bewässerungszeiten auf frühen Morgen verlegen"
      ],
      shortTerm: [
        "Herbstdünger mit hohem Stickstoffanteil ausbringen",
        "Nachsaat mit geeigneter Rasenmischung",
        "Mechanische Unkrautentfernung bei feuchtem Boden"
      ],
      longTerm: [
        "Regelmäßigen Pflegeplan etablieren",
        "Bodenfruchtbarkeit langfristig verbessern",
        "Präventive Unkrautbekämpfung implementieren"
      ]
    },
    products: [
      { name: "Compo Rasen Langzeit-Dünger", price: "29,99", category: "Dünger", rating: 4.5 },
      { name: "Gardena Aerifizierer", price: "24,99", category: "Geräte", rating: 4.7 },
      { name: "Substral Herbst-Rasendünger", price: "22,50", category: "Dünger", rating: 4.3 },
      { name: "Wolf Garten Turbo-Nachsaat", price: "19,99", category: "Saatgut", rating: 4.5 }
    ],
    timeline: [
      { week: "Diese Woche", tasks: ["Bodentest durchführen", "Aerifizierung"] },
      { week: "Woche 2-3", tasks: ["Düngung", "Bewässerung optimieren"] },
      { week: "Woche 4-6", tasks: ["Nachsaat", "Unkrautbekämpfung"] },
      { week: "Langfristig", tasks: ["Monatliche Kontrolle", "Pflegeplan einhalten"] }
    ]
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-xl text-green-800 flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Gesamtbewertung Ihres Rasens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Rasengesundheit</span>
                <span className="text-2xl font-bold text-green-600">{mockAnalysis.overallHealth}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full" 
                  style={{ width: `${mockAnalysis.overallHealth}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                mockAnalysis.overallHealth >= 80 ? 'bg-green-100 text-green-800' :
                mockAnalysis.overallHealth >= 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {mockAnalysis.overallHealth >= 80 ? 'Gut' :
                 mockAnalysis.overallHealth >= 60 ? 'Behandlung empfohlen' :
                 'Dringend behandeln'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-blue-800">Detaillierte Analyse & Lösungen</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="problems" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="problems">Probleme</TabsTrigger>
              <TabsTrigger value="solutions">Lösungen</TabsTrigger>
              <TabsTrigger value="products">Produkte</TabsTrigger>
              <TabsTrigger value="timeline">Zeitplan</TabsTrigger>
            </TabsList>
            
            <TabsContent value="problems" className="space-y-4">
              {mockAnalysis.mainIssues.map((issue, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg">{issue.title}</h3>
                    <Badge className={getSeverityColor(issue.severity)}>
                      {getSeverityIcon(issue.severity)}
                      <span className="ml-1 capitalize">{issue.severity}</span>
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-2">{issue.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Vertrauen: {issue.confidence}%
                    </span>
                    <span className="text-orange-600 font-medium">
                      {issue.urgency}
                    </span>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="solutions" className="space-y-4">
              <div className="grid gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Sofortmaßnahmen
                  </h3>
                  <ul className="space-y-2">
                    {mockAnalysis.solutions.immediate.map((solution, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-sm">{solution}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    Kurzfristig (2-4 Wochen)
                  </h3>
                  <ul className="space-y-2">
                    {mockAnalysis.solutions.shortTerm.map((solution, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-sm">{solution}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Langfristig
                  </h3>
                  <ul className="space-y-2">
                    {mockAnalysis.solutions.longTerm.map((solution, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-sm">{solution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <div className="grid gap-4">
                {mockAnalysis.products.map((product, index) => (
                  <div key={index} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{product.category}</Badge>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm">{product.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {product.price}€
                      </div>
                      <Button size="sm" className="mt-1">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Kaufen
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <div className="space-y-4">
                {mockAnalysis.timeline.map((period, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3">{period.week}</h3>
                    <ul className="space-y-2">
                      {period.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
            <Lightbulb className="h-6 w-6" />
            Nächste Schritte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h4 className="font-medium">Bodenbelüftung durchführen</h4>
                <p className="text-sm text-gray-600">Wichtigste Sofortmaßnahme zur Verbesserung der Bodenstruktur</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h4 className="font-medium">Dünger besorgen und ausbringen</h4>
                <p className="text-sm text-gray-600">Stickstoffmangel mit geeignetem Herbstdünger beheben</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h4 className="font-medium">Pflegeplan erstellen</h4>
                <p className="text-sm text-gray-600">Regelmäßige Kontrolle und Pflege für langfristige Gesundheit</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisResults;
