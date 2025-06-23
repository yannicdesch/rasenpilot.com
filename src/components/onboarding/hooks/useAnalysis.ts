
import { useState } from 'react';
import { analyzeImageWithAI } from '@/services/aiAnalysisService';
import { toast } from 'sonner';

export const useAnalysis = () => {
  const [analysisResults, setAnalysisResults] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeImage = async (rasenproblem: string, updateData: (updates: any) => void) => {
    console.log('=== Starting AI image analysis ===');
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
      
      // Call the AI analysis service
      const result = await analyzeImageWithAI(
        imageUrl,
        'unknown',
        rasenproblem || 'Umfassende Rasenanalyse'
      );

      console.log('=== AI Analysis response ===');
      console.log('Result success:', result.success);
      console.log('Result error:', result.error);

      if (result.success && result.analysis) {
        console.log('=== Processing successful AI analysis ===');
        // Convert structured analysis to detailed formatted text
        const structuredAnalysis = result.analysis;
        let formattedAnalysis = `🌱 **KI-Rasenanalyse - Individueller Bericht**\n\n`;
        
        if (structuredAnalysis.overallHealth) {
          formattedAnalysis += `**Gesamtgesundheit:** ${structuredAnalysis.overallHealth}/10 (${structuredAnalysis.overallHealth * 10}%)\n\n`;
        }
        
        if (structuredAnalysis.issues && structuredAnalysis.issues.length > 0) {
          formattedAnalysis += `🔍 **Von KI erkannte Probleme**\n\n`;
          structuredAnalysis.issues.forEach((issue, index) => {
            formattedAnalysis += `**${index + 1}. ${issue.issue}**\n`;
            formattedAnalysis += `- **Schweregrad:** ${issue.severity === 'high' ? 'Hoch' : issue.severity === 'medium' ? 'Mittel' : 'Niedrig'}\n`;
            formattedAnalysis += `- **KI-Sicherheit:** ${Math.round(issue.confidence * 100)}%\n`;
            if (issue.timeline) formattedAnalysis += `- **Zeitrahmen:** ${issue.timeline}\n`;
            if (issue.cost) formattedAnalysis += `- **Geschätzte Kosten:** ${issue.cost}\n\n`;
            
            formattedAnalysis += `**Spezifische Empfehlungen:**\n`;
            issue.recommendations.forEach(rec => {
              formattedAnalysis += `- ${rec}\n`;
            });
            formattedAnalysis += `\n`;
          });
        }
        
        if (structuredAnalysis.generalRecommendations && structuredAnalysis.generalRecommendations.length > 0) {
          formattedAnalysis += `💡 **Allgemeine KI-Empfehlungen**\n`;
          structuredAnalysis.generalRecommendations.forEach(rec => {
            formattedAnalysis += `✓ ${rec}\n`;
          });
          formattedAnalysis += `\n`;
        }

        if (structuredAnalysis.seasonalAdvice && structuredAnalysis.seasonalAdvice.length > 0) {
          formattedAnalysis += `📅 **Saisonale Pflegehinweise**\n`;
          structuredAnalysis.seasonalAdvice.forEach(advice => {
            formattedAnalysis += `${advice}\n`;
          });
          formattedAnalysis += `\n`;
        }

        if (structuredAnalysis.monthlyPlan && structuredAnalysis.monthlyPlan.length > 0) {
          formattedAnalysis += `📋 **Individueller Pflegeplan**\n`;
          structuredAnalysis.monthlyPlan.forEach(plan => {
            formattedAnalysis += `**${plan.month}:**\n`;
            plan.tasks.forEach(task => {
              formattedAnalysis += `- ${task}\n`;
            });
            formattedAnalysis += `\n`;
          });
        }
        
        console.log('AI formatted analysis created');
        setAnalysisResults(formattedAnalysis);
        setShowAnalysis(true);
        updateData({ analysisCompleted: true });
        toast.success('KI-Bildanalyse erfolgreich abgeschlossen!');
      } else {
        console.log('=== AI Analysis failed, using fallback ===');
        console.log('Error:', result.error);
        
        // Show error message but still provide some analysis
        const fallbackAnalysis = `⚠️ **KI-Analyse temporär nicht verfügbar**\n\n` +
          `Die Verbindung zur KI-Analyse konnte nicht hergestellt werden.\n` +
          `Fehler: ${result.error}\n\n` +
          `Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support.\n\n` +
          `**Ihre Bilddaten sind gespeichert** und können für eine spätere Analyse verwendet werden.`;
        
        setAnalysisResults(fallbackAnalysis);
        setShowAnalysis(true);
        updateData({ analysisCompleted: true });
        toast.error('KI-Analyse fehlgeschlagen: ' + (result.error || 'Unbekannter Fehler'));
      }
    } catch (error) {
      console.error('=== Error in AI analysis ===');
      console.error('Error details:', error);
      
      const errorAnalysis = `❌ **Fehler bei der KI-Analyse**\n\n` +
        `Es ist ein Fehler aufgetreten: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}\n\n` +
        `Mögliche Ursachen:\n` +
        `- Internetverbindung unterbrochen\n` +
        `- KI-Service temporär nicht verfügbar\n` +
        `- Bildformat nicht unterstützt\n\n` +
        `Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.`;
      
      setAnalysisResults(errorAnalysis);
      setShowAnalysis(true);
      updateData({ analysisCompleted: true });
      toast.error('Fehler bei der KI-Analyse');
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
