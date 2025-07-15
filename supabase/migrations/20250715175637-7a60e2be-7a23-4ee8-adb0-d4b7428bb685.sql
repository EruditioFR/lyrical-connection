-- Ajouter une colonne pour indiquer si les résultats d'un événement ont été publiés
ALTER TABLE public.professional_events 
ADD COLUMN results_published boolean DEFAULT false;

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX idx_professional_events_results_published ON public.professional_events(results_published);