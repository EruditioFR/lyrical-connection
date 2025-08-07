import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Search, Plus, MoreHorizontal, Edit, Trash2, Music, Users } from 'lucide-react';
import { useLyricalWorksAdmin, type LyricalWorkWithRoles } from '@/hooks/useLyricalWorksAdmin';
import { LyricalWorkDialog } from './LyricalWorkDialog';
import { WorkRoleDialog } from './WorkRoleDialog';
import type { Tables } from '@/integrations/supabase/types';

export const LyricalWorksManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showWorkDialog, setShowWorkDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [editingWork, setEditingWork] = useState<LyricalWorkWithRoles | null>(null);
  const [editingRole, setEditingRole] = useState<Tables<'work_roles'> | null>(null);
  const [selectedWorkId, setSelectedWorkId] = useState<string>('');
  const [deleteWork, setDeleteWork] = useState<LyricalWorkWithRoles | null>(null);
  const [deleteRole, setDeleteRole] = useState<Tables<'work_roles'> | null>(null);

  const {
    works,
    isLoading,
    createWork,
    updateWork,
    deleteWork: performDeleteWork,
    createRole,
    updateRole,
    deleteRole: performDeleteRole,
    isCreatingWork,
    isUpdatingWork,
    isDeletingWork,
    isCreatingRole,
    isUpdatingRole,
    isDeletingRole,
  } = useLyricalWorksAdmin();

  // Calculate statistics
  const stats = useMemo(() => {
    const totalWorks = works.length;
    const totalRoles = works.reduce((sum, work) => sum + work.work_roles.length, 0);
    const categories = [...new Set(works.map(work => work.category))];
    const composers = [...new Set(works.map(work => work.composer))];
    
    return {
      totalWorks,
      totalRoles,
      totalCategories: categories.length,
      totalComposers: composers.length,
    };
  }, [works]);

  // Filter works
  const filteredWorks = useMemo(() => {
    return works.filter(work => {
      const matchesSearch = searchTerm === '' || 
        work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.composer.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || work.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [works, searchTerm, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(works.map(work => work.category))];
    return uniqueCategories.sort();
  }, [works]);

  const handleCreateWork = (data: any) => {
    createWork(data);
    setShowWorkDialog(false);
  };

  const handleUpdateWork = (data: any) => {
    if (editingWork) {
      updateWork({ id: editingWork.id, data });
      setEditingWork(null);
      setShowWorkDialog(false);
    }
  };

  const handleDeleteWork = (work: LyricalWorkWithRoles) => {
    performDeleteWork(work.id);
    setDeleteWork(null);
  };

  const handleCreateRole = (data: any) => {
    createRole(data);
    setShowRoleDialog(false);
    setSelectedWorkId('');
  };

  const handleUpdateRole = (data: any) => {
    if (editingRole) {
      const { work_id, ...updateData } = data;
      updateRole({ id: editingRole.id, data: updateData });
      setEditingRole(null);
      setShowRoleDialog(false);
      setSelectedWorkId('');
    }
  };

  const handleDeleteRole = (role: Tables<'work_roles'>) => {
    performDeleteRole(role.id);
    setDeleteRole(null);
  };

  const getDifficultyBadge = (level: number) => {
    const variants = {
      1: 'secondary',
      2: 'outline',
      3: 'default', 
      4: 'destructive',
      5: 'destructive',
    } as const;
    
    const labels = {
      1: 'Très facile',
      2: 'Facile',
      3: 'Moyen',
      4: 'Difficile', 
      5: 'Très difficile',
    };

    return (
      <Badge variant={variants[level as keyof typeof variants] || 'default'}>
        {labels[level as keyof typeof labels] || 'Moyen'}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des œuvres lyriques...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.totalWorks}</div>
            <div className="text-sm text-muted-foreground">Œuvres lyriques</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.totalRoles}</div>
            <div className="text-sm text-muted-foreground">Rôles disponibles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <div className="text-sm text-muted-foreground">Catégories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.totalComposers}</div>
            <div className="text-sm text-muted-foreground">Compositeurs</div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher une œuvre ou un compositeur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <Button
              onClick={() => {
                setEditingWork(null);
                setShowWorkDialog(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle œuvre
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Works Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Œuvres lyriques ({filteredWorks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Compositeur</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Langue</TableHead>
                <TableHead>Difficulté</TableHead>
                <TableHead>Rôles</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorks.map((work) => (
                <TableRow key={work.id}>
                  <TableCell className="font-medium">{work.title}</TableCell>
                  <TableCell>{work.composer}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{work.category}</Badge>
                  </TableCell>
                  <TableCell>{work.period || '-'}</TableCell>
                  <TableCell>{work.language || '-'}</TableCell>
                  <TableCell>{getDifficultyBadge(work.difficulty_level || 3)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {work.work_roles.length}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedWorkId(work.id);
                          setEditingRole(null);
                          setShowRoleDialog(true);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingWork(work);
                            setShowWorkDialog(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteWork(work)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Roles for each work */}
      {filteredWorks.map((work) => (
        work.work_roles.length > 0 && (
          <Card key={`roles-${work.id}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Rôles de "{work.title}"
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom du rôle</TableHead>
                    <TableHead>Tessiture</TableHead>
                    <TableHead>Aria principale</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {work.work_roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.role_name}</TableCell>
                      <TableCell>
                        {role.voice_type ? (
                          <Badge variant="outline">{role.voice_type}</Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{role.aria_title || '-'}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {role.description || '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingRole(role);
                                setSelectedWorkId(work.id);
                                setShowRoleDialog(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteRole(role)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      ))}

      {/* Dialogs */}
      <LyricalWorkDialog
        open={showWorkDialog}
        onOpenChange={setShowWorkDialog}
        work={editingWork || undefined}
        onSubmit={editingWork ? handleUpdateWork : handleCreateWork}
        isLoading={isCreatingWork || isUpdatingWork}
      />

      <WorkRoleDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        workId={selectedWorkId}
        role={editingRole || undefined}
        onSubmit={editingRole ? handleUpdateRole : handleCreateRole}
        isLoading={isCreatingRole || isUpdatingRole}
      />

      {/* Delete Work Confirmation */}
      <AlertDialog open={!!deleteWork} onOpenChange={() => setDeleteWork(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'œuvre lyrique</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'œuvre "{deleteWork?.title}" ?
              Cette action supprimera également tous les rôles associés et ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteWork && handleDeleteWork(deleteWork)}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeletingWork}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Role Confirmation */}
      <AlertDialog open={!!deleteRole} onOpenChange={() => setDeleteRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le rôle</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le rôle "{deleteRole?.role_name}" ?
              Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRole && handleDeleteRole(deleteRole)}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeletingRole}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};