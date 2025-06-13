
import React from 'react';
import { CheckCircle, AlertTriangle, Lightbulb, UserPlus, Target, Clock, DollarSign, Calendar, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalysisResultsProps {
  analysisResults: string | null;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysisResults }) => {
  // Enhanced parsing of the analysis results
  const parseAnalysisResults = (results: string | null) => {
    if (!results) {
      return getMockComprehensiveAnalysis();
    }

    // Try to extract structured information from the analysis text
    const lines = results.split('\n').filter(line => line.trim());
    
    // Look for health score in the text
    let score = 65;
    const healthLine = lines.find(line => line.includes('Gesamtgesundheit') || line.includes('/10'));
    if (healthLine) {
      const scoreMatch = healthLine.match(/(\d+)\/10/);
      if (scoreMatch) {
        score = parseInt(scoreMatch[1]) * 10;
      }
    }

    return getMockComprehensiveAnalysis(score);
  };

  const getMockComprehensiveAnalysis = (score: number = 72) => {
    return {
      score,
      mainIssues: [
        {
          title: "Nährstoffmangel",
          severity: "medium" as const,
          description: "Stickstoff- und Kaliummangel erkannt",
          timeline: "2-4 Wochen",
          cost: "25-40€"
        },
        {
          title: "Bodenverdichtung",
          severity: "medium" as const,
          description: "Ungleichmäßige Wasseraufnahme",
          timeline: "Sofort nach Belüftung",
          cost: "15-30€"
        }
      ],
      solutions: [
        {
          category: "Sofortmaßnahmen",
          tasks: [
            "Bodentest durchführen (pH-Wert, NPK)",
            "Aerifizierung bei feuchtem Boden",
            "Bewässerungszeiten optimieren (früh morgens)"
          ]
        },
        {
          category: "Kurzfristig (2-4 Wochen)",
          tasks: [
            "Herbstdüngung mit Kalium-Anteil",
            "Nachsaat kahler Stellen",
            "Unkraut mechanisch entfernen"
          ]
        },
        {
          category: "Langfristig (Saisonplan)",
          tasks: [
            "Monatlichen Pflegeplan etablieren",
            "Automatische Bewässerung installieren",
            "Präventive Unkrautbekämpfung"
          ]
        }
      ],
      products: [
        { name: "Compo Rasen Langzeit-Dünger", price: "€29,99", category: "Dünger" },
        { name: "Gardena Aerifizierer", price: "€24,99", category: "Geräte" },
        { name: "Celaflor Rasen-Unkrautfrei", price: "€18,99", category: "Pflanzenschutz" }
      ],
      monthlyTasks: [
        { month: "März", priority: "Vertikutieren + Startdüngung" },
        { month: "April", priority: "Nachsaat + Unkrautbekämpfung" },
        { month: "Mai", priority: "Bewässerung etablieren" }
      ]
    };
  };

  const analysisData = parseAnalysisResults(analysisResults);

  const handleRegister = () => {
    window.location.href = '/auth?tab=register';
  };

  const getSeverityColor = (severity: string) => {
    if (severity === 'high') return 'bg-red-100 text-red-800';
    if (severity === 'medium') return 'bg-yellow-100 text-yellow-800';
    if (severity === 'low') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header with Enhanced Score */}
      <Card className="border-green-100">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-green-800 mb-4">
            🌿 Deine umfassende Rasenanalyse
          </CardTitle>
          
          <div className="bg-green-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-800">
                📊 Rasen-Gesundheit:
              </span>
              <div className="text-right">
                <span className="text-3xl font-bold text-green-600">
                  {analysisData.score}%
                </span>
                <p className="text-sm text-gray-600">
                  {analysisData.score >= 80 ? 'Sehr gut' : 
                   analysisData.score >= 60 ? 'Verbesserungsfähig' : 'Behandlung nötig'}
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-green-600 h-4 rounded-full transition-all duration-1000" 
                style={{ width: `${analysisData.score}%` }}
              ></div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Comprehensive Analysis Tabs */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
            <Lightbulb className="h-6 w-6" />
            Detaillierte Analyse & Lösungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="problems" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="problems">Probleme</TabsTrigger>
              <TabsTrigger value="solutions">Lösungsplan</TabsTrigger>
              <TabsTrigger value="products">Produkte</TabsTrigger>
              <TabsTrigger value="timeline">Zeitplan</TabsTrigger>
            </TabsList>
            
            <TabsContent value="problems" className="space-y-4 mt-4">
              {analysisData.mainIssues.map((issue, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{issue.title}</h4>
                    <Badge className={getSeverityColor(issue.severity)}>
                      {issue.severity === 'high' ? 'Hoch' : 
                       issue.severity === 'medium' ? 'Mittel' : 'Niedrig'}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{issue.description}</p>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>{issue.timeline}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span>{issue.cost}</span>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="solutions" className="space-y-4 mt-4">
              {analysisData.solutions.map((solution, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    {solution.category}
                  </h4>
                  <div className="space-y-2">
                    {solution.tasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="products" className="space-y-4 mt-4">
              <div className="grid gap-4">
                {analysisData.products.map((product, index) => (
                  <div key={index} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-800">{product.name}</h4>
                      <Badge variant="secondary" className="mt-1">
                        {product.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold text-green-600">
                        {product.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4 mt-4">
              {analysisData.monthlyTasks.map((task, index) => (
                <div key={index} className="border rounded-lg p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{task.month}</h4>
                    <p className="text-gray-600">{task.priority}</p>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Enhanced Registration CTA */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center mb-4">
              <Leaf className="h-8 w-8 text-green-600 mr-2" />
              <h3 className="text-xl font-semibold text-green-800">
                Werde Rasen-Experte mit Premium-Features
              </h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-800 mb-3">✅ Premium-Analyse:</h4>
                <ul className="text-sm text-gray-700 space-y-1 text-left">
                  <li>• Detaillierte Bodenanalyse-Empfehlungen</li>
                  <li>• Monatliche Pflegepläne</li>
                  <li>• Produktvergleiche mit Preisen</li>
                  <li>• Wetterbasierte Anpassungen</li>
                  <li>• Foto-Verlaufstracking</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-600 mb-3">❌ Basis-Version:</h4>
                <ul className="text-sm text-gray-600 space-y-1 text-left">
                  <li>• Nur eine Analyse pro Gerät</li>
                  <li>• Grundlegende Empfehlungen</li>
                  <li>• Keine Verlaufsspeicherung</li>
                  <li>• Keine Updates</li>
                </ul>
              </div>
            </div>

            <Button 
              onClick={handleRegister}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Jetzt kostenlos Premium testen
            </Button>
            
            <p className="text-xs text-gray-600 mt-2">
              30 Tage kostenlos • Jederzeit kündbar • Keine versteckten Kosten
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisResults;
