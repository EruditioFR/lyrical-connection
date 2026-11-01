-- Suite des outils professionnels (dépend de 20261026220000_professional_artist_lists_notes.sql) :
--  1. disponibilités des artistes
--  2. partage d'une liste de projet par lien en lecture seule
--  3. jury à plusieurs : jurés invités sur un casting, une note par juré

------------------------------------------------------------------------------
-- 1. Disponibilités des artistes
------------------------------------------------------------------------------
CREATE TABLE public.artist_unavailabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_profile_id UUID NOT NULL REFERENCES public.artist_profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  kind TEXT NOT NULL DEFAULT 'indisponible' CHECK (kind IN ('engagement', 'indisponible')),
  title TEXT CHECK (title IS NULL OR char_length(title) <= 200),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

CREATE INDEX idx_artist_unavailabilities_artist_dates
  ON public.artist_unavailabilities(artist_profile_id, start_date, end_date);

ALTER TABLE public.artist_unavailabilities ENABLE ROW LEVEL SECURITY;

-- Visibles des membres connectés (professionnels qui recrutent), pas du public anonyme
CREATE POLICY "Signed-in users can view artist unavailabilities"
ON public.artist_unavailabilities
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Artists manage their own unavailabilities"
ON public.artist_unavailabilities
FOR ALL
USING (EXISTS (
  SELECT 1 FROM artist_profiles
  WHERE artist_profiles.id = artist_unavailabilities.artist_profile_id
  AND artist_profiles.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM artist_profiles
  WHERE artist_profiles.id = artist_unavailabilities.artist_profile_id
  AND artist_profiles.user_id = auth.uid()
));

CREATE TRIGGER update_artist_unavailabilities_updated_at
BEFORE UPDATE ON public.artist_unavailabilities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

------------------------------------------------------------------------------
-- 2. Partage d'une liste par lien
------------------------------------------------------------------------------
ALTER TABLE public.professional_artist_lists
  ADD COLUMN share_token UUID UNIQUE;

-- Lecture d'une liste partagée : nom, auteur et artistes (informations publiques uniquement,
-- jamais les notes privées). Accessible sans compte, à qui possède le lien.
CREATE OR REPLACE FUNCTION public.get_shared_artist_list(p_token UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'name', l.name,
    'description', l.description,
    'owner', pp.company_name,
    'items', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'artist_profile_id', a.id,
        'stage_name', a.stage_name,
        'voice_type', a.voice_type,
        'location', a.location,
        'role_name', i.role_name,
        'photo_path', (
          SELECT ph.file_path FROM artist_photos ph
          WHERE ph.artist_profile_id = a.id AND ph.is_profile_photo
          LIMIT 1
        )
      ) ORDER BY i.created_at)
      FROM professional_artist_list_items i
      JOIN artist_profiles a ON a.id = i.artist_profile_id
      WHERE i.list_id = l.id AND a.is_active
    ), '[]'::jsonb)
  )
  FROM professional_artist_lists l
  JOIN professional_profiles pp ON pp.id = l.professional_profile_id
  WHERE p_token IS NOT NULL AND l.share_token = p_token;
$$;

REVOKE ALL ON FUNCTION public.get_shared_artist_list(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_artist_list(UUID) TO anon, authenticated;

------------------------------------------------------------------------------
-- 3. Jury à plusieurs
------------------------------------------------------------------------------
CREATE TABLE public.casting_jury_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  casting_id UUID NOT NULL REFERENCES public.castings(id) ON DELETE CASCADE,
  professional_profile_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (casting_id, professional_profile_id)
);

CREATE INDEX idx_casting_jury_members_professional ON public.casting_jury_members(professional_profile_id);

-- Fonctions d'appartenance, en SECURITY DEFINER pour que les politiques ci-dessous
-- ne se rappellent pas les unes les autres (récursion RLS)
CREATE OR REPLACE FUNCTION public.is_casting_owner(p_casting_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM castings c
    JOIN professional_profiles pp ON pp.id = c.professional_profile_id
    WHERE c.id = p_casting_id AND pp.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_casting_juror(p_casting_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM casting_jury_members m
    JOIN professional_profiles pp ON pp.id = m.professional_profile_id
    WHERE m.casting_id = p_casting_id AND pp.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_application_juror(p_application_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM applications a
    WHERE a.id = p_application_id AND public.is_casting_juror(a.casting_id)
  );
$$;

-- Juré d'au moins un casting de ce professionnel (pour lire ses critères de notation)
CREATE OR REPLACE FUNCTION public.is_juror_for_professional(p_professional_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM casting_jury_members m
    JOIN castings c ON c.id = m.casting_id
    JOIN professional_profiles pp ON pp.id = m.professional_profile_id
    WHERE c.professional_profile_id = p_professional_profile_id AND pp.user_id = auth.uid()
  );
$$;

ALTER TABLE public.casting_jury_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Casting owners manage their jury"
ON public.casting_jury_members
FOR ALL
USING (public.is_casting_owner(casting_id))
WITH CHECK (public.is_casting_owner(casting_id));

CREATE POLICY "Jurors see the jury of their castings"
ON public.casting_jury_members
FOR SELECT
USING (public.is_casting_juror(casting_id));

CREATE POLICY "Jurors can leave a jury"
ON public.casting_jury_members
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM professional_profiles pp
  WHERE pp.id = casting_jury_members.professional_profile_id AND pp.user_id = auth.uid()
));

-- Les jurés lisent le casting, ses candidatures et les critères de notation du propriétaire
CREATE POLICY "Jurors can view their castings"
ON public.castings
FOR SELECT
USING (public.is_casting_juror(id));

CREATE POLICY "Jurors can view applications to their castings"
ON public.applications
FOR SELECT
USING (public.is_casting_juror(casting_id));

CREATE POLICY "Jurors can view the casting owner's criteria"
ON public.custom_criteria
FOR SELECT
USING (public.is_juror_for_professional(professional_profile_id));

-- Une note par critère ET par juré (avant : une seule note par critère, tous jurés confondus)
DO $$
DECLARE c RECORD;
BEGIN
  FOR c IN
    SELECT con.conname
    FROM pg_constraint con
    WHERE con.conrelid = 'public.candidate_scores'::regclass
      AND con.contype = 'u'
      AND (SELECT array_agg(att.attname::text ORDER BY att.attname)
           FROM unnest(con.conkey) k JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = k)
          = ARRAY['application_id', 'criteria_id']
  LOOP
    EXECUTE format('ALTER TABLE public.candidate_scores DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE public.candidate_scores
  ADD CONSTRAINT candidate_scores_application_criteria_scorer_key UNIQUE (application_id, criteria_id, scored_by);

CREATE POLICY "Jurors manage their own scores"
ON public.candidate_scores
FOR ALL
USING (scored_by = auth.uid() AND public.is_application_juror(application_id))
WITH CHECK (scored_by = auth.uid() AND public.is_application_juror(application_id));
