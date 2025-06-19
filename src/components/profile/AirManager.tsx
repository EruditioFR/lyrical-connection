
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Upload, Link, Music, Video } from 'lucide-react';
import { useArtistAirs } from '@/hooks/useArtistAirs';
import { useAuth } from '@/hooks/useAuth';

interface AirManagerProps {
  artistProfileId: string;
}

const AirManager: React.FC<AirManagerProps> = ({ artistProfileId }) => {
  const { user } = useAuth();
  const { airs, createAir, updateAir, deleteAir, isCreating, uploadFile, getFileUrl, deleteFile } = useArtistAirs(artistProfileId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAir, setEditingAir] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'url' as 'audio' | 'video' | 'url',
    external_url: '',
    file: null as File | null,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'url',
      external_url: '',
      file: null,
    });
    setEditingAir(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setUploading(true);
      let filePath = '';

      // Si c'est un fichier, l'uploader d'abord
      if (formData.file && (formData.type === 'audio' || formData.type === 'video')) {
        filePath = await uploadFile(formData.file, user.id);
      }

      const airData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        file_path: filePath || null,
        external_url: formData.type === 'url' ? formData.external_url : null,
        updated_at: new Date().toISOString(),
      };

      if (editingAir) {
        // Si on modifie un air existant et qu'il y avait un ancien fichier, le supprimer
        if (editingAir.file_path && filePath) {
          await deleteFile(editingAir.file_path);
        }
        updateAir({ id: editingAir.id, updates: airData });
      } else {
        createAir(airData);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting air:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (air: any) => {
    setEditingAir(air);
    setFormData({
      title: air.title,
      description: air.description || '',
      type: air.type,
      external_url: air.external_url || '',
      file: null,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (air: any) => {
    try {
      // Supprimer le fichier s'il existe
      if (air.file_path) {
        await deleteFile(air.file_path);
      }
      deleteAir(air.id);
    } catch (error) {
      console.error('Error deleting air:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file });
    }
  };

  const getAirIcon = (type: string) => {
    switch (type) {
      case 'audio': return Music;
      case 'video': return Video;
      case 'url': return Link;
      default: return Music;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Mes Airs</CardTitle>
            <CardDescription>
              Gérez vos enregistrements audio, vidéos et liens
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un air
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingAir ? 'Modifier l\'air' : 'Ajouter un air'}
                </DialogTitle>
                <DialogDescription>
                  Ajoutez un fichier audio, vidéo ou un lien vers votre répertoire
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="audio">Fichier Audio</SelectItem>
                      <SelectItem value="video">Fichier Vidéo</SelectItem>
                      <SelectItem value="url">Lien URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.type === 'url' ? (
                  <div className="space-y-2">
                    <Label htmlFor="external_url">URL *</Label>
                    <Input
                      id="external_url"
                      type="url"
                      value={formData.external_url}
                      onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                      placeholder="https://..."
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="file">Fichier *</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept={formData.type === 'audio' ? 'audio/*' : 'video/*'}
                      required={!editingAir}
                    />
                    {editingAir && (
                      <p className="text-sm text-muted-foreground">
                        Laissez vide pour garder le fichier actuel
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={uploading || isCreating}
                    className="flex-1"
                  >
                    {uploading ? 'Upload...' : (editingAir ? 'Modifier' : 'Ajouter')}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {airs.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Aucun air ajouté pour le moment
          </p>
        ) : (
          <div className="space-y-3">
            {airs.map((air) => {
              const IconComponent = getAirIcon(air.type);
              return (
                <div key={air.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{air.title}</p>
                      {air.description && (
                        <p className="text-sm text-muted-foreground">{air.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground capitalize">
                        {air.type === 'url' ? 'Lien' : `Fichier ${air.type}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(air)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer l'air</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer "{air.title}" ? Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(air)}>
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AirManager;
