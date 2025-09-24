import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useArtistEvaluations } from '@/hooks/useArtistEvaluations';

interface ArtistEvaluationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  artistProfileId: string;
  artistName: string;
  professionalProfileId: string;
}

interface CriteriaRating {
  name: string;
  key: string;
  value: number | null;
}

const ArtistEvaluationDialog: React.FC<ArtistEvaluationDialogProps> = ({
  isOpen,
  onClose,
  artistProfileId,
  artistName,
  professionalProfileId
}) => {
  const { getEvaluation, upsertEvaluation } = useArtistEvaluations(professionalProfileId);
  
  const [criteria, setCriteria] = useState<CriteriaRating[]>([
    { name: 'Qualité de la voix', key: 'vocal_quality', value: null },
    { name: 'Technique vocale', key: 'vocal_technique', value: null },
    { name: 'Présence scénique', key: 'stage_presence', value: null },
    { name: 'Maîtrise des langues', key: 'language_mastery', value: null },
    { name: 'Justesse', key: 'pitch_accuracy', value: null }
  ]);
  
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      const existingEvaluation = getEvaluation(artistProfileId);
      if (existingEvaluation) {
        setCriteria([
          { name: 'Qualité de la voix', key: 'vocal_quality', value: existingEvaluation.vocal_quality || null },
          { name: 'Technique vocale', key: 'vocal_technique', value: existingEvaluation.vocal_technique || null },
          { name: 'Présence scénique', key: 'stage_presence', value: existingEvaluation.stage_presence || null },
          { name: 'Maîtrise des langues', key: 'language_mastery', value: existingEvaluation.language_mastery || null },
          { name: 'Justesse', key: 'pitch_accuracy', value: existingEvaluation.pitch_accuracy || null }
        ]);
        setNotes(existingEvaluation.notes || '');
      }
    }
  }, [isOpen, artistProfileId, getEvaluation]);

  const handleRatingChange = (criteriaIndex: number, rating: number | null) => {
    setCriteria(prev => prev.map((criterion, index) => 
      index === criteriaIndex ? { ...criterion, value: rating } : criterion
    ));
  };

  const handleSave = async () => {
    const evaluationData: any = {};
    criteria.forEach(criterion => {
      evaluationData[criterion.key] = criterion.value;
    });
    evaluationData.notes = notes.trim() || undefined;

    await upsertEvaluation.mutateAsync({
      artistProfileId,
      criteria: evaluationData
    });
    
    onClose();
  };

  const StarRating = ({ value, onChange }: { value: number | null; onChange: (rating: number | null) => void }) => {
    return (
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant={value === null ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(null)}
          className="text-xs px-2"
          aria-label="Marquer comme non évalué"
        >
          Non évalué
        </Button>
        <div className="flex gap-1 ml-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => onChange(rating)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onChange(rating);
                }
              }}
              className="p-1 hover:scale-110 transition-transform"
              aria-label={`Noter ${rating}/10`}
              title={`Noter ${rating}/10`}
            >
              <Star
                className={`h-4 w-4 ${
                  value && rating <= value
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        <span className="ml-2 text-sm text-muted-foreground">
          {value ? `${value}/10` : ''}
        </span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Évaluer {artistName}</DialogTitle>
          <DialogDescription id="evaluation-desc">
            Sélectionnez une note de 0 à 10 (ou « Non évalué ») pour chaque critère.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {criteria.map((criterion, index) => (
            <div key={criterion.key} className="space-y-2">
              <Label className="text-sm font-medium">
                {criterion.name}
              </Label>
              <StarRating
                value={criterion.value}
                onChange={(rating) => handleRatingChange(index, rating)}
              />
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes complémentaires
            </Label>
            <Textarea
              id="notes"
              placeholder="Ajoutez des commentaires sur cette évaluation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              onClick={handleSave}
              disabled={upsertEvaluation.isPending}
            >
              {upsertEvaluation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArtistEvaluationDialog;