-- Ajouter les nouveaux champs au profil artiste
ALTER TABLE public.artist_profiles 
ADD COLUMN nationality text,
ADD COLUMN birth_date date,
ADD COLUMN gender text CHECK (gender IN ('H', 'F', 'autre')),
ADD COLUMN spoken_languages text[],
ADD COLUMN project_description text;