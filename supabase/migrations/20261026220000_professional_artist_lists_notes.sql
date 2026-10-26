-- Outils de gestion pour les professionnels :
--  * listes d'artistes nommées par projet (shortlists)
--  * notes privées et étiquettes sur chaque artiste

-- Listes de projet
CREATE TABLE public.professional_artist_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_profile_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Artistes d'une liste (rôle envisagé optionnel)
CREATE TABLE public.professional_artist_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES public.professional_artist_lists(id) ON DELETE CASCADE,
  artist_profile_id UUID NOT NULL REFERENCES public.artist_profiles(id) ON DELETE CASCADE,
  role_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (list_id, artist_profile_id)
);

-- Notes privées et étiquettes (une fiche par professionnel et par artiste)
CREATE TABLE public.professional_artist_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_profile_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  artist_profile_id UUID NOT NULL REFERENCES public.artist_profiles(id) ON DELETE CASCADE,
  note TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (professional_profile_id, artist_profile_id)
);

CREATE INDEX idx_professional_artist_lists_owner ON public.professional_artist_lists(professional_profile_id);
CREATE INDEX idx_professional_artist_list_items_list ON public.professional_artist_list_items(list_id);
CREATE INDEX idx_professional_artist_notes_owner ON public.professional_artist_notes(professional_profile_id);

ALTER TABLE public.professional_artist_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_artist_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_artist_notes ENABLE ROW LEVEL SECURITY;

-- Seul le professionnel propriétaire lit et modifie ses listes, leurs artistes et ses notes
CREATE POLICY "Professionals manage their own artist lists"
ON public.professional_artist_lists
FOR ALL
USING (EXISTS (
  SELECT 1 FROM professional_profiles
  WHERE professional_profiles.id = professional_artist_lists.professional_profile_id
  AND professional_profiles.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM professional_profiles
  WHERE professional_profiles.id = professional_artist_lists.professional_profile_id
  AND professional_profiles.user_id = auth.uid()
));

CREATE POLICY "Professionals manage the artists of their own lists"
ON public.professional_artist_list_items
FOR ALL
USING (EXISTS (
  SELECT 1 FROM professional_artist_lists l
  JOIN professional_profiles p ON p.id = l.professional_profile_id
  WHERE l.id = professional_artist_list_items.list_id
  AND p.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM professional_artist_lists l
  JOIN professional_profiles p ON p.id = l.professional_profile_id
  WHERE l.id = professional_artist_list_items.list_id
  AND p.user_id = auth.uid()
));

CREATE POLICY "Professionals manage their own artist notes"
ON public.professional_artist_notes
FOR ALL
USING (EXISTS (
  SELECT 1 FROM professional_profiles
  WHERE professional_profiles.id = professional_artist_notes.professional_profile_id
  AND professional_profiles.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM professional_profiles
  WHERE professional_profiles.id = professional_artist_notes.professional_profile_id
  AND professional_profiles.user_id = auth.uid()
));

CREATE TRIGGER update_professional_artist_lists_updated_at
BEFORE UPDATE ON public.professional_artist_lists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_professional_artist_notes_updated_at
BEFORE UPDATE ON public.professional_artist_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
