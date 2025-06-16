import React, { useEffect } from 'react';
import MainNavigation from '@/components/MainNavigation';
import { Button } from '@/components/ui/button';
import SEOContentEditor from '@/components/SEOContentEditor';
import SitemapViewer from '@/components/SitemapViewer';
import { Book, ArrowRight, FileText, Globe, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLawn } from '@/context/LawnContext';
import SEO from '@/components/SEO';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SEOManagement = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useLawn();
  
  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <SEO 
        title="SEO Management - Optimieren Sie Ihre Website-Inhalte"
        description="Optimieren Sie Ihre Website-Inhalte für bessere Sichtbarkeit in Suchmaschinen mit Rasenpilot's SEO-Tools."
        canonical="/seo-management"
        noindex={true}
      />
      
      <MainNavigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-green-800 flex items-center gap-2">
                <Book className="h-8 w-8" />
                SEO Management
              </h1>
              <p className="text-gray-600 mt-2">
                Optimieren Sie Ihre Website-Inhalte und -Struktur für Suchmaschinen.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                Zurück zum Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => navigate('/blog')}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                Zum Blog
                <FileText className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Inhalte
              </TabsTrigger>
              <TabsTrigger value="sitemap" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                Sitemap
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-6">
              <section aria-labelledby="content-editor">
                <h2 id="content-editor" className="sr-only">SEO Content Editor</h2>
                <SEOContentEditor />
              </section>
            </TabsContent>

            <TabsContent value="sitemap" className="mt-6">
                <SitemapViewer />
            </TabsContent>
          </Tabs>

          <section aria-labelledby="seo-tips" className="mt-8 bg-green-50 p-6 rounded-lg border border-green-100">
            <h2 id="seo-tips" className="text-xl font-semibold text-green-800 mb-3 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              SEO-Tipps für Rasen-Inhalte
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li>• Verwenden Sie Langform-Keywords wie "Wie kann ich meinen Rasen im Sommer grün halten?"</li>
              <li>• Fügen Sie lokale Keywords ein, z.B. "Rasenpflege in Deutschland"</li>
              <li>• Integrieren Sie saisonale Inhalte, die zu aktuellen Pflegearbeiten passen</li>
              <li>• Schreiben Sie informativ und hilfreich für Ihre Zielgruppe</li>
              <li>• Aktualisieren Sie Inhalte regelmäßig mit neuen Informationen</li>
              <li>• Nutzen Sie strukturierte Daten für bessere Sichtbarkeit in Suchergebnissen</li>
              <li>• Optimieren Sie Ihre Bilder mit ALT-Text und beschreibenden Dateinamen</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SEOManagement;
