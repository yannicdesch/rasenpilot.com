
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { Brain, Calendar, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type BlogScheduleSettings = {
  isEnabled: boolean;
  interval: number; // days
  topics: string[];
  lastGenerated: string | null;
  nextScheduled: string | null;
};

const DEFAULT_SETTINGS: BlogScheduleSettings = {
  isEnabled: false,
  interval: 2,
  topics: ['Rasenpflege', 'Rasenmähen', 'Düngen', 'Bewässerung', 'Rasenkrankheiten'],
  lastGenerated: null,
  nextScheduled: null
};

const AiBlogGenerator = () => {
  const [settings, setSettings] = useState<BlogScheduleSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState('');

  // Load settings from localStorage on component mount
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('aiBlogSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (e) {
        console.error('Error parsing saved blog settings:', e);
      }
    }
    
    // Check if we need to generate a new post (if enabled)
    const checkSchedule = async () => {
      const settings = localStorage.getItem('aiBlogSettings');
      if (!settings) return;
      
      const parsedSettings = JSON.parse(settings);
      if (!parsedSettings.isEnabled || !parsedSettings.nextScheduled) return;
      
      const nextDate = new Date(parsedSettings.nextScheduled);
      const now = new Date();
      
      if (nextDate <= now) {
        await generateBlogPost();
      }
    };
    
    checkSchedule();
  }, []);

  // Save settings to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('aiBlogSettings', JSON.stringify(settings));
  }, [settings]);

  const toggleScheduler = (enabled: boolean) => {
    const now = new Date();
    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + settings.interval);
    
    setSettings({
      ...settings,
      isEnabled: enabled,
      nextScheduled: enabled ? nextDate.toISOString() : null
    });
    
    toast({
      title: enabled ? "KI-Blogbeiträge aktiviert" : "KI-Blogbeiträge deaktiviert",
      description: enabled 
        ? `Der nächste Beitrag wird am ${nextDate.toLocaleDateString('de-DE')} generiert.`
        : "Die automatische Generierung wurde gestoppt."
    });
  };

  const addTopic = () => {
    if (!topic.trim()) return;
    if (settings.topics.includes(topic.trim())) {
      toast({
        title: "Thema existiert bereits",
        description: "Dieses Thema ist bereits in der Liste enthalten.",
        variant: "destructive"
      });
      return;
    }
    
    setSettings({
      ...settings,
      topics: [...settings.topics, topic.trim()]
    });
    setTopic('');
  };

  const removeTopic = (topicToRemove: string) => {
    setSettings({
      ...settings,
      topics: settings.topics.filter(t => t !== topicToRemove)
    });
  };

  const generateBlogPost = async () => {
    setIsLoading(true);
    
    try {
      // Select a random topic from the list
      const randomTopic = settings.topics[Math.floor(Math.random() * settings.topics.length)];
      
      // In a real implementation, this would call an AI service
      // For demo purposes, we'll generate a simple post
      const title = `${randomTopic}: Die besten Tipps für Ihren Rasen`;
      const content = await simulateAiGeneration(randomTopic);
      
      // Create a new blog post
      const newPost = {
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
        readTime: Math.floor(content.length / 1000) + 2, // ~200 words per minute
        tags: generateRandomTags(randomTopic),
        date: new Date().toISOString().split('T')[0],
        seo: {
          metaTitle: title,
          metaDescription: content.substring(0, 150) + '...',
          keywords: randomTopic + ', Rasen, Gartenpflege, ' + generateRandomTags(randomTopic).join(', ')
        }
      };
      
      // Save to localStorage
      const savedPosts = localStorage.getItem('blogPosts');
      let posts = savedPosts ? JSON.parse(savedPosts) : [];
      posts.push(newPost);
      localStorage.setItem('blogPosts', JSON.stringify(posts));
      
      // Update settings
      const now = new Date();
      const nextDate = new Date(now);
      nextDate.setDate(now.getDate() + settings.interval);
      
      setSettings({
        ...settings,
        lastGenerated: now.toISOString(),
        nextScheduled: settings.isEnabled ? nextDate.toISOString() : null
      });
      
      toast({
        title: "Neuer Blogbeitrag erstellt",
        description: `"${title}" wurde erfolgreich generiert.`
      });
    } catch (error) {
      console.error('Error generating blog post:', error);
      toast({
        title: "Fehler",
        description: "Bei der Generierung des Blogbeitrags ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate AI content generation with a delay
  const simulateAiGeneration = async (topic: string): Promise<string> => {
    // In a real app, you would call a language model API here
    return new Promise(resolve => {
      setTimeout(() => {
        const templates = [
          `Ein gesunder ${topic} ist der Traum vieler Gartenbesitzer. In diesem Blogbeitrag erfahren Sie die wichtigsten Tipps zur richtigen Pflege. \n\nZunächst ist es wichtig, den Boden richtig vorzubereiten. Ein guter, nährstoffreicher Boden ist die Basis für jeden erfolgreichen Rasen. Regelmäßiges Düngen, etwa alle 6-8 Wochen während der Wachstumsphase, versorgt Ihren Rasen mit allen notwendigen Nährstoffen.\n\nDas Mähen ist ein weiterer wichtiger Aspekt. Mähen Sie nicht zu kurz - die ideale Höhe liegt zwischen 3-5 cm. Zu kurz gemähter Rasen trocknet schneller aus und bietet Unkraut mehr Chancen, sich zu etablieren.\n\nDie Bewässerung sollte gründlich, aber nicht zu häufig erfolgen. Besser einmal pro Woche gründlich wässern als täglich ein bisschen. So entwickeln die Wurzeln eine größere Tiefe und der Rasen wird insgesamt widerstandsfähiger gegen Trockenheit.\n\nProbleme wie Moos oder Unkraut können durch regelmäßige Pflege vorgebeugt werden. Ein gesunder, dichter Rasen lässt kaum Platz für unerwünschte Pflanzen.\n\nMit diesen Tipps wird Ihr ${topic} bald der Neid der Nachbarschaft sein!`,
          
          `${topic} ist ein wichtiger Bestandteil jedes schönen Gartens. Hier sind die besten Methoden, um optimale Ergebnisse zu erzielen.\n\nDie richtige Bodenvorbereitung ist entscheidend. Entfernen Sie Steine und Wurzeln, und sorgen Sie für eine gute Drainage. Der pH-Wert sollte zwischen 5,5 und 7,0 liegen - ein leicht saurer bis neutraler Boden ist ideal für die meisten Rasensorten.\n\nDie Wahl der richtigen Rasensaat hängt von verschiedenen Faktoren ab: Wie stark wird der Rasen genutzt? Wie viel Sonnenlicht erhält er? Gibt es schattige Bereiche? Für stark beanspruchte Flächen empfehlen sich robuste Rasenmischungen mit hohem Anteil an Deutschem Weidelgras.\n\nNach der Aussaat ist die konsequente Pflege wichtig. In den ersten Wochen sollte der Boden stets feucht, aber nicht durchnässt sein. Der erste Schnitt erfolgt, wenn der Rasen eine Höhe von etwa 8-10 cm erreicht hat.\n\nRegelmäßiges Vertikutieren (1-2 Mal im Jahr) entfernt Rasenfilz und sorgt für bessere Luft- und Wasserzirkulation im Boden. Kombiniert mit einer Düngung im Frühjahr, Sommer und Herbst bleibt Ihr ${topic} das ganze Jahr über gesund und grün.`,
          
          `Einen perfekten ${topic} zu pflegen erfordert Wissen und Konsequenz. Diese professionellen Tipps helfen Ihnen dabei.\n\nDie Bodenqualität ist der Schlüssel zum Erfolg. Ein lockerer, nährstoffreicher Boden mit guter Durchlässigkeit bildet die Grundlage für jeden gesunden Rasen. Bei schweren Böden kann die Einarbeitung von Sand die Drainage verbessern.\n\nBei der Düngung gilt: Lieber weniger, dafür regelmäßiger. Organische Dünger setzen Nährstoffe langsamer frei und schonen die Umwelt. Im Frühjahr ist ein stickstoffbetonter Dünger ideal, im Herbst sollte der Kaliumanteil höher sein, um die Winterhärte zu fördern.\n\nDie richtige Schnitthöhe variiert je nach Jahreszeit. Im Sommer sollte der Rasen etwas länger bleiben (4-5 cm), um Austrocknung zu vermeiden. Im Frühjahr und Herbst kann kürzer gemäht werden (3-4 cm).\n\nProbleme wie Moos oder Klee zeigen oft Mängel an: Moos deutet auf Verdichtung, Nässe oder Nährstoffmangel hin, während Klee auf einen Stickstoffmangel hinweist.\n\nMit einem konsequenten Pflegeplan, der auf die Bedürfnisse Ihres spezifischen ${topic}s abgestimmt ist, werden Sie schnell Verbesserungen sehen.`
        ];
        
        const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
        resolve(randomTemplate);
      }, 1500);
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nicht geplant';
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-green-600" />
          KI-Blogbeitrag Generator
        </CardTitle>
        <CardDescription>
          Automatisch KI-generierte Blogbeiträge in regelmäßigen Abständen erstellen
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-medium">Automatische Beiträge</h3>
            <p className="text-sm text-muted-foreground">
              Alle {settings.interval} Tage einen neuen Blogbeitrag generieren
            </p>
          </div>
          <Switch
            checked={settings.isEnabled}
            onCheckedChange={toggleScheduler}
          />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-base font-medium">Zeitplan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                Letzter Beitrag
              </p>
              <p className="text-sm mt-1">
                {settings.lastGenerated ? formatDate(settings.lastGenerated) : 'Noch kein Beitrag generiert'}
              </p>
            </div>
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                Nächster Beitrag
              </p>
              <p className="text-sm mt-1">
                {settings.isEnabled 
                  ? formatDate(settings.nextScheduled)
                  : 'Automatische Generierung deaktiviert'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-base font-medium">Themen für KI-Blogbeiträge</h3>
          <div className="flex space-x-2">
            <Input
              placeholder="Neues Thema hinzufügen"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTopic()}
            />
            <Button 
              variant="outline" 
              onClick={addTopic}
            >
              Hinzufügen
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            {settings.topics.map((topic) => (
              <div 
                key={topic} 
                className="bg-green-100 text-green-800 text-xs px-3 py-1.5 rounded-full flex items-center gap-2"
              >
                {topic}
                <button 
                  onClick={() => removeTopic(topic)}
                  className="text-green-800 hover:text-green-950 focus:outline-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          KI-generierte Beiträge erscheinen automatisch in Ihrem Blog
        </p>
        <Button
          onClick={generateBlogPost}
          disabled={isLoading || settings.topics.length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              Generiere...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Jetzt generieren
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AiBlogGenerator;
