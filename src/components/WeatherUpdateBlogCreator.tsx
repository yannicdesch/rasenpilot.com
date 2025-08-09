import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

export const WeatherUpdateBlogCreator = () => {
  const [isCreating, setIsCreating] = useState(false);

  const createWeatherUpdateBlog = async () => {
    setIsCreating(true);
    
    try {
      const blogData = {
        topic: "Rasenpilot 2.0: Revolutionäre Wetter-Integration Update - Neue Features für präzise standortbasierte Rasenpflege",
        keywords: "Rasenpilot Update 2025, Wetter Integration, standortbasierte Rasenpflege, Postleitzahl Rasenanalyse, intelligente Gartenarbeit, Echtzeit Wetterdaten"
      };

      console.log('Creating weather update blog post...');
      
      const { data, error } = await supabase.functions.invoke('generate-blog-post', {
        body: blogData
      });

      if (error) throw error;

      console.log('Blog post generated successfully:', data);
      
      toast({
        title: "✅ Blog-Artikel erstellt!",
        description: "Der Artikel über die Wetter-Integration wurde erfolgreich veröffentlicht.",
      });

    } catch (error) {
      console.error('Error creating blog post:', error);
      toast({
        title: "❌ Fehler",
        description: "Blog-Artikel konnte nicht erstellt werden.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">Blog-Artikel über heute's Updates erstellen</h3>
      <p className="text-sm text-gray-600 mb-4">
        Erstellt einen SEO-optimierten Artikel über die neue Wetter-Integration und alle Updates von heute.
      </p>
      <Button 
        onClick={createWeatherUpdateBlog}
        disabled={isCreating}
        className="w-full"
      >
        {isCreating ? 'Erstelle Artikel...' : 'Blog-Artikel erstellen'}
      </Button>
    </Card>
  );
};

export default WeatherUpdateBlogCreator;