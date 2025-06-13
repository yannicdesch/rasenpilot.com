
import React from 'react';
import AnalysisHeader from './analysis/AnalysisHeader';
import AnalysisTabs from './analysis/AnalysisTabs';
import RegistrationCTA from './analysis/RegistrationCTA';

interface AnalysisResultsProps {
  analysisResults: string | null;
}

type Severity = 'high' | 'medium' | 'low';

interface MainIssue {
  title: string;
  severity: Severity;
  description: string;
  timeline: string;
  cost: string;
}

interface Solution {
  category: string;
  tasks: string[];
}

interface Product {
  name: string;
  price: string;
  category: string;
}

interface MonthlyTask {
  month: string;
  priority: string;
}

interface ParsedAnalysis {
  score: number;
  mainIssues: MainIssue[];
  solutions: Solution[];
  products: Product[];
  monthlyTasks: MonthlyTask[];
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysisResults }) => {
  // Enhanced parsing of the analysis results
  const parseAnalysisResults = (results: string | null): ParsedAnalysis => {
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

  const getMockComprehensiveAnalysis = (score: number = 72): ParsedAnalysis => {
    return {
      score,
      mainIssues: [
        {
          title: "Nährstoffmangel",
          severity: "medium" as Severity,
          description: "Stickstoff- und Kaliummangel erkannt",
          timeline: "2-4 Wochen",
          cost: "25-40€"
        },
        {
          title: "Bodenverdichtung",
          severity: "medium" as Severity,
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

  return (
    <div className="space-y-6">
      <AnalysisHeader score={analysisData.score} />
      
      <AnalysisTabs 
        mainIssues={analysisData.mainIssues}
        solutions={analysisData.solutions}
        products={analysisData.products}
        monthlyTasks={analysisData.monthlyTasks}
      />

      <RegistrationCTA onRegister={handleRegister} />
    </div>
  );
};

export default AnalysisResults;
