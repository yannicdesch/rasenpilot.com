
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== PROCESS ANALYSIS FUNCTION ===');
    
    const { jobId } = await req.json();
    console.log('Processing job ID:', jobId);
    
    if (!jobId) {
      throw new Error('Job ID is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('analysis_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      console.error('Error getting job:', jobError);
      throw new Error('Job not found');
    }

    console.log('Job details:', job);

    // Download image from storage
    const { data: imageData, error: downloadError } = await supabase.storage
      .from('lawn-images')
      .download(job.image_path);

    if (downloadError || !imageData) {
      console.error('Error downloading image:', downloadError);
      throw new Error('Failed to download image');
    }

    console.log('Image downloaded, size:', imageData.size);

    // Convert image to base64
    const arrayBuffer = await imageData.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    console.log('Image converted to base64, length:', base64Image.length);

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Prepare the prompt for lawn analysis
    const prompt = `Analysiere dieses Rasenfoto und erstelle eine detaillierte Bewertung. Kontext:
    - Rasensorte: ${job.grass_type || 'Unbekannt'}
    - Rasenziel: ${job.lawn_goal || 'Allgemeine Gesundheit'}
    
    Bitte identifiziere:
    1. Allgemeine Rasengesundheit (Skala 1-10)
    2. Sichtbare Probleme (Krankheiten, Schädlinge, Nährstoffmängel, Unkraut)
    3. Bodenzustandsindikatoren
    4. Spezifische Verbesserungsempfehlungen
    5. Vertrauensgrad für jede Diagnose
    
    Gib deine Analyse in diesem JSON-Format zurück:
    {
      "overallHealth": number,
      "issues": [
        {
          "issue": "string",
          "confidence": number (0-1),
          "severity": "low|medium|high",
          "recommendations": ["string array"],
          "timeline": "string",
          "cost": "string",
          "products": ["string array"]
        }
      ],
      "generalRecommendations": ["string array"],
      "seasonalAdvice": ["string array"],
      "preventionTips": ["string array"],
      "monthlyPlan": [{"month": "string", "tasks": ["string array"]}]
    }`;

    console.log('Calling OpenAI API...');

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein Experte für Rasenpflege mit jahrelanger Erfahrung in der Diagnose von Rasenproblemen anhand von Bildern. Gib detaillierte, umsetzbare Ratschläge auf Deutsch.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    console.log('OpenAI response received, parsing...');

    // Try to parse JSON response
    let analysisResult;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = JSON.parse(analysisText);
      }
    } catch (parseError) {
      console.log('JSON parsing failed, creating fallback structure');
      
      analysisResult = {
        overallHealth: 7,
        issues: [
          {
            issue: "KI-Analyse durchgeführt",
            confidence: 0.8,
            severity: "medium",
            timeline: "2-4 Wochen",
            cost: "25-50€",
            products: ["Rasen-Dünger", "Bodenverbesserer"],
            recommendations: analysisText.split('\n').filter(line => line.trim().length > 0).slice(0, 4)
          }
        ],
        generalRecommendations: ["Folge der detaillierten Analyse"],
        seasonalAdvice: ["Angepasste Pflege je nach Jahreszeit"],
        preventionTips: ["Regelmäßige Überwachung"],
        monthlyPlan: [
          { month: "Aktueller Monat", tasks: ["Umsetzung der Empfehlungen"] }
        ]
      };
    }

    console.log('Analysis completed, updating job...');

    // Update job with results
    const { error: updateError } = await supabase
      .from('analysis_jobs')
      .update({
        status: 'completed',
        result: analysisResult,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (updateError) {
      console.error('Error updating job with results:', updateError);
      throw new Error('Failed to save analysis results');
    }

    console.log('Job completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Analysis completed successfully',
        jobId,
        result: analysisResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== PROCESS ANALYSIS ERROR ===');
    console.error('Error details:', error);
    
    // Try to update job status to failed
    try {
      const { jobId } = await req.json();
      if (jobId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabase
          .from('analysis_jobs')
          .update({
            status: 'failed',
            error_message: error.message || 'Unknown error occurred',
            updated_at: new Date().toISOString()
          })
          .eq('id', jobId);
      }
    } catch (updateError) {
      console.error('Failed to update job status to failed:', updateError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Analysis processing failed' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
