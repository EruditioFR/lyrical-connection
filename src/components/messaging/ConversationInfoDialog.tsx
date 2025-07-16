import { useEffect, useState } from 'react';
import { Users, Calendar, MessageCircle, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Conversation, ConversationParticipant } from '@/hooks/useConversations';

interface ConversationInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: Conversation | null;
}

interface ParticipantWithProfile extends ConversationParticipant {
  artist_profile?: {
    stage_name: string;
    profile_image_url?: string;
  };
  professional_profile?: {
    company_name: string;
    logo_url?: string;
  };
}

const ConversationInfoDialog = ({ 
  open, 
  onOpenChange, 
  conversation 
}: ConversationInfoDialogProps) => {
  const [participantsWithProfiles, setParticipantsWithProfiles] = useState<ParticipantWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchParticipantProfiles = async () => {
      if (!conversation || !open) return;
      
      setIsLoading(true);
      try {
        const participantIds = conversation.participants
          .filter(p => !p.left_at) // Only active participants
          .map(p => p.user_id);

        if (participantIds.length === 0) {
          setParticipantsWithProfiles([]);
          return;
        }

        // Fetch artist profiles
        const { data: artistProfiles } = await supabase
          .from('artist_profiles')
          .select('user_id, stage_name, profile_image_url')
          .in('user_id', participantIds);

        // Fetch professional profiles
        const { data: professionalProfiles } = await supabase
          .from('professional_profiles')
          .select('user_id, company_name, logo_url')
          .in('user_id', participantIds);

        // Merge participant data with profiles
        const participantsWithProfileData = conversation.participants
          .filter(p => !p.left_at)
          .map(participant => {
            const artistProfile = artistProfiles?.find(ap => ap.user_id === participant.user_id);
            const professionalProfile = professionalProfiles?.find(pp => pp.user_id === participant.user_id);
            
            return {
              ...participant,
              artist_profile: artistProfile,
              professional_profile: professionalProfile
            };
          });

        setParticipantsWithProfiles(participantsWithProfileData);
      } catch (error) {
        console.error('Error fetching participant profiles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipantProfiles();
  }, [conversation, open]);

  if (!conversation) return null;

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: fr
    });
  };

  const getParticipantName = (participant: ParticipantWithProfile) => {
    if (participant.artist_profile?.stage_name) {
      return participant.artist_profile.stage_name;
    }
    if (participant.professional_profile?.company_name) {
      return participant.professional_profile.company_name;
    }
    return `Utilisateur ${participant.user_id.slice(0, 8)}`;
  };

  const getParticipantAvatar = (participant: ParticipantWithProfile) => {
    return participant.artist_profile?.profile_image_url || 
           participant.professional_profile?.logo_url;
  };

  const getParticipantInitials = (participant: ParticipantWithProfile) => {
    const name = getParticipantName(participant);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Informations de la conversation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Conversation Details */}
          <div className="space-y-3">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Titre</h3>
              <p className="text-sm">{conversation.title || 'Conversation sans titre'}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Type</h3>
              <Badge variant="secondary">
                {conversation.type === 'direct' ? 'Conversation directe' : 'Conversation de groupe'}
              </Badge>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Créée</h3>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                {formatDate(conversation.created_at)}
              </div>
            </div>
          </div>

          <Separator />

          {/* Participants */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium text-sm">
                Participants ({participantsWithProfiles.length})
              </h3>
            </div>

            <ScrollArea className="max-h-48">
              {isLoading ? (
                <div className="text-center text-muted-foreground text-sm py-4">
                  Chargement...
                </div>
              ) : (
                <div className="space-y-2">
                  {participantsWithProfiles.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={getParticipantAvatar(participant)} />
                        <AvatarFallback>
                          {getParticipantInitials(participant)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {getParticipantName(participant)}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {participant.role === 'admin' ? 'Administrateur' : 'Membre'}
                          </Badge>
                          {participant.artist_profile && (
                            <Badge variant="secondary" className="text-xs">
                              Artiste
                            </Badge>
                          )}
                          {participant.professional_profile && (
                            <Badge variant="secondary" className="text-xs">
                              Professionnel
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {conversation.last_message_at && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">
                  Dernier message
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(conversation.last_message_at)}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConversationInfoDialog;