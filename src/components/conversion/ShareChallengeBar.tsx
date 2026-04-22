import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ShareChallengeBarProps {
  score: number;
  /** Delay in ms before showing the bar (default 30s) */
  delayMs?: number;
}

/**
 * Slide-up bar that appears 30 seconds after the analysis result loads,
 * inviting the user to challenge their neighbours via WhatsApp.
 */
const ShareChallengeBar: React.FC<ShareChallengeBarProps> = ({ score, delayMs = 30_000 }) => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const t = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs, dismissed]);

  if (!visible || dismissed) return null;

  const message = `Mein Rasen-Score ist ${score}/100 — wie gut ist deiner? Teste es kostenlos: rasenpilot.com/lawn-analysis`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pointer-events-none"
      role="dialog"
      aria-label="Nachbar-Challenge teilen"
    >
      <div
        className="mx-auto max-w-md bg-white shadow-2xl border border-green-200 rounded-2xl p-4 pointer-events-auto animate-in slide-in-from-bottom-4 duration-500"
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-snug">
              🌱 Fordere deine Nachbarn heraus — wessen Rasen ist grüner?
            </p>
            <div className="flex items-center gap-2 mt-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd57] text-white text-sm font-semibold rounded-lg h-10 px-4 transition-colors"
                onClick={() => setDismissed(true)}
              >
                <span aria-hidden="true">💬</span> Auf WhatsApp teilen
              </a>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="text-sm text-muted-foreground hover:text-foreground px-3 h-10 rounded-lg"
              >
                Später
              </button>
            </div>
          </div>
          <button
            type="button"
            aria-label="Schließen"
            onClick={() => setDismissed(true)}
            className="text-muted-foreground hover:text-foreground p-1 -mt-1 -mr-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareChallengeBar;
