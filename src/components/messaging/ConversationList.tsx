
import { useState } from 'react';
import { Plus, Search, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConversations } from '@/hooks/useConversations';
import ConversationItem from './ConversationItem';

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

  // Séparer les conversations par statut avec recherche
  const filterConversations = (convs: typeof conversations) => {
    if (!searchQuery.trim()) return convs;
    
    return convs.filter(conv => 
      (conv as any).displayTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.last_message?.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const activeConversations = filterConversations(
    conversations.filter(conv => !conv.is_archived)
  );

  const archivedConversations = filterConversations(
    conversations.filter(conv => conv.is_archived)
  );

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
                <div className="p-2 space-y-2">
                  {activeConversations.map((conversation) => (
                    <ConversationItem 
                      key={conversation.id} 
                      conversation={conversation}
                      isSelected={conversation.id === selectedConversationId}
                      onSelect={() => onConversationSelect(conversation.id)}
                      unreadCount={0} // TODO: Calculate real unread count
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
                <div className="p-2 space-y-2">
                  {archivedConversations.map((conversation) => (
                    <ConversationItem 
                      key={conversation.id} 
                      conversation={conversation}
                      isSelected={conversation.id === selectedConversationId}
                      onSelect={() => onConversationSelect(conversation.id)}
                      unreadCount={0}
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
