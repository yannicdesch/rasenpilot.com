import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const getSeason = (): string => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'Frühling — Wachstumsphase, erste Düngung empfohlen, Vertikutieren möglich';
  if (month >= 5 && month <= 7) return 'Sommer — Bewässerung kritisch, Hitzestress möglich, nicht düngen bei über 25°C';
  if (month >= 8 && month <= 10) return 'Herbst — Wintervorbereitung, letzte Düngung mit Kalium, Nachsaat noch möglich';
  return 'Winter — Rasen schonen, nicht betreten bei Frost, keine Düngung';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== PROCESS ANALYSIS FUNCTION ===');
    
    const { jobId } = await req.json();
    console.log('Processing job:', jobId);
    
    if (!jobId) throw new Error('Job ID is required');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('analysis_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) throw new Error('Job not found');

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      await supabase.from('analysis_jobs').update({ status: 'failed', error_message: 'OpenAI API key not configured', updated_at: new Date().toISOString() }).eq('id', jobId);
      throw new Error('OpenAI API key not configured');
    }

    // Get signed URL for image
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('lawn-images')
      .createSignedUrl(job.image_path, 3600);

    if (urlError || !signedUrlData?.signedUrl) {
      await supabase.from('analysis_jobs').update({ status: 'failed', error_message: 'Failed to access image', updated_at: new Date().toISOString() }).eq('id', jobId);
      throw new Error('Failed to access image');
    }

    // Extract metadata
    let zipCode = null;
    let weatherContext = '';
    let isPremiumUser = false;
    try {
      const metadata = typeof job.metadata === 'string' ? JSON.parse(job.metadata) : job.metadata;
      zipCode = metadata?.zipCode;
      isPremiumUser = metadata?.isPremium === true;
    } catch {}

    // Check subscription tier from DB if user_id exists
    if (job.user_id && !isPremiumUser) {
      try {
        const { data: sub } = await supabase
          .from('subscribers')
          .select('subscription_tier, subscribed')
          .eq('user_id', job.user_id)
          .eq('subscribed', true)
          .single();
        if (sub && (sub.subscription_tier === 'premium' || sub.subscription_tier === 'pro')) {
          isPremiumUser = true;
        }
      } catch {}
    }

    // Fetch weather data
    if (zipCode) {
      try {
        const { data: weatherResult, error: weatherError } = await supabase.functions.invoke('get-weather-data', {
          body: { zipCode, countryCode: 'DE' }
        });
        if (!weatherError && weatherResult?.success) {
          const w = weatherResult.data;
          weatherContext = `

AKTUELLE BEDINGUNGEN:
• Lufttemperatur: ${w.current.temp}°C
• Geschätzte Bodentemperatur: ${w.current.soilTemp}°C
• Wetter: ${w.current.condition}
• Luftfeuchtigkeit: ${w.current.humidity}%
• UV-Index: ${w.current.uvIndex}/11
• Verdunstungsrate: ${w.current.evapotranspiration} mm/Tag

OPTIMALE PFLEGEZEITPUNKTE:
• Mähen: ${w.current.lawnCareConditions?.mowing ? '✅ OPTIMAL' : '❌ UNGÜNSTIG'} (Luftfeuchtigkeit < 70%, wenig Wind)
• Düngen: ${w.current.lawnCareConditions?.fertilizing ? '✅ OPTIMAL' : '❌ UNGÜNSTIG'} (50-85% Luftfeuchtigkeit ideal)
• Bewässerung: ${w.current.lawnCareConditions?.watering ? '🚨 NOTWENDIG' : '✅ AUSREICHEND'}
• Nachsaat: ${w.current.lawnCareConditions?.seeding ? '✅ OPTIMAL' : '❌ UNGÜNSTIG'} (8-25°C ideal)

5-TAGE DETAILPROGNOSE:
${w.forecast?.map((f: any) => `• ${f.day}: ${f.high}°C/${f.low}°C, ${f.condition}, ${f.chanceOfRain}% Regen`).join('\n') || 'Nicht verfügbar'}`;
        }
      } catch {}
    }

    const season = getSeason();

    // Build prompt based on tier
    const basePrompt = `Du bist ein professioneller Rasen- und Gartenexperte mit 20+ Jahren Erfahrung in Deutschland, Österreich und der Schweiz. Analysiere das Rasenbild wissenschaftlich präzise.

WICHTIGE REGELN:
- Antworte immer auf Deutsch mit du (nicht Sie)
- Sei kritisch: Ein durchschnittlicher Rasen bekommt 55-65 Punkte, nicht 80+
- Falls kein Rasen erkennbar oder Bildqualität zu schlecht: Antworte nur mit {"error": "Kein Rasen erkennbar — bitte ein besseres Foto hochladen"}

AKTUELLE BEDINGUNGEN:
Jahreszeit: ${season}
PLZ: ${zipCode || 'unbekannt'}
Rasentyp: ${job.grass_type || 'unbekannt'}
Ziel: ${job.lawn_goal || 'Allgemeine Verbesserung'}
${weatherContext}

SCORING-SYSTEM (0-100 Punkte):
90-100: Perfekte Dichte, kräftiges Grün, keine Probleme
80-89: Gute Dichte, gesundes Grün, minimale Probleme
70-79: Mäßige Dichte, einige sichtbare Probleme
60-69: Schwache Dichte, blasses Grün, mehrere Probleme
40-59: Sehr schwache Dichte, braune Bereiche
0-39: Rasen größtenteils tot, Kompletterneuerung nötig

BEWERTUNGSKRITERIEN (je 0-20 Punkte):
1. Grasdichte: Lücken, Kahlstellen, Gleichmäßigkeit
2. Farbqualität: Grünton, Vitalität, Verfärbungen
3. Gesundheit: Krankheiten, Schädlinge, Pilzbefall
4. Unkrautfreiheit: Moos, Klee, Löwenzahn
5. Bodenzustand: Verdichtung, Drainage, Nährstoffe

BEVORZUGTE PRODUKTE (verwende diese bei Empfehlungen):
- Stickstoffmangel → Turbogrün Rasendünger (ASIN: B0CHN4LSWQ)
- Moos oder Unkraut → COMPO gegen Moos (ASIN: B00UT2LM2O)
- Kahle Stellen → Rasensamen Nachsaat (ASIN: B00IUPTZVC)
- Bodenverdichtung → Gardena Rasenlüfter (ASIN: B0001E3W7S)
- Trockenstress → Gardena Bewässerungscomputer (ASIN: B0749P42HT)
- Pilzbefall → COMPO FLORANID (ASIN: B00FDFI4Z2)

BESCHREIBE KONKRET was du auf dem Foto siehst.
ERKLÄRE WARUM jedes Problem besteht.
NENNE SPEZIFISCHE Mengenangaben (g/m²) bei Produktempfehlungen.`;

    let jsonInstruction: string;
    let maxTokens: number;

    if (isPremiumUser) {
      maxTokens = 2500;
      jsonInstruction = `

Antworte NUR mit einem validen JSON-Objekt (kein Markdown, kein Text davor/danach):
{
  "score": 62,
  "summary_short": "2-3 Sätze Zusammenfassung",
  "grass_condition": "Ausführliche Beschreibung (mind. 3-4 Sätze)",
  "problems": ["Problem 1 mit Ursache", "Problem 2", "Problem 3"],
  "recommendations": ["Empfehlung 1 mit Produkt und Menge", "Empfehlung 2"],
  "step_1": "Maßnahme diese Woche mit konkretem Produkt",
  "step_2": "Maßnahme in 2 Wochen",
  "step_3": "Maßnahme in 4 Wochen",
  "timeline": "Realistischer Zeitrahmen für Verbesserung",
  "detailed_scoring": {
    "grass_density": 12,
    "color_quality": 14,
    "health_status": 13,
    "weed_freedom": 11,
    "soil_condition": 12
  },
  "density_note": "Bewertung der Grasdichte",
  "moisture_note": "Bewertung der Feuchtigkeit",
  "soil_note": "Bewertung des Bodens",
  "sunlight_note": "Bewertung der Lichtverhältnisse",
  "diseases": [
    {
      "name": "Moosbefall",
      "severity": "Mittel",
      "description": "Beschreibung und Ursache",
      "treatment": "Behandlung",
      "product_asin": "B00UT2LM2O"
    }
  ],
  "product_1_asin": "B0CHN4LSWQ",
  "product_1_name": "Turbogrün Rasendünger",
  "product_1_reason": "Warum dieses Produkt",
  "product_2_asin": "B00UT2LM2O",
  "product_2_name": "COMPO gegen Moos",
  "product_2_reason": "Warum dieses Produkt",
  "weather_recommendations": ["Wetterbasierte Empfehlung mit Wochentag und Uhrzeit"],
  "next_analysis_weeks": 4
}`;
    } else {
      maxTokens = 800;
      jsonInstruction = `

Antworte NUR mit einem validen JSON-Objekt (kein Markdown, kein Text davor/danach):
{
  "score": 62,
  "summary_short": "Dein Rasen hat leichten Stickstoffmangel und erste Anzeichen von Moos. Mit gezielter Pflege kannst du deinen Score in 4-6 Wochen auf 75+ bringen.",
  "problems": ["Problem 1 mit Ursache", "Problem 2"],
  "step_1": "Wichtigste Maßnahme diese Woche mit konkretem Produkt",
  "step_2": "Zweite Maßnahme in 2 Wochen",
  "step_3": "Dritte Maßnahme in 4 Wochen",
  "product_1_asin": "B0CHN4LSWQ",
  "product_1_name": "Turbogrün Rasendünger",
  "product_1_reason": "Behebt deinen Stickstoffmangel",
  "upgrade_teaser": "Premium zeigt dir den vollständigen 5-Tage Wetterplan und detaillierte Bodenanalyse"
}`;
    }

    const systemPrompt = basePrompt + jsonInstruction;

    // Call OpenAI
    console.log(`Calling OpenAI (${isPremiumUser ? 'PREMIUM' : 'FREE'} tier, max_tokens: ${maxTokens})...`);
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analysiere diesen Rasen professionell und detailliert. Rasentyp: ${job.grass_type || 'unbekannt'}, Ziel: ${job.lawn_goal || 'Allgemeine Verbesserung'}. ${zipCode ? `Standort: PLZ ${zipCode}.` : ''} Beschreibe konkret was du auf dem Foto siehst und gib spezifische, umsetzbare Empfehlungen.`
              },
              {
                type: 'image_url',
                image_url: { url: signedUrlData.signedUrl, detail: 'high' }
              }
            ]
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.3
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIResult = await openAIResponse.json();
    const content = openAIResult.choices[0].message.content;
    console.log('OpenAI response received, length:', content?.length);

    let analysisResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysisResult = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      console.log('JSON parse failed, using fallback');
      analysisResult = {
        score: 65,
        summary_short: content || 'Analyse abgeschlossen',
        problems: ['Detaillierte Analyse verfügbar'],
        step_1: 'Regelmäßig mähen',
        step_2: 'Bewässern nach Bedarf',
        step_3: 'Düngen im Frühjahr',
      };
    }

    // Check if analysis returned an error (no lawn detected)
    if (analysisResult.error) {
      console.log('Analysis returned error:', analysisResult.error);
      // Still save it so the frontend can display the error
      await supabase.from('analysis_jobs').update({
        status: 'completed',
        result: analysisResult,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).eq('id', jobId);

      return new Response(
        JSON.stringify({ success: true, message: 'Analysis completed with error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update job with results
    await supabase.from('analysis_jobs').update({
      status: 'completed',
      result: analysisResult,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq('id', jobId);

    // Process analysis completion for logged-in users
    if (job.user_id) {
      try {
        const score = parseInt(analysisResult.score) || 65;
        const { error: completionError } = await supabase.rpc('handle_analysis_completion', {
          p_user_id: job.user_id,
          p_score: score,
          p_summary_short: analysisResult.summary_short || analysisResult.grass_condition || 'Analyse abgeschlossen',
          p_density_note: analysisResult.density_note || String(analysisResult.detailed_scoring?.grass_density || ''),
          p_sunlight_note: analysisResult.sunlight_note || '',
          p_moisture_note: analysisResult.moisture_note || '',
          p_soil_note: analysisResult.soil_note || '',
          p_step_1: analysisResult.step_1 || (Array.isArray(analysisResult.recommendations) ? analysisResult.recommendations[0] : '') || '',
          p_step_2: analysisResult.step_2 || (Array.isArray(analysisResult.recommendations) ? analysisResult.recommendations[1] : '') || '',
          p_step_3: analysisResult.step_3 || (Array.isArray(analysisResult.recommendations) ? analysisResult.recommendations[2] : '') || '',
          p_image_url: job.image_path
        });
        if (completionError) console.error('Completion error:', completionError);
      } catch (e) {
        console.error('Failed to process completion:', e);
      }
    }

    console.log('Analysis completed successfully');
    return new Response(
      JSON.stringify({ success: true, message: 'Analysis completed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== PROCESS ANALYSIS ERROR ===', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Failed to process analysis' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
