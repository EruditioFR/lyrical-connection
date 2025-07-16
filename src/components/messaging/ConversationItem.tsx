import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { type Conversation } from '@/hooks/useConversations';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: () => void;
  unreadCount?: number;
}

const ConversationItem = ({ 
  conversation, 
  isSelected, 
  onSelect, 
  unreadCount = 0 
}: ConversationItemProps) => {
  const formatLastMessageTime = (timestamp: string | null) => {
    if (!timestamp) return '';
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: fr
    });
  };

  const getConversationImage = () => {
    const otherParticipants = (conversation as any).participantsWithProfiles?.filter(
      (p: any) => p.user_id !== conversation.created_by
    ) || [];
    
    if (otherParticipants.length > 0) {
      const firstParticipant = otherParticipants[0];
      return firstParticipant.artistProfile?.profile_image_url || 
             firstParticipant.professionalProfile?.logo_url;
    }
    return null;
  };

  const getDisplayName = () => {
    return (conversation as any).displayTitle || conversation.title || 'Conversation sans titre';
  };

  const getLastMessagePreview = () => {
    if (!conversation.last_message?.content) return '';
    
    const content = conversation.last_message.content;
    if (content.startsWith('[Photo]')) return '📷 Photo';
    if (content.startsWith('[Audio]')) return '🎵 Audio';
    if (content.startsWith('[Vidéo]')) return '🎬 Vidéo';
    
    return content.length > 60 ? content.substring(0, 60) + '...' : content;
  };

  return (
    <div
      className={`p-4 cursor-pointer rounded-lg transition-all duration-200 border ${
        isSelected 
          ? 'bg-primary/10 border-primary/30 shadow-md' 
          : 'border-transparent hover:bg-muted/50 hover:shadow-sm'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className="w-12 h-12">
            <AvatarImage src={getConversationImage() || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getDisplayName().slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-medium text-sm truncate ${
              unreadCount > 0 ? 'font-semibold text-foreground' : 'text-foreground'
            }`}>
              {getDisplayName()}
            </h3>
            
            {conversation.last_message_at && (
              <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                {formatLastMessageTime(conversation.last_message_at)}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <p className={`text-xs truncate ${
              unreadCount > 0 
                ? 'text-foreground font-medium' 
                : 'text-muted-foreground'
            }`}>
              {getLastMessagePreview() || 'Aucun message'}
            </p>
            
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                {conversation.type === 'direct' ? 'Direct' : 'Groupe'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;