import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useConversations';

const FloatingChatButton = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unreadCount } = useConversations();

  // Ne pas afficher le bouton si l'utilisateur n'est pas connecté
  if (!user) {
    return null;
  }

  const handleClick = () => {
    navigate('/messages');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        <Button
          onClick={handleClick}
          size="lg"
          className="rounded-full w-14 h-14 p-0 shadow-lg hover:shadow-xl transition-all duration-300"
          aria-label="Ouvrir les messages"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
        
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold animate-pulse"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default FloatingChatButton;