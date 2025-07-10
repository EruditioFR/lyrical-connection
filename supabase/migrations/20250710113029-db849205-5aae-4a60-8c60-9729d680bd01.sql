-- Créer les énumérations pour les types d'événements et statuts
CREATE TYPE public.event_type AS ENUM ('masterclass', 'stage', 'concours', 'atelier', 'conference');
CREATE TYPE public.event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE public.application_status AS ENUM ('pending', 'accepted', 'rejected', 'waitlisted');

-- Table des catégories d'événements
CREATE TABLE public.event_categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des événements professionnels
CREATE TABLE public.professional_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_profile_id UUID NOT NULL,
    category_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    event_type event_type NOT NULL,
    status event_status NOT NULL DEFAULT 'draft',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    location TEXT,
    venue TEXT,
    max_participants INTEGER,
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'EUR',
    requirements TEXT,
    program TEXT,
    contact_info TEXT,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    FOREIGN KEY (category_id) REFERENCES event_categories(id) ON DELETE SET NULL
);

-- Table des inscriptions aux événements
CREATE TABLE public.event_applications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL,
    artist_profile_id UUID NOT NULL,
    status application_status NOT NULL DEFAULT 'pending',
    motivation TEXT,
    experience_level TEXT,
    special_requirements TEXT,
    professional_notes TEXT,
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(event_id, artist_profile_id)
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_applications ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour event_categories
CREATE POLICY "Tout le monde peut voir les catégories"
ON public.event_categories
FOR SELECT
USING (true);

CREATE POLICY "Les utilisateurs authentifiés peuvent créer des catégories"
ON public.event_categories
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Politiques RLS pour professional_events
CREATE POLICY "Tout le monde peut voir les événements publiés"
ON public.professional_events
FOR SELECT
USING (status = 'published');

CREATE POLICY "Les professionnels peuvent créer des événements"
ON public.professional_events
FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM professional_profiles 
    WHERE id = professional_events.professional_profile_id 
    AND user_id = auth.uid()
));

CREATE POLICY "Les professionnels peuvent modifier leurs événements"
ON public.professional_events
FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM professional_profiles 
    WHERE id = professional_events.professional_profile_id 
    AND user_id = auth.uid()
));

CREATE POLICY "Les professionnels peuvent voir tous leurs événements"
ON public.professional_events
FOR SELECT
USING (EXISTS (
    SELECT 1 FROM professional_profiles 
    WHERE id = professional_events.professional_profile_id 
    AND user_id = auth.uid()
));

-- Politiques RLS pour event_applications
CREATE POLICY "Les artistes peuvent voir leurs propres inscriptions"
ON public.event_applications
FOR SELECT
USING (EXISTS (
    SELECT 1 FROM artist_profiles 
    WHERE id = event_applications.artist_profile_id 
    AND user_id = auth.uid()
));

CREATE POLICY "Les artistes peuvent s'inscrire aux événements"
ON public.event_applications
FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM artist_profiles 
    WHERE id = event_applications.artist_profile_id 
    AND user_id = auth.uid()
));

CREATE POLICY "Les artistes peuvent modifier leurs inscriptions"
ON public.event_applications
FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM artist_profiles 
    WHERE id = event_applications.artist_profile_id 
    AND user_id = auth.uid()
) AND status = 'pending');

CREATE POLICY "Les professionnels peuvent voir les inscriptions à leurs événements"
ON public.event_applications
FOR SELECT
USING (EXISTS (
    SELECT 1 FROM professional_events pe
    JOIN professional_profiles pp ON pp.id = pe.professional_profile_id
    WHERE pe.id = event_applications.event_id 
    AND pp.user_id = auth.uid()
));

CREATE POLICY "Les professionnels peuvent modifier les inscriptions à leurs événements"
ON public.event_applications
FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM professional_events pe
    JOIN professional_profiles pp ON pp.id = pe.professional_profile_id
    WHERE pe.id = event_applications.event_id 
    AND pp.user_id = auth.uid()
));

-- Fonction pour mettre à jour les timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour les timestamps
CREATE TRIGGER update_event_categories_updated_at
    BEFORE UPDATE ON public.event_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_professional_events_updated_at
    BEFORE UPDATE ON public.professional_events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_applications_updated_at
    BEFORE UPDATE ON public.event_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer quelques catégories par défaut
INSERT INTO public.event_categories (name, description, color) VALUES
('Technique vocale', 'Masterclass et stages sur la technique vocale', '#FF6B6B'),
('Interprétation', 'Ateliers d''interprétation et de jeu scénique', '#4ECDC4'),
('Répertoire', 'Étude approfondie du répertoire lyrique', '#45B7D1'),
('Concours', 'Concours de chant et compétitions', '#96CEB4'),
('Masterclass', 'Masterclass avec des artistes reconnus', '#FFEAA7');