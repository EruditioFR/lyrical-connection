
-- Mettre à jour l'adresse email de l'utilisateur Alexandre Baldo
UPDATE auth.users 
SET email = 'jbbejot+baldo@gmail.com',
    email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'jbbejot@gmail.com';

-- Mettre à jour également les profils associés si nécessaire
UPDATE public.artist_profiles 
SET contact_email = 'jbbejot+baldo@gmail.com'
WHERE contact_email = 'jbbejot@gmail.com';

UPDATE public.professional_profiles 
SET contact_email = 'jbbejot+baldo@gmail.com'
WHERE contact_email = 'jbbejot@gmail.com';
