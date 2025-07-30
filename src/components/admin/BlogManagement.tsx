import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  Calendar,
  Clock,
  Tag,
  FileText,
  Image,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBlogPosts, BlogPost } from '@/hooks/useBlogPosts';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ImageUploadField } from './ImageUploadField';

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  status: 'draft' | 'published';
  tags: string[];
  meta_title: string;
  meta_description: string;
  is_featured: boolean;
}

const initialFormData: BlogFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featured_image_url: '',
  status: 'draft',
  tags: [],
  meta_title: '',
  meta_description: '',
  is_featured: false,
};

const BlogManagement = () => {
  const { posts, loading, createPost, updatePost, deletePost, fetchAllPosts } = useBlogPosts();
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<BlogFormData>(initialFormData);
  const [tagInput, setTagInput] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch posts with drafts for admin
  useEffect(() => {
    fetchAllPosts();
  }, [fetchAllPosts]);

  // Filter posts
  useEffect(() => {
    let filtered = posts;

    if (searchTerm) {
      filtered = filtered.filter(
        post =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter);
    }

    setFilteredPosts(filtered);
  }, [posts, searchTerm, statusFilter]);

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      featured_image_url: post.featured_image_url || '',
      status: post.status,
      tags: post.tags || [],
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
      is_featured: post.is_featured,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPost(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit démarré', { formData });
    
    if (!formData.title.trim() || !formData.content.trim()) {
      console.log('Validation échouée - titre ou contenu manquant');
      toast({
        title: "Erreur",
        description: "Le titre et le contenu sont obligatoires",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      console.log('Tentative de sauvegarde...', { editingPost: !!editingPost });
      
      if (editingPost) {
        console.log('Mise à jour du post...', editingPost.id);
        await updatePost(editingPost.id, formData);
        toast({
          title: "Article mis à jour",
          description: "L'article a été mis à jour avec succès",
        });
      } else {
        console.log('Création du post...');
        await createPost(formData);
        toast({
          title: "Article créé",
          description: "L'article a été créé avec succès",
        });
      }
      setIsDialogOpen(false);
      fetchAllPosts();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePost(id);
      toast({
        title: "Article supprimé",
        description: "L'article a été supprimé avec succès",
      });
      setDeleteConfirm(null);
      fetchAllPosts();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la suppression",
        variant: "destructive",
      });
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Gestion du Blog</h2>
        <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Nouvel article
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher dans les articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="published">Publiés</SelectItem>
            <SelectItem value="draft">Brouillons</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            {post.featured_image_url && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                <div className="flex items-center space-x-1 ml-2">
                  {post.status === 'published' ? (
                    <Badge variant="default">Publié</Badge>
                  ) : (
                    <Badge variant="secondary">Brouillon</Badge>
                  )}
                  {post.is_featured && (
                    <Badge variant="outline">À la une</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {post.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {format(new Date(post.created_at), 'dd/MM/yy')}
                  </span>
                  {post.reading_time && (
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {post.reading_time}min
                    </span>
                  )}
                  <span className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {post.view_count}
                  </span>
                </div>
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {post.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{post.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(post)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer l'article</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(post.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun article trouvé.</p>
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? 'Modifier l\'article' : 'Créer un article'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Contenu</TabsTrigger>
                <TabsTrigger value="settings">Paramètres</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        title: e.target.value,
                        slug: prev.slug === '' ? generateSlug(e.target.value) : prev.slug
                      }));
                    }}
                    placeholder="Titre de l'article"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-de-l-article"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Extrait</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Bref résumé de l'article..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Contenu *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Contenu de l'article (HTML supporté)..."
                    rows={12}
                    required
                  />
                </div>

                <ImageUploadField
                  label="Image à la une"
                  value={formData.featured_image_url}
                  onChange={(url) => setFormData(prev => ({ ...prev, featured_image_url: url }))}
                  bucket="blog-images"
                  path="featured"
                />
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'draft' | 'published') =>
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="published">Publié</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, is_featured: checked }))
                    }
                  />
                  <Label htmlFor="featured">Mettre à la une</Label>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Ajouter un tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline">
                      Ajouter
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer">
                        {tag}
                        <X
                          className="w-3 h-3 ml-1"
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Titre SEO</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="Titre pour les moteurs de recherche"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description">Description SEO</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="Description pour les moteurs de recherche"
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Separator />
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={submitting}>
                <Save className="w-4 h-4 mr-2" />
                {submitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogManagement;