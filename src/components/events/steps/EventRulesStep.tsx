
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertCircle } from 'lucide-react';

interface EventRulesStepProps {
  formData: any;
  handleInputChange: (field: string, value: string) => void;
}

export const EventRulesStep: React.FC<EventRulesStepProps> = ({
  formData,
  handleInputChange
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Règlement de l'événement</h3>
        <p className="text-muted-foreground mb-6">
          Définissez les règles et conditions de participation à votre événement
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Règles de participation
          </CardTitle>
          <CardDescription>
            Précisez les conditions générales, les règles de conduite et les obligations des participants
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="participation_rules">Conditions de participation</Label>
            <Textarea
              id="participation_rules"
              value={formData.participation_rules || ''}
              onChange={(e) => handleInputChange('participation_rules', e.target.value)}
              placeholder="Ex: Être âgé de plus de 18 ans, avoir une expérience préalable en chant lyrique, apporter ses propres partitions..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code_of_conduct">Code de conduite</Label>
            <Textarea
              id="code_of_conduct"
              value={formData.code_of_conduct || ''}
              onChange={(e) => handleInputChange('code_of_conduct', e.target.value)}
              placeholder="Ex: Respect mutuel entre participants, ponctualité requise, téléphones en mode silencieux..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancellation_policy">Politique d'annulation</Label>
            <Textarea
              id="cancellation_policy"
              value={formData.cancellation_policy || ''}
              onChange={(e) => handleInputChange('cancellation_policy', e.target.value)}
              placeholder="Ex: Annulation gratuite jusqu'à 48h avant l'événement, remboursement partiel au-delà..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="liability_waiver">Décharge de responsabilité</Label>
            <Textarea
              id="liability_waiver"
              value={formData.liability_waiver || ''}
              onChange={(e) => handleInputChange('liability_waiver', e.target.value)}
              placeholder="Ex: Les participants participent à leurs risques et périls, l'organisateur n'est pas responsable des blessures..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium text-orange-900">Conseils pour un bon règlement</h4>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• Soyez clair et précis dans vos conditions</li>
                <li>• Mentionnez les équipements requis ou fournis</li>
                <li>• Précisez les modalités de remboursement</li>
                <li>• Indiquez les mesures de sécurité mises en place</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
