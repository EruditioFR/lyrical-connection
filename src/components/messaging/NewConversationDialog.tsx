import { useState } from 'react';
import { Plus, X, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useConversations } from '@/hooks/useConversations';
import { useArtists } from '@/hooks/useArtists';
import { useProfessionalProfile } from '@/hooks/useProfessionalProfile';

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated?: (conversationId: string) => void;
}

interface Contact {
  id: string;
  name: string;
  email?: string;
  type: 'artist' | 'professional';
  profileImage?: string;
  userId: string;
}

const NewConversationDialog = ({ 
  open, 
  onOpenChange, 
  onConversationCreated 
}: NewConversationDialogProps) => {
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [conversationTitle, setConversationTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'artists' | 'professionals'>('all');

  const { createConversation, isCreating } = useConversations();
  const { data: artists } = useArtists({});
  const { data: professionalProfile } = useProfessionalProfile();

  // Transform data to contacts format
  const allContacts: Contact[] = [
    ...(artists?.map(artist => ({
      id: artist.id,
      name: artist.stage_name,
      email: artist.contact_email || undefined,
      type: 'artist' as const,
      profileImage: artist.profile_image_url || undefined,
      userId: artist.user_id
    })) || []),
    // Add professionals when available
  ];

  const filteredContacts = allContacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = searchType === 'all' || contact.type === searchType;
    return matchesSearch && matchesType;
  });

  const handleContactToggle = (contact: Contact) => {
    setSelectedContacts(prev => {
      const isSelected = prev.some(c => c.id === contact.id);
      if (isSelected) {
        return prev.filter(c => c.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  };

  const handleCreateConversation = async () => {
    if (selectedContacts.length === 0) return;

    const participantIds = selectedContacts.map(c => c.userId);
    const title = conversationTitle.trim() || 
                 (selectedContacts.length === 1 
                   ? `Conversation avec ${selectedContacts[0].name}`
                   : `Groupe: ${selectedContacts.map(c => c.name).join(', ')}`);

    createConversation(
      { 
        participantIds, 
        title,
        type: selectedContacts.length === 1 ? 'direct' : 'group'
      },
      {
        onSuccess: (conversation) => {
          onConversationCreated?.(conversation.id);
          onOpenChange(false);
          setSelectedContacts([]);
          setConversationTitle('');
          setSearchQuery('');
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle conversation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Conversation Title */}
          <div>
            <Label htmlFor="title">Titre de la conversation (optionnel)</Label>
            <Input
              id="title"
              value={conversationTitle}
              onChange={(e) => setConversationTitle(e.target.value)}
              placeholder="Entrez un titre..."
            />
          </div>

          {/* Selected Contacts */}
          {selectedContacts.length > 0 && (
            <div>
              <Label>Participants sélectionnés</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedContacts.map(contact => (
                  <Badge key={contact.id} variant="secondary" className="gap-1">
                    {contact.name}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-auto p-0 w-4 h-4"
                      onClick={() => handleContactToggle(contact)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Search and Filter */}
          <div className="space-y-2">
            <Label>Rechercher des contacts</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nom ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={searchType === 'all' ? 'default' : 'outline'}
                onClick={() => setSearchType('all')}
              >
                Tous
              </Button>
              <Button
                size="sm"
                variant={searchType === 'artists' ? 'default' : 'outline'}
                onClick={() => setSearchType('artists')}
              >
                Artistes
              </Button>
              <Button
                size="sm"
                variant={searchType === 'professionals' ? 'default' : 'outline'}
                onClick={() => setSearchType('professionals')}
              >
                Professionnels
              </Button>
            </div>
          </div>

          {/* Contact List */}
          <div>
            <Label>Contacts disponibles</Label>
            <ScrollArea className="h-48 mt-2 border rounded-md">
              {filteredContacts.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <p>Aucun contact trouvé</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredContacts.map(contact => {
                    const isSelected = selectedContacts.some(c => c.id === contact.id);
                    
                    return (
                      <div
                        key={contact.id}
                        className={`p-2 rounded-md cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleContactToggle(contact)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            {contact.profileImage && (
                              <AvatarImage src={contact.profileImage} />
                            )}
                            <AvatarFallback className="text-xs">
                              {contact.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {contact.name}
                            </p>
                            {contact.email && (
                              <p className="text-xs text-muted-foreground truncate">
                                {contact.email}
                              </p>
                            )}
                            <Badge variant="outline" className="text-xs mt-1">
                              {contact.type === 'artist' ? 'Artiste' : 'Professionnel'}
                            </Badge>
                          </div>
                          
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                              <Plus className="w-2 h-2 text-primary-foreground rotate-45" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateConversation}
              disabled={selectedContacts.length === 0 || isCreating}
            >
              {isCreating ? 'Création...' : 'Créer la conversation'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewConversationDialog;