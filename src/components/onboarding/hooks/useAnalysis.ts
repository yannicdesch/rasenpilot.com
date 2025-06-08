
import { useState } from 'react';
import { analyzeImageWithAI } from '@/services/aiAnalysisService';
import { toast } from 'sonner';

export const useAnalysis = () => {
  const [analysisResults, setAnalysisResults] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getMockAnalysis = () => {
    return `🌱 **Rasenanalyse Ergebnisse**

Basierend auf deinem hochgeladenen Bild und der Problembeschreibung haben wir folgende Erkenntnisse:

🛠️ **Erkannte Probleme**
• Ungleichmäßiges Wachstum in verschiedenen Bereichen
• Möglicher Nährstoffmangel erkennbar
• Einzelne kahle Stellen sichtbar

💡 **Empfohlene Maßnahmen**
• Bodentest durchführen zur genauen Nährstoffbestimmung
• Gezielte Nachsaat in kahlen Bereichen
• Regelmäßige Düngung mit Langzeitdünger
• Bewässerung optimieren - morgens und abends

🛒 **Produktempfehlungen**
• Rasendünger mit Langzeitwirkung
• Nachsaatmischung für deinen Rasentyp
• pH-Teststreifen für Bodenanalyse`;
  };

  const handleAnalyzeImage = async (rasenproblem: string, updateData: (updates: any) => void) => {
    console.log('=== Starting image analysis ===');
    console.log('Problem description:', rasenproblem);
    setIsAnalyzing(true);
    
    try {
      // Get the image URL from localStorage
      const imageUrl = localStorage.getItem('currentImageUrl');
      console.log('Image URL from localStorage:', imageUrl);
      
      if (!imageUrl) {
        console.log('No image URL found');
        throw new Error('Kein Bild gefunden. Bitte lade zuerst ein Bild hoch.');
      }

      console.log('=== Calling analyzeImageWithAI with blob URL ===');
      
      // Call the updated function that can handle blob URLs
      const result = await analyzeImageWithAI(
        imageUrl, // This will be converted from blob URL to File
        'unknown',
        rasenproblem || 'Allgemeine Rasenanalyse'
      );

      console.log('=== AI Analysis response ===');
      console.log('Result:', result);

      if (result.success && result.analysis) {
        console.log('=== Processing successful analysis ===');
        // Convert structured analysis to formatted text
        const structuredAnalysis = result.analysis;
        let formattedAnalysis = `🌱 **Rasenanalyse Ergebnisse**\n\n`;
        
        if (structuredAnalysis.overallHealth) {
          formattedAnalysis += `**Gesamtgesundheit:** ${structuredAnalysis.overallHealth}/10\n\n`;
        }
        
        if (structuredAnalysis.issues && structuredAnalysis.issues.length > 0) {
          formattedAnalysis += `🛠️ **Erkannte Probleme**\n`;
          structuredAnalysis.issues.forEach(issue => {
            formattedAnalysis += `• ${issue.issue} (${Math.round(issue.confidence * 100)}% Sicherheit)\n`;
            formattedAnalysis += `  Empfehlungen:\n`;
            issue.recommendations.forEach(rec => {
              formattedAnalysis += `  - ${rec}\n`;
            });
          });
          formattedAnalysis += `\n`;
        }
        
        if (structuredAnalysis.generalRecommendations && structuredAnalysis.generalRecommendations.length > 0) {
          formattedAnalysis += `💡 **Allgemeine Empfehlungen**\n`;
          structuredAnalysis.generalRecommendations.forEach(rec => {
            formattedAnalysis += `• ${rec}\n`;
          });
        }
        
        console.log('Formatted analysis:', formattedAnalysis);
        setAnalysisResults(formattedAnalysis);
        setShowAnalysis(true);
        updateData({ analysisCompleted: true });
        toast.success('KI-Bildanalyse erfolgreich abgeschlossen!');
      } else {
        console.log('=== Analysis failed ===');
        console.log('Error:', result.error);
        throw new Error(result.error || 'Analyse fehlgeschlagen');
      }
    } catch (error) {
      console.error('=== Error in analysis ===');
      console.error('Error details:', error);
      // Fallback to mock analysis
      const mockAnalysis = getMockAnalysis();
      console.log('Using mock analysis as fallback');
      setAnalysisResults(mockAnalysis);
      setShowAnalysis(true);
      updateData({ analysisCompleted: true });
      toast.info('Demo-Analyse wird angezeigt (KI-Service nicht verfügbar)');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analysisResults,
    showAnalysis,
    isAnalyzing,
    handleAnalyzeImage
  };
};
