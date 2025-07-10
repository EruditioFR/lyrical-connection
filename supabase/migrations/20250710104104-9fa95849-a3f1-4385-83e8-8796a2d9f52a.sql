
-- Ajouter un type enum pour les types d'utilisateurs
CREATE TYPE public.user_type AS ENUM ('artist', 'professional');

-- Ajouter un type enum pour les métiers professionnels
CREATE TYPE public.professional_role AS ENUM (
  'casting_director',
  'vocal_coach', 
  'conductor',
  'opera_house_manager',
  'voice_teacher',
  'artistic_agent',
  'producer',
  'competition_director'
);

-- Ajouter une colonne user_type à la table auth.users via les métadonnées
-- (nous utiliserons raw_user_meta_data pour stocker le type d'utilisateur)

-- Créer la table des profils professionnels
CREATE TABLE public.professional_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_role professional_role NOT NULL,
  company_name TEXT,
  bio TEXT,
  logo_url TEXT,
  website TEXT,
  location TEXT,
  intervention_radius INTEGER DEFAULT 50, -- rayon en km
  team_description TEXT,
  contact_email TEXT,
  phone TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Créer la table des disponibilités des professionnels
CREATE TABLE public.professional_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_profile_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=dimanche, 6=samedi
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table des types de profils recherchés par les professionnels
CREATE TABLE public.professional_target_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_profile_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL, -- 'singers', 'instrumentalists', 'other'
  voice_types TEXT[], -- tableau des types de voix recherchés
  experience_levels TEXT[], -- tableau des niveaux d'expérience recherchés
  age_range_min INTEGER,
  age_range_max INTEGER,
  languages TEXT[], -- langues requises
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer Row Level Security
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_target_profiles ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour professional_profiles
CREATE POLICY "Anyone can view active professional profiles"
  ON public.professional_profiles
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can create their own professional profile"
  ON public.professional_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own professional profile"
  ON public.professional_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Politiques RLS pour professional_availability
CREATE POLICY "Anyone can view availability of active professionals"
  ON public.professional_availability
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM professional_profiles 
    WHERE professional_profiles.id = professional_availability.professional_profile_id 
    AND professional_profiles.is_active = true
  ));

CREATE POLICY "Professionals can manage their own availability"
  ON public.professional_availability
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM professional_profiles 
    WHERE professional_profiles.id = professional_availability.professional_profile_id 
    AND professional_profiles.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM professional_profiles 
    WHERE professional_profiles.id = professional_availability.professional_profile_id 
    AND professional_profiles.user_id = auth.uid()
  ));

-- Politiques RLS pour professional_target_profiles
CREATE POLICY "Anyone can view target profiles of active professionals"
  ON public.professional_target_profiles
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM professional_profiles 
    WHERE professional_profiles.id = professional_target_profiles.professional_profile_id 
    AND professional_profiles.is_active = true
  ));

CREATE POLICY "Professionals can manage their own target profiles"
  ON public.professional_target_profiles
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM professional_profiles 
    WHERE professional_profiles.id = professional_target_profiles.professional_profile_id 
    AND professional_profiles.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM professional_profiles 
    WHERE professional_profiles.id = professional_target_profiles.professional_profile_id 
    AND professional_profiles.user_id = auth.uid()
  ));

-- Fonction pour créer automatiquement un profil professionnel lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_professional_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Vérifier si l'utilisateur s'est inscrit comme professionnel
  IF NEW.raw_user_meta_data ->> 'user_type' = 'professional' THEN
    INSERT INTO public.professional_profiles (
      user_id, 
      professional_role, 
      company_name,
      contact_email
    )
    VALUES (
      NEW.id,
      COALESCE(
        (NEW.raw_user_meta_data ->> 'professional_role')::professional_role,
        'vocal_coach'::professional_role
      ),
      COALESCE(NEW.raw_user_meta_data ->> 'company_name', 'Ma Société'),
      NEW.email
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Créer le trigger pour les nouveaux utilisateurs professionnels
CREATE TRIGGER on_auth_professional_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_professional_user();
