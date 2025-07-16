import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const FloatingChatButton = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Ne pas afficher le bouton si l'utilisateur n'est pas connecté
  if (!user) {
    return null;
  }

  const handleClick = () => {
    navigate('/messages');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleClick}
        size="lg"
        className="rounded-full w-14 h-14 p-0 shadow-lg hover:shadow-xl transition-all duration-300"
        aria-label="Ouvrir les messages"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default FloatingChatButton;