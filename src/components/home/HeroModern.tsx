import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';
import { useAnimateOnScroll } from '@/hooks/useIntersectionObserver';
import { useArtists } from '@/hooks/useArtists';

const HeroModern = () => {
  const { t } = useTranslation('home');
  const leftContentRef = useAnimateOnScroll();
  // Vrais artistes de la plateforme plutôt qu'une image d'illustration
  const { artists } = useArtists({});
  const portraits = artists.filter(artist => artist.profile_image_url).slice(0, 4);

  return (
    <section className="relative min-h-[60vh] lg:min-h-[90vh] bg-gradient-to-br from-background via-muted/30 to-background overflow-hidden">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-lyrical-50/50 via-transparent to-gold-50/30"></div>
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center min-h-[60vh] lg:min-h-[90vh] py-12 lg:py-16">
          {/* Left Content */}
          <div ref={leftContentRef} className="lg:w-1/2 lg:pr-16 xl:pr-20 text-center lg:text-left text-appear">
            {/* Main Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold leading-tight mb-4 lg:mb-6 text-foreground">
              {t('hero.title')}
            </h1>
            
            {/* Clear Description */}
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-muted-foreground mb-6 lg:mb-8 max-w-md lg:max-w-lg xl:max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t('hero.subtitle')}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-8 lg:mb-12">
              <Button size="lg" className="px-6 lg:px-8 py-4 lg:py-6 text-base lg:text-lg bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600 text-white shadow-lg" asChild>
                <Link to="/auth">
                  {t('hero.createProfile')}
                  <ArrowRight className="ml-2 h-4 lg:h-5 w-4 lg:w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-6 lg:px-8 py-4 lg:py-6 text-base lg:text-lg border-2 hover:bg-muted" asChild>
                <Link to="/artistes">{t('hero.discoverArtists')}</Link>
              </Button>
            </div>
            
            {/* Tagline */}
            <p className="text-base lg:text-lg text-lyrical-600 font-medium max-w-md lg:max-w-lg mx-auto lg:mx-0 border-l-4 border-gold-400 pl-4 italic">
              {t('hero.tagline')}
            </p>
          </div>
          
          {/* Right Content */}
          {portraits.length > 0 && (
            <div className="lg:w-1/2 mt-8 lg:mt-0 w-full">
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                {portraits.map(artist => (
                  <Link
                    key={artist.id}
                    to={`/artistes/${artist.id}`}
                    className="group relative block aspect-[3/4] overflow-hidden rounded-lg"
                  >
                    <img
                      src={artist.profile_image_url as string}
                      alt={artist.stage_name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
                      <p className="font-serif text-base lg:text-lg leading-tight">{artist.stage_name}</p>
                      {artist.voice_type && <p className="text-xs lg:text-sm opacity-90">{artist.voice_type}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroModern;