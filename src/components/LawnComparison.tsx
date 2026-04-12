import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Camera, TrendingUp, TrendingDown, Share2, ArrowRight, Loader2, Upload, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import browserImageCompression from 'browser-image-compression';

interface ComparisonResult {
  score_change: string;
  estimated_new_score: string;
  improvements: { area: string; description: string; percentage: string }[];
  remaining_issues: { issue: string; severity: string; tip: string }[];
  overall_assessment: string;
  encouragement: string;
  comparison_summary: string;
}

interface LawnComparisonProps {
  oldImageUrl: string;
  oldScore: number;
  oldDate: string;
  grassType?: string;
}

const LawnComparison: React.FC<LawnComparisonProps> = ({ oldImageUrl, oldScore, oldDate, grassType }) => {
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [newImageBase64, setNewImageBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await browserImageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      });

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setNewImagePreview(dataUrl);
        setNewImageBase64(dataUrl);
      };
      reader.readAsDataURL(compressed);
    } catch {
      toast.error('Fehler beim Laden des Bildes');
    }
  };

  const startComparison = async () => {
    if (!newImageBase64) return;

    setIsAnalyzing(true);
    try {
      // Fetch old image as base64
      let oldBase64 = oldImageUrl;
      try {
        const resp = await fetch(oldImageUrl);
        const blob = await resp.blob();
        oldBase64 = await new Promise<string>((resolve) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.readAsDataURL(blob);
        });
      } catch {
        console.log('Using old image URL directly');
      }

      const { data, error } = await supabase.functions.invoke('compare-lawn-photos', {
        body: {
          oldImageBase64: oldBase64,
          newImageBase64: newImageBase64,
          oldScore,
          grassType,
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Vergleich fehlgeschlagen');

      setResult(data.comparison);
      toast.success('Vergleich abgeschlossen!');
    } catch (err: any) {
      console.error('Comparison error:', err);
      toast.error('Fehler beim Vergleich: ' + (err.message || 'Unbekannter Fehler'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const shareToWhatsApp = () => {
    if (!result) return;
    const text = `🌱 Mein Rasen-Fortschritt mit Rasenpilot!\n\n${result.comparison_summary}\n📈 Score: ${oldScore} → ${result.estimated_new_score} (${result.score_change})\n\nKostenlos testen: https://rasenpilot.lovable.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareGeneric = async () => {
    if (!result) return;
    const text = `🌱 Mein Rasen-Fortschritt mit Rasenpilot!\n${result.comparison_summary}\n📈 Score: ${oldScore} → ${result.estimated_new_score} (${result.score_change})`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Mein Rasen-Fortschritt', text, url: 'https://rasenpilot.lovable.app' });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Text kopiert!');
    }
  };

  const scoreChange = result ? parseInt(result.score_change) : 0;
  const newScore = result ? parseInt(result.estimated_new_score) : 0;

  // Not started yet — show upload prompt
  if (!result && !newImagePreview) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-50 border-l-4 border-l-emerald-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="h-5 w-5 text-emerald-600" />
            📸 Fortschritt messen
          </CardTitle>
          <CardDescription>Lade ein neues Foto hoch und vergleiche es mit deiner letzten Analyse</CardDescription>
        </CardHeader>
        <CardContent>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-base"
          >
            <Upload className="h-5 w-5 mr-2" />
            Neues Foto hochladen — Fortschritt messen
          </Button>
          <p className="text-xs text-emerald-700 mt-2 text-center">
            Dein letztes Foto vom {new Date(oldDate).toLocaleDateString('de-DE')} wird automatisch verglichen
          </p>
        </CardContent>
      </Card>
    );
  }

  // Image selected, not yet analyzed
  if (!result && newImagePreview) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="h-5 w-5 text-emerald-600" />
            📸 Fortschritt messen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative rounded-xl overflow-hidden">
              <img src={oldImageUrl} alt="Vorher" className="w-full h-40 object-cover" />
              <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs text-center py-1.5 font-medium">
                Vorher — {oldScore}/100
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden">
              <img src={newImagePreview} alt="Nachher" className="w-full h-40 object-cover" />
              <div className="absolute bottom-0 inset-x-0 bg-emerald-600/80 text-white text-xs text-center py-1.5 font-medium">
                Neues Foto
              </div>
              <button
                onClick={() => { setNewImagePreview(null); setNewImageBase64(null); }}
                className="absolute top-2 right-2 bg-black/50 rounded-full p-1"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          </div>
          <Button
            onClick={startComparison}
            disabled={isAnalyzing}
            className="w-full bg-emerald-600 hover:bg-emerald-700 font-semibold py-5"
          >
            {isAnalyzing ? (
              <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> KI vergleicht deine Fotos...</>
            ) : (
              <>KI-Vergleich starten →</>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Results view
  return (
    <div className="space-y-5">
      {/* Side by side photos */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="grid grid-cols-2">
          <div className="relative">
            <img src={oldImageUrl} alt="Vorher" className="w-full h-48 object-cover" />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <div className="text-white text-xs opacity-80">{new Date(oldDate).toLocaleDateString('de-DE')}</div>
              <div className="text-white font-bold text-lg">{oldScore}/100</div>
            </div>
            <Badge className="absolute top-2 left-2 bg-gray-800/70 text-white border-0 text-xs">Vorher</Badge>
          </div>
          <div className="relative">
            <img src={newImagePreview!} alt="Nachher" className="w-full h-48 object-cover" />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <div className="text-white text-xs opacity-80">Heute</div>
              <div className="text-white font-bold text-lg">{newScore}/100</div>
            </div>
            <Badge className="absolute top-2 left-2 bg-emerald-600/80 text-white border-0 text-xs">Nachher</Badge>
          </div>
        </div>
      </Card>

      {/* Score progression */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground font-medium">Score-Entwicklung</div>
            <div className={`flex items-center gap-1.5 font-bold text-lg ${scoreChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {scoreChange >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {result?.score_change}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">{oldScore}</div>
              <div className="text-xs text-muted-foreground">Vorher</div>
            </div>
            <div className="flex-1 relative h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-gray-300 rounded-full" style={{ width: `${oldScore}%` }} />
              <div className={`absolute inset-y-0 left-0 rounded-full ${scoreChange >= 0 ? 'bg-emerald-500' : 'bg-red-400'}`} style={{ width: `${newScore}%` }} />
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${scoreChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{newScore}</div>
              <div className="text-xs text-muted-foreground">Nachher</div>
            </div>
          </div>

          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 italic">
            "{result?.overall_assessment}"
          </p>
        </CardContent>
      </Card>

      {/* Improvements */}
      {result?.improvements && result.improvements.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              Verbesserungen erkannt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.improvements.map((imp, i) => (
              <div key={i} className="flex items-start gap-3 bg-emerald-50 rounded-lg p-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">✓</div>
                <div className="flex-1">
                  <div className="font-medium text-emerald-800 text-sm">{imp.area}</div>
                  <p className="text-xs text-emerald-700">{imp.description}</p>
                </div>
                {imp.percentage && imp.percentage !== '—' && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs shrink-0">{imp.percentage}</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Remaining issues */}
      {result?.remaining_issues && result.remaining_issues.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Noch zu verbessern
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.remaining_issues.map((issue, i) => (
              <div key={i} className="bg-amber-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-amber-800 text-sm">{issue.issue}</span>
                  <Badge variant="outline" className={`text-xs ${
                    issue.severity === 'hoch' ? 'border-red-300 text-red-600' :
                    issue.severity === 'mittel' ? 'border-amber-300 text-amber-600' :
                    'border-green-300 text-green-600'
                  }`}>{issue.severity}</Badge>
                </div>
                <p className="text-xs text-amber-700">💡 {issue.tip}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Encouragement + Share */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-green-50">
        <CardContent className="p-5 space-y-4">
          <p className="text-emerald-800 font-medium text-center">🎉 {result?.encouragement}</p>
          <div className="flex gap-3">
            <Button onClick={shareToWhatsApp} className="flex-1 bg-[#25D366] hover:bg-[#22c55e] text-white">
              <Share2 className="h-4 w-4 mr-2" /> WhatsApp
            </Button>
            <Button onClick={shareGeneric} variant="outline" className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50">
              <Share2 className="h-4 w-4 mr-2" /> Teilen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* New comparison */}
      <Button
        variant="outline"
        className="w-full text-emerald-700 border-emerald-200 hover:bg-emerald-50"
        onClick={() => { setResult(null); setNewImagePreview(null); setNewImageBase64(null); }}
      >
        Neuen Vergleich starten
      </Button>
    </div>
  );
};

export default LawnComparison;
