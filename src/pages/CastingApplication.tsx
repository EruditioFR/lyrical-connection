
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCasting } from '@/hooks/useCastings';
import { useCreateApplication } from '@/hooks/useApplications';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';

const applicationSchema = z.object({
  cover_letter: z.string().min(50, 'La lettre de motivation doit contenir au moins 50 caractères'),
  motivation: z.string().min(20, 'Veuillez expliquer votre motivation'),
  availability_notes: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const CastingApplication = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { casting, isLoading: castingLoading } = useCasting(id!);
  const { mutate: createApplication, isPending } = useCreateApplication();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      cover_letter: '',
      motivation: '',
      availability_notes: '',
    },
  });

  const onSubmit = (data: ApplicationFormData) => {
    if (!casting) return;

    createApplication({
      casting_id: casting.id,
      ...data,
    }, {
      onSuccess: () => {
        navigate(`/castings/${casting.id}`);
      },
    });
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Connexion requise
          </h1>
          <p className="text-gray-600 mb-6">
            Vous devez être connecté pour postuler à un casting.
          </p>
          <Button onClick={() => navigate('/auth')}>
            Se connecter
          </Button>
        </div>
      </Layout>
    );
  }

  if (castingLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!casting) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Casting non trouvé
          </h1>
          <Button onClick={() => navigate('/castings')}>
            Retour aux castings
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/castings/${casting.id}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au casting
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Postuler : {casting.title}
          </h1>
          <p className="text-gray-600">
            Complétez votre candidature pour ce casting
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire de candidature */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Votre candidature</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <Label htmlFor="cover_letter">
                      Lettre de motivation *
                    </Label>
                    <Textarea
                      id="cover_letter"
                      placeholder="Présentez-vous et expliquez pourquoi vous êtes le candidat idéal pour ce casting..."
                      rows={6}
                      {...form.register('cover_letter')}
                    />
                    {form.formState.errors.cover_letter && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.cover_letter.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="motivation">
                      Motivation spécifique *
                    </Label>
                    <Textarea
                      id="motivation"
                      placeholder="Qu'est-ce qui vous attire particulièrement dans ce projet ?"
                      rows={4}
                      {...form.register('motivation')}
                    />
                    {form.formState.errors.motivation && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.motivation.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="availability_notes">
                      Notes sur vos disponibilités
                    </Label>
                    <Textarea
                      id="availability_notes"
                      placeholder="Précisez vos disponibilités, contraintes particulières..."
                      rows={3}
                      {...form.register('availability_notes')}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(`/castings/${casting.id}`)}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Envoyer ma candidature
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Résumé du casting */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Récapitulatif du casting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Titre</h4>
                  <p className="text-gray-700">{casting.title}</p>
                </div>

                {casting.location && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Lieu</h4>
                    <p className="text-gray-700">{casting.location}</p>
                  </div>
                )}

                {casting.application_deadline && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Date limite</h4>
                    <p className="text-red-600 font-medium">
                      {new Date(casting.application_deadline).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}

                {casting.required_voice_types && casting.required_voice_types.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Types de voix</h4>
                    <p className="text-gray-700">
                      {casting.required_voice_types.join(', ')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CastingApplication;
