import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Keyboard } from "lucide-react";

interface KeyboardShortcutsProps {
  open: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ['↑', '↓'], description: 'Naviguer entre les messages', category: 'Navigation' },
  { keys: ['Enter'], description: 'Ouvrir le message sélectionné', category: 'Navigation' },
  { keys: ['Esc'], description: 'Fermer la vue ou revenir à la liste', category: 'Navigation' },
  
  // Actions sur les messages
  { keys: ['Space'], description: 'Marquer comme lu/non lu', category: 'Actions' },
  { keys: ['s'], description: 'Ajouter/Retirer une étoile', category: 'Actions' },
  { keys: ['r'], description: 'Répondre au message', category: 'Actions' },
  { keys: ['Shift', 'r'], description: 'Répondre à tous', category: 'Actions' },
  { keys: ['f'], description: 'Transférer le message', category: 'Actions' },
  { keys: ['Del'], description: 'Supprimer le message', category: 'Actions' },
  { keys: ['a'], description: 'Archiver le message', category: 'Actions' },
  
  // Sélection
  { keys: ['Ctrl', 'a'], description: 'Sélectionner tous les messages', category: 'Sélection' },
  { keys: ['Shift', 'Click'], description: 'Sélection multiple', category: 'Sélection' },
  { keys: ['x'], description: 'Basculer la sélection du message', category: 'Sélection' },
  
  // Composition
  { keys: ['c'], description: 'Nouveau message', category: 'Composition' },
  { keys: ['Ctrl', 'Enter'], description: 'Envoyer le message', category: 'Composition' },
  { keys: ['Ctrl', 's'], description: 'Sauvegarder en brouillon', category: 'Composition' },
  { keys: ['Ctrl', 'd'], description: 'Annuler la composition', category: 'Composition' },
  
  // Recherche et filtres
  { keys: ['/'], description: 'Rechercher dans les messages', category: 'Recherche' },
  { keys: ['Ctrl', 'f'], description: 'Ouvrir les filtres avancés', category: 'Recherche' },
  { keys: ['Ctrl', 'Shift', 'f'], description: 'Effacer tous les filtres', category: 'Recherche' },
  
  // Dossiers
  { keys: ['g', 'i'], description: 'Aller à la boîte de réception', category: 'Dossiers' },
  { keys: ['g', 's'], description: 'Aller aux messages envoyés', category: 'Dossiers' },
  { keys: ['g', 'd'], description: 'Aller aux brouillons', category: 'Dossiers' },
  { keys: ['g', 't'], description: 'Aller à la corbeille', category: 'Dossiers' },
  { keys: ['g', '*'], description: 'Aller aux messages étoilés', category: 'Dossiers' },
];

const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
  if (!acc[shortcut.category]) {
    acc[shortcut.category] = [];
  }
  acc[shortcut.category].push(shortcut);
  return acc;
}, {} as Record<string, Shortcut[]>);

export const KeyboardShortcuts = ({ open, onClose }: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        // This would be triggered from the parent component
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderKey = (key: string) => {
    const specialKeys: Record<string, string> = {
      'Ctrl': '⌘',
      'Shift': '⇧',
      'Enter': '↵',
      'Space': '␣',
      'Del': '⌦',
      'Esc': '⎋',
      '↑': '↑',
      '↓': '↓',
    };
    
    return specialKeys[key] || key;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Raccourcis clavier
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category} className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                {category}
              </h3>
              <div className="grid gap-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <Badge 
                          key={keyIndex} 
                          variant="outline" 
                          className="text-xs px-2 py-1 font-mono"
                        >
                          {renderKey(key)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground mt-6 p-4 bg-muted rounded-lg">
          <p className="font-medium mb-2">💡 Astuce :</p>
          <p>
            Appuyez sur <Badge variant="outline" className="text-xs px-1 py-0.5 font-mono">⌘</Badge> + 
            <Badge variant="outline" className="text-xs px-1 py-0.5 font-mono ml-1">?</Badge> à 
            tout moment pour afficher cette aide.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};