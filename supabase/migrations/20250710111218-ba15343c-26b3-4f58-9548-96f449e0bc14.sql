
-- Table pour sauvegarder les recherches des professionnels
CREATE TABLE public.saved_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_profile_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  search_criteria JSONB NOT NULL, -- critères de recherche sauvegardés
  is_alert_enabled BOOLEAN DEFAULT FALSE, -- alertes pour nouveaux profils correspondants
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les invitations à postuler
CREATE TABLE public.casting_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  casting_id UUID NOT NULL REFERENCES castings(id) ON DELETE CASCADE,
  artist_profile_id UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
  professional_profile_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'viewed', 'accepted', 'declined'
  viewed_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(casting_id, artist_profile_id) -- une seule invitation par artiste par casting
);

-- Table pour les contacts directs entre professionnels et artistes
CREATE TABLE public.professional_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_profile_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  artist_profile_id UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'viewed', 'replied'
  viewed_at TIMESTAMP WITH TIME ZONE,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer Row Level Security
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casting_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_contacts ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour saved_searches
CREATE POLICY "Professionals can manage their own saved searches"
  ON public.saved_searches
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM professional_profiles 
    WHERE professional_profiles.id = saved_searches.professional_profile_id 
    AND professional_profiles.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM professional_profiles 
    WHERE professional_profiles.id = saved_searches.professional_profile_id 
    AND professional_profiles.user_id = auth.uid()
  ));

-- Politiques RLS pour casting_invitations
CREATE POLICY "Professionals can view invitations they sent"
  ON public.casting_invitations
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM professional_profiles 
    WHERE professional_profiles.id = casting_invitations.professional_profile_id 
    AND professional_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Artists can view invitations they received"
  ON public.casting_invitations
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM artist_profiles 
    WHERE artist_profiles.id = casting_invitations.artist_profile_id 
    AND artist_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Professionals can create invitations"
  ON public.casting_invitations
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM professional_profiles 
    WHERE professional_profiles.id = casting_invitations.professional_profile_id 
    AND professional_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Artists can update invitation status"
  ON public.casting_invitations
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM artist_profiles 
    WHERE artist_profiles.id = casting_invitations.artist_profile_id 
    AND artist_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Professionals can update their invitations"
  ON public.casting_invitations
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM professional_profiles 
    WHERE professional_profiles.id = casting_invitations.professional_profile_id 
    AND professional_profiles.user_id = auth.uid()
  ));

-- Politiques RLS pour professional_contacts
CREATE POLICY "Professionals can view contacts they sent"
  ON public.professional_contacts
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM professional_profiles 
    WHERE professional_profiles.id = professional_contacts.professional_profile_id 
    AND professional_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Artists can view contacts they received"
  ON public.professional_contacts
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM artist_profiles 
    WHERE artist_profiles.id = professional_contacts.artist_profile_id 
    AND artist_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Professionals can create contacts"
  ON public.professional_contacts
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM professional_profiles 
    WHERE professional_profiles.id = professional_contacts.professional_profile_id 
    AND professional_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Artists can update contact status"
  ON public.professional_contacts
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM artist_profiles 
    WHERE artist_profiles.id = professional_contacts.artist_profile_id 
    AND artist_profiles.user_id = auth.uid()
  ));

-- Index pour optimiser les requêtes
CREATE INDEX idx_saved_searches_professional ON public.saved_searches(professional_profile_id);
CREATE INDEX idx_casting_invitations_casting ON public.casting_invitations(casting_id);
CREATE INDEX idx_casting_invitations_artist ON public.casting_invitations(artist_profile_id);
CREATE INDEX idx_casting_invitations_status ON public.casting_invitations(status, created_at DESC);
CREATE INDEX idx_professional_contacts_professional ON public.professional_contacts(professional_profile_id);
CREATE INDEX idx_professional_contacts_artist ON public.professional_contacts(artist_profile_id);
CREATE INDEX idx_professional_contacts_status ON public.professional_contacts(status, created_at DESC);
