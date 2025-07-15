-- Créer une fonction pour créer des notifications avec des privilèges élevés
CREATE OR REPLACE FUNCTION public.create_results_notifications(
  p_entity_id uuid,
  p_entity_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  app_record RECORD;
  entity_name text;
  status_text text;
  notification_type text;
  now_timestamp timestamp with time zone := now();
BEGIN
  -- Déterminer le type d'entité et récupérer le nom
  IF p_entity_type = 'casting' THEN
    SELECT title INTO entity_name FROM castings WHERE id = p_entity_id;
    notification_type := 'casting_application';
    
    -- Récupérer toutes les candidatures avec les user_id
    FOR app_record IN 
      SELECT 
        a.*,
        ap.user_id
      FROM applications a
      JOIN artist_profiles ap ON ap.id = a.artist_profile_id
      WHERE a.casting_id = p_entity_id
    LOOP
      -- Déterminer le texte du statut
      CASE app_record.status
        WHEN 'accepted' THEN status_text := 'accepté(e)';
        WHEN 'rejected' THEN status_text := 'refusé(e)';
        WHEN 'waitlisted' THEN status_text := 'mis(e) en liste d''attente';
        WHEN 'shortlisted' THEN status_text := 'présélectionné(e)';
        ELSE status_text := 'en attente';
      END CASE;
      
      -- Insérer la notification
      INSERT INTO notifications (
        user_id,
        type,
        title,
        content,
        data,
        is_read,
        created_at
      ) VALUES (
        app_record.user_id,
        notification_type::notification_type,
        'Résultats publiés pour ' || COALESCE(entity_name, 'Casting'),
        '[' || to_char(now_timestamp, 'DD/MM/YYYY') || ' à ' || to_char(now_timestamp, 'HH24:MI') || '] Vous avez été ' || status_text || ' pour ' || COALESCE(entity_name, 'Casting') || '.',
        json_build_object(
          'status', app_record.status,
          'casting_id', p_entity_id,
          'entity_name', COALESCE(entity_name, 'Casting'),
          'entity_type', 'casting'
        ),
        false,
        now_timestamp
      );
    END LOOP;
    
  ELSIF p_entity_type = 'event' THEN
    SELECT title INTO entity_name FROM professional_events WHERE id = p_entity_id;
    notification_type := 'event_registration';
    
    -- Récupérer toutes les inscriptions avec les user_id
    FOR app_record IN 
      SELECT 
        ea.*,
        ap.user_id
      FROM event_applications ea
      JOIN artist_profiles ap ON ap.id = ea.artist_profile_id
      WHERE ea.event_id = p_entity_id
    LOOP
      -- Déterminer le texte du statut
      CASE app_record.status
        WHEN 'accepted' THEN status_text := 'accepté(e)';
        WHEN 'rejected' THEN status_text := 'refusé(e)';
        WHEN 'waitlisted' THEN status_text := 'mis(e) en liste d''attente';
        WHEN 'shortlisted' THEN status_text := 'présélectionné(e)';
        ELSE status_text := 'en attente';
      END CASE;
      
      -- Insérer la notification
      INSERT INTO notifications (
        user_id,
        type,
        title,
        content,
        data,
        is_read,
        created_at
      ) VALUES (
        app_record.user_id,
        notification_type::notification_type,
        'Résultats publiés pour ' || COALESCE(entity_name, 'Événement'),
        '[' || to_char(now_timestamp, 'DD/MM/YYYY') || ' à ' || to_char(now_timestamp, 'HH24:MI') || '] Vous avez été ' || status_text || ' pour ' || COALESCE(entity_name, 'Événement') || '.',
        json_build_object(
          'status', app_record.status,
          'event_id', p_entity_id,
          'entity_name', COALESCE(entity_name, 'Événement'),
          'entity_type', 'event'
        ),
        false,
        now_timestamp
      );
    END LOOP;
  END IF;
END;
$$;