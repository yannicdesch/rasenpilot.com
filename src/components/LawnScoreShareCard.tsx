import React, { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check, MessageCircle, Facebook, Instagram } from 'lucide-react';
import { toast } from 'sonner';

interface LawnScoreShareCardProps {
  score: number;
  analysisDate?: string;
  jobId?: string;
}

const LawnScoreShareCard: React.FC<LawnScoreShareCardProps> = ({ score, analysisDate, jobId }) => {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const shareUrl = 'https://rasenpilot.com';
  const shareText = `Mein Rasen hat ${score}/100 Punkte! 🌱 Kannst du mich schlagen? → rasenpilot.com`;

  const getScoreEmoji = () => {
    if (score >= 80) return '🏆';
    if (score >= 60) return '🌿';
    return '🌱';
  };

  const getScoreLabel = () => {
    if (score >= 80) return 'Traumrasen';
    if (score >= 60) return 'Auf gutem Weg';
    return 'Wachstumspotenzial';
  };

  const getGradient = () => {
    if (score >= 80) return 'from-emerald-600 via-green-500 to-teal-400';
    if (score >= 60) return 'from-green-600 via-emerald-500 to-lime-400';
    return 'from-amber-500 via-yellow-500 to-lime-400';
  };

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleInstagramShare = () => {
    // Instagram doesn't have a direct share URL, copy text instead
    navigator.clipboard.writeText(shareText);
    toast.success('Text kopiert! Füge ihn in deine Instagram Story ein 📸');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mein Rasen-Score',
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    toast.success('In die Zwischenablage kopiert!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = analysisDate
    ? new Date(analysisDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4">
      {/* The visual share card */}
      <div
        ref={cardRef}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getGradient()} p-6 text-white shadow-2xl`}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 right-4 text-6xl opacity-20 select-none">🌱</div>

        <div className="relative z-10">
          {/* Logo area */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center text-lg">
              🌿
            </div>
            <span className="font-bold text-sm tracking-wider uppercase opacity-90">RasenPilot</span>
          </div>

          {/* Score display */}
          <div className="text-center mb-6">
            <div className="text-6xl font-black mb-1 drop-shadow-lg">
              {score}
              <span className="text-2xl font-bold opacity-80">/100</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-lg font-semibold">
              <span className="text-2xl">{getScoreEmoji()}</span>
              <span className="drop-shadow">{getScoreLabel()}</span>
            </div>
          </div>

          {/* Score bar */}
          <div className="mb-6">
            <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-lg"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs opacity-80">
            <span>{formattedDate}</span>
            <span className="font-medium">rasenpilot.com</span>
          </div>
        </div>
      </div>

      {/* Share buttons */}
      <Card className="border-border">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Kannst du mich schlagen? 💪
          </p>
          <p className="text-xs text-muted-foreground mb-3">Teile deinen Score — fordere Freunde heraus!</p>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <Button
              onClick={handleWhatsAppShare}
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white h-11 text-sm font-medium"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            <Button
              onClick={handleFacebookShare}
              className="bg-[#1877F2] hover:bg-[#1565d8] text-white h-11 text-sm font-medium"
            >
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            <Button
              onClick={handleInstagramShare}
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

          <p className="text-xs text-muted-foreground text-center">
            Jeder geteilte Score hilft anderen, ihren Rasen zu verbessern 💚
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LawnScoreShareCard;
