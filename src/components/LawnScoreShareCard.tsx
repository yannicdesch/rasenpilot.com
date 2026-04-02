import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Facebook, Instagram, Copy, Check, Share2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { getRank, getNextRank } from '@/lib/rankSystem';

interface ShareData {
  score: number;
  rankName: string;
  rankEmoji: string;
  problems: string[];
  scoreDiff: number | null;
  zipRank?: number | null;
  zipTotal?: number | null;
  zip?: string;
  nextScoreGoal: number;
  stepsCount: number;
}

interface LawnScoreShareCardProps {
  data: ShareData;
}

// Identity statements based on score — Spotify Wrapped style
const getIdentityStatement = (score: number): string => {
  if (score >= 90) return 'Ich bin unter den besten Rasenbesitzern Deutschlands 👑';
  if (score >= 80) return 'Mein Rasen ist besser als die meisten in meiner Straße 🏆';
  if (score >= 70) return 'Ich arbeite aktiv an meinem Rasen — und man sieht es 💪';
  if (score >= 60) return 'Ich hab gerade herausgefunden was meinem Rasen fehlt 🔍';
  if (score >= 50) return 'Ok, mein Rasen braucht professionelle Hilfe 😅';
  if (score >= 40) return 'Mein Rasen hat offiziell Katastrophenstatus 💀';
  return 'RIP mein Rasen. Neustart incoming 😂';
};

const getProgressHook = (scoreDiff: number | null, nextScoreGoal: number): string => {
  if (scoreDiff && scoreDiff > 0) return `📈 +${scoreDiff} Punkte seit letzter Analyse!`;
  return `🎯 Nächstes Ziel: ${nextScoreGoal} Punkte`;
};

const getCompetitiveHook = (zipRank?: number | null, zipTotal?: number | null, zip?: string): string => {
  if (zipRank && zipTotal && zip) return `Platz ${zipRank} von ${zipTotal} in PLZ ${zip}`;
  return 'Wie gut ist deiner?';
};

const LawnScoreShareCard: React.FC<LawnScoreShareCardProps> = ({ data }) => {
  const { score, rankName, rankEmoji, problems, scoreDiff, zipRank, zipTotal, zip, nextScoreGoal, stepsCount } = data;
  const [copied, setCopied] = useState(false);
  const [storyImage, setStoryImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const identity = getIdentityStatement(score);
  const progressHook = getProgressHook(scoreDiff, nextScoreGoal);
  const competitiveHook = getCompetitiveHook(zipRank, zipTotal, zip);

  const scoreBar = '█'.repeat(Math.round(score / 10)) + '░'.repeat(10 - Math.round(score / 10));

  // WhatsApp text — identity-first, not brand-first
  const whatsappText = `🌱 Mein Rasen-Report 2026

Score: ${score}/100
${scoreBar}

${rankEmoji} ${rankName} · ${competitiveHook}
${progressHook}

${identity}

Teste deinen Rasen kostenlos:
👉 rasenpilot.com`;

  // Instagram text with hashtags
  const instagramText = `${identity}

Score: ${score}/100 · ${rankEmoji} ${rankName}
${progressHook}

#rasenpilot #rasen #garten #rasenpflege #lawn #gartenliebe #vorhernahher`;

  // Facebook share text
  const facebookText = `${identity}\n\nMein Rasen-Score: ${score}/100 · ${rankEmoji} ${rankName}\n${competitiveHook}\n\nTeste deinen Rasen: rasenpilot.com`;

  // Generate Instagram Story image (1080x1920)
  const generateStoryImage = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Green gradient background
    const grad = ctx.createLinearGradient(0, 0, 540, 1920);
    grad.addColorStop(0, '#0f3d1a');
    grad.addColorStop(0.3, '#1a5c2e');
    grad.addColorStop(0.7, '#2d9e4f');
    grad.addColorStop(1, '#1a7a35');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Subtle pattern overlay
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 1080, Math.random() * 1920, Math.random() * 200 + 50, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Logo area — top
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.roundRect(40, 60, 200, 48, 12);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('🌱 rasenpilot', 56, 92);

    // Year tag — top right
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.roundRect(860, 60, 180, 48, 12);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '500 20px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Rasen-Report 2026', 950, 92);
    ctx.textAlign = 'left';

    // Main score section
    ctx.textAlign = 'center';

    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '500 28px system-ui, -apple-system, sans-serif';
    ctx.fillText('MEIN RASEN-SCORE', 540, 400);

    // Big score number
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 200px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${score}`, 540, 620);

    // /100 label
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '400 48px system-ui, -apple-system, sans-serif';
    ctx.fillText('/100', 540, 680);

    // Progress bar
    const barWidth = 700;
    const barX = (1080 - barWidth) / 2;
    const barY = 730;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, 24, 12);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth * (score / 100), 24, 12);
    ctx.fill();

    // Rank badge
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    const badgeText = `${rankEmoji} ${rankName}`;
    ctx.font = '600 32px system-ui, -apple-system, sans-serif';
    const badgeWidth = ctx.measureText(badgeText).width + 48;
    ctx.beginPath();
    ctx.roundRect((1080 - badgeWidth) / 2, 800, badgeWidth, 56, 28);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(badgeText, 540, 838);

    // Competitive hook
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '500 26px system-ui, -apple-system, sans-serif';
    ctx.fillText(competitiveHook, 540, 920);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(190, 980);
    ctx.lineTo(890, 980);
    ctx.stroke();

    // Problems found section
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '500 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('MEIN RASEN HAT...', 190, 1040);

    const displayProblems = problems.slice(0, 3);
    displayProblems.forEach((p, i) => {
      ctx.fillStyle = '#ffffff';
      ctx.font = '500 28px system-ui, -apple-system, sans-serif';
      const shortProblem = p.length > 40 ? p.substring(0, 37) + '...' : p;
      ctx.fillText(`✓  ${shortProblem}`, 190, 1090 + i * 50);
    });

    if (stepsCount > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '500 28px system-ui, -apple-system, sans-serif';
      ctx.fillText(`✓  Pflegeplan: ${stepsCount} Schritte`, 190, 1090 + displayProblems.length * 50);
    }

    // Progress hook
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 30px system-ui, -apple-system, sans-serif';
    ctx.fillText(progressHook, 540, 1380);

    // Identity statement — the heart of the share
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.roundRect(100, 1440, 880, 90, 20);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 28px system-ui, -apple-system, sans-serif';
    // Wrap if needed
    const maxWidth = 800;
    if (ctx.measureText(identity).width > maxWidth) {
      const words = identity.split(' ');
      let line = '';
      let y = 1480;
      words.forEach(word => {
        const test = line + word + ' ';
        if (ctx.measureText(test).width > maxWidth && line) {
          ctx.fillText(line.trim(), 540, y);
          line = word + ' ';
          y += 36;
        } else {
          line = test;
        }
      });
      ctx.fillText(line.trim(), 540, y);
    } else {
      ctx.fillText(identity, 540, 1495);
    }

    // CTA at bottom
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '500 26px system-ui, -apple-system, sans-serif';
    ctx.fillText('Wie gut ist deiner?', 540, 1720);

    // Brand — bottom center, subtle
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '400 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('rasenpilot.com', 540, 1840);

    ctx.textAlign = 'left';

    return canvas.toDataURL('image/png');
  }, [score, rankName, rankEmoji, problems, competitiveHook, progressHook, identity, stepsCount]);

  // Generate on mount
  useEffect(() => {
    const img = generateStoryImage();
    setStoryImage(img);
  }, [generateStoryImage]);

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank');
  };

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://rasenpilot.com')}&quote=${encodeURIComponent(facebookText)}`, '_blank');
  };

  const handleInstagram = () => {
    navigator.clipboard.writeText(instagramText);
    toast.success('Text & Hashtags kopiert! Füge sie in deine Instagram Story ein 📸');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(whatsappText);
    setCopied(true);
    toast.success('In die Zwischenablage kopiert!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadStory = () => {
    if (!storyImage) return;
    const a = document.createElement('a');
    a.href = storyImage;
    a.download = `rasen-score-${score}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Story-Bild heruntergeladen! Teile es in deiner Instagram Story 📸');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        const shareData: ShareData2 = {
          title: 'Mein Rasen-Score',
          text: whatsappText,
          url: 'https://rasenpilot.com',
        };

        // Try to share the image if available
        if (storyImage && navigator.canShare) {
          try {
            const res = await fetch(storyImage);
            const blob = await res.blob();
            const file = new File([blob], `rasen-score-${score}.png`, { type: 'image/png' });
            const withFile = { ...shareData, files: [file] };
            if (navigator.canShare(withFile)) {
              await navigator.share(withFile);
              return;
            }
          } catch {}
        }

        await navigator.share(shareData);
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="space-y-4">
      {/* Visual Share Card — Wrapped-style */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f3d1a] via-[#1a5c2e] to-[#2d9e4f] p-6 text-white shadow-2xl">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/3 right-8 w-20 h-20 bg-white/3 rounded-full" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/15 backdrop-blur rounded-lg flex items-center justify-center text-base">
                🌱
              </div>
              <span className="font-semibold text-xs tracking-wider uppercase opacity-70">rasenpilot</span>
            </div>
            <span className="text-xs opacity-50 font-medium">Rasen-Report 2026</span>
          </div>

          {/* Score — big, centered */}
          <div className="text-center mb-4">
            <div className="text-xs uppercase tracking-widest opacity-50 mb-2">Mein Rasen-Score</div>
            <div className="text-7xl font-black leading-none drop-shadow-lg">
              {score}
            </div>
            <div className="text-lg opacity-50 font-medium mt-1">/100</div>
          </div>

          {/* Progress bar */}
          <div className="mx-auto max-w-[280px] mb-4">
            <div className="h-2.5 bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Rank badge */}
          <div className="text-center mb-4">
            <span className="inline-block bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm font-semibold">
              {rankEmoji} {rankName}
            </span>
          </div>

          {/* Competitive hook */}
          <div className="text-center text-sm opacity-70 mb-5">
            {competitiveHook}
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 my-4" />

          {/* Problems found */}
          <div className="mb-4">
            <div className="text-xs uppercase tracking-wider opacity-40 mb-2">Mein Rasen hat...</div>
            <div className="space-y-1.5">
              {problems.slice(0, 3).map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-green-300 mt-0.5">✓</span>
                  <span className="opacity-90">{p.length > 50 ? p.substring(0, 47) + '...' : p}</span>
                </div>
              ))}
              {stepsCount > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-green-300 mt-0.5">✓</span>
                  <span className="opacity-90">Pflegeplan: {stepsCount} Schritte</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress hook */}
          <div className="text-center text-sm font-semibold mb-4">
            {progressHook}
          </div>

          {/* Identity statement — the hook */}
          <div className="bg-white/8 backdrop-blur rounded-xl p-3 text-center mb-4">
            <p className="text-sm font-semibold leading-relaxed">{identity}</p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-xs opacity-50">Wie gut ist deiner?</p>
          </div>
        </div>
      </div>

      {/* Share Buttons */}
      <Card className="border-border">
        <CardContent className="p-4">
          <p className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Fordere deine Freunde heraus 💪
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Ein Klick — dein Score wird geteilt
          </p>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <Button
              onClick={handleWhatsApp}
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white h-11 text-sm font-medium"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            <Button
              onClick={handleFacebook}
              className="bg-[#1877F2] hover:bg-[#1565d8] text-white h-11 text-sm font-medium"
            >
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            <Button
              onClick={handleInstagram}
              className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white h-11 text-sm font-medium"
            >
              <Instagram className="h-4 w-4 mr-2" />
              Instagram
            </Button>
            <Button
              onClick={handleNativeShare}
              variant="outline"
              className="h-11 text-sm font-medium border-border"
            >
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? 'Kopiert!' : 'Link kopieren'}
            </Button>
          </div>

          {/* Instagram Story download */}
          {storyImage && (
            <Button
              onClick={handleDownloadStory}
              variant="outline"
              className="w-full h-10 text-sm border-border mb-2"
            >
              <Download className="h-4 w-4 mr-2" />
              Story-Bild herunterladen (1080×1920)
            </Button>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Zeig deinen Freunden deinen Rasen-Score 💚
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// Internal type for native share
interface ShareData2 {
  title: string;
  text: string;
  url: string;
  files?: File[];
}

export default LawnScoreShareCard;
