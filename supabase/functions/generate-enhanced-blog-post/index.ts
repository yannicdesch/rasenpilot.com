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
    const { topic, keywords, contentStrategy, localSEO, seoOptimizations } = await req.json();
    console.log('Generating enhanced SEO blog post for topic:', topic);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `Sie sind ein SEO-Experte und Fachautor für Rasenpflege mit 10+ Jahren Erfahrung. Erstellen Sie einen hochmodernen, SEO-optimierten deutschen Blogbeitrag, der darauf ausgelegt ist, bei Google auf Platz 1 zu ranken.

ZIELGRUPPE & KONTEXT:
- Deutsche Hobbygärtner, Hausbesitzer und Rasenbegeisterte
- Primär Desktop- und Mobile-Nutzer
- Suchintention: Informational + Commercial Investigation
- Lokaler Fokus: ${localSEO === 'germany' ? 'Deutschland allgemein' : localSEO}

CONTENT-STRATEGIE: ${contentStrategy}
${contentStrategy === 'problem-solution' ? '- Identifiziere ein spezifisches Rasenproblem und biete eine Schritt-für-Schritt-Lösung' : ''}
${contentStrategy === 'how-to' ? '- Erstelle eine detaillierte Schritt-für-Schritt-Anleitung mit visuell beschreibbaren Elementen' : ''}
${contentStrategy === 'comparison' ? '- Vergleiche verschiedene Methoden/Produkte mit Pro/Contra-Listen' : ''}
${contentStrategy === 'seasonal' ? '- Fokussiere auf jahreszeitliche Besonderheiten und Timing' : ''}
${contentStrategy === 'local-seo' ? '- Integriere lokale Besonderheiten und regionale Klimabedingungen' : ''}
${contentStrategy === 'featured-snippet' ? '- Optimiere für Featured Snippets mit Listen, Tabellen und direkten Antworten' : ''}

SEO-OPTIMIERTE STRUKTUR (2000+ Wörter):
1. Einleitung mit Hook (Problem + Lösung preview)
2. Hauptinhalt mit H2-H6 Hierarchie
3. Praktische Tipps mit Bulletpoints
4. Häufige Fehler und wie man sie vermeidet
5. Profi-Tipps und Expertenwissen
6. FAQ-Bereich (mindestens 5 Fragen für Schema.org)
7. Fazit mit starkem Call-to-Action

ERWEITERTE SEO-ANFORDERUNGEN:
- Keyword-Dichte: 1.5-2.5% für Hauptkeyword
- LSI-Keywords natürlich einbauen
- Interne Verlinkungsvorschläge
- Schema.org Markup für Artikel + FAQ
- Meta-Tags optimiert für CTR
- Readability Score > 60 (Deutsche Sprache)
- E-A-T Signale einbauen

LOKALE SEO (falls aktiviert):
- Regionale Klimabedingungen erwähnen
- Lokale Besonderheiten (Bodentypen, Wetter)
- Deutsche Jahreszeiten und Timing
- Lokale Fachbegriffe und Dialekte berücksichtigen

TECHNISCHE ANFORDERUNGEN:
- H1: Hauptkeyword + emotionaler Trigger
- H2-H6: Semantisch verwandte Keywords
- Meta-Title: < 60 Zeichen, CTR-optimiert
- Meta-Description: < 160 Zeichen, Call-to-Action
- FAQ mit exakten Frage-Antwort-Paaren

Antworten Sie AUSSCHLIESSLICH mit folgendem JSON-Format:
{
  "title": "SEO-optimierter H1-Titel mit Hauptkeyword und emotionalem Trigger",
  "meta_title": "CTR-optimierter Meta-Titel (max 60 Zeichen)",
  "meta_description": "Überzeugende Meta-Beschreibung mit CTA (max 160 Zeichen)",
  "content": "Vollständiger 2000+ Wörter Blogbeitrag mit Markdown H2-H6 Struktur",
  "excerpt": "Prägnante Zusammenfassung (180-200 Zeichen)",
  "keywords": ["hauptkeyword", "lsi-keyword1", "lsi-keyword2", "long-tail-keyword1", "long-tail-keyword2"],
  "internal_links": [
    {"text": "Anchor Text", "url": "/blog/verwandter-artikel", "context": "Kontext der Verlinkung"},
    {"text": "Zweiter Link", "url": "/blog/weiterer-artikel", "context": "Verlinkungskontext"}
  ],
  "faq": [
    {"question": "Präzise Frage mit Keyword?", "answer": "Detaillierte, SEO-optimierte Antwort"},
    {"question": "Zweite häufige Frage?", "answer": "Umfassende Antwort mit Mehrwert"},
    {"question": "Dritte Expertenfrage?", "answer": "Professionelle Antwort mit Autorität"},
    {"question": "Vierte praktische Frage?", "answer": "Handlungsorientierte Antwort"},
    {"question": "Fünfte Detailfrage?", "answer": "Tiefgehende Expertenantwort"}
  ],
  "schema": {
    "article": {
      "@type": "Article",
      "headline": "Artikel-Überschrift",
      "author": {"@type": "Person", "name": "Rasenpilot Experte"},
      "datePublished": "2025-01-30",
      "dateModified": "2025-01-30",
      "description": "Artikel-Beschreibung"
    },
    "faq": {
      "@type": "FAQPage",
      "mainEntity": []
    }
  },
  "call_to_action": "Überzeugender CTA für kostenlose Rasenanalyse",
  "read_time": "Geschätzte Lesezeit in Minuten",
  "local_business_schema": {
    "@type": "Service",
    "name": "KI-Rasenanalyse",
    "areaServed": "Deutschland",
    "provider": {"@type": "Organization", "name": "Rasenpilot"}
  }
}`;

    const userPrompt = `Erstellen Sie einen hochwertig SEO-optimierten Blogbeitrag zum Thema: "${topic}"

ZIEL-KEYWORDS: ${keywords ? keywords.join(', ') : 'Rasenpflege, Rasen, Gartenpflege'}

SPEZIALISIERUNG für ${localSEO}:
${localSEO === 'berlin' ? '- Berliner Stadtklima und sandige Böden berücksichtigen' : ''}
${localSEO === 'bavaria' ? '- Bayerisches Klima und alpine Besonderheiten einbauen' : ''}
${localSEO === 'nrw' ? '- Rheinische Tiefebene und Industrieregion-Aspekte' : ''}
${localSEO === 'baden-wurttemberg' ? '- Süddeutsches Klima und Bodensee-Region' : ''}

CONTENT-FOKUS:
- Deutsche Klimazonen und Wetterbesonderheiten
- Rasenpflege-Jahreskalender für Deutschland
- Typische deutsche Rasenprobleme und Lösungen
- Produktempfehlungen für deutsche Märkte
- Rechtliche Aspekte (Lärmschutz, Nachbarschaftsrecht)

SEO-ZIELE:
- Position 1 Ranking für "${topic}"
- Featured Snippet Optimierung
- Hohe User Engagement Signale
- Maximale Click-Through-Rate
- Lokale Suchrelevanz für ${localSEO}

Der Artikel soll deutschen Hobbygärtnern dabei helfen, ihre spezifischen Rasenprobleme zu lösen und dabei subtil auf unser kostenloses KI-Rasenanalyse-Tool hinweisen.

WICHTIG: Der Content muss einzigartig, fachlich korrekt und hochwertig sein. Verwenden Sie aktuelle Rasenpflege-Trends und wissenschaftlich fundierte Informationen.`;

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
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 4000,
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
    console.log('Generated enhanced blog post content length:', content.length);
    
    let blogData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      blogData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      
      // Enhanced post-processing for better SEO
      if (seoOptimizations.enableSchemaMarkup && blogData.faq) {
        blogData.schema.faq.mainEntity = blogData.faq.map((item: any) => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.answer
          }
        }));
      }
      
    } catch (parseError) {
      console.error('Failed to parse enhanced AI response:', parseError);
      throw new Error('Failed to parse enhanced blog content');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        blogPost: blogData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating enhanced blog post:', error);
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