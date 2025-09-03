import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnimateOnScroll } from '@/hooks/useIntersectionObserver';
import { Music, Users, Calendar, Search, MessageSquare, Trophy, BarChart3, Settings, Mic, Globe, Heart, Zap, Star, CheckCircle, X, Crown, Shield, Video, Mail, Bell, CreditCard, Languages, Database, FileText } from 'lucide-react';
const Features = () => {
  const heroRef = useAnimateOnScroll();
  const artistsRef = useAnimateOnScroll();
  const professionalsRef = useAnimateOnScroll();
  const eventsRef = useAnimateOnScroll();
  const communicationRef = useAnimateOnScroll();
  const subscriptionRef = useAnimateOnScroll();
  const comparisonRef = useAnimateOnScroll();
  const artistFeatures = [{
    icon: Music,
    title: "Profil Artistique Complet",
    description: "Créez votre vitrine avec photos HD, vidéos, extraits audio et répertoire détaillé",
    highlight: "Illimité"
  }, {
    icon: Trophy,
    title: "Candidatures Simplifiées",
    description: "Postulez aux auditions et concours en un clic avec votre profil pré-rempli",
    highlight: "1 clic"
  }, {
    icon: BarChart3,
    title: "Statistiques Avancées",
    description: "Suivez les visites, l'engagement et l'évolution de votre carrière",
    highlight: "Analytics pro"
  }, {
    icon: Calendar,
    title: "Agenda Intégré",
    description: "Gérez vos auditions, concerts et disponibilités en temps réel",
    highlight: "Sync calendar"
  }];
  const professionalFeatures = [{
    icon: Database,
    title: "Base de Données Premium",
    description: "Plus de 500 profils d'artistes vérifiés avec filtres avancés",
    highlight: "500+ artistes"
  }, {
    icon: Search,
    title: "Recherche IA",
    description: "Trouvez l'artiste parfait par tessiture, répertoire et disponibilité",
    highlight: "Powered by AI"
  }, {
    icon: Settings,
    title: "Outils de Casting",
    description: "Créez des appels personnalisés et gérez les candidatures efficacement",
    highlight: "Workflow optimisé"
  }, {
    icon: BarChart3,
    title: "Dashboard Avancé",
    description: "Analytics complets sur vos recrutements et performances",
    highlight: "Insights pro"
  }];
  const platformFeatures = [{
    icon: Calendar,
    title: "Événements & Masterclass",
    description: "Organisez et participez à des formations, masterclasses et auditions",
    category: "Événements"
  }, {
    icon: Video,
    title: "Diffusion Live",
    description: "Diffusez vos événements en direct et enregistrez-les pour plus tard",
    category: "Événements"
  }, {
    icon: MessageSquare,
    title: "Messagerie Temps Réel",
    description: "Communication instantanée entre artistes et professionnels",
    category: "Communication"
  }, {
    icon: Bell,
    title: "Notifications Smart",
    description: "Alertes personnalisées pour les nouvelles opportunités et messages",
    category: "Communication"
  }, {
    icon: CreditCard,
    title: "Paiements Sécurisés",
    description: "Transactions sécurisées avec Stripe pour les inscriptions payantes",
    category: "Monétisation"
  }, {
    icon: Languages,
    title: "Multi-langues",
    description: "Interface disponible en français, anglais, italien et allemand",
    category: "International"
  }];
  const comparisonData = [{
    feature: "Profil artiste complet",
    free: true,
    pro: true
  }, {
    feature: "Candidatures aux castings",
    free: "5/mois",
    pro: "Illimitées"
  }, {
    feature: "Messages",
    free: "10/mois",
    pro: "Illimitées"
  }, {
    feature: "Recherche avancée",
    free: false,
    pro: true
  }, {
    feature: "Analytics détaillées",
    free: false,
    pro: true
  }, {
    feature: "Événements payants",
    free: false,
    pro: true
  }, {
    feature: "Support prioritaire",
    free: false,
    pro: true
  }, {
    feature: "Badge professionnel",
    free: false,
    pro: true
  }];
  return <Layout>
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-lyrical-50 to-gold-50">
        <div className="container mx-auto px-4 md:px-6">
          <div ref={heroRef} className="text-center max-w-4xl mx-auto text-appear">
            <Badge className="mb-6 bg-lyrical-100 text-lyrical-700 border-lyrical-200">
              Plateforme complète
            </Badge>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 bg-gradient-to-r from-lyrical-900 to-gold-800 bg-clip-text text-transparent">
              Toutes les fonctionnalités pour réussir dans le lyrique
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Découvrez comment Lyrisphere révolutionne les relations entre artistes 
              et professionnels avec des outils innovants et une technologie de pointe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600" asChild>
                <Link to="/auth">Commencer gratuitement</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/pricing">Voir les tarifs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Artists Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div ref={artistsRef} className="text-center mb-16 text-appear">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="bg-lyrical-100 p-3 rounded-xl">
                <Mic className="h-8 w-8 text-lyrical-700" />
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold">Pour les Artistes</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Des outils professionnels pour développer votre carrière et maximiser votre visibilité
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {artistFeatures.map((feature, index) => <Card key={index} className="border-lyrical-100 hover:border-lyrical-200 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="bg-lyrical-100 p-3 rounded-xl">
                      <feature.icon className="h-6 w-6 text-lyrical-700" />
                    </div>
                    <Badge variant="secondary">{feature.highlight}</Badge>
                  </div>
                  <CardTitle className="font-serif">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Professionals Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div ref={professionalsRef} className="text-center mb-16 text-appear">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="bg-gold-100 p-3 rounded-xl">
                <Globe className="h-8 w-8 text-gold-700" />
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold">Pour les Professionnels</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Outils avancés de recrutement et gestion pour trouver les talents parfaits
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {professionalFeatures.map((feature, index) => <Card key={index} className="border-gold-100 hover:border-gold-200 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="bg-gold-100 p-3 rounded-xl">
                      <feature.icon className="h-6 w-6 text-gold-700" />
                    </div>
                    <Badge variant="secondary">{feature.highlight}</Badge>
                  </div>
                  <CardTitle className="font-serif">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div ref={eventsRef} className="text-center mb-16 text-appear">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Fonctionnalités de la Plateforme</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Un écosystème complet pour tous vos besoins professionnels
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformFeatures.map((feature, index) => <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {feature.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-serif">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm">{feature.description}</CardDescription>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-muted/30">
        
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-lyrical-900 to-gold-900 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            Prêt à développer votre carrière lyrique ?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Rejoignez plus de 650 artistes et professionnels qui font confiance à Lyrisphere
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white hover:bg-white/90 text-lyrical-900" asChild>
              <Link to="/auth">Commencer gratuitement</Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10" asChild>
              <Link to="/contact">Nous contacter</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>;
};
export default Features;