import { Badge } from '@/components/ui/badge';
import { useCandidateScores } from '@/hooks/useCandidateScores';
import { Star } from 'lucide-react';

interface ApplicationScoreDisplayProps {
  applicationId: string;
}

export const ApplicationScoreDisplay = ({ applicationId }: ApplicationScoreDisplayProps) => {
  const { averageScore, isLoading } = useCandidateScores(applicationId);

  if (isLoading || !averageScore) return null;

  const getScoreColor = (score: number) => {
    if (score >= 16) return 'bg-success/15 text-success border-success/30';
    if (score >= 13) return 'bg-info/15 text-info border-info/30';
    if (score >= 10) return 'bg-warning/15 text-warning border-warning/30';
    return 'bg-destructive/15 text-destructive border-destructive/30';
  };

  return (
    <Badge variant="outline" className={`flex items-center gap-1 ${getScoreColor(averageScore)}`}>
      <Star className="h-3 w-3 fill-current" />
      {averageScore.toFixed(1)}/20
    </Badge>
  );
};
