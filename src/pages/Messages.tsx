import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { MailboxSidebar } from '@/components/messaging/MailboxSidebar';
import { MessageList } from '@/components/messaging/MessageList';
import { MessageViewer } from '@/components/messaging/MessageViewer';
import { ComposeMessage } from '@/components/messaging/ComposeMessage';
import { useMailbox } from '@/hooks/useMailbox';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  is_read: boolean;
  is_starred: boolean;
  attachment_urls?: string[];
  created_at: string;
  reply_to_id?: string;
  sender?: {
    stage_name?: string;
    company_name?: string;
    profile_image_url?: string;
    logo_url?: string;
  };
  recipient?: {
    stage_name?: string;
    company_name?: string;
    profile_image_url?: string;
    logo_url?: string;
  };
}

const Messages = () => {
  const { user } = useAuth();
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);

  const {
    inboxMessages,
    sentMessages,
    starredMessages,
    drafts,
    unreadCount,
    isLoading,
    markAsRead,
    toggleStar,
    deleteMessage,
  } = useMailbox();

  const getCurrentMessages = () => {
    switch (selectedFolder) {
      case 'inbox':
        return inboxMessages;
      case 'sent':
        return sentMessages;
      case 'starred':
        return starredMessages;
      case 'drafts':
        return drafts.map(draft => ({
          id: draft.id,
          sender_id: draft.user_id,
          recipient_id: draft.recipient_id || '',
          subject: draft.subject || '(Brouillon)',
          content: draft.content || '',
          is_read: true,
          is_starred: false,
          attachment_urls: draft.attachment_urls,
          created_at: draft.updated_at,
          reply_to_id: undefined,
        }));
      case 'trash':
        return []; // TODO: Implement trash functionality
      default:
        return inboxMessages;
    }
  };

  const handleMessageSelect = (messageId: string) => {
    setSelectedMessages(prev => 
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMessages(getCurrentMessages().map(msg => msg.id));
    } else {
      setSelectedMessages([]);
    }
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    setSelectedMessages([]);
    
    // Mark as read if it's an unread inbox message
    if (!message.is_read && selectedFolder === 'inbox') {
      markAsRead(message.id);
    }
  };

  const handleReply = (message: Message) => {
    setReplyToMessage(message);
    setShowCompose(true);
    setSelectedMessage(null);
  };

  const handleStarToggle = (messageId: string, isStarred: boolean) => {
    toggleStar({ messageId, isStarred });
  };

  const handleDelete = (messageId: string) => {
    const isSender = selectedFolder === 'sent';
    deleteMessage({ messageId, isSender });
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null);
    }
  };

  const handleBackToList = () => {
    setSelectedMessage(null);
    setSelectedMessages([]);
  };

  const handleCompose = () => {
    setShowCompose(true);
    setReplyToMessage(null);
  };

  const handleCloseCompose = () => {
    setShowCompose(false);
    setReplyToMessage(null);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-[80vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement de vos messages...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="h-[85vh] bg-background rounded-lg border border-border shadow-sm overflow-hidden">
          {showCompose ? (
            <div className="h-full p-6 overflow-auto">
              <ComposeMessage 
                onClose={handleCloseCompose}
                replyTo={replyToMessage ? {
                  id: replyToMessage.id,
                  sender_id: replyToMessage.sender_id,
                  subject: replyToMessage.subject,
                  content: replyToMessage.content
                } : undefined}
              />
            </div>
          ) : (
            <div className="flex h-full">
              {/* Sidebar */}
              <MailboxSidebar
                selectedFolder={selectedFolder}
                onFolderSelect={setSelectedFolder}
                unreadCount={unreadCount}
                onCompose={handleCompose}
              />

              {/* Main Content */}
              <div className="flex-1 flex">
                {/* Mobile: Show message list or viewer */}
                <div className="md:hidden w-full">
                  {selectedMessage ? (
                    <MessageViewer
                      message={selectedMessage}
                      onBack={handleBackToList}
                      onReply={handleReply}
                      onStarToggle={handleStarToggle}
                      onDelete={handleDelete}
                      currentUserId={user?.id}
                    />
                  ) : (
                    <MessageList
                      messages={getCurrentMessages()}
                      selectedMessages={selectedMessages}
                      onMessageSelect={handleMessageSelect}
                      onSelectAll={handleSelectAll}
                      onMessageClick={handleMessageClick}
                      onStarToggle={handleStarToggle}
                      folder={selectedFolder}
                      currentUserId={user?.id}
                    />
                  )}
                </div>

                {/* Desktop: Show both panels */}
                <div className="hidden md:flex w-full">
                  <div className="w-1/2 border-r border-border">
                    <MessageList
                      messages={getCurrentMessages()}
                      selectedMessages={selectedMessages}
                      onMessageSelect={handleMessageSelect}
                      onSelectAll={handleSelectAll}
                      onMessageClick={handleMessageClick}
                      onStarToggle={handleStarToggle}
                      folder={selectedFolder}
                      currentUserId={user?.id}
                    />
                  </div>
                  <div className="flex-1">
                    {selectedMessage ? (
                      <MessageViewer
                        message={selectedMessage}
                        onBack={handleBackToList}
                        onReply={handleReply}
                        onStarToggle={handleStarToggle}
                        onDelete={handleDelete}
                        currentUserId={user?.id}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-muted-foreground">
                          <h3 className="text-lg font-medium mb-2">Sélectionnez un message</h3>
                          <p className="text-sm">Choisissez un message dans la liste pour le lire</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Messages;