import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Search, 
  Link, 
  BarChart3, 
  Eye, 
  Target,
  RefreshCw,
  Star,
  Calendar,
  Download
} from 'lucide-react';
import SEOBlogGenerator from './SEOBlogGenerator';
import SEOContentAnalyzer from './SEOContentAnalyzer';

interface BlogSEOStats {
  totalPosts: number;
  averageSEOScore: number;
  totalKeywords: number;
  internalLinks: number;
  monthlyTraffic: number;
  rankingKeywords: number;
}

const BlogSEODashboard = () => {
  const [stats, setStats] = useState<BlogSEOStats>({
    totalPosts: 127,
    averageSEOScore: 92,
    totalKeywords: 1847,
    internalLinks: 634,
    monthlyTraffic: 24567,
    rankingKeywords: 892
  });

  const [competitorAnalysis, setCompetitorAnalysis] = useState([
    { domain: 'mein-schoener-garten.de', ranking: 15, keywords: 45000, traffic: 890000 },
    { domain: 'gartenjournal.net', ranking: 8, keywords: 12000, traffic: 150000 },
    { domain: 'gartentipps.com', ranking: 12, keywords: 8500, traffic: 95000 }
  ]);

  const [topPerformingPosts, setTopPerformingPosts] = useState([
    { title: 'Rasen düngen im Frühjahr - Der ultimative Guide 2025', views: 12450, ranking: 1, keywords: 15 },
    { title: 'Moos im Rasen bekämpfen: 7 natürliche Methoden', views: 9876, ranking: 2, keywords: 12 },
    { title: 'Rasenpflege München: Lokaler Expertenratgeber', views: 8234, ranking: 1, keywords: 8 },
    { title: 'Vertikutieren Anleitung 2025: Profi-Tipps', views: 7654, ranking: 3, keywords: 10 }
  ]);

  const [keywordOpportunities, setKeywordOpportunities] = useState([
    { keyword: 'rasen kalken zeitpunkt 2025', volume: 2400, difficulty: 'Medium', currentRank: null },
    { keyword: 'rasenpflege roboter test', volume: 1800, difficulty: 'High', currentRank: null },
    { keyword: 'englischer rasen anlegen kosten', volume: 1200, difficulty: 'Low', currentRank: null },
    { keyword: 'rasen nachsäen herbst anleitung', volume: 3100, difficulty: 'Medium', currentRank: 15 }
  ]);

  const exportSEOReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      stats,
      topPerformingPosts,
      keywordOpportunities,
      competitorAnalysis
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rasenpilot-seo-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* SEO Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blog Posts</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalPosts}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ø SEO Score</p>
                <p className="text-2xl font-bold text-blue-600">{stats.averageSEOScore}/100</p>
              </div>
              <Star className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Keywords</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalKeywords.toLocaleString()}</p>
              </div>
              <Search className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Int. Links</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.internalLinks}</p>
              </div>
              <Link className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Traffic/Monat</p>
                <p className="text-2xl font-bold text-orange-600">{stats.monthlyTraffic.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rankings</p>
                <p className="text-2xl font-bold text-red-600">{stats.rankingKeywords}</p>
              </div>
              <Target className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="generator" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList className="grid w-auto grid-cols-4">
            <TabsTrigger value="generator">SEO Generator</TabsTrigger>
            <TabsTrigger value="analyzer">Content Analyzer</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          </TabsList>
          
          <Button onClick={exportSEOReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            SEO Report exportieren
          </Button>
        </div>

        <TabsContent value="generator">
          <SEOBlogGenerator />
        </TabsContent>

        <TabsContent value="analyzer">
          <SEOContentAnalyzer />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Top Performing Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Top Performance Posts
              </CardTitle>
              <CardDescription>
                Ihre bestperformenden Blogbeiträge basierend auf Traffic und Rankings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformingPosts.map((post, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{post.title}</h4>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500">
                          <Eye className="h-3 w-3 inline mr-1" />
                          {post.views.toLocaleString()} Views
                        </span>
                        <Badge variant={post.ranking <= 3 ? 'default' : 'secondary'}>
                          Rang #{post.ranking}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {post.keywords} Keywords
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Competitor Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-red-600" />
                Konkurrenz-Analyse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competitorAnalysis.map((competitor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{competitor.domain}</h4>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-600">
                          Keywords: {competitor.keywords.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-600">
                          Traffic: {competitor.traffic.toLocaleString()}/Monat
                        </span>
                        <Badge variant="outline">
                          Autorität: {competitor.ranking}/100
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          {/* Keyword Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Keyword Opportunities
              </CardTitle>
              <CardDescription>
                Neue Keywords mit hohem Potenzial für Rankings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {keywordOpportunities.map((opportunity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{opportunity.keyword}</h4>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-600">
                          Volume: {opportunity.volume.toLocaleString()}/Monat
                        </span>
                        <Badge 
                          variant={
                            opportunity.difficulty === 'Low' ? 'default' :
                            opportunity.difficulty === 'Medium' ? 'secondary' : 'destructive'
                          }
                        >
                          {opportunity.difficulty}
                        </Badge>
                        {opportunity.currentRank && (
                          <span className="text-sm text-orange-600">
                            Aktuell Rang #{opportunity.currentRank}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Content erstellen
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Gap Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Content Gap Analyse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-green-800">Fehlende Themen</h4>
                  <ul className="space-y-2 text-sm">
                    <li>✅ Rasenpflege Roboter Vergleich 2025</li>
                    <li>✅ Winterrasen - Rasenpflege im Winter</li>
                    <li>✅ Bio-Rasendünger Test & Erfahrungen</li>
                    <li>✅ Rasen säen - komplette Neuanlage</li>
                    <li>✅ Rasenkanten gestalten - 10 Ideen</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-green-800">Saisonale Opportunities</h4>
                  <ul className="space-y-2 text-sm">
                    <li>🌱 Frühjahr: Rasenpflege nach dem Winter</li>
                    <li>☀️ Sommer: Rasen bei Hitze richtig bewässern</li>
                    <li>🍂 Herbst: Rasen auf Winter vorbereiten</li>
                    <li>❄️ Winter: Rasenschutz und Wartung</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlogSEODashboard;