
-- Ajouter une colonne venue_id dans la table professional_events pour référencer la table venues
ALTER TABLE public.professional_events 
ADD COLUMN venue_id UUID REFERENCES public.venues(id);

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX idx_professional_events_venue_id ON public.professional_events(venue_id);

-- Mettre à jour la politique RLS pour permettre aux professionnels de voir les lieux de leurs événements
CREATE POLICY "Professionals can view venues of their events" 
  ON public.venues 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.professional_events pe 
    JOIN public.professional_profiles pp ON pp.id = pe.professional_profile_id 
    WHERE pe.venue_id = venues.id AND pp.user_id = auth.uid()
  ));
