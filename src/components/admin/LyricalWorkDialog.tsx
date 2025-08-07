import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { LyricalWorkWithRoles } from '@/hooks/useLyricalWorksAdmin';

const formSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  composer: z.string().min(1, 'Le compositeur est requis'),
  category: z.string().min(1, 'La catégorie est requise'),
  language: z.string().optional(),
  period: z.string().optional(),
  description: z.string().optional(),
  difficulty_level: z.number().min(1).max(5).default(3),
});

type FormData = z.infer<typeof formSchema>;

interface LyricalWorkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  work?: LyricalWorkWithRoles;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

const CATEGORIES = [
  'Opéra',
  'Oratorio',
  'Messe',
  'Requiem',
  'Cantate',
  'Lied',
  'Mélodie française',
  'Art song',
  'Aria de concert',
  'Autre',
];

const PERIODS = [
  'Baroque',
  'Classique',
  'Romantique',
  'Moderne',
  'Contemporain',
];

const LANGUAGES = [
  'Français',
  'Italien',
  'Allemand',
  'Anglais',
  'Espagnol',
  'Russe',
  'Latin',
  'Autre',
];

export const LyricalWorkDialog = ({
  open,
  onOpenChange,
  work,
  onSubmit,
  isLoading,
}: LyricalWorkDialogProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: work?.title || '',
      composer: work?.composer || '',
      category: work?.category || '',
      language: work?.language || '',
      period: work?.period || '',
      description: work?.description || '',
      difficulty_level: work?.difficulty_level || 3,
    },
  });

  React.useEffect(() => {
    if (work) {
      form.reset({
        title: work.title,
        composer: work.composer,
        category: work.category,
        language: work.language || '',
        period: work.period || '',
        description: work.description || '',
        difficulty_level: work.difficulty_level || 3,
      });
    } else {
      form.reset({
        title: '',
        composer: '',
        category: '',
        language: '',
        period: '',
        description: '',
        difficulty_level: 3,
      });
    }
  }, [work, form]);

  const handleSubmit = (data: FormData) => {
    onSubmit(data);
    if (!work) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {work ? 'Modifier l\'œuvre lyrique' : 'Créer une œuvre lyrique'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Titre de l'œuvre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="composer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compositeur *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du compositeur" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Langue</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une langue" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LANGUAGES.map((language) => (
                          <SelectItem key={language} value={language}>
                            {language}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Période</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une période" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PERIODS.map((period) => (
                          <SelectItem key={period} value={period}>
                            {period}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="difficulty_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau de difficulté (1-5)</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 - Très facile</SelectItem>
                      <SelectItem value="2">2 - Facile</SelectItem>
                      <SelectItem value="3">3 - Moyen</SelectItem>
                      <SelectItem value="4">4 - Difficile</SelectItem>
                      <SelectItem value="5">5 - Très difficile</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description de l'œuvre (contexte, histoire, etc.)"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {work ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};