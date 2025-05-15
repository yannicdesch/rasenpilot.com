
import React, { useEffect } from 'react';
import MainNavigation from '@/components/MainNavigation';
import { Button } from '@/components/ui/button';
import SEOContentEditor from '@/components/SEOContentEditor';
import { Book, ArrowRight, FileText, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLawn } from '@/context/LawnContext';
import { Helmet } from 'react-helmet-async';

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
      <Helmet>
        <title>SEO Management - Rasenpilot</title>
        <meta name="description" content="Optimieren Sie Ihre Website-Inhalte für bessere Sichtbarkeit in Suchmaschinen mit Rasenpilot's SEO-Tools." />
        <meta name="keywords" content="SEO, Rasenpflege, Content-Management, Suchmaschinenoptimierung" />
        <link rel="canonical" href="https://rasenpilot.de/seo-management" />
        <meta property="og:title" content="SEO Management - Rasenpilot" />
        <meta property="og:description" content="Optimieren Sie Ihre Website-Inhalte für bessere Sichtbarkeit in Suchmaschinen mit Rasenpilot's SEO-Tools." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rasenpilot.de/seo-management" />
      </Helmet>
      
      <MainNavigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-green-800 flex items-center gap-2">
                <Book className="h-8 w-8" />
                SEO-Inhalte verwalten
              </h1>
              <p className="text-gray-600 mt-2">
                Optimieren Sie Ihre Website-Inhalte für bessere Sichtbarkeit in Suchmaschinen
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
          </div>

          <SEOContentEditor />

          <div className="mt-8 bg-green-50 p-6 rounded-lg border border-green-100">
            <h2 className="text-xl font-semibold text-green-800 mb-3 flex items-center gap-2">
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default SEOManagement;
