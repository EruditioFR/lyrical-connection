
-- Mettre à jour les métadonnées utilisateur pour marquer ces comptes comme professionnels
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"user_type": "professional", "professional_role": "vocal_coach"}'::jsonb
WHERE email IN ('jbbejot+y@gmail.com', 'jbbejot+z@gmail.com');

-- Supprimer les profils artistes existants pour ces utilisateurs s'ils existent
DELETE FROM public.artist_profiles 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('jbbejot+y@gmail.com', 'jbbejot+z@gmail.com')
);

-- Créer les profils professionnels pour ces utilisateurs
INSERT INTO public.professional_profiles (
  user_id, 
  professional_role, 
  company_name,
  contact_email
)
SELECT 
  u.id,
  'vocal_coach'::professional_role,
  'Ma Société',
  u.email
FROM auth.users u
WHERE u.email IN ('jbbejot+y@gmail.com', 'jbbejot+z@gmail.com')
AND NOT EXISTS (
  SELECT 1 FROM public.professional_profiles p 
  WHERE p.user_id = u.id
);
