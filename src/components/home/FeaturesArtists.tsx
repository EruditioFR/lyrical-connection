import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { EditorialSection, EditorialList } from '@/components/editorial/Editorial';

const artistFeatures = [
  {
    title: 'Un profil qui se fait entendre',
    description: 'Enregistrements audio et vidéo, photos, répertoire œuvre par œuvre avec les rôles chantés.',
  },
  {
    title: 'Être trouvé par les recruteurs',
    description: 'Les professionnels vous recherchent par tessiture, répertoire, lieu et disponibilités.',
  },
  {
    title: 'Postuler en quelques clics',
    description: 'Castings, concours et masterclasses : votre profil sert de dossier et vous suivez chaque candidature.',
  },
  {
    title: 'Agenda et disponibilités',
    description: 'Déclarez engagements et périodes libres pour apparaître dans les recherches à ces dates.',
  },
  {
    title: 'Messagerie et statistiques',
    description: 'Échangez directement avec les professionnels et suivez les visites de votre profil.',
  },
];

const FeaturesArtists = () => (
  <EditorialSection
    label="Artistes"
    title="Ce que Lyrisphere fait pour votre voix"
    intro="Présentez-vous comme dans un programme de salle, et laissez les recruteurs vous écouter."
    aside={
      <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3">
        <Button asChild>
          <Link to="/auth">Créer mon profil d'artiste</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/artistes">Voir des profils</Link>
        </Button>
      </div>
    }
  >
    <EditorialList entries={artistFeatures} numbered />
  </EditorialSection>
);

export default FeaturesArtists;
