import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Paperclip, Reply, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageSearch } from "./MessageSearch";
import { MessageActions } from "./MessageActions";

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

interface MessageListProps {
  messages: Message[];
  selectedMessages: string[];
  onMessageSelect: (messageId: string) => void;
  onSelectAll: (checked: boolean) => void;
  onMessageClick: (message: Message) => void;
  onStarToggle: (messageId: string, isStarred: boolean) => void;
  folder: string;
  currentUserId?: string;
}

export const MessageList = ({
  messages,
  selectedMessages,
  onMessageSelect,
  onSelectAll,
  onMessageClick,
  onStarToggle,
  folder,
  currentUserId
}: MessageListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  const allSelected = messages.length > 0 && selectedMessages.length === messages.length;
  const someSelected = selectedMessages.length > 0 && selectedMessages.length < messages.length;

  // Filter messages based on search query
  const filteredMessages = messages.filter(message => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const senderInfo = getSenderInfo(message);
    
    return (
      message.subject.toLowerCase().includes(searchLower) ||
      message.content.toLowerCase().includes(searchLower) ||
      senderInfo.name.toLowerCase().includes(searchLower)
    );
  });

  const handleBulkMarkAsRead = () => {
    selectedMessages.forEach(messageId => {
      const message = messages.find(m => m.id === messageId);
      if (message && !message.is_read) {
        // TODO: Call mark as read for each message
      }
    });
  };

  const handleBulkStarToggle = () => {
    selectedMessages.forEach(messageId => {
      const message = messages.find(m => m.id === messageId);
      if (message) {
        onStarToggle(messageId, message.is_starred);
      }
    });
  };

  const handleBulkDelete = () => {
    selectedMessages.forEach(messageId => {
      // TODO: Call delete for each message
    });
  };

  const getSenderInfo = (message: Message) => {
    if (folder === 'sent') {
      return {
        name: message.recipient?.stage_name || message.recipient?.company_name || 'Destinataire',
        avatar: message.recipient?.profile_image_url || message.recipient?.logo_url,
      };
    } else {
      return {
        name: message.sender?.stage_name || message.sender?.company_name || 'Expéditeur',
        avatar: message.sender?.profile_image_url || message.sender?.logo_url,
      };
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (filteredMessages.length === 0 && !searchQuery) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Aucun message</p>
          <p className="text-sm">Cette boîte est vide.</p>
        </div>
      </div>
    );
  }

  if (filteredMessages.length === 0 && searchQuery) {
    return (
      <div className="flex-1 flex flex-col">
        <MessageSearch onSearch={setSearchQuery} onFilter={() => setShowFilters(!showFilters)} />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">Aucun résultat</p>
            <p className="text-sm">Aucun message ne correspond à votre recherche.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Search */}
      <MessageSearch onSearch={setSearchQuery} onFilter={() => setShowFilters(!showFilters)} />

      {/* Bulk Actions */}
      <MessageActions
        selectedCount={selectedMessages.length}
        onMarkAsRead={handleBulkMarkAsRead}
        onMarkAsUnread={() => {}}
        onStarToggle={handleBulkStarToggle}
        onArchive={() => {}}
        onDelete={handleBulkDelete}
        onReply={() => {}}
        onForward={() => {}}
      />

      {/* Header */}
      <div className="border-b border-border p-4 flex items-center gap-4">
        <Checkbox
          checked={allSelected}
          onCheckedChange={(checked) => onSelectAll(!!checked)}
        />
        <span className="text-sm text-muted-foreground">
          {filteredMessages.length} message{filteredMessages.length > 1 ? 's' : ''} 
          {searchQuery && ` (${messages.length} au total)`}
        </span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-auto">
        {filteredMessages.map((message) => {
          const senderInfo = getSenderInfo(message);
          const isSelected = selectedMessages.includes(message.id);
          const hasAttachments = message.attachment_urls && message.attachment_urls.length > 0;
          const isReply = !!message.reply_to_id;
          
          return (
            <div
              key={message.id}
              className={cn(
                "border-b border-border p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                !message.is_read && "bg-accent/30",
                isSelected && "bg-primary/10"
              )}
              onClick={() => onMessageClick(message)}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => {
                    onMessageSelect(message.id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />

                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStarToggle(message.id, message.is_starred);
                  }}
                >
                  <Star 
                    className={cn(
                      "w-4 h-4",
                      message.is_starred 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-muted-foreground"
                    )} 
                  />
                </Button>

                <Avatar className="w-8 h-8">
                  <AvatarImage src={senderInfo.avatar} />
                  <AvatarFallback className="text-xs">
                    {getInitials(senderInfo.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn(
                        "font-medium truncate",
                        !message.is_read && "font-semibold"
                      )}>
                        {senderInfo.name}
                      </span>
                      
                      {isReply && (
                        <Reply className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      )}
                      
                      {hasAttachments && (
                        <Paperclip className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!message.is_read && (
                        <Badge variant="default" className="w-2 h-2 p-0 rounded-full" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.created_at), { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="mt-1">
                    <p className={cn(
                      "text-sm truncate",
                      !message.is_read && "font-medium"
                    )}>
                      {message.subject || '(sans objet)'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {message.content.replace(/<[^>]*>/g, '')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};