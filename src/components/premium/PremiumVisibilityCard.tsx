import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Eye, Users, Zap, Calendar } from 'lucide-react';
import { usePremiumVisibility } from '@/hooks/usePremiumVisibility';

interface PremiumVisibilityCardProps {
  profileType: 'artist' | 'professional';
  profileId: string;
  title?: string;
}

const PremiumVisibilityCard: React.FC<PremiumVisibilityCardProps> = ({ 
  profileType, 
  profileId,
  title 
}) => {
  const { isPremiumActive, getPremiumEndDate, createPremium, isCreatingPremium } = usePremiumVisibility();
  
  const isActive = isPremiumActive(profileType, profileId);
  const endDate = getPremiumEndDate(profileType, profileId);

  const handleSubscribe = () => {
    createPremium({ profileType, profileId });
  };

  if (isActive) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Visibilité Premium</CardTitle>
            </div>
            <Badge variant="default" className="bg-primary">
              <Crown className="w-3 h-3 mr-1" />
              Actif
            </Badge>
          </div>
          <CardDescription>
            Votre {profileType === 'artist' ? 'profil d\'artiste' : 'profil professionnel'} bénéficie de la visibilité premium
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Actif jusqu'au {endDate?.toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-green-600" />
                <span>Visible par les visiteurs non connectés</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-green-600" />
                <span>Priorité dans les résultats de recherche</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-green-600" />
                <span>Badge premium sur votre profil</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-muted-foreground/20">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Crown className="w-5 h-5 text-muted-foreground" />
          <CardTitle className="text-lg">
            {title || 'Visibilité Premium'}
          </CardTitle>
        </div>
        <CardDescription>
          Boostez la visibilité de votre {profileType === 'artist' ? 'profil d\'artiste' : 'profil professionnel'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-2xl font-bold text-primary">
            29€<span className="text-sm font-normal text-muted-foreground">/mois</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-primary" />
              <span>Apparaître dans les pages publiques</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-primary" />
              <span>Visible par les visiteurs non connectés</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Priorité dans les résultats de recherche</span>
            </div>
            <div className="flex items-center space-x-2">
              <Crown className="w-4 h-4 text-primary" />
              <span>Badge premium sur votre profil</span>
            </div>
          </div>
          
          <Button 
            onClick={handleSubscribe}
            disabled={isCreatingPremium}
            className="w-full"
            size="lg"
          >
            {isCreatingPremium ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Activation en cours...
              </>
            ) : (
              <>
                <Crown className="w-4 h-4 mr-2" />
                Activer la visibilité premium
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Abonnement mensuel • Résiliable à tout moment
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumVisibilityCard;