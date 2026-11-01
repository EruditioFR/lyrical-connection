import React from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useUserType } from '@/hooks/useUserType';
import { ArrowRight } from 'lucide-react';
import { Eyebrow } from '@/components/editorial/Editorial';
import { Panel, PanelList, PanelLink } from '@/components/dashboard/Panel';
import SubscriptionDebug from '@/components/debug/SubscriptionDebug';
import { useDashboardData } from '@/hooks/useDashboardData';
import RecentMessages from '@/components/home/RecentMessages';
import RecentNotifications from '@/components/home/RecentNotifications';
import ArtistsPreview from '@/components/home/ArtistsPreview';
import ProfessionalsPreview from '@/components/home/ProfessionalsPreview';

const AuthenticatedHome = () => {
  const { user } = useAuth();
  const { userType, isProfessional, isArtist, artistProfile, professionalProfile } = useUserType();
  const { 
    recentMessages, 
    recentNotifications, 
    artistsPreview, 
    professionalsPreview, 
    isLoading 
  } = useDashboardData();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const getDisplayName = () => {
    if (isArtist && artistProfile) {
      return artistProfile.stage_name || 'Artiste';
    }
    if (isProfessional && professionalProfile) {
      return professionalProfile.company_name || 'Professionnel';
    }
    return user?.email?.split('@')[0] || 'Utilisateur';
  };

  const getUserTypeLabel = () => {
    if (isArtist) return 'Artiste';
    if (isProfessional) return 'Professionnel';
    return 'Utilisateur';
  };

  const quickLinks = isProfessional
    ? [
        { to: '/mes-evenements', label: 'Mes événements' },
        { to: '/castings', label: 'Mes castings' },
        { to: '/recherche-artistes', label: 'Rechercher des artistes' },
        { to: '/artistes', label: 'Explorer les artistes' },
        { to: '/professionnels', label: 'Explorer les professionnels' },
      ]
    : [
        { to: '/castings', label: 'Castings ouverts' },
        { to: '/evenements', label: 'Événements' },
        { to: '/mes-candidatures', label: 'Mes candidatures' },
        { to: '/professionnels', label: 'Explorer les professionnels' },
        { to: '/artistes', label: 'Explorer les artistes' },
      ];

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6 py-12">
        <header className="mb-10">
          <Eyebrow className="mb-3">{getUserTypeLabel()}</Eyebrow>
          <h1 className="text-3xl md:text-4xl font-serif">
            {getGreeting()}, {getDisplayName()}
          </h1>
          <p className="mt-2 text-muted-foreground">Votre activité récente sur Lyrisphere.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-x-12 gap-y-10">
          <div className="space-y-10">
            <RecentMessages messages={recentMessages} isLoading={isLoading} />
            <RecentNotifications notifications={recentNotifications} isLoading={isLoading} />
          </div>

          <div className="space-y-10">
            <Panel title="Accès rapide">
              <nav aria-label="Accès rapide">
                <PanelList>
                  {quickLinks.map((link) => (
                    <PanelLink key={link.to + link.label} to={link.to} className="items-center justify-between">
                      <span>{link.label}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </PanelLink>
                  ))}
                </PanelList>
              </nav>
            </Panel>
            <ArtistsPreview artists={artistsPreview} isLoading={isLoading} />
            <ProfessionalsPreview professionals={professionalsPreview} isLoading={isLoading} />
          </div>
        </div>

        {/* Outil de diagnostic des abonnements : développement uniquement */}
        {import.meta.env.DEV && <SubscriptionDebug />}
      </div>
    </Layout>
  );
};

export default AuthenticatedHome;
