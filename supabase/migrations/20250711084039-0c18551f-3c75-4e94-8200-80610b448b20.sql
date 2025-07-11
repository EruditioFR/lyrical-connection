-- Créer le type enum professional_role s'il n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'professional_role') THEN
        CREATE TYPE professional_role AS ENUM (
            'casting_director',
            'vocal_coach', 
            'conductor',
            'opera_house_manager',
            'voice_teacher',
            'artistic_agent',
            'producer',
            'competition_director'
        );
    END IF;
END $$;