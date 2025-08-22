import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    console.log('Processing job:', jobId);
    
    if (!jobId) {
      throw new Error('Job ID is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get job details
    console.log('Fetching job details...');
    const { data: job, error: jobError } = await supabase
      .from('analysis_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      console.error('Job not found:', jobError);
      throw new Error('Job not found');
    }

    console.log('Job details:', job);

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      await supabase
        .from('analysis_jobs')
        .update({ 
          status: 'failed',
          error_message: 'OpenAI API key not configured',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);
      throw new Error('OpenAI API key not configured');
    }

    // Get signed URL for image
    console.log('Getting signed URL for image:', job.image_path);
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('lawn-images')
      .createSignedUrl(job.image_path, 3600); // 1 hour expiry

    if (urlError || !signedUrlData?.signedUrl) {
      console.error('Failed to get signed URL:', urlError);
      await supabase
        .from('analysis_jobs')
        .update({ 
          status: 'failed',
          error_message: 'Failed to access image',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);
      throw new Error('Failed to access image');
    }

    console.log('Image URL obtained, calling OpenAI...');

    // Extract zipCode from job metadata
    let zipCode = null;
    let weatherContext = '';
    try {
      const metadata = typeof job.metadata === 'string' ? JSON.parse(job.metadata) : job.metadata;
      zipCode = metadata?.zipCode;
      console.log('Extracted zipCode from metadata:', zipCode);
      
      // Fetch weather data if zipCode is available
      if (zipCode) {
        console.log('Fetching weather data for enhanced analysis...');
        const { data: weatherResult, error: weatherError } = await supabase.functions.invoke('get-weather-data', {
          body: { zipCode, countryCode: 'DE' }
        });
        
        if (!weatherError && weatherResult?.success) {
          const weather = weatherResult.data;
          weatherContext = `

=== UMFASSENDE WETTER- & BODENANALYSE FÜR RASENPFLEGE ===

AKTUELLE BEDINGUNGEN:
• Lufttemperatur: ${weather.current.temp}°C
• Geschätzte Bodentemperatur: ${weather.current.soilTemp}°C  
• Wetter: ${weather.current.condition}
• Luftfeuchtigkeit: ${weather.current.humidity}%
• Taupunkt: ${weather.current.dewPoint}°C
• Windgeschwindigkeit: ${weather.current.windSpeed} km/h
• Luftdruck: ${weather.current.pressure} hPa
• UV-Index: ${weather.current.uvIndex}/11
• Verdunstungsrate: ${weather.current.evapotranspiration} mm/Tag

OPTIMALE PFLEGEZEITPUNKTE:
• Mähen: ${weather.current.lawnCareConditions.mowing ? '✅ OPTIMAL' : '❌ UNGÜNSTIG'} (Luftfeuchtigkeit < 70%, wenig Wind)
• Düngen: ${weather.current.lawnCareConditions.fertilizing ? '✅ OPTIMAL' : '❌ UNGÜNSTIG'} (50-85% Luftfeuchtigkeit ideal)  
• Bewässerung: ${weather.current.lawnCareConditions.watering ? '🚨 NOTWENDIG' : '✅ AUSREICHEND'} (Verdunstungsrate: ${weather.current.evapotranspiration} mm/Tag)
• Nachsaat: ${weather.current.lawnCareConditions.seeding ? '✅ OPTIMAL' : '❌ UNGÜNSTIG'} (8-25°C ideal für Keimung)

5-TAGE DETAILPROGNOSE:
${weather.forecast.map(f => `• ${f.day}: ${f.high}°C/${f.low}°C (Boden: ~${f.soilTemp}°C), ${f.condition}, ${f.chanceOfRain}% Regen, Verdunstung: ${f.evapotranspiration}mm`).join('\n')}

WICHTIGER HINWEIS: Berücksichtigen Sie diese präzisen Wetterdaten für alle Pflegeempfehlungen. Geben Sie spezifische Zeitpunkte und Bedingungen für Bewässerung, Düngung und Rasenpflege basierend auf den aktuellen und prognostizierten Werten an.`;
        } else {
          console.log('Could not fetch weather data:', weatherError);
        }
      }
    } catch (e) {
      console.log('Could not fetch weather data:', e);
    }

    // Call OpenAI Vision API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `Sie sind ein professioneller Rasen- und Gartenexperte mit 20+ Jahren Erfahrung. Analysieren Sie das Rasenbild wissenschaftlich präzise und differenzieren Sie die Bewertung stark basierend auf den tatsächlichen Gegebenheiten.${weatherContext}

SCORING-SYSTEM (0-100 Punkte):
🟢 EXZELLENT (90-100): Perfekte Dichte, kräftiges Grün, keine sichtbaren Probleme, gleichmäßiger Wuchs
🟡 SEHR GUT (80-89): Gute Dichte, gesundes Grün, minimale Probleme, meist gleichmäßig
🟠 GUT (70-79): Mäßige Dichte, akzeptables Grün, einige sichtbare Probleme, ungleichmäßige Bereiche
🔴 BEFRIEDIGEND (60-69): Schwache Dichte, blasses/gelbes Grün, mehrere Probleme, viele kahle Stellen
⚫ MANGELHAFT (40-59): Sehr schwache Dichte, braune/gelbe Bereiche, erhebliche Probleme, dominante Kahlstellen
💀 KRITISCH (0-39): Rasen größtenteils tot/braun, extreme Probleme, Kompletterneuerung nötig

BEWERTUNGSKRITERIEN (jeweils 0-20 Punkte):
1. GRASDICHTE: Lücken, Kahlstellen, Gleichmäßigkeit der Narbe
2. FARBQUALITÄT: Grünton, Vitalität, Verfärbungen, Gelbstich
3. GESUNDHEIT: Krankheiten, Schädlinge, Pilzbefall, Stress-Symptome
4. UNKRAUTFREIHEIT: Moos, Klee, Löwenzahn, andere Fremdpflanzen
5. BODENZUSTAND: Verdichtung, Drainage, Nährstoffversorgung (erkennbar)

WICHTIG: Seien Sie kritisch und nutzen Sie die VOLLE BANDBREITE von 0-100. Ein durchschnittlicher Rasen sollte 60-70 Punkte erhalten, nicht 80+!

Antworten Sie als JSON-Objekt:
{
  "overall_health": "Prozentuale Gesundheit (0-100)",
  "grass_condition": "Detaillierte Beschreibung des Rasenzustands auf Deutsch",
  "problems": ["Liste identifizierter Probleme mit Fachbegriffen"],
  "recommendations": ["Konkrete, umsetzbare Empfehlungen mit Mengenangaben und Produktnamen"],
  "timeline": "Realistischer Zeitrahmen für sichtbare Verbesserungen",
  "score": "Gesamtbewertung (0-100) - NUTZEN SIE DIE VOLLE BANDBREITE!",
  "weather_recommendations": ["Wetterbasierte Timing-Empfehlungen mit konkreten Uhrzeiten und Bedingungen"],
  "detailed_scoring": {
    "grass_density": "Punkte für Grasdichte (0-20)",
    "color_quality": "Punkte für Farbqualität (0-20)", 
    "health_status": "Punkte für Gesundheit (0-20)",
    "weed_freedom": "Punkte für Unkrautfreiheit (0-20)",
    "soil_condition": "Punkte für Bodenzustand (0-20)"
  }
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Bitte analysiere diesen Rasen professionell. Rasentyp: ${job.grass_type || 'unbekannt'}, Ziel: ${job.lawn_goal || 'Allgemeine Verbesserung'}. ${zipCode ? `Standort: PLZ ${zipCode}.` : ''} Gib eine detaillierte Analyse auf Deutsch und berücksichtige bei verfügbaren Wetterdaten die optimalen Zeitpunkte für Pflegemaßnahmen.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: signedUrlData.signedUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIResult = await openAIResponse.json();
    console.log('OpenAI response received');

    let analysisResult;
    try {
      // Try to parse the JSON response from OpenAI
      const content = openAIResult.choices[0].message.content;
      analysisResult = JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response
      console.log('Using fallback analysis structure');
      analysisResult = {
        overall_health: "75",
        grass_condition: openAIResult.choices[0].message.content,
        problems: ["Analyse konnte nicht vollständig strukturiert werden"],
        recommendations: ["Detaillierte Analyse im Grass Condition Feld verfügbar"],
        timeline: "2-4 Wochen",
        score: "75"
      };
    }

    // Update job with results
    console.log('Updating job with analysis results...');
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
      console.error('Failed to update job:', updateError);
      throw new Error('Failed to save analysis results');
    }

    // Process analysis completion - create reminders and update highscore
    if (job.user_id) {
      try {
        console.log('Processing analysis completion for user:', job.user_id);
        
        // Extract structured data from analysisResult
        const score = parseInt(analysisResult.score) || 75;
        const summaryShort = analysisResult.grass_condition || 'Analyse abgeschlossen';
        const step1 = Array.isArray(analysisResult.recommendations) ? analysisResult.recommendations[0] : 'Regelmäßig mähen';
        const step2 = Array.isArray(analysisResult.recommendations) ? analysisResult.recommendations[1] : 'Bewässern nach Bedarf';
        const step3 = Array.isArray(analysisResult.recommendations) ? analysisResult.recommendations[2] : 'Düngen im Frühjahr';
        
        const { data: completionResult, error: completionError } = await supabase.rpc('handle_analysis_completion', {
          p_user_id: job.user_id,
          p_score: score,
          p_summary_short: summaryShort,
          p_density_note: analysisResult.detailed_scoring?.grass_density || 'Gute Dichte',
          p_sunlight_note: 'Ausreichend Sonneneinstrahlung',
          p_moisture_note: 'Moderate Feuchtigkeit',
          p_soil_note: analysisResult.detailed_scoring?.soil_condition || 'Stabiler Boden',
          p_step_1: step1,
          p_step_2: step2,
          p_step_3: step3,
          p_image_url: job.image_path
        });

        if (completionError) {
          console.error('Error in analysis completion:', completionError);
        } else {
          console.log('Analysis completion processed successfully:', completionResult);
        }
      } catch (error) {
        console.error('Failed to process analysis completion:', error);
        // Don't throw here - we want the analysis to still succeed even if reminder creation fails
      }
    }

    console.log('Analysis completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Analysis completed successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== PROCESS ANALYSIS ERROR ===');
    console.error('Error details:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to process analysis' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});