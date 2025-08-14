import React, { useState } from 'react';
import { Upload, FileText, Download, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdvancedCsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: () => void;
}

type ImportType = 'works' | 'composers' | 'roles' | 'arias' | 'complete';

interface ImportResult {
  success: boolean;
  imported: {
    composers: number;
    works: number;
    roles: number;
    arias: number;
  };
  errors: string[];
  message: string;
}

const AdvancedCsvImportDialog = ({ open, onOpenChange, onImportSuccess }: AdvancedCsvImportDialogProps) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<ImportType>('complete');
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const csvFormats = {
    works: {
      title: 'Œuvres lyriques',
      description: 'Import d\'œuvres avec compositeurs automatiques',
      columns: ['titre', 'compositeur', 'catégorie', 'genre', 'période', 'langue', 'description', 'synopsis', 'librettiste', 'difficulté', 'actes', 'durée_totale', 'date_création', 'lieu_création'],
      example: 'La Traviata,Verdi,Opéra,Romantique,XIXe,Italien,Opéra en trois actes,Histoire de Violetta...,Francesco Maria Piave,4,3,120,1853,Venise'
    },
    composers: {
      title: 'Compositeurs',
      description: 'Import de compositeurs avec informations biographiques',
      columns: ['compositeur', 'compositeur_nom_complet', 'compositeur_naissance', 'compositeur_mort', 'compositeur_epoque', 'compositeur_biographie'],
      example: 'Mozart,Wolfgang Amadeus Mozart,1756,1791,Classique,Compositeur autrichien...'
    },
    roles: {
      title: 'Rôles',
      description: 'Import de rôles pour œuvres existantes',
      columns: ['oeuvre_titre', 'compositeur', 'role_nom', 'role_tessiture', 'role_type', 'role_description', 'role_difficulté'],
      example: 'La Traviata,Verdi,Violetta,Soprano colorature,Principal,Héroïne de l\'opéra,5'
    },
    arias: {
      title: 'Airs',
      description: 'Import d\'airs pour œuvres et rôles existants',
      columns: ['oeuvre_titre', 'role_nom', 'air_titre', 'air_acte', 'air_scène', 'air_tonalité', 'air_difficulté', 'air_premier_vers', 'air_contexte'],
      example: 'La Traviata,Violetta,Sempre libera,1,2,F majeur,5,Sempre libera degg\'io,Air de bravoure final'
    },
    complete: {
      title: 'Détection automatique',
      description: 'Le système détecte automatiquement le format du CSV',
      columns: ['Auto-détection basée sur les en-têtes'],
      example: 'Utilisez l\'un des formats ci-dessus'
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setImportResult(null);
    } else {
      toast({
        title: "Fichier invalide",
        description: "Veuillez sélectionner un fichier CSV valide.",
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = (type: ImportType) => {
    if (type === 'complete') return;
    
    const format = csvFormats[type];
    const csvContent = [
      format.columns.join(','),
      format.example
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${type}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "Fichier requis",
        description: "Veuillez sélectionner un fichier CSV.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      const csvText = await selectedFile.text();
      setImportProgress(30);

      const { data, error } = await supabase.functions.invoke('import-csv-complete', {
        body: {
          csvData: csvText,
          importType,
          skipDuplicates
        },
      });

      setImportProgress(90);

      if (error) {
        throw error;
      }

      setImportResult(data);
      setImportProgress(100);

      if (data.success) {
        toast({
          title: "Import réussi",
          description: data.message,
        });
        onImportSuccess?.();
      } else {
        toast({
          title: "Import avec erreurs",
          description: data.message,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Erreur d'import",
        description: error.message || "Une erreur est survenue lors de l'import",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetDialog = () => {
    setSelectedFile(null);
    setImportType('complete');
    setSkipDuplicates(true);
    setImportProgress(0);
    setImportResult(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetDialog();
    }
    onOpenChange(newOpen);
  };

  const totalImported = importResult ? Object.values(importResult.imported).reduce((sum, count) => sum + count, 0) : 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import CSV Avancé
          </DialogTitle>
          <DialogDescription>
            Importez des compositeurs, œuvres, rôles et airs depuis un fichier CSV
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="formats">Formats & Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="import-type">Type d'import</Label>
                <Select value={importType} onValueChange={(value: ImportType) => setImportType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="complete">Détection automatique</SelectItem>
                    <SelectItem value="composers">Compositeurs uniquement</SelectItem>
                    <SelectItem value="works">Œuvres lyriques</SelectItem>
                    <SelectItem value="roles">Rôles</SelectItem>
                    <SelectItem value="arias">Airs</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  {csvFormats[importType].description}
                </p>
              </div>

              <div>
                <Label htmlFor="csv-file">Fichier CSV</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="mt-1"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Fichier sélectionné: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} Ko)
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="skip-duplicates"
                  checked={skipDuplicates}
                  onCheckedChange={(checked) => setSkipDuplicates(checked as boolean)}
                />
                <Label htmlFor="skip-duplicates" className="text-sm">
                  Ignorer les doublons (recommandé)
                </Label>
              </div>

              {isImporting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Import en cours...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} className="w-full" />
                </div>
              )}

              {importResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Résultats de l'import
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{importResult.imported.composers}</div>
                        <div className="text-xs text-muted-foreground">Compositeurs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{importResult.imported.works}</div>
                        <div className="text-xs text-muted-foreground">Œuvres</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{importResult.imported.roles}</div>
                        <div className="text-xs text-muted-foreground">Rôles</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{importResult.imported.arias}</div>
                        <div className="text-xs text-muted-foreground">Airs</div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <Badge variant={importResult.success ? "default" : "destructive"} className="text-sm">
                        {totalImported} éléments importés au total
                      </Badge>
                    </div>

                    {importResult.errors.length > 0 && (
                      <div className="border rounded p-3 bg-destructive/5">
                        <h4 className="font-medium text-destructive mb-2">
                          Erreurs ({importResult.errors.length})
                        </h4>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {importResult.errors.slice(0, 10).map((error, index) => (
                            <p key={index} className="text-xs text-destructive">
                              {error}
                            </p>
                          ))}
                          {importResult.errors.length > 10 && (
                            <p className="text-xs text-muted-foreground">
                              ... et {importResult.errors.length - 10} autres erreurs
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="formats" className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(csvFormats).map(([key, format]) => (
                <Card key={key}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{format.title}</CardTitle>
                        <CardDescription>{format.description}</CardDescription>
                      </div>
                      {key !== 'complete' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadTemplate(key as ImportType)}
                          className="shrink-0"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Template
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Colonnes attendues:</h4>
                      <div className="flex flex-wrap gap-1">
                        {format.columns.map((col, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {col}
                          </Badge>
                        ))}
                      </div>
                      {format.example && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium mb-1">Exemple:</h4>
                          <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
                            {format.example}
                          </code>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Fermer
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!selectedFile || isImporting}
            className="min-w-24"
          >
            {isImporting ? (
              <>
                <FileText className="h-4 w-4 mr-2 animate-spin" />
                Import...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Importer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedCsvImportDialog;