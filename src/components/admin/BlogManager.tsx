import { useState, useEffect } from 'react';
import { useBlogPosts, BlogPost } from '@/hooks/useBlogPosts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash2, Eye, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BlogPostDialog } from './BlogPostDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export const BlogManager = () => {
  const { posts, loading, fetchAllPosts, deletePost } = useBlogPosts();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchAllPosts();
  }, []);

  const handleCreatePost = () => {
    setSelectedPost(null);
    setDialogOpen(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post);
    setDialogOpen(true);
  };

  const handleDeletePost = async (id: string) => {
    try {
      await deletePost(id);
      fetchAllPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedPost(null);
    fetchAllPosts();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion du Blog</h2>
          <p className="text-muted-foreground">
            Créez, modifiez et publiez vos articles de blog
          </p>
        </div>
        <Button onClick={handleCreatePost} className="gap-2">
          <Plus className="w-4 h-4" />
          Nouvel article
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <Card key={post.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2 pr-2">
                    {post.title}
                  </CardTitle>
                  <Badge 
                    variant={post.status === 'published' ? 'default' : 'secondary'}
                    className="ml-2 flex-shrink-0"
                  >
                    {post.status === 'published' ? 'Publié' : 'Brouillon'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {post.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{post.tags.length - 2}
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-muted-foreground mb-4 space-y-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Créé le {format(new Date(post.created_at), 'dd/MM/yyyy', { locale: fr })}
                  </div>
                  {post.published_at && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Publié le {format(new Date(post.published_at), 'dd/MM/yyyy', { locale: fr })}
                    </div>
                  )}
                  {post.reading_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.reading_time} min de lecture
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditPost(post)}
                    className="gap-1 flex-1"
                  >
                    <Edit className="w-3 h-3" />
                    Modifier
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive" className="gap-1">
                        <Trash2 className="w-3 h-3" />
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
                          onClick={() => handleDeletePost(post.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
      )}

      {posts.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Aucun article</h3>
          <p className="text-muted-foreground mb-4">
            Commencez par créer votre premier article de blog.
          </p>
          <Button onClick={handleCreatePost} className="gap-2">
            <Plus className="w-4 h-4" />
            Créer un article
          </Button>
        </div>
      )}

      <BlogPostDialog
        post={selectedPost}
        open={dialogOpen}
        onClose={handleDialogClose}
      />
    </div>
  );
};