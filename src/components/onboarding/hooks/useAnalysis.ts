
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
    console.log('Starting image analysis...');
    setIsAnalyzing(true);
    
    try {
      // Get the image URL from localStorage
      const imageUrl = localStorage.getItem('currentImageUrl');
      
      if (!imageUrl) {
        console.log('No image URL found, using text-based analysis');
        // Fall back to text-based analysis
        const { data: analysisData, error } = await supabase.functions.invoke('analyze-lawn-problem', {
          body: {
            problem: rasenproblem || 'Allgemeine Rasenanalyse',
            hasImage: false
          }
        });

        if (error) {
          console.error('Text analysis error:', error);
          throw error;
        }

        if (analysisData && analysisData.analysis) {
          setAnalysisResults(analysisData.analysis);
          setShowAnalysis(true);
          updateData({ analysisCompleted: true });
          toast.success('Analyse erfolgreich abgeschlossen!');
        }
      } else {
        console.log('Image URL found, using image analysis:', imageUrl);
        // Use image analysis
        const { data: analysisData, error } = await supabase.functions.invoke('analyze-lawn-image', {
          body: {
            imageUrl: imageUrl,
            grassType: 'unknown',
            lawnGoal: rasenproblem || 'Allgemeine Rasenanalyse'
          }
        });

        if (error) {
          console.error('Image analysis error:', error);
          throw error;
        }

        console.log('Image Analysis response:', analysisData);
        
        if (analysisData && analysisData.success && analysisData.analysis) {
          // Convert structured analysis to formatted text
          const structuredAnalysis = analysisData.analysis;
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
          
          setAnalysisResults(formattedAnalysis);
          setShowAnalysis(true);
          updateData({ analysisCompleted: true });
          toast.success('KI-Bildanalyse erfolgreich abgeschlossen!');
        } else {
          throw new Error('Keine Analysedaten erhalten');
        }
      }
    } catch (error) {
      console.error('Error getting AI analysis:', error);
      // Fallback to mock analysis
      const mockAnalysis = getMockAnalysis();
      setAnalysisResults(mockAnalysis);
      setShowAnalysis(true);
      updateData({ analysisCompleted: true });
      toast.info('Demo-Analyse wird angezeigt');
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
