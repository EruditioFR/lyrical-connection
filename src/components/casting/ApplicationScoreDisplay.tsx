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
    if (score >= 16) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 13) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (score >= 10) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <Badge variant="outline" className={`flex items-center gap-1 ${getScoreColor(averageScore)}`}>
      <Star className="h-3 w-3 fill-current" />
      {averageScore.toFixed(1)}/20
    </Badge>
  );
};
