import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image_url?: string;
  status: 'draft' | 'published';
  published_at?: string;
  created_by: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  reading_time?: number;
  view_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export const useBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPublishedPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPosts((data || []) as BlogPost[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des articles');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPosts((data || []) as BlogPost[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des articles');
    } finally {
      setLoading(false);
    }
  };

  const fetchPostBySlug = async (slug: string): Promise<BlogPost> => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();
    
    if (error) throw error;
    return data as BlogPost;
  };

  const createPost = async (postData: any) => {
    if (!user) throw new Error('Utilisateur non connecté');
    
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([{ ...postData, created_by: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const updatePost = async (id: string, postData: any) => {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(postData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const deletePost = async (id: string) => {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  };

  const incrementViewCount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ view_count: posts.find(p => p.id === id)?.view_count + 1 || 1 })
        .eq('id', id);
      
      if (error) throw error;
    } catch (err) {
      console.error('Erreur lors de l\'incrémentation des vues:', err);
    }
  };

  useEffect(() => {
    fetchPublishedPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    fetchPublishedPosts,
    fetchAllPosts,
    fetchPostBySlug,
    createPost,
    updatePost,
    deletePost,
    incrementViewCount
  };
};