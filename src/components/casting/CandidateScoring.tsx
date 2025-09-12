import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { useCustomCriteria } from '@/hooks/useCustomCriteria';
import { useCandidateScores } from '@/hooks/useCandidateScores';

interface CandidateScoringProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  candidateName: string;
  professionalProfileId: string;
}

const CandidateScoring = ({ 
  isOpen, 
  onClose, 
  applicationId, 
  candidateName, 
  professionalProfileId 
}: CandidateScoringProps) => {
  const { criteria } = useCustomCriteria(professionalProfileId);
  const { scores, upsertScore, averageScore } = useCandidateScores(applicationId);
  const [localScores, setLocalScores] = useState<Record<string, { score: number; comments: string }>>({});

  useEffect(() => {
    // Initialize local scores with existing scores
    const initialScores: Record<string, { score: number; comments: string }> = {};
    
    criteria.forEach(criterion => {
      const existingScore = scores.find(s => s.criteria_id === criterion.id);
      initialScores[criterion.id] = {
        score: existingScore?.score || 10,
        comments: existingScore?.comments || ''
      };
    });
    
    setLocalScores(initialScores);
  }, [criteria, scores]);

  const handleScoreChange = async (criteriaId: string, score: number) => {
    const newLocalScores = {
      ...localScores,
      [criteriaId]: { ...localScores[criteriaId], score }
    };
    setLocalScores(newLocalScores);
    
    // Auto-save score
    try {
      await upsertScore.mutateAsync({
        criteria_id: criteriaId,
        score,
        comments: localScores[criteriaId]?.comments || ''
      });
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const handleCommentsChange = (criteriaId: string, comments: string) => {
    setLocalScores(prev => ({
      ...prev,
      [criteriaId]: { ...prev[criteriaId], comments }
    }));
  };

  const handleCommentsBlur = async (criteriaId: string) => {
    const scoreData = localScores[criteriaId];
    if (!scoreData) return;
    
    try {
      await upsertScore.mutateAsync({
        criteria_id: criteriaId,
        score: scoreData.score,
        comments: scoreData.comments
      });
    } catch (error) {
      console.error('Error saving comments:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 16) return 'text-green-600';
    if (score >= 12) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 18) return 'Excellent';
    if (score >= 16) return 'Très bien';
    if (score >= 14) return 'Bien';
    if (score >= 12) return 'Satisfaisant';
    if (score >= 10) return 'Moyen';
    if (score >= 8) return 'Insuffisant';
    return 'Très insuffisant';
  };

  if (criteria.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notation impossible</DialogTitle>
            <DialogDescription>
              Vous devez d'abord créer des critères de notation dans l'onglet "Critères" 
              avant de pouvoir évaluer les candidats.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={onClose}>Fermer</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Noter {candidateName}
          </DialogTitle>
          <DialogDescription>
            Évaluez ce candidat selon vos critères personnalisés (note de 1 à 20)
          </DialogDescription>
        </DialogHeader>

        {averageScore > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Note globale moyenne</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={getScoreColor(averageScore)}>
                    {averageScore}/20
                  </Badge>
                  <span className={`text-sm ${getScoreColor(averageScore)}`}>
                    {getScoreLabel(averageScore)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {criteria.map((criterion) => {
            const currentScore = localScores[criterion.id]?.score || 10;
            
            return (
              <Card key={criterion.id}>
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{criterion.name}</h4>
                      {criterion.description && (
                        <p className="text-sm text-muted-foreground">{criterion.description}</p>
                      )}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={getScoreColor(currentScore)}
                    >
                      {currentScore}/20
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>1 (Très insuffisant)</span>
                      <span className={getScoreColor(currentScore)}>
                        {getScoreLabel(currentScore)}
                      </span>
                      <span>20 (Excellent)</span>
                    </div>
                    <Slider
                      value={[currentScore]}
                      onValueChange={(values) => handleScoreChange(criterion.id, values[0])}
                      max={20}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`comments-${criterion.id}`}>
                      Commentaires (optionnel)
                    </Label>
                    <Textarea
                      id={`comments-${criterion.id}`}
                      value={localScores[criterion.id]?.comments || ''}
                      onChange={(e) => handleCommentsChange(criterion.id, e.target.value)}
                      onBlur={() => handleCommentsBlur(criterion.id)}
                      placeholder="Vos observations sur ce critère..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateScoring;