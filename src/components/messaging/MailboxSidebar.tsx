import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Inbox, 
  Send, 
  Star, 
  FileText, 
  PenTool,
  Trash2,
  Trash
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MailboxSidebarProps {
  selectedFolder: string;
  onFolderSelect: (folder: string) => void;
  unreadCount: number;
  onCompose: () => void;
  onEmptyTrash?: () => void;
  trashCount?: number;
  draftsCount?: number;
  starredCount?: number;
}

export const MailboxSidebar = ({ 
  selectedFolder, 
  onFolderSelect, 
  unreadCount,
  onCompose,
  onEmptyTrash,
  trashCount,
  draftsCount,
  starredCount 
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
      icon: Star,
      count: starredCount 
    },
    { 
      id: 'drafts', 
      label: 'Brouillons', 
      icon: FileText,
      count: draftsCount 
    },
    { 
      id: 'trash', 
      label: 'Corbeille', 
      icon: Trash2,
      count: trashCount 
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
                  className={cn(
                    "ml-auto text-xs px-2 py-0.5",
                    folder.id === 'inbox' && "bg-primary text-primary-foreground",
                    folder.id === 'starred' && "bg-yellow-500 text-white",
                    folder.id === 'drafts' && "bg-blue-500 text-white",
                    folder.id === 'trash' && "bg-red-500 text-white"
                  )}
                >
                  {folder.count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Empty Trash Button */}
      {selectedFolder === 'trash' && onEmptyTrash && trashCount && trashCount > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-destructive hover:text-destructive-foreground hover:bg-destructive"
              >
                <Trash className="w-4 h-4 mr-2" />
                Vider la corbeille
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Vider la corbeille</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer définitivement tous les messages de la corbeille ? 
                  Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onEmptyTrash}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Vider la corbeille
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};