
import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, MoreVertical, Info, Archive, LogOut, Image, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMessages, useConversations, type Message } from '@/hooks/useConversations';
import { useAuth } from '@/hooks/useAuth';
import { useUserType } from '@/hooks/useUserType';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import ConversationInfoDialog from './ConversationInfoDialog';
import MediaAttachmentDialog from './MediaAttachmentDialog';
import { useNavigate } from 'react-router-dom';

interface ChatInterfaceProps {
  conversationId: string;
  title?: string;
  onConversationLeft?: () => void;
}

const ChatInterface = ({ conversationId, title, onConversationLeft }: ChatInterfaceProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { userType, isArtist } = useUserType();
  const { messages, sendMessage, isSending, markAsRead } = useMessages(conversationId);
  const { conversations, leaveConversation, archiveConversation } = useConversations();
  const [newMessage, setNewMessage] = useState('');
  const [showConversationInfo, setShowConversationInfo] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = conversations.find(c => c.id === conversationId);

  // Fonction pour scroller vers le bas
  const scrollToBottom = (behavior: 'smooth' | 'instant' = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior,
        block: 'end'
      });
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      // Petit délai pour s'assurer que le DOM est mis à jour
      const timer = setTimeout(() => {
        scrollToBottom('smooth');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Scroll immédiat lors du changement de conversation
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      // Scroll immédiat lors du chargement d'une nouvelle conversation
      scrollToBottom('instant');
    }
  }, [conversationId]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (conversationId) {
      markAsRead();
    }
  }, [conversationId, markAsRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    sendMessage({ content: newMessage.trim() });
    setNewMessage('');
    // Marquer comme lu après l'envoi d'un message
    markAsRead();
    // Scroll vers le bas après l'envoi
    setTimeout(() => {
      scrollToBottom('smooth');
    }, 100);
  };

  const handleLeaveConversation = () => {
    leaveConversation(conversationId);
    onConversationLeft?.();
    navigate('/messages');
  };

  const handleArchiveConversation = () => {
    archiveConversation(conversationId);
    onConversationLeft?.();
    navigate('/messages');
  };

  const handleMediaSelect = (mediaData: { type: 'photo' | 'audio'; url: string; name: string }) => {
    const mediaMessage = mediaData.type === 'photo' 
      ? `[Photo] ${mediaData.name}: ${mediaData.url}`
      : `[Audio] ${mediaData.name}: ${mediaData.url}`;
    
    sendMessage({ content: mediaMessage });
    markAsRead();
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: fr
    });
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isOwn = message.sender_id === user?.id;
    
    // Détecter si le message contient un média
    const isPhotoMessage = message.content.startsWith('[Photo]');
    const isAudioMessage = message.content.startsWith('[Audio]');
    const isVideoMessage = message.content.startsWith('[Vidéo]');
    const isMediaMessage = isPhotoMessage || isAudioMessage || isVideoMessage;
    
    const parseMediaMessage = (content: string) => {
      const match = content.match(/\[(Photo|Audio|Vidéo)\] (.+): (.+)/);
      if (match) {
        return {
          type: match[1].toLowerCase() as 'photo' | 'audio' | 'vidéo',
          name: match[2],
          url: match[3]
        };
      }
      return null;
    };
    
    const mediaData = isMediaMessage ? parseMediaMessage(message.content) : null;
    
    // Fonction pour déterminer le type de fichier basé sur l'URL ou l'extension
    const getFileType = (url: string) => {
      const extension = url.split('.').pop()?.toLowerCase();
      if (['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(extension || '')) {
        return 'video';
      }
      if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(extension || '')) {
        return 'audio';
      }
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
        return 'photo';
      }
      return 'unknown';
    };
    
    const renderMediaContent = () => {
      if (!mediaData) return null;
      
      const fileType = mediaData.type === 'vidéo' ? 'video' : 
                      mediaData.type === 'audio' ? 'audio' : 
                      getFileType(mediaData.url);
      
      switch (fileType) {
        case 'photo':
          return (
            <div className="max-w-xs">
              <img 
                src={mediaData.url} 
                alt={mediaData.name}
                className="w-full h-auto rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => window.open(mediaData.url, '_blank')}
              />
            </div>
          );
          
        case 'audio':
          return (
            <div className="w-full max-w-sm">
              <div className="p-3 rounded-lg bg-background/10 border">
                <audio 
                  controls 
                  className="w-full"
                  preload="metadata"
                >
                  <source src={mediaData.url} />
                  Votre navigateur ne supporte pas la lecture audio.
                </audio>
              </div>
            </div>
          );
          
        case 'video':
          return (
            <div className="w-full max-w-md">
              <div className="rounded-lg overflow-hidden bg-background/10 border">
                <video 
                  controls 
                  className="w-full h-auto"
                  preload="metadata"
                >
                  <source src={mediaData.url} />
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              </div>
            </div>
          );
          
        default:
          return (
            <div className="p-3 rounded-lg bg-background/10 border">
              <a 
                href={mediaData.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                📎 {mediaData.name}
              </a>
            </div>
          );
      }
    };
    
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex ${isOwn ? 'max-w-[80%]' : 'max-w-[80%]'} ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
          {!isOwn && (
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="text-xs">
                {message.sender_id.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className={`rounded-lg px-3 py-2 ${
            isOwn 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}>
            {mediaData ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {mediaData.type === 'photo' && <Image className="w-4 h-4" />}
                  {(mediaData.type === 'audio' || getFileType(mediaData.url) === 'audio') && <Music className="w-4 h-4" />}
                  {(mediaData.type === 'vidéo' || getFileType(mediaData.url) === 'video') && <div className="w-4 h-4 border rounded-sm flex items-center justify-center text-xs">▶</div>}
                  <span className="text-sm font-medium">{mediaData.name}</span>
                </div>
                
                {renderMediaContent()}
              </div>
            ) : (
              <p className="text-sm">{message.content}</p>
            )}
            
            <p className={`text-xs mt-1 ${
              isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground/70'
            }`}>
              {formatMessageTime(message.created_at)}
              {message.is_edited && ' (modifié)'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {(conversation as any)?.displayTitle || title || 'Conversation'}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowConversationInfo(true)}>
                <Info className="w-4 h-4 mr-2" />
                Informations
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleArchiveConversation}>
                <Archive className="w-4 h-4 mr-2" />
                Archiver
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleLeaveConversation}
                className="text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Quitter la conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0">
        <ScrollArea ref={scrollAreaRef} className="h-full p-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Aucun message pour le moment</p>
            </div>
          ) : (
            <div>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          {isArtist && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="px-2"
              onClick={() => setShowMediaDialog(true)}
              title="Ajouter un média de votre profil"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
          )}
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tapez votre message..."
            disabled={isSending}
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      <ConversationInfoDialog
        open={showConversationInfo}
        onOpenChange={setShowConversationInfo}
        conversation={conversation || null}
      />

      {isArtist && (
        <MediaAttachmentDialog
          open={showMediaDialog}
          onOpenChange={setShowMediaDialog}
          onMediaSelect={handleMediaSelect}
        />
      )}
    </Card>
  );
};

export default ChatInterface;
