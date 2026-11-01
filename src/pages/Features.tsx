import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

type Entry = { title: string; description: string };

// Ce que la plateforme fait réellement aujourd'hui (voir docs/benchmark-outils-professionnels.md)
const artistEntries: Entry[] = [
  {
    title: 'Un profil qui se fait entendre',
    description: "Enregistrements audio et vidéo, photos, répertoire œuvre par œuvre avec les rôles chantés, l'année et le lieu.",
  },
  {
    title: 'Postuler aux castings et aux concours',
    description: 'Votre profil sert de dossier : choisissez les enregistrements à joindre et suivez le statut de chaque candidature.',
  },
  {
    title: 'Vos disponibilités',
    description: 'Déclarez engagements et périodes libres ; les professionnels qui cherchent un artiste disponible à ces dates vous trouvent.',
  },
  {
    title: 'Masterclasses et événements',
    description: "Inscrivez-vous aux masterclasses, stages et auditions publiés par les maisons et les organisateurs.",
  },
];

const professionalEntries: Entry[] = [
  {
    title: 'Recherche par tessiture et répertoire',
    description: 'Filtrez par type de voix, rôle déjà chanté, localisation et disponibilité sur une période ; enregistrez vos recherches.',
  },
  {
    title: 'Listes de projet',
    description: "Une liste par production ou concours, avec le rôle envisagé pour chaque artiste. Partageable par lien, sans vos notes privées.",
  },
  {
    title: 'Suivi des candidatures',
    description: 'Reçues, présélectionnées, retenues, refusées : décidez en un coup d’œil et exportez au format CSV.',
  },
  {
    title: "Planning et séances d'audition",
    description: 'Créneaux générés automatiquement, export agenda (.ics), jury à plusieurs : chaque juré note en séance, la synthèse fait la moyenne.',
  },
  {
    title: 'Comparateur',
    description: "Deux à quatre finalistes côte à côte : tessiture, répertoire, enregistrements, évaluations et notes.",
  },
];

const platformEntries: Entry[] = [
  { title: 'Messagerie', description: 'Échanges directs entre artistes et professionnels, avec notifications.' },
  { title: 'Paiement sécurisé', description: 'Abonnements et inscriptions payantes réglés par carte via Stripe.' },
  { title: 'Six langues', description: 'Interface en français, anglais, allemand, italien, chinois et coréen.' },
];

const Section = ({ label, title, entries }: { label: string; title: string; entries: Entry[] }) => (
  <section className="py-16 border-t border-border">
    <div className="container mx-auto px-4 md:px-6 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-gold-600 mb-3">{label}</p>
        <h2 className="text-3xl font-serif">{title}</h2>
      </div>
      <ol className="divide-y divide-border border-y border-border">
        {entries.map((entry, i) => (
          <li key={entry.title} className="py-5 grid grid-cols-[2.5rem_1fr] gap-x-4">
            <span className="font-serif text-lg text-muted-foreground tabular-nums">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3 className="text-xl">{entry.title}</h3>
              <p className="mt-1 text-muted-foreground">{entry.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

const Features = () => (
  <Layout>
    <section className="py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl">
        <p className="text-xs uppercase tracking-[0.14em] text-gold-600 mb-4">Fonctionnalités</p>
        <h1 className="text-4xl md:text-6xl font-serif mb-6">
          Faire entendre les voix, et les trouver
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
          Les artistes lyriques y présentent leur voix et leur répertoire ; les maisons, festivals,
          concours et agents y recrutent, de la recherche à la séance d'audition.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild>
            <Link to="/auth">Créer mon compte</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/pricing">Voir les tarifs</Link>
          </Button>
        </div>
        </div>
      </div>
    </section>

    <Section label="Artistes" title="Pour les artistes" entries={artistEntries} />
    <Section label="Professionnels" title="Pour les professionnels" entries={professionalEntries} />
    <Section label="Pour tous" title="Sur toute la plateforme" entries={platformEntries} />

    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 md:px-6 text-center max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-serif mb-6">Prêt à faire entendre votre voix ?</h2>
        <p className="text-lg text-primary-foreground/80 mb-8">
          L'inscription est gratuite. Les outils avancés sont détaillés sur la page des tarifs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" asChild>
            <Link to="/auth">Créer mon compte</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            asChild
          >
            <Link to="/contact">Nous contacter</Link>
          </Button>
        </div>
      </div>
    </section>
  </Layout>
);

export default Features;
