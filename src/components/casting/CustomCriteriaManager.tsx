import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useCustomCriteria } from '@/hooks/useCustomCriteria';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface CustomCriteriaManagerProps {
  professionalProfileId: string;
}

const CustomCriteriaManager = ({ professionalProfileId }: CustomCriteriaManagerProps) => {
  const { criteria, isLoading, addCriterion, updateCriterion, deleteCriterion } = useCustomCriteria(professionalProfileId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<{ id: string; name: string; description?: string } | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    try {
      if (editingCriterion) {
        await updateCriterion.mutateAsync({
          id: editingCriterion.id,
          name: formData.name,
          description: formData.description || undefined
        });
      } else {
        await addCriterion.mutateAsync({
          name: formData.name,
          description: formData.description || undefined
        });
      }
      
      setFormData({ name: '', description: '' });
      setEditingCriterion(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving criterion:', error);
    }
  };

  const handleEdit = (criterion: any) => {
    setEditingCriterion(criterion);
    setFormData({ 
      name: criterion.name, 
      description: criterion.description || '' 
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCriterion.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting criterion:', error);
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Mes critères de notation</h3>
          <p className="text-sm text-muted-foreground">
            Gérez vos critères personnalisés pour évaluer les candidats (note de 1 à 20)
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCriterion(null);
              setFormData({ name: '', description: '' });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un critère
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCriterion ? 'Modifier le critère' : 'Nouveau critère'}
              </DialogTitle>
              <DialogDescription>
                Créez un critère personnalisé pour évaluer vos candidats
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du critère *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Technique vocale, Présence scénique..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez ce que vous évaluez avec ce critère..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  {editingCriterion ? 'Modifier' : 'Ajouter'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {criteria.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">Aucun critère défini</p>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Commencez par créer vos critères de notation personnalisés
              </p>
            </CardContent>
          </Card>
        ) : (
          criteria.map((criterion) => (
            <Card key={criterion.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{criterion.name}</h4>
                    <Badge variant="secondary">1-20 pts</Badge>
                  </div>
                  {criterion.description && (
                    <p className="text-sm text-muted-foreground">{criterion.description}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(criterion)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer le critère</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer "{criterion.name}" ? 
                          Toutes les notes associées à ce critère seront perdues.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(criterion.id)}>
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomCriteriaManager;