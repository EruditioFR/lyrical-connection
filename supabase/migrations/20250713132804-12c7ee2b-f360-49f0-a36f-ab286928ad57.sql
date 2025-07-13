
-- Ajouter les colonnes de règlement à la table professional_events
ALTER TABLE public.professional_events 
ADD COLUMN participation_rules TEXT,
ADD COLUMN code_of_conduct TEXT,
ADD COLUMN cancellation_policy TEXT,
ADD COLUMN liability_waiver TEXT;
