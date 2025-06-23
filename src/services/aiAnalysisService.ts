
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

// Only used as absolute fallback - this should rarely be called
export const getMockAnalysis = (): AIAnalysisResult => {
  const randomHealth = Math.floor(Math.random() * 30) + 60; // 60-90
  const randomIssues = [
    'Eisenmangel durch pH-Wert Probleme',
    'Pilzbefall durch zu viel Feuchtigkeit',
    'Schädlingsbefall durch Engerlinge',
    'Mooswachstum durch schlechte Drainage',
    'Unkrautdruck durch dünne Grasnarbe',
    'Trockenschäden durch unzureichende Bewässerung'
  ];
  
  const selectedIssues = randomIssues.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);
  
  return {
    overallHealth: randomHealth,
    issues: selectedIssues.map(issue => ({
      issue,
      confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
      severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
      timeline: `${Math.floor(Math.random() * 4) + 1}-${Math.floor(Math.random() * 4) + 4} Wochen`,
      cost: `${Math.floor(Math.random() * 50) + 15}-${Math.floor(Math.random() * 50) + 40}€`,
      products: ['Dünger', 'Rasensamen', 'Bodenverbesserer'].sort(() => 0.5 - Math.random()).slice(0, 2),
      recommendations: [
        'Sofortmaßnahme basierend auf Bilderkennung',
        'Spezifische Behandlung für erkanntes Problem',
        'Präventive Maßnahmen für die Zukunft'
      ]
    })),
    generalRecommendations: [
      'Regelmäßige Kontrolle der Rasengesundheit',
      'Angepasste Pflege je nach Jahreszeit',
      'Professionelle Bodenanalyse empfohlen'
    ],
    seasonalAdvice: [
      '🌱 Frühling: Nachsaat und erste Düngung',
      '☀️ Sommer: Intensive Bewässerung',
      '🍂 Herbst: Vorbereitung auf Winter'
    ],
    preventionTips: [
      'Regelmäßiges Mähen',
      'Angemessene Bewässerung',
      'Rechtzeitige Problemerkennung'
    ],
    monthlyPlan: [
      { month: 'Aktueller Monat', tasks: ['Sofortmaßnahmen umsetzen', 'Fortschritt dokumentieren'] },
      { month: 'Nächster Monat', tasks: ['Ergebnisse überprüfen', 'Anpassungen vornehmen'] }
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
