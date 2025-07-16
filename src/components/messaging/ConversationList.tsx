
import { useState } from 'react';
import { Plus, Search, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConversations, type Conversation } from '@/hooks/useConversations';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ConversationListProps {
  selectedConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
  onNewConversation: () => void;
}

const ConversationList = ({ 
  selectedConversationId, 
  onConversationSelect, 
  onNewConversation 
}: ConversationListProps) => {
  const { conversations, isLoading } = useConversations();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active');

  // Debug : afficher toutes les conversations et leurs statuts
  console.log('All conversations:', conversations.map(c => ({
    id: c.id,
    title: c.title,
    is_archived: c.is_archived,
    user_left_at: c.user_left_at
  })));

  // Séparer les conversations par statut
  const activeConversations = conversations.filter(conv => 
    !conv.is_archived && !conv.user_left_at &&
    ((conv as any).displayTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     conv.last_message?.content?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const archivedConversations = conversations.filter(conv => 
    conv.is_archived &&
    ((conv as any).displayTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     conv.last_message?.content?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const leftConversations = conversations.filter(conv => 
    conv.user_left_at &&
    ((conv as any).displayTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     conv.last_message?.content?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  console.log('Filtered conversations:', {
    active: activeConversations.length,
    archived: archivedConversations.length,
    left: leftConversations.length
  });

  const formatLastMessageTime = (timestamp: string | null) => {
    if (!timestamp) return '';
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: fr
    });
  };

  const ConversationItem = ({ conversation }: { conversation: Conversation }) => {
    const isSelected = conversation.id === selectedConversationId;
    const hasUnreadMessages = false; // TODO: Implement unread message logic
    
    return (
      <div
        className={`p-3 cursor-pointer rounded-lg transition-colors ${
          isSelected 
            ? 'bg-primary/10 border-primary/20 border' 
            : 'hover:bg-muted/50'
        }`}
        onClick={() => onConversationSelect(conversation.id)}
      >
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback>
              <MessageCircle className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className={`font-medium text-sm truncate ${
                hasUnreadMessages ? 'font-semibold' : ''
              }`}>
                {(conversation as any).displayTitle || conversation.title || 'Conversation sans titre'}
              </h3>
              
              {conversation.last_message_at && (
                <span className="text-xs text-muted-foreground">
                  {formatLastMessageTime(conversation.last_message_at)}
                </span>
              )}
            </div>
            
            {conversation.last_message && (
              <p className="text-xs text-muted-foreground truncate">
                {conversation.last_message.content}
              </p>
            )}
            
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {conversation.type === 'direct' ? 'Direct' : 'Groupe'}
              </Badge>
              
              {hasUnreadMessages && (
                <Badge className="text-xs px-1.5 py-0.5">
                  2
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Messages</CardTitle>
          <Button onClick={onNewConversation} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Nouveau
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="w-full justify-start mx-2 mt-2">
            <TabsTrigger value="active" className="flex-1">
              Conversations ({activeConversations.length})
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex-1">
              Archives ({archivedConversations.length})
            </TabsTrigger>
            <TabsTrigger value="left" className="flex-1">
              Terminées ({leftConversations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="flex-1 m-0">
            <ScrollArea className="h-full">
              {activeConversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {searchQuery ? (
                    <p>Aucune conversation trouvée</p>
                  ) : (
                    <div>
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                      <p>Aucune conversation</p>
                      <p className="text-sm">Commencez une nouvelle conversation</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {activeConversations.map((conversation) => (
                    <ConversationItem 
                      key={conversation.id} 
                      conversation={conversation} 
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="archived" className="flex-1 m-0">
            <ScrollArea className="h-full">
              {archivedConversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <p>Aucune conversation archivée</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {archivedConversations.map((conversation) => (
                    <ConversationItem 
                      key={conversation.id} 
                      conversation={conversation} 
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="left" className="flex-1 m-0">
            <ScrollArea className="h-full">
              {leftConversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <p>Aucune conversation terminée</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {leftConversations.map((conversation) => (
                    <ConversationItem 
                      key={conversation.id} 
                      conversation={conversation} 
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ConversationList;
