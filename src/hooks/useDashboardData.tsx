import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface DashboardMessage {
  id: string;
  subject: string;
  content: string;
  sender_name?: string;
  sender_avatar?: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardNotification {
  id: string;
  title: string;
  content: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardArtist {
  id: string;
  stage_name: string;
  voice_type: string | null;
  profile_image_url: string | null;
  location: string | null;
  public_visibility_premium?: boolean;
}

export interface DashboardProfessional {
  id: string;
  company_name: string;
  professional_role: string;
  profile_image_url: string | null;
  location: string | null;
}

export const useDashboardData = () => {
  const { user } = useAuth();

  // Récupérer les 5 derniers messages
  const { data: recentMessages, isLoading: messagesLoading } = useQuery({
    queryKey: ['dashboard-messages', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('mail_messages')
        .select('id, subject, content, is_read, created_at, sender_id')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      // Pour chaque message, récupérer les infos de l'expéditeur
      const messagesWithSender = await Promise.all(
        (data || []).map(async (msg) => {
          let senderName = 'Utilisateur';
          let senderAvatar = null;

          // Essayer d'abord les artistes
          const { data: artistProfile } = await supabase
            .from('artist_profiles')
            .select('stage_name, profile_image_url')
            .eq('user_id', msg.sender_id)
            .maybeSingle();

          if (artistProfile) {
            senderName = artistProfile.stage_name;
            senderAvatar = artistProfile.profile_image_url;
          } else {
            // Essayer les professionnels
            const { data: professionalProfile } = await supabase
              .from('professional_profiles')
              .select('company_name')
              .eq('user_id', msg.sender_id)
              .maybeSingle();

            if (professionalProfile) {
              senderName = professionalProfile.company_name;
            }
          }

          return {
            id: msg.id,
            subject: msg.subject,
            content: msg.content,
            sender_name: senderName,
            sender_avatar: senderAvatar,
            is_read: msg.is_read,
            created_at: msg.created_at
          };
        })
      );

      return messagesWithSender as DashboardMessage[];
    },
    enabled: !!user?.id,
  });

  // Récupérer les 5 dernières notifications
  const { data: recentNotifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ['dashboard-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, content, type, is_read, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data as DashboardNotification[];
    },
    enabled: !!user?.id,
  });

  // Récupérer un aperçu des artistes (4 profils récents)
  const { data: artistsPreview, isLoading: artistsLoading } = useQuery({
    queryKey: ['dashboard-artists-preview'],
    queryFn: async () => {
      // Récupérer les abonnements premium actifs
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('status', 'active');

      const activeUserIds = new Set((subscriptions || []).map(sub => sub.user_id));

      const { data, error } = await supabase
        .from('artist_profiles')
        .select(`
          id,
          user_id,
          stage_name,
          voice_type,
          profile_image_url,
          location,
          artist_photos!left (
            file_path,
            is_profile_photo
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching artists preview:', error);
        return [];
      }

      // Filtrer uniquement les artistes avec abonnement actif
      const filteredArtists = (data || []).filter(artist => 
        activeUserIds.has(artist.user_id)
      ).slice(0, 4);

      return filteredArtists.map(artist => {
        const profilePhoto = artist.artist_photos?.find((photo: any) => photo.is_profile_photo);
        const profileImageUrl = profilePhoto 
          ? supabase.storage.from('artist-photos').getPublicUrl(profilePhoto.file_path).data.publicUrl
          : artist.profile_image_url;

        return {
          id: artist.id,
          stage_name: artist.stage_name,
          voice_type: artist.voice_type,
          profile_image_url: profileImageUrl,
          location: artist.location,
          public_visibility_premium: true
        } as DashboardArtist;
      });
    },
  });

  // Récupérer un aperçu des professionnels (4 profils récents)
  const { data: professionalsPreview, isLoading: professionalsLoading } = useQuery({
    queryKey: ['dashboard-professionals-preview'],
    queryFn: async () => {
      // Récupérer les abonnements actifs
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('status', 'active');

      const activeUserIds = new Set((subscriptions || []).map(sub => sub.user_id));

      const { data, error } = await supabase
        .from('professional_profiles')
        .select(`
          id,
          user_id,
          company_name,
          professional_role,
          location
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching professionals preview:', error);
        return [];
      }

      // Filtrer uniquement les professionnels avec abonnement actif
      const filteredProfessionals = (data || []).filter(prof => 
        activeUserIds.has(prof.user_id)
      ).slice(0, 4);

      return filteredProfessionals.map(prof => ({
        ...prof,
        profile_image_url: null // Les professionnels n'ont pas de profile_image_url dans la DB
      })) as DashboardProfessional[];
    },
  });

  return {
    recentMessages: recentMessages || [],
    recentNotifications: recentNotifications || [],
    artistsPreview: artistsPreview || [],
    professionalsPreview: professionalsPreview || [],
    isLoading: messagesLoading || notificationsLoading || artistsLoading || professionalsLoading,
  };
};