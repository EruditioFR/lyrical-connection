-- Extend lyrical_works table with additional opera metadata
ALTER TABLE public.lyrical_works 
ADD COLUMN IF NOT EXISTS total_duration_minutes integer,
ADD COLUMN IF NOT EXISTS synopsis text,
ADD COLUMN IF NOT EXISTS premiere_date date,
ADD COLUMN IF NOT EXISTS premiere_venue text,
ADD COLUMN IF NOT EXISTS acts_count integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS librettist text,
ADD COLUMN IF NOT EXISTS historical_context text,
ADD COLUMN IF NOT EXISTS performance_notes text;

-- Extend work_roles table with vocal range and difficulty
ALTER TABLE public.work_roles 
ADD COLUMN IF NOT EXISTS tessitura_min text,
ADD COLUMN IF NOT EXISTS tessitura_max text,
ADD COLUMN IF NOT EXISTS difficulty_level integer DEFAULT 3 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
ADD COLUMN IF NOT EXISTS role_type text DEFAULT 'principal',
ADD COLUMN IF NOT EXISTS vocal_characteristics text;

-- Create arias table for individual pieces
CREATE TABLE IF NOT EXISTS public.arias (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id uuid NOT NULL REFERENCES public.lyrical_works(id) ON DELETE CASCADE,
    role_id uuid REFERENCES public.work_roles(id) ON DELETE SET NULL,
    title text NOT NULL,
    act_number integer,
    scene_number integer,
    duration_minutes integer,
    key_signature text,
    tempo_marking text,
    tessitura_min text,
    tessitura_max text,
    difficulty_level integer DEFAULT 3 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    style_period text,
    aria_type text, -- 'aria', 'cavatina', 'cabaletta', 'recitativo', etc.
    vocal_technique_notes text,
    dramatic_context text,
    first_line text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create aria_texts table for multilingual libretto
CREATE TABLE IF NOT EXISTS public.aria_texts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    aria_id uuid NOT NULL REFERENCES public.arias(id) ON DELETE CASCADE,
    language text NOT NULL,
    full_text text NOT NULL,
    phonetic_transcription text,
    translation text,
    verse_structure jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Create sheet_music table for scores and transpositions
CREATE TABLE IF NOT EXISTS public.sheet_music (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    aria_id uuid NOT NULL REFERENCES public.arias(id) ON DELETE CASCADE,
    title text NOT NULL,
    original_key text,
    transposed_key text,
    file_path text,
    file_size integer,
    publisher text,
    edition text,
    arrangement_type text,
    is_public_domain boolean DEFAULT false,
    price_cents integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- Create opera_recordings table for audio/video links
CREATE TABLE IF NOT EXISTS public.opera_recordings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    aria_id uuid REFERENCES public.arias(id) ON DELETE CASCADE,
    work_id uuid REFERENCES public.lyrical_works(id) ON DELETE CASCADE,
    title text NOT NULL,
    performer_name text,
    conductor text,
    orchestra text,
    recording_year integer,
    platform text,
    external_url text,
    file_path text,
    recording_type text,
    quality text,
    duration_seconds integer,
    language text,
    is_featured boolean DEFAULT false,
    view_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- Create opera_productions table for historical productions
CREATE TABLE IF NOT EXISTS public.opera_productions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id uuid NOT NULL REFERENCES public.lyrical_works(id) ON DELETE CASCADE,
    title text NOT NULL,
    venue text,
    city text,
    country text,
    production_date date,
    director text,
    conductor text,
    stage_designer text,
    costume_designer text,
    cast_info jsonb, -- renamed from 'cast'
    production_notes text,
    is_notable boolean DEFAULT false,
    images jsonb,
    reviews_summary text,
    created_at timestamp with time zone DEFAULT now()
);

-- Create opera_analytics table for usage tracking
CREATE TABLE IF NOT EXISTS public.opera_analytics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    action_type text NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address inet,
    user_agent text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_arias_work_id ON public.arias(work_id);
CREATE INDEX IF NOT EXISTS idx_arias_role_id ON public.arias(role_id);
CREATE INDEX IF NOT EXISTS idx_arias_difficulty ON public.arias(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_aria_texts_aria_id ON public.aria_texts(aria_id);
CREATE INDEX IF NOT EXISTS idx_aria_texts_language ON public.aria_texts(language);
CREATE INDEX IF NOT EXISTS idx_sheet_music_aria_id ON public.sheet_music(aria_id);
CREATE INDEX IF NOT EXISTS idx_recordings_aria_id ON public.opera_recordings(aria_id);
CREATE INDEX IF NOT EXISTS idx_recordings_work_id ON public.opera_recordings(work_id);
CREATE INDEX IF NOT EXISTS idx_productions_work_id ON public.opera_productions(work_id);
CREATE INDEX IF NOT EXISTS idx_analytics_entity ON public.opera_analytics(entity_type, entity_id);

-- Enable RLS on new tables
ALTER TABLE public.arias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aria_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sheet_music ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opera_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opera_productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opera_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for arias
CREATE POLICY "Anyone can view arias" ON public.arias FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create arias" ON public.arias FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update arias" ON public.arias FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS Policies for aria_texts
CREATE POLICY "Anyone can view aria texts" ON public.aria_texts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage aria texts" ON public.aria_texts FOR ALL WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for sheet_music
CREATE POLICY "Anyone can view public domain sheet music" ON public.sheet_music FOR SELECT USING (is_public_domain = true OR price_cents = 0);
CREATE POLICY "Authenticated users can view all sheet music" ON public.sheet_music FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage sheet music" ON public.sheet_music FOR ALL WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for recordings
CREATE POLICY "Anyone can view recordings" ON public.opera_recordings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage recordings" ON public.opera_recordings FOR ALL WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for productions
CREATE POLICY "Anyone can view productions" ON public.opera_productions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage productions" ON public.opera_productions FOR ALL WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for analytics
CREATE POLICY "System can manage analytics" ON public.opera_analytics FOR ALL USING (true);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_arias()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_arias_updated_at
    BEFORE UPDATE ON public.arias
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_arias();