import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/editorial/Editorial';

const portals = [
  {
    label: 'Artistes',
    title: 'Faire entendre votre voix',
    items: [
      'Profil avec enregistrements audio et vidéo',
      'Répertoire et disponibilités',
      'Candidatures aux castings et concours',
      'Messagerie avec les professionnels',
    ],
    primary: { to: '/auth', label: 'Créer mon profil d\'artiste' },
    secondary: { to: '/artistes', label: 'Découvrir les artistes' },
  },
  {
    label: 'Professionnels',
    title: 'Trouver la distribution',
    items: [
      'Recherche par tessiture, répertoire et dates',
      'Castings, candidatures et séances d\'audition',
      'Listes de projet partageables',
      'Publication d\'événements',
    ],
    primary: { to: '/auth', label: 'Accéder à l\'espace pro' },
    secondary: { to: '/evenements', label: 'Voir les événements' },
  },
];

const PortalsSection = () => (
  <section className="py-16 border-t border-border">
    <div className="container mx-auto px-4 md:px-6">
      <div className="max-w-3xl mb-12">
        <Eyebrow className="mb-3">Deux espaces</Eyebrow>
        <h2 className="text-3xl md:text-4xl font-serif">Une scène, deux côtés du rideau</h2>
        <p className="mt-3 text-lg text-muted-foreground">
          Artiste ou professionnel, chacun dispose d'un espace et d'outils adaptés.
        </p>
      </div>

      <div className="grid gap-12 md:grid-cols-2 md:divide-x md:divide-border">
        {portals.map((portal, i) => (
          <div key={portal.label} className={i === 1 ? 'md:pl-12' : 'md:pr-12'}>
            <Eyebrow className="mb-2">{portal.label}</Eyebrow>
            <h3 className="text-2xl font-serif mb-4">{portal.title}</h3>
            <ul className="divide-y divide-border border-y border-border mb-6">
              {portal.items.map((item) => (
                <li key={item} className="py-3">{item}</li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link to={portal.primary.to}>
                  {portal.primary.label}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to={portal.secondary.to}>{portal.secondary.label}</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-12 text-muted-foreground">
        Une question avant de commencer ?{' '}
        <Link to="/faq" className="underline underline-offset-4 hover:text-foreground">Consultez la FAQ</Link>
        {' '}ou{' '}
        <Link to="/contact" className="underline underline-offset-4 hover:text-foreground">écrivez-nous</Link>.
      </p>
    </div>
  </section>
);

export default PortalsSection;
