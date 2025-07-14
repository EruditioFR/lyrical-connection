
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateTranslationKey } from '@/hooks/useTranslations';

interface CreateTranslationKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: string[];
}

export const CreateTranslationKeyDialog: React.FC<CreateTranslationKeyDialogProps> = ({
  open,
  onOpenChange,
  sections,
}) => {
  const [formData, setFormData] = useState({
    keyPath: '',
    section: '',
    frenchText: '',
    context: '',
  });

  const createTranslationKey = useCreateTranslationKey();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.keyPath || !formData.section || !formData.frenchText) {
      return;
    }

    try {
      await createTranslationKey.mutateAsync({
        key_path: formData.keyPath,
        section: formData.section,
        french_text: formData.frenchText,
        context: formData.context || undefined,
      });

      // Reset form and close dialog
      setFormData({
        keyPath: '',
        section: '',
        frenchText: '',
        context: '',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating translation key:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      keyPath: '',
      section: '',
      frenchText: '',
      context: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle clé de traduction</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyPath">Clé de traduction *</Label>
            <Input
              id="keyPath"
              placeholder="ex: navigation.home, common.save"
              value={formData.keyPath}
              onChange={(e) => setFormData(prev => ({ ...prev, keyPath: e.target.value }))}
              required
            />
            <p className="text-xs text-gray-500">
              Format: section.element (ex: navigation.home, common.loading)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="section">Section *</Label>
            <Select 
              value={formData.section} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, section: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map(section => (
                  <SelectItem key={section} value={section}>
                    {section}
                  </SelectItem>
                ))}
                <SelectItem value="new">Nouvelle section...</SelectItem>
              </SelectContent>
            </Select>
            
            {formData.section === 'new' && (
              <Input
                placeholder="Nom de la nouvelle section"
                value={formData.section}
                onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                required
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="frenchText">Texte en français *</Label>
            <Textarea
              id="frenchText"
              placeholder="Texte de référence en français"
              value={formData.frenchText}
              onChange={(e) => setFormData(prev => ({ ...prev, frenchText: e.target.value }))}
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Contexte (optionnel)</Label>
            <Textarea
              id="context"
              placeholder="Contexte d'utilisation pour aider les traducteurs et l'IA"
              value={formData.context}
              onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
              rows={2}
            />
            <p className="text-xs text-gray-500">
              Décrivez où et comment ce texte est utilisé pour de meilleures traductions
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={createTranslationKey.isPending || !formData.keyPath || !formData.section || !formData.frenchText}
            >
              Créer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
