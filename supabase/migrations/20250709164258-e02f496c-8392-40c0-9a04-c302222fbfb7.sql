
-- Créer la table des œuvres lyriques
CREATE TABLE public.lyrical_works (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  composer TEXT NOT NULL,
  category TEXT NOT NULL, -- 'opera', 'oratorio', 'song', 'operetta', etc.
  language TEXT,
  period TEXT, -- 'baroque', 'classical', 'romantic', 'modern', 'contemporary'
  difficulty_level INTEGER DEFAULT 3, -- 1-5 scale
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table des rôles/airs spécifiques dans les œuvres
CREATE TABLE public.work_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_id UUID NOT NULL REFERENCES public.lyrical_works(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  voice_type TEXT, -- 'Soprano', 'Mezzo-soprano', 'Alto', 'Ténor', 'Baryton', 'Basse'
  aria_title TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la nouvelle table de répertoire des artistes
CREATE TABLE public.artist_repertoire (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_profile_id UUID NOT NULL REFERENCES public.artist_profiles(id) ON DELETE CASCADE,
  work_id UUID NOT NULL REFERENCES public.lyrical_works(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.work_roles(id) ON DELETE SET NULL,
  mastery_level TEXT DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced', 'expert'
  years_experience INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(artist_profile_id, work_id, role_id)
);

-- Activer RLS sur les nouvelles tables
ALTER TABLE public.lyrical_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_repertoire ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour lyrical_works (lecture publique, écriture pour utilisateurs authentifiés)
CREATE POLICY "Anyone can view lyrical works" 
  ON public.lyrical_works 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create lyrical works" 
  ON public.lyrical_works 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update lyrical works" 
  ON public.lyrical_works 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Politiques RLS pour work_roles
CREATE POLICY "Anyone can view work roles" 
  ON public.work_roles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create work roles" 
  ON public.work_roles 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update work roles" 
  ON public.work_roles 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Politiques RLS pour artist_repertoire
CREATE POLICY "Anyone can view active artist repertoire" 
  ON public.artist_repertoire 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.artist_profiles 
    WHERE id = artist_repertoire.artist_profile_id 
    AND is_active = true
  ));

CREATE POLICY "Artists can manage their own repertoire" 
  ON public.artist_repertoire 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.artist_profiles 
    WHERE id = artist_repertoire.artist_profile_id 
    AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.artist_profiles 
    WHERE id = artist_repertoire.artist_profile_id 
    AND user_id = auth.uid()
  ));

-- Insérer quelques œuvres populaires du répertoire lyrique pour commencer
INSERT INTO public.lyrical_works (title, composer, category, language, period, difficulty_level, description) VALUES
('La Traviata', 'Giuseppe Verdi', 'opera', 'italien', 'romantic', 4, 'Opéra en trois actes'),
('Le Mariage de Figaro', 'Wolfgang Amadeus Mozart', 'opera', 'italien', 'classical', 4, 'Opéra bouffe en quatre actes'),
('Carmen', 'Georges Bizet', 'opera', 'français', 'romantic', 4, 'Opéra-comique en quatre actes'),
('La Bohème', 'Giacomo Puccini', 'opera', 'italien', 'romantic', 4, 'Opéra en quatre tableaux'),
('Don Giovanni', 'Wolfgang Amadeus Mozart', 'opera', 'italien', 'classical', 5, 'Dramma giocoso en deux actes'),
('Tosca', 'Giacomo Puccini', 'opera', 'italien', 'romantic', 4, 'Drame lyrique en trois actes'),
('Le Barbier de Séville', 'Gioachino Rossini', 'opera', 'italien', 'classical', 3, 'Opéra bouffe en deux actes'),
('Faust', 'Charles Gounod', 'opera', 'français', 'romantic', 4, 'Opéra en cinq actes'),
('Madame Butterfly', 'Giacomo Puccini', 'opera', 'italien', 'romantic', 4, 'Tragédie lyrique en trois actes'),
('Les Noces de Figaro', 'Wolfgang Amadeus Mozart', 'opera', 'français', 'classical', 4, 'Comédie lyrique en quatre actes'),
('Requiem', 'Wolfgang Amadeus Mozart', 'oratorio', 'latin', 'classical', 5, 'Messe de Requiem'),
('La Création', 'Joseph Haydn', 'oratorio', 'allemand', 'classical', 4, 'Oratorio en trois parties'),
('Le Messie', 'Georg Friedrich Händel', 'oratorio', 'anglais', 'baroque', 4, 'Oratorio en trois parties'),
('Clair de Lune', 'Claude Debussy', 'song', 'français', 'modern', 3, 'Mélodie française'),
('Ave Maria', 'Franz Schubert', 'song', 'latin', 'romantic', 3, 'Lied religieux');

-- Insérer quelques rôles pour les opéras populaires
INSERT INTO public.work_roles (work_id, role_name, voice_type, aria_title) VALUES
((SELECT id FROM public.lyrical_works WHERE title = 'La Traviata'), 'Violetta', 'Soprano', 'Sempre libera'),
((SELECT id FROM public.lyrical_works WHERE title = 'La Traviata'), 'Alfredo', 'Ténor', 'De'' miei bollenti spiriti'),
((SELECT id FROM public.lyrical_works WHERE title = 'La Traviata'), 'Germont', 'Baryton', 'Di Provenza il mar'),
((SELECT id FROM public.lyrical_works WHERE title = 'Carmen'), 'Carmen', 'Mezzo-soprano', 'Habanera'),
((SELECT id FROM public.lyrical_works WHERE title = 'Carmen'), 'Don José', 'Ténor', 'La fleur que tu m''avais jetée'),
((SELECT id FROM public.lyrical_works WHERE title = 'Carmen'), 'Micaëla', 'Soprano', 'Je dis que rien ne m''épouvante'),
((SELECT id FROM public.lyrical_works WHERE title = 'La Bohème'), 'Mimì', 'Soprano', 'Sì, mi chiamano Mimì'),
((SELECT id FROM public.lyrical_works WHERE title = 'La Bohème'), 'Rodolfo', 'Ténor', 'Che gelida manina'),
((SELECT id FROM public.lyrical_works WHERE title = 'Don Giovanni'), 'Don Giovanni', 'Baryton', 'Là ci darem la mano'),
((SELECT id FROM public.lyrical_works WHERE title = 'Don Giovanni'), 'Donna Anna', 'Soprano', 'Or sai chi l''onore');
