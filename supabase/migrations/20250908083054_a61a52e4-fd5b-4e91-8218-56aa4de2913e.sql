-- Create artist profile for user jbbejot+imostovoi@gmail.com
INSERT INTO public.artist_profiles (
  user_id,
  stage_name,
  bio,
  is_active,
  created_at,
  updated_at
) VALUES (
  '3ca46dcc-ee2b-4942-8424-d33e5c954927',
  'Artiste',
  'Profil artiste créé automatiquement',
  true,
  now(),
  now()
);