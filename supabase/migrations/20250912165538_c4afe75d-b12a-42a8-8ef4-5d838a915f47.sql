-- Ajouter des critères de sélection aux castings
ALTER TABLE public.castings ADD COLUMN IF NOT EXISTS required_voice_types text[] DEFAULT NULL;
ALTER TABLE public.castings ADD COLUMN IF NOT EXISTS required_age_min integer DEFAULT NULL;
ALTER TABLE public.castings ADD COLUMN IF NOT EXISTS required_age_max integer DEFAULT NULL;
ALTER TABLE public.castings ADD COLUMN IF NOT EXISTS required_min_experience integer DEFAULT NULL;
ALTER TABLE public.castings ADD COLUMN IF NOT EXISTS required_languages text[] DEFAULT NULL;
ALTER TABLE public.castings ADD COLUMN IF NOT EXISTS required_nationalities text[] DEFAULT NULL;
ALTER TABLE public.castings ADD COLUMN IF NOT EXISTS required_genders text[] DEFAULT NULL;

-- Créer une fonction pour vérifier si un artiste correspond aux critères d'un casting
CREATE OR REPLACE FUNCTION public.artist_matches_casting_criteria(
  casting_id_param uuid,
  artist_profile_id_param uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  casting_record record;
  artist_record record;
  artist_age integer;
BEGIN
  -- Récupérer les critères du casting
  SELECT * INTO casting_record
  FROM castings
  WHERE id = casting_id_param;
  
  -- Si le casting n'existe pas, retourner false
  IF casting_record IS NULL THEN
    RETURN false;
  END IF;
  
  -- Récupérer le profil de l'artiste
  SELECT * INTO artist_record
  FROM artist_profiles
  WHERE id = artist_profile_id_param;
  
  -- Si l'artiste n'existe pas, retourner false
  IF artist_record IS NULL THEN
    RETURN false;
  END IF;
  
  -- Calculer l'âge de l'artiste si birth_date est disponible
  IF artist_record.birth_date IS NOT NULL THEN
    artist_age := EXTRACT(YEAR FROM AGE(artist_record.birth_date));
  END IF;
  
  -- Vérifier le type de voix
  IF casting_record.required_voice_types IS NOT NULL 
     AND array_length(casting_record.required_voice_types, 1) > 0 
     AND (artist_record.voice_type IS NULL 
          OR NOT (artist_record.voice_type = ANY(casting_record.required_voice_types))) THEN
    RETURN false;
  ENDIF;
  
  -- Vérifier l'âge minimum
  IF casting_record.required_age_min IS NOT NULL 
     AND (artist_age IS NULL OR artist_age < casting_record.required_age_min) THEN
    RETURN false;
  END IF;
  
  -- Vérifier l'âge maximum
  IF casting_record.required_age_max IS NOT NULL 
     AND (artist_age IS NULL OR artist_age > casting_record.required_age_max) THEN
    RETURN false;
  END IF;
  
  -- Vérifier l'expérience minimum
  IF casting_record.required_min_experience IS NOT NULL 
     AND (artist_record.experience_years IS NULL 
          OR artist_record.experience_years < casting_record.required_min_experience) THEN
    RETURN false;
  END IF;
  
  -- Vérifier les langues parlées
  IF casting_record.required_languages IS NOT NULL 
     AND array_length(casting_record.required_languages, 1) > 0 
     AND (artist_record.spoken_languages IS NULL 
          OR NOT (casting_record.required_languages && artist_record.spoken_languages)) THEN
    RETURN false;
  END IF;
  
  -- Vérifier les nationalités
  IF casting_record.required_nationalities IS NOT NULL 
     AND array_length(casting_record.required_nationalities, 1) > 0 
     AND (artist_record.nationality IS NULL 
          OR NOT (artist_record.nationality = ANY(casting_record.required_nationalities))) THEN
    RETURN false;
  END IF;
  
  -- Vérifier le genre
  IF casting_record.required_genders IS NOT NULL 
     AND array_length(casting_record.required_genders, 1) > 0 
     AND (artist_record.gender IS NULL 
          OR NOT (artist_record.gender = ANY(casting_record.required_genders))) THEN
    RETURN false;
  END IF;
  
  -- Si tous les critères sont respectés
  RETURN true;
END;
$$;

-- Créer une vue pour les castings visibles par un artiste spécifique
CREATE OR REPLACE VIEW public.visible_castings AS
SELECT 
  c.*,
  CASE 
    WHEN auth.uid() IS NULL THEN true -- Si pas connecté, voir tous les castings
    WHEN NOT EXISTS (SELECT 1 FROM artist_profiles WHERE user_id = auth.uid()) THEN true -- Si pas artiste, voir tous
    ELSE artist_matches_casting_criteria(c.id, (SELECT id FROM artist_profiles WHERE user_id = auth.uid()))
  END as visible_to_current_user
FROM castings c
WHERE c.is_active = true;

-- Mettre à jour les politiques RLS pour les castings
DROP POLICY IF EXISTS "Anyone can view active castings" ON castings;

-- Nouvelle politique : seuls les castings correspondant aux critères sont visibles
CREATE POLICY "Artists can only see castings matching their profile" 
ON castings 
FOR SELECT 
USING (
  is_active = true 
  AND (
    -- Si l'utilisateur n'est pas connecté ou n'est pas un artiste, il peut voir tous les castings
    auth.uid() IS NULL 
    OR NOT EXISTS (SELECT 1 FROM artist_profiles WHERE user_id = auth.uid())
    -- Si c'est un artiste, vérifier les critères
    OR artist_matches_casting_criteria(id, (SELECT id FROM artist_profiles WHERE user_id = auth.uid()))
  )
);