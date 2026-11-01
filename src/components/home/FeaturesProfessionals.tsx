import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { EditorialSection, EditorialList } from '@/components/editorial/Editorial';

const professionalFeatures = [
  {
    title: 'Recherche par tessiture et répertoire',
    description: 'Type de voix, rôle déjà chanté, lieu et disponibilité sur une période ; recherches enregistrées.',
  },
  {
    title: 'Castings et suivi des candidatures',
    description: 'Appels à candidatures avec vos critères de notation ; reçues, présélectionnées, retenues, refusées ; export CSV.',
  },
  {
    title: "Séances d'audition",
    description: 'Planning par créneaux, export agenda (.ics), jury à plusieurs avec notation en séance et synthèse.',
  },
  {
    title: 'Listes de projet et comparateur',
    description: 'Une liste par production, partageable par lien ; deux à quatre finalistes côte à côte.',
  },
  {
    title: 'Événements',
    description: 'Publiez masterclasses, stages et concours, et gérez les inscriptions.',
  },
];

const FeaturesProfessionals = () => (
  <EditorialSection
    label="Professionnels"
    title="Recruter, de la recherche à l'audition"
    intro="Pour les maisons d'opéra, festivals, concours, agents et pédagogues."
    aside={
      <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3">
        <Button asChild>
          <Link to="/auth">Créer mon compte pro</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/castings">Découvrir les castings</Link>
        </Button>
      </div>
    }
  >
    <EditorialList entries={professionalFeatures} numbered />
  </EditorialSection>
);

export default FeaturesProfessionals;
