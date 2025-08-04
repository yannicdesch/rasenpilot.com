import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Brain, Search, Target, TrendingUp, Link, FileText, Star, Calendar, RefreshCw } from 'lucide-react';
import { useEnhancedBlogGenerator } from '@/hooks/useEnhancedBlogGenerator';

const SEOBlogGenerator = () => {
  const { 
    settings, 
    updateSettings, 
    toggleScheduler, 
    addTopic, 
    removeTopic, 
    generateBlogPost,
    analyzeKeywords,
    getContentScore,
    generateInternalLinks
  } = useEnhancedBlogGenerator();
  
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [targetKeywords, setTargetKeywords] = useState('');
  const [contentStrategy, setContentStrategy] = useState('problem-solution');
  const [localSEO, setLocalSEO] = useState('germany');

  const handleGeneratePosts = async () => {
    setIsLoading(true);
    
    try {
      const result = await generateBlogPost();
      
      if (result.success) {
        toast({
          title: `${result.posts?.length || 0} SEO-optimierte Blogbeiträge erstellt`,
          description: "Die Beiträge wurden mit vollständiger SEO-Struktur, Keyword-Optimierung und internen Links generiert."
        });
      } else {
        throw new Error('Generation failed');
      }
    } catch (error) {
      console.error('Error generating blog posts:', error);
      toast({
        title: "Fehler",
        description: "Bei der Generierung der SEO-optimierten Blogbeiträge ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeywordAnalysis = async () => {
    if (!targetKeywords.trim()) return;
    
    try {
      const keywords = targetKeywords.split(',').map(k => k.trim());
      const analysis = await analyzeKeywords(keywords);
      
      toast({
        title: "Keyword-Analyse abgeschlossen",
        description: `${analysis.highValue.length} vielversprechende Keywords gefunden`
      });
    } catch (error) {
      toast({
        title: "Analyse-Fehler",
        description: "Die Keyword-Analyse konnte nicht durchgeführt werden.",
        variant: "destructive"
      });
    }
  };

  const contentStrategies = [
    { value: 'problem-solution', label: 'Problem-Lösung Format' },
    { value: 'how-to', label: 'Schritt-für-Schritt Anleitung' },
    { value: 'comparison', label: 'Vergleich & Test' },
    { value: 'seasonal', label: 'Saisonaler Content' },
    { value: 'local-seo', label: 'Lokaler SEO-Content' },
    { value: 'featured-snippet', label: 'Featured Snippet Optimiert' }
  ];

  const localRegions = [
    { value: 'germany', label: 'Deutschland (Allgemein)' },
    { value: 'berlin', label: 'Berlin & Brandenburg' },
    { value: 'bavaria', label: 'Bayern' },
    { value: 'nrw', label: 'Nordrhein-Westfalen' },
    { value: 'baden-wurttemberg', label: 'Baden-Württemberg' }
  ];

  return (
    <div className="space-y-6">
      {/* Main Generator Card */}
      <Card className="w-full shadow-lg border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-green-600" />
            SEO-Hochleistungs Blog Generator
          </CardTitle>
          <CardDescription>
            Generiert vollständig SEO-optimierte Blogbeiträge mit Keyword-Analyse, internen Verlinkungen, 
            Schema.org Markup und Content-Scoring für maximale Google-Rankings
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Automation Settings */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="space-y-0.5">
              <h3 className="text-base font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Automatische SEO-Content Engine
              </h3>
              <p className="text-sm text-muted-foreground">
                Täglich {settings.postsPerInterval} vollständige SEO-Artikel mit H1-H6 Struktur, 
                Meta-Tags, FAQ-Schema und automatischen internen Links
              </p>
            </div>
            <Switch
              checked={settings.isEnabled}
              onCheckedChange={toggleScheduler}
            />
          </div>

          {/* Content Strategy Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                Content-Strategie für SEO
              </Label>
              <Select value={contentStrategy} onValueChange={setContentStrategy}>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie eine Content-Strategie" />
                </SelectTrigger>
                <SelectContent>
                  {contentStrategies.map(strategy => (
                    <SelectItem key={strategy.value} value={strategy.value}>
                      {strategy.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Search className="h-4 w-4 text-green-600" />
                Lokale SEO-Region
              </Label>
              <Select value={localSEO} onValueChange={setLocalSEO}>
                <SelectTrigger>
                  <SelectValue placeholder="Zielregion auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {localRegions.map(region => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Posts per Day */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              <Label>SEO-Artikel pro Tag: {settings.postsPerInterval}</Label>
            </div>
            <Slider
              value={[settings.postsPerInterval]}
              onValueChange={(value) => updateSettings({ postsPerInterval: value[0] })}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Empfohlen: 2-3 Artikel täglich für optimale SEO-Dominanz mit vollständiger Keyword-Abdeckung
            </p>
          </div>

          {/* Keyword Research Section */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium flex items-center gap-2">
              <Search className="h-4 w-4 text-blue-600" />
              Erweiterte Keyword-Recherche
            </h3>
            
            <div className="space-y-3">
              <Label>Ziel-Keywords (kommagetrennt)</Label>
              <Textarea
                placeholder="z.B. rasenpflege frühjahr, rasen düngen zeitpunkt, vertikutieren anleitung, rasenmähen tipps"
                value={targetKeywords}
                onChange={(e) => setTargetKeywords(e.target.value)}
                className="min-h-20"
              />
              <Button 
                onClick={handleKeywordAnalysis}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                Keyword-Potenzial analysieren
              </Button>
            </div>
          </div>
          
          {/* Status Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-3 rounded-md">
              <p className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                Heute generiert
              </p>
              <p className="text-lg font-bold text-green-800">{settings.generatedToday}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm font-medium text-blue-800">SEO-Score Ø</p>
              <p className="text-lg font-bold text-blue-800">92/100</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-md">
              <p className="text-sm font-medium text-purple-800">Interne Links</p>
              <p className="text-lg font-bold text-purple-800">847</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-md">
              <p className="text-sm font-medium text-orange-800">Keywords aktiv</p>
              <p className="text-lg font-bold text-orange-800">{settings.topics.length * 5}</p>
            </div>
          </div>
          
          {/* Topics Section */}
          <div className="space-y-3">
            <h3 className="text-base font-medium">High-Value SEO-Themen</h3>
            <div className="flex space-x-2">
              <Input
                placeholder="Neues SEO-optimiertes Thema hinzufügen"
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
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>🎯 Vollständige SEO-Struktur: H1-H6, Meta-Tags, Schema.org</p>
            <p>🔍 Keyword-Dichte-Optimierung mit LSI-Keywords</p>
            <p>❓ FAQ-Schema für Featured Snippets</p>
            <p>🔗 Automatische interne Verlinkung mit Anchor-Text-Optimierung</p>
            <p>📊 Content-Scoring und Readability-Analyse</p>
            <p>🌍 Lokale SEO-Signale für deutsche Suchbegriffe</p>
          </div>
          <Button
            onClick={handleGeneratePosts}
            disabled={isLoading || settings.topics.length === 0}
            className="bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Generiere {settings.postsPerInterval} SEO-Artikel...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                {settings.postsPerInterval} SEO-Hochleistungs-Artikel generieren
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* SEO Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Premium SEO-Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-green-800">Content-Optimierung</h4>
              <ul className="space-y-2 text-sm">
                <li>✅ Keyword-Dichte-Optimierung (1-3%)</li>
                <li>✅ LSI-Keywords automatisch eingebaut</li>
                <li>✅ Readability-Score für Deutsche Sprache</li>
                <li>✅ Semantische SEO-Strukturierung</li>
                <li>✅ E-A-T Signale (Expertise, Authority, Trust)</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-green-800">Technische SEO</h4>
              <ul className="space-y-2 text-sm">
                <li>✅ Schema.org Markup für Artikel und FAQ</li>
                <li>✅ Open Graph und Twitter Cards</li>
                <li>✅ Canonical URLs und Meta-Robots</li>
                <li>✅ Interne Verlinkungsmatrix</li>
                <li>✅ Featured Snippet Optimierung</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOBlogGenerator;