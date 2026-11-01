import { useArtistBadges } from '@/hooks/usePromoCodes';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SumiJoBannerProps {
  artistProfileId: string | undefined;
}

const SumiJoBanner = ({ artistProfileId }: SumiJoBannerProps) => {
  const navigate = useNavigate();
  const { data: badges = [] } = useArtistBadges(artistProfileId);
  
  // Check if user has a Sumi Jo badge
  const sumiJoBadge = badges.find(badge => 
    badge.badge_type.includes('sumi_jo') && badge.is_active
  );

  if (!sumiJoBadge) {
    return null;
  }

  return (
    <aside className="border-l-2 border-gold-600 pl-4 py-1 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-gold-600">{sumiJoBadge.badge_name}</p>
        <p className="mt-1">Vous êtes inscrit au Concours International Sumi Jo 2026.</p>
      </div>
      <Button variant="outline" size="sm" onClick={() => navigate('/profil')}>
        Voir mon profil
        <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
      </Button>
    </aside>
  );
};

export default SumiJoBanner;
