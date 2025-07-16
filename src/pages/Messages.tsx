
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ConversationList from '@/components/messaging/ConversationList';
import ChatInterface from '@/components/messaging/ChatInterface';
import NewConversationDialog from '@/components/messaging/NewConversationDialog';
import { Button } from '@/components/ui/button';
import { useConversations } from '@/hooks/useConversations';

const Messages = () => {
  const [searchParams] = useSearchParams();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const { conversations } = useConversations();

  // Handle conversation selection from URL parameters
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversations.some(c => c.id === conversationId)) {
      setSelectedConversationId(conversationId);
    }
  }, [searchParams, conversations]);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const handleNewConversation = () => {
    setShowNewConversation(true);
  };

  const handleConversationCreated = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
          {/* Mobile: Hide conversation list when chat is selected */}
          <div className={`
            lg:w-80 lg:flex-shrink-0 flex flex-col
            ${selectedConversationId ? 'hidden lg:flex' : 'flex'}
          `}>
            <ConversationList
              selectedConversationId={selectedConversationId || undefined}
              onConversationSelect={handleConversationSelect}
              onNewConversation={handleNewConversation}
            />
          </div>

          {/* Chat Interface */}
          <div className={`
            flex-1 flex flex-col min-w-0
            ${!selectedConversationId ? 'hidden lg:flex' : 'flex'}
          `}>
            {selectedConversationId && selectedConversation ? (
              <div className="flex flex-col h-full">
                {/* Mobile back button */}
                <div className="lg:hidden flex items-center gap-2 p-3 border-b bg-background">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversationId(null)}
                  >
                    ← Retour
                  </Button>
                  <h2 className="font-medium truncate">
                    {(selectedConversation as any).displayTitle || selectedConversation.title || 'Conversation'}
                  </h2>
                </div>
                
                <ChatInterface
                  conversationId={selectedConversationId}
                  title={(selectedConversation as any).displayTitle || selectedConversation.title || undefined}
                  onConversationLeft={() => setSelectedConversationId(null)}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                <div className="text-center text-muted-foreground max-w-md px-6">
                  <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-3xl">💬</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">Commencez une conversation</h3>
                  <p className="text-sm mb-6">
                    Sélectionnez une conversation existante dans la liste ou créez-en une nouvelle pour commencer à échanger avec vos contacts.
                  </p>
                  <Button onClick={handleNewConversation} className="gap-2">
                    <span className="text-lg">+</span>
                    Nouvelle conversation
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <NewConversationDialog
        open={showNewConversation}
        onOpenChange={setShowNewConversation}
        onConversationCreated={handleConversationCreated}
      />
    </Layout>
  );
};

export default Messages;
