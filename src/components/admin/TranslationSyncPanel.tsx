
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Download, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { syncTranslationsToDatabase } from '@/utils/translationSync';
import { useToast } from '@/hooks/use-toast';

// Import des traductions françaises
const frenchTranslations = {
  fr: {
    common: {
      loading: 'Chargement...',
      error: 'Erreur', 
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      create: 'Créer',
      search: 'Rechercher',
      filter: 'Filtrer',
      close: 'Fermer',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      yes: 'Oui',
      no: 'Non',
      submit: 'Valider'
    },
    navigation: {
      home: 'Accueil',
      artists: 'Artistes',
      castings: 'Castings',
      events: 'Événements',  
      pricing: 'Tarifs',
      about: 'Qui sommes-nous',
      contact: 'Contact',
      profile: 'Mon Profil',
      logout: 'Déconnexion',
      login: 'Se connecter',
      register: "S'inscrire",
      search: 'Recherche avancée',
      myEvents: 'Mes Événements',
      admin: 'Administration'
    },
    home: {
      hero: {
        title: 'Connectez les talents lyriques aux opportunités',
        subtitle: 'La première plateforme dédiée aux chanteurs lyriques et aux professionnels de l\'opéra. Créez votre profil, découvrez des opportunités et développez votre carrière.',
        createProfile: 'Créer mon profil',
        discoverArtists: 'Découvrir les artistes',
        stats: {
          artists: 'Artistes',
          professionals: 'Professionnels', 
          events: 'Événements'
        }
      },
      features: {
        title: 'Une plateforme pensée pour tous les acteurs du lyrique',
        subtitle: 'Découvrez comment Lyrisphere révolutionne la façon dont les artistes et les professionnels interagissent dans le monde de l\'opéra',
        artists: {
          title: 'Pour les Artistes',
          subtitle: 'Développez votre carrière avec des outils professionnels de promotion et de networking',
          cta: 'Créer mon profil artiste'
        },
        professionals: {
          title: 'Pour les Professionnels',
          subtitle: 'Trouvez les talents qui correspondent exactement à vos besoins artistiques',
          cta: 'Accéder à l\'espace pro'
        }
      },
      featuredArtists: {
        title: 'Artistes en vedette',
        subtitle: 'Découvrez les artistes lyriques les plus prometteurs de notre plateforme.',
        viewAll: 'Voir tous les artistes',
        listen: 'Écouter',
        featured: 'En vedette',
        becomeArtist: {
          title: 'Vous êtes artiste lyrique ?',
          subtitle: 'Rejoignez notre communauté d\'artistes et mettez en valeur votre talent auprès de professionnels du milieu lyrique.',
          createProfile: 'Créer mon profil',
          guide: 'Guide pour les artistes'
        }
      },
      pricing: {
        title: 'Choisissez le plan qui vous correspond',
        subtitle: 'Des tarifs adaptés à vos besoins, que vous soyez artiste ou professionnel',
        monthly: 'mois',
        noCommitment: 'Sans engagement • Résiliation à tout moment',
        contact: 'Nous contacter',
        faq: 'Questions fréquentes'
      },
      cta: {
        title: 'Prêt à rejoindre la communauté de la musique lyrique ?',
        subtitle: 'Que vous soyez artiste ou professionnel, Lyrisphere vous offre les outils nécessaires pour faire avancer votre carrière.',
        createAccount: 'Créer un compte',
        viewPlans: 'Voir les abonnements'
      }
    }
  }
};

export const TranslationSyncPanel: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    added: number;
    total: number;
    error?: string;
  } | null>(null);
  const { toast } = useToast();

  const handleSync = async () => {
    setIsLoading(true);
    setSyncResult(null);

    try {
      const result = await syncTranslationsToDatabase(frenchTranslations.fr);
      setSyncResult(result);
      
      toast({
        title: "Synchronisation réussie",
        description: `${result.added} nouvelles clés ajoutées sur ${result.total} clés au total.`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setSyncResult({
        success: false,
        added: 0,
        total: 0,
        error: errorMessage
      });
      
      toast({
        title: "Erreur de synchronisation",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Synchronisation des traductions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p>
            Cette fonction permet de pré-remplir automatiquement la base de données 
            avec toutes les phrases françaises des pages publiques du site.
          </p>
          <p className="mt-2">
            Les clés existantes ne seront pas modifiées, seules les nouvelles clés 
            seront ajoutées.
          </p>
        </div>

        {syncResult && (
          <Alert variant={syncResult.success ? "default" : "destructive"}>
            {syncResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {syncResult.success ? (
                <>
                  <strong>Synchronisation terminée :</strong>
                  <br />
                  • {syncResult.added} nouvelles clés ajoutées
                  <br />
                  • {syncResult.total} clés au total dans le système
                </>
              ) : (
                <>
                  <strong>Erreur :</strong> {syncResult.error}
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-2">
          <Button
            onClick={handleSync}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isLoading ? 'Synchronisation...' : 'Synchroniser les traductions'}
          </Button>
          
          <Badge variant="outline">
            Pages publiques
          </Badge>
        </div>

        <div className="text-xs text-gray-500">
          <p>
            <strong>Sections incluses :</strong> Navigation, Accueil, Fonctionnalités, 
            Artistes en vedette, Tarifs, Appel à l'action, Actions communes
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
