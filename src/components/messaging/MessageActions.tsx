import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Archive, 
  Trash2, 
  Star, 
  Mail, 
  MailOpen,
  Reply,
  Forward,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MessageActionsProps {
  selectedCount: number;
  onMarkAsRead: () => void;
  onMarkAsUnread: () => void;
  onStarToggle: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onReply: () => void;
  onForward: () => void;
}

export const MessageActions = ({
  selectedCount,
  onMarkAsRead,
  onMarkAsUnread,
  onStarToggle,
  onArchive,
  onDelete,
  onReply,
  onForward
}: MessageActionsProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 p-2 border-b border-border bg-muted/30">
      <span className="text-sm text-muted-foreground">
        {selectedCount} message{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
      </span>
      
      <Separator orientation="vertical" className="h-6" />
      
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onMarkAsRead}>
          <MailOpen className="w-4 h-4" />
        </Button>
        
        <Button variant="ghost" size="sm" onClick={onMarkAsUnread}>
          <Mail className="w-4 h-4" />
        </Button>
        
        <Button variant="ghost" size="sm" onClick={onStarToggle}>
          <Star className="w-4 h-4" />
        </Button>
        
        <Button variant="ghost" size="sm" onClick={onArchive}>
          <Archive className="w-4 h-4" />
        </Button>
        
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onReply}>
              <Reply className="w-4 h-4 mr-2" />
              Répondre
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onForward}>
              <Forward className="w-4 h-4 mr-2" />
              Transférer
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onArchive}>
              <Archive className="w-4 h-4 mr-2" />
              Archiver
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};