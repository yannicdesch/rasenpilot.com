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
    const { topic, keywords } = await req.json();
    console.log('Generating blog post for topic:', topic);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `Du bist ein SEO-Experte und Fachautor für Rasenpflege. Erstelle einen detaillierten, SEO-optimierten deutschen Blogbeitrag.

WICHTIGE REGELN:
- Durchgehend informelle Du-Ansprache (NIEMALS Sie/Ihnen/Ihr als Anrede)
- Kein Markdown: Keine ** für Fettdruck, keine [Text](#) Links, keine --- Linien
- Schreibe reinen Fließtext mit HTML-Tags: <h2>, <h3>, <strong>, <em>, <ul>, <li>, <a href="...">, <hr>
- Autor ist immer "Rasenpilot Team"
- Am Ende jedes Artikels diesen CTA einfügen:
  <p>Mach jetzt den ersten Schritt zu einem perfekten Rasen:</p>
  <a href="/lawn-analysis">Kostenlose Rasenanalyse starten →</a>

INHALTLICHE ANFORDERUNGEN:
- Ton: Freundlich, hilfsreich, fachkundig, Du-Form
- Zielgruppe: Hobbygärtner, Hausbesitzer, Rasenliebhaber
- Länge: 800-1.500 Wörter
- Sprache: Klar, strukturiert, Deutsch

SEO-OPTIMIERTE STRUKTUR:
1. Einleitender Hook (Problem/Nutzen ansprechen)
2. Hauptinhalt mit <h2>/<h3> Überschriften
3. Praktische Tipps und Schritt-für-Schritt Anleitungen
4. FAQ-Bereich mit häufigen Fragen
5. Fazit mit Call-to-Action (Link zu /lawn-analysis)

Antworte nur mit folgendem JSON-Format:
{
  "title": "SEO-optimierter Titel mit Hauptkeyword",
  "meta_title": "SEO Meta-Titel (max 60 Zeichen)",
  "meta_description": "SEO Meta-Beschreibung (max 160 Zeichen)",
  "content": "Vollständiger Blogbeitrag-Inhalt mit HTML-Formatierung, Du-Form, CTA am Ende",
  "excerpt": "Kurze Zusammenfassung (150-200 Zeichen)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "faq": [
    {"question": "Häufige Frage 1?", "answer": "Detaillierte Antwort"},
    {"question": "Häufige Frage 2?", "answer": "Detaillierte Antwort"}
  ],
  "call_to_action": "Spezifischer CTA Text",
  "read_time": "Geschätzte Lesezeit in Minuten"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Erstellen Sie einen SEO-optimierten Blogbeitrag zum Thema: "${topic}". 
            
Verwenden Sie diese Keywords: ${keywords ? keywords.join(', ') : 'Rasenpflege, Rasen, Gartenpflege'}

Berücksichtigen Sie:
- Deutsche Klimabedingungen und Jahreszeiten
- Typische Rasenprobleme in Deutschland
- Praktische Umsetzbarkeit für Hobbygärtner
- Aktuelle Rasenpflege-Trends und -Methoden

Der Artikel soll Hobbygärtnern dabei helfen, ihre Rasenfläche zu verbessern und dabei auf unser kostenloses Rasenanalyse-Tool hinweisen.`
          }
        ],
        max_tokens: 3000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;
    console.log('Generated blog post content length:', content.length);
    
    let blogData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      blogData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse blog content');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        blogPost: blogData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating blog post:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});