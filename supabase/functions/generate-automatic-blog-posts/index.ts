import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pre-defined topics for automatic blog generation
const BLOG_TOPICS = [
  'Rasenpflege im Frühling', 'Rasenpflege im Sommer', 'Rasenpflege im Herbst', 'Rasenpflege im Winter',
  'Rasenmähen richtig gemacht', 'Optimale Rasendüngung', 'Effektive Rasenbewässerung', 'Rasenkrankheiten erkennen und behandeln',
  'Unkraut im Rasen bekämpfen', 'Moos im Rasen entfernen', 'Rasen vertikutieren Anleitung', 'Kahle Stellen im Rasen reparieren',
  'Rollrasen richtig verlegen', 'Rasen kalken wann und wie', 'Rasenpflege für Einsteiger', 'Profi Rasenpflege Geheimnisse',
  'Rasen im Schatten pflegen', 'Strapazierfähigen Rasen anlegen', 'Englischen Rasen erreichen', 'Mediterrane Rasenpflege',
  'Rasensamen richtig ausbringen', 'Robotermäher optimal einstellen', 'Rasen nach dem Winter reaktivieren', 'Automatische Bewässerung planen',
  'Biologische Rasenpflege ohne Chemie', 'Rasenpflege bei Trockenheit', 'Perfekte Rasenkante anlegen', 'Rasen richtig aerifizieren'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting automatic blog post generation...');
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    // Initialize Supabase client with service role for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update job status to 'processing'
    const { data: jobs, error: jobError } = await supabase
      .from('blog_generation_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1);

    if (jobError) {
      console.error('Error fetching jobs:', jobError);
      throw new Error('Failed to fetch pending jobs');
    }

    if (!jobs || jobs.length === 0) {
      console.log('No pending jobs found');
      return new Response(
        JSON.stringify({ success: true, message: 'No pending jobs' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const job = jobs[0];
    console.log('Processing job:', job.id);

    // Update job status to processing
    await supabase
      .from('blog_generation_jobs')
      .update({ status: 'processing' })
      .eq('id', job.id);

    // Check for recent blog posts to avoid duplicates
    const { data: recentPosts } = await supabase
      .from('blog_posts')
      .select('title, slug')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .order('created_at', { ascending: false });

    const recentTitles = recentPosts?.map(post => post.title.toLowerCase()) || [];
    const recentSlugs = recentPosts?.map(post => post.slug) || [];

    // Generate 2 blog posts per run
    const postsToGenerate = 2;
    const generatedPosts = [];

    for (let i = 0; i < postsToGenerate; i++) {
      try {
        // Select a random topic that hasn't been used recently
        let selectedTopic = '';
        let attempts = 0;
        
        do {
          selectedTopic = BLOG_TOPICS[Math.floor(Math.random() * BLOG_TOPICS.length)];
          attempts++;
        } while (recentTitles.some(title => title.includes(selectedTopic.toLowerCase())) && attempts < 10);

        console.log(`Generating post ${i + 1} for topic:`, selectedTopic);

        // Generate keywords based on topic
        const keywords = generateTopicKeywords(selectedTopic);

        // Call OpenAI to generate blog post
        const blogPost = await generateBlogPostWithAI(selectedTopic, keywords, openAIApiKey);

        // Create slug and ensure uniqueness
        let slug = createSlugFromTitle(blogPost.title);
        let uniqueSlug = slug;
        let slugCounter = 1;
        
        while (recentSlugs.includes(uniqueSlug)) {
          uniqueSlug = `${slug}-${slugCounter}`;
          slugCounter++;
        }

        // Save to database
        const { error: insertError } = await supabase
          .from('blog_posts')
          .insert([
            {
              title: blogPost.title,
              slug: uniqueSlug,
              excerpt: blogPost.excerpt,
              content: blogPost.content,
              category: mapTopicToCategory(selectedTopic),
              read_time: parseInt(blogPost.read_time) || Math.floor(blogPost.content.length / 1000) + 3,
              tags: blogPost.keywords.join(', '),
              date: new Date().toISOString().split('T')[0],
              author: 'Rasenpilot AI',
              status: 'published',
              seo: {
                metaTitle: blogPost.meta_title,
                metaDescription: blogPost.meta_description,
                keywords: blogPost.keywords.join(', ')
              }
            }
          ]);

        if (insertError) {
          console.error(`Error saving blog post ${i + 1}:`, insertError);
          continue;
        }

        generatedPosts.push({
          title: blogPost.title,
          slug: uniqueSlug,
          topic: selectedTopic
        });

        recentSlugs.push(uniqueSlug);
        
        console.log(`Successfully generated post ${i + 1}:`, blogPost.title);

        // Add delay between generations to respect API limits
        if (i < postsToGenerate - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

      } catch (error) {
        console.error(`Error generating post ${i + 1}:`, error);
        continue;
      }
    }

    // Update job status to completed
    await supabase
      .from('blog_generation_jobs')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        posts_generated: generatedPosts.length
      })
      .eq('id', job.id);

    console.log(`Automatic blog generation completed. Generated ${generatedPosts.length} posts.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        posts_generated: generatedPosts.length,
        posts: generatedPosts
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in automatic blog generation:', error);
    
    // Try to update job status to failed if we have access to supabase
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase
          .from('blog_generation_jobs')
          .update({ 
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: error.message
          })
          .eq('status', 'processing');
      }
    } catch (updateError) {
      console.error('Error updating job status:', updateError);
    }

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

async function generateBlogPostWithAI(topic: string, keywords: string[], openAIApiKey: string) {
  const systemPrompt = `Sie sind ein SEO-Experte und Fachautor für Rasenpflege. Erstellen Sie einen detaillierten, SEO-optimierten deutschen Blogbeitrag mit folgender Struktur:

INHALTLICHE ANFORDERUNGEN:
- Ton: Freundlich, hilfsreich, fachkundig
- Zielgruppe: Hobbygärtner, Hausbesitzer, Rasenliebhaber
- Länge: 800-1.500 Wörter
- Sprache: Klar, strukturiert, Deutsch

SEO-OPTIMIERTE STRUKTUR:
1. Einleitender Hook (Problem/Nutzen des Lesers ansprechen)
2. Hauptinhalt mit H2/H3 Überschriften (Keywords natürlich einbauen)
3. Interne Verlinkungen zu verwandten Themen erwähnen
4. Praktische Tipps und Schritt-für-Schritt Anleitungen
5. FAQ-Bereich mit häufigen Fragen
6. Fazit mit Call-to-Action

WICHTIGE ELEMENTE:
- Verwenden Sie Keywords natürlich im Text
- Strukturieren Sie mit aussagekräftigen Zwischenüberschriften
- Bauen Sie Listen und Aufzählungen ein
- Erwähnen Sie praktische Anwendungsbeispiele
- Schließen Sie mit einem klaren Call-to-Action ab

Antworten Sie nur mit folgendem JSON-Format:
{
  "title": "SEO-optimierter Titel mit Hauptkeyword",
  "meta_title": "SEO Meta-Titel (max 60 Zeichen)",
  "meta_description": "SEO Meta-Beschreibung (max 160 Zeichen)",
  "content": "Vollständiger Blogbeitrag-Inhalt mit Markdown-Formatierung",
  "excerpt": "Kurze Zusammenfassung (150-200 Zeichen)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "internal_links": ["Verwandtes Thema 1", "Verwandtes Thema 2", "Verwandtes Thema 3"],
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
          
Verwenden Sie diese Keywords: ${keywords.join(', ')}

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
  
  // Parse JSON from AI response
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const blogData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    return blogData;
  } catch (parseError) {
    console.error('Failed to parse AI response:', parseError);
    throw new Error('Failed to parse blog content');
  }
}

function generateTopicKeywords(topic: string): string[] {
  const baseKeywords = ['Rasen', 'Rasenpflege', 'Garten', 'Gartenarbeit'];
  const topicSpecific: { [key: string]: string[] } = {
    'Rasenpflege im Frühling': ['Frühjahr', 'Rasendünger', 'Vertikutieren', 'Nachsaat'],
    'Rasenpflege im Sommer': ['Bewässerung', 'Sommerhitze', 'Trockenheit', 'Rasenmähen'],
    'Rasenpflege im Herbst': ['Herbstdüngung', 'Laub entfernen', 'Wintervorbereitung'],
    'Rasenpflege im Winter': ['Winterruhe', 'Frost', 'Winterschutz', 'Rasenpause'],
    'Rasenmähen richtig gemacht': ['Mähroboter', 'Schnitthöhe', 'Mährhythmus', 'Rasenmäher'],
    'Optimale Rasendüngung': ['NPK-Dünger', 'Organischer Dünger', 'Langzeitdünger'],
    'Effektive Rasenbewässerung': ['Sprinkleranlage', 'Bewässerungssystem', 'Wasserbedarf'],
    'Rasenkrankheiten erkennen und behandeln': ['Pilzkrankheiten', 'Schneeschimmel', 'Rostpilz'],
    'Unkraut im Rasen bekämpfen': ['Löwenzahn', 'Klee', 'Moos', 'Unkrautvernichter'],
    'Moos im Rasen entfernen': ['Moosbekämpfung', 'Eisensulfat', 'pH-Wert', 'Bodenverdichtung']
  };
  
  const specific = topicSpecific[topic] || ['Gartentipps', 'Pflegeanleitungen'];
  return [...baseKeywords, ...specific];
}

function createSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[äöüß]/g, match => {
      if (match === 'ä') return 'ae';
      if (match === 'ö') return 'oe';
      if (match === 'ü') return 'ue';
      if (match === 'ß') return 'ss';
      return match;
    })
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function mapTopicToCategory(topic: string): string {
  const categoryMap: { [key: string]: string } = {
    'Rasenpflege im Frühling': 'seasonal',
    'Rasenpflege im Sommer': 'seasonal', 
    'Rasenpflege im Herbst': 'seasonal',
    'Rasenpflege im Winter': 'seasonal',
    'Rasenmähen richtig gemacht': 'mowing',
    'Optimale Rasendüngung': 'fertilizing',
    'Effektive Rasenbewässerung': 'watering',
    'Rasenkrankheiten erkennen und behandeln': 'problems',
    'Unkraut im Rasen bekämpfen': 'problems',
    'Moos im Rasen entfernen': 'problems'
  };
  
  return categoryMap[topic] || 'general';
}