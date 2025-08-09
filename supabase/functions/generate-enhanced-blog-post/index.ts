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

    const systemPrompt = `Sie sind ein Elite-SEO-Strategist und Rasenpflege-Experte mit 15+ Jahren Erfahrung im digitalen Marketing. Ihr Ziel: Blogbeiträge erstellen, die Google's Ranking-Algorithmus dominieren und Featured Snippets erobern.

🎯 ZIELGRUPPE & PSYCHOLOGIE:
- Deutsche Hobbygärtner (25-65 Jahre), Hausbesitzer und Rasenbegeisterte
- Suchintention-Mix: 70% Informational, 20% Commercial Investigation, 10% Transactional
- Lokaler Fokus: ${localSEO === 'germany' ? 'Deutschland (alle Klimazonen)' : localSEO}
- Pain Points: Zeitdruck, mangelnde Expertise, Kostenkontrolle, Nachhaltigkeitsbedenken

🚀 CONTENT-STRATEGIE: ${contentStrategy}
${contentStrategy === 'problem-solution' ? '- Problem-Agitation-Solution Framework mit emotionalem Storytelling' : ''}
${contentStrategy === 'how-to' ? '- Step-by-Step Anleitung mit visuellen Checkpoints und Troubleshooting' : ''}
${contentStrategy === 'comparison' ? '- Datengestützte Vergleichstabellen mit Kosten-Nutzen-Analyse' : ''}
${contentStrategy === 'seasonal' ? '- Jahreszeitliche Strategien mit regionalem Klimafokus und Timing-Optimization' : ''}
${contentStrategy === 'local-seo' ? '- Geo-spezifische Lösungen mit lokalen Experten-Insights und Wetterdaten' : ''}
${contentStrategy === 'featured-snippet' ? '- Snippet-Hunter Format: Direkte Antworten, Listen, Tabellen für Position 0' : ''}

📈 ERWEITERTE SEO-ARCHITECTURE (2500+ Wörter):
1. Hook-Einleitung mit Statistik/Überraschung (150 Wörter)
2. Problem-Definition mit Kosten (200 Wörter)
3. Lösung-Framework mit Quick-Wins (400 Wörter)
4. Detaillierte Schritt-für-Schritt Anleitung (800 Wörter)
5. Profi-Geheimnisse und Insider-Tipps (300 Wörter)
6. Fehlervermeidung und Troubleshooting (250 Wörter)
7. Tool/Produkt-Empfehlungen mit Begründung (200 Wörter)
8. FAQ-Sektion (10 Fragen für maximale Snippet-Chance) (300 Wörter)
9. Zusammenfassung mit starkem CTA (100 Wörter)

🔥 GOOGLE-DOMINANZ-FAKTOREN:
- Keyword-Dichte: 1.8-2.2% (optimal für 2025 Algorithmus)
- Semantic Keywords: 15+ LSI/NLP-verwandte Begriffe
- User Intent Signale: Transactional CTAs einbauen
- E-A-T Powerboost: Expertise-Signale, Datenquellen, Studien-Referenzen
- Content Freshness: Aktuelle Trends und 2025-spezifische Informationen
- Featured Snippet Gold: Strukturierte Antworten, Tabellen, nummerierte Listen
- Click-Through-Rate: Emotionale Trigger in Title/Description

🌍 LOKALE SEO-POWERPACK:
- Mikroklima-spezifische Ratschläge (Temperatur, Niederschlag, Bodenbeschaffenheit)
- Regionale Händler-Empfehlungen und Verfügbarkeit
- Lokale Rechtsbestimmungen (Lärmschutz, Nachbarschaftsrecht)
- Dialekt-sensitive Fachbegriffe und umgangssprachliche Varianten
- Saisonale Timing-Optimierung nach deutschen Klimazonen

🎖️ E-A-T AUTHORITY-BUILDING:
- Wissenschaftliche Studien und Forschungsergebnisse zitieren
- Experten-Meinungen und Fachverbände erwähnen
- Messbare Ergebnisse und Erfolgsstatistiken
- Langzeiterfahrungen und bewährte Praktiken
- Fehleranalysen und Learnings aus der Praxis

📱 TECHNICAL SEO-EXCELLENCE:
- Core Web Vitals Optimierung (Hinweise für schnelles Laden)
- Mobile-First Content-Struktur
- Erweiterte Schema.org Markup (Article + FAQ + HowTo + LocalBusiness)
- Internal Linking mit strategischen Anchor Texts
- Content Clusters für thematische Autorität

🏆 FEATURED SNIPPET GOLD-STANDARD:
Strukturieren Sie den Content für maximale Snippet-Chancen:
- Direkte Antworten in den ersten 40-60 Wörtern nach Überschriften
- Nummerierte Listen für How-To Snippets
- Tabellen für Vergleichs-Snippets  
- Definition-Boxen für Was-ist-Snippets

Antworten Sie AUSSCHLIESSLICH mit folgendem erweiterten JSON-Format:
{
  "title": "SEO-Hammer-Titel mit Power-Keyword und emotionalem CTR-Booster",
  "meta_title": "Click-Magnet Meta-Titel mit Keyword (max 58 Zeichen)",
  "meta_description": "Conversion-optimierte Meta-Description mit starkem CTA und Urgency (max 158 Zeichen)",
  "content": "Elite 2500+ Wörter Content mit Markdown H2-H6 Struktur, Featured Snippet Optimization und E-A-T Signalen",
  "excerpt": "Power-Zusammenfassung mit Hook und Benefit-Promise (190-200 Zeichen)",
  "keywords": {
    "primary": "hauptkeyword-phrase",
    "secondary": ["lsi-keyword1", "lsi-keyword2", "semantic-keyword1"],
    "long_tail": ["long-tail-phrase1", "intent-specific-phrase2"],
    "local": ["regional-keyword1", "geo-specific-phrase"],
    "trending": ["2025-trend-keyword", "aktueller-begriff"]
  },
  "internal_links": [
    {"text": "Strategic Anchor Text", "url": "/blog/cluster-artikel-1", "context": "Content Cluster Context", "intent": "commercial"},
    {"text": "Authority Link Text", "url": "/blog/expert-artikel", "context": "E-A-T Boosting Context", "intent": "informational"},
    {"text": "Conversion Link", "url": "/features", "context": "Product Integration", "intent": "transactional"}
  ],
  "faq": [
    {"question": "Direkte Keyword-Frage für Featured Snippet?", "answer": "Präzise 40-60 Wort Antwort mit Keyword-Optimierung", "snippet_optimized": true},
    {"question": "Kosten/Preis-spezifische Frage?", "answer": "Commercial Intent Antwort mit Wert-Proposition", "snippet_optimized": true},
    {"question": "Wie-lange/Wann Timing-Frage?", "answer": "Zeitspezifische Expertenantwort mit konkreten Zeiträumen", "snippet_optimized": true},
    {"question": "Warum/Was-ist Definitions-Frage?", "answer": "Authority-Building Definition mit wissenschaftlicher Basis", "snippet_optimized": false},
    {"question": "Wo/Welche Regional-Frage?", "answer": "Geo-spezifische Antwort mit lokalen Bezügen", "snippet_optimized": false},
    {"question": "Problem/Troubleshooting-Frage?", "answer": "Lösungsorientierte Expertenantwort mit Sofortmaßnahmen", "snippet_optimized": true},
    {"question": "Tool/Produkt-Empfehlungs-Frage?", "answer": "Kaufberatung mit konkreten Empfehlungen und Begründung", "snippet_optimized": false},
    {"question": "Fortgeschrittenen-Experten-Frage?", "answer": "Deep-Dive Antwort für Profis und Enthusiasten", "snippet_optimized": false},
    {"question": "Häufiger Anfänger-Fehler-Frage?", "answer": "Fehlervermeidung mit präventiven Maßnahmen", "snippet_optimized": true},
    {"question": "Trends/Zukunft-orientierte Frage?", "answer": "2025-Trends und innovative Techniken", "snippet_optimized": false}
  ],
  "schema": {
    "article": {
      "@type": "Article",
      "@context": "https://schema.org",
      "headline": "Vollständiger Artikel-Titel",
      "author": {
        "@type": "Person", 
        "name": "Dr. Rasenpilot Expert",
        "jobTitle": "Rasenpflege-Spezialist",
        "knowsAbout": ["Rasenpflege", "Gartenbau", "Botanik"],
        "affiliation": {"@type": "Organization", "name": "Rasenpilot"}
      },
      "publisher": {
        "@type": "Organization",
        "name": "Rasenpilot",
        "logo": {"@type": "ImageObject", "url": "https://rasenpilot.de/logo.png"}
      },
      "datePublished": "2025-01-30",
      "dateModified": "2025-01-30",
      "description": "SEO-optimierte Artikel-Beschreibung",
      "wordCount": "2500+",
      "articleSection": "Rasenpflege",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "inLanguage": "de-DE",
      "mainEntityOfPage": {"@type": "WebPage", "@id": "https://rasenpilot.de/blog/slug"}
    },
    "faq": {
      "@type": "FAQPage",
      "@context": "https://schema.org",
      "mainEntity": []
    },
    "howto": {
      "@type": "HowTo",
      "@context": "https://schema.org",
      "name": "Schritt-für-Schritt Anleitung",
      "description": "Detaillierte Anleitung für optimale Rasenpflege",
      "step": []
    },
    "local_business": {
      "@type": "LocalBusiness",
      "@context": "https://schema.org",
      "name": "Rasenpilot KI-Analyse",
      "description": "Professionelle KI-gestützte Rasenanalyse",
      "areaServed": "Deutschland",
      "serviceType": "Rasenpflege-Beratung"
    }
  },
  "content_freshness": {
    "update_triggers": ["saisonale_änderungen", "neue_forschung", "trend_updates"],
    "refresh_frequency": "quarterly",
    "evergreen_score": 85
  },
  "eat_signals": {
    "expertise_indicators": ["wissenschaftliche_studien", "experten_zitate", "daten_belege"],
    "authority_markers": ["jahre_erfahrung", "fachverbände", "referenzen"],
    "trustworthiness_elements": ["transparente_methoden", "kontakt_information", "qualitäts_garantie"]
  },
  "technical_seo": {
    "core_web_vitals_hints": ["image_optimization", "lazy_loading", "critical_css"],
    "mobile_optimization": ["responsive_tables", "touch_friendly", "fast_loading"],
    "accessibility_score": 95
  },
  "user_intent_matching": {
    "primary_intent": "informational",
    "secondary_intent": "commercial_investigation", 
    "intent_signals": ["kosten", "vergleich", "test", "erfahrung", "anleitung"],
    "conversion_triggers": ["kostenlos", "sofort", "garantiert", "expert", "geheim"]
  },
  "call_to_action": "🚀 Jetzt kostenlose KI-Rasenanalyse starten und Ihren Traum-Rasen in 30 Tagen erreichen!",
  "read_time": "Geschätzte Lesezeit in Minuten",
  "content_cluster": {
    "parent_topic": "Rasenpflege Masterguide",
    "related_subtopics": ["subtopic1", "subtopic2", "subtopic3"],
    "cluster_strength": "high"
  },
  "local_business_schema": {
    "@type": "Service",
    "@context": "https://schema.org",
    "name": "KI-Rasenanalyse ${localSEO}",
    "areaServed": "${localSEO}",
    "provider": {"@type": "Organization", "name": "Rasenpilot"},
    "serviceType": "Digitale Rasenpflege-Beratung",
    "description": "Professionelle KI-gestützte Rasenanalyse für optimale Rasenpflege"
  }
}`;

    const userPrompt = `🎯 GOOGLE-RANKING-MISSION: Position #1 für "${topic}"

PRIMÄRE KEYWORDS: ${keywords ? keywords.join(', ') : 'Rasenpflege, Rasen, Gartenpflege'}

🌍 GEO-TARGETING für ${localSEO}:
${localSEO === 'berlin' ? '- Berliner Stadtklima: Kontinentalklima, sandige Böden, Trockenheitsresistenz, urbane Luftverschmutzung' : ''}
${localSEO === 'bavaria' ? '- Bayerisches Klima: Alpine Einflüsse, kalkhaltige Böden, Föhn-Wetterlagen, Höhenlagen-Besonderheiten' : ''}
${localSEO === 'nrw' ? '- NRW-Spezifika: Rheinisches Tiefland, lehmige Böden, Industrieregion-Herausforderungen, höhere Niederschläge' : ''}
${localSEO === 'baden-wurttemberg' ? '- Baden-Württemberg: Süddeutsches Klima, Bodensee-Einfluss, vulkanische Böden, Weinbauklima' : ''}
${localSEO === 'hamburg' ? '- Hamburg: Norddeutsches Meeresklima, hohe Luftfeuchtigkeit, sandige Geest-Böden, Windexposition' : ''}
${localSEO === 'germany' ? '- Deutschland-weite Klimazonen: Kontinental bis maritim, verschiedene Bodentypen, regionale Besonderheiten' : ''}

🚀 CONTENT-EXCELLENCE-MATRIX:
- AUTHORITY: Wissenschaftliche Studien, Expertenquellen, DIN-Normen für Rasenpflege
- FRESHNESS: 2025-Trends, innovative Techniken, aktuellste Forschungsergebnisse  
- DEPTH: 2500+ Wörter mit granularen Details und Insider-Wissen
- ENGAGEMENT: Emotionale Trigger, Storytelling, persönliche Erfahrungsberichte
- CONVERSION: Strategische CTA-Platzierung, Vertrauensaufbau, Social Proof

🔍 FEATURED SNIPPET TARGETS:
- Erstelle "Definition-Boxes" für Was-ist-Fragen
- Nummerierte Listen für Schritt-Anleitungen  
- Vergleichstabellen für Produkt/Methoden-Snippets
- FAQ-Optimierung für Voice Search und Mobile

💎 E-A-T POWERHOUSE:
- Experten-Credentials: "15+ Jahre Rasenpflege-Erfahrung", "Zertifizierter Gartenbau-Spezialist"
- Studien-Referenzen: Deutsche Gartenbauwissenschaft, Universitäts-Forschung
- Messbare Ergebnisse: "98% Erfolgsrate", "Über 10.000 zufriedene Kunden"
- Transparenz: Methoden-Offenlegung, Quellenangaben, Kontakt-Informationen

🎖️ TECHNICAL SEO GOLDSTANDARD:
- Schema.org Triple-Stack: Article + FAQ + HowTo + LocalBusiness
- Internal Linking Strategy: Content Cluster Navigation
- Core Web Vitals: Performance-Hinweise für Entwickler
- Mobile-First: Touch-optimierte Tabellen und Listen

🌟 USER EXPERIENCE SIGNALS:
- Dwell Time Optimization: Fesselnder Content mit Cliffhangern
- Bounce Rate Reduction: Interne Verlinkung zu verwandten Themen
- Social Sharing Triggers: Teilbare Listen und überraschende Fakten
- Return Visitor Incentives: Saisonale Updates und Follow-Up Inhalte

MISSION: Erstelle einen Content-Masterpiece, der sowohl Google's Algorithmus als auch echte Nutzer begeistert und zum Branchenstandard für deutsche Rasenpflege-Inhalte wird.`;

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
            content: userPrompt
          }
        ],
        max_tokens: 6000,
        temperature: 0.4
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
      
      // Advanced SEO post-processing and optimization
      if (seoOptimizations.enableSchemaMarkup && blogData.faq) {
        // Enhanced FAQ Schema with Featured Snippet optimization
        blogData.schema.faq.mainEntity = blogData.faq.map((item: any) => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.answer,
            "author": {
              "@type": "Person",
              "name": "Dr. Rasenpilot Expert"
            }
          }
        }));

        // Add HowTo Schema if content contains steps
        if (blogData.content.includes('Schritt') || blogData.content.includes('Anleitung')) {
          const steps = extractStepsFromContent(blogData.content);
          blogData.schema.howto = {
            "@type": "HowTo",
            "@context": "https://schema.org",
            "name": blogData.title,
            "description": blogData.excerpt,
            "step": steps.map((step: string, index: number) => ({
              "@type": "HowToStep",
              "position": index + 1,
              "name": `Schritt ${index + 1}`,
              "text": step
            }))
          };
        }

        // Enhanced content freshness tracking
        blogData.content_freshness = {
          ...blogData.content_freshness,
          last_updated: new Date().toISOString(),
          next_update: getNextUpdateDate(blogData.content_freshness?.refresh_frequency || 'quarterly'),
          update_priority: calculateUpdatePriority(blogData.keywords, blogData.local_seo)
        };

        // E-A-T score calculation
        blogData.eat_score = calculateEATScore(blogData.content, blogData.eat_signals);
        
        // Featured snippet optimization score
        blogData.snippet_optimization_score = calculateSnippetScore(blogData.content, blogData.faq);
      }

// Helper function to extract steps from content
function extractStepsFromContent(content: string): string[] {
  const stepRegex = /(?:##\s*)?(?:Schritt\s*\d+|[0-9]+\.)\s*[:\-]?\s*(.+?)(?=(?:##\s*)?(?:Schritt\s*\d+|[0-9]+\.|\n\n|$))/gi;
  const matches = content.match(stepRegex) || [];
  return matches.map(step => step.replace(/^(?:##\s*)?(?:Schritt\s*\d+|[0-9]+\.)\s*[:\-]?\s*/, '').trim());
}

// Calculate next update date based on frequency
function getNextUpdateDate(frequency: string): string {
  const now = new Date();
  switch (frequency) {
    case 'monthly': return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
    case 'quarterly': return new Date(now.setMonth(now.getMonth() + 3)).toISOString();
    case 'biannual': return new Date(now.setMonth(now.getMonth() + 6)).toISOString();
    default: return new Date(now.setMonth(now.getMonth() + 3)).toISOString();
  }
}

// Calculate update priority based on keywords and local SEO
function calculateUpdatePriority(keywords: any, localSeo: any): number {
  let priority = 1;
  if (keywords.trending?.length > 0) priority += 2;
  if (localSeo?.region !== 'germany') priority += 1;
  return Math.min(5, priority);
}

// Calculate E-A-T score
function calculateEATScore(content: string, eatSignals: any): number {
  let score = 0;
  
  // Expertise signals
  if (content.includes('Studie') || content.includes('Forschung')) score += 20;
  if (content.includes('DIN') || content.includes('wissenschaftlich')) score += 15;
  if (content.includes('Experte') || content.includes('Fachmann')) score += 10;
  
  // Authority signals  
  if (content.includes('Jahre Erfahrung') || content.includes('Fachverband')) score += 20;
  if (content.includes('Test') || content.includes('Vergleich')) score += 15;
  
  // Trust signals
  if (content.includes('Garantie') || content.includes('geprüft')) score += 15;
  if (content.includes('Referenz') || content.includes('Bewertung')) score += 10;
  
  return Math.min(100, score);
}

// Calculate Featured Snippet optimization score
function calculateSnippetScore(content: string, faq: any[]): number {
  let score = 0;
  
  // List presence
  if (content.includes('\n1.') || content.includes('- ')) score += 25;
  
  // Table presence  
  if (content.includes('|') && content.includes('---')) score += 20;
  
  // FAQ optimization
  const snippetOptimizedFAQs = faq.filter(f => f.snippet_optimized).length;
  score += Math.min(30, snippetOptimizedFAQs * 5);
  
  // Direct answer patterns
  if (content.includes('Die Antwort ist') || content.includes('Das Ergebnis:')) score += 15;
  
  return Math.min(100, score);
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