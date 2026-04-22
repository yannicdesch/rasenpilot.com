import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PostConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  problems: string[];
  score?: number;
}

const PostConfirmationModal: React.FC<PostConfirmationModalProps> = ({ open, onClose, problems, score }) => {
  const navigate = useNavigate();
  const top = (problems || []).filter(Boolean).slice(0, 3);

  const handleTrial = () => {
    onClose();
    navigate(`/subscription?ref=post_confirmation${score ? `&score=${score}` : ''}`);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <div className="p-6 pb-4 text-center">
          <div className="w-14 h-14 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Dein Ergebnis ist gespeichert 🎉
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            Wir haben {top.length > 0 ? `${top.length} Hauptprobleme` : 'die Hauptprobleme'} an deinem Rasen erkannt:
          </DialogDescription>
        </div>

        {top.length > 0 && (
          <div className="px-6 pb-4">
            <ul className="space-y-2">
              {top.map((p, i) => (
                <li key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground leading-snug">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Leaderboard confirmation */}
        <div className="mx-6 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <Trophy className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-900 leading-snug">
            <strong>Du bist jetzt in der Bestenliste!</strong>
            <br />
            <span className="text-green-800">
              Dein Score{typeof score === 'number' ? ` (${score}/100)` : ''} wurde mit deinem Vornamen und deiner PLZ in die Nachbarschafts-Bestenliste eingetragen.
            </span>
          </div>
        </div>

        <div className="px-6 pb-6 pt-2 space-y-3">
          <Button
            onClick={handleTrial}
            className="w-full h-14 bg-green-600 hover:bg-green-700 text-base font-semibold"
          >
            7 Tage kostenlos testen — dann 9,99€/Monat
          </Button>
          <button
            onClick={onClose}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
          >
            Nein danke, nur Basis-Ergebnis ansehen
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostConfirmationModal;
