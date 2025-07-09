
-- Ajouter les nouveaux champs à la table artist_repertoire
ALTER TABLE public.artist_repertoire 
ADD COLUMN performance_year INTEGER,
ADD COLUMN venue TEXT;

-- Créer une table pour les lieux (opéras et festivals)
CREATE TABLE public.venues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  country TEXT,
  type TEXT CHECK (type IN ('opera', 'festival', 'theater', 'concert_hall')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur la table venues
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à tous de voir les lieux
CREATE POLICY "Anyone can view venues" 
  ON public.venues 
  FOR SELECT 
  USING (true);

-- Politique pour permettre aux utilisateurs authentifiés d'ajouter des lieux
CREATE POLICY "Authenticated users can create venues" 
  ON public.venues 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Insérer quelques lieux célèbres pour commencer
INSERT INTO public.venues (name, city, country, type) VALUES
('Opéra de Paris - Palais Garnier', 'Paris', 'France', 'opera'),
('Opéra Bastille', 'Paris', 'France', 'opera'),
('La Scala', 'Milan', 'Italie', 'opera'),
('Metropolitan Opera', 'New York', 'États-Unis', 'opera'),
('Royal Opera House', 'Londres', 'Royaume-Uni', 'opera'),
('Wiener Staatsoper', 'Vienne', 'Autriche', 'opera'),
('Festival d''Aix-en-Provence', 'Aix-en-Provence', 'France', 'festival'),
('Festival de Salzburg', 'Salzburg', 'Autriche', 'festival'),
('Festival de Bayreuth', 'Bayreuth', 'Allemagne', 'festival'),
('Arena di Verona', 'Vérone', 'Italie', 'festival'),
('Glyndebourne Festival', 'Lewes', 'Royaume-Uni', 'festival'),
('Opéra de Lyon', 'Lyon', 'France', 'opera'),
('Opéra de Marseille', 'Marseille', 'France', 'opera'),
('Opéra de Montpellier', 'Montpellier', 'France', 'opera'),
('Opéra de Bordeaux', 'Bordeaux', 'France', 'opera');
