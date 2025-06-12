
import { useState } from 'react';
import { analyzeImageWithAI } from '@/services/aiAnalysisService';
import { toast } from 'sonner';

export const useAnalysis = () => {
  const [analysisResults, setAnalysisResults] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getComprehensiveMockAnalysis = () => {
    return `🌱 **Umfassende Rasenanalyse - Detaillierter Bericht**

**Gesamtgesundheit:** 7.2/10 (72%)

🔍 **Detaillierte Problemanalyse**

**1. Nährstoffmangel (Hauptproblem)**
- **Erkannte Mängel:** Stickstoff (N) und Kalium (K)
- **Sichtbare Symptome:** Gelbliche Verfärbung, schwaches Wachstum, dünne Grasnarbe
- **Vertrauensgrad:** 87%
- **Zeitrahmen für Verbesserung:** 2-4 Wochen
- **Geschätzte Kosten:** 25-40€

**Spezifische Empfehlungen:**
- Sofort: Bodentest durchführen (pH-Wert, NPK-Gehalt, Spurenelemente)
- Herbstdüngung mit kaliumreichem Dünger (NPK-Verhältnis 5-5-20)
- Düngung bei Temperaturen zwischen 10-20°C für optimale Aufnahme
- Nach Düngung gründlich wässern (15-20mm Wasser)

**2. Bodenverdichtung & Entwässerungsprobleme**
- **Problembereiche:** Ungleichmäßige Wasseraufnahme, Staunässe
- **Vertrauensgrad:** 78%
- **Sofortige Lösung:** Aerifizierung erforderlich
- **Geschätzte Kosten:** 15-30€ für Geräte-Miete

**Detaillierte Lösungsschritte:**
- Aerifizierung mit 5cm tiefen Löchern bei feuchtem Boden
- Groben Sand in Belüftungslöcher einarbeiten
- Bewässerungszeiten auf frühe Morgenstunden (5-7 Uhr) verlegen
- Installation von Bodenfeuchtesensoren erwägen

💡 **Umfassender 3-Phasen-Lösungsplan**

**Phase 1: Sofortmaßnahmen (diese Woche)**
✓ Professionellen Bodentest durchführen
✓ Aerifizierung bei optimalem Bodenzustand
✓ Bewässerungssystem auf Morgenzeiten umstellen
✓ Dokumentation der Ausgangssituation mit Fotos

**Phase 2: Kurzfristige Verbesserungen (2-4 Wochen)**
✓ Gezielte Düngung basierend auf Bodentest-Ergebnissen
✓ Nachsaat kahler Stellen mit klimaangepasster Rasenmischung
✓ Mechanische Unkrautentfernung bei feuchtem Boden
✓ Installation automatischer Bewässerung mit Timern

**Phase 3: Langfristige Strategie (Saisonplanung)**
✓ Monatlicher Pflegekalender mit Foto-Dokumentation
✓ Präventive Unkraut- und Schädlingskontrolle
✓ Jährliche Bodenanalyse im Frühjahr
✓ Aufbau einer dichten, widerstandsfähigen Grasnarbe

🛒 **Professionelle Produktempfehlungen**

**Dünger & Bodenverbesserung:**
- Compo Rasen Langzeit-Dünger (20kg) - €29,99 ⭐4.5/5
- Substral Herbst Rasendünger mit Kalium - €22,50 ⭐4.3/5
- Neudorff Azet RasenDünger - €24,99 (Bio-Option) ⭐4.4/5

**Geräte & Hilfsmittel:**
- Gardena Aerifizierer Professional - €24,99 ⭐4.7/5
- Bodentest-Kit pH/NPK Professional - €15,99 ⭐4.6/5
- Bewässerungscomputer mit Sensoren - €45,99 ⭐4.2/5

**Pflanzenschutz:**
- Celaflor Rasen-Unkrautfrei Weedex - €18,99 ⭐4.4/5
- Wolf Garten Turbo-Nachsaat LR 25 - €19,99 ⭐4.5/5

📅 **Detaillierter Monatskalender**

**März 2024:**
🎯 **Hauptziel:** Winterschäden beheben, Saison vorbereiten
- Erste Inspektion und Schadensdokumentation
- Vertikutieren bei trockenem Boden (ab 10°C)
- Startdüngung mit Langzeitwirkung
- Reparatur von Frostschäden

**April 2024:**
🎯 **Hauptziel:** Regeneration und Wachstumsförderung
- Nachsaat kahler Stellen (optimale Keimtemperatur)
- Selektive Unkrautbekämpfung beginnen
- Erste Mahd bei 8cm Wuchshöhe
- Bewässerungsanlage überprüfen und einstellen

**Mai 2024:**
🎯 **Hauptziel:** Etablierung der Sommerpflege
- Regelmäßige Bewässerungsroutine (3x wöchentlich)
- Zweite Düngergabe nach 6-8 Wochen
- Rasenkanten professionell schneiden
- Schädlings- und Krankheitskontrolle

🔬 **Erweiterte Pflegetipps**

**Optimale Mähpraxis:**
- Ein-Drittel-Regel: Nur 1/3 der Halmlänge entfernen
- Scharfe Messer für saubere Schnitte verwenden
- Schnitthöhe saisonal anpassen (Sommer: 4-5cm, Winter: 5cm)
- Mulchmähen für natürliche Nährstoffzufuhr

**Professionelle Bewässerung:**
- Tiefes, weniger häufiges Wässern (2-3x pro Woche)
- Wassermenge: 15-20mm pro Bewässerung
- Frühe Morgenstunden (5-7 Uhr) für minimale Verdunstung
- Bodenfeuchtigkeit vor Bewässerung prüfen

**Vorbeugung & Gesunderhaltung:**
- Regelmäßige Bodenbelüftung (jährlich im Herbst)
- pH-Wert zwischen 6,0-7,0 halten
- Organische Dünger für nachhaltige Nährstoffversorgung
- Rasenmischungen an lokales Klima anpassen`;
  };

  const handleAnalyzeImage = async (rasenproblem: string, updateData: (updates: any) => void) => {
    console.log('=== Starting comprehensive image analysis ===');
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
        rasenproblem || 'Umfassende Rasenanalyse'
      );

      console.log('=== AI Analysis response ===');
      console.log('Result:', result);

      if (result.success && result.analysis) {
        console.log('=== Processing successful comprehensive analysis ===');
        // Convert structured analysis to detailed formatted text
        const structuredAnalysis = result.analysis;
        let formattedAnalysis = `🌱 **Umfassende Rasenanalyse - Professioneller Bericht**\n\n`;
        
        if (structuredAnalysis.overallHealth) {
          formattedAnalysis += `**Gesamtgesundheit:** ${structuredAnalysis.overallHealth}/10 (${structuredAnalysis.overallHealth * 10}%)\n\n`;
        }
        
        if (structuredAnalysis.issues && structuredAnalysis.issues.length > 0) {
          formattedAnalysis += `🔍 **Detaillierte Problemanalyse**\n\n`;
          structuredAnalysis.issues.forEach((issue, index) => {
            formattedAnalysis += `**${index + 1}. ${issue.issue}**\n`;
            formattedAnalysis += `- **Schweregrad:** ${issue.severity === 'high' ? 'Hoch' : issue.severity === 'medium' ? 'Mittel' : 'Niedrig'}\n`;
            formattedAnalysis += `- **Vertrauensgrad:** ${Math.round(issue.confidence * 100)}%\n`;
            if (issue.timeline) formattedAnalysis += `- **Zeitrahmen:** ${issue.timeline}\n`;
            if (issue.cost) formattedAnalysis += `- **Geschätzte Kosten:** ${issue.cost}\n\n`;
            
            formattedAnalysis += `**Spezifische Empfehlungen:**\n`;
            issue.recommendations.forEach(rec => {
              formattedAnalysis += `- ${rec}\n`;
            });
            
            if (issue.products && issue.products.length > 0) {
              formattedAnalysis += `\n**Empfohlene Produkte:**\n`;
              issue.products.forEach(product => {
                formattedAnalysis += `- ${product}\n`;
              });
            }
            formattedAnalysis += `\n`;
          });
        }
        
        if (structuredAnalysis.generalRecommendations && structuredAnalysis.generalRecommendations.length > 0) {
          formattedAnalysis += `💡 **Allgemeine Empfehlungen**\n`;
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
          formattedAnalysis += `📋 **Monatlicher Pflegeplan**\n`;
          structuredAnalysis.monthlyPlan.forEach(plan => {
            formattedAnalysis += `**${plan.month}:**\n`;
            plan.tasks.forEach(task => {
              formattedAnalysis += `- ${task}\n`;
            });
            formattedAnalysis += `\n`;
          });
        }
        
        console.log('Comprehensive formatted analysis:', formattedAnalysis);
        setAnalysisResults(formattedAnalysis);
        setShowAnalysis(true);
        updateData({ analysisCompleted: true });
        toast.success('Umfassende KI-Bildanalyse erfolgreich abgeschlossen!');
      } else {
        console.log('=== Analysis failed, using comprehensive fallback ===');
        console.log('Error:', result.error);
        // Fallback to comprehensive mock analysis
        const comprehensiveAnalysis = getComprehensiveMockAnalysis();
        console.log('Using comprehensive mock analysis as fallback');
        setAnalysisResults(comprehensiveAnalysis);
        setShowAnalysis(true);
        updateData({ analysisCompleted: true });
        toast.info('Erweiterte Demo-Analyse wird angezeigt (KI-Service vorübergehend nicht verfügbar)');
      }
    } catch (error) {
      console.error('=== Error in comprehensive analysis ===');
      console.error('Error details:', error);
      // Fallback to comprehensive mock analysis
      const comprehensiveAnalysis = getComprehensiveMockAnalysis();
      console.log('Using comprehensive mock analysis as fallback due to error');
      setAnalysisResults(comprehensiveAnalysis);
      setShowAnalysis(true);
      updateData({ analysisCompleted: true });
      toast.info('Erweiterte Demo-Analyse wird angezeigt (Fehler bei KI-Analyse)');
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
