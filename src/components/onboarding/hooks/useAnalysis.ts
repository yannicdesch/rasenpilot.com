
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
    console.log('Starting analysis...');
    setIsAnalyzing(true);
    
    try {
      // Call the analyze-lawn-problem edge function
      const { data: analysisData, error } = await supabase.functions.invoke('analyze-lawn-problem', {
        body: {
          problem: rasenproblem || 'Allgemeine Rasenanalyse basierend auf hochgeladenem Bild',
          hasImage: true
        }
      });

      if (error) {
        console.error('Analysis error:', error);
        throw error;
      }

      console.log('AI Analysis response:', analysisData);
      
      if (analysisData && analysisData.analysis) {
        setAnalysisResults(analysisData.analysis);
        setShowAnalysis(true);
        updateData({ analysisCompleted: true });
        toast.success('Analyse erfolgreich abgeschlossen!');
      } else {
        throw new Error('Keine Analysedaten erhalten');
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
