import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Inbox, 
  Send, 
  Star, 
  FileText, 
  PenTool,
  Trash2 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MailboxSidebarProps {
  selectedFolder: string;
  onFolderSelect: (folder: string) => void;
  unreadCount: number;
  onCompose: () => void;
}

export const MailboxSidebar = ({ 
  selectedFolder, 
  onFolderSelect, 
  unreadCount,
  onCompose 
}: MailboxSidebarProps) => {
  const folders = [
    { 
      id: 'inbox', 
      label: 'Boîte de réception', 
      icon: Inbox, 
      count: unreadCount 
    },
    { 
      id: 'sent', 
      label: 'Messages envoyés', 
      icon: Send 
    },
    { 
      id: 'starred', 
      label: 'Messages favoris', 
      icon: Star 
    },
    { 
      id: 'drafts', 
      label: 'Brouillons', 
      icon: FileText 
    },
    { 
      id: 'trash', 
      label: 'Corbeille', 
      icon: Trash2 
    },
  ];

  return (
    <div className="w-64 bg-card border-r border-border p-4 space-y-2">
      <Button 
        onClick={onCompose}
        className="w-full mb-4 bg-primary hover:bg-primary/90"
        size="lg"
      >
        <PenTool className="w-4 h-4 mr-2" />
        Nouveau message
      </Button>

      <div className="space-y-1">
        {folders.map((folder) => {
          const Icon = folder.icon;
          const isSelected = selectedFolder === folder.id;
          
          return (
            <Button
              key={folder.id}
              variant={isSelected ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-left font-normal",
                isSelected && "bg-secondary/80 text-secondary-foreground"
              )}
              onClick={() => onFolderSelect(folder.id)}
            >
              <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="flex-1">{folder.label}</span>
              {folder.count && folder.count > 0 && (
                <Badge 
                  variant="default" 
                  className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5"
                >
                  {folder.count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};