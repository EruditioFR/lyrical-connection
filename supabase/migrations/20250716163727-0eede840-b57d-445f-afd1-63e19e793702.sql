-- Supprimer les tables de messagerie existantes
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversation_participants CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

-- Créer le nouveau système de messagerie interne (type boîte mail)
CREATE TABLE public.mail_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_starred BOOLEAN NOT NULL DEFAULT false,
  is_deleted_by_sender BOOLEAN NOT NULL DEFAULT false,
  is_deleted_by_recipient BOOLEAN NOT NULL DEFAULT false,
  reply_to_id UUID REFERENCES public.mail_messages(id),
  attachment_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer une table pour les brouillons
CREATE TABLE public.mail_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipient_id UUID,
  subject TEXT,
  content TEXT,
  attachment_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes pour optimiser les performances
CREATE INDEX idx_mail_messages_sender_id ON public.mail_messages(sender_id);
CREATE INDEX idx_mail_messages_recipient_id ON public.mail_messages(recipient_id);
CREATE INDEX idx_mail_messages_created_at ON public.mail_messages(created_at DESC);
CREATE INDEX idx_mail_messages_is_read ON public.mail_messages(recipient_id, is_read);
CREATE INDEX idx_mail_drafts_user_id ON public.mail_drafts(user_id);

-- RLS Policies pour mail_messages
ALTER TABLE public.mail_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages they sent or received" 
ON public.mail_messages 
FOR SELECT 
USING (
  sender_id = auth.uid() OR 
  (recipient_id = auth.uid() AND NOT is_deleted_by_recipient)
);

CREATE POLICY "Users can send messages" 
ON public.mail_messages 
FOR INSERT 
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their received messages" 
ON public.mail_messages 
FOR UPDATE 
USING (recipient_id = auth.uid() OR sender_id = auth.uid());

-- RLS Policies pour mail_drafts
ALTER TABLE public.mail_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own drafts" 
ON public.mail_drafts 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Trigger pour updated_at
CREATE TRIGGER update_mail_messages_updated_at
BEFORE UPDATE ON public.mail_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mail_drafts_updated_at
BEFORE UPDATE ON public.mail_drafts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Activer realtime pour les nouveaux messages
ALTER TABLE public.mail_messages REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.mail_messages;