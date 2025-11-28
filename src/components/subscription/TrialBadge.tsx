import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface TrialBadgeProps {
  isTrial: boolean;
  trialEnd?: string | null;
}

export const TrialBadge = ({ isTrial, trialEnd }: TrialBadgeProps) => {
  if (!isTrial || !trialEnd) return null;

  const daysRemaining = Math.ceil(
    (new Date(trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Badge variant="secondary" className="gap-1">
      <Clock className="h-3 w-3" />
      Trial: {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
    </Badge>
  );
};
