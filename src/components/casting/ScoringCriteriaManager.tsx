import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useScoringCriteria } from '@/hooks/useScoringCriteria';

interface ScoringCriterion {
  name: string;
  weight: number;
  method: 'linear' | 'exponential' | 'threshold';
  minValue?: number;
  maxValue?: number;
}

export const ScoringCriteriaManager = () => {
  const { criteria, updateCriteria, resetToDefaults } = useScoringCriteria();
  const [editingCriteria, setEditingCriteria] = useState<ScoringCriterion[]>([
    { name: 'vocalRange', weight: 0.25, method: 'linear' },
    { name: 'experience', weight: 0.20, method: 'exponential' },
    { name: 'availability', weight: 0.20, method: 'threshold' },
    { name: 'locationProximity', weight: 0.20, method: 'linear' },
    { name: 'repertoire', weight: 0.15, method: 'linear' }
  ]);

  const totalWeight = editingCriteria.reduce((sum, criterion) => sum + criterion.weight, 0);

  const handleWeightChange = (index: number, newWeight: number) => {
    const updated = [...editingCriteria];
    updated[index].weight = newWeight / 100; // Convert to decimal
    setEditingCriteria(updated);
  };

  const handleMethodChange = (index: number, method: string) => {
    const updated = [...editingCriteria];
    updated[index].method = method as 'linear' | 'exponential' | 'threshold';
    setEditingCriteria(updated);
  };

  const handleSave = async () => {
    if (Math.abs(totalWeight - 1) > 0.01) {
      toast({
        title: "Erreur de validation",
        description: "Le total des poids doit égaler 100%",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateCriteria.mutateAsync(editingCriteria);
      toast({
        title: "Critères sauvegardés",
        description: "Les critères de notation ont été mis à jour avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les critères",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    setEditingCriteria([
      { name: 'vocalRange', weight: 0.25, method: 'linear' },
      { name: 'experience', weight: 0.20, method: 'exponential' },
      { name: 'availability', weight: 0.20, method: 'threshold' },
      { name: 'locationProximity', weight: 0.20, method: 'linear' },
      { name: 'repertoire', weight: 0.15, method: 'linear' }
    ]);
  };

  const getCriterionLabel = (name: string) => {
    const labels = {
      vocalRange: 'Étendue vocale',
      experience: 'Expérience',
      availability: 'Disponibilité',
      locationProximity: 'Proximité géographique',
      repertoire: 'Répertoire'
    };
    return labels[name as keyof typeof labels] || name;
  };

  const getMethodLabel = (method: string) => {
    const labels = {
      linear: 'Linéaire',
      exponential: 'Exponentiel',
      threshold: 'Seuil'
    };
    return labels[method as keyof typeof labels] || method;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Configuration des critères</h3>
          <p className="text-sm text-muted-foreground">
            Ajustez les poids et méthodes de calcul pour chaque critère d'évaluation
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={Math.abs(totalWeight - 1) < 0.01 ? "default" : "destructive"}>
            Total: {Math.round(totalWeight * 100)}%
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {editingCriteria.map((criterion, index) => (
          <Card key={criterion.name}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">
                  {getCriterionLabel(criterion.name)}
                </CardTitle>
                <Badge variant="outline">
                  {Math.round(criterion.weight * 100)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Poids ({Math.round(criterion.weight * 100)}%)</Label>
                <Slider
                  value={[criterion.weight * 100]}
                  onValueChange={(values) => handleWeightChange(index, values[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Méthode de calcul</Label>
                <Select
                  value={criterion.method}
                  onValueChange={(value) => handleMethodChange(index, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linéaire</SelectItem>
                    <SelectItem value="exponential">Exponentiel</SelectItem>
                    <SelectItem value="threshold">Seuil</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {criterion.method === 'linear' && 'Score proportionnel à la valeur'}
                  {criterion.method === 'exponential' && 'Score avec progression exponentielle'}
                  {criterion.method === 'threshold' && 'Score basé sur le dépassement d\'un seuil'}
                </p>
              </div>

              {criterion.method === 'threshold' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valeur minimale</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={criterion.minValue || ''}
                      onChange={(e) => {
                        const updated = [...editingCriteria];
                        updated[index].minValue = Number(e.target.value);
                        setEditingCriteria(updated);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valeur maximale</Label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={criterion.maxValue || ''}
                      onChange={(e) => {
                        const updated = [...editingCriteria];
                        updated[index].maxValue = Number(e.target.value);
                        setEditingCriteria(updated);
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleReset}>
          <Trash2 className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={Math.abs(totalWeight - 1) > 0.01 || updateCriteria.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {updateCriteria.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>
    </div>
  );
};