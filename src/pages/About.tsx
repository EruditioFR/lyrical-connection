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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Qui sommes-nous ?
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Lyrical est la plateforme de référence qui connecte les artistes lyriques 
            et les professionnels du secteur musical classique.
          </p>
        </div>

        {/* Mission */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Target className="w-6 h-6 text-lyrical-600" />
              Notre Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
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
              <Music className="w-6 h-6 text-lyrical-600" />
              Nos Objectifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-lyrical-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Faciliter les connexions
                </h3>
                <p className="text-gray-700">
                  Mettre en relation directe les artistes lyriques avec les directeurs 
                  de casting, maisons d'opéra, et autres professionnels du secteur.
                </p>
              </div>
              
              <div className="border-l-4 border-lyrical-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Valoriser les talents
                </h3>
                <p className="text-gray-700">
                  Offrir aux artistes une vitrine professionnelle pour présenter 
                  leur répertoire, leurs expériences et leurs enregistrements.
                </p>
              </div>
              
              <div className="border-l-4 border-lyrical-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Moderniser le recrutement
                </h3>
                <p className="text-gray-700">
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
              <Users className="w-6 h-6 text-lyrical-600" />
              Notre Équipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-6">
              Lyrical a été fondée par une équipe passionnée d'entrepreneurs et de 
              professionnels du secteur musical, unis par la conviction que la technologie 
              peut transformer positivement l'industrie de l'art lyrique.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-lyrical-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-lyrical-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Expertise Artistique
                </h3>
                <p className="text-gray-600 text-sm">
                  Des professionnels issus du monde de l'opéra et de la musique classique 
                  qui comprennent les enjeux du secteur.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-lyrical-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-lyrical-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Innovation Technologique
                </h3>
                <p className="text-gray-600 text-sm">
                  Une équipe technique experte dans le développement de solutions 
                  numériques sur mesure pour les arts.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vision */}
        <div className="text-center bg-lyrical-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Notre Vision
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
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