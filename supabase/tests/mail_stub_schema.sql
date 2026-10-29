-- Messagerie telle qu'en production avant 20261029100000_secure_messaging.sql
-- (migrations 20250716163727, 20250716172202, 20250911141747, 20250716180121), sur une base façon Supabase.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
END $$;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
$$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
GRANT USAGE ON SCHEMA auth, public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;

-- Stockage minimal
CREATE SCHEMA storage;
GRANT USAGE ON SCHEMA storage TO anon, authenticated;
CREATE TABLE storage.buckets (id text PRIMARY KEY, name text, public boolean);
CREATE TABLE storage.objects (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bucket_id text, name text, owner uuid);
CREATE FUNCTION storage.foldername(name text) RETURNS text[] LANGUAGE sql IMMUTABLE AS
$$ SELECT (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
GRANT EXECUTE ON FUNCTION storage.foldername(text) TO anon, authenticated;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON storage.objects TO anon, authenticated;

INSERT INTO storage.buckets (id, name, public) VALUES ('message-attachments', 'message-attachments', true);
CREATE POLICY "Authenticated users can upload message attachments" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'message-attachments' AND auth.uid() IS NOT NULL);
CREATE POLICY "Anyone can download message attachments" ON storage.objects FOR SELECT
  USING (bucket_id = 'message-attachments');
CREATE POLICY "Users can delete their own message attachments" ON storage.objects FOR DELETE
  USING (bucket_id = 'message-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Profils et anciennes prises de contact
CREATE TABLE public.professional_profiles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid, company_name text);
CREATE TABLE public.artist_profiles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid, stage_name text);
CREATE TABLE public.professional_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), professional_profile_id uuid, artist_profile_id uuid,
  subject text NOT NULL, message text NOT NULL, status text DEFAULT 'sent', viewed_at timestamptz, replied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now());

-- Messagerie
CREATE TABLE public.mail_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY, sender_id UUID NOT NULL, recipient_id UUID NOT NULL,
  subject TEXT NOT NULL, content TEXT NOT NULL, is_read BOOLEAN NOT NULL DEFAULT false, is_starred BOOLEAN NOT NULL DEFAULT false,
  is_deleted_by_sender BOOLEAN NOT NULL DEFAULT false, is_deleted_by_recipient BOOLEAN NOT NULL DEFAULT false,
  reply_to_id UUID REFERENCES public.mail_messages(id), attachment_urls TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), read_at TIMESTAMPTZ, updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.mail_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can send messages" ON public.mail_messages FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Users can update message status" ON public.mail_messages FOR UPDATE
  USING ((sender_id = auth.uid()) OR (recipient_id = auth.uid())) WITH CHECK ((sender_id = auth.uid()) OR (recipient_id = auth.uid()));
CREATE POLICY "Users can view own messages (inbox, sent, trash)" ON public.mail_messages FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "Users can permanently delete their trashed messages" ON public.mail_messages FOR DELETE
  USING ((sender_id = auth.uid() AND is_deleted_by_sender = true) OR (recipient_id = auth.uid() AND is_deleted_by_recipient = true));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mail_messages TO anon, authenticated;

-- Données existantes avant migration : un favori commun, une ancienne prise de contact jamais livrée
INSERT INTO public.professional_profiles (id, user_id, company_name) VALUES ('a0000000-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001', 'Opéra A');
INSERT INTO public.artist_profiles (id, user_id, stage_name) VALUES
  ('b0000000-0000-4000-8000-000000000002', 'bbbbbbbb-0000-4000-8000-000000000002', 'Artiste B'),
  ('b0000000-0000-4000-8000-000000000009', NULL, 'Compte sans utilisateur');
INSERT INTO public.professional_contacts (professional_profile_id, artist_profile_id, subject, message, viewed_at) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'Audition Carmen', 'Seriez-vous disponible ?', NULL),
  ('a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000009', 'Perdu', 'Artiste sans compte', NULL);
INSERT INTO public.mail_messages (id, sender_id, recipient_id, subject, content, is_starred) VALUES
  ('00000000-0000-4000-8000-0000000000aa', 'aaaaaaaa-0000-4000-8000-000000000001', 'bbbbbbbb-0000-4000-8000-000000000002', 'Ancien', 'Favori commun', true);
