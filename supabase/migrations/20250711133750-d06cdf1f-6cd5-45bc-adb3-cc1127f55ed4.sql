
-- Ajouter les colonnes d'adresse et de géolocalisation à la table professional_events
ALTER TABLE public.professional_events 
ADD COLUMN address TEXT,
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION;
