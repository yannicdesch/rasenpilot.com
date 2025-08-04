import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  BarChart3, 
  Target, 
  Eye, 
  Link, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp 
} from 'lucide-react';

interface SEOAnalysis {
  keywordDensity: { [key: string]: number };
  readabilityScore: number;
  seoScore: number;
  suggestions: string[];
  internalLinkOpportunities: string[];
  metaOptimization: {
    titleLength: number;
    descriptionLength: number;
    titleOptimal: boolean;
    descriptionOptimal: boolean;
  };
}

const SEOContentAnalyzer = () => {
  const [content, setContent] = useState('');
  const [targetKeywords, setTargetKeywords] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeContent = async () => {
    setIsAnalyzing(true);
    
    try {
      const keywords = targetKeywords.split(',').map(k => k.trim().toLowerCase());
      const wordCount = content.split(' ').length;
      
      // Keyword density analysis
      const keywordDensity: { [key: string]: number } = {};
      keywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = content.toLowerCase().match(regex) || [];
        keywordDensity[keyword] = (matches.length / wordCount) * 100;
      });

      // Readability analysis (simplified German readability)
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const avgWordsPerSentence = wordCount / sentences.length;
      const complexWords = content.split(' ').filter(word => word.length > 6).length;
      const readabilityScore = Math.max(0, 100 - (avgWordsPerSentence * 1.5) - (complexWords / wordCount * 100));

      // SEO score calculation
      let seoScore = 0;
      const suggestions: string[] = [];

      // Keyword density check (1-3% is optimal)
      Object.entries(keywordDensity).forEach(([keyword, density]) => {
        if (density >= 1 && density <= 3) {
          seoScore += 15;
        } else if (density < 1) {
          suggestions.push(`Keyword "${keyword}" zu selten verwendet (${density.toFixed(1)}%). Ziel: 1-3%`);
        } else {
          suggestions.push(`Keyword "${keyword}" zu oft verwendet (${density.toFixed(1)}%). Reduzieren auf 1-3%`);
        }
      });

      // Content length check
      if (wordCount >= 800) {
        seoScore += 20;
      } else {
        suggestions.push(`Content zu kurz (${wordCount} Wörter). Mindestens 800 Wörter für gute Rankings`);
      }

      // Header structure check
      const h2Count = (content.match(/##[^#]/g) || []).length;
      const h3Count = (content.match(/###[^#]/g) || []).length;
      if (h2Count >= 3) {
        seoScore += 15;
      } else {
        suggestions.push('Mindestens 3 H2-Überschriften für bessere Struktur hinzufügen');
      }

      if (h3Count >= 2) {
        seoScore += 10;
      }

      // Readability check
      if (readabilityScore >= 60) {
        seoScore += 20;
      } else {
        suggestions.push('Lesbarkeit verbessern: Kürzere Sätze und einfachere Wörter verwenden');
      }

      // Meta tag analysis
      const titleLength = metaTitle.length;
      const descriptionLength = metaDescription.length;
      const titleOptimal = titleLength >= 30 && titleLength <= 60;
      const descriptionOptimal = descriptionLength >= 120 && descriptionLength <= 160;

      if (titleOptimal) {
        seoScore += 10;
      } else {
        suggestions.push(`Meta-Title optimieren (${titleLength} Zeichen). Optimal: 30-60 Zeichen`);
      }

      if (descriptionOptimal) {
        seoScore += 10;
      } else {
        suggestions.push(`Meta-Description optimieren (${descriptionLength} Zeichen). Optimal: 120-160 Zeichen`);
      }

      // Internal link opportunities
      const internalLinkOpportunities = [
        'Rasenpflege im Frühjahr',
        'Rasen düngen Anleitung',
        'Vertikutieren Tipps',
        'Moos im Rasen bekämpfen',
        'Rasensorten Deutschland',
        'Rasen bewässern richtig'
      ].filter(opportunity => 
        content.toLowerCase().includes(opportunity.toLowerCase()) &&
        !content.includes(`[${opportunity}]`)
      );

      setAnalysis({
        keywordDensity,
        readabilityScore,
        seoScore,
        suggestions,
        internalLinkOpportunities,
        metaOptimization: {
          titleLength,
          descriptionLength,
          titleOptimal,
          descriptionOptimal
        }
      });
      
    } catch (error) {
      console.error('Error analyzing content:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Work';
    return 'Poor';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            SEO Content Analyzer
          </CardTitle>
          <CardDescription>
            Analysieren Sie Ihren Content auf SEO-Optimierung, Keyword-Dichte und Lesbarkeit
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Meta Title</Label>
              <Input
                placeholder="SEO-optimierter Titel (30-60 Zeichen)"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
              />
              <span className={`text-xs ${metaTitle.length > 60 ? 'text-red-600' : 'text-gray-500'}`}>
                {metaTitle.length}/60 Zeichen
              </span>
            </div>
            
            <div className="space-y-2">
              <Label>Target Keywords (kommagetrennt)</Label>
              <Input
                placeholder="z.B. rasenpflege, rasen düngen, vertikutieren"
                value={targetKeywords}
                onChange={(e) => setTargetKeywords(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Meta Description</Label>
            <Textarea
              placeholder="Überzeugende Beschreibung mit Call-to-Action (120-160 Zeichen)"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="h-20"
            />
            <span className={`text-xs ${metaDescription.length > 160 ? 'text-red-600' : 'text-gray-500'}`}>
              {metaDescription.length}/160 Zeichen
            </span>
          </div>

          <div className="space-y-2">
            <Label>Blog Content (Markdown)</Label>
            <Textarea
              placeholder="Fügen Sie hier Ihren Blogbeitrag ein..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-40"
            />
          </div>

          <Button 
            onClick={analyzeContent}
            disabled={isAnalyzing || !content.trim() || !targetKeywords.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Search className="h-4 w-4 mr-2 animate-spin" />
                Analysiere Content...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                SEO-Analyse starten
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* SEO Score Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                SEO Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(analysis.seoScore)}`}>
                  {analysis.seoScore}/100
                </div>
                <Badge variant={analysis.seoScore >= 80 ? 'default' : 'secondary'}>
                  {getScoreLabel(analysis.seoScore)}
                </Badge>
              </div>
              
              <Progress value={analysis.seoScore} className="w-full" />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Readability Score</span>
                  <span className={`text-sm font-medium ${getScoreColor(analysis.readabilityScore)}`}>
                    {analysis.readabilityScore.toFixed(1)}/100
                  </span>
                </div>
                <Progress value={analysis.readabilityScore} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Keyword Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Keyword Density
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analysis.keywordDensity).map(([keyword, density]) => (
                  <div key={keyword} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{keyword}</span>
                      <span className={`text-sm ${
                        density >= 1 && density <= 3 ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {density.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(density, 5) * 20} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SEO Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-orange-600" />
                Verbesserungsvorschläge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.suggestions.length === 0 ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Keine Verbesserungen erforderlich!</span>
                  </div>
                ) : (
                  analysis.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 text-orange-600">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{suggestion}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Internal Link Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5 text-indigo-600" />
                Interne Verlinkungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.internalLinkOpportunities.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Keine zusätzlichen internen Verlinkungen gefunden.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-3">
                      Gefundene Möglichkeiten für interne Links:
                    </p>
                    {analysis.internalLinkOpportunities.map((opportunity, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2">
                        {opportunity}
                      </Badge>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SEOContentAnalyzer;