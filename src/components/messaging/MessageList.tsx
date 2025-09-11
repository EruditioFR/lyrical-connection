import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Paperclip, Reply, Filter, RotateCcw, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageSearch } from "./MessageSearch";
import { MessageActions } from "./MessageActions";
import { MessageExport } from "./MessageExport";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { MessageFilters } from "./AdvancedFilters";

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
  onRestore?: (messageId: string) => void;
  onMarkAsRead?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

export const MessageList = ({ 
  messages, 
  selectedMessages, 
  onMessageSelect, 
  onSelectAll, 
  onMessageClick,
  onStarToggle,
  folder,
  currentUserId,
  onRestore,
  onMarkAsRead,
  onDelete
}: MessageListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [filters, setFilters] = useState<MessageFilters>({
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(0);
  
  const allSelected = messages.length > 0 && selectedMessages.length === messages.length;
  const someSelected = selectedMessages.length > 0 && selectedMessages.length < messages.length;

  // Apply all filters
  const filteredMessages = messages
    .filter(message => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const senderInfo = getSenderInfo(message);
        
        const matchesSearch = (
          message.subject.toLowerCase().includes(searchLower) ||
          message.content.toLowerCase().includes(searchLower) ||
          senderInfo.name.toLowerCase().includes(searchLower)
        );
        
        if (!matchesSearch) return false;
      }
      
      // Read status filter
      if (filters.isRead !== undefined) {
        if (message.is_read !== filters.isRead) return false;
      }
      
      // Starred filter
      if (filters.isStarred !== undefined) {
        if (message.is_starred !== filters.isStarred) return false;
      }
      
      // Attachments filter
      if (filters.hasAttachments) {
        if (!message.attachment_urls || message.attachment_urls.length === 0) return false;
      }
      
      // Date range filter
      if (filters.dateRange) {
        const messageDate = new Date(message.created_at);
        if (filters.dateRange.from && messageDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && messageDate > filters.dateRange.to) return false;
      }
      
      // Sender filter
      if (filters.sender) {
        const senderInfo = getSenderInfo(message);
        if (senderInfo.name !== filters.sender) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort messages
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'sender':
          aValue = getSenderInfo(a).name;
          bValue = getSenderInfo(b).name;
          break;
        case 'subject':
          aValue = a.subject || '';
          bValue = b.subject || '';
          break;
        case 'date':
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
      }
      
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleBulkMarkAsRead = () => {
    if (!onMarkAsRead) return;
    selectedMessages.forEach(messageId => {
      const message = messages.find(m => m.id === messageId);
      if (message && !message.is_read) {
        onMarkAsRead(messageId);
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
    if (!onDelete) return;
    selectedMessages.forEach(messageId => {
      onDelete(messageId);
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

  const getSenders = () => {
    return Array.from(new Set(
      messages.map(message => getSenderInfo(message).name)
    ));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        // Allow slash to focus search
        if (e.key === '/' && e.target.tagName !== 'INPUT') {
          e.preventDefault();
          const searchInput = document.querySelector('input[placeholder*="Rechercher"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
        }
        return;
      }

      switch (e.key) {
        case '/':
          e.preventDefault();
          const searchInput = document.querySelector('input[placeholder*="Rechercher"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
          break;
        
        case '?':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowKeyboardShortcuts(true);
          }
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          setSelectedMessageIndex(prev => Math.max(0, prev - 1));
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          setSelectedMessageIndex(prev => Math.min(filteredMessages.length - 1, prev + 1));
          break;
          
        case 'Enter':
          if (filteredMessages[selectedMessageIndex]) {
            onMessageClick(filteredMessages[selectedMessageIndex]);
          }
          break;
          
        case ' ':
          e.preventDefault();
          if (filteredMessages[selectedMessageIndex] && onMarkAsRead) {
            onMarkAsRead(filteredMessages[selectedMessageIndex].id);
          }
          break;
          
        case 's':
          if (filteredMessages[selectedMessageIndex]) {
            onStarToggle(filteredMessages[selectedMessageIndex].id, filteredMessages[selectedMessageIndex].is_starred);
          }
          break;
          
        case 'a':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onSelectAll(true);
          }
          break;
          
        case 'x':
          if (filteredMessages[selectedMessageIndex]) {
            onMessageSelect(filteredMessages[selectedMessageIndex].id);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredMessages, selectedMessageIndex, onMessageClick, onMarkAsRead, onStarToggle, onSelectAll, onMessageSelect]);

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
      <MessageSearch 
        onSearch={setSearchQuery} 
        onFilter={() => setShowFilters(!showFilters)} 
        filters={filters}
        onFiltersChange={setFilters}
        senders={getSenders()}
        onKeyboardShortcuts={() => setShowKeyboardShortcuts(true)}
      />

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
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => onSelectAll(!!checked)}
          />
          <span className="text-sm text-muted-foreground">
            {filteredMessages.length} message{filteredMessages.length > 1 ? 's' : ''} 
            {searchQuery && ` (${messages.length} au total)`}
          </span>
        </div>
        
        <MessageExport 
          messages={filteredMessages}
          selectedMessages={selectedMessages}
          folder={folder}
        />
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
                isSelected && "bg-primary/10",
                selectedMessageIndex === messages.indexOf(message) && "ring-2 ring-primary/50"
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

                {folder === 'trash' && onRestore ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRestore(message.id);
                    }}
                    title="Restaurer"
                  >
                    <RotateCcw className="w-4 h-4 text-muted-foreground" />
                  </Button>
                ) : (
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
                )}

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
      
      <KeyboardShortcuts 
        open={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
    </div>
  );
};