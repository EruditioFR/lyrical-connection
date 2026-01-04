import { useArtistBadges } from '@/hooks/usePromoCodes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight } from 'lucide-react';
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
    <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 overflow-hidden">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{sumiJoBadge.badge_icon}</span>
                <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                  {sumiJoBadge.badge_name}
                </h3>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Vous êtes inscrit au Concours International Sumi Jo 2026
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/profil')}
            className="hidden md:flex border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30"
          >
            Voir mon profil
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SumiJoBanner;
