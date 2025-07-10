
-- Créer la table des castings
CREATE TABLE public.castings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_profile_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  production_type TEXT NOT NULL, -- 'opera', 'operetta', 'concert', 'competition', 'masterclass', 'other'
  venue TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  application_deadline DATE,
  audition_date DATE,
  audition_location TEXT,
  compensation_type TEXT, -- 'paid', 'unpaid', 'travel_covered', 'accommodation_covered'
  compensation_amount INTEGER, -- montant en euros si applicable
  required_experience_level TEXT[], -- 'beginner', 'intermediate', 'advanced', 'professional'
  required_voice_types TEXT[], -- types de voix requis
  required_languages TEXT[], -- langues requises
  age_range_min INTEGER,
  age_range_max INTEGER,
  specific_requirements TEXT, -- exigences spécifiques
  repertoire_requirements TEXT[], -- œuvres ou types d'œuvres requis
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table des candidatures
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  casting_id UUID NOT NULL REFERENCES castings(id) ON DELETE CASCADE,
  artist_profile_id UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
  cover_letter TEXT,
  motivation TEXT,
  availability_notes TEXT,
  additional_documents TEXT[], -- URLs vers des documents supplémentaires
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn'
  professional_notes TEXT, -- notes privées du professionnel
  audition_scheduled_at TIMESTAMP WITH TIME ZONE,
  audition_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(casting_id, artist_profile_id) -- un artiste ne peut postuler qu'une fois par casting
);

-- Créer la table des rôles recherchés pour un casting
CREATE TABLE public.casting_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  casting_id UUID NOT NULL REFERENCES castings(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  voice_type TEXT,
  description TEXT,
  is_lead_role BOOLEAN DEFAULT FALSE,
  quantity_needed INTEGER DEFAULT 1, -- nombre de personnes recherchées pour ce rôle
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table des favoris (castings sauvegardés par les artistes)
CREATE TABLE public.casting_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  casting_id UUID NOT NULL REFERENCES castings(id) ON DELETE CASCADE,
  artist_profile_id UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(casting_id, artist_profile_id)
);

-- Activer Row Level Security
ALTER TABLE public.castings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casting_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casting_favorites ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour castings
CREATE POLICY "Anyone can view active castings"
  ON public.castings
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Professionals can create castings"
  ON public.castings
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM professional_profiles 
    WHERE professional_profiles.id = castings.professional_profile_id 
    AND professional_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Professionals can update their own castings"
  ON public.castings
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM professional_profiles 
    WHERE professional_profiles.id = castings.professional_profile_id 
    AND professional_profiles.user_id = auth.uid()
  ));

-- Politiques RLS pour applications
CREATE POLICY "Artists can view their own applications"
  ON public.applications
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM artist_profiles 
    WHERE artist_profiles.id = applications.artist_profile_id 
    AND artist_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Professionals can view applications to their castings"
  ON public.applications
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM castings 
    JOIN professional_profiles ON professional_profiles.id = castings.professional_profile_id
    WHERE castings.id = applications.casting_id 
    AND professional_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Artists can create applications"
  ON public.applications
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM artist_profiles 
    WHERE artist_profiles.id = applications.artist_profile_id 
    AND artist_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Artists can update their own applications"
  ON public.applications
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM artist_profiles 
    WHERE artist_profiles.id = applications.artist_profile_id 
    AND artist_profiles.user_id = auth.uid()
  ) AND status = 'pending'); -- seules les candidatures en attente peuvent être modifiées par l'artiste

CREATE POLICY "Professionals can update applications to their castings"
  ON public.applications
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM castings 
    JOIN professional_profiles ON professional_profiles.id = castings.professional_profile_id
    WHERE castings.id = applications.casting_id 
    AND professional_profiles.user_id = auth.uid()
  ));

-- Politiques RLS pour casting_roles
CREATE POLICY "Anyone can view casting roles for active castings"
  ON public.casting_roles
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM castings 
    WHERE castings.id = casting_roles.casting_id 
    AND castings.is_active = true
  ));

CREATE POLICY "Professionals can manage roles for their castings"
  ON public.casting_roles
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM castings 
    JOIN professional_profiles ON professional_profiles.id = castings.professional_profile_id
    WHERE castings.id = casting_roles.casting_id 
    AND professional_profiles.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM castings 
    JOIN professional_profiles ON professional_profiles.id = castings.professional_profile_id
    WHERE castings.id = casting_roles.casting_id 
    AND professional_profiles.user_id = auth.uid()
  ));

-- Politiques RLS pour casting_favorites
CREATE POLICY "Artists can manage their own favorites"
  ON public.casting_favorites
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM artist_profiles 
    WHERE artist_profiles.id = casting_favorites.artist_profile_id 
    AND artist_profiles.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM artist_profiles 
    WHERE artist_profiles.id = casting_favorites.artist_profile_id 
    AND artist_profiles.user_id = auth.uid()
  ));

-- Fonction pour incrémenter le compteur de vues
CREATE OR REPLACE FUNCTION public.increment_casting_views(casting_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.castings 
  SET view_count = view_count + 1 
  WHERE id = casting_id;
$$;

-- Index pour optimiser les requêtes
CREATE INDEX idx_castings_location ON public.castings(location);
CREATE INDEX idx_castings_dates ON public.castings(start_date, end_date);
CREATE INDEX idx_castings_deadline ON public.castings(application_deadline);
CREATE INDEX idx_castings_active ON public.castings(is_active, created_at DESC);
CREATE INDEX idx_applications_status ON public.applications(status, created_at DESC);
CREATE INDEX idx_applications_casting ON public.applications(casting_id, status);
