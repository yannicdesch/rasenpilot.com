import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Download, Share2, ChevronDown, ChevronUp, ExternalLink, Camera, RefreshCw, TrendingUp, Sparkles } from 'lucide-react';
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
import { getRank, getNextRank } from '@/lib/rankSystem';
import LawnScoreShareCard from '@/components/LawnScoreShareCard';
import { RegistrationBanner, BlurredRecommendationOverlay } from '@/components/conversion/RegistrationPrompt';
import ShareChallengeBar from '@/components/conversion/ShareChallengeBar';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthIntent, clearAuthIntent } from '@/lib/authRedirectIntent';
import { linkifyProducts } from '@/lib/linkifyProducts';

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
  const { user } = useAuth();
  const isAnonymous = !user;
  const { isPremium, planTier } = useSubscription();
  const [analysisData, setAnalysisData] = useState<AnalysisJobResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Refinement state
  const [refineExpanded, setRefineExpanded] = useState(false);
  const [lastFertilized, setLastFertilized] = useState<string | null>(null);
  const [lawnUsage, setLawnUsage] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  
  // Load loading-screen context answers
  const [loadingScreenContext, setLoadingScreenContext] = useState<{sunExposure?: string; puddlesAfterRain?: string} | null>(null);
  useEffect(() => {
    if (jobId) {
      try {
        const stored = localStorage.getItem(`analysis-context-${jobId}`);
        if (stored) setLoadingScreenContext(JSON.parse(stored));
      } catch {}
    }
  }, [jobId]);

  // After registration: claim orphaned analysis and show toast.
  // Trigger sources (any one is enough — the claim is idempotent):
  //   1. URL flag ?registered=1 (set when redirected from Auth in same tab)
  //   2. Persisted auth intent in localStorage matching this jobId
  //      (covers the email-confirmation round-trip that drops URL params)
  useEffect(() => {
    if (!user || !jobId) return;

    const urlFlag = searchParams.get('registered') === '1';
    let intentMatch = false;
    try {
      const intent = getAuthIntent();
      if (intent && (intent.jobId === jobId || intent.redirectPath?.includes(jobId))) {
        intentMatch = true;
        clearAuthIntent();
      }
    } catch {}

    if (!urlFlag && !intentMatch) return;

    toast.success('Ergebnis gespeichert! Alle Empfehlungen sind jetzt freigeschaltet. 🎉');
    if (urlFlag) {
      searchParams.delete('registered');
      setSearchParams(searchParams, { replace: true });
    }

    // Claim the anonymous analysis job for this new user
    supabase.rpc('claim_orphaned_analysis', {
      p_user_id: user.id,
      p_email: user.email || '',
      p_analysis_id: jobId,
    }).then(async ({ data, error }) => {
      if (error) {
        console.error('Failed to claim analysis:', error);
        return;
      }
      // Send trial offer email if analyses were claimed
      const claimed = (data as any)?.claimed_analyses || 0;
      if (claimed > 0 && user.email) {
        try {
          const score = analysisData?.result?.score || analysisData?.result?.overall_health || 58;
          const name = user.user_metadata?.first_name || user.email?.split('@')[0] || 'dort';
          await supabase.functions.invoke('send-trial-offer', {
            body: { email: user.email, name, score }
          });
          console.log('Trial offer email sent to', user.email);
        } catch (emailErr) {
          console.error('Failed to send trial offer email:', emailErr);
        }
      }
    });
  }, [user, jobId]);

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

  // Share data for Wrapped-style card
  const rank = getRank(healthScore);
  const nextRank = getNextRank(healthScore);
  const nextScoreGoal = nextRank ? nextRank.minScore : 100;

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

  const handleRefineAnalysis = async () => {
    if (!lastFertilized || !lawnUsage || !jobId) return;
    setIsRefining(true);
    try {
      const { data, error } = await supabase.functions.invoke('refine-analysis', {
        body: { 
          jobId, 
          lastFertilized, 
          lawnUsage,
          sunExposure: loadingScreenContext?.sunExposure || null,
          puddlesAfterRain: loadingScreenContext?.puddlesAfterRain || null
        }
      });
      if (error) throw error;
      if (data?.success && data?.result) {
        setAnalysisData(prev => prev ? { ...prev, result: data.result } : prev);
        toast.success('Empfehlungen wurden aktualisiert! 🎯');
        setRefineExpanded(false);
      } else {
        throw new Error('Refinement failed');
      }
    } catch (err) {
      console.error('Refine error:', err);
      toast.error('Aktualisierung fehlgeschlagen. Bitte versuche es erneut.');
    } finally {
      setIsRefining(false);
    }
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

  const shareData = {
    score: healthScore,
    rankName: rank.name,
    rankEmoji: rank.emoji,
    problems: result?.problems || [],
    scoreDiff,
    zipRank: null as number | null,
    zipTotal: null as number | null,
    zip: profile?.zipCode || undefined,
    nextScoreGoal,
    stepsCount: [result?.step_1, result?.step_2, result?.step_3].filter(Boolean).length,
  };

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
              onClick={() => document.getElementById('share-section')?.scrollIntoView({ behavior: 'smooth' })}
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
        </div>

        {/* ═══════════════════════════════════════════════
            REGISTRATION BANNER (anonymous users only)
        ═══════════════════════════════════════════════ */}
        {isAnonymous && (
          <RegistrationBanner score={healthScore} jobId={jobId} startTime={analysisData?.created_at} />
        )}

        {/* ═══════════════════════════════════════════════
            BLOCK 2 — TOP 3 SOFORTMASSNAHMEN
        ═══════════════════════════════════════════════ */}
        <div ref={stepsRef} className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Deine 3 nächsten Schritte</h2>
          <div className="space-y-3">
            {[result?.step_1, result?.step_2, result?.step_3].filter(Boolean).map((step, i) => {
              const isBlurred = isAnonymous && i >= 1; // blur steps 2 and 3
              return (
                <div key={i} className="relative">
                  <Card className={`border-green-100 shadow-sm ${isBlurred ? 'select-none' : ''}`}>
                    <CardContent className={`p-4 flex items-start gap-4 ${isBlurred ? 'blur-sm' : ''}`}>
                      <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-green-600">{i + 1}</span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed pt-2">{step}</p>
                    </CardContent>
                  </Card>
                  {isBlurred && <BlurredRecommendationOverlay jobId={jobId} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            REFINEMENT SECTION — Analyse verfeinern
        ═══════════════════════════════════════════════ */}
        <div className="mb-8">
          <button
            onClick={() => setRefineExpanded(!refineExpanded)}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-accent/30 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-foreground">Analyse verfeinern für noch genauere Empfehlungen</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${refineExpanded ? 'rotate-180' : ''}`} />
          </button>

          {refineExpanded && (
            <Card className="mt-3 border-amber-200/50 bg-amber-50/30">
              <CardContent className="p-4 space-y-4">
                {/* Q1: Last fertilized */}
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Wann zuletzt gedüngt?</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'this_year', label: 'Dieses Jahr' },
                      { value: 'last_year', label: 'Letztes Jahr' },
                      { value: 'never', label: 'Noch nie' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setLastFertilized(opt.value)}
                        className={`p-2.5 rounded-lg border text-center transition-all text-sm font-medium ${
                          lastFertilized === opt.value
                            ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                            : 'border-border bg-white hover:border-green-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q2: Lawn usage */}
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Rasen-Nutzung?</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'family', label: '👨‍👩‍👧 Familienrasen' },
                      { value: 'display', label: '🌿 Repräsentation' },
                      { value: 'pets', label: '🐕 Hunde & Tiere' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setLawnUsage(opt.value)}
                        className={`p-2.5 rounded-lg border text-center transition-all text-xs font-medium ${
                          lawnUsage === opt.value
                            ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                            : 'border-border bg-white hover:border-green-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Update button */}
                <Button
                  onClick={handleRefineAnalysis}
                  disabled={!lastFertilized || !lawnUsage || isRefining}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white h-11 font-semibold"
                >
                  {isRefining ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Empfehlungen werden aktualisiert...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Empfehlungen aktualisieren
                    </>
                  )}
                </Button>

                {(!lastFertilized || !lawnUsage) && (
                  <p className="text-xs text-muted-foreground text-center">Bitte beantworte beide Fragen</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/*
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
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img
                          src={getAmazonImageUrl(p.asin)}
                          alt={p.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.onerror = null;
                            img.src = '/logo.png';
                            img.classList.remove('object-contain');
                            img.classList.add('object-cover', 'p-2');
                          }}
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

              {/* Registration prompt for anonymous users */}
              {isAnonymous && (
                <Card className="border-green-200 bg-green-50/70 shadow-sm">
                  <CardContent className="p-5 text-center">
                    <h3 className="font-bold text-foreground text-base mb-1">
                      Speichere dein Ergebnis und tracke deinen Fortschritt
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Erstelle ein kostenloses Konto — dein Score und Pflegeplan werden gespeichert und du wirst in 4 Wochen automatisch an die nächste Analyse erinnert.
                    </p>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-bold"
                      onClick={() => navigate(`/auth?redirect=/analysis-result/${jobId}&ref=save-prompt`)}
                    >
                      Kostenlos registrieren
                    </Button>
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
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                  Du hast 1 von 1 kostenlosen Analysen verwendet
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">🌱 Unbegrenzte Analysen freischalten</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Mit Premium erhältst du unbegrenzte Analysen, einen vollständigen Pflegekalender und wetterbasierte Tipps.
                </p>
                {result?.upgrade_teaser && (
                  <p className="text-xs text-green-700 font-medium mb-4 bg-green-100 rounded-lg p-2">{result.upgrade_teaser}</p>
                )}
                <Button
                  className="bg-green-600 hover:bg-green-700 h-12 w-full font-bold text-base"
                  onClick={() => navigate('/subscription?ref=analysis-upsell')}
                >
                  7 Tage kostenlos testen — dann 9,99€/Monat
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Keine Zahlung heute · Jederzeit kündbar</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            BLOCK 6 — SCORE TEILEN (Wrapped-style)
        ═══════════════════════════════════════════════ */}
        <div id="share-section" className="mb-8">
          <LawnScoreShareCard data={shareData} />
        </div>

      </div>
    </div>
  );
};

export default AnalysisResult;
