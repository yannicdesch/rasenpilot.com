
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
    // First, upload the image to Supabase Storage
    const fileName = `lawn-analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${imageFile.name.split('.').pop()}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lawn-images')
      .upload(fileName, imageFile);

    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    // Get the public URL of the uploaded image
    const { data: urlData } = supabase.storage
      .from('lawn-images')
      .getPublicUrl(fileName);

    if (!urlData.publicUrl) {
      throw new Error('Failed to get image URL');
    }

    // Call the Edge Function for AI analysis
    const { data, error } = await supabase.functions.invoke('analyze-lawn-image', {
      body: {
        imageUrl: urlData.publicUrl,
        grassType,
        lawnGoal
      }
    });

    if (error) {
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

// Fallback function for when AI analysis is not available
export const getMockAnalysis = (): AIAnalysisResult => {
  return {
    overallHealth: 7,
    issues: [
      {
        issue: "Nährstoffmangel",
        confidence: 0.75,
        severity: "medium",
        recommendations: [
          "Führe einen Bodentest durch, um festzustellen, welche Nährstoffe fehlen.",
          "Verwende einen ausgewogenen Rasendünger mit NPK-Verhältnis 3-1-2.",
          "Dünge während der Hauptwachstumsperiode alle 6-8 Wochen."
        ]
      },
      {
        issue: "Leichter Unkrautbefall",
        confidence: 0.65,
        severity: "low",
        recommendations: [
          "Entferne Unkraut händisch oder mit selektiven Herbiziden.",
          "Stärke deinen Rasen durch richtige Pflege.",
          "Mähe regelmäßig, um die Samenbildung zu verhindern."
        ]
      }
    ],
    generalRecommendations: [
      "Bewässere tief aber weniger häufig für besseres Wurzelwachstum",
      "Mähe regelmäßig und halte die optimale Schnitthöhe ein",
      "Führe im Herbst eine Bodenbelüftung durch"
    ]
  };
};
