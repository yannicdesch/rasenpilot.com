
import { supabase } from '@/integrations/supabase/client';

export interface AIAnalysisResult {
  overallHealth: number;
  issues: Array<{
    issue: string;
    confidence: number;
    severity: 'low' | 'medium' | 'high';
    recommendations: string[];
  }>;
  generalRecommendations: string[];
}

export interface AnalysisResponse {
  success: boolean;
  analysis?: AIAnalysisResult;
  error?: string;
}

export const analyzeImageWithAI = async (
  imageFile: File,
  grassType?: string,
  lawnGoal?: string
): Promise<AnalysisResponse> => {
  try {
    console.log('Starting AI image analysis with OpenAI...');
    
    // First, upload the image to Supabase Storage
    const fileName = `lawn-analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${imageFile.name.split('.').pop()}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lawn-images')
      .upload(fileName, imageFile);

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

    return data as AnalysisResponse;

  } catch (error) {
    console.error('AI Analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Enhanced mock analysis for demo purposes
export const getMockAnalysis = (): AIAnalysisResult => {
  return {
    overallHealth: 7,
    issues: [
      {
        issue: "Nährstoffmangel erkannt",
        confidence: 0.85,
        severity: "medium",
        recommendations: [
          "Führe einen Bodentest durch, um festzustellen, welche Nährstoffe fehlen.",
          "Verwende einen ausgewogenen Rasendünger mit NPK-Verhältnis 3-1-2.",
          "Dünge während der Hauptwachstumsperiode alle 6-8 Wochen.",
          "Achte auf gleichmäßige Verteilung des Düngers."
        ]
      },
      {
        issue: "Leichter Unkrautbefall",
        confidence: 0.65,
        severity: "low",
        recommendations: [
          "Entferne Unkraut händisch oder mit selektiven Herbiziden.",
          "Stärke deinen Rasen durch richtige Pflege.",
          "Mähe regelmäßig, um die Samenbildung zu verhindern.",
          "Verbessere die Rasendichte durch Nachsaat."
        ]
      },
      {
        issue: "Ungleichmäßige Bewässerung",
        confidence: 0.72,
        severity: "medium",
        recommendations: [
          "Überprüfe dein Bewässerungssystem auf gleichmäßige Verteilung.",
          "Bewässere früh morgens für beste Wasseraufnahme.",
          "Verwende 2-3 cm Wasser pro Woche.",
          "Achte auf Bereiche mit Staunässe oder Trockenheit."
        ]
      }
    ],
    generalRecommendations: [
      "Bewässere tief aber weniger häufig für besseres Wurzelwachstum",
      "Mähe regelmäßig und halte die optimale Schnitthöhe von 3-4 cm ein",
      "Führe im Herbst eine Bodenbelüftung durch",
      "Plane eine Nachsaat für kahle Stellen im Frühjahr oder Herbst",
      "Verwende organischen Dünger für nachhaltige Nährstoffversorgung"
    ]
  };
};

// AI-powered lawn problem analysis
export const analyzeLawnProblem = async (
  problem: string,
  hasImage: boolean = false
): Promise<{ success: boolean; analysis?: string; error?: string }> => {
  try {
    console.log('Analyzing lawn problem with AI:', problem);
    
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
