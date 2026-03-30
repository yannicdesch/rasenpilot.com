import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { Rank } from '@/lib/rankSystem';

interface RankUpCelebrationProps {
  open: boolean;
  onClose: () => void;
  newRank: Rank;
  score: number;
}

const RankUpCelebration: React.FC<RankUpCelebrationProps> = ({ open, onClose, newRank, score }) => {
  const shareMessage = `🎉 Rang-Aufstieg bei Rasenpilot! Ich bin jetzt ${newRank.emoji} ${newRank.name} (Level ${newRank.level}) mit ${score}/100 Punkten! "${newRank.roast}" 🌱 Analysiere deinen Rasen auf rasenpilot.com`;

  const handleShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent className="max-w-md text-center">
        <AlertDialogHeader>
          <div className="text-6xl mb-2">🎉</div>
          <AlertDialogTitle className="text-2xl font-bold">RANG-AUFSTIEG!</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-muted-foreground">Du bist jetzt:</p>
              <div className={`inline-flex flex-col items-center gap-1 px-6 py-4 rounded-xl ${newRank.bgColor} ${newRank.borderColor} border-2`}>
                <span className="text-4xl">{newRank.emoji}</span>
                <span className={`text-xl font-bold ${newRank.color}`}>{newRank.name}</span>
                <span className="text-sm text-muted-foreground">Level {newRank.level}</span>
              </div>
              <p className="text-sm italic text-muted-foreground">"{newRank.roast}"</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleShare} className="w-full bg-green-600 hover:bg-green-700">
            <Share2 className="h-4 w-4 mr-2" />
            Mit Freunden teilen 🎉
          </Button>
          <AlertDialogAction onClick={onClose} className="w-full">
            Weiter →
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RankUpCelebration;
