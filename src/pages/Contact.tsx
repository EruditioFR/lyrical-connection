
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { EditorialList, Eyebrow } from '@/components/editorial/Editorial';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Veuillez entrer une adresse email valide'),
  subject: z.string().min(5, 'Le sujet doit contenir au moins 5 caractères'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: data,
      });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      reset();
      toast({
        title: "Message envoyé !",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });
    } catch (error) {
      console.error('Error sending contact email:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mb-12">
            <Eyebrow className="mb-4">Contact</Eyebrow>
            <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-6">Écrivez-nous</h1>
            <p className="text-xl text-muted-foreground">
              Une question, une suggestion ou besoin d'aide ? Nous vous répondons par e-mail.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Coordonnées */}
            <dl className="lg:col-span-1 divide-y divide-border border-y border-border self-start">
              <div className="py-4">
                <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-1">Par e-mail</dt>
                <dd><a href="mailto:contact@lyrisphere.com" className="font-medium underline underline-offset-4">contact@lyrisphere.com</a></dd>
              </div>
              <div className="py-4">
                <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-1">Siège</dt>
                <dd className="font-medium">Paris, France</dd>
              </div>
              <div className="py-4">
                <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-1">Assistance</dt>
                <dd className="font-medium">Du lundi au vendredi, 9 h – 18 h</dd>
              </div>
            </dl>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div>
                <h2 className="text-2xl font-serif mb-2">Envoyer un message</h2>
                <p className="text-muted-foreground mb-6">Nous vous répondons à l'adresse indiquée.</p>
                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-success mb-2">
                        Message envoyé avec succès !
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais.
                      </p>
                      <Button
                        onClick={() => setIsSubmitted(false)}
                        variant="outline"
                        
                      >
                        Envoyer un autre message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nom complet *</Label>
                          <Input
                            id="name"
                            {...register('name')}
                            placeholder="Votre nom"
                            className={errors.name ? 'border-destructive' : ''}
                          />
                          {errors.name && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {errors.name.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            {...register('email')}
                            placeholder="votre@email.com"
                            className={errors.email ? 'border-destructive' : ''}
                          />
                          {errors.email && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {errors.email.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Sujet *</Label>
                        <Input
                          id="subject"
                          {...register('subject')}
                          placeholder="L'objet de votre message"
                          className={errors.subject ? 'border-destructive' : ''}
                        />
                        {errors.subject && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.subject.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          {...register('message')}
                          placeholder="Décrivez votre demande en détail..."
                          rows={6}
                          className={errors.message ? 'border-destructive' : ''}
                        />
                        {errors.message && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.message.message}
                          </p>
                        )}
                      </div>

                      <div className="pt-4">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Envoi en cours...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Envoyer le message
                            </>
                          )}
                        </Button>
                      </div>

                      <p className="text-sm text-muted-foreground text-center">
                        * Champs obligatoires. Vos données sont traitées avec confidentialité.
                      </p>
                    </form>
                  )}
              </div>
            </div>
          </div>

          <div className="mt-20 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] border-t border-border pt-16">
            <div>
              <Eyebrow className="mb-3">Avant d'écrire</Eyebrow>
              <h2 className="text-3xl font-serif">Questions fréquentes</h2>
              <p className="mt-3 text-muted-foreground">
                D'autres réponses dans la <Link to="/faq" className="underline underline-offset-4">FAQ complète</Link>.
              </p>
            </div>
            <EditorialList entries={[
              { title: 'Comment créer mon profil artiste ?', description: 'Inscrivez-vous gratuitement et complétez votre profil avec vos informations artistiques, votre répertoire et vos médias pour être visible par les professionnels.' },
              { title: 'Comment postuler à un casting ?', description: 'Parcourez les castings disponibles, consultez les détails et postulez directement depuis la plateforme avec votre profil et vos documents.' },
              { title: 'Quels sont les tarifs ?', description: 'Lyrisphere propose des formules adaptées à tous les besoins. Consultez notre page tarifs pour découvrir nos offres.' },
              { title: 'Support technique', description: 'Notre équipe support est disponible pour vous aider. Contactez-nous via ce formulaire ou par email.' }
            ]} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
