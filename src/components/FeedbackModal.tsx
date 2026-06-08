import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FeedbackModalProps {
  analysisId?: string;
  status?: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ analysisId, status }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!analysisId || status !== 'completed') return;
    const seenKey = `feedback-shown-${analysisId}`;
    if (localStorage.getItem(seenKey)) return;
    const t = setTimeout(() => {
      setOpen(true);
      localStorage.setItem(seenKey, '1');
    }, 4000);
    return () => clearTimeout(t);
  }, [analysisId, status]);

  const handleSubmit = async () => {
    if (rating < 1) {
      toast({ title: 'Bitte wähle eine Bewertung', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('analysis_feedback').insert({
        analysis_id: analysisId || null,
        user_id: user?.id || null,
        rating,
        comment: comment.trim() || null,
      });
      if (error) throw error;

      // Fire-and-forget admin notification
      supabase.functions.invoke('send-feedback-notification', {
        body: {
          analysisId,
          rating,
          comment: comment.trim() || null,
          userEmail: user?.email || null,
        },
      }).catch(() => {});

      toast({ title: 'Danke für dein Feedback! 🌱', description: 'Wir freuen uns über deine Bewertung.' });
      setOpen(false);
    } catch (e: any) {
      toast({ title: 'Fehler beim Senden', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-green-800">Wie war deine Analyse?</DialogTitle>
          <DialogDescription>
            Dein Feedback hilft uns, Rasenpilot stetig zu verbessern.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-2 py-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              className="transition-transform hover:scale-110"
              aria-label={`${n} Sterne`}
            >
              <Star
                className={`w-10 h-10 ${
                  (hover || rating) >= n ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>

        <Textarea
          placeholder="Optional: Was können wir besser machen?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          rows={4}
          className="resize-none"
        />

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>
            Später
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || rating < 1}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Feedback senden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
