import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/components/ui/use-toast';
import { Brain, Calendar, RefreshCw, Settings, Target } from 'lucide-react';
import { useAiBlogGenerator } from '@/hooks/useAiBlogGenerator';

const AiBlogGenerator = () => {
  const { settings, updateSettings, toggleScheduler, addTopic, removeTopic, generateBlogPost } = useAiBlogGenerator();
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState('');

  const handleGeneratePosts = async () => {
    setIsLoading(true);
    
    try {
      const result = await generateBlogPost();
      
      if (result.success) {
        toast({
          title: `${result.posts?.length || 0} neue Blogbeiträge erstellt`,
          description: "Die Beiträge wurden erfolgreich generiert und sind jetzt verfügbar."
        });
      } else {
        throw new Error('Generation failed');
      }
    } catch (error) {
      console.error('Error generating blog posts:', error);
      toast({
        title: "Fehler",
        description: "Bei der Generierung der Blogbeiträge ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleIntervalChange = (value: number[]) => {
    updateSettings({ postsPerInterval: value[0] });
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
          KI-Blogbeitrag Generator - Täglich 2 Posts
        </CardTitle>
        <CardDescription>
          Automatisch täglich 2 SEO-optimierte Blogbeiträge generieren für bessere Google-Auffindbarkeit
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Automatische Generierung
            </h3>
            <p className="text-sm text-muted-foreground">
              Täglich {settings.postsPerInterval} neue SEO-optimierte Blogbeiträge erstellen
            </p>
          </div>
          <Switch
            checked={settings.isEnabled}
            onCheckedChange={toggleScheduler}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-green-600" />
            <Label>Posts pro Tag: {settings.postsPerInterval}</Label>
          </div>
          <Slider
            value={[settings.postsPerInterval]}
            onValueChange={handleIntervalChange}
            max={5}
            min={1}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Empfohlen: 2 Posts täglich für optimale SEO-Performance
          </p>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-base font-medium">Zeitplan & Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="bg-green-50 p-3 rounded-md">
              <p className="text-sm font-medium text-green-800">Heute generiert</p>
              <p className="text-lg font-bold text-green-800">{settings.generatedToday}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-base font-medium">SEO-optimierte Themen</h3>
          <div className="flex space-x-2">
            <Input
              placeholder="Neues SEO-Thema hinzufügen"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTopic(topic)}
            />
            <Button 
              variant="outline" 
              onClick={() => addTopic(topic)}
            >
              Hinzufügen
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3 max-h-32 overflow-y-auto">
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
          <p className="text-xs text-muted-foreground">
            {settings.topics.length} Themen verfügbar - Jeder Post verwendet ein einzigartiges Thema
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          <p>🎯 SEO-optimierte Inhalte für bessere Google-Rankings</p>
          <p>📈 Täglich frischer Content für mehr Traffic</p>
        </div>
        <Button
          onClick={handleGeneratePosts}
          disabled={isLoading || settings.topics.length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              Generiere {settings.postsPerInterval} Posts...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              {settings.postsPerInterval} Posts jetzt generieren
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AiBlogGenerator;
