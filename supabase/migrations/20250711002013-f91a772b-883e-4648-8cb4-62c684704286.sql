-- Fix the create_notification_preferences function to be SECURITY DEFINER with error handling
CREATE OR REPLACE FUNCTION public.create_notification_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.notification_preferences (user_id)
    VALUES (NEW.id);
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log l'erreur et continuer l'inscription
        RAISE LOG 'Erreur lors de la création des préférences de notification pour user_id %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Fix the handle_new_artist_user function to have better error handling
CREATE OR REPLACE FUNCTION public.handle_new_artist_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only create artist profile if user_type is not 'professional'
  IF COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'artist') = 'artist' THEN
    INSERT INTO public.artist_profiles (user_id, stage_name, contact_email)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data ->> 'stage_name', 'Nouvel Artiste'),
      NEW.email
    );
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur et continuer l'inscription
    RAISE LOG 'Erreur lors de la création du profil artiste pour user_id %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;