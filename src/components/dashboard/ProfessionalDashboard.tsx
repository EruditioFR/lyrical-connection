
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Eye,
  Crown,
  Settings,
  UserCheck,
  Star,
  Trophy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfessionalEvents } from '@/hooks/useEvents';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useMyCastings } from '@/hooks/useCastings';
import { EventPromotionManager } from '@/components/events/EventPromotionManager';
import operaDashboardHero from '@/assets/opera-dashboard-hero.jpg';
import ArtistsManagement from '@/components/professional/ArtistsManagement';

const ProfessionalDashboard = () => {
  const { data: events = [] } = useProfessionalEvents();
  const { data: analytics } = useAnalytics();
  const { castings = [] } = useMyCastings();

  // Statistiques rapides
  const publishedEvents = events.filter(e => e.status === 'published');
  const draftEvents = events.filter(e => e.status === 'draft');
  const promotedEvents = events.filter(e => e.is_featured);
  const totalApplications = events.reduce((sum, event) => sum + (event.applications_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Hero Banner avec image d'opéra */}
      <div 
        className="relative h-48 md:h-64 rounded-2xl overflow-hidden bg-gradient-to-r from-lyrical-900 to-gold-900"
        style={{
          backgroundImage: `url(${operaDashboardHero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
        <div className="relative h-full flex items-center justify-center text-center px-6">
          <div className="text-white">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold mb-2">
              Tableau de Bord Professionnel
            </h1>
            <p className="text-white/90 text-lg">
              Gérez vos événements et développez votre réseau artistique
            </p>
          </div>
        </div>
      </div>

      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Événements publiés</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedEvents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inscriptions totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Événements promus</CardTitle>
            <Star className="h-4 w-4 text-gold-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold-600">{promotedEvents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftEvents.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal avec onglets */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="events">Mes événements</TabsTrigger>
          <TabsTrigger value="artists">Gestion artistes</TabsTrigger>
          <TabsTrigger value="promotion">Promotion</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Événements récents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Événements récents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {events.length > 0 ? (
                  <div className="space-y-3">
                    {events.slice(0, 3).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{event.title}</span>
                            {event.is_featured && (
                              <Badge variant="secondary" className="bg-gold-100 text-gold-700">
                                <Star className="h-3 w-3 mr-1" />
                                Promu
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {event.applications_count || 0} inscription(s)
                          </div>
                        </div>
                        <Badge 
                          variant={event.status === 'published' ? 'default' : 'secondary'}
                        >
                          {event.status === 'published' ? 'Publié' : 'Brouillon'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun événement créé</p>
                    <Button asChild className="mt-4">
                      <Link to="/professional-events">Créer un événement</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link to="/professional-events">
                    <Calendar className="h-4 w-4 mr-2" />
                    Créer un événement
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/artistes">
                    <Users className="h-4 w-4 mr-2" />
                    Gérer les artistes
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/professional-messages">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/profile">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Mon profil
                  </Link>
                </Button>
                {castings.length > 0 && (
                  <Button asChild variant="outline" className="w-full justify-start bg-primary/5 border-primary/30 hover:bg-primary/10">
                    <Link to={`/concours/${castings[0].id}/synthese`}>
                      <Trophy className="h-4 w-4 mr-2 text-primary" />
                      Synthèse du concours
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Mes événements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Button asChild>
                  <Link to="/professional-events">Gérer mes événements</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artists">
          <ArtistsManagement />
        </TabsContent>

        <TabsContent value="promotion">
          <EventPromotionManager />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analytiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Analytiques détaillées bientôt disponibles</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfessionalDashboard;
