
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';
import { useAnimateOnScroll } from '@/hooks/useIntersectionObserver';

const CtaSection = () => {
  const { t } = useTranslation('home');
  const contentRef = useAnimateOnScroll();
  
  return (
    <section className="bg-gradient-to-r from-lyrical-900 to-gold-900 text-white py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div ref={contentRef} className="max-w-5xl mx-auto text-center space-y-6 text-appear">
          <h2 className="text-3xl md:text-4xl font-serif font-bold">{t('cta.title')}</h2>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Button className="w-full sm:w-auto px-8 py-6 text-lg bg-white hover:bg-white/90 text-lyrical-900" asChild>
              <Link to="/inscription">
                {t('cta.createAccount')}
              </Link>
            </Button>
            <Button variant="outline" className="w-full sm:w-auto px-8 py-6 text-lg border-white text-white hover:bg-white/10" asChild>
              <Link to="/abonnements">
                {t('cta.viewPlans')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
