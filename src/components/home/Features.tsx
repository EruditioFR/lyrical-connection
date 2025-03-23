
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  Music, 
  Users, 
  Calendar, 
  Search, 
  LineChart, 
  Globe, 
  Bell, 
  CreditCard 
} from 'lucide-react';

const Features = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 text-appear">
          <h2 className="text-3xl md:text-4xl font-serif font-bold">
            Une plateforme complète dédiée à la musique lyrique
          </h2>
          <p className="text-muted-foreground mt-4">
            Découvrez comment Lyrical Connection peut vous aider à mettre en valeur votre talent
            ou à découvrir les artistes de demain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {/* Profil Artiste */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-all duration-300 text-appear">
            <div className="bg-lyrical-100 text-lyrical-700 p-3 rounded-full w-12 h-12 mb-5 flex items-center justify-center">
              <Music className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-serif font-semibold mb-3">Profil Artiste</h3>
            <p className="text-muted-foreground mb-4">
              Créez votre mini-site personnel avec intégration audio, vidéo et gestion de votre agenda.
            </p>
            <Button variant="link" className="p-0" asChild>
              <Link to="/artistes/creer">En savoir plus</Link>
            </Button>
          </div>

          {/* Plateforme Pro */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-all duration-300 text-appear" style={{ animationDelay: '100ms' }}>
            <div className="bg-lyrical-100 text-lyrical-700 p-3 rounded-full w-12 h-12 mb-5 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-serif font-semibold mb-3">Espace Pro</h3>
            <p className="text-muted-foreground mb-4">
              Accédez à des outils avancés pour découvrir et contacter les artistes qui correspondent à vos besoins.
            </p>
            <Button variant="link" className="p-0" asChild>
              <Link to="/pro">En savoir plus</Link>
            </Button>
          </div>

          {/* Événements */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-all duration-300 text-appear" style={{ animationDelay: '200ms' }}>
            <div className="bg-lyrical-100 text-lyrical-700 p-3 rounded-full w-12 h-12 mb-5 flex items-center justify-center">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-serif font-semibold mb-3">Événements</h3>
            <p className="text-muted-foreground mb-4">
              Créez et gérez des événements professionnels ou artistiques avec gestion des inscriptions.
            </p>
            <Button variant="link" className="p-0" asChild>
              <Link to="/evenements/creer">En savoir plus</Link>
            </Button>
          </div>

          {/* Recherche avancée */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-all duration-300 text-appear" style={{ animationDelay: '300ms' }}>
            <div className="bg-lyrical-100 text-lyrical-700 p-3 rounded-full w-12 h-12 mb-5 flex items-center justify-center">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-serif font-semibold mb-3">Recherche avancée</h3>
            <p className="text-muted-foreground mb-4">
              Filtrez par type de voix, répertoire, expérience, localisation et bien d'autres critères.
            </p>
            <Button variant="link" className="p-0" asChild>
              <Link to="/recherche">En savoir plus</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 md:mt-24">
          <div className="bg-card rounded-xl overflow-hidden border border-border shadow-md text-appear">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h3 className="text-2xl md:text-3xl font-serif font-bold mb-4">
                  Des fonctionnalités premium pour tous les utilisateurs
                </h3>
                <p className="text-muted-foreground mb-6">
                  Lyrical Connection offre une gamme complète d'outils pour aider les artistes à se démarquer et les professionnels à trouver des talents.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-start space-x-3">
                    <LineChart className="h-5 w-5 text-lyrical-700 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Statistiques détaillées</h4>
                      <p className="text-sm text-muted-foreground">Suivez votre progression et votre audience</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Globe className="h-5 w-5 text-lyrical-700 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Partage optimisé</h4>
                      <p className="text-sm text-muted-foreground">Intégration avec les réseaux sociaux</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Bell className="h-5 w-5 text-lyrical-700 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Notifications</h4>
                      <p className="text-sm text-muted-foreground">Restez informé des opportunités</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CreditCard className="h-5 w-5 text-lyrical-700 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Abonnements flexibles</h4>
                      <p className="text-sm text-muted-foreground">Des formules adaptées à vos besoins</p>
                    </div>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600 text-white md:w-fit" asChild>
                  <Link to="/abonnements">Découvrir nos abonnements</Link>
                </Button>
              </div>
              <div className="relative h-80 lg:h-auto overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1507901747481-84a4f64ffd7d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                  alt="Premium Features" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-lyrical-950/40 to-gold-950/40"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
