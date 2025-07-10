-- Tables pour la messagerie interne
CREATE TABLE public.conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    type TEXT NOT NULL DEFAULT 'direct', -- 'direct', 'group', 'support'
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_archived BOOLEAN DEFAULT false
);

CREATE TABLE public.conversation_participants (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- 'admin', 'member'
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    left_at TIMESTAMP WITH TIME ZONE,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(conversation_id, user_id)
);

CREATE TABLE public.messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text', -- 'text', 'file', 'image', 'system'
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tables pour les notifications
CREATE TYPE public.notification_type AS ENUM (
    'message', 'casting_application', 'event_registration', 'profile_view',
    'casting_update', 'event_update', 'system', 'invitation'
);

CREATE TABLE public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.notification_preferences (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email_messages BOOLEAN DEFAULT true,
    email_applications BOOLEAN DEFAULT true,
    email_events BOOLEAN DEFAULT true,
    email_marketing BOOLEAN DEFAULT false,
    push_messages BOOLEAN DEFAULT true,
    push_applications BOOLEAN DEFAULT true,
    push_events BOOLEAN DEFAULT true,
    in_app_messages BOOLEAN DEFAULT true,
    in_app_applications BOOLEAN DEFAULT true,
    in_app_events BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tables pour les analytics et tracking
CREATE TABLE public.profile_views (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    viewed_profile_id UUID NOT NULL,
    profile_type TEXT NOT NULL, -- 'artist', 'professional'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    session_id TEXT,
    ip_address INET,
    user_agent TEXT
);

-- Table pour la modération et validation
CREATE TABLE public.verification_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_type TEXT NOT NULL, -- 'artist', 'professional'
    profile_id UUID NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    documents JSONB DEFAULT '[]',
    notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour conversations
CREATE POLICY "Users can view conversations they participate in"
ON public.conversations
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM conversation_participants 
        WHERE conversation_id = conversations.id 
        AND user_id = auth.uid()
        AND left_at IS NULL
    )
);

CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Participants can update conversations"
ON public.conversations
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM conversation_participants 
        WHERE conversation_id = conversations.id 
        AND user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Politiques RLS pour conversation_participants
CREATE POLICY "Users can view participants of their conversations"
ON public.conversation_participants
FOR SELECT
USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM conversation_participants cp2
        WHERE cp2.conversation_id = conversation_participants.conversation_id
        AND cp2.user_id = auth.uid()
        AND cp2.left_at IS NULL
    )
);

CREATE POLICY "Users can join conversations"
ON public.conversation_participants
FOR INSERT
WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_id = conversation_participants.conversation_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
);

CREATE POLICY "Users can update their own participation"
ON public.conversation_participants
FOR UPDATE
USING (user_id = auth.uid());

-- Politiques RLS pour messages
CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM conversation_participants 
        WHERE conversation_id = messages.conversation_id 
        AND user_id = auth.uid()
        AND left_at IS NULL
    )
);

CREATE POLICY "Users can send messages to their conversations"
ON public.messages
FOR INSERT
WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM conversation_participants 
        WHERE conversation_id = messages.conversation_id 
        AND user_id = auth.uid()
        AND left_at IS NULL
    )
);

CREATE POLICY "Users can update their own messages"
ON public.messages
FOR UPDATE
USING (sender_id = auth.uid());

-- Politiques RLS pour notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (user_id = auth.uid());

-- Politiques RLS pour notification_preferences
CREATE POLICY "Users can manage their own notification preferences"
ON public.notification_preferences
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Politiques RLS pour profile_views
CREATE POLICY "Users can view their profile analytics"
ON public.profile_views
FOR SELECT
USING (
    viewer_id = auth.uid() OR
    (viewed_profile_id IN (
        SELECT id FROM artist_profiles WHERE user_id = auth.uid()
        UNION
        SELECT id FROM professional_profiles WHERE user_id = auth.uid()
    ))
);

CREATE POLICY "Anyone can create profile views"
ON public.profile_views
FOR INSERT
WITH CHECK (true);

-- Politiques RLS pour verification_requests
CREATE POLICY "Users can view their own verification requests"
ON public.verification_requests
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create verification requests"
ON public.verification_requests
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their pending verification requests"
ON public.verification_requests
FOR UPDATE
USING (user_id = auth.uid() AND status = 'pending');

-- Fonction pour mettre à jour les timestamps
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_verification_requests_updated_at
    BEFORE UPDATE ON public.verification_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour mettre à jour last_message_at dans les conversations
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations 
    SET last_message_at = NEW.created_at,
        updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_last_message_trigger
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_conversation_last_message();

-- Fonction pour créer automatiquement les préférences de notification
CREATE OR REPLACE FUNCTION public.create_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notification_preferences (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_notification_preferences_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_notification_preferences();

-- Index pour optimiser les performances
CREATE INDEX idx_conversations_participants ON conversation_participants(conversation_id, user_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_profile_views_analytics ON profile_views(viewed_profile_id, created_at DESC);