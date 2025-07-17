
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MapPin, 
  Music, 
  Star,
  Award,
  Globe,
  Heart,
  Search,
  MessageCircle,
  Mic,
  User
} from 'lucide-react';

const ArtistsMarketing = () => {
  // Artistes d'exemple pour la démonstration
  const mockArtists = [
    {
      id: 1,
      name: "Elena Soprano",
      voiceType: "Soprano colorature",
      location: "Paris, France",
      experience: "8 ans",
      repertoire: ["Mozart", "Rossini", "Bellini"],
      languages: ["Français", "Italien", "Allemand"]
    },
    {
      id: 2,
      name: "Marco Baritone",
      voiceType: "Baryton-basse",
      location: "Lyon, France", 
      experience: "12 ans",
      repertoire: ["Verdi", "Puccini", "Wagner"],
      languages: ["Français", "Italien", "Russe"]
    },
    {
      id: 3,
      name: "Sophie Mezzo",
      voiceType: "Mezzo-soprano",
      location: "Marseille, France",
      experience: "6 ans",
      repertoire: ["Bizet", "Massenet", "Ravel"],
      languages: ["Français", "Espagnol", "Anglais"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            Artistes Lyriques
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Découvrez une communauté exceptionnelle d'artistes lyriques talentueux du monde entier
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/auth">
                Rejoindre la communauté
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/about">
                En savoir plus
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Artistes d'exemple */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">
            Nos artistes membres
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockArtists.map((artist) => (
              <Card key={artist.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{artist.name}</CardTitle>
                      <Badge variant="secondary">{artist.voiceType}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {artist.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Award className="w-4 h-4 mr-2" />
                    {artist.experience} d'expérience
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">Répertoire :</p>
                    <div className="flex flex-wrap gap-1">
                      {artist.repertoire.map((comp, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {comp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">Langues :</p>
                    <div className="flex flex-wrap gap-1">
                      {artist.languages.map((lang, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
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

      {/* Fonctionnalités */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">
            Que trouve-t-on dans notre communauté ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Diversité des talents</h3>
              <p className="text-muted-foreground">
                Tous types de voix, du soprano colorature à la basse profonde
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Portée internationale</h3>
              <p className="text-muted-foreground">
                Artistes du monde entier maîtrisant différentes langues
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Répertoire étendu</h3>
              <p className="text-muted-foreground">
                De l'opéra baroque au contemporain, tous styles confondus
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tous niveaux</h3>
              <p className="text-muted-foreground">
                Des étudiants prometteuses aux artistes confirmés
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recherche d'artistes */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-serif font-bold">
                Trouvez l'artiste parfait pour votre projet
              </h2>
              <p className="text-lg text-muted-foreground">
                Notre système de recherche avancé vous permet de filtrer par type de voix, 
                répertoire, expérience et localisation pour trouver exactement ce que vous cherchez.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Search className="w-5 h-5 text-primary" />
                  <span>Recherche par critères multiples</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mic className="w-5 h-5 text-primary" />
                  <span>Filtres par type de voix et tessiture</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Music className="w-5 h-5 text-primary" />
                  <span>Tri par répertoire et compositeurs</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>Localisation géographique</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-serif font-bold mb-4">Professionnels</h3>
              <p className="text-muted-foreground mb-6">
                Vous êtes directeur artistique, coach vocal ou organisateur d'événements ? 
                Accédez à notre base de données complète d'artistes lyriques.
              </p>
              <Button asChild className="w-full mb-4">
                <Link to="/auth">
                  Accéder à la recherche
                </Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                <Link to="/pricing" className="underline">Voir nos offres professionnelles</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pour les artistes */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-serif font-bold mb-8">
            Vous êtes artiste lyrique ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Rejoignez notre communauté et donnez de la visibilité à votre talent. 
            Créez votre profil, partagez votre répertoire et connectez-vous avec des professionnels.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Profil complet</h3>
              <p className="text-sm text-muted-foreground">
                Présentez votre parcours, répertoire et expériences
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Réseau professionnel</h3>
              <p className="text-sm text-muted-foreground">
                Connectez-vous avec directeurs artistiques et coachs
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Opportunités</h3>
              <p className="text-sm text-muted-foreground">
                Recevez des invitations à auditions et castings
              </p>
            </div>
          </div>
          <Button asChild size="lg">
            <Link to="/auth">
              Créer mon profil d'artiste
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ArtistsMarketing;
