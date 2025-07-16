import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type BlogPost = {
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
  };
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  internalLinks?: string[];
  callToAction?: string;
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
    'Rasenmähen richtig gemacht', 'Optimale Rasendüngung', 'Effektive Rasenbewässerung', 'Rasenkrankheiten erkennen und behandeln',
    'Unkraut im Rasen bekämpfen', 'Moos im Rasen entfernen', 'Rasen vertikutieren Anleitung', 'Kahle Stellen im Rasen reparieren',
    'Rollrasen richtig verlegen', 'Rasen kalken wann und wie', 'Rasenpflege für Einsteiger', 'Profi Rasenpflege Geheimnisse',
    'Rasen im Schatten pflegen', 'Strapazierfähigen Rasen anlegen', 'Englischen Rasen erreichen', 'Mediterrane Rasenpflege'
  ],
  lastGenerated: null,
  nextScheduled: null,
  generatedToday: 0
};

// Helper function to return empty string since no images are used
const getRandomImage = () => {
  return "";
};

// Helper function to generate varied dates and times
const generateRandomDate = () => {
  const now = new Date();
  // Generate dates within the last 30 days
  const daysBack = Math.floor(Math.random() * 30);
  const randomDate = new Date(now);
  randomDate.setDate(now.getDate() - daysBack);
  
  // Generate random time between 7:00 and 18:00
  const randomHour = Math.floor(Math.random() * 11) + 7; // 7-17 hours
  const randomMinute = Math.floor(Math.random() * 60);
  
  randomDate.setHours(randomHour, randomMinute, 0, 0);
  
  return randomDate.toISOString();
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
      
      // Generate keywords based on topic
      const keywords = generateTopicKeywords(randomTopic);
      
      // Call AI blog generation service
      const aiResult = await callAiBlogService(randomTopic, keywords);
      
      // Create the blog post from AI response
      const newPost: BlogPost = {
        id: Date.now(),
        title: aiResult.title,
        slug: createSlugFromTitle(aiResult.title),
        excerpt: aiResult.excerpt,
        content: aiResult.content,
        category: mapTopicToCategory(randomTopic),
        readTime: parseInt(aiResult.read_time) || Math.floor(aiResult.content.length / 1000) + 3,
        tags: aiResult.keywords.join(', '),
        date: generateRandomDate().split('T')[0],
        seo: {
          metaTitle: aiResult.meta_title,
          metaDescription: aiResult.meta_description,
          keywords: aiResult.keywords.join(', ')
        },
        faq: aiResult.faq || [],
        internalLinks: aiResult.internal_links || [],
        callToAction: aiResult.call_to_action || 'Jetzt kostenlose Rasenanalyse starten'
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
          !posts.some(post => post.category === mapTopicToCategory(topic))
        );
        
        if (availableTopics.length === 0) break;
        
        const randomTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
        const keywords = generateTopicKeywords(randomTopic);
        
        try {
          // Call AI blog generation service
          const aiResult = await callAiBlogService(randomTopic, keywords);
          
          const newPost: BlogPost = {
            id: Date.now() + i,
            title: aiResult.title,
            slug: createSlugFromTitle(aiResult.title),
            excerpt: aiResult.excerpt,
            content: aiResult.content,
            category: mapTopicToCategory(randomTopic),
            readTime: parseInt(aiResult.read_time) || Math.floor(aiResult.content.length / 1000) + 3,
            tags: aiResult.keywords.join(', '),
            date: generateRandomDate().split('T')[0],
            seo: {
              metaTitle: aiResult.meta_title,
              metaDescription: aiResult.meta_description,
              keywords: aiResult.keywords.join(', ')
            },
            faq: aiResult.faq || [],
            internalLinks: aiResult.internal_links || [],
            callToAction: aiResult.call_to_action || 'Jetzt kostenlose Rasenanalyse starten'
          };
          
          posts.push(newPost);
          await saveBlogPost(newPost);
          
          // Add delay between generations to respect API limits
          if (i < postsToGenerate - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch (error) {
          console.error(`Error generating post ${i + 1}:`, error);
          // Continue with next post instead of failing completely
          continue;
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

  // Helper functions for AI blog generation
  const callAiBlogService = async (topic: string, keywords: string[]) => {
    const response = await supabase.functions.invoke('generate-blog-post', {
      body: { topic, keywords }
    });
    
    if (response.error) {
      throw new Error(`AI service error: ${response.error.message}`);
    }
    
    if (!response.data?.success) {
      throw new Error(`Failed to generate blog content: ${response.data?.error || 'Unknown error'}`);
    }
    
    return response.data.blogPost;
  };

  const generateTopicKeywords = (topic: string): string[] => {
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
            category: post.category,
            read_time: post.readTime,
            tags: post.tags,
            date: post.date,
            author: 'Lars',
            status: 'published', // Auto-publish AI generated posts
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
