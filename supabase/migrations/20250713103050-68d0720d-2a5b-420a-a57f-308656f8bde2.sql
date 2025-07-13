
-- Vérifier et créer la clé étrangère manquante entre professional_events et professional_profiles
ALTER TABLE public.professional_events 
ADD CONSTRAINT fk_professional_events_professional_profile_id 
FOREIGN KEY (professional_profile_id) 
REFERENCES public.professional_profiles(id) 
ON DELETE CASCADE;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_professional_events_professional_profile_id 
ON public.professional_events(professional_profile_id);
