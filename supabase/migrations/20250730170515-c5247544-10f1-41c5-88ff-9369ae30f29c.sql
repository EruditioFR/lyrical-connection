-- Création de la table pour les articles de blog
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  tags TEXT[],
  meta_title TEXT,
  meta_description TEXT,
  reading_time INTEGER, -- en minutes
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Politique pour que tout le monde puisse voir les articles publiés
CREATE POLICY "Anyone can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (status = 'published');

-- Politique pour que les admins puissent tout gérer
CREATE POLICY "Admins can manage all blog posts" 
ON public.blog_posts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour améliorer les performances
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_featured ON public.blog_posts(is_featured);

-- Fonction pour générer automatiquement le slug
CREATE OR REPLACE FUNCTION public.generate_blog_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := trim(both '-' from NEW.slug);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer le slug automatiquement
CREATE TRIGGER generate_blog_slug_trigger
BEFORE INSERT OR UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.generate_blog_slug();

-- Fonction pour calculer le temps de lecture
CREATE OR REPLACE FUNCTION public.calculate_reading_time()
RETURNS TRIGGER AS $$
BEGIN
  -- Estimation : 200 mots par minute
  NEW.reading_time := CEIL(array_length(string_to_array(NEW.content, ' '), 1) / 200.0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour calculer le temps de lecture
CREATE TRIGGER calculate_reading_time_trigger
BEFORE INSERT OR UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.calculate_reading_time();

-- Fonction pour définir la date de publication
CREATE OR REPLACE FUNCTION public.set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le statut passe à publié et published_at n'est pas défini
  IF NEW.status = 'published' AND OLD.status = 'draft' AND NEW.published_at IS NULL THEN
    NEW.published_at := now();
  END IF;
  -- Si le statut repasse en brouillon, on supprime la date de publication
  IF NEW.status = 'draft' AND OLD.status = 'published' THEN
    NEW.published_at := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour gérer la date de publication
CREATE TRIGGER set_published_at_trigger
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.set_published_at();