import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Heart, Music } from 'lucide-react';

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Qui sommes-nous ?
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Lyrical est la plateforme de référence qui connecte les artistes lyriques 
            et les professionnels du secteur musical classique.
          </p>
        </div>

        {/* Mission */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Target className="w-6 h-6 text-primary" />
              Notre Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">
              Nous croyons que chaque voix mérite d'être entendue et que chaque talent 
              doit avoir l'opportunité de s'épanouir. Notre mission est de démocratiser 
              l'accès aux opportunités dans le monde de l'art lyrique en créant un pont 
              entre les artistes passionnés et les professionnels à la recherche de nouveaux talents.
            </p>
          </CardContent>
        </Card>

        {/* Objectifs */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Music className="w-6 h-6 text-primary" />
              Nos Objectifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold text-foreground mb-2">
                  Faciliter les connexions
                </h3>
                <p className="text-muted-foreground">
                  Mettre en relation directe les artistes lyriques avec les directeurs 
                  de casting, maisons d'opéra, et autres professionnels du secteur.
                </p>
              </div>
              
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold text-foreground mb-2">
                  Valoriser les talents
                </h3>
                <p className="text-muted-foreground">
                  Offrir aux artistes une vitrine professionnelle pour présenter 
                  leur répertoire, leurs expériences et leurs enregistrements.
                </p>
              </div>
              
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold text-foreground mb-2">
                  Moderniser le recrutement
                </h3>
                <p className="text-muted-foreground">
                  Simplifier les processus de casting et de recrutement grâce 
                  à des outils numériques innovants et intuitifs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Équipe */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              Notre Équipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed mb-6">
              Lyrical a été fondée par une équipe passionnée d'entrepreneurs et de 
              professionnels du secteur musical, unis par la conviction que la technologie 
              peut transformer positivement l'industrie de l'art lyrique.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Expertise Artistique
                </h3>
                <p className="text-muted-foreground text-sm">
                  Des professionnels issus du monde de l'opéra et de la musique classique 
                  qui comprennent les enjeux du secteur.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Innovation Technologique
                </h3>
                <p className="text-muted-foreground text-sm">
                  Une équipe technique experte dans le développement de solutions 
                  numériques sur mesure pour les arts.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vision */}
        <div className="text-center bg-muted/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Notre Vision
          </h2>
          <p className="text-lg text-foreground leading-relaxed">
            Devenir la référence mondiale pour les professionnels de l'art lyrique, 
            en créant un écosystème numérique qui favorise la découverte de nouveaux talents 
            et facilite la création de collaborations artistiques exceptionnelles.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default About;