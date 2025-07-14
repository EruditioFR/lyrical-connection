
-- Créer les tables pour le système de traduction
CREATE TABLE public.translation_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key_path TEXT NOT NULL UNIQUE, -- ex: "navigation.home", "common.loading"
  section TEXT NOT NULL, -- ex: "navigation", "common", "home"
  french_text TEXT NOT NULL,
  context TEXT, -- contexte d'utilisation pour l'IA
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key_id UUID NOT NULL REFERENCES public.translation_keys(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL, -- "en", "de", "it", "zh", "ko"
  translated_text TEXT NOT NULL,
  is_ai_generated BOOLEAN DEFAULT false,
  is_reviewed BOOLEAN DEFAULT false,
  translated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(key_id, language_code)
);

CREATE TABLE public.translation_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key_id UUID NOT NULL REFERENCES public.translation_keys(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  suggested_text TEXT NOT NULL,
  ai_confidence DECIMAL(3,2), -- score de confiance de l'IA (0.00 à 1.00)
  context_used TEXT, -- contexte fourni à l'IA
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_translation_keys_section ON public.translation_keys(section);
CREATE INDEX idx_translations_language ON public.translations(language_code);
CREATE INDEX idx_translations_key_lang ON public.translations(key_id, language_code);
CREATE INDEX idx_suggestions_status ON public.translation_suggestions(status);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_translation_keys_updated_at
    BEFORE UPDATE ON public.translation_keys
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_translations_updated_at
    BEFORE UPDATE ON public.translations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.translation_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_suggestions ENABLE ROW LEVEL SECURITY;

-- Admins peuvent tout faire
CREATE POLICY "Admins can manage translation keys" ON public.translation_keys
  FOR ALL USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can manage translations" ON public.translations
  FOR ALL USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can manage translation suggestions" ON public.translation_suggestions
  FOR ALL USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Tout le monde peut voir les clés et traductions (pour l'affichage)
CREATE POLICY "Anyone can view translation keys" ON public.translation_keys
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view translations" ON public.translations
  FOR SELECT USING (true);
