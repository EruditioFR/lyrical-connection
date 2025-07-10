import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  Mic, 
  Users, 
  ArrowRight, 
  Music, 
  Calendar, 
  Search, 
  MessageSquare,
  BarChart3,
  Settings
} from 'lucide-react';

const PortalsSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            Deux univers, une passion commune
          </h2>
          <p className="text-lg text-muted-foreground">
            Que vous soyez artiste ou professionnel, accédez à votre espace dédié 
            avec des outils adaptés à vos besoins spécifiques
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Portail Artistes */}
          <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
            {/* Header Card */}
            <div className="bg-gradient-to-br from-lyrical-600 to-lyrical-700 p-8 text-white">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Mic className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold">Portail Artistes</h3>
                  <p className="text-white/80">Développez votre carrière lyrique</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-muted-foreground mb-8">
                Créez votre profil professionnel, partagez votre talent et connectez-vous 
                avec les professionnels du milieu lyrique.
              </p>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="bg-lyrical-100 p-2 rounded-lg">
                    <Music className="h-4 w-4 text-lyrical-700" />
                  </div>
                  <span className="text-sm">Profil artistique avec audio/vidéo</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-lyrical-100 p-2 rounded-lg">
                    <Calendar className="h-4 w-4 text-lyrical-700" />
                  </div>
                  <span className="text-sm">Gestion d'agenda et candidatures</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-lyrical-100 p-2 rounded-lg">
                    <BarChart3 className="h-4 w-4 text-lyrical-700" />
                  </div>
                  <span className="text-sm">Statistiques et suivi de performance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-lyrical-100 p-2 rounded-lg">
                    <MessageSquare className="h-4 w-4 text-lyrical-700" />
                  </div>
                  <span className="text-sm">Communication directe avec les pros</span>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-4">
                <Button 
                  className="w-full bg-gradient-to-r from-lyrical-600 to-lyrical-700 hover:from-lyrical-700 hover:to-lyrical-800 text-white"
                  asChild
                >
                  <Link to="/auth">
                    Créer mon profil artiste
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-lyrical-200 hover:bg-lyrical-50"
                  asChild
                >
                  <Link to="/artistes">Découvrir les artistes</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Portail Professionnels */}
          <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '200ms' }}>
            {/* Header Card */}
            <div className="bg-gradient-to-br from-gold-500 to-gold-600 p-8 text-white">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold">Portail Professionnels</h3>
                  <p className="text-white/80">Trouvez les talents de demain</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-muted-foreground mb-8">
                Accédez à une base de données exclusive d'artistes lyriques et gérez 
                vos projets artistiques avec des outils professionnels.
              </p>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="bg-gold-100 p-2 rounded-lg">
                    <Search className="h-4 w-4 text-gold-700" />
                  </div>
                  <span className="text-sm">Recherche avancée dans la base d'artistes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-gold-100 p-2 rounded-lg">
                    <Calendar className="h-4 w-4 text-gold-700" />
                  </div>
                  <span className="text-sm">Création et gestion d'événements</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-gold-100 p-2 rounded-lg">
                    <Settings className="h-4 w-4 text-gold-700" />
                  </div>
                  <span className="text-sm">Outils de casting et de sélection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-gold-100 p-2 rounded-lg">
                    <BarChart3 className="h-4 w-4 text-gold-700" />
                  </div>
                  <span className="text-sm">Tableau de bord et analytics</span>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-4">
                <Button 
                  className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
                  asChild
                >
                  <Link to="/auth">
                    Accéder à l'espace pro
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-gold-200 hover:bg-gold-50"
                  asChild
                >
                  <Link to="/evenements">Voir les événements</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="bg-card rounded-xl border p-8 max-w-4xl mx-auto">
            <h3 className="text-xl font-serif font-semibold mb-4">
              Vous ne savez pas par où commencer ?
            </h3>
            <p className="text-muted-foreground mb-6">
              Notre équipe est là pour vous accompagner dans la découverte de la plateforme 
              et vous aider à tirer le meilleur parti de nos outils.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link to="/contact">Nous contacter</Link>
              </Button>
              <Button variant="link" asChild>
                <Link to="/guide">Guide de démarrage</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PortalsSection;