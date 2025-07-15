-- Supprimer les politiques existantes pour les recréer correctement
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications for users" ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;

-- Recréer les politiques RLS pour la table notifications avec les bonnes permissions

-- Politique pour que les utilisateurs puissent voir leurs propres notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent marquer leurs notifications comme lues
CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Politique pour permettre l'insertion de notifications (nécessaire pour le système)
CREATE POLICY "Allow notification creation" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Politique pour que les admins puissent tout gérer
CREATE POLICY "Admins can manage all notifications" 
ON public.notifications 
FOR ALL 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));