
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Sitemap, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { generateSitemap, generateSitemapUrls } from '@/lib/sitemapGenerator';

const SitemapViewer = () => {
  const [sitemapXml, setSitemapXml] = useState('');

  useEffect(() => {
    const urls = generateSitemapUrls();
    const xml = generateSitemap(urls);
    setSitemapXml(xml);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(sitemapXml);
    toast.success('Sitemap-XML in die Zwischenablage kopiert!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sitemap className="h-5 w-5" />
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
      <CardFooter className="flex justify-end">
        <Button onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          In die Zwischenablage kopieren
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SitemapViewer;
