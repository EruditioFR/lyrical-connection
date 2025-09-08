import React, { useState } from 'react';
import { 
  Database, 
  Upload, 
  Download, 
  Zap, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Music,
  BookOpen,
  Users,
  Mic,
  Globe,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useOpenOpusImport } from '@/hooks/useOpenOpusImport';
import { useAdvancedCsvImport } from '@/hooks/useAdvancedCsvImport';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdvancedCsvImportDialog from './AdvancedCsvImportDialog';

interface ImportStepStatus {
  step: 'composers' | 'works' | 'roles' | 'arias';
  status: 'pending' | 'loading' | 'completed' | 'error';
  count?: number;
  message?: string;
}

const AutomatedDataImportSystem = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('automated');
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [automatedSteps, setAutomatedSteps] = useState<ImportStepStatus[]>([
    { step: 'composers', status: 'pending' },
    { step: 'works', status: 'pending' },
    { step: 'roles', status: 'pending' },
    { step: 'arias', status: 'pending' }
  ]);

  const { importData: openOpusImport, isImporting: isOpenOpusImporting } = useOpenOpusImport();
  const { importData: csvImport, isImporting: isCsvImporting } = useAdvancedCsvImport();

  const stepConfig = {
    composers: {
      icon: Users,
      title: 'Compositeurs',
      description: 'Import des compositeurs avec biographies',
      color: 'text-blue-600'
    },
    works: {
      icon: BookOpen,
      title: 'Œuvres lyriques',
      description: 'Import des opéras, oratorios et mélodies',
      color: 'text-green-600'
    },
    roles: {
      icon: Mic,
      title: 'Rôles',
      description: 'Import des personnages et tessitures',
      color: 'text-purple-600'
    },
    arias: {
      icon: Music,
      title: 'Airs',
      description: 'Import des arias et mélodies',
      color: 'text-orange-600'
    }
  };

  const sampleDataTemplates = [
    {
      name: 'Mozart - Répertoire classique',
      description: '12 œuvres majeures de Mozart avec rôles et airs',
      estimatedItems: { composers: 1, works: 12, roles: 45, arias: 120 },
      difficulty: 'Débutant',
      category: 'Classique'
    },
    {
      name: 'Verdi - Opéras populaires',
      description: '8 opéras célèbres de Verdi avec principaux rôles',
      estimatedItems: { composers: 1, works: 8, roles: 32, arias: 85 },
      difficulty: 'Intermédiaire',
      category: 'Romantique'
    },
    {
      name: 'Répertoire français',
      description: 'Massenet, Gounod, Bizet - mélodies et opéras',
      estimatedItems: { composers: 5, works: 15, roles: 60, arias: 150 },
      difficulty: 'Tous niveaux',
      category: 'Français'
    },
    {
      name: 'Base complète d\'opéra',
      description: 'Collection étendue de 50+ compositeurs et 200+ œuvres',
      estimatedItems: { composers: 50, works: 200, roles: 800, arias: 2000 },
      difficulty: 'Tous niveaux',
      category: 'Complet'
    }
  ];

  const updateStepStatus = (step: ImportStepStatus['step'], status: ImportStepStatus['status'], count?: number, message?: string) => {
    setAutomatedSteps(prev => prev.map(s => 
      s.step === step ? { ...s, status, count, message } : s
    ));
  };

  const handleAutomatedImport = async (templateName: string) => {
    // Reset all steps
    setAutomatedSteps(prev => prev.map(s => ({ ...s, status: 'pending', count: 0, message: undefined })));

    try {
      // Show progress step by step
      updateStepStatus('composers', 'loading');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      updateStepStatus('works', 'loading');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      updateStepStatus('roles', 'loading');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      updateStepStatus('arias', 'loading');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Call the edge function to generate and import sample data
      const { data, error } = await supabase.functions.invoke('generate-sample-data', {
        body: { templateName }
      });

      if (error) {
        throw error;
      }

      // Update progress based on actual results
      updateStepStatus('composers', 'completed', data.imported.composers, 'Compositeurs importés');
      await new Promise(resolve => setTimeout(resolve, 200));
      updateStepStatus('works', 'completed', data.imported.works, 'Œuvres importées');
      await new Promise(resolve => setTimeout(resolve, 200));
      updateStepStatus('roles', 'completed', data.imported.roles, 'Rôles importés');
      await new Promise(resolve => setTimeout(resolve, 200));
      updateStepStatus('arias', 'completed', data.imported.arias, 'Airs importés');

      toast({
        title: "Import automatisé terminé",
        description: `Template "${templateName}" importé avec succès !`,
      });

      // Invalider les caches pour recharger les données
      queryClient.invalidateQueries({ queryKey: ['composers'] });
      queryClient.invalidateQueries({ queryKey: ['lyrical-works'] });
      queryClient.invalidateQueries({ queryKey: ['work-roles'] });
      queryClient.invalidateQueries({ queryKey: ['opera-database'] });

    } catch (error) {
      console.error('Automated import error:', error);
      
      // Mark all loading steps as error
      setAutomatedSteps(prev => prev.map(s => 
        s.status === 'loading' ? { ...s, status: 'error', message: error.message } : s
      ));
      
      toast({
        title: "Erreur d'import",
        description: error.message || "Une erreur est survenue lors de l'import automatisé",
        variant: "destructive",
      });
    }
  };

  const handleApiImport = async (dataSource: string) => {
    // Reset all steps
    setAutomatedSteps(prev => prev.map(s => ({ ...s, status: 'pending', count: 0, message: undefined })));

    try {
      // Show progress
      updateStepStatus('composers', 'loading', 0, 'Recherche en cours...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      updateStepStatus('works', 'loading', 0, 'Récupération des données...');
      
      // Call the new API fetch function
      const { data, error } = await supabase.functions.invoke('fetch-opera-api-data', {
        body: { 
          dataSource,
          searchQuery: undefined,
          category: 'all',
          limit: 100
        }
      });

      if (error) {
        throw error;
      }

      // Update progress based on actual results
      updateStepStatus('composers', 'completed', data.imported.composers, `${data.imported.composers} compositeurs importés`);
      await new Promise(resolve => setTimeout(resolve, 200));
      updateStepStatus('works', 'completed', data.imported.works, `${data.imported.works} œuvres importées`);
      await new Promise(resolve => setTimeout(resolve, 200));
      updateStepStatus('roles', 'completed', 0, 'En attente des rôles...');
      await new Promise(resolve => setTimeout(resolve, 200));
      updateStepStatus('arias', 'completed', 0, 'En attente des airs...');

      toast({
        title: "Import API terminé",
        description: `Données récupérées depuis ${dataSource} avec succès !`,
      });

      // Invalider les caches pour recharger les données
      queryClient.invalidateQueries({ queryKey: ['composers'] });
      queryClient.invalidateQueries({ queryKey: ['lyrical-works'] });
      queryClient.invalidateQueries({ queryKey: ['work-roles'] });
      queryClient.invalidateQueries({ queryKey: ['opera-database'] });

    } catch (error) {
      console.error('API import error:', error);
      
      // Mark all loading steps as error
      setAutomatedSteps(prev => prev.map(s => 
        s.status === 'loading' ? { ...s, status: 'error', message: error.message } : s
      ));
      
      toast({
        title: "Erreur d'import API",
        description: error.message || "Une erreur est survenue lors de l'import depuis l'API",
        variant: "destructive",
      });
    }
  };

  const handleOpenOpusImport = () => {
    openOpusImport({
      importMode: 'all',
      searchQuery: undefined
    });
  };

  const downloadSampleCsv = (type: 'composers' | 'works' | 'roles' | 'arias') => {
    const sampleData = {
      composers: [
        'nom,nom_complet,naissance,mort,epoque,biographie',
        'Mozart,Wolfgang Amadeus Mozart,1756,1791,Classique,Compositeur autrichien de génie',
        'Verdi,Giuseppe Verdi,1813,1901,Romantique,Maître de l\'opéra italien',
        'Puccini,Giacomo Puccini,1858,1924,Romantique,Compositeur d\'opéras à succès'
      ],
      works: [
        'titre,compositeur,catégorie,genre,période,langue,description,synopsis,librettiste,difficulté,actes,durée_totale,date_création,lieu_création',
        'Don Giovanni,Mozart,Opéra,Dramma giocoso,Classique,Italien,Opéra en deux actes,L\'histoire de Don Juan,Lorenzo Da Ponte,4,2,165,1787,Prague',
        'La Traviata,Verdi,Opéra,Melodramma,Romantique,Italien,Opéra en trois actes,Histoire de Violetta,Francesco Maria Piave,4,3,120,1853,Venise',
        'La Bohème,Puccini,Opéra,Opéra,Romantique,Italien,Opéra en quatre actes,Vie de bohème à Paris,Luigi Illica,3,4,115,1896,Turin'
      ],
      roles: [
        'oeuvre_titre,compositeur,role_nom,role_tessiture,role_type,role_description,role_difficulté',
        'Don Giovanni,Mozart,Don Giovanni,Baryton,Principal,Le séducteur,4',
        'Don Giovanni,Mozart,Donna Anna,Soprano dramatique,Principal,Noble dame outragée,5',
        'La Traviata,Verdi,Violetta,Soprano colorature,Principal,Courtisane parisienne,5',
        'La Traviata,Verdi,Alfredo,Ténor lyrique,Principal,Jeune bourgeois amoureux,3'
      ],
      arias: [
        'oeuvre_titre,role_nom,air_titre,air_acte,air_scène,air_tonalité,air_difficulté,air_premier_vers,air_contexte',
        'Don Giovanni,Don Giovanni,Là ci darem la mano,1,2,A majeur,3,Là ci darem la mano,Duo de séduction avec Zerlina',
        'La Traviata,Violetta,Sempre libera,1,4,F majeur,5,Sempre libera degg\'io,Air de bravoure final de l\'acte I',
        'La Bohème,Rodolfo,Che gelida manina,1,1,C majeur,4,Che gelida manina,Récit de Rodolfo à Mimi'
      ]
    };

    const csvContent = sampleData[type].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exemple_${type}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStepIcon = (status: ImportStepStatus['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'loading': return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const isAnyStepLoading = automatedSteps.some(step => step.status === 'loading');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Zap className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Système d'Import Automatisé</h2>
          <p className="text-muted-foreground">
            Alimentez votre base de données d'opéra rapidement et facilement
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="automated">Import Auto</TabsTrigger>
          <TabsTrigger value="api">APIs Fiables</TabsTrigger>
          <TabsTrigger value="openopus">OpenOpus</TabsTrigger>
          <TabsTrigger value="csv">Import CSV</TabsTrigger>
          <TabsTrigger value="samples">Exemples</TabsTrigger>
        </TabsList>

        <TabsContent value="automated" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Templates Pré-configurés
              </CardTitle>
              <CardDescription>
                Importez des collections complètes avec un seul clic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {sampleDataTemplates.map((template, index) => (
                  <Card key={index} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {template.description}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">{template.difficulty}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                          <div className="text-lg font-bold text-blue-600">
                            {template.estimatedItems.composers}
                          </div>
                          <div className="text-xs text-muted-foreground">Compositeurs</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-600">
                            {template.estimatedItems.works}
                          </div>
                          <div className="text-xs text-muted-foreground">Œuvres</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-purple-600">
                            {template.estimatedItems.roles}
                          </div>
                          <div className="text-xs text-muted-foreground">Rôles</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-orange-600">
                            {template.estimatedItems.arias}
                          </div>
                          <div className="text-xs text-muted-foreground">Airs</div>
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => handleAutomatedImport(template.name)}
                        disabled={isAnyStepLoading}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Importer ce template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Import Progress */}
          {isAnyStepLoading && (
            <Card>
              <CardHeader>
                <CardTitle>Import en cours...</CardTitle>
                <CardDescription>
                  Importation automatique des données dans l'ordre correct
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {automatedSteps.map((step, index) => {
                  const StepIcon = stepConfig[step.step].icon;
                  return (
                    <div key={step.step} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className="flex items-center gap-3 flex-1">
                        <StepIcon className={`h-5 w-5 ${stepConfig[step.step].color}`} />
                        <div className="flex-1">
                          <div className="font-medium">{stepConfig[step.step].title}</div>
                          <div className="text-sm text-muted-foreground">
                            {stepConfig[step.step].description}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {step.count && (
                            <Badge variant="secondary">{step.count}</Badge>
                          )}
                          {getStepIcon(step.status)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                APIs Musicales Fiables
              </CardTitle>
              <CardDescription>
                Récupérez des données depuis des sources musicales reconnues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Database className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="font-medium">MusicBrainz</h3>
                      <p className="text-sm text-muted-foreground">Base de données musicale ouverte</p>
                    </div>
                  </div>
                  <p className="text-sm mb-3">
                    Accès à une vaste collection de métadonnées musicales avec compositeurs, œuvres et détails biographiques.
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => handleApiImport('musicbrainz')}
                    disabled={isAnyStepLoading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Importer depuis MusicBrainz
                  </Button>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Globe className="h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="font-medium">Wikidata</h3>
                      <p className="text-sm text-muted-foreground">Données structurées de Wikipedia</p>
                    </div>
                  </div>
                  <p className="text-sm mb-3">
                    Informations biographiques détaillées, portraits et œuvres des grands compositeurs classiques.
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => handleApiImport('wikidata')}
                    disabled={isAnyStepLoading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Importer depuis Wikidata
                  </Button>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Music className="h-6 w-6 text-purple-600" />
                    <div>
                      <h3 className="font-medium">OpenOpus</h3>
                      <p className="text-sm text-muted-foreground">API spécialisée musique classique</p>
                    </div>
                  </div>
                  <p className="text-sm mb-3">
                    Catalogue complet d'œuvres classiques avec numéros de catalogue et classifications détaillées.
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => handleApiImport('openopus')}
                    disabled={isAnyStepLoading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Importer depuis OpenOpus
                  </Button>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="h-6 w-6 text-orange-600" />
                    <div>
                      <h3 className="font-medium">Import Complet</h3>
                      <p className="text-sm text-muted-foreground">Combine toutes les sources</p>
                    </div>
                  </div>
                  <p className="text-sm mb-3">
                    Récupère et combine les données de toutes les APIs pour une base de données enrichie.
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => handleApiImport('comprehensive')}
                    disabled={isAnyStepLoading}
                    variant="default"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Import Complet Multi-APIs
                  </Button>
                </Card>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">🌟 Avantages des APIs</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Données fiables</strong> : Sources reconnues et vérifiées</li>
                  <li>• <strong>Mise à jour automatique</strong> : Données toujours actuelles</li>
                  <li>• <strong>Métadonnées enrichies</strong> : Biographies, portraits, dates</li>
                  <li>• <strong>Classification précise</strong> : Genres, époques, catalogues</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="openopus" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Import depuis OpenOpus
              </CardTitle>
              <CardDescription>
                Importez des œuvres depuis la base de données OpenOpus
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Base de données OpenOpus</h3>
                <p className="text-muted-foreground mb-4">
                  Accédez à une vaste collection d'œuvres classiques avec métadonnées complètes
                </p>
                <Button 
                  onClick={handleOpenOpusImport}
                  disabled={isOpenOpusImporting}
                  size="lg"
                >
                  {isOpenOpusImporting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Import en cours...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Importer depuis OpenOpus
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="csv" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import CSV Personnalisé
              </CardTitle>
              <CardDescription>
                Importez vos propres données depuis des fichiers CSV
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Import CSV Avancé</h3>
                <p className="text-muted-foreground mb-4">
                  Utilisez notre système d'import CSV avec détection automatique des formats
                </p>
                <Button 
                  onClick={() => setCsvImportOpen(true)}
                  size="lg"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Ouvrir l'import CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="samples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Fichiers d'Exemple
              </CardTitle>
              <CardDescription>
                Téléchargez des exemples de fichiers CSV pour comprendre le format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(stepConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${config.color}`} />
                        <div>
                          <div className="font-medium">{config.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Exemple de fichier CSV
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadSampleCsv(key as any)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Télécharger
                      </Button>
                    </div>
                  );
                })}
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">💡 Conseils d'utilisation</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Respectez l'ordre : Compositeurs → Œuvres → Rôles → Airs</li>
                  <li>• Utilisez l'encodage UTF-8 pour les caractères spéciaux</li>
                  <li>• Les champs obligatoires sont marqués dans les exemples</li>
                  <li>• Le système détecte automatiquement le format CSV</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AdvancedCsvImportDialog
        open={csvImportOpen}
        onOpenChange={setCsvImportOpen}
        onImportSuccess={() => {
          toast({
            title: "Import réussi",
            description: "Les données ont été importées avec succès",
          });
        }}
      />
    </div>
  );
};

export default AutomatedDataImportSystem;