-- Fix remaining function search path issues
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.user_can_access_conversation(conversation_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.conversation_participants 
    WHERE conversation_participants.conversation_id = $1 
      AND conversation_participants.user_id = $2 
      AND conversation_participants.left_at IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.increment_casting_views(casting_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  UPDATE public.castings 
  SET view_count = view_count + 1 
  WHERE id = casting_id;
$$;

CREATE OR REPLACE FUNCTION public.generate_blog_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := trim(both '-' from NEW.slug);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_reading_time()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Estimation : 200 mots par minute
  NEW.reading_time := CEIL(array_length(string_to_array(NEW.content, ' '), 1) / 200.0);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_published_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Si le statut passe à publié et published_at n'est pas défini
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status = 'draft') AND NEW.published_at IS NULL THEN
    NEW.published_at := now();
  END IF;
  -- Si le statut repasse en brouillon, on supprime la date de publication
  IF NEW.status = 'draft' AND OLD.status = 'published' THEN
    NEW.published_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;