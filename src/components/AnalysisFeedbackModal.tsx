import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from '@/lib/analytics/tracking';
import { cn } from '@/lib/utils';

interface AnalysisFeedbackModalProps {
  analysisId?: string | null;
  userId?: string | null;
  /** Delay in ms before the modal auto-opens. Defaults to 3000. */
  delayMs?: number;
}

const STORAGE_PREFIX = 'analysis-feedback-shown-';

const AnalysisFeedbackModal: React.FC<AnalysisFeedbackModalProps> = ({
  analysisId,
  userId,
  delayMs = 3000,
}) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!analysisId) return;
    const key = `${STORAGE_PREFIX}${analysisId}`;
    if (localStorage.getItem(key)) return;

    const t = setTimeout(() => {
      setOpen(true);
      localStorage.setItem(key, '1');
      trackEvent('feedback', 'feedback_shown', analysisId);
    }, delayMs);

    return () => clearTimeout(t);
  }, [analysisId, delayMs]);

  const handleSubmit = async () => {
    if (rating < 1) {
      toast.error('Bitte wähle eine Bewertung aus.');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('submit-analysis-feedback', {
        body: {
          analysis_id: analysisId ?? null,
          user_id: userId ?? null,
          rating,
          comment: comment.trim() || null,
        },
      });
      if (error) throw error;

      trackEvent('feedback', 'feedback_submitted', analysisId, rating);
      toast.success('Danke für dein Feedback! 🌱');
      setOpen(false);
    } catch (err) {
      console.error('Feedback submit error:', err);
      toast.error('Feedback konnte nicht gesendet werden. Bitte versuche es erneut.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-xl">Wie hilfreich war deine Analyse?</DialogTitle>
          <DialogDescription>
            Dein Feedback hilft uns, Rasenpilot besser zu machen.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-1 py-4">
          {[1, 2, 3, 4, 5].map((n) => {
            const active = (hover || rating) >= n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                className="p-1 transition-transform hover:scale-110"
                aria-label={`${n} Stern${n > 1 ? 'e' : ''}`}
              >
                <Star
                  className={cn(
                    'h-9 w-9 transition-colors',
                    active ? 'fill-primary text-primary' : 'text-muted-foreground',
                  )}
                />
              </button>
            );
          })}
        </div>

        <Textarea
          placeholder="Optional: Was können wir verbessern?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={2000}
          rows={3}
          className="resize-none"
        />

        <div className="flex gap-2 justify-end mt-2">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>
            Später
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || rating < 1}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Feedback senden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnalysisFeedbackModal;
