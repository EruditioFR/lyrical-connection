-- Create temporary users in auth.users first
-- Note: In a real scenario, these would be created through Supabase Auth
-- For demo purposes, we'll create test entries

-- First, let's create test professional profiles without specific user_ids
-- We'll use gen_random_uuid() to generate random UUIDs for user_id
INSERT INTO public.professional_profiles (
  user_id, 
  professional_role, 
  company_name, 
  bio, 
  location, 
  contact_email, 
  is_active,
  is_verified
) VALUES 
(
  gen_random_uuid(),
  'casting_director'::professional_role,
  'Opéra National de Paris',
  'Directrice de casting avec 15 ans d''expérience dans le milieu lyrique.',
  'Paris, France',
  'marie.dupont@opera-paris.fr',
  true,
  true
),
(
  gen_random_uuid(),
  'conductor'::professional_role,
  'Orchestre Symphonique de Lyon',
  'Chef d''orchestre spécialisé dans l''opéra et la musique classique.',
  'Lyon, France',
  'pierre.martin@orchestrelyon.fr',
  true,
  true
),
(
  gen_random_uuid(),
  'opera_house_manager'::professional_role,
  'Théâtre des Champs-Élysées',
  'Directeur artistique avec une passion pour découvrir de nouveaux talents.',
  'Paris, France',
  'jean.bernard@champs-elysees.fr',
  true,
  false
);

-- Insert test castings
INSERT INTO public.castings (
  professional_profile_id,
  title,
  description,
  production_type,
  location,
  venue,
  start_date,
  end_date,
  application_deadline,
  audition_date,
  audition_location,
  compensation_type,
  compensation_amount,
  age_range_min,
  age_range_max,
  required_voice_types,
  required_experience_level,
  required_languages,
  specific_requirements,
  repertoire_requirements,
  is_active,
  is_featured
) VALUES 
(
  (SELECT id FROM public.professional_profiles WHERE contact_email = 'marie.dupont@opera-paris.fr'),
  'La Traviata - Violetta Valéry',
  'Nous recherchons une soprano colorature pour interpréter le rôle de Violetta dans notre nouvelle production de La Traviata de Verdi. Production prestigieuse avec orchestre complet.',
  'opera',
  'Paris, France',
  'Opéra Bastille',
  '2024-09-15',
  '2024-10-30',
  '2024-07-20',
  '2024-07-25',
  'Opéra Bastille - Studio A',
  'paid',
  8500,
  25,
  40,
  ARRAY['Soprano colorature', 'Soprano lyrique'],
  ARRAY['advanced', 'professional'],
  ARRAY['Italien', 'Français'],
  'Capacité à tenir des notes aiguës jusqu''au Fa suraigu. Expérience scénique requise.',
  ARRAY['Verdi - La Traviata', 'Répertoire italien du XIXe siècle'],
  true,
  true
),
(
  (SELECT id FROM public.professional_profiles WHERE contact_email = 'pierre.martin@orchestrelyon.fr'),
  'Concert Mozart - Solistes requis',
  'Concert exceptionnel dédié à Mozart. Nous recherchons des solistes pour les airs les plus célèbres du compositeur.',
  'concert',
  'Lyon, France',
  'Auditorium Maurice Ravel',
  '2024-08-10',
  '2024-08-12',
  '2024-07-15',
  '2024-07-18',
  'Conservatoire de Lyon',
  'paid',
  2500,
  20,
  50,
  ARRAY['Soprano lyrique', 'Ténor lyrique', 'Baryton'],
  ARRAY['intermediate', 'advanced', 'professional'],
  ARRAY['Allemand', 'Italien', 'Français'],
  'Maîtrise du style mozartien indispensable.',
  ARRAY['Mozart - Don Giovanni', 'Mozart - Le Nozze di Figaro', 'Mozart - Così fan tutte'],
  true,
  false
),
(
  (SELECT id FROM public.professional_profiles WHERE contact_email = 'jean.bernard@champs-elysees.fr'),
  'Récital Jeunes Talents',
  'Soirée dédiée aux jeunes artistes lyriques. Opportunité unique de se produire dans une salle prestigieuse.',
  'concert',
  'Paris, France',
  'Théâtre des Champs-Élysées',
  '2024-09-05',
  '2024-09-05',
  '2024-07-30',
  '2024-08-05',
  'Théâtre des Champs-Élysées',
  'travel_covered',
  NULL,
  18,
  35,
  ARRAY['Soprano lyrique', 'Mezzo-soprano', 'Ténor lyrique', 'Baryton'],
  ARRAY['beginner', 'intermediate'],
  ARRAY['Français', 'Italien'],
  'Ouvert aux étudiants et jeunes professionnels. Portfolio et recommandations requis.',
  ARRAY['Mélodie française', 'Airs d''opéra classiques'],
  true,
  false
),
(
  (SELECT id FROM public.professional_profiles WHERE contact_email = 'marie.dupont@opera-paris.fr'),
  'Carmen - Chœur et petits rôles',
  'Recrutement pour le chœur et les petits rôles de notre production de Carmen de Bizet.',
  'opera',
  'Paris, France',
  'Opéra Comique',
  '2024-11-01',
  '2024-12-20',
  '2024-08-15',
  '2024-08-20',
  'Opéra Comique - Salle Favart',
  'paid',
  1200,
  18,
  65,
  ARRAY['Soprano lyrique', 'Soprano dramatique', 'Mezzo-soprano', 'Alto', 'Ténor lyrique', 'Baryton', 'Basse'],
  ARRAY['beginner', 'intermediate', 'advanced'],
  ARRAY['Français', 'Espagnol'],
  'Recherche de profils variés pour le chœur. Quelques petits rôles solistes disponibles.',
  ARRAY['Bizet - Carmen', 'Répertoire français'],
  true,
  false
);

-- Update view counts for some castings to make them look more realistic
UPDATE public.castings 
SET view_count = FLOOR(RANDOM() * 50 + 10)::integer
WHERE is_active = true;