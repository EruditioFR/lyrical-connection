-- Base minimale façon Supabase : seulement ce que touchent les migrations des outils professionnels.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
END $$;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
$$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
GRANT USAGE ON SCHEMA auth, public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger LANGUAGE plpgsql AS
$$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TABLE public.professional_profiles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, company_name text NOT NULL);
CREATE TABLE public.artist_profiles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid, stage_name text NOT NULL, voice_type text, location text, is_active boolean DEFAULT true);
CREATE TABLE public.artist_photos (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), artist_profile_id uuid REFERENCES artist_profiles(id), file_path text, is_profile_photo boolean);
CREATE TABLE public.castings (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), professional_profile_id uuid REFERENCES professional_profiles(id), title text, is_active boolean DEFAULT false);
CREATE TABLE public.applications (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), casting_id uuid REFERENCES castings(id), artist_profile_id uuid REFERENCES artist_profiles(id), status text DEFAULT 'pending');

-- Same definitions as migration 20250912164123
CREATE TABLE public.custom_criteria (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), professional_profile_id uuid NOT NULL, name text NOT NULL, is_active boolean DEFAULT true);
CREATE TABLE public.candidate_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), application_id uuid NOT NULL, criteria_id uuid NOT NULL,
  score integer NOT NULL CHECK (score >= 1 AND score <= 20), comments text, scored_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(application_id, criteria_id));

ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE castings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY pp_read ON professional_profiles FOR SELECT USING (true);
CREATE POLICY ap_read ON artist_profiles FOR SELECT USING (true);
CREATE POLICY ph_read ON artist_photos FOR SELECT USING (true);
CREATE POLICY c_public ON castings FOR SELECT USING (is_active = true);
CREATE POLICY c_owner ON castings FOR ALL USING (EXISTS (SELECT 1 FROM professional_profiles pp WHERE pp.id = castings.professional_profile_id AND pp.user_id = auth.uid()));
CREATE POLICY a_owner ON applications FOR SELECT USING (EXISTS (SELECT 1 FROM castings c JOIN professional_profiles pp ON pp.id = c.professional_profile_id WHERE c.id = applications.casting_id AND pp.user_id = auth.uid()));
CREATE POLICY a_artist ON applications FOR SELECT USING (EXISTS (SELECT 1 FROM artist_profiles ap WHERE ap.id = applications.artist_profile_id AND ap.user_id = auth.uid()));
CREATE POLICY "Professionals can manage their own criteria" ON custom_criteria FOR ALL
  USING (EXISTS (SELECT 1 FROM professional_profiles WHERE id = custom_criteria.professional_profile_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM professional_profiles WHERE id = custom_criteria.professional_profile_id AND user_id = auth.uid()));
CREATE POLICY "Professionals can score applications to their castings" ON candidate_scores FOR ALL
  USING (EXISTS (SELECT 1 FROM applications a JOIN castings c ON c.id = a.casting_id JOIN professional_profiles pp ON pp.id = c.professional_profile_id WHERE a.id = candidate_scores.application_id AND pp.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM applications a JOIN castings c ON c.id = a.casting_id JOIN professional_profiles pp ON pp.id = c.professional_profile_id WHERE a.id = candidate_scores.application_id AND pp.user_id = auth.uid() AND candidate_scores.scored_by = auth.uid()));
