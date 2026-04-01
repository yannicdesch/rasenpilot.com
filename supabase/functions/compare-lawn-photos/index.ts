import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { oldImageBase64, newImageBase64, oldScore, grassType } = await req.json();

    if (!oldImageBase64 || !newImageBase64) {
      throw new Error('Beide Bilder werden benötigt');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const formatImage = (img: string) =>
      img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Du bist ein Experte für Rasenpflege. Vergleiche zwei Rasenfotos, die zu unterschiedlichen Zeitpunkten aufgenommen wurden. Foto 1 ist das ältere Foto, Foto 2 ist das neuere Foto. ${oldScore ? `Der letzte Score war ${oldScore}/100.` : ''} ${grassType ? `Grasart: ${grassType}.` : ''}

Analysiere:
- Geschätzte Score-Veränderung (z.B. +8 Punkte)
- Spezifische sichtbare Verbesserungen (Moosreduktion, Farbverbesserung, Dichte, Unkrautreduktion)
- Verbleibende Probleme die Aufmerksamkeit brauchen
- Eine motivierende Nachricht

Antworte NUR mit folgendem JSON-Format:
{
  "score_change": "+X oder -X (Zahl mit Vorzeichen)",
  "estimated_new_score": "Geschätzter neuer Score 0-100",
  "improvements": [
    {"area": "Bereich", "description": "Was sich verbessert hat", "percentage": "Verbesserung in %"}
  ],
  "remaining_issues": [
    {"issue": "Problem", "severity": "niedrig|mittel|hoch", "tip": "Konkreter Tipp"}
  ],
  "overall_assessment": "Kurze Gesamtbewertung des Fortschritts",
  "encouragement": "Motivierende Nachricht auf Deutsch",
  "comparison_summary": "Ein-Satz Zusammenfassung für Social Sharing"
}`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Vergleiche diese beiden Rasenfotos. Foto 1 (älter) und Foto 2 (neuer):' },
              { type: 'image_url', image_url: { url: formatImage(oldImageBase64) } },
              { type: 'image_url', image_url: { url: formatImage(newImageBase64) } }
            ]
          }
        ],
        max_tokens: 1200
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;

    let comparisonResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      comparisonResult = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      comparisonResult = {
        score_change: "+0",
        estimated_new_score: String(oldScore || 50),
        improvements: [{ area: "Allgemein", description: content, percentage: "—" }],
        remaining_issues: [],
        overall_assessment: content,
        encouragement: "Weiter so! Jeder Schritt zählt.",
        comparison_summary: "Fortschritt erkannt."
      };
    }

    return new Response(
      JSON.stringify({ success: true, comparison: comparisonResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
