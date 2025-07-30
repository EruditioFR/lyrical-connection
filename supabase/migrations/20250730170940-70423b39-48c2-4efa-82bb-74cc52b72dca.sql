-- Corriger les fonctions avec search_path pour la sécurité
DROP FUNCTION IF EXISTS public.generate_blog_slug();
DROP FUNCTION IF EXISTS public.calculate_reading_time();
DROP FUNCTION IF EXISTS public.set_published_at();

-- Recréer les fonctions avec search_path sécurisé
CREATE OR REPLACE FUNCTION public.generate_blog_slug()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := trim(both '-' from NEW.slug);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.calculate_reading_time()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Estimation : 200 mots par minute
  NEW.reading_time := CEIL(array_length(string_to_array(NEW.content, ' '), 1) / 200.0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.set_published_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
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