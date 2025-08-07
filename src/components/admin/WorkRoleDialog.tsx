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
import type { Tables } from '@/integrations/supabase/types';

const formSchema = z.object({
  role_name: z.string().min(1, 'Le nom du rôle est requis'),
  voice_type: z.string().optional(),
  aria_title: z.string().optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface WorkRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workId: string;
  role?: Tables<'work_roles'>;
  onSubmit: (data: FormData & { work_id: string }) => void;
  isLoading?: boolean;
}

const VOICE_TYPES = [
  'Soprano',
  'Mezzo-soprano',
  'Alto',
  'Ténor',
  'Baryton',
  'Basse',
  'Soprano colorature',
  'Soprano lyrique',
  'Soprano dramatique',
  'Mezzo-soprano lyrique',
  'Contralto',
  'Ténor lyrique',
  'Ténor dramatique',
  'Baryton-basse',
  'Basse profonde',
];

export const WorkRoleDialog = ({
  open,
  onOpenChange,
  workId,
  role,
  onSubmit,
  isLoading,
}: WorkRoleDialogProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role_name: role?.role_name || '',
      voice_type: role?.voice_type || '',
      aria_title: role?.aria_title || '',
      description: role?.description || '',
    },
  });

  React.useEffect(() => {
    if (role) {
      form.reset({
        role_name: role.role_name,
        voice_type: role.voice_type || '',
        aria_title: role.aria_title || '',
        description: role.description || '',
      });
    } else {
      form.reset({
        role_name: '',
        voice_type: '',
        aria_title: '',
        description: '',
      });
    }
  }, [role, form]);

  const handleSubmit = (data: FormData) => {
    onSubmit({ ...data, work_id: workId });
    if (!role) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {role ? 'Modifier le rôle' : 'Créer un rôle'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="role_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du rôle *</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Figaro, Carmen, Don Giovanni" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="voice_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tessiture</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une tessiture" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {VOICE_TYPES.map((voiceType) => (
                        <SelectItem key={voiceType} value={voiceType}>
                          {voiceType}
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
              name="aria_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aria principale</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre de l'aria la plus connue" {...field} />
                  </FormControl>
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
                      placeholder="Description du personnage et du rôle"
                      className="min-h-[80px]"
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
                {role ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};