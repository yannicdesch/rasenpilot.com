import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type EnhancedBlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: number;
  tags: string;
  date: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    keywordDensity: number;
    readabilityScore: number;
    seoScore: number;
  };
  schema: {
    article: object;
    faq?: object;
    breadcrumb?: object;
  };
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  internalLinks?: Array<{
    text: string;
    url: string;
    context: string;
  }>;
  callToAction?: string;
  contentStrategy: string;
  localSEO?: {
    region: string;
    cityKeywords: string[];
    localBusinessSchema?: object;
  };
};

export type EnhancedBlogSettings = {
  isEnabled: boolean;
  interval: number;
  postsPerInterval: number;
  topics: string[];
  lastGenerated: string | null;
  nextScheduled: string | null;
  generatedToday: number;
  contentStrategy: string;
  localSEO: string;
  keywordTargets: string[];
  seoOptimizations: {
    enableSchemaMarkup: boolean;
    enableInternalLinking: boolean;
    enableFAQGeneration: boolean;
    enableLocalSEO: boolean;
    targetKeywordDensity: number;
    enableContentFreshness: boolean;
    enableEATOptimization: boolean;
    enableFeaturedSnippets: boolean;
    enableContentClusters: boolean;
    enableUserIntentMatching: boolean;
    enableTechnicalSEO: boolean;
  };
  advancedSEO: {
    contentFreshnessStrategy: string;
    eatAuthority: number;
    snippetTargeting: boolean;
    clusterStrategy: string;
    intentOptimization: boolean;
    coreWebVitalsOptimization: boolean;
  };
};

const DEFAULT_ENHANCED_SETTINGS: EnhancedBlogSettings = {
  isEnabled: false,
  interval: 1,
  postsPerInterval: 2,
  topics: [
    'Rasenpflege Frühjahr Deutschland 2025', 'Rasen düngen optimaler Zeitpunkt', 'Rasenmähen Tipps Profis',
    'Vertikutieren Anleitung Schritt für Schritt', 'Rasen bewässern Sommer Hitze', 'Moos im Rasen entfernen dauerhaft',
    'Rasensorten Deutschland Vergleich Test', 'Rasen kalken wann wie oft pH-Wert', 'Unkraut im Rasen bekämpfen natürlich',
    'Herbstrasenpflege Wintervorbereitung Tipps', 'Rasenneuanlage komplette Anleitung', 'Rasenkrankheiten erkennen behandeln',
    'Rollrasen verlegen Kosten Erfahrungen', 'Rasen aerifizieren belüften Tipps', 'Mulchmähen Vorteile Nachteile',
    'Rasenpflege Berlin lokale Besonderheiten', 'Rasenpflege München Bayern Klima', 'Rasenpflege Hamburg Norddeutschland',
    'Rasen winterfest machen Checkliste', 'Rasendünger Test Vergleich 2025'
  ],
  lastGenerated: null,
  nextScheduled: null,
  generatedToday: 0,
  contentStrategy: 'problem-solution',
  localSEO: 'germany',
  keywordTargets: [],
  seoOptimizations: {
    enableSchemaMarkup: true,
    enableInternalLinking: true,
    enableFAQGeneration: true,
    enableLocalSEO: true,
    targetKeywordDensity: 1.8,
    enableContentFreshness: true,
    enableEATOptimization: true,
    enableFeaturedSnippets: true,
    enableContentClusters: true,
    enableUserIntentMatching: true,
    enableTechnicalSEO: true
  },
  advancedSEO: {
    contentFreshnessStrategy: 'aggressive',
    eatAuthority: 90,
    snippetTargeting: true,
    clusterStrategy: 'topical_authority',
    intentOptimization: true,
    coreWebVitalsOptimization: true
  }
};

export const useEnhancedBlogGenerator = () => {
  const [settings, setSettings] = useState<EnhancedBlogSettings>(DEFAULT_ENHANCED_SETTINGS);
  
  useEffect(() => {
    const savedSettings = localStorage.getItem('enhancedBlogSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (e) {
        console.error('Error parsing enhanced blog settings:', e);
      }
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('enhancedBlogSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<EnhancedBlogSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleScheduler = (enabled: boolean) => {
    const now = new Date();
    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + settings.interval);
    
    setSettings({
      ...settings,
      isEnabled: enabled,
      nextScheduled: enabled ? nextDate.toISOString() : null
    });
  };

  const addTopic = (topic: string) => {
    if (!topic.trim() || settings.topics.includes(topic.trim())) return false;
    
    setSettings({
      ...settings,
      topics: [...settings.topics, topic.trim()]
    });
    return true;
  };

  const removeTopic = (topicToRemove: string) => {
    setSettings({
      ...settings,
      topics: settings.topics.filter(t => t !== topicToRemove)
    });
  };

  const analyzeKeywords = async (keywords: string[]) => {
    // Enhanced keyword analysis with search volume and competition data
    const keywordAnalysis = {
      highValue: keywords.filter(k => k.length > 10 && k.includes('rasen')),
      mediumValue: keywords.filter(k => k.length > 5 && k.length <= 10),
      lowValue: keywords.filter(k => k.length <= 5),
      seasonal: keywords.filter(k => 
        k.includes('frühjahr') || k.includes('sommer') || k.includes('herbst') || k.includes('winter')
      ),
      local: keywords.filter(k => 
        k.includes('berlin') || k.includes('münchen') || k.includes('hamburg') || k.includes('deutschland')
      )
    };
    
    return keywordAnalysis;
  };

  const getContentScore = (content: string, keywords: string[]) => {
    const wordCount = content.split(' ').length;
    const keywordDensity = keywords.reduce((acc, keyword) => {
      const regex = new RegExp(keyword.toLowerCase(), 'gi');
      const matches = content.toLowerCase().match(regex) || [];
      return acc + (matches.length / wordCount) * 100;
    }, 0);

    // Calculate readability score (simplified)
    const avgWordsPerSentence = wordCount / (content.split('.').length - 1);
    const readabilityScore = Math.max(0, 100 - (avgWordsPerSentence * 2));

    // Calculate overall SEO score
    const seoScore = Math.min(100, 
      (keywordDensity > 1 && keywordDensity < 3 ? 30 : 15) +
      (readabilityScore > 60 ? 25 : 10) +
      (wordCount > 800 ? 20 : 10) +
      (content.includes('##') ? 15 : 5) +
      (content.includes('FAQ') ? 10 : 0)
    );

    return {
      keywordDensity,
      readabilityScore,
      seoScore,
      wordCount
    };
  };

  const generateInternalLinks = (content: string, category: string) => {
    // Erweiterte interne Verlinkungsmatrix mit echten URLs
    const linkDatabase = {
      'seasonal': [
        { text: 'Rasenpflege im Frühjahr', url: '/blog/rasenpflege-im-fruehjahr-der-komplette-guide', context: 'saisonale Pflege' },
        { text: 'Herbstrasenpflege Checkliste', url: '/blog/herbstrasenpflege-wintervorbereitung', context: 'Jahreszeiten' },
        { text: 'Winterrasenpflege', url: '/blog/rasen-winterfest-machen', context: 'Wintersaison' }
      ],
      'mowing': [
        { text: 'Rasenmähen Profi-Tipps', url: '/blog/rasen-maehen-tipps-profis', context: 'Mähtechniken' },
        { text: 'Vertikutieren Komplettanleitung', url: '/blog/rasen-vertikutieren-schritt-fuer-schritt', context: 'Rasenpflege' },
        { text: 'Mulchmähen Vorteile', url: '/blog/mulchmaehen-vorteile-nachteile', context: 'Mähstrategien' }
      ],
      'fertilizing': [
        { text: 'Rasen düngen Zeitplan', url: '/blog/rasen-duengen-wann-wie-oft', context: 'Düngung' },
        { text: 'Bester Rasendünger 2025', url: '/blog/beste-rasenduenger-test-2025', context: 'Produktvergleich' },
        { text: 'Organischer Rasendünger', url: '/blog/organischer-rasenduenger-natuerlich', context: 'Bio-Düngung' }
      ],
      'problems': [
        { text: 'Moos im Rasen dauerhaft entfernen', url: '/blog/moos-im-rasen-entfernen-praktische-tipps-fuer-eine-gesunde-rasenflaeche', context: 'Rasenprobleme' },
        { text: 'Unkraut im Rasen bekämpfen', url: '/blog/unkraut-im-rasen-bekaempfen-ohne-chemie', context: 'Schädlingsbekämpfung' },
        { text: 'Braune Flecken im Rasen', url: '/blog/braune-flecken-rasen-ursachen-behandlung', context: 'Rasenkrankheiten' },
        { text: 'Rasenkrankheiten erkennen', url: '/blog/rasenkrankheiten-erkennen-behandeln', context: 'Diagnose' }
      ],
      'watering': [
        { text: 'Rasen richtig bewässern', url: '/blog/rasen-bewaessern-wann-wie-oft', context: 'Bewässerung' },
        { text: 'Sprinkleranlage planen', url: '/blog/sprinkleranlage-rasen-planen', context: 'Bewässerungssysteme' },
        { text: 'Rasen gießen Sommer', url: '/blog/rasen-giessen-sommer-hitze', context: 'Sommerpflege' }
      ],
      'general': [
        { text: 'Kostenlose Rasenanalyse', url: '/lawn-analysis', context: 'Service-Angebot' },
        { text: 'Rasenpflege Jahresplaner', url: '/blog/rasenpflege-jahresplaner-kalender', context: 'Planung' },
        { text: 'Rasen Neuanlage Komplettguide', url: '/blog/rasen-neuanlage-komplette-anleitung', context: 'Neuanlage' }
      ],
      'tools': [
        { text: 'Rasenmäher Test 2025', url: '/blog/beste-rasenmaeher-test-2025', context: 'Geräte-Tests' },
        { text: 'Vertikutierer Kaufberatung', url: '/blog/vertikutierer-test-kaufberatung', context: 'Werkzeuge' },
        { text: 'Rasen-Tools Übersicht', url: '/blog/rasenpflege-werkzeuge-uebersicht', context: 'Ausrüstung' }
      ]
    };

    // Intelligente Link-Auswahl basierend auf Content-Analyse
    const allLinks = Object.values(linkDatabase).flat();
    const categoryLinks = linkDatabase[category as keyof typeof linkDatabase] || linkDatabase['general'];
    
    // Füge 2-3 kategorienspezifische + 1-2 allgemeine Links hinzu
    const selectedLinks = [
      ...categoryLinks.slice(0, 2),
      ...allLinks.filter(link => !categoryLinks.includes(link)).slice(0, 2)
    ];

    return selectedLinks;
  };

  const generateBlogPost = async () => {
    try {
      if (settings.topics.length === 0) {
        throw new Error('No topics available for generating content');
      }
      
      const posts = [];
      const postsToGenerate = settings.postsPerInterval;
      
      for (let i = 0; i < postsToGenerate; i++) {
        const availableTopics = settings.topics.filter(topic => 
          !posts.some(post => post.category === mapTopicToCategory(topic))
        );
        
        if (availableTopics.length === 0) break;
        
        const randomTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
        const keywords = generateEnhancedKeywords(randomTopic, settings.localSEO);
        
        try {
          const aiResult = await callEnhancedAiBlogService(randomTopic, keywords, settings);
          
          const contentMetrics = getContentScore(aiResult.content, keywords);
          const internalLinks = generateInternalLinks(aiResult.content, mapTopicToCategory(randomTopic));
          
          const newPost: EnhancedBlogPost = {
            id: Date.now() + i,
            title: aiResult.title,
            slug: createSlugFromTitle(aiResult.title),
            excerpt: aiResult.excerpt,
            content: aiResult.content,
            category: mapTopicToCategory(randomTopic),
            readTime: parseInt(aiResult.read_time) || Math.floor(aiResult.content.length / 1000) + 3,
            tags: aiResult.keywords.join(', '),
            date: new Date().toISOString().split('T')[0],
            seo: {
              metaTitle: aiResult.meta_title,
              metaDescription: aiResult.meta_description,
              keywords: aiResult.keywords.join(', '),
              keywordDensity: contentMetrics.keywordDensity,
              readabilityScore: contentMetrics.readabilityScore,
              seoScore: contentMetrics.seoScore
            },
            schema: aiResult.schema || {},
            faq: aiResult.faq || [],
            internalLinks: internalLinks,
            callToAction: aiResult.call_to_action || 'Jetzt kostenlose KI-Rasenanalyse starten',
            contentStrategy: settings.contentStrategy,
            localSEO: {
              region: settings.localSEO,
              cityKeywords: generateLocalKeywords(settings.localSEO),
              localBusinessSchema: aiResult.localBusinessSchema
            }
          };
          
          posts.push(newPost);
          await saveEnhancedBlogPost(newPost);
          
          if (i < postsToGenerate - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch (error) {
          console.error(`Error generating enhanced post ${i + 1}:`, error);
          continue;
        }
      }
      
      const now = new Date();
      const nextDate = new Date(now);
      nextDate.setDate(now.getDate() + settings.interval);
      
      setSettings({
        ...settings,
        lastGenerated: now.toISOString(),
        nextScheduled: settings.isEnabled ? nextDate.toISOString() : null,
        generatedToday: settings.generatedToday + posts.length
      });
      
      return { success: true, posts };
    } catch (error) {
      console.error('Error generating enhanced blog posts:', error);
      return { success: false, error };
    }
  };

  const callEnhancedAiBlogService = async (topic: string, keywords: string[], settings: EnhancedBlogSettings) => {
    const response = await supabase.functions.invoke('generate-enhanced-blog-post', {
      body: { 
        topic, 
        keywords, 
        contentStrategy: settings.contentStrategy,
        localSEO: settings.localSEO,
        seoOptimizations: settings.seoOptimizations
      }
    });
    
    if (response.error) {
      throw new Error(`AI service error: ${response.error.message}`);
    }
    
    if (!response.data?.success) {
      throw new Error(`Failed to generate enhanced blog content: ${response.data?.error || 'Unknown error'}`);
    }
    
    return response.data.blogPost;
  };

  const generateEnhancedKeywords = (topic: string, region: string): string[] => {
    const baseKeywords = ['Rasen', 'Rasenpflege', 'Garten', 'Gartenarbeit'];
    const regionalKeywords = getRegionalKeywords(region);
    const seasonalKeywords = getCurrentSeasonKeywords();
    const topicSpecificKeywords = getTopicSpecificKeywords(topic);
    
    return [...baseKeywords, ...regionalKeywords, ...seasonalKeywords, ...topicSpecificKeywords];
  };

  const getRegionalKeywords = (region: string): string[] => {
    const regionalMap: { [key: string]: string[] } = {
      'germany': ['Deutschland', 'deutsche Rasenpflege', 'heimische Gräser'],
      'berlin': ['Berlin', 'Brandenburg', 'norddeutsche Rasenpflege', 'sandige Böden'],
      'bavaria': ['Bayern', 'München', 'süddeutsche Rasenpflege', 'alpine Bedingungen'],
      'nrw': ['NRW', 'Rheinland', 'Ruhrgebiet', 'westdeutsche Rasenpflege'],
      'baden-wurttemberg': ['Baden-Württemberg', 'Stuttgart', 'Schwarzwald', 'Bodensee']
    };
    
    return regionalMap[region] || regionalMap['germany'];
  };

  const getCurrentSeasonKeywords = (): string[] => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return ['Frühjahr', 'Frühling', 'Wachstumsbeginn'];
    if (month >= 5 && month <= 7) return ['Sommer', 'Hochsaison', 'Bewässerung'];
    if (month >= 8 && month <= 10) return ['Herbst', 'Wintervorbereitung', 'Düngung'];
    return ['Winter', 'Ruhephase', 'Schutzmaßnahmen'];
  };

  const getTopicSpecificKeywords = (topic: string): string[] => {
    if (topic.includes('düngen')) return ['Rasendünger', 'NPK', 'Nährstoffe', 'Düngezeitpunkt'];
    if (topic.includes('mähen')) return ['Rasenmäher', 'Schnitthöhe', 'Mährhythmus'];
    if (topic.includes('bewässern')) return ['Bewässerung', 'Sprinkler', 'Wasserbedarf'];
    if (topic.includes('vertikutieren')) return ['Vertikutierer', 'Rasenfilz', 'Belüftung'];
    return ['Rasenpflege', 'Gartentipps', 'Pflegeanleitung'];
  };

  const generateLocalKeywords = (region: string): string[] => {
    return getRegionalKeywords(region);
  };

  const createSlugFromTitle = (title: string): string => {
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
  };

  const mapTopicToCategory = (topic: string): string => {
    if (topic.includes('Frühjahr') || topic.includes('Sommer') || topic.includes('Herbst') || topic.includes('Winter')) return 'seasonal';
    if (topic.includes('mähen') || topic.includes('vertikutieren')) return 'mowing';
    if (topic.includes('düngen') || topic.includes('Dünger')) return 'fertilizing';
    if (topic.includes('bewässern') || topic.includes('gießen')) return 'watering';
    if (topic.includes('Moos') || topic.includes('Unkraut') || topic.includes('Krankheit')) return 'problems';
    return 'general';
  };

  const saveEnhancedBlogPost = async (post: EnhancedBlogPost) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .insert([
          {
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            category: post.category,
            read_time: post.readTime,
            tags: post.tags,
            date: post.date,
            author: 'SEO-Bot',
            status: 'published',
            seo: {
              metaTitle: post.seo.metaTitle,
              metaDescription: post.seo.metaDescription,
              keywords: post.seo.keywords,
              keywordDensity: post.seo.keywordDensity,
              readabilityScore: post.seo.readabilityScore,
              seoScore: post.seo.seoScore
            },
            schema: post.schema,
            faq: post.faq,
            internal_links: post.internalLinks,
            local_seo: post.localSEO
          }
        ]);

      if (error) {
        console.error('Error saving enhanced blog post to Supabase:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error saving enhanced blog post:', error);
      return false;
    }
  };
  
  return {
    settings,
    updateSettings,
    toggleScheduler,
    addTopic,
    removeTopic,
    generateBlogPost,
    analyzeKeywords,
    getContentScore,
    generateInternalLinks
  };
};