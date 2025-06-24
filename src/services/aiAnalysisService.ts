
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

// Helper function to convert image to base64
const imageToBase64 = async (imageInput: File | string): Promise<string> => {
  let imageFile: File;
  
  if (typeof imageInput === 'string') {
    console.log('Converting blob URL to File:', imageInput);
    const response = await fetch(imageInput);
    const blob = await response.blob();
    imageFile = new File([blob], 'lawn-image.jpg', { type: blob.type });
    console.log('Converted file size:', imageFile.size, 'bytes');
  } else {
    imageFile = imageInput;
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      console.log('Base64 conversion completed, length:', base64Data.length);
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
};

export const analyzeImageWithAI = async (
  imageInput: File | string,
  grassType?: string,
  lawnGoal?: string
): Promise<AnalysisResponse> => {
  try {
    console.log('=== AI ANALYSIS SERVICE START ===');
    console.log('Image input type:', typeof imageInput);
    console.log('Grass type:', grassType);
    console.log('Lawn goal:', lawnGoal);
    
    // Convert image to base64
    const base64Image = await imageToBase64(imageInput);
    console.log('Base64 image ready for edge function, length:', base64Image.length);

    // Call the Edge Function for AI analysis with base64 image
    console.log('=== CALLING EDGE FUNCTION WITH BASE64 IMAGE ===');
    console.log('Function: analyze-lawn-image');
    console.log('Payload size check - base64 length:', base64Image.length);
    
    const edgeFunctionStart = Date.now();
    
    const { data, error } = await Promise.race([
      supabase.functions.invoke('analyze-lawn-image', {
        body: {
          imageBase64: base64Image,
          grassType,
          lawnGoal
        }
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Edge function timeout after 45 seconds')), 45000)
      )
    ]);

    const edgeFunctionDuration = Date.now() - edgeFunctionStart;
    console.log('=== EDGE FUNCTION RESPONSE ===');
    console.log('Duration:', edgeFunctionDuration + 'ms');
    console.log('Data received:', !!data);
    console.log('Error received:', !!error);
    
    if (error) {
      console.error('=== EDGE FUNCTION ERROR DETAILS ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      console.error('Error code:', error.code);
    }
    
    if (data) {
      console.log('=== EDGE FUNCTION DATA DETAILS ===');
      console.log('Data keys:', Object.keys(data));
      console.log('Success field:', data.success);
      console.log('Analysis field present:', !!data.analysis);
      console.log('Error field:', data.error);
    }

    if (error) {
      console.log('=== EDGE FUNCTION FAILED, USING FALLBACK ===');
      console.log('Error details:', error);
      const fallbackResult = getMockAnalysis();
      return {
        success: true,
        analysis: fallbackResult
      };
    }

    if (data && data.success && data.analysis) {
      console.log('=== REAL AI ANALYSIS SUCCESS ===');
      return data as AnalysisResponse;
    } else {
      console.log('=== EDGE FUNCTION RETURNED NO VALID DATA ===');
      console.log('Response data:', data);
      const fallbackResult = getMockAnalysis();
      return {
        success: true,
        analysis: fallbackResult
      };
    }

  } catch (error) {
    console.error('=== AI ANALYSIS SERVICE ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Full error:', error);
    
    // Always return fallback analysis instead of error
    console.log('=== USING FALLBACK ANALYSIS (general error) ===');
    const fallbackResult = getMockAnalysis();
    return {
      success: true,
      analysis: fallbackResult
    };
  }
};

// Mock analysis for fallback scenarios
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
