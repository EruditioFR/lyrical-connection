import { useArtistBadges } from '@/hooks/usePromoCodes';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ArtistBadgesProps {
  artistProfileId: string;
  className?: string;
  showAll?: boolean;
}

const ArtistBadges = ({ artistProfileId, className = '', showAll = false }: ArtistBadgesProps) => {
  const { data: badges = [], isLoading } = useArtistBadges(artistProfileId);

  if (isLoading || badges.length === 0) {
    return null;
  }

  const displayedBadges = showAll ? badges : badges.slice(0, 3);

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      <TooltipProvider>
        {displayedBadges.map((badge) => (
          <Tooltip key={badge.id}>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className="bg-warning/20 border-warning/50 text-warning dark:text-warning hover:bg-warning/30 cursor-default transition-all"
              >
                <span className="mr-1">{badge.badge_icon}</span>
                {badge.badge_name}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="font-medium">{badge.badge_name}</p>
              <p className="text-xs text-muted-foreground">
                Obtenu le {new Date(badge.awarded_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
        {!showAll && badges.length > 3 && (
          <Badge variant="secondary" className="text-xs">
            +{badges.length - 3}
          </Badge>
        )}
      </TooltipProvider>
    </div>
  );
};

export default ArtistBadges;
