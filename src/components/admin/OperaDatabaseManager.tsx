import React, { useState, useMemo } from 'react';
import { Search, Plus, Music, BookOpen, Mic, Archive, Eye, Edit, Trash2, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useOperaDatabase, AriaWithDetails } from '@/hooks/useOperaDatabase';
import { useLyricalWorks, useWorkRoles } from '@/hooks/useLyricalWorks';
import { useComposers } from '@/hooks/useComposers';
import { useOpenOpusImport } from '@/hooks/useOpenOpusImport';
import AriaDialog from './AriaDialog';
import AdvancedCsvImportDialog from './AdvancedCsvImportDialog';

const OperaDatabaseManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [composerFilter, setComposerFilter] = useState<string>('all');
  const [ariaDialogOpen, setAriaDialogOpen] = useState(false);
  const [editingAria, setEditingAria] = useState<AriaWithDetails | null>(null);
  const [deletingAria, setDeletingAria] = useState<AriaWithDetails | null>(null);
  const [importQuery, setImportQuery] = useState('');
  const [importMode, setImportMode] = useState<'composers' | 'works' | 'all'>('all');
  const [advancedImportOpen, setAdvancedImportOpen] = useState(false);

  const { works } = useLyricalWorks();
  const { roles } = useWorkRoles();
  const { composers } = useComposers();
  const { importData, isImporting, importResult } = useOpenOpusImport();
  
  const {
    arias,
    isLoading,
    error,
    createAria,
    updateAria,
    deleteAria,
    isCreating,
    isUpdating,
    isDeleting,
  } = useOperaDatabase({
    searchTerm: searchTerm.length > 1 ? searchTerm : undefined,
    difficulty: difficultyFilter && difficultyFilter !== 'all' ? Number(difficultyFilter) : undefined,
  });

  // Statistics calculations
  const stats = useMemo(() => {
    const totalArias = arias.length;
    const totalWorks = works.length; // Use actual lyrical works count
    const avgDifficulty = arias.length > 0 
      ? arias.reduce((sum, aria) => sum + aria.difficulty_level, 0) / arias.length 
      : 0;
    const categories = new Set(works.map(work => work.category).filter(Boolean)).size;

    return {
      totalArias,
      totalWorks,
      avgDifficulty: Math.round(avgDifficulty * 10) / 10,
      categories,
    };
  }, [arias, works]);

  // Filtered arias
  const filteredArias = useMemo(() => {
    return arias.filter(aria => {
      const matchesCategory = !categoryFilter || categoryFilter === 'all' || aria.lyrical_works?.category === categoryFilter;
      return matchesCategory;
    });
  }, [arias, categoryFilter]);

  // Filtered works for the new Works tab
  const filteredWorks = useMemo(() => {
    return works.filter(work => {
      const matchesCategory = !categoryFilter || categoryFilter === 'all' || work.category === categoryFilter;
      const matchesComposer = !composerFilter || composerFilter === 'all' || work.composer === composerFilter;
      const matchesSearch = !searchTerm || searchTerm.length <= 1 || 
        work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.composer.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesComposer && matchesSearch;
    });
  }, [works, categoryFilter, composerFilter, searchTerm]);

  // Available categories
  const categories = useMemo(() => {
    return Array.from(new Set(works.map(work => work.category).filter(Boolean)));
  }, [works]);

  // Available composers
  const availableComposers = useMemo(() => {
    return Array.from(new Set(works.map(work => work.composer).filter(Boolean))).sort();
  }, [works]);

  const getDifficultyBadge = (level: number) => {
    const badges = {
      1: { variant: 'secondary' as const, text: 'Très facile' },
      2: { variant: 'outline' as const, text: 'Facile' },
      3: { variant: 'default' as const, text: 'Intermédiaire' },
      4: { variant: 'destructive' as const, text: 'Difficile' },
      5: { variant: 'destructive' as const, text: 'Très difficile' },
    };
    
    const badge = badges[level as keyof typeof badges] || badges[3];
    return <Badge variant={badge.variant}>{badge.text}</Badge>;
  };

  const handleCreateAria = (data: any) => {
    createAria(data);
    setAriaDialogOpen(false);
  };

  const handleUpdateAria = (data: any) => {
    if (editingAria) {
      updateAria({ id: editingAria.id, data });
      setEditingAria(null);
      setAriaDialogOpen(false);
    }
  };

  const handleDeleteAria = () => {
    if (deletingAria) {
      deleteAria(deletingAria.id);
      setDeletingAria(null);
    }
  };

  const handleImportFromOpenOpus = () => {
    importData({
      searchQuery: importQuery || undefined,
      importMode,
    });
  };

  const openEditDialog = (aria: AriaWithDetails) => {
    setEditingAria(aria);
    setAriaDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingAria(null);
    setAriaDialogOpen(true);
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Base de données lyrique</h2>
          <p className="text-muted-foreground">
            Gestion complète du répertoire opératique
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Recherche pour import..."
              value={importQuery}
              onChange={(e) => setImportQuery(e.target.value)}
              className="w-48"
            />
            <Select value={importMode} onValueChange={(value: 'composers' | 'works' | 'all') => setImportMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tout</SelectItem>
                <SelectItem value="composers">Compositeurs</SelectItem>
                <SelectItem value="works">Œuvres</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleImportFromOpenOpus} 
              disabled={isImporting}
              variant="outline"
            >
              {isImporting ? "Import..." : "Import OpenOpus"}
            </Button>
            <Button 
              onClick={() => setAdvancedImportOpen(true)} 
              variant="outline"
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Import CSV Avancé
            </Button>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvel air
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Airs</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArias}</div>
            <p className="text-xs text-muted-foreground">
              Répartis dans {stats.totalWorks} œuvres
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Œuvres</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.categories} catégories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Difficulté moyenne</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDifficulty}/5</div>
            <p className="text-xs text-muted-foreground">
              Niveau global du répertoire
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Base complète</CardTitle>
            <Mic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">
              Couverture répertoire
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres et recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par titre, premier vers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Difficulté" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes difficultés</SelectItem>
                <SelectItem value="1">Très facile</SelectItem>
                <SelectItem value="2">Facile</SelectItem>
                <SelectItem value="3">Intermédiaire</SelectItem>
                <SelectItem value="4">Difficile</SelectItem>
                <SelectItem value="5">Très difficile</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={composerFilter} onValueChange={setComposerFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Compositeur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous compositeurs</SelectItem>
                {availableComposers.map((composer) => (
                  <SelectItem key={composer} value={composer}>
                    {composer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="works" className="space-y-4">
        <TabsList>
          <TabsTrigger value="works">Œuvres</TabsTrigger>
          <TabsTrigger value="arias">Airs</TabsTrigger>
          <TabsTrigger value="recordings">Enregistrements</TabsTrigger>
          <TabsTrigger value="scores">Partitions</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>

        <TabsContent value="works" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Liste des œuvres</CardTitle>
              <CardDescription>
                {filteredWorks.length} œuvre(s) trouvée(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Compositeur</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Époque</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorks.map((work) => (
                    <TableRow key={work.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{work.title}</div>
                          {work.catalogue_number && (
                            <div className="text-sm text-muted-foreground">
                              {work.catalogue_number}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{work.composer}</div>
                        {work.composers && (
                          <div className="text-sm text-muted-foreground">
                            {work.composers.epoch}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{work.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {work.period || work.composers?.epoch || '-'}
                      </TableCell>
                      <TableCell>
                        {work.genre ? (
                          <Badge variant="secondary">{work.genre}</Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {work.description || '-'}
                      </TableCell>
                      <TableCell>
                        {work.openopus_work_id ? (
                          <Badge variant="outline">OpenOpus</Badge>
                        ) : (
                          <Badge variant="secondary">Manuel</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arias" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Liste des airs</CardTitle>
              <CardDescription>
                {filteredArias.length} air(s) trouvé(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-muted-foreground">Chargement...</div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-destructive">Erreur de chargement: {error.message}</div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Œuvre</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Difficulté</TableHead>
                      <TableHead>Durée</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArias.map((aria) => (
                      <TableRow key={aria.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{aria.title}</div>
                            {aria.first_line && (
                              <div className="text-sm text-muted-foreground italic">
                                "{aria.first_line}"
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{aria.lyrical_works?.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {aria.lyrical_works?.composer}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {aria.work_roles?.role_name}
                          {aria.work_roles?.voice_type && (
                            <div className="text-sm text-muted-foreground">
                              ({aria.work_roles.voice_type})
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {aria.aria_type && (
                            <Badge variant="outline">
                              {aria.aria_type}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {getDifficultyBadge(aria.difficulty_level)}
                        </TableCell>
                        <TableCell>
                          {aria.duration_minutes ? `${aria.duration_minutes} min` : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(aria)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingAria(aria)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recordings">
          <Card>
            <CardHeader>
              <CardTitle>Enregistrements</CardTitle>
              <CardDescription>
                Gestion des enregistrements audio et vidéo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Module des enregistrements - À développer
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scores">
          <Card>
            <CardHeader>
              <CardTitle>Partitions</CardTitle>
              <CardDescription>
                Gestion des partitions et transpositions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Module des partitions - À développer
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytiques</CardTitle>
              <CardDescription>
                Statistiques d'utilisation et popularité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Module analytique - À développer
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AriaDialog
        open={ariaDialogOpen}
        onOpenChange={setAriaDialogOpen}
        aria={editingAria}
        onSubmit={editingAria ? handleUpdateAria : handleCreateAria}
        isLoading={isCreating || isUpdating}
        works={works.map(w => ({ id: w.id, title: w.title, composer: w.composer }))}
        roles={roles.map(r => ({ id: r.id, role_name: r.role_name, voice_type: r.voice_type }))}
      />

      <AdvancedCsvImportDialog
        open={advancedImportOpen}
        onOpenChange={setAdvancedImportOpen}
        onImportSuccess={() => window.location.reload()}
      />

      <AlertDialog open={!!deletingAria} onOpenChange={() => setDeletingAria(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'air "{deletingAria?.title}" ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAria} disabled={isDeleting}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OperaDatabaseManager;