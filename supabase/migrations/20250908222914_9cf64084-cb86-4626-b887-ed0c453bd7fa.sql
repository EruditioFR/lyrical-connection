-- Add unique constraints to enable upsert operations

-- Composers: unique on name
ALTER TABLE public.composers 
ADD CONSTRAINT composers_name_unique UNIQUE (name);

-- Lyrical works: unique on title + composer combination
ALTER TABLE public.lyrical_works 
ADD CONSTRAINT lyrical_works_title_composer_unique UNIQUE (title, composer);

-- Work roles: unique on work_id + role_name combination
ALTER TABLE public.work_roles 
ADD CONSTRAINT work_roles_work_role_unique UNIQUE (work_id, role_name);

-- Arias: unique on work_id + title combination
ALTER TABLE public.arias 
ADD CONSTRAINT arias_work_title_unique UNIQUE (work_id, title);