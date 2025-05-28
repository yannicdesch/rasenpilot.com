
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { problem, hasImage } = await req.json();

    if (!problem) {
      return new Response(
        JSON.stringify({ error: 'Problem description is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const prompt = `Du bist ein professioneller Rasenexperte.

Ein Nutzer hat folgendes Rasenproblem gemeldet:

---
Beschreibung: "${problem}"
---

${hasImage ? 'Falls ein Bild vorhanden ist, kannst du davon ausgehen, dass es das beschriebene Problem visuell unterstützt. (Die direkte Bildanalyse ist aktuell noch deaktiviert.)' : ''}

Bitte liefere:

1. Eine einfache **Diagnose**
2. Eine **Schritt-für-Schritt Anleitung** zur Behandlung
3. **Vorbeugende Tipps**
4. (Optional) **Produktvorschläge** – nur allgemeine Produkttypen, keine Marken

Sprich freundlich und einfach, als würdest du einem Hobbygärtner helfen.

Strukturiere deine Antwort genau so:

🌱 **Vermutete Diagnose**
[Deine Diagnose hier]

🛠️ **Empfohlene Behandlung**
- Maßnahme 1
- Maßnahme 2
- Maßnahme 3

💡 **Vorbeugung**
- Tipp 1
- Tipp 2

🛒 **Mögliche Produkte**
- Produkttyp A
- Produkttyp B`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Du bist ein professioneller Rasenexperte, der Hobbygärtnern auf Deutsch hilft.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ analysis }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in analyze-lawn-problem function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
