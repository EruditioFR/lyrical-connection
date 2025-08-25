import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Eye, Users, Zap, Calendar, Plus, ArrowUp } from 'lucide-react';
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
  const { 
    isPremiumActive, 
    getPremiumEndDate, 
    createPremium, 
    isCreatingPremium,
    hasStandardSubscription,
    standardSubscription
  } = usePremiumVisibility();
  
  const isActive = isPremiumActive(profileType, profileId);
  const endDate = getPremiumEndDate(profileType, profileId);

  const handleSubscribe = () => {
    createPremium({ profileType, profileId });
  };

  // Si l'utilisateur a déjà la visibilité premium active
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

  // Si l'utilisateur a un abonnement standard mais pas la visibilité premium
  if (hasStandardSubscription) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <ArrowUp className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-lg text-amber-800">
              Upgrade : Visibilité Premium
            </CardTitle>
          </div>
          <CardDescription>
            Vous avez un abonnement <strong>{standardSubscription?.plan?.name}</strong>. 
            Ajoutez la visibilité premium pour apparaître sur les pages publiques !
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div>
                <p className="font-medium text-amber-800">Add-on Visibilité Premium</p>
                <p className="text-sm text-amber-600">En complément de votre abonnement actuel</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-800">
                  +29€<span className="text-sm font-normal">/mois</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-amber-600" />
                <span>Apparaître dans les pages publiques</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Visible par les visiteurs non connectés</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Priorité dans les résultats de recherche</span>
              </div>
              <div className="flex items-center space-x-2">
                <Crown className="w-4 h-4 text-amber-600" />
                <span>Badge premium sur votre profil</span>
              </div>
            </div>
            
            <Button 
              onClick={handleSubscribe}
              disabled={isCreatingPremium}
              className="w-full bg-amber-600 hover:bg-amber-700"
              size="lg"
            >
              {isCreatingPremium ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Ajout en cours...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter la visibilité premium (+29€/mois)
                </>
              )}
            </Button>
            
            <p className="text-xs text-amber-600 text-center">
              Facturation supplémentaire • Résiliable indépendamment de votre abonnement principal
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si l'utilisateur n'a pas d'abonnement du tout
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
          Vous n'avez pas d'abonnement actif. Commencez par souscrire un abonnement standard, 
          puis ajoutez la visibilité premium.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Pour accéder à la visibilité premium, vous devez d'abord avoir un abonnement standard.
            </p>
            <Button variant="outline" asChild>
              <a href="/subscription">
                Voir les abonnements disponibles
              </a>
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p><strong>Étape 1 :</strong> Choisissez un abonnement standard (Early Bird, Artistes, ou Professionnels)</p>
            <p><strong>Étape 2 :</strong> Ajoutez ensuite la visibilité premium (+29€/mois)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumVisibilityCard;