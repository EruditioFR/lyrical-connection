
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useConversations } from '@/hooks/useConversations';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface ChatButtonProps {
  targetUserId: string;
  targetName: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const ChatButton: React.FC<ChatButtonProps> = ({
  targetUserId,
  targetName,
  variant = 'outline',
  size = 'sm',
  className = ''
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createConversation, conversations } = useConversations();

  const handleChatClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour envoyer un message.',
        variant: 'destructive',
      });
      return;
    }

    if (user.id === targetUserId) {
      toast({
        title: 'Action impossible',
        description: 'Vous ne pouvez pas vous envoyer un message à vous-même.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Check if conversation already exists
      const existingConversation = conversations.find(conv => 
        conv.participants.length === 2 &&
        conv.participants.some(p => p.user_id === user.id) &&
        conv.participants.some(p => p.user_id === targetUserId)
      );

      if (existingConversation) {
        // Navigate to existing conversation
        navigate(`/messages?conversation=${existingConversation.id}`);
      } else {
        // Create new conversation
        createConversation({
          participantIds: [targetUserId],
          title: `Conversation avec ${targetName}`,
          type: 'direct'
        });
        
        // Navigate to messages page - the new conversation will be auto-selected
        setTimeout(() => {
          navigate('/messages');
        }, 500);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la conversation.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleChatClick}
      className={className}
    >
      <MessageSquare className="h-4 w-4" />
      {size !== 'icon' && <span className="ml-1">Chat</span>}
    </Button>
  );
};

export default ChatButton;
