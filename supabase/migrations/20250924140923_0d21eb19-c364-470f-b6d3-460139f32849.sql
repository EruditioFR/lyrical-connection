-- Créer la table pour les évaluations d'artistes par les professionnels
CREATE TABLE public.artist_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_profile_id UUID NOT NULL,
  artist_profile_id UUID NOT NULL,
  vocal_quality INTEGER, -- sur 10, NULL = non évalué
  vocal_technique INTEGER, -- sur 10, NULL = non évalué
  stage_presence INTEGER, -- sur 10, NULL = non évalué
  language_mastery INTEGER, -- sur 10, NULL = non évalué
  pitch_accuracy INTEGER, -- sur 10, NULL = non évalué
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_profile_id, artist_profile_id)
);

-- Créer la table pour les favoris d'artistes par les professionnels
CREATE TABLE public.artist_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_profile_id UUID NOT NULL,
  artist_profile_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_profile_id, artist_profile_id)
);

-- Activer RLS
ALTER TABLE public.artist_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_favorites ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour artist_evaluations
CREATE POLICY "Professionals can manage their own evaluations" 
ON public.artist_evaluations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM professional_profiles 
  WHERE professional_profiles.id = artist_evaluations.professional_profile_id 
  AND professional_profiles.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM professional_profiles 
  WHERE professional_profiles.id = artist_evaluations.professional_profile_id 
  AND professional_profiles.user_id = auth.uid()
));

-- Politiques RLS pour artist_favorites
CREATE POLICY "Professionals can manage their own favorites" 
ON public.artist_favorites 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM professional_profiles 
  WHERE professional_profiles.id = artist_favorites.professional_profile_id 
  AND professional_profiles.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM professional_profiles 
  WHERE professional_profiles.id = artist_favorites.professional_profile_id 
  AND professional_profiles.user_id = auth.uid()
));

-- Trigger pour updated_at
CREATE TRIGGER update_artist_evaluations_updated_at
BEFORE UPDATE ON public.artist_evaluations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();