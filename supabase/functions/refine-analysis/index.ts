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
    const { jobId, lastFertilized, lawnUsage, sunExposure, puddlesAfterRain } = await req.json();
    if (!jobId) throw new Error('Job ID is required');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) throw new Error('OpenAI API key not configured');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the existing job
    const { data: job, error: jobError } = await supabase
      .from('analysis_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) throw new Error('Job not found');

    // Get signed URL for image
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('lawn-images')
      .createSignedUrl(job.image_path, 3600);

    if (urlError || !signedUrlData?.signedUrl) throw new Error('Failed to access image');

    const existingResult = job.result || {};
    const score = existingResult.score || 65;

    // Build root-cause context
    const sunLabel = sunExposure === 'full_sun' ? 'Vollsonne (6+ Stunden)' 
      : sunExposure === 'partial_shade' ? 'Halbschatten (3-6 Stunden)' 
      : sunExposure === 'full_shade' ? 'Viel Schatten (unter 3 Stunden)' : 'unbekannt';
    
    const puddleLabel = puddlesAfterRain === 'yes' ? 'Ja, Pfützen bilden sich nach Regen (Drainage-Problem wahrscheinlich)' 
      : puddlesAfterRain === 'no' ? 'Nein, Wasser versickert gut' : 'unbekannt';

    const fertLabel = lastFertilized === 'this_year' ? 'Dieses Jahr gedüngt'
      : lastFertilized === 'last_year' ? 'Letztes Jahr gedüngt' 
      : lastFertilized === 'never' ? 'Noch nie gedüngt' : 'unbekannt';

    const usageLabel = lawnUsage === 'family' ? 'Familienrasen (Kinder spielen, häufige Nutzung → Verdichtungsgefahr)'
      : lawnUsage === 'display' ? 'Repräsentationsrasen (wenig Belastung, hoher ästhetischer Anspruch)'
      : lawnUsage === 'pets' ? 'Hunde & Tiere (Urinflecken, starke Belastung)' : 'unbekannt';

    const systemPrompt = `Du bist ein professioneller GaLaBau-Experte. Du hast bereits eine Rasenanalyse durchgeführt und der Nutzer hat jetzt zusätzliche Informationen gegeben. Aktualisiere NUR die Empfehlungen basierend auf der ROOT-CAUSE-ANALYSE.

ZUSÄTZLICHE NUTZERANGABEN:
• Sonneneinstrahlung: ${sunLabel}
• Pfützen nach Regen: ${puddleLabel}
• Letzte Düngung: ${fertLabel}
• Rasen-Nutzung: ${usageLabel}

ROOT-CAUSE REGELN:
- Halbschatten/Schatten + Pfützen = Drainage-Problem ist primäre Moosursache
- Vollsonne + nie gedüngt = Nährstoffmangel ist primäre Ursache für blassen Rasen
- Familienrasen + Pfützen = Bodenverdichtung durch Belastung → Aerifizierung empfehlen
- Hunde/Tiere = Urinflecken berücksichtigen, kalkhaltige Nachsaat empfehlen
- Repräsentation + Schatten = schattenverträgliche Rasenmischung empfehlen

FORMAT für jede Empfehlung:
"Weil [Ursache], empfehlen wir [Maßnahme] — am besten [Zeitpunkt]."

BISHERIGES ERGEBNIS:
Score: ${score}/100
Zusammenfassung: ${existingResult.summary_short || ''}
Probleme: ${JSON.stringify(existingResult.problems || [])}

Antworte NUR mit einem validen JSON-Objekt:
{
  "step_1": "Weil [Ursache], empfehlen wir [Maßnahme] — am besten [Zeitpunkt].",
  "step_2": "Weil [Ursache], empfehlen wir [Maßnahme] — am besten [Zeitpunkt].",
  "step_3": "Weil [Ursache], empfehlen wir [Maßnahme] — am besten [Zeitpunkt].",
  "root_causes": ["Hauptursache 1", "Hauptursache 2"],
  "product_1_asin": "ASIN",
  "product_1_name": "Produktname",
  "product_1_reason": "Weil [Ursache]",
  "product_2_asin": "ASIN",
  "product_2_name": "Produktname",
  "product_2_reason": "Weil [Ursache]"
}

BEVORZUGTE PRODUKTE:
- Stickstoffmangel → Turbogrün Rasendünger (ASIN: B0CHN4LSWQ)
- Moos oder Unkraut → COMPO gegen Moos (ASIN: B00UT2LM2O)
- Kahle Stellen → Rasensamen Nachsaat (ASIN: B00IUPTZVC)
- Bodenverdichtung → Gardena Rasenlüfter (ASIN: B0001E3W7S)
- Trockenstress → Gardena Bewässerungscomputer (ASIN: B0749P42HT)
- Pilzbefall → COMPO FLORANID (ASIN: B00FDFI4Z2)`;

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
              { type: 'text', text: 'Aktualisiere die Empfehlungen basierend auf den neuen Nutzerangaben. Behalte den Score bei, ändere nur die Schritte und Produktempfehlungen.' },
              { type: 'image_url', image_url: { url: signedUrlData.signedUrl, detail: 'low' } }
            ]
          }
        ],
        max_tokens: 800,
        temperature: 0.3
      }),
    });

    if (!openAIResponse.ok) throw new Error(`OpenAI API error: ${openAIResponse.status}`);

    const openAIResult = await openAIResponse.json();
    const content = openAIResult.choices[0].message.content;

    let refinedResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      refinedResult = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      throw new Error('Failed to parse AI response');
    }

    // Merge refined steps into existing result (keep score, update steps & products)
    const updatedResult = {
      ...existingResult,
      step_1: refinedResult.step_1 || existingResult.step_1,
      step_2: refinedResult.step_2 || existingResult.step_2,
      step_3: refinedResult.step_3 || existingResult.step_3,
      root_causes: refinedResult.root_causes || [],
      product_1_asin: refinedResult.product_1_asin || existingResult.product_1_asin,
      product_1_name: refinedResult.product_1_name || existingResult.product_1_name,
      product_1_reason: refinedResult.product_1_reason || existingResult.product_1_reason,
      product_2_asin: refinedResult.product_2_asin || existingResult.product_2_asin,
      product_2_name: refinedResult.product_2_name || existingResult.product_2_name,
      product_2_reason: refinedResult.product_2_reason || existingResult.product_2_reason,
      refined: true,
      refined_context: { sunExposure, puddlesAfterRain, lastFertilized, lawnUsage }
    };

    // Update the job with refined result
    await supabase.from('analysis_jobs').update({
      result: updatedResult,
      updated_at: new Date().toISOString()
    }).eq('id', jobId);

    return new Response(
      JSON.stringify({ success: true, result: updatedResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Refine analysis error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Failed to refine analysis' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
