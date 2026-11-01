
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { differenceInCalendarDays, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight } from 'lucide-react';

const CastingsMarketing = () => {
  const features = [
    {
      title: "Des castings d'opéra, de concert et de concours",
      description: "Productions, concours et masterclasses publiés par les maisons, festivals et organisateurs inscrits."
    },
    {
      title: "Filtrer par voix et par conditions",
      description: "Tessiture recherchée, lieu, type de production, rémunération et date limite de candidature."
    },
    {
      title: "Votre profil comme dossier",
      description: "Postulez avec votre répertoire et vos enregistrements, puis suivez le statut de chaque candidature."
    },
    {
      title: "Échanger avec les recruteurs",
      description: "Messagerie directe et notifications quand un casting correspond à votre profil."
    }
  ];

  const productionTypeLabels: Record<string, string> = {
    opera: 'Opéra',
    operetta: 'Opérette',
    concert: 'Concert',
    competition: 'Concours',
    masterclass: 'Masterclass',
    other: 'Autre'
  };

  const compensationLabels: Record<string, string> = {
    paid: 'Rémunéré',
    unpaid: 'Non rémunéré',
    travel_covered: 'Transport couvert',
    accommodation_covered: 'Hébergement couvert'
  };

  // Aperçu des vrais castings ouverts (candidature encore possible)
  const { data: openCastings = [] } = useQuery({
    queryKey: ['castings-marketing-preview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('castings')
        .select('id, title, location, production_type, required_voice_types, compensation_type, application_deadline')
        .eq('is_active', true)
        .gte('application_deadline', format(new Date(), 'yyyy-MM-dd'))
        .order('application_deadline', { ascending: true })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  const steps = [
    { title: 'Créez votre profil', description: 'Répertoire, photos et enregistrements : ce que les recruteurs écouteront en premier.' },
    { title: 'Repérez les castings', description: 'Filtrez par tessiture, lieu et type de production.' },
    { title: 'Postulez', description: "Envoyez votre candidature au responsable du casting et suivez son évolution." },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Ouverture */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl">
          <p className="text-xs uppercase tracking-[0.14em] text-gold-600 mb-4">Castings</p>
          <h1 className="text-4xl md:text-6xl font-serif text-foreground mb-6">
            Votre prochain rôle commence ici
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            Les appels à candidatures des maisons d'opéra, festivals et concours, avec la tessiture
            recherchée et la date limite. Postulez avec votre profil et vos enregistrements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
              <Link to="/auth">
                Créer mon compte
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/features">Voir les fonctionnalités</Link>
            </Button>
          </div>
          </div>
        </div>
      </section>

      {/* Castings ouverts */}
      <section className="py-16 px-4 border-t border-border">
        <div className="container mx-auto grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-gold-600 mb-3">À l'affiche</p>
            <h2 className="text-3xl font-serif text-foreground mb-3">Castings ouverts</h2>
            <p className="text-muted-foreground">
              {openCastings.length > 0
                ? 'Les prochaines dates limites. Inscrivez-vous pour voir tous les castings et postuler.'
                : 'Aucun casting ouvert pour le moment. Inscrivez-vous pour être averti des prochains.'}
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/auth">Voir tous les castings</Link>
            </Button>
          </div>

          {openCastings.length > 0 && (
            <ul className="divide-y divide-border border-y border-border">
              {openCastings.map((casting) => {
                const daysLeft = differenceInCalendarDays(new Date(casting.application_deadline), new Date());
                const details = [
                  productionTypeLabels[casting.production_type] || casting.production_type,
                  casting.location,
                  casting.required_voice_types?.length ? casting.required_voice_types.join(', ') : null,
                  casting.compensation_type ? compensationLabels[casting.compensation_type] || casting.compensation_type : null,
                ].filter(Boolean);
                return (
                  <li key={casting.id} className="py-5 grid gap-1 sm:grid-cols-[1fr_auto] sm:gap-6">
                    <div className="min-w-0">
                      <h3 className="text-xl">{casting.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{details.join(' · ')}</p>
                    </div>
                    <p className="flex items-center text-sm text-gold-600 font-medium whitespace-nowrap">
                      <Clock className="h-4 w-4 mr-2" aria-hidden="true" />
                      {daysLeft === 0 ? 'Dernier jour' : `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}`}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Ce que la plateforme apporte */}
      <section className="py-16 px-4 border-t border-border">
        <div className="container mx-auto grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-gold-600 mb-3">Pour les artistes</p>
            <h2 className="text-3xl font-serif text-foreground">Ce que vous y trouvez</h2>
          </div>
          <ul className="divide-y divide-border border-y border-border">
            {features.map((feature) => (
              <li key={feature.title} className="py-5">
                <h3 className="text-xl">{feature.title}</h3>
                <p className="mt-1 text-muted-foreground">{feature.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Étapes */}
      <section className="py-16 px-4 border-t border-border">
        <div className="container mx-auto grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-gold-600 mb-3">En trois temps</p>
            <h2 className="text-3xl font-serif text-foreground">Comment ça fonctionne</h2>
          </div>
          <ol className="divide-y divide-border border-y border-border">
            {steps.map((step, i) => (
              <li key={step.title} className="py-5 grid grid-cols-[2.5rem_1fr] gap-x-4">
                <span className="font-serif text-lg text-muted-foreground tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="text-xl">{step.title}</h3>
                  <p className="mt-1 text-muted-foreground">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Appel final */}
      <section className="py-20 px-4 bg-primary">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-serif text-primary-foreground mb-6">
            Prêt à postuler ?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Inscription gratuite et sans engagement.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/auth">Créer mon compte</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default CastingsMarketing;
