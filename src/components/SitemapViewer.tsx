
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Map, Copy, Save } from 'lucide-react';
import { toast } from 'sonner';
import { generateSitemap, generateSitemapUrls } from '@/lib/sitemapGenerator';

const SitemapViewer = () => {
  const [sitemapXml, setSitemapXml] = useState('');

  useEffect(() => {
    const urls = generateSitemapUrls();
    const xml = generateSitemap(urls);
    setSitemapXml(xml);
    
    // Automatically update public/sitemap.xml
    updatePublicSitemap(xml);
  }, []);

  const updatePublicSitemap = async (xml: string) => {
    try {
      // Create a blob and download link to update the sitemap file
      const blob = new Blob([xml], { type: 'text/xml' });
      const url = URL.createObjectURL(blob);
      
      // Create a download link and trigger it
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Sitemap automatisch generiert! Bitte laden Sie die Datei in den public/ Ordner hoch.');
    } catch (error) {
      console.error('Fehler beim Generieren der Sitemap:', error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sitemapXml);
    toast.success('Sitemap-XML in die Zwischenablage kopiert!');
  };

  const handleManualUpdate = () => {
    updatePublicSitemap(sitemapXml);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5" />
          Dynamische Sitemap
        </CardTitle>
        <CardDescription>
          Dies ist der Inhalt für Ihre <code>sitemap.xml</code>. Er wird automatisch basierend auf Ihren Blog-Beiträgen und Seiten generiert. Halten Sie Ihre <code>public/sitemap.xml</code> aktuell, um die SEO zu verbessern.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          readOnly
          value={sitemapXml}
          className="min-h-[300px] resize-y w-full font-mono text-xs"
          placeholder="Sitemap wird generiert..."
        />
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button onClick={handleCopy} variant="outline">
          <Copy className="mr-2 h-4 w-4" />
          In die Zwischenablage kopieren
        </Button>
        <Button onClick={handleManualUpdate}>
          <Save className="mr-2 h-4 w-4" />
          Sitemap herunterladen
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SitemapViewer;
