-- Function to notify professional of new application
CREATE OR REPLACE FUNCTION notify_professional_new_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_professional_user_id uuid;
  v_casting_title text;
  v_artist_name text;
BEGIN
  -- Get the professional's user_id and casting title
  SELECT pp.user_id, c.title
  INTO v_professional_user_id, v_casting_title
  FROM castings c
  JOIN professional_profiles pp ON pp.id = c.professional_profile_id
  WHERE c.id = NEW.casting_id;
  
  -- Get the artist's stage name
  SELECT stage_name
  INTO v_artist_name
  FROM artist_profiles
  WHERE id = NEW.artist_profile_id;
  
  -- Create notification for the professional
  IF v_professional_user_id IS NOT NULL THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      content,
      data,
      is_read,
      created_at
    ) VALUES (
      v_professional_user_id,
      'casting_application',
      'Nouvelle candidature',
      v_artist_name || ' a postulé pour "' || v_casting_title || '"',
      jsonb_build_object(
        'casting_id', NEW.casting_id,
        'application_id', NEW.id,
        'artist_profile_id', NEW.artist_profile_id,
        'artist_name', v_artist_name,
        'casting_title', v_casting_title
      ),
      false,
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new applications
DROP TRIGGER IF EXISTS trigger_notify_professional_new_application ON applications;
CREATE TRIGGER trigger_notify_professional_new_application
  AFTER INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_professional_new_application();