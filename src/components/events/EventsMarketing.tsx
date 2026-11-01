import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { EditorialSection, EditorialList, Eyebrow } from '@/components/editorial/Editorial';

const eventTypeLabels: Record<string, string> = {
  masterclass: 'Masterclass',
  stage: 'Stage',
  atelier: 'Atelier',
  concours: 'Concours',
  conference: 'Conférence',
};

const reasons = [
  {
    title: 'Travailler avec des maîtres',
    description: 'Masterclasses et stages publiés par les maisons, académies et pédagogues inscrits.',
  },
  {
    title: 'Se présenter aux concours',
    description: 'Inscription en ligne avec votre profil, votre répertoire et vos enregistrements.',
  },
  {
    title: "S'inscrire en quelques étapes",
    description: "Programme, lieu, dates et tarif sur la fiche ; suivez ensuite le statut de votre inscription.",
  },
];

const EventsMarketing = () => {
  // Prochains événements réellement publiés
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['marketing-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_events')
        .select('id, title, event_type, start_date, location, venue, price, currency')
        .eq('status', 'published')
        .gte('start_date', format(new Date(), 'yyyy-MM-dd'))
        .order('start_date', { ascending: true })
        .limit(4);

      if (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        return [];
      }
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Ouverture */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl">
            <Eyebrow className="mb-4">Événements</Eyebrow>
            <h1 className="text-4xl md:text-6xl font-serif text-foreground mb-6">
              Masterclasses, stages et concours
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Les formations et les épreuves organisées par les professionnels du lyrique inscrits sur
              Lyrisphere. Consultez le programme et inscrivez-vous avec votre profil.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link to="/auth">Créer mon compte</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/features">Voir les fonctionnalités</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <EditorialSection
        label="Au programme"
        title="Prochains événements"
        intro={!isLoading && events.length === 0
          ? 'Aucun événement programmé pour le moment. Les professionnels peuvent publier le premier.'
          : 'Les prochaines dates publiées sur la plateforme.'}
        aside={
          <Button asChild variant="outline">
            <Link to="/auth">{events.length === 0 ? 'Publier un événement' : 'Voir tous les événements'}</Link>
          </Button>
        }
      >
        {isLoading ? (
          <ul className="divide-y divide-border border-y border-border" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <li key={i} className="py-5">
                <div className="h-5 w-2/3 bg-muted animate-pulse" />
                <div className="mt-2 h-4 w-1/2 bg-muted animate-pulse" />
              </li>
            ))}
          </ul>
        ) : events.length > 0 && (
          <ul className="divide-y divide-border border-y border-border">
            {events.map((event) => {
              const details = [
                eventTypeLabels[event.event_type] || event.event_type,
                event.venue || event.location,
                event.price ? `${event.price} ${event.currency || '€'}` : 'Gratuit',
              ].filter(Boolean);
              return (
                <li key={event.id} className="py-5 grid gap-1 sm:grid-cols-[7rem_1fr_auto] sm:gap-6 sm:items-baseline">
                  <time dateTime={event.start_date} className="font-serif text-lg text-gold-600 first-letter:uppercase">
                    {format(new Date(event.start_date), 'd MMM yyyy', { locale: fr })}
                  </time>
                  <div className="min-w-0">
                    <h3 className="text-xl">{event.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{details.join(' · ')}</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="justify-self-start">
                    <Link to={`/evenements/${event.id}`}>Programme</Link>
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </EditorialSection>

      <EditorialSection label="Pour les artistes" title="Pourquoi y participer">
        <EditorialList entries={reasons} />
      </EditorialSection>

      <section className="py-20 px-4 bg-primary">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-serif text-primary-foreground mb-6">
            Prêt à vous inscrire ?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">Inscription gratuite et sans engagement.</p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/auth">Créer mon compte</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default EventsMarketing;
