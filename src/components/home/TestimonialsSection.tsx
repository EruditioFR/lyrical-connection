import React from 'react';
import { Star, Quote } from 'lucide-react';
import { useAnimateOnScroll } from '@/hooks/useIntersectionObserver';

const testimonials = [
  {
    name: "Sophie Martineau",
    role: "Soprano • Opéra de Lyon",
    content: "Grâce à Lyrical Connection, j'ai décroché mon premier rôle principal. La plateforme m'a permis d'être visible auprès des directeurs artistiques et de présenter mon travail de manière professionnelle.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 5
  },
  {
    name: "Jean-Pierre Dubois",
    role: "Directeur Artistique • Opéra de Bordeaux",
    content: "Cette plateforme révolutionne notre façon de découvrir de nouveaux talents. En quelques clics, je peux écouter, voir et évaluer des centaines d'artistes. Un gain de temps incroyable !",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    rating: 5
  },
  {
    name: "Elena Rodriguez",
    role: "Mezzo-soprano • Artiste indépendante",
    content: "Les outils de Lyrical Connection m'ont aidée à structurer ma démarche artistique. Les statistiques me permettent de comprendre mon audience et d'adapter ma communication.",
    avatar: "https://images.unsplash.com/photo-1553267751-1c148a7280a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    rating: 5
  },
  {
    name: "Marc Lejeune",
    role: "Agent Artistique • ML Artist Management",
    content: "La qualité des profils sur Lyrical Connection est exceptionnelle. C'est devenu ma première source pour découvrir de nouveaux talents et développer mon réseau professionnel.",
    avatar: "https://images.unsplash.com/photo-1552642986-ccb41e7059e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    rating: 5
  }
];

const TestimonialsSection = () => {
  const headerRef = useAnimateOnScroll();
  const statsRef = useAnimateOnScroll();
  
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16 text-appear">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            Ils nous font confiance
          </h2>
          <p className="text-lg text-muted-foreground">
            Découvrez les témoignages d'artistes et de professionnels qui utilisent 
            Lyrical Connection pour développer leur carrière
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => {
            const TestimonialCard = () => {
              const cardRef = useAnimateOnScroll();
              return (
                <div 
                  ref={cardRef}
                  key={index}
                  className="bg-card rounded-xl p-8 border border-border shadow-sm hover:shadow-md transition-all duration-300 text-appear"
                >
              {/* Quote Icon */}
              <div className="mb-6">
                <Quote className="h-8 w-8 text-lyrical-300" />
              </div>

              {/* Content */}
              <p className="text-muted-foreground leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              {/* Rating */}
              <div className="flex items-center mb-6">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-gold-400 fill-current" />
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center space-x-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
                </div>
              );
            };
            return <TestimonialCard key={index} />;
          })}
        </div>

        {/* Stats Section */}
        <div ref={statsRef} className="mt-20 bg-gradient-to-r from-lyrical-50 to-gold-50 rounded-2xl p-12 text-appear">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-lyrical-700 mb-2">98%</div>
              <div className="text-sm text-muted-foreground">Satisfaction client</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-lyrical-700 mb-2">650+</div>
              <div className="text-sm text-muted-foreground">Utilisateurs actifs</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-lyrical-700 mb-2">200+</div>
              <div className="text-sm text-muted-foreground">Événements organisés</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-lyrical-700 mb-2">150+</div>
              <div className="text-sm text-muted-foreground">Connexions réussies</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;