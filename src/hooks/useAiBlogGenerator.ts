import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  readTime: number;
  tags: string;
  date: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
};

export type BlogScheduleSettings = {
  isEnabled: boolean;
  interval: number; 
  postsPerInterval: number; // New: number of posts per interval
  topics: string[];
  lastGenerated: string | null;
  nextScheduled: string | null;
  generatedToday: number; // New: track daily posts
};

const DEFAULT_SETTINGS: BlogScheduleSettings = {
  isEnabled: false,
  interval: 1, // Daily
  postsPerInterval: 2, // 2 posts per day
  topics: [
    'Rasenpflege im Frühling', 'Rasenpflege im Sommer', 'Rasenpflege im Herbst', 'Rasenpflege im Winter',
    'Rasenmähen Tipps', 'Rasen düngen', 'Rasenbewässerung', 'Rasenkrankheiten erkennen',
    'Unkraut bekämpfen', 'Moos im Rasen', 'Rasen vertikutieren', 'Rasen nachsäen',
    'Rollrasen verlegen', 'Rasen kalken', 'Rasenpflege für Anfänger', 'Profi Rasenpflege',
    'Rasen im Schatten', 'Strapazierfähiger Rasen', 'Englischer Rasen', 'Mediterrane Rasenpflege'
  ],
  lastGenerated: null,
  nextScheduled: null,
  generatedToday: 0
};

export const useAiBlogGenerator = () => {
  const [settings, setSettings] = useState<BlogScheduleSettings>(DEFAULT_SETTINGS);
  
  // Load settings from localStorage on hook initialization
  useEffect(() => {
    const savedSettings = localStorage.getItem('aiBlogSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (e) {
        console.error('Error parsing saved blog settings:', e);
      }
    }
  }, []);
  
  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('aiBlogSettings', JSON.stringify(settings));
  }, [settings]);
  
  // Check if we need to generate a post based on schedule
  useEffect(() => {
    if (!settings.isEnabled || !settings.nextScheduled) return;
    
    const checkSchedule = () => {
      const nextDate = new Date(settings.nextScheduled!);
      const now = new Date();
      
      if (nextDate <= now) {
        generateBlogPost();
      }
    };
    
    // Check once when component mounts
    checkSchedule();
    
    // Set up interval to check regularly (every hour)
    const intervalId = setInterval(checkSchedule, 3600000);
    
    return () => clearInterval(intervalId);
  }, [settings.isEnabled, settings.nextScheduled]);
  
  const updateSettings = (newSettings: Partial<BlogScheduleSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
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
    
    return {
      isEnabled: enabled,
      nextDate: enabled ? nextDate : null
    };
  };
  
  const addTopic = (topic: string) => {
    if (!topic.trim()) return false;
    if (settings.topics.includes(topic.trim())) return false;
    
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
  
  const generateBlogPost = async () => {
    try {
      if (settings.topics.length === 0) {
        throw new Error('No topics available for generating content');
      }
      
      // Select a random topic
      const randomTopic = settings.topics[Math.floor(Math.random() * settings.topics.length)];
      
      // In a real implementation, you would call an AI API here
      // For now, we'll generate placeholder content
      const title = `${randomTopic}: Die besten Tipps für Ihren Rasen`;
      const content = await simulateAiGeneration(randomTopic);
      
      // Create the blog post
      const newPost: BlogPost = {
        id: Date.now(),
        title,
        slug: title
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
          .replace(/-+/g, '-'),
        excerpt: content.substring(0, 150) + '...',
        content,
        image: '/placeholder.svg',
        category: randomTopic,
        readTime: Math.floor(content.length / 1000) + 2,
        tags: generateRandomTags(randomTopic).join(', '),
        date: new Date().toISOString().split('T')[0],
        seo: {
          metaTitle: title,
          metaDescription: content.substring(0, 150) + '...',
          keywords: randomTopic + ', Rasen, Gartenpflege, ' + generateRandomTags(randomTopic).join(', ')
        }
      };
      
      // Save to Supabase
      await saveBlogPost(newPost);
      
      // Update settings
      const now = new Date();
      const nextDate = new Date(now);
      nextDate.setDate(now.getDate() + settings.interval);
      
      setSettings({
        ...settings,
        lastGenerated: now.toISOString(),
        nextScheduled: settings.isEnabled ? nextDate.toISOString() : null
      });
      
      return {
        success: true,
        post: newPost
      };
    } catch (error) {
      console.error('Error generating blog post:', error);
      return {
        success: false,
        error
      };
    }
  };
  
  const generateMultipleBlogPosts = async () => {
    try {
      if (settings.topics.length === 0) {
        throw new Error('No topics available for generating content');
      }
      
      const posts = [];
      const postsToGenerate = settings.postsPerInterval;
      
      for (let i = 0; i < postsToGenerate; i++) {
        // Select unique topics for each post
        const availableTopics = settings.topics.filter(topic => 
          !posts.some(post => post.category === topic)
        );
        
        if (availableTopics.length === 0) break;
        
        const randomTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
        const content = await simulateAiGeneration(randomTopic);
        
        const title = generateVariedTitle(randomTopic, i);
        
        const newPost: BlogPost = {
          id: Date.now() + i,
          title,
          slug: title
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
            .replace(/-+/g, '-'),
          excerpt: content.substring(0, 150) + '...',
          content,
          image: '/placeholder.svg',
          category: randomTopic,
          readTime: Math.floor(content.length / 1000) + 2,
          tags: generateRandomTags(randomTopic).join(', '),
          date: new Date().toISOString().split('T')[0],
          seo: {
            metaTitle: title,
            metaDescription: content.substring(0, 150) + '...',
            keywords: randomTopic + ', Rasen, Gartenpflege, ' + generateRandomTags(randomTopic).join(', ')
          }
        };
        
        posts.push(newPost);
        await saveBlogPost(newPost);
        
        // Add delay between generations to seem more natural
        if (i < postsToGenerate - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      // Update settings
      const now = new Date();
      const nextDate = new Date(now);
      nextDate.setDate(now.getDate() + settings.interval);
      
      setSettings({
        ...settings,
        lastGenerated: now.toISOString(),
        nextScheduled: settings.isEnabled ? nextDate.toISOString() : null,
        generatedToday: settings.generatedToday + posts.length
      });
      
      return {
        success: true,
        posts
      };
    } catch (error) {
      console.error('Error generating blog posts:', error);
      return {
        success: false,
        error
      };
    }
  };

  const generateVariedTitle = (topic: string, index: number): string => {
    const titleVariations = [
      `${topic}: Die ultimative Anleitung für perfekte Ergebnisse`,
      `Profi-Tipps für ${topic} - So machen Sie es richtig`,
      `${topic} leicht gemacht: Schritt-für-Schritt Guide`,
      `Die häufigsten Fehler bei ${topic} und wie Sie sie vermeiden`,
      `${topic}: Alles was Sie wissen müssen`,
      `Experten-Geheimnisse für erfolgreiche ${topic}`,
      `${topic} im Detail: Von Grundlagen bis Profi-Tricks`,
      `Die besten Methoden für ${topic} in Deutschland`
    ];
    
    return titleVariations[index % titleVariations.length];
  };

  const saveBlogPost = async (post: BlogPost) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .insert([
          {
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            image: post.image,
            category: post.category,
            read_time: post.readTime,
            tags: post.tags,
            date: post.date,
            author: 'AI Blog Generator',
            status: 'draft',
            seo: {
              metaTitle: post.seo.metaTitle,
              metaDescription: post.seo.metaDescription,
              keywords: post.seo.keywords
            }
          }
        ]);

      if (error) {
        console.error('Error saving blog post to Supabase:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error saving blog post:', error);
      return false;
    }
  };
  
  const simulateAiGeneration = async (topic: string): Promise<string> => {
    // This would be replaced with an actual API call in production
    return new Promise(resolve => {
      setTimeout(() => {
        const templates = [
          `Ein gesunder ${topic} ist der Traum vieler Gartenbesitzer. In diesem Blogbeitrag erfahren Sie die wichtigsten Tipps zur richtigen Pflege. \n\nZunächst ist es wichtig, den Boden richtig vorzubereiten. Ein guter, nährstoffreicher Boden ist die Basis für jeden erfolgreichen Rasen. Regelmäßiges Düngen, etwa alle 6-8 Wochen während der Wachstumsphase, versorgt Ihren Rasen mit allen notwendigen Nährstoffen.\n\nDas Mähen ist ein weiterer wichtiger Aspekt. Mähen Sie nicht zu kurz - die ideale Höhe liegt zwischen 3-5 cm. Zu kurz gemähter Rasen trocknet schneller aus und bietet Unkraut mehr Chancen, sich zu etablieren.\n\nDie Bewässerung sollte gründlich, aber nicht zu häufig erfolgen. Besser einmal pro Woche gründlich wässern als täglich ein bisschen. So entwickeln die Wurzeln eine größere Tiefe und der Rasen wird insgesamt widerstandsfähiger gegen Trockenheit.\n\nProbleme wie Moos oder Unkraut können durch regelmäßige Pflege vorgebeugt werden. Ein gesunder, dichter Rasen lässt kaum Platz für unerwünschte Pflanzen.\n\nMit diesen Tipps wird Ihr ${topic} bald der Neid der Nachbarschaft sein!`,
          
          `${topic} ist ein wichtiger Bestandteil jedes schönen Gartens. Hier sind die besten Methoden, um optimale Ergebnisse zu erzielen.\n\nDie richtige Bodenvorbereitung ist entscheidend. Entfernen Sie Steine und Wurzeln, und sorgen Sie für eine gute Drainage. Der pH-Wert sollte zwischen 5,5 und 7,0 liegen - ein leicht saurer bis neutraler Boden ist ideal für die meisten Rasensorten.\n\nDie Wahl der richtigen Rasensaat hängt von verschiedenen Faktoren ab: Wie stark wird der Rasen genutzt? Wie viel Sonnenlicht erhält er? Gibt es schattige Bereiche? Für stark beanspruchte Flächen empfehlen sich robuste Rasenmischungen mit hohem Anteil an Deutschem Weidelgras.\n\nNach der Aussaat ist die konsequente Pflege wichtig. In den ersten Wochen sollte der Boden stets feucht, aber nicht durchnässt sein. Der erste Schnitt erfolgt, wenn der Rasen eine Höhe von etwa 8-10 cm erreicht hat.\n\nRegelmäßiges Vertikutieren (1-2 Mal im Jahr) entfernt Rasenfilz und sorgt für bessere Luft- und Wasserzirkulation im Boden. Kombiniert mit einer Düngung im Frühjahr, Sommer und Herbst bleibt Ihr ${topic} das ganze Jahr über gesund und grün.`,
          
          `Einen perfekten ${topic} zu pflegen erfordert Wissen und Konsequenz. Diese professionellen Tipps helfen Ihnen dabei.\n\nDie Bodenqualität ist der Schlüssel zum Erfolg. Ein lockerer, nährstoffreicher Boden mit guter Durchlässigkeit bildet die Grundlage für jeden gesunden Rasen. Bei schweren Böden kann die Einarbeitung von Sand die Drainage verbessern.\n\nBei der Düngung gilt: Lieber weniger, dafür regelmäßiger. Organische Dünger setzen Nährstoffe langsamer frei und schonen die Umwelt. Im Frühjahr ist ein stickstoffbetonter Dünger ideal, im Herbst sollte der Kaliumanteil höher sein, um die Winterhärte zu fördern.\n\nDie richtige Schnitthöhe variiert je nach Jahreszeit. Im Sommer sollte der Rasen etwas länger bleiben (4-5 cm), um Austrocknung zu vermeiden. Im Frühjahr und Herbst kann kürzer gemäht werden (3-4 cm).\n\nProbleme wie Moos oder Klee zeigen oft Mängel an: Moos deutet auf Verdichtung, Nässe oder Nährstoffmangel hin, während Klee auf einen Stickstoffmangel hinweist.\n\nMit einem konsequenten Pflegeplan, der auf die Bedürfnisse Ihres spezifischen ${topic}s abgestimmt ist, werden Sie schnell Verbesserungen sehen.`
        ];
        
        const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
        resolve(randomTemplate);
      }, 1000);
    });
  };
  
  const generateRandomTags = (topic: string): string[] => {
    const allTags = [
      'Rasenpflege', 'Rasen mähen', 'Rasen düngen', 'Rasenbewässerung', 
      'Rasenprobleme', 'Unkraut bekämpfen', 'Rasen im Sommer', 'Rasen im Winter',
      'Gartengestaltung', 'Rollrasen', 'Rasensaat', 'Schattenrasen'
    ];
    
    // Always include the main topic as a tag
    const tags = [topic];
    
    // Add 2-4 random tags
    const numberOfTags = Math.floor(Math.random() * 3) + 2;
    const filteredTags = allTags.filter(tag => tag !== topic);
    
    for (let i = 0; i < numberOfTags; i++) {
      if (filteredTags.length === 0) break;
      
      const randomIndex = Math.floor(Math.random() * filteredTags.length);
      tags.push(filteredTags[randomIndex]);
      filteredTags.splice(randomIndex, 1);
    }
    
    return tags;
  };
  
  return {
    settings,
    updateSettings: (newSettings: Partial<BlogScheduleSettings>) => {
      setSettings(prev => ({ ...prev, ...newSettings }));
    },
    toggleScheduler: (enabled: boolean) => {
      const now = new Date();
      const nextDate = new Date(now);
      nextDate.setDate(now.getDate() + settings.interval);
      
      setSettings({
        ...settings,
        isEnabled: enabled,
        nextScheduled: enabled ? nextDate.toISOString() : null
      });
      
      return {
        isEnabled: enabled,
        nextDate: enabled ? nextDate : null
      };
    },
    addTopic: (topic: string) => {
      if (!topic.trim()) return false;
      if (settings.topics.includes(topic.trim())) return false;
      
      setSettings({
        ...settings,
        topics: [...settings.topics, topic.trim()]
      });
      
      return true;
    },
    removeTopic: (topicToRemove: string) => {
      setSettings({
        ...settings,
        topics: settings.topics.filter(t => t !== topicToRemove)
      });
    },
    generateBlogPost: generateMultipleBlogPosts
  };
};
