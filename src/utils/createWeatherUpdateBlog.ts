import { supabase } from '@/integrations/supabase/client';

export const createWeatherUpdateBlogPost = async () => {
  try {
    console.log('Creating weather update blog post...');
    
    const { data, error } = await supabase.functions.invoke('generate-blog-post', {
      body: {
        topic: "Rasenpilot 2.0: Revolutionäre Wetter-Integration Update - Alle Neuerungen vom 9. August 2025",
        keywords: "Rasenpilot Update 2025, Wetter Integration, standortbasierte Rasenpflege, Postleitzahl Rasenanalyse, intelligente Gartenarbeit, Echtzeit Wetterdaten, wetterbasierte Empfehlungen, KI Rasenpflege"
      }
    });

    if (error) {
      console.error('Blog generation error:', error);
      throw error;
    }

    console.log('Blog post created successfully:', data);
    return data;
    
  } catch (error) {
    console.error('Failed to create weather update blog post:', error);
    throw error;
  }
};

// Auto-execute the blog creation
createWeatherUpdateBlogPost();