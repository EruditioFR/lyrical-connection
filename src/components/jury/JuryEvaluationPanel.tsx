import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useContestEvaluations, EvaluationInput } from '@/hooks/useContestEvaluations';
import { useProfessionalProfile } from '@/hooks/useProfessionalProfile';
import { ClipboardCheck, XCircle, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JuryEvaluationPanelProps {
  contestId: string;
  artistProfileId: string;
  artistName: string;
}

const CRITERIA = [
  { key: 'vocal_quality', label: 'Qualité de la voix', description: 'Timbre, couleur, projection' },
  { key: 'vocal_technique', label: 'Technique vocale', description: 'Maîtrise du souffle, agilité' },
  { key: 'stage_presence', label: 'Présence scénique', description: 'Charisme, expressivité' },
  { key: 'language_mastery', label: 'Maîtrise des langues', description: 'Diction, prononciation' },
  { key: 'pitch_accuracy', label: 'Justesse', description: 'Précision de l\'intonation' },
] as const;

type CriteriaKey = typeof CRITERIA[number]['key'];

const JuryEvaluationPanel: React.FC<JuryEvaluationPanelProps> = ({
  contestId,
  artistProfileId,
  artistName
}) => {
  const { profile: professionalProfile } = useProfessionalProfile();
  const { getEvaluationForArtist, upsertEvaluation, calculateAverage } = useContestEvaluations(
    contestId,
    professionalProfile?.id
  );

  const existingEvaluation = getEvaluationForArtist(artistProfileId);

  const [scores, setScores] = useState<Record<CriteriaKey, number | null>>({
    vocal_quality: null,
    vocal_technique: null,
    stage_presence: null,
    language_mastery: null,
    pitch_accuracy: null,
  });
  const [isRejected, setIsRejected] = useState(false);
  const [notes, setNotes] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Load existing evaluation
  useEffect(() => {
    if (existingEvaluation) {
      setScores({
        vocal_quality: existingEvaluation.vocal_quality,
        vocal_technique: existingEvaluation.vocal_technique,
        stage_presence: existingEvaluation.stage_presence,
        language_mastery: existingEvaluation.language_mastery,
        pitch_accuracy: existingEvaluation.pitch_accuracy,
      });
      setIsRejected(existingEvaluation.is_rejected);
      setNotes(existingEvaluation.notes || '');
      setHasChanges(false);
    }
  }, [existingEvaluation]);

  const handleScoreChange = (key: CriteriaKey, value: number[]) => {
    setScores(prev => ({ ...prev, [key]: value[0] }));
    setHasChanges(true);
  };

  const handleRejectedChange = (checked: boolean) => {
    setIsRejected(checked);
    setHasChanges(true);
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    const data: EvaluationInput = {
      ...scores,
      is_rejected: isRejected,
      notes: notes || null
    };

    await upsertEvaluation.mutateAsync({
      artistProfileId,
      data
    });
    setHasChanges(false);
  };

  // Calculate current average
  const currentAverage = calculateAverage(scores);

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 8) return 'text-green-600 font-bold';
    if (score >= 6) return 'text-primary';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-500';
  };

  if (!professionalProfile) {
    return null;
  }

  return (
    <Card className={cn(
      "border-2 transition-all",
      isRejected ? "border-destructive/50 bg-destructive/5" : "border-primary/20"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            Évaluation Jury
          </CardTitle>
          {currentAverage !== null && !isRejected && (
            <Badge variant="secondary" className={cn("text-lg px-3", getScoreColor(currentAverage))}>
              Moyenne: {currentAverage.toFixed(1)}/10
            </Badge>
          )}
          {isRejected && (
            <Badge variant="destructive" className="text-sm">
              <XCircle className="w-4 h-4 mr-1" />
              Non sélectionné
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Évaluation de {artistName}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick reject option */}
        <div className={cn(
          "flex items-center space-x-3 p-3 rounded-lg border",
          isRejected ? "bg-destructive/10 border-destructive/30" : "bg-muted/30"
        )}>
          <Checkbox
            id="rejected"
            checked={isRejected}
            onCheckedChange={handleRejectedChange}
            className="border-destructive data-[state=checked]:bg-destructive"
          />
          <Label 
            htmlFor="rejected" 
            className={cn(
              "cursor-pointer font-medium",
              isRejected && "text-destructive"
            )}
          >
            Niveau trop faible (rejet rapide)
          </Label>
        </div>

        <Separator />

        {/* Scoring criteria */}
        <div className={cn("space-y-5", isRejected && "opacity-50 pointer-events-none")}>
          {CRITERIA.map(({ key, label, description }) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">{label}</Label>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <span className={cn("text-lg font-semibold min-w-[3rem] text-right", getScoreColor(scores[key]))}>
                  {scores[key] !== null ? `${scores[key]}/10` : '-'}
                </span>
              </div>
              <Slider
                value={[scores[key] ?? 5]}
                onValueChange={(value) => handleScoreChange(key, value)}
                min={0}
                max={10}
                step={0.5}
                disabled={isRejected}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="font-medium">
            Commentaires privés
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Observations personnelles sur le candidat..."
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Save button */}
        <Button
          onClick={handleSave}
          disabled={!hasChanges || upsertEvaluation.isPending}
          className="w-full"
          size="lg"
        >
          {upsertEvaluation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer l'évaluation
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default JuryEvaluationPanel;
