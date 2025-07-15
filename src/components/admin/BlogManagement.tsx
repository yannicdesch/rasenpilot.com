import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, Eye, Save, X, Sparkles, List } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AiBlogGenerator from '@/components/AiBlogGenerator';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  status: string;
  date: string;
  read_time: number;
  image: string;
  tags: string;
  views: number;
  seo: any;
  created_at: string;
  updated_at: string;
}

const BlogManagement = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const emptyPost: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'views' | 'seo'> = {
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    author: '',
    category: '',
    status: 'draft',
    date: new Date().toISOString().split('T')[0],
    read_time: 5,
    image: '/placeholder.svg',
    tags: ''
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        toast({
          title: "Fehler",
          description: "Blog-Artikel konnten nicht geladen werden",
          variant: "destructive",
        });
      } else {
        setPosts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[äöü]/g, match => ({ 'ä': 'ae', 'ö': 'oe', 'ü': 'ue' }[match] || match))
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSave = async (post: BlogPost | Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'views' | 'seo'>) => {
    try {
      const postData = {
        ...post,
        slug: post.slug || generateSlug(post.title),
        updated_at: new Date().toISOString()
      };

      if ('id' in post) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', post.id);

        if (error) throw error;
        toast({
          title: "Erfolgreich",
          description: "Blog-Artikel wurde aktualisiert",
        });
      } else {
        // Create new post
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);

        if (error) throw error;
        toast({
          title: "Erfolgreich",
          description: "Blog-Artikel wurde erstellt",
        });
      }

      setEditingPost(null);
      setIsCreating(false);
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Fehler",
        description: "Blog-Artikel konnte nicht gespeichert werden",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Artikel löschen möchten?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Erfolgreich",
        description: "Blog-Artikel wurde gelöscht",
      });
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Fehler",
        description: "Blog-Artikel konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };

  const PostEditor = ({ post, onSave, onCancel }: {
    post: BlogPost | Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'views' | 'seo'>;
    onSave: (post: BlogPost | Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'views' | 'seo'>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(post);

    return (
      <Card>
        <CardHeader>
          <CardTitle>{'id' in post ? 'Artikel bearbeiten' : 'Neuer Artikel'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Artikel-Titel"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="artikel-slug"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="excerpt">Zusammenfassung</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Kurze Zusammenfassung des Artikels"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="content">Inhalt</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Vollständiger Artikel-Inhalt"
              rows={10}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="author">Autor</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Autor Name"
              />
            </div>
            <div>
              <Label htmlFor="category">Kategorie</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mowing">Mähen</SelectItem>
                  <SelectItem value="fertilizing">Düngen</SelectItem>
                  <SelectItem value="watering">Bewässerung</SelectItem>
                  <SelectItem value="problems">Probleme</SelectItem>
                  <SelectItem value="seasonal">Jahreszeiten</SelectItem>
                  <SelectItem value="general">Allgemein</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: string) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Entwurf</SelectItem>
                  <SelectItem value="published">Veröffentlicht</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Datum</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="read_time">Lesezeit (Min.)</Label>
              <Input
                id="read_time"
                type="number"
                value={formData.read_time}
                onChange={(e) => setFormData({ ...formData, read_time: parseInt(e.target.value) || 5 })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags (kommagetrennt)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => onSave(formData)} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Speichern
            </Button>
            <Button variant="outline" onClick={onCancel} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Abbrechen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return <div>Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Blog-Verwaltung</h1>
      
      <Tabs defaultValue="manual" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Manuelle Verwaltung
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Blog-Generator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Blog-Artikel verwalten</h2>
            <Button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Neuer Artikel
            </Button>
          </div>

          {isCreating && (
            <PostEditor
              post={emptyPost}
              onSave={handleSave}
              onCancel={() => setIsCreating(false)}
            />
          )}

          {editingPost && (
            <PostEditor
              post={editingPost}
              onSave={handleSave}
              onCancel={() => setEditingPost(null)}
            />
          )}

          <div className="grid gap-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{post.excerpt}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                        {post.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {post.author} • {new Date(post.date).toLocaleDateString('de-DE')} • {post.read_time} Min.
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPost(post)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">AI Blog-Generator</h2>
            <p className="text-gray-600">
              Automatische Erstellung von SEO-optimierten Blog-Artikeln mit KI-Unterstützung
            </p>
          </div>
          
          <AiBlogGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlogManagement;