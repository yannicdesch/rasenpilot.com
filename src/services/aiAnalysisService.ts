
import { supabase } from '@/integrations/supabase/client';

export interface AIAnalysisResult {
  overallHealth: number;
  issues: Array<{
    issue: string;
    confidence: number;
    severity: 'low' | 'medium' | 'high';
    recommendations: string[];
    timeline: string;
    products: string[];
    cost: string;
  }>;
  generalRecommendations: string[];
  seasonalAdvice: string[];
  preventionTips: string[];
  monthlyPlan: Array<{
    month: string;
    tasks: string[];
  }>;
}

export interface AnalysisResponse {
  success: boolean;
  analysis?: AIAnalysisResult;
  error?: string;
}

// New function to handle blob URL to File conversion
const blobUrlToFile = async (blobUrl: string, filename: string = 'lawn-image.jpg'): Promise<File> => {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
};

export const analyzeImageWithAI = async (
  imageInput: File | string, // Can be File or blob URL
  grassType?: string,
  lawnGoal?: string
): Promise<AnalysisResponse> => {
  try {
    console.log('Starting AI image analysis with OpenAI...');
    
    let imageFile: File;
    
    // If imageInput is a string (blob URL), convert it to File
    if (typeof imageInput === 'string') {
      console.log('Converting blob URL to File:', imageInput);
      imageFile = await blobUrlToFile(imageInput);
    } else {
      imageFile = imageInput;
    }
    
    // Upload the image to Supabase Storage
    const fileName = `lawn-analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${imageFile.name.split('.').pop()}`;
    
    console.log('Uploading image to Supabase Storage:', fileName);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lawn-images')
      .upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Image upload failed:', uploadError);
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    console.log('Image uploaded successfully:', uploadData);

    // Get the public URL of the uploaded image
    const { data: urlData } = supabase.storage
      .from('lawn-images')
      .getPublicUrl(fileName);

    if (!urlData.publicUrl) {
      throw new Error('Failed to get image URL');
    }

    console.log('Image URL obtained:', urlData.publicUrl);

    // Call the Edge Function for AI analysis
    console.log('Calling analyze-lawn-image edge function...');
    const { data, error } = await supabase.functions.invoke('analyze-lawn-image', {
      body: {
        imageUrl: urlData.publicUrl,
        grassType,
        lawnGoal
      }
    });

    console.log('Edge function response:', data, error);

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }

    // Clean up uploaded image after analysis
    try {
      await supabase.storage.from('lawn-images').remove([fileName]);
      console.log('Temporary image cleaned up');
    } catch (cleanupError) {
      console.warn('Failed to cleanup temporary image:', cleanupError);
    }

    return data as AnalysisResponse;

  } catch (error) {
    console.error('AI Analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Enhanced comprehensive mock analysis
export const getMockAnalysis = (): AIAnalysisResult => {
  return {
    overallHealth: 72,
    issues: [
      {
        issue: "Nährstoffmangel - Stickstoff und Kalium",
        confidence: 0.87,
        severity: "medium",
        timeline: "2-4 Wochen bis erste Verbesserungen sichtbar sind",
        cost: "25-40€ für Dünger",
        products: [
          "Compo Rasen Langzeit-Dünger (20kg)",
          "Substral Herbst Rasendünger",
          "Wolf Garten Turbo-Nachsaat LR 25"
        ],
        recommendations: [
          "Führe einen professionellen Bodentest durch (pH-Wert, N-P-K-Gehalt, Spurenelemente)",
          "Verwende einen Herbst-Rasendünger mit hohem Kaliumgehalt (NPK 5-5-20)",
          "Dünge bei Temperaturen zwischen 10-20°C für optimale Aufnahme",
          "Wässere nach der Düngung gründlich (ca. 15-20mm Wasser)",
          "Vermeide Düngung bei Frost oder extremer Hitze",
          "Dokumentiere die Düngetermine für zukünftige Referenz"
        ]
      },
      {
        issue: "Ungleichmäßige Bewässerung und Bodenverdichtung",
        confidence: 0.78,
        severity: "medium",
        timeline: "Sofortige Verbesserung nach Belüftung",
        cost: "15-30€ für Aerifizierer-Miete",
        products: [
          "Gardena Aerifizierer",
          "Rasenbelüfter-Schuhe",
          "Bewässerungscomputer mit Sensoren"
        ],
        recommendations: [
          "Führe eine Bodenbelüftung mit einem Aerifizierer durch (5cm tiefe Löcher)",
          "Arbeite groben Sand in die Belüftungslöcher ein",
          "Installiere ein automatisches Bewässerungssystem mit Bodenfeuchtesensoren",
          "Bewässere früh morgens (5-7 Uhr) für minimale Verdunstung",
          "Verwende die 'Ein-Drittel-Regel': Nur ein Drittel der Halmlänge mähen",
          "Prüfe Bodenfeuchtigkeit mit einem Erdspieß (15cm tief)"
        ]
      },
      {
        issue: "Beginnender Unkrautbefall (Löwenzahn, Klee)",
        confidence: 0.65,
        severity: "low",
        timeline: "4-6 Wochen für vollständige Kontrolle",
        cost: "20-35€ für selektive Herbizide",
        products: [
          "Celaflor Rasen-Unkrautfrei Weedex",
          "Compo Rasenunkraut-Vernichter Banvel Quattro",
          "Bio-Unkrautstecher für einzelne Pflanzen"
        ],
        recommendations: [
          "Entferne Unkraut mechanisch bei feuchtem Boden (nach Regen)",
          "Verwende selektive Herbizide nur bei Temperaturen zwischen 15-25°C",
          "Stärke die Rasendichte durch Nachsaat geeigneter Grassorten",
          "Mähe regelmäßig (wöchentlich) um Samenbildung zu verhindern",
          "Kalke bei pH-Werten unter 6,0 (Unkraut bevorzugt saure Böden)",
          "Vermeide Herbizide bei windigem Wetter oder vor Regen"
        ]
      }
    ],
    generalRecommendations: [
      "Erstelle einen Pflegekalender mit monatlichen Aufgaben",
      "Führe zweimal jährlich (Frühjahr/Herbst) eine ausführliche Rasenanalyse durch",
      "Investiere in ein Bodenthermometer für optimale Timing der Pflegemaßnahmen",
      "Dokumentiere alle Pflegemaßnahmen mit Fotos für Fortschrittsvergleiche",
      "Verwende nur scharfe Mähmesser für saubere Schnitte und Krankheitsprävention"
    ],
    seasonalAdvice: [
      "🌱 Frühjahr (März-Mai): Vertikutieren, Nachsaat, erste Düngung bei 10°C Bodentemperatur",
      "☀️ Sommer (Juni-August): Seltener aber tiefes Wässern, Schnitthöhe auf 4-5cm erhöhen",
      "🍂 Herbst (September-November): Herbstdünger, Laub entfernen, letzte Mahd bei 5cm",
      "❄️ Winter (Dezember-Februar): Rasen nicht betreten bei Frost, Schnee gleichmäßig verteilen"
    ],
    preventionTips: [
      "Verwende kalkstickstoffhaltigen Dünger zur natürlichen Unkrautprävention",
      "Installiere Rasenkanten um Unkrauteinwanderung aus Beeten zu verhindern",
      "Mulche angrenzende Pflanzbeete um Samendruck zu reduzieren",
      "Benutze einen Streuwagen für gleichmäßige Düngerverteilung",
      "Achte auf Drainage in problematischen Bereichen (Staunässe vermeiden)"
    ],
    monthlyPlan: [
      {
        month: "März",
        tasks: [
          "Erste Inspektion nach dem Winter",
          "Vertikutieren bei trockenem Boden",
          "Startdüngung bei 10°C Bodentemperatur",
          "Reparatur von Winterschäden"
        ]
      },
      {
        month: "April",
        tasks: [
          "Nachsaat kahler Stellen",
          "Unkrautbekämpfung beginnen",
          "Erste Mahd bei 8cm Wuchshöhe",
          "Bewässerungsanlage überprüfen"
        ]
      },
      {
        month: "Mai",
        tasks: [
          "Regelmäßige Bewässerung etablieren",
          "Zweite Düngung",
          "Rasenkanten schneiden",
          "Schädlingskontrolle"
        ]
      },
      {
        month: "Juni-August",
        tasks: [
          "Wöchentliche Mahd (nicht unter 4cm)",
          "Tiefes Wässern 2-3x pro Woche",
          "Sommerdüngung mit Langzeitwirkung",
          "Pilzkrankheiten überwachen"
        ]
      },
      {
        month: "September",
        tasks: [
          "Herbstdüngung (kaliumreich)",
          "Nachsaat für dichtere Grasnarbe",
          "Bodenbelüftung",
          "Laub regelmäßig entfernen"
        ]
      },
      {
        month: "Oktober-November",
        tasks: [
          "Letzte Mahd auf 5cm Höhe",
          "Wintervorbereitung",
          "Geräte reinigen und einlagern",
          "Frostschutz für empfindliche Bereiche"
        ]
      }
    ]
  };
};

// Enhanced AI-powered lawn problem analysis with comprehensive solutions
export const analyzeLawnProblem = async (
  problem: string,
  hasImage: boolean = false
): Promise<{ success: boolean; analysis?: string; error?: string }> => {
  try {
    console.log('Analyzing lawn problem with AI:', problem);
    console.log('Calling Supabase function: analyze-lawn-problem');
    
    const { data, error } = await supabase.functions.invoke('analyze-lawn-problem', {
      body: {
        problem,
        hasImage
      }
    });

    console.log('Lawn problem analysis response:', data, error);

    if (error) {
      console.error('Lawn problem analysis error:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }

    if (!data || !data.analysis) {
      console.error('No analysis data received:', data);
      throw new Error('No analysis data received from API');
    }

    return {
      success: true,
      analysis: data.analysis
    };

  } catch (error) {
    console.error('Lawn problem analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
