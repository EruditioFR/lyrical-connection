import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Reply, 
  Forward, 
  Star, 
  Trash2, 
  Archive,
  Paperclip,
  Download 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

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

interface MessageViewerProps {
  message: Message;
  onBack: () => void;
  onReply: (message: Message) => void;
  onStarToggle: (messageId: string, isStarred: boolean) => void;
  onDelete: (messageId: string) => void;
  currentUserId?: string;
}

export const MessageViewer = ({
  message,
  onBack,
  onReply,
  onStarToggle,
  onDelete,
  currentUserId
}: MessageViewerProps) => {
  const isSender = message.sender_id === currentUserId;
  const contactInfo = isSender ? message.recipient : message.sender;
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const contactName = contactInfo?.stage_name || contactInfo?.company_name || 'Utilisateur';
  const contactAvatar = contactInfo?.profile_image_url || contactInfo?.logo_url;

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="font-semibold truncate">
              {message.subject || '(sans objet)'}
            </h2>
            {message.reply_to_id && (
              <Badge variant="outline" className="text-xs">
                Réponse
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStarToggle(message.id, message.is_starred)}
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

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply(message)}
            >
              <Reply className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log('Forward message')}
            >
              <Forward className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(message.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Message Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={contactAvatar} />
                  <AvatarFallback>
                    {getInitials(contactName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{contactName}</p>
                  <p className="text-sm text-muted-foreground">
                    {isSender ? 'À' : 'De'} • {formatDistanceToNow(new Date(message.created_at), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </p>
                </div>
              </div>

              {!message.is_read && !isSender && (
                <Badge variant="default" className="bg-primary text-primary-foreground">
                  Non lu
                </Badge>
              )}
            </div>

            {/* Attachments */}
            {message.attachment_urls && message.attachment_urls.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Pièces jointes ({message.attachment_urls.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {message.attachment_urls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted p-3 rounded-lg">
                      <Paperclip className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm truncate max-w-[200px]">{url}</span>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Message Body */}
          <div className="prose prose-sm max-w-none">
            <div 
              className="whitespace-pre-wrap text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: message.content }}
            />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="border-t border-border p-4">
        <div className="flex items-center justify-center">
          <Button onClick={() => onReply(message)} className="gap-2">
            <Reply className="w-4 h-4" />
            Répondre
          </Button>
        </div>
      </div>
    </div>
  );
};