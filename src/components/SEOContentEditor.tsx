
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { FileText, Book, BookOpen, Search } from 'lucide-react';
import { toast } from './ui/use-toast';

export type SEOContentType = {
  title: string;
  description: string;
  keywords: string;
  content: string;
  lastUpdated?: string;
}

const initialContent: SEOContentType = {
  title: 'Rasenpflege für den perfekten Rasen - Expertentipps',
  description: 'Entdecken Sie die besten Tipps und Techniken für die Rasenpflege. Mit unserem kostenlosen Rasen-Check und individuellen Pflegeplänen zu einem gesunden, grünen Rasen.',
  keywords: 'Rasenpflege, Rasen düngen, Rasen mähen, gesunder Rasen, Rasen-Check, Rasenpilot',
  content: 'Ein perfekter Rasen beginnt mit der richtigen Pflege. Regelmäßiges Mähen, ausreichende Bewässerung und gezielte Düngung sind die Grundlagen für einen gesunden, grünen Rasen. Mit unserem kostenlosen Rasen-Check erhalten Sie einen individuellen Pflegeplan, der genau auf Ihren Standort, Rasentyp und Ihre Ziele abgestimmt ist.',
  lastUpdated: new Date().toISOString()
}

const SEOContentEditor = () => {
  const [seoContent, setSEOContent] = useState<SEOContentType>(initialContent);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  
  useEffect(() => {
    // Try to load saved SEO content on mount
    const savedSeoContent = localStorage.getItem('seoContent');
    if (savedSeoContent) {
      try {
        const parsedContent = JSON.parse(savedSeoContent);
        setSEOContent(parsedContent);
      } catch (e) {
        console.error("Error parsing saved SEO content:", e);
      }
    }
  }, []);

  const handleChange = (field: keyof SEOContentType, value: string) => {
    setSEOContent(prev => ({
      ...prev,
      [field]: value
    }));
    setSavedStatus(null);
  };

  const handleSave = () => {
    // Update the lastUpdated timestamp
    const updatedContent = {
      ...seoContent,
      lastUpdated: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('seoContent', JSON.stringify(updatedContent));
    setSEOContent(updatedContent);
    setSavedStatus('Inhalte erfolgreich gespeichert!');
    
    // Show toast notification
    toast({
      title: "SEO-Inhalte gespeichert",
      description: "Ihre SEO-Inhalte wurden erfolgreich aktualisiert.",
    });
    
    setTimeout(() => {
      setSavedStatus(null);
    }, 3000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          SEO-Inhalte verwalten
        </CardTitle>
        <CardDescription>
          Bearbeiten Sie Ihre SEO-Inhalte für bessere Sichtbarkeit in Suchmaschinen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="metadata" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="metadata" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Meta-Daten
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Hauptinhalt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metadata" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="seo-title">SEO Titel</Label>
              <Input 
                id="seo-title"
                value={seoContent.title} 
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full"
                placeholder="Titel für Suchmaschinen"
              />
              <p className="text-xs text-muted-foreground">
                {seoContent.title.length}/60 Zeichen (Empfohlen: 50-60)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-description">Meta-Beschreibung</Label>
              <Textarea 
                id="seo-description"
                value={seoContent.description} 
                onChange={(e) => handleChange('description', e.target.value)}
                className="min-h-24 resize-y w-full"
                placeholder="Beschreibungstext für Suchmaschinen"
              />
              <p className="text-xs text-muted-foreground">
                {seoContent.description.length}/160 Zeichen (Empfohlen: 150-160)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-keywords">Keywords (mit Kommas getrennt)</Label>
              <Input 
                id="seo-keywords"
                value={seoContent.keywords} 
                onChange={(e) => handleChange('keywords', e.target.value)}
                className="w-full"
                placeholder="z.B. Rasenpflege, Rasen mähen, Rasen düngen"
              />
            </div>
          </TabsContent>

          <TabsContent value="content" className="pt-4">
            <div className="space-y-2">
              <Label htmlFor="seo-content">SEO-optimierter Hauptinhalt</Label>
              <Textarea 
                id="seo-content"
                value={seoContent.content} 
                onChange={(e) => handleChange('content', e.target.value)}
                className="min-h-[250px] resize-y w-full"
                placeholder="Hier können Sie SEO-optimierten Content erstellen..."
              />
              <p className="text-xs text-muted-foreground">
                {seoContent.content.length} Zeichen (Empfohlen: mindestens 300)
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        {seoContent.lastUpdated && (
          <p className="text-xs text-gray-500">
            Zuletzt aktualisiert: {new Date(seoContent.lastUpdated).toLocaleDateString('de-DE')}
          </p>
        )}
        {savedStatus && (
          <p className="text-sm text-green-600">{savedStatus}</p>
        )}
        <Button 
          onClick={handleSave} 
          className="ml-auto bg-green-600 hover:bg-green-700"
        >
          Änderungen speichern
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SEOContentEditor;
