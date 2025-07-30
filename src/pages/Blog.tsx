import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Eye, Tag } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const BlogSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-4 w-1/2" />
        </CardFooter>
      </Card>
    ))}
  </div>
);

const Blog = () => {
  const { posts, loading, error } = useBlogPosts();

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Erreur</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  const featuredPosts = posts.filter(post => post.is_featured);
  const regularPosts = posts.filter(post => !post.is_featured);

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Blog Lyrisphere
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez les dernières actualités, conseils et tendances du monde lyrique
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          {loading ? (
            <BlogSkeleton />
          ) : (
            <>
              {/* Featured Posts */}
              {featuredPosts.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Articles à la une</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {featuredPosts.map((post) => (
                      <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        {post.featured_image_url && (
                          <div className="aspect-[4/3] overflow-hidden">
                            <img
                              src={post.featured_image_url}
                              alt={post.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <h3 className="text-xl font-semibold text-foreground hover:text-primary transition-colors">
                            <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                          </h3>
                          {post.excerpt && (
                            <p className="text-muted-foreground line-clamp-2">{post.excerpt}</p>
                          )}
                        </CardHeader>
                        <CardContent>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {post.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center text-sm text-muted-foreground space-x-4">
                            {post.published_at && (
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {format(new Date(post.published_at), 'dd MMMM yyyy', { locale: fr })}
                              </span>
                            )}
                            {post.reading_time && (
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {post.reading_time} min
                              </span>
                            )}
                            <span className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {post.view_count}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* Regular Posts */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  {featuredPosts.length > 0 ? 'Autres articles' : 'Derniers articles'}
                </h2>
                {regularPosts.length === 0 && featuredPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">Aucun article publié pour le moment.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regularPosts.map((post) => (
                      <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        {post.featured_image_url && (
                          <div className="aspect-[4/3] overflow-hidden">
                            <img
                              src={post.featured_image_url}
                              alt={post.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">
                            <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                          </h3>
                          {post.excerpt && (
                            <p className="text-muted-foreground text-sm line-clamp-3">{post.excerpt}</p>
                          )}
                        </CardHeader>
                        <CardContent>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {post.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="pt-0">
                          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                            {post.published_at && (
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {format(new Date(post.published_at), 'dd/MM/yyyy', { locale: fr })}
                              </span>
                            )}
                            {post.reading_time && (
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {post.reading_time} min
                              </span>
                            )}
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Blog;