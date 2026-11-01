import React from 'react';
import Layout from '@/components/layout/Layout';
import { EditorialList, Eyebrow } from '@/components/editorial/Editorial';

const objectives = [
  {
    title: 'Faciliter les rencontres',
    description: "Mettre en relation directe les artistes lyriques avec les directeurs de casting, les maisons d'opéra, les festivals, les concours et les agents.",
  },
  {
    title: 'Faire entendre les voix',
    description: 'Offrir aux artistes une page où présenter leur répertoire, leur parcours et surtout leurs enregistrements.',
  },
  {
    title: 'Simplifier le recrutement',
    description: "Donner aux professionnels des outils pensés pour le lyrique : recherche par tessiture et par rôle, suivi des candidatures, séances d'audition.",
  },
];

const About = () => (
  <Layout>
    <article className="container mx-auto px-4 md:px-6 py-16 max-w-3xl">
      <Eyebrow className="mb-4">Qui sommes-nous</Eyebrow>
      <h1 className="text-4xl md:text-5xl font-serif mb-6">Chaque voix mérite d'être entendue</h1>
      <p className="text-xl text-muted-foreground leading-relaxed mb-12">
        Lyrisphere relie les artistes lyriques et les professionnels de l'opéra et de la musique classique.
      </p>

      <section className="py-8 border-t border-border">
        <h2 className="text-2xl font-serif mb-4">Notre mission</h2>
        <p className="leading-relaxed">
          Nous croyons que chaque talent doit avoir l'occasion de s'épanouir. Notre mission est d'ouvrir
          l'accès aux opportunités du monde lyrique en créant un pont entre les artistes et les
          professionnels qui cherchent de nouvelles voix.
        </p>
      </section>

      <section className="py-8 border-t border-border">
        <h2 className="text-2xl font-serif mb-6">Nos objectifs</h2>
        <EditorialList entries={objectives} numbered />
      </section>

      <section className="py-8 border-t border-border">
        <h2 className="text-2xl font-serif mb-4">Notre équipe</h2>
        <p className="leading-relaxed">
          Lyrisphere a été fondée par une équipe d'entrepreneurs et de professionnels du secteur musical,
          convaincus que des outils bien pensés peuvent servir l'art lyrique.
        </p>
      </section>

      <section className="py-8 border-t border-b border-border">
        <h2 className="text-2xl font-serif mb-4">Notre vision</h2>
        <p className="leading-relaxed">
          Devenir le lieu de référence des professionnels de l'art lyrique : là où l'on découvre de nouveaux
          talents et où naissent les collaborations artistiques.
        </p>
      </section>
    </article>
  </Layout>
);

export default About;
