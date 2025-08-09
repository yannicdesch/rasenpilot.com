import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, Instagram, Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InstagramPost {
  caption: string;
  hashtags: string;
  type: 'feed' | 'story' | 'carousel';
}

export const InstagramPostGenerator = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateInstagramPosts = async () => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-post', {
        body: {
          topic: "Instagram Posts für Rasenpilot Wetter-Integration Update - Social Media Content",
          keywords: "Rasenpilot, Wetter Integration, Instagram, Social Media, Rasenpflege App, Update",
          specialInstructions: `Erstelle 3 verschiedene Instagram-Posts über das neue Wetter-Integration Update von Rasenpilot:

1. FEED POST: Hauptankündigung des Updates (max 200 Wörter)
2. STORY POST: Kurzer, catchy Post für Stories (max 50 Wörter)  
3. CAROUSEL POST: Erklärt die Features Schritt-für-Schritt (max 150 Wörter)

Verwende einen modernen, freundlichen Ton. Fokus auf:
- Neue Postleitzahlen-Eingabe
- Echtzeit-Wetterdaten
- Präzise Timing-Empfehlungen
- Vorher/Nachher Verbesserungen

Füge passende Hashtags hinzu (#rasenpflege #gartenliebe #smartgarden #rasenpilot #wetterapp etc.)

Format als JSON:
{
  "posts": [
    {
      "type": "feed",
      "caption": "Haupttext für Feed Post...",
      "hashtags": "#rasenpflege #update #neu"
    },
    {
      "type": "story", 
      "caption": "Kurzer Story Text...",
      "hashtags": "#rasenpilot #neu"
    },
    {
      "type": "carousel",
      "caption": "Carousel Erklärung...", 
      "hashtags": "#tutorial #rasenpflege"
    }
  ]
}`
        }
      });

      if (error) throw error;

      // Parse the generated content to extract Instagram posts
      const generatedContent = data?.content || data?.generatedText || '';
      
      // Try to extract JSON from the generated content
      let postsData;
      try {
        const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          postsData = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        // Fallback: create manual posts based on today's updates
        postsData = {
          posts: [
            {
              type: 'feed',
              caption: `🌟 RASENPILOT 2.0 IST DA! 🌟

Die Revolution der Rasenpflege: Unser neues Wetter-Integration Update macht eure Rasenpflege so präzise wie nie zuvor! 🎯

✨ Was ist neu?
📍 Postleitzahlen-Eingabe für lokale Empfehlungen
🌤️ Echtzeit-Wetterdaten Integration  
⏰ Perfekte Timing-Empfehlungen
🤖 KI berücksichtigt jetzt Wetter & Prognosen

Nie wieder falscher Zeitpunkt zum Düngen oder Bewässern! Unsere KI sagt dir genau, wann welche Pflege optimal ist - basierend auf deinem lokalen Wetter.

Probier es kostenlos aus! Link in Bio 🔗`,
              hashtags: '#rasenpilot #update #rasenpflege #smartgarden #gartenliebe #wetterapp #ki #garten2025 #rasenpflegeprofi #innovation'
            },
            {
              type: 'story',
              caption: `🚀 GAME CHANGER! 

Rasenpilot + Wetter = Perfekte Rasenpflege! 

Jetzt mit PLZ-Eingabe für lokale Empfehlungen 📍🌤️`,
              hashtags: '#rasenpilot #update #neu #rasenpflege'
            },
            {
              type: 'carousel',
              caption: `📸 SO FUNKTIONIERT'S - RASENPILOT WETTER-UPDATE:

Swipe für alle neuen Features! 👆

1️⃣ Foto uploaden wie gewohnt
2️⃣ PLZ eingeben (neu!) 📍
3️⃣ KI analysiert + holt Wetterdaten 
4️⃣ Perfekte Timing-Empfehlungen erhalten!

Beispiel: "Heute düngen - morgen Regen zum Einspülen" 🌧️

Oder: "3 Tage warten - zu heiß für Rasen" 🌡️

So einfach, so präzise! Dein Rasen wird es dir danken 💚`,
              hashtags: '#tutorial #rasenpilot #anleitung #rasenpflege #smartgarden #gartentipps #innovation'
            }
          ]
        };
      }

      if (postsData?.posts) {
        setPosts(postsData.posts);
      }

      toast({
        title: "✅ Instagram Posts generiert!",
        description: "Deine Social Media Inhalte sind bereit zum Posten.",
      });

    } catch (error) {
      console.error('Error generating Instagram posts:', error);
      toast({
        title: "❌ Fehler",
        description: "Posts konnten nicht generiert werden.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, hashtags: string) => {
    const fullText = `${text}\n\n${hashtags}`;
    navigator.clipboard.writeText(fullText);
    toast({
      title: "📋 Kopiert!",
      description: "Post wurde in die Zwischenablage kopiert.",
    });
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'feed': return 'bg-blue-100 text-blue-800';
      case 'story': return 'bg-purple-100 text-purple-800';
      case 'carousel': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'feed': return 'Feed Post';
      case 'story': return 'Story';
      case 'carousel': return 'Carousel';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-pink-500" />
            Instagram Posts Generator
          </CardTitle>
          <p className="text-sm text-gray-600">
            Erstelle professionelle Instagram-Posts über das Wetter-Integration Update
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={generateInstagramPosts}
            disabled={isGenerating}
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generiere Posts...' : 'Instagram Posts erstellen'}
          </Button>
        </CardContent>
      </Card>

      {posts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Generierte Posts:</h3>
          
          {posts.map((post, index) => (
            <Card key={index} className="relative">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Badge className={getPostTypeColor(post.type)}>
                    {getPostTypeLabel(post.type)}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(post.caption, post.hashtags)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Kopieren
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Caption:</label>
                  <Textarea
                    value={post.caption}
                    readOnly
                    className="mt-1"
                    rows={6}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Hashtags:</label>
                  <Textarea
                    value={post.hashtags}
                    readOnly
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div className="text-xs text-gray-500">
                  Zeichen: {post.caption.length} | 
                  Wörter: {post.caption.split(' ').length} |
                  Hashtags: {post.hashtags.split('#').length - 1}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {posts.length === 0 && (
        <Card className="text-center p-8">
          <Instagram className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            Klicke auf "Instagram Posts erstellen", um loszulegen!
          </p>
        </Card>
      )}
    </div>
  );
};

export default InstagramPostGenerator;