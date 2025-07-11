
-- Supprimer le profil professionnel créé par erreur pour jbbejot+abaldo@gmail.com
DELETE FROM public.professional_profiles 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'jbbejot+abaldo@gmail.com'
);

-- Mettre à jour les métadonnées utilisateur pour marquer comme artiste
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"user_type": "artist"}'::jsonb
WHERE email = 'jbbejot+abaldo@gmail.com';

-- Créer ou mettre à jour le profil artiste pour cet utilisateur
INSERT INTO public.artist_profiles (
  user_id, 
  stage_name, 
  contact_email,
  bio,
  voice_type,
  experience_years,
  location,
  nationality,
  spoken_languages
)
SELECT 
  u.id,
  'Alexandre Baldo',
  u.email,
  'Artiste lyrique passionné',
  'Baryton',
  10,
  'France',
  'Française',
  ARRAY['Français', 'Italien', 'Allemand']
FROM auth.users u
WHERE u.email = 'jbbejot+abaldo@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
  stage_name = EXCLUDED.stage_name,
  contact_email = EXCLUDED.contact_email,
  bio = EXCLUDED.bio,
  voice_type = EXCLUDED.voice_type,
  experience_years = EXCLUDED.experience_years,
  location = EXCLUDED.location,
  nationality = EXCLUDED.nationality,
  spoken_languages = EXCLUDED.spoken_languages,
  updated_at = now();
