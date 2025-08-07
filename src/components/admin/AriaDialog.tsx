import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AriaWithDetails } from '@/hooks/useOperaDatabase';

const formSchema = z.object({
  work_id: z.string().min(1, 'L\'œuvre est requise'),
  role_id: z.string().optional(),
  title: z.string().min(1, 'Le titre est requis'),
  act_number: z.number().optional(),
  scene_number: z.number().optional(),
  duration_minutes: z.number().optional(),
  key_signature: z.string().optional(),
  tempo_marking: z.string().optional(),
  tessitura_min: z.string().optional(),
  tessitura_max: z.string().optional(),
  difficulty_level: z.number().min(1).max(5),
  style_period: z.string().optional(),
  aria_type: z.string().optional(),
  vocal_technique_notes: z.string().optional(),
  dramatic_context: z.string().optional(),
  first_line: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aria?: AriaWithDetails;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
  works: Array<{ id: string; title: string; composer: string }>;
  roles: Array<{ id: string; role_name: string; voice_type?: string }>;
}

const ARIA_TYPES = [
  'aria',
  'cavatina',
  'cabaletta',
  'recitativo',
  'duetto',
  'terzetto',
  'quartetto',
  'ensemble',
  'coro',
];

const DIFFICULTY_LEVELS = [
  { value: 1, label: 'Très facile' },
  { value: 2, label: 'Facile' },
  { value: 3, label: 'Intermédiaire' },
  { value: 4, label: 'Difficile' },
  { value: 5, label: 'Très difficile' },
];

const STYLE_PERIODS = [
  'Baroque',
  'Classique',
  'Romantique',
  'Vérisme',
  'Moderne',
  'Contemporain',
];

const AriaDialog = ({
  open,
  onOpenChange,
  aria,
  onSubmit,
  isLoading,
  works,
  roles,
}: AriaDialogProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      work_id: '',
      role_id: '',
      title: '',
      act_number: undefined,
      scene_number: undefined,
      duration_minutes: undefined,
      key_signature: '',
      tempo_marking: '',
      tessitura_min: '',
      tessitura_max: '',
      difficulty_level: 3,
      style_period: '',
      aria_type: '',
      vocal_technique_notes: '',
      dramatic_context: '',
      first_line: '',
    },
  });

  React.useEffect(() => {
    if (aria) {
      form.reset({
        work_id: aria.work_id,
        role_id: aria.role_id || '',
        title: aria.title,
        act_number: aria.act_number,
        scene_number: aria.scene_number,
        duration_minutes: aria.duration_minutes,
        key_signature: aria.key_signature || '',
        tempo_marking: aria.tempo_marking || '',
        tessitura_min: aria.tessitura_min || '',
        tessitura_max: aria.tessitura_max || '',
        difficulty_level: aria.difficulty_level,
        style_period: aria.style_period || '',
        aria_type: aria.aria_type || '',
        vocal_technique_notes: aria.vocal_technique_notes || '',
        dramatic_context: aria.dramatic_context || '',
        first_line: aria.first_line || '',
      });
    } else {
      form.reset({
        work_id: '',
        role_id: '',
        title: '',
        act_number: undefined,
        scene_number: undefined,
        duration_minutes: undefined,
        key_signature: '',
        tempo_marking: '',
        tessitura_min: '',
        tessitura_max: '',
        difficulty_level: 3,
        style_period: '',
        aria_type: '',
        vocal_technique_notes: '',
        dramatic_context: '',
        first_line: '',
      });
    }
  }, [aria, form]);

  const handleSubmit = (data: FormData) => {
    onSubmit(data);
    if (!aria) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {aria ? 'Modifier l\'air' : 'Nouvel air'}
          </DialogTitle>
          <DialogDescription>
            {aria 
              ? 'Modifiez les informations de cet air lyrique.'
              : 'Ajoutez un nouvel air à la base de données.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="work_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Œuvre *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une œuvre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {works.map((work) => (
                          <SelectItem key={work.id} value={work.id}>
                            {work.title} - {work.composer}
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
                name="role_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un rôle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.role_name} {role.voice_type && `(${role.voice_type})`}
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
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Titre de l'air" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aria_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d'air</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Type d'air" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ARIA_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
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
                name="act_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acte</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Numéro d'acte"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scene_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scène</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Numéro de scène"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Durée en minutes"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="key_signature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tonalité</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: La majeur, do mineur" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tempo_marking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Indication de tempo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Andante, Allegro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tessitura_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tessiture min</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Do3, Sol2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tessitura_max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tessiture max</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Do5, Fa4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau de difficulté</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DIFFICULTY_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value.toString()}>
                            {level.label}
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
                name="style_period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Période stylistique</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Période" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STYLE_PERIODS.map((period) => (
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
              name="first_line"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Premier vers</FormLabel>
                  <FormControl>
                    <Input placeholder="Premier vers ou phrase de l'air" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dramatic_context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contexte dramatique</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Contexte dramatique et situation dans l'opéra"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vocal_technique_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes techniques vocales</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Difficultés techniques, ornements, coloratures..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {aria ? 'Modifier' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AriaDialog;