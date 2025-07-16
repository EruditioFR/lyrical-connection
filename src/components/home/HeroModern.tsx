
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Music, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { useAnimateOnScroll } from '@/hooks/useIntersectionObserver';

const HeroModern = () => {
  const { t } = useTranslation('home');
  const leftContentRef = useAnimateOnScroll();
  const rightContentRef = useAnimateOnScroll();

  console.log('HeroModern rendered');
  
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-background via-muted/30 to-background overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-[url('/lovable-uploads/b68db290-37e4-4a2d-bfeb-ef949fb2dd4b.png')] bg-cover bg-center opacity-10"></div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-lyrical-50/50 via-transparent to-gold-50/30"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center min-h-screen">
          {/* Left Content */}
          <div ref={leftContentRef} className="lg:w-1/2 lg:pr-12 text-center lg:text-left text-appear pt-20">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6">
              Lyrisphere
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
              {t('hero.subtitle')}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" className="px-8 py-6 text-lg bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600 text-white shadow-lg" asChild>
                <Link to="/auth">
                  {t('hero.createProfile')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg border-2 hover:bg-muted" asChild>
                <Link to="/artistes">{t('hero.discoverArtists')}</Link>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-lyrical-700">500+</div>
                <div className="text-sm text-muted-foreground">{t('hero.stats.artists')}</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-lyrical-700">150+</div>
                <div className="text-sm text-muted-foreground">{t('hero.stats.professionals')}</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-lyrical-700">200+</div>
                <div className="text-sm text-muted-foreground">{t('hero.stats.events')}</div>
              </div>
            </div>
          </div>
          
          {/* Right Content */}
          <div ref={rightContentRef} className="lg:w-1/2 mt-12 lg:mt-0 text-appear pb-20">
            <div className="relative">
              {/* Main Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Performance d'opéra" className="w-full h-[500px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-lyrical-900/40 to-transparent">
                  <img alt="Intérieur d'opéra" className="w-full h-full object-cover opacity-80" src="/lovable-uploads/bc42b65f-33b1-4117-9ae5-5771d3bf8825.png" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroModern;
