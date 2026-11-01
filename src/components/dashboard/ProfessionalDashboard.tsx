import MyJuriesCard from '@/components/casting/MyJuriesCard';
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useProfessionalEvents } from '@/hooks/useEvents';
import { EventPromotionManager } from '@/components/events/EventPromotionManager';
import ArtistsManagement from '@/components/professional/ArtistsManagement';
import { Eyebrow } from '@/components/editorial/Editorial';
import { Panel, PanelList, PanelLink, Stat, StatRow } from '@/components/dashboard/Panel';

const ProfessionalDashboard = () => {
  const { data: events = [] } = useProfessionalEvents();
  
  // Get contests (events with type 'concours')
  const contests = events.filter(e => e.event_type === 'concours' && e.status === 'published');

  // Statistiques rapides
  const publishedEvents = events.filter(e => e.status === 'published');
  const draftEvents = events.filter(e => e.status === 'draft');
  const promotedEvents = events.filter(e => e.is_featured);
  const totalApplications = events.reduce((sum, event) => sum + (event.applications_count || 0), 0);

  return (
    <div className="space-y-10">
      <header>
        <Eyebrow className="mb-3">Tableau de bord</Eyebrow>
        <h1 className="text-3xl md:text-4xl font-serif">Espace professionnel</h1>
        <p className="mt-2 text-muted-foreground">Vos événements, vos jurys et les artistes que vous suivez.</p>
      </header>

      <StatRow>
        <Stat label="Événements publiés" value={publishedEvents.length} />
        <Stat label="Inscriptions" value={totalApplications} note="Tous événements confondus" />
        <Stat label="Mis en avant" value={promotedEvents.length} />
        <Stat label="Brouillons" value={draftEvents.length} />
      </StatRow>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="artists">Gestion des artistes</TabsTrigger>
          <TabsTrigger value="promotion">Mise en avant</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-10">
          <MyJuriesCard />
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-x-12 gap-y-10">
            <Panel title="Événements récents" action={{ to: '/mes-evenements', label: 'Tous mes événements' }}>
              {events.length > 0 ? (
                <PanelList>
                  {events.slice(0, 5).map((event) => (
                    <PanelLink key={event.id} to={`/evenements/${event.id}`} className="items-baseline justify-between">
                      <div className="min-w-0">
                        <p className="truncate">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.applications_count || 0} inscription{(event.applications_count || 0) > 1 ? 's' : ''}
                          {event.is_featured && ' · mis en avant'}
                        </p>
                      </div>
                      <span className={`text-sm shrink-0 ${event.status === 'published' ? 'text-success' : 'text-muted-foreground'}`}>
                        {event.status === 'published' ? 'Publié' : 'Brouillon'}
                      </span>
                    </PanelLink>
                  ))}
                </PanelList>
              ) : (
                <div className="py-6">
                  <p className="text-sm text-muted-foreground mb-4">Vous n'avez pas encore créé d'événement.</p>
                  <Button asChild><Link to="/evenements/nouveau">Créer un événement</Link></Button>
                </div>
              )}
            </Panel>

            <Panel title="Accès rapide">
              <nav aria-label="Accès rapide">
                <PanelList>
                  {[
                    { to: '/evenements/nouveau', label: 'Créer un événement' },
                    { to: '/castings/nouveau', label: 'Publier un casting' },
                    { to: '/recherche-artistes', label: 'Rechercher des artistes' },
                    { to: '/professional/messages', label: 'Messages' },
                    { to: '/profil-professionnel', label: 'Mon profil' },
                    ...(contests.length > 0 ? [{ to: `/concours/${contests[0].id}/synthese`, label: 'Synthèse du concours' }] : []),
                  ].map((link) => (
                    <PanelLink key={link.to} to={link.to} className="items-center justify-between">
                      <span>{link.label}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </PanelLink>
                  ))}
                </PanelList>
              </nav>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="artists">
          <ArtistsManagement />
        </TabsContent>

        <TabsContent value="promotion">
          <EventPromotionManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfessionalDashboard;
