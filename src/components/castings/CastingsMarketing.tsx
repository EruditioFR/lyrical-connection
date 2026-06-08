
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Star, 
  Users, 
  Search, 
  MessageSquare, 
  Award, 
  Clock,
  MapPin,
  Euro,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const CastingsMarketing = () => {
  const features = [
    {
      icon: Star,
      title: "Opportunités Premium",
      description: "Accédez aux meilleurs castings d'opéra, théâtre musical et spectacles lyriques"
    },
    {
      icon: Search,
      title: "Recherche Ciblée",
      description: "Filtrez par tessiture, expérience, localisation et type de production"
    },
    {
      icon: Users,
      title: "Réseau Professionnel",
      description: "Connectez-vous avec directeurs artistiques, metteurs en scène et producteurs"
    },
    {
      icon: MessageSquare,
      title: "Communication Directe",
      description: "Échangez directement avec les professionnels du secteur"
    },
    {
      icon: Award,
      title: "Candidatures Simplifiées",
      description: "Postulez en quelques clics avec votre profil artistique complet"
    },
    {
      icon: Clock,
      title: "Notifications en Temps Réel",
      description: "Soyez alerté des nouvelles opportunités correspondant à votre profil"
    }
  ];

  const mockCastings = [
    {
      title: "Carmen - Rôle Titre",
      company: "Opéra National de Paris",
      location: "Paris, France",
      type: "Opéra",
      tessiture: "Mezzo-soprano",
      compensation: "Rémunéré",
      deadline: "15 jours restants"
    },
    {
      title: "Les Misérables - Éponine",
      company: "Théâtre du Châtelet",
      location: "Paris, France", 
      type: "Comédie musicale",
      tessiture: "Soprano",
      compensation: "Rémunéré",
      deadline: "8 jours restants"
    },
    {
      title: "Don Giovanni - Leporello",
      company: "Festival d'Aix-en-Provence",
      location: "Aix-en-Provence, France",
      type: "Opéra",
      tessiture: "Basse",
      compensation: "Rémunéré",
      deadline: "22 jours restants"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Votre Carrière Lyrique
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Commence Ici
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Découvrez les meilleures opportunités de castings dans l'univers de l'opéra, 
              du théâtre musical et des spectacles lyriques. Connectez-vous avec les professionnels 
              et donnez vie à vos ambitions artistiques.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/auth">
                  Rejoindre la communauté
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8">
                En savoir plus
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Pourquoi Choisir Notre Plateforme ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Des outils professionnels pour artistes lyriques ambitieux
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
            {features.map((feature, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow text-center w-full">
                <CardHeader className="items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mock Castings Preview */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Castings Actuels
            </h2>
            <p className="text-lg text-muted-foreground">
              Aperçu des opportunités disponibles pour nos membres
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {mockCastings.map((casting, index) => (
              <Card key={index} className="border-border">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg">{casting.title}</CardTitle>
                    <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                      {casting.type}
                    </span>
                  </div>
                  <CardDescription className="font-medium">
                    {casting.company}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {casting.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    {casting.tessiture}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Euro className="h-4 w-4 mr-2" />
                    {casting.compensation}
                  </div>
                  <div className="flex items-center text-sm text-primary font-medium">
                    <Clock className="h-4 w-4 mr-2" />
                    {casting.deadline}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <div className="bg-card border border-border rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-4">Voir tous les castings</h3>
              <p className="text-muted-foreground mb-6">
                Inscrivez-vous pour accéder à l'ensemble des castings actifs
              </p>
              <Button asChild className="w-full">
                <Link to="/auth">
                  Créer mon compte gratuitement
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Comment Ça Fonctionne ?
            </h2>
            <p className="text-lg text-muted-foreground">
              En 3 étapes simples vers votre prochaine opportunité
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Créez votre profil</h3>
              <p className="text-muted-foreground">
                Complétez votre profil artistique avec votre répertoire, 
                photos et enregistrements audio
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Explorez les castings</h3>
              <p className="text-muted-foreground">
                Découvrez les opportunités qui correspondent à votre profil 
                grâce à nos filtres intelligents
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Postulez en un clic</h3>
              <p className="text-muted-foreground">
                Envoyez votre candidature directement aux directeurs de casting 
                et suivez son évolution
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              Prêt à Donner Vie à Vos Ambitions ?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Rejoignez plus de 1000 artistes lyriques qui font confiance à notre plateforme 
              pour développer leur carrière.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg" 
                variant="secondary"
                className="text-lg px-8"
              >
                <Link to="/auth">
                  Commencer maintenant - C'est gratuit
                </Link>
              </Button>
            </div>
            <div className="flex items-center justify-center mt-6 text-primary-foreground/80">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Inscription gratuite • Sans engagement</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CastingsMarketing;
