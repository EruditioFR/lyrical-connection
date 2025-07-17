
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  MapPin, 
  Target, 
  CheckCircle, 
  Users,
  Award,
  BookOpen,
  MessageCircle,
  Music,
  Briefcase
} from 'lucide-react';

const ProfessionalsMarketing = () => {
  // Professionnels d'exemple pour la démonstration
  const mockProfessionals = [
    {
      id: 1,
      name: "Académie Lyrique Parisienne",
      role: "Coach vocal",
      location: "Paris, France",
      experience: "15+ ans",
      specialties: ["Opéra", "Oratorio", "Mélodie française"],
      verified: true
    },
    {
      id: 2,
      name: "Giuseppe Maestroni",
      role: "Directeur artistique",
      location: "Lyon, France",
      experience: "20+ ans",
      specialties: ["Mise en scène", "Direction artistique", "Coaching"],
      verified: true
    },
    {
      id: 3,
      name: "Studio Bellacanto",
      role: "Accompagnateur",
      location: "Marseille, France",
      experience: "10+ ans",
      specialties: ["Piano", "Préparation concours", "Récitals"],
      verified: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            Professionnels du Chant Lyrique
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Découvrez les meilleurs coaches vocaux, directeurs artistiques et accompagnateurs pour développer votre art
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/auth">
                Rejoindre la plateforme
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/pricing">
                Voir les tarifs
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Professionnels d'exemple */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">
            Nos professionnels partenaires
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockProfessionals.map((prof) => (
              <Card key={prof.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{prof.name}</CardTitle>
                      <Badge variant="secondary">{prof.role}</Badge>
                    </div>
                    {prof.verified && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Vérifié
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {prof.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Award className="w-4 h-4 mr-2" />
                    {prof.experience} d'expérience
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {prof.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <Button size="sm" variant="outline" disabled>
                      Voir le profil
                    </Button>
                    <Button size="sm" disabled>
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Contacter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Types de professionnels */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">
            Trouvez le professionnel qu'il vous faut
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 border rounded-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Coaches Vocaux</h3>
              <p className="text-muted-foreground mb-4">
                Perfectionnez votre technique vocale avec des professeurs expérimentés
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Technique respiratoire</li>
                <li>• Travail vocal personnalisé</li>
                <li>• Préparation d'auditions</li>
              </ul>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Directeurs Artistiques</h3>
              <p className="text-muted-foreground mb-4">
                Bénéficiez de l'expertise de directeurs d'opéra reconnus
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Interprétation scénique</li>
                <li>• Préparation de rôles</li>
                <li>• Coaching artistique</li>
              </ul>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Accompagnateurs</h3>
              <p className="text-muted-foreground mb-4">
                Travaillez avec des pianistes spécialisés dans le répertoire lyrique
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Accompagnement piano</li>
                <li>• Préparation de récitals</li>
                <li>• Coaching musical</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">
            Pourquoi choisir nos professionnels ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Professionnels vérifiés</h3>
                  <p className="text-muted-foreground">Tous nos partenaires sont sélectionnés et vérifiés pour leur expertise</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Recherche personnalisée</h3>
                  <p className="text-muted-foreground">Trouvez le professionnel idéal selon vos besoins et votre localisation</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Communication directe</h3>
                  <p className="text-muted-foreground">Échangez directement avec les professionnels via notre messagerie</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-serif font-bold mb-4">Rejoignez notre réseau</h3>
              <p className="text-muted-foreground mb-6">
                Accédez à notre réseau exclusif de professionnels du chant lyrique et développez votre carrière artistique.
              </p>
              <Button asChild className="w-full">
                <Link to="/auth">
                  Créer mon compte
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfessionalsMarketing;
