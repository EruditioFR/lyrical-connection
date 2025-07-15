-- Créer une fonction avec des privilèges élevés pour créer des notifications
CREATE OR REPLACE FUNCTION public.create_notification_system(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_content text,
  p_data jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    content,
    data
  ) VALUES (
    p_user_id,
    p_type::notification_type,
    p_title,
    p_content,
    p_data
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION public.create_notification_system TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification_system TO service_role;