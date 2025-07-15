-- Créer les politiques RLS pour la table notifications

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

-- Politique pour permettre au système de créer des notifications pour tous les utilisateurs
CREATE POLICY "System can create notifications for users" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Politique pour que les admins puissent gérer toutes les notifications
CREATE POLICY "Admins can manage all notifications" 
ON public.notifications 
FOR ALL 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));