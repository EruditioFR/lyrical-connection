-- Table pour les évaluations de concours par les jurys
CREATE TABLE public.contest_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id UUID NOT NULL REFERENCES public.castings(id) ON DELETE CASCADE,
  artist_profile_id UUID NOT NULL REFERENCES public.artist_profiles(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  
  -- Notes de 0 à 10 (décimales autorisées)
  vocal_quality DECIMAL(3,1) CHECK (vocal_quality >= 0 AND vocal_quality <= 10),
  vocal_technique DECIMAL(3,1) CHECK (vocal_technique >= 0 AND vocal_technique <= 10),
  stage_presence DECIMAL(3,1) CHECK (stage_presence >= 0 AND stage_presence <= 10),
  language_mastery DECIMAL(3,1) CHECK (language_mastery >= 0 AND language_mastery <= 10),
  pitch_accuracy DECIMAL(3,1) CHECK (pitch_accuracy >= 0 AND pitch_accuracy <= 10),
  
  -- Moyenne calculée automatiquement
  average_score DECIMAL(3,1),
  
  -- Rejet rapide ("Niveau trop faible")
  is_rejected BOOLEAN NOT NULL DEFAULT false,
  
  -- Commentaires privés du jury
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Un jury ne peut évaluer un candidat qu'une seule fois par concours
  CONSTRAINT unique_evaluation_per_jury UNIQUE (contest_id, artist_profile_id, evaluator_id)
);

-- Activer RLS
ALTER TABLE public.contest_evaluations ENABLE ROW LEVEL SECURITY;

-- Index pour performances
CREATE INDEX idx_contest_evaluations_contest ON public.contest_evaluations(contest_id);
CREATE INDEX idx_contest_evaluations_artist ON public.contest_evaluations(artist_profile_id);
CREATE INDEX idx_contest_evaluations_evaluator ON public.contest_evaluations(evaluator_id);

-- Trigger pour updated_at
CREATE TRIGGER update_contest_evaluations_updated_at
  BEFORE UPDATE ON public.contest_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Policies RLS

-- Les jurys (professionnels) peuvent créer des évaluations pour les concours où ils sont organisateurs
CREATE POLICY "Jurys can create evaluations for their contests"
  ON public.contest_evaluations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM professional_profiles pp
      JOIN castings c ON c.professional_profile_id = pp.id
      WHERE pp.user_id = auth.uid()
      AND c.id = contest_id
    )
  );

-- Les jurys peuvent voir leurs propres évaluations
CREATE POLICY "Jurys can view their own evaluations"
  ON public.contest_evaluations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM professional_profiles pp
      WHERE pp.user_id = auth.uid()
      AND pp.id = evaluator_id
    )
  );

-- Les organisateurs peuvent voir toutes les évaluations de leurs concours
CREATE POLICY "Organizers can view all evaluations for their contests"
  ON public.contest_evaluations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM professional_profiles pp
      JOIN castings c ON c.professional_profile_id = pp.id
      WHERE pp.user_id = auth.uid()
      AND c.id = contest_id
    )
  );

-- Les jurys peuvent modifier leurs propres évaluations
CREATE POLICY "Jurys can update their own evaluations"
  ON public.contest_evaluations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM professional_profiles pp
      WHERE pp.user_id = auth.uid()
      AND pp.id = evaluator_id
    )
  );

-- Les jurys peuvent supprimer leurs propres évaluations
CREATE POLICY "Jurys can delete their own evaluations"
  ON public.contest_evaluations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM professional_profiles pp
      WHERE pp.user_id = auth.uid()
      AND pp.id = evaluator_id
    )
  );