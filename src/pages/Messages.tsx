import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import ConversationList from '@/components/messaging/ConversationList';
import ChatInterface from '@/components/messaging/ChatInterface';
import NewConversationDialog from '@/components/messaging/NewConversationDialog';
import { useConversations } from '@/hooks/useConversations';

const Messages = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const { conversations } = useConversations();

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
      <div className="container mx-auto px-4 py-8">
        <div className="h-[calc(100vh-12rem)] grid gap-6 lg:grid-cols-5">
          {/* Conversation List */}
          <div className="lg:col-span-2">
            <ConversationList
              selectedConversationId={selectedConversationId || undefined}
              onConversationSelect={handleConversationSelect}
              onNewConversation={handleNewConversation}
            />
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            {selectedConversationId && selectedConversation ? (
              <ChatInterface
                conversationId={selectedConversationId}
                title={selectedConversation.title || undefined}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                <div className="text-center text-muted-foreground">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-2xl">💬</span>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Sélectionnez une conversation</h3>
                  <p className="text-sm">
                    Choisissez une conversation existante ou créez-en une nouvelle pour commencer à échanger
                  </p>
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