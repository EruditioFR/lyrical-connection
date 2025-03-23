
import React from 'react';
import { Quote } from 'lucide-react';

// Données exemple pour les témoignages
const testimonials = [
  {
    id: '1',
    name: 'Sophie Dupont',
    role: 'Soprano',
    quote: 'Grâce à Lyrical Connection, j\'ai pu me connecter avec des professionnels de renom et ma carrière a pris un véritable essor.',
    image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
  },
  {
    id: '2',
    name: 'Jean Martin',
    role: 'Directeur artistique, Opéra de Lyon',
    quote: 'Cette plateforme est devenue un outil indispensable pour découvrir les talents émergents. La qualité des profils et des médias est exceptionnelle.',
    image: 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
  },
  {
    id: '3',
    name: 'Isabelle Roche',
    role: 'Mezzo-soprano',
    quote: 'Les outils statistiques et le design professionnel de mon profil m\'ont permis de montrer mon travail sous son meilleur jour.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=922&q=80'
  }
];

const Testimonials = () => {
  return (
    <section className="bg-gradient-to-b from-muted/50 to-muted py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 text-appear">
          <h2 className="text-3xl md:text-4xl font-serif font-bold">
            Ce qu'ils disent de nous
          </h2>
          <p className="text-muted-foreground mt-4">
            Des artistes et professionnels qui ont transformé leur expérience grâce à Lyrical Connection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id}
              className={`bg-card rounded-xl p-6 shadow-sm border border-border/50 text-appear`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-6">
                <Quote className="h-10 w-10 text-gold-400 opacity-50" />
              </div>
              <blockquote className="mb-6 italic text-muted-foreground">
                "{testimonial.quote}"
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
