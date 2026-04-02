import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Download, Share2, ChevronDown, ChevronUp, ExternalLink, Camera, RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import MainNavigation from '@/components/MainNavigation';
import { supabase } from '@/lib/supabase';
import SEO from '@/components/SEO';
import { useLawn } from '@/context/LawnContext';
import { useRetentionTracking } from '@/hooks/useRetentionTracking';
import { useSubscription } from '@/hooks/useSubscription';
import { amazonProducts, getAmazonUrl, getAmazonImageUrl } from '@/lib/amazonProducts';

interface AnalysisJobResult {
  id: string;
  status: string;
  result: any;
  created_at: string;
  image_path: string;
  metadata?: string;
}

const AnalysisResult = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { profile } = useLawn();
  const { isPremium, planTier } = useSubscription();
  const [analysisData, setAnalysisData] = useState<AnalysisJobResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const stepsRef = useRef<HTMLDivElement>(null);

  const healthScore = analysisData?.result?.score || analysisData?.result?.overall_health || 65;
  const { retentionData } = useRetentionTracking(healthScore, jobId);
  const result = analysisData?.result;

  // Check for error in analysis result
  const analysisError = result?.error;

  // Fetch previous score
  useEffect(() => {
    if (!analysisData) return;
    const fetchPrev = async () => {
      try {
        const { data } = await supabase
          .from('analyses')
          .select('score, created_at')
          .order('created_at', { ascending: false })
          .limit(5);
        if (data && data.length > 0) {
          const prev = data.find(a => a.created_at < analysisData.created_at);
          if (prev) setPreviousScore(prev.score);
        }
      } catch {}
    };
    fetchPrev();
  }, [analysisData]);

  // Polling for analysis result
  useEffect(() => {
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const fetchResult = async () => {
      if (!jobId) { setError('Keine Analyse-ID gefunden'); setIsLoading(false); return; }
      try {
        const { data, error: err } = await supabase.rpc('get_analysis_job', { p_job_id: jobId });
        if (err) throw err;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const job = data as unknown as AnalysisJobResult;
          if (job.status === 'processing' || job.status === 'pending') {
            if (!cancelled) pollTimer = setTimeout(fetchResult, 2000);
            return;
          }
          if (job.status === 'failed') {
            setError('Die Analyse konnte nicht durchgeführt werden. Bitte versuche es erneut.');
            setIsLoading(false);
            return;
          }
          setAnalysisData(job);
        } else {
          setError('Analyse-Ergebnis nicht gefunden');
        }
      } catch {
        setError('Die Analyse konnte nicht durchgeführt werden. Bitte versuche es erneut.');
      } finally {
        if (!cancelled && !pollTimer) setIsLoading(false);
      }
    };
    fetchResult();
    return () => { cancelled = true; if (pollTimer) clearTimeout(pollTimer); };
  }, [jobId]);

  // Helpers
  const getScoreColor = (s: number) => s >= 80 ? 'text-green-600' : s >= 60 ? 'text-yellow-600' : 'text-red-600';
  const getScoreRingColor = (s: number) => s >= 80 ? '#16a34a' : s >= 60 ? '#ca8a04' : '#dc2626';
  const getRangBadge = (s: number) => {
    if (s >= 90) return { label: '🏆 Traumrasen', bg: 'bg-green-100 text-green-800' };
    if (s >= 80) return { label: '🌟 Sehr gut', bg: 'bg-green-50 text-green-700' };
    if (s >= 70) return { label: '🌿 Gut', bg: 'bg-yellow-50 text-yellow-700' };
    if (s >= 60) return { label: '🌱 Verbesserungsfähig', bg: 'bg-yellow-100 text-yellow-800' };
    if (s >= 40) return { label: '⚠️ Mangelhaft', bg: 'bg-orange-100 text-orange-800' };
    return { label: '🔴 Kritisch', bg: 'bg-red-100 text-red-800' };
  };

  const getNextAnalysisDate = () => {
    const weeks = result?.next_analysis_weeks || 4;
    const next = new Date();
    next.setDate(next.getDate() + weeks * 7);
    return next.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const shareText = `Mein Rasen hat ${healthScore}/100 Punkte! 🌱 Kannst du mich schlagen? → rasenpilot.com`;
  const shareUrl = 'https://rasenpilot.com';

  const handleWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  const handleFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
  const handleInstagram = () => { navigator.clipboard.writeText(shareText); toast.success('Text kopiert! Füge ihn in deine Instagram Story ein 📸'); };
  const handleCopyLink = () => { navigator.clipboard.writeText(shareText); setCopied(true); toast.success('In die Zwischenablage kopiert!'); setTimeout(() => setCopied(false), 2000); };

  const handleDownloadPlan = () => {
    if (!result) return;
    const txt = `RASENANALYSE-BERICHT\n====================\n\nBEWERTUNG: ${healthScore}/100\nDatum: ${new Date(analysisData!.created_at).toLocaleDateString('de-DE')}\n\nZUSAMMENFASSUNG:\n${result.summary_short || result.grass_condition || ''}\n\nPROBLEME:\n${(result.problems || []).map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}\n\nSOFORTMASSNAHMEN:\n1. ${result.step_1 || '-'}\n2. ${result.step_2 || '-'}\n3. ${result.step_3 || '-'}\n\nErstellt von: RasenPilot\nWebsite: www.rasenpilot.com`;
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rasenanalyse-${healthScore}-punkte.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Pflegeplan heruntergeladen!');
  };

  // Get products from analysis result (ASIN-based)
  const getProducts = () => {
    const products: { asin: string; name: string; reason: string }[] = [];
    if (result?.product_1_asin && amazonProducts[result.product_1_asin]) {
      products.push({ asin: result.product_1_asin, name: result.product_1_name || amazonProducts[result.product_1_asin].name, reason: result.product_1_reason || '' });
    }
    if (result?.product_2_asin && amazonProducts[result.product_2_asin]) {
      products.push({ asin: result.product_2_asin, name: result.product_2_name || amazonProducts[result.product_2_asin].name, reason: result.product_2_reason || '' });
    }
    // Fallback: match from text if no ASINs
    if (products.length === 0 && result) {
      const text = [result.summary_short, result.grass_condition, ...(result.problems || []), result.step_1, result.step_2, result.step_3].filter(Boolean).join(' ').toLowerCase();
      const entries = Object.entries(amazonProducts);
      if (text.includes('stickstoff') || text.includes('düng') || text.includes('gelb') || text.includes('blass')) {
        products.push({ asin: 'B0CHN4LSWQ', name: amazonProducts['B0CHN4LSWQ'].name, reason: 'Behebt Stickstoffmangel' });
      }
      if (text.includes('moos') || text.includes('unkraut') || text.includes('klee')) {
        products.push({ asin: 'B00UT2LM2O', name: amazonProducts['B00UT2LM2O'].name, reason: 'Bekämpft Moos & Unkraut' });
      }
      if (text.includes('kahl') || text.includes('lücke') || text.includes('nachsa')) {
        products.push({ asin: 'B00IUPTZVC', name: amazonProducts['B00IUPTZVC'].name, reason: 'Für kahle Stellen' });
      }
      if (text.includes('verdicht') || text.includes('lüft')) {
        products.push({ asin: 'B0001E3W7S', name: amazonProducts['B0001E3W7S'].name, reason: 'Gegen Bodenverdichtung' });
      }
      if (text.includes('trocken') || text.includes('bewässer') || text.includes('dürre')) {
        products.push({ asin: 'B0749P42HT', name: amazonProducts['B0749P42HT'].name, reason: 'Automatische Bewässerung' });
      }
      if (text.includes('pilz')) {
        products.push({ asin: 'B00FDFI4Z2', name: amazonProducts['B00FDFI4Z2'].name, reason: 'Gegen Pilzbefall' });
      }
    }
    return products.slice(0, 2);
  };

  // Sub-scores for premium detail section
  const getSubScores = () => {
    if (result?.detailed_scoring) {
      return {
        density: Math.round((result.detailed_scoring.grass_density / 20) * 100),
        moisture: Math.round((result.detailed_scoring.color_quality / 20) * 100),
        sunlight: Math.round((result.detailed_scoring.health_status / 20) * 100),
        soil: Math.round((result.detailed_scoring.soil_condition / 20) * 100),
      };
    }
    const base = healthScore;
    return {
      density: Math.max(30, Math.min(100, base - 3)),
      moisture: Math.max(25, Math.min(100, base - 8)),
      sunlight: Math.max(35, Math.min(100, base + 2)),
      soil: Math.max(30, Math.min(100, base - 5)),
    };
  };

  // SVG Score Ring
  const ScoreRing = ({ score, size = 160 }: { score: number; size?: number }) => {
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    return (
      <svg width={size} height={size} className="mx-auto">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={getScoreRingColor(score)} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-1000 ease-out"
        />
        <text x={size / 2} y={size / 2 - 8} textAnchor="middle" className="fill-current text-foreground" fontSize="42" fontWeight="800">{score}</text>
        <text x={size / 2} y={size / 2 + 18} textAnchor="middle" className="fill-muted-foreground" fontSize="14" fontWeight="500">/100 Punkte</text>
      </svg>
    );
  };

  // LOADING
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <MainNavigation />
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-green-600 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Dein Rasen wird analysiert...</h2>
          <p className="text-muted-foreground text-sm mt-2">Das dauert ca. 10-15 Sekunden</p>
        </div>
      </div>
    );
  }

  // ERROR — API failure
  if (error && !analysisError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <MainNavigation />
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
            <span className="text-4xl">📷</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Die Analyse konnte nicht durchgeführt werden</h2>
          <p className="text-muted-foreground mb-6">Bitte versuche es erneut.</p>
          <Button onClick={() => navigate('/lawn-analysis')} className="bg-green-600 hover:bg-green-700 h-12 px-8">
            <RefreshCw className="h-4 w-4 mr-2" /> Erneut versuchen →
          </Button>
        </div>
      </div>
    );
  }

  // ERROR — JSON error from GPT (no lawn detected)
  if (analysisError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <MainNavigation />
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-amber-50 rounded-full flex items-center justify-center">
            <span className="text-4xl">📷</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Foto konnte nicht analysiert werden</h2>
          <p className="text-muted-foreground mb-6">
            Bitte lade ein klares Foto deines Rasens hoch — bei Tageslicht und von oben fotografiert.
          </p>
          <Button onClick={() => navigate('/lawn-analysis')} className="bg-green-600 hover:bg-green-700 h-12 px-8">
            <Camera className="h-4 w-4 mr-2" /> Neues Foto hochladen →
          </Button>
        </div>
      </div>
    );
  }

  const rang = getRangBadge(healthScore);
  const products = getProducts();
  const subScores = getSubScores();
  const scoreDiff = previousScore !== null ? healthScore - previousScore : null;
  const diseases = result?.diseases || [];
  const weatherRecs = result?.weather_recommendations || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <SEO
        title={`Dein Rasen-Score: ${healthScore}/100 🌱 | RasenPilot`}
        description={result?.summary_short || 'Dein personalisiertes Rasen-Analyseergebnis'}
        keywords="Rasenanalyse Ergebnis, Rasen Score, Rasenpflege"
        canonical={`https://www.rasenpilot.com/analysis-result/${jobId}`}
      />
      <MainNavigation />

      <div className="container mx-auto px-4 py-6 max-w-lg">

        {/* ═══════════════════════════════════════════════
            BLOCK 1 — HERO (above fold)
        ═══════════════════════════════════════════════ */}
        <div className="text-center mb-8">
          {retentionData.isNewHighscore && (
            <div className="inline-block bg-yellow-500 text-white px-4 py-1.5 rounded-full font-bold text-sm mb-4 animate-bounce">
              🎉 Neuer Highscore!
            </div>
          )}

          <ScoreRing score={healthScore} />

          {/* Score comparison */}
          {scoreDiff !== null && (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold mt-2 ${
              scoreDiff > 0 ? 'bg-green-100 text-green-700' : scoreDiff < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
            }`}>
              <TrendingUp className="h-3.5 w-3.5" />
              {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff} Punkte seit letzter Analyse
            </div>
          )}

          {/* Rang Badge */}
          <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold mt-3 ${rang.bg}`}>
            {rang.label}
          </div>

          {/* Summary */}
          <p className="text-muted-foreground text-sm leading-relaxed mt-4 max-w-sm mx-auto">
            {result?.summary_short || result?.grass_condition || 'Dein Rasen wurde analysiert.'}
          </p>

          {/* Two buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
              onClick={handleCopyLink}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Score teilen
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => stepsRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              Mein Aktionsplan →
            </Button>
          </div>

          {/* Share row */}
          <div className="flex justify-center gap-2 mt-4">
            <Button size="sm" onClick={handleWhatsApp} className="bg-[#25D366] hover:bg-[#20bd5a] text-white h-9 px-3">
              <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
            </Button>
            <Button size="sm" onClick={handleFacebook} className="bg-[#1877F2] hover:bg-[#1565d8] text-white h-9 px-3">
              <Facebook className="h-4 w-4 mr-1" /> Facebook
            </Button>
            <Button size="sm" onClick={handleInstagram} className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white h-9 px-3">
              <Instagram className="h-4 w-4 mr-1" /> Instagram
            </Button>
            <Button size="sm" variant="outline" onClick={handleCopyLink} className="h-9 px-3 border-border">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            BLOCK 2 — TOP 3 SOFORTMASSNAHMEN
        ═══════════════════════════════════════════════ */}
        <div ref={stepsRef} className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Deine 3 nächsten Schritte</h2>
          <div className="space-y-3">
            {[result?.step_1, result?.step_2, result?.step_3].filter(Boolean).map((step, i) => (
              <Card key={i} className="border-green-100 shadow-sm">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-green-600">{i + 1}</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed pt-2">{step}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            BLOCK 3 — PRODUKTEMPFEHLUNGEN
        ═══════════════════════════════════════════════ */}
        {products.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-foreground mb-4">Empfohlene Produkte</h2>
            <div className="space-y-3">
              {products.map((p, i) => {
                const productData = amazonProducts[p.asin];
                return (
                  <Card key={i} className="border-border shadow-sm overflow-hidden">
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img
                          src={getAmazonImageUrl(p.asin)}
                          alt={p.name}
                          className="w-full h-full object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-sm">{p.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{productData?.description}</p>
                        <p className="text-xs text-green-600 font-medium mt-1">{p.reason}</p>
                      </div>
                      <Button asChild size="sm" variant="outline" className="flex-shrink-0 border-green-200 text-green-700 hover:bg-green-50 mt-1">
                        <a href={getAmazonUrl(p.asin)} target="_blank" rel="noopener noreferrer nofollow">
                          Ansehen →
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              * Affiliate-Link — wir erhalten eine kleine Provision, für dich entstehen keine Mehrkosten.
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            BLOCK 4 — COLLAPSED DETAILS
        ═══════════════════════════════════════════════ */}
        <div className="mb-8">
          <Button
            variant="outline"
            className="w-full border-border hover:bg-accent/50 h-12 justify-between"
            onClick={() => setDetailsExpanded(!detailsExpanded)}
          >
            <span className="font-medium">Vollständige Analyse anzeigen</span>
            {detailsExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>

          {detailsExpanded && (
            <div className="mt-4 space-y-6 animate-in slide-in-from-top-2 duration-300">

              {/* a) Detail-Scores */}
              <Card className="border-border">
                <CardContent className="p-5">
                  <h3 className="font-bold text-foreground mb-4">Detail-Scores</h3>
                  <div className="space-y-4">
                    {[
                      { label: '🌱 Dichte', value: subScores.density, note: result?.density_note },
                      { label: '💧 Feuchtigkeit', value: subScores.moisture, note: result?.moisture_note },
                      { label: '🌞 Sonneneinstrahlung', value: subScores.sunlight, note: result?.sunlight_note },
                      { label: '🪱 Bodenqualität', value: subScores.soil, note: result?.soil_note },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{item.label}</span>
                          <span className={`font-bold ${getScoreColor(item.value)}`}>{item.value}/100</span>
                        </div>
                        <Progress value={item.value} className="h-2.5" />
                        {item.note && <p className="text-xs text-muted-foreground mt-1">{item.note}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* b) Krankheiten & Schädlinge */}
              {diseases.length > 0 && (
                <Card className="border-border">
                  <CardContent className="p-5">
                    <h3 className="font-bold text-foreground mb-4">Krankheiten & Schädlinge</h3>
                    <div className="space-y-3">
                      {diseases.map((d: any, i: number) => (
                        <div key={i} className="p-3 bg-accent/30 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{d.name}</span>
                            <Badge variant={d.severity === 'Hoch' ? 'destructive' : d.severity === 'Mittel' ? 'default' : 'secondary'} className="text-xs">
                              {d.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{d.description}</p>
                          {d.treatment && <p className="text-xs text-green-700 font-medium mt-1">Behandlung: {d.treatment}</p>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* c) Wetterbasierte Tipps */}
              {weatherRecs.length > 0 && (
                <Card className="border-border">
                  <CardContent className="p-5">
                    <h3 className="font-bold text-foreground mb-4">☀️ Wetterbasierte Tipps</h3>
                    <div className="space-y-2">
                      {weatherRecs.map((tip: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* d) Pflegeplan Download */}
              <Button onClick={handleDownloadPlan} variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50 h-11">
                <Download className="h-4 w-4 mr-2" /> Pflegeplan herunterladen
              </Button>

              {/* e) Re-analyze CTA */}
              <Button
                variant="outline"
                className="w-full border-border hover:bg-accent/50 h-11"
                onClick={() => navigate('/lawn-analysis')}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Rasen in 4 Wochen neu analysieren → {getNextAnalysisDate()}
              </Button>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════
            BLOCK 5 — UPSELL (FREE only)
        ═══════════════════════════════════════════════ */}
        {!isPremium && (
          <div className="mb-8">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-bold text-foreground mb-2">🌱 Willst du noch mehr?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Premium zeigt dir deinen vollständigen Pflegekalender, wetterbasierte Tipps und unbegrenzte Analysen.
                </p>
                {result?.upgrade_teaser && (
                  <p className="text-xs text-green-700 font-medium mb-4 bg-green-100 rounded-lg p-2">{result.upgrade_teaser}</p>
                )}
                <Button
                  className="bg-green-600 hover:bg-green-700 h-12 w-full font-bold"
                  onClick={() => navigate('/subscription?ref=analysis-upsell')}
                >
                  7 Tage kostenlos testen →
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            BLOCK 6 — SCORE TEILEN
        ═══════════════════════════════════════════════ */}
        <div className="mb-8">
          <Card className="border-border">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                <Share2 className="h-4 w-4" /> Kannst du mich schlagen? 💪
              </p>
              <p className="text-xs text-muted-foreground mb-3">Teile deinen Score — fordere Freunde heraus!</p>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleWhatsApp} className="bg-[#25D366] hover:bg-[#20bd5a] text-white h-10 text-sm">
                  <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                </Button>
                <Button onClick={handleFacebook} className="bg-[#1877F2] hover:bg-[#1565d8] text-white h-10 text-sm">
                  <Facebook className="h-4 w-4 mr-2" /> Facebook
                </Button>
                <Button onClick={handleInstagram} className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white h-10 text-sm">
                  <Instagram className="h-4 w-4 mr-2" /> Instagram
                </Button>
                <Button onClick={handleCopyLink} variant="outline" className="h-10 text-sm border-border">
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? 'Kopiert!' : 'Link kopieren'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default AnalysisResult;
