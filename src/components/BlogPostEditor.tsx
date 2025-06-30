
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import useContent, { BlogPost } from '@/hooks/useContent';
import { Save, Eye, ArrowLeft } from 'lucide-react';

interface BlogPostEditorProps {
  post?: BlogPost;
  onSave?: (post: BlogPost) => void;
  onCancel?: () => void;
}

const BlogPostEditor: React.FC<BlogPostEditorProps> = ({ post, onSave, onCancel }) => {
  const { addBlogPost, updateBlogPost } = useContent();
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    author: '',
    status: 'draft',
    date: new Date().toISOString().split('T')[0],
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: ''
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData({
        ...post,
        seo: post.seo || {
          metaTitle: '',
          metaDescription: '',
          keywords: ''
        }
      });
    }
  }, [post]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: !post ? generateSlug(value) : prev.slug // Only auto-generate slug for new posts
    }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content || !formData.category || !formData.author) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    setIsLoading(true);
    try {
      const postData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title),
        readTime: Math.ceil((formData.content?.length || 0) / 200), // Estimate reading time
      } as BlogPost;

      let savedPost: BlogPost;
      if (post && post.id) {
        savedPost = await updateBlogPost(post.id, postData);
      } else {
        savedPost = await addBlogPost(postData);
      }

      if (onSave) {
        onSave(savedPost);
      }
      
      toast.success(post ? 'Blog-Post aktualisiert!' : 'Blog-Post erstellt!');
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast.error('Fehler beim Speichern des Blog-Posts');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    'Rasenpflege',
    'Gartentipps',
    'Saisonale Pflege',
    'Pflanzenschutz',
    'Werkzeuge',
    'Tutorials'
  ];

  if (previewMode) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={() => setPreviewMode(false)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zum Editor
          </Button>
          <Badge variant={formData.status === 'published' ? 'default' : 'secondary'}>
            {formData.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
          </Badge>
        </div>

        <article className="prose prose-lg max-w-none">
          <h1>{formData.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
            <span>Von {formData.author}</span>
            <span>•</span>
            <span>{formData.date}</span>
            <span>•</span>
            <span>{formData.readTime} Min. Lesezeit</span>
          </div>
          
          {formData.excerpt && (
            <p className="text-lg text-muted-foreground border-l-4 border-primary pl-4 my-6">
              {formData.excerpt}
            </p>
          )}
          
          <div className="whitespace-pre-wrap">
            {formData.content}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {post ? 'Blog-Post bearbeiten' : 'Neuer Blog-Post'}
        </h1>
        <div className="flex gap-2">
          <Button onClick={() => setPreviewMode(true)} variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Vorschau
          </Button>
          {onCancel && (
            <Button onClick={onCancel} variant="outline">
              Abbrechen
            </Button>
          )}
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Speichern...' : 'Speichern'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Inhalt</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inhalt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Blog-Post Titel"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL-Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-slug"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Kurzbeschreibung</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Kurze Beschreibung des Blog-Posts"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Inhalt *</Label>
                <Textarea
                  id="content"
                  value={formData.content || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Blog-Post Inhalt"
                  rows={15}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Einstellungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Kategorie *</Label>
                  <Select 
                    value={formData.category || ''} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Autor *</Label>
                  <Input
                    id="author"
                    value={formData.author || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Autor Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Datum</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status || 'draft'} 
                    onValueChange={(value: 'published' | 'draft') => setFormData(prev => ({ ...prev, status: value }))}
                  >
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

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Tag1, Tag2, Tag3"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO-Einstellungen</CardTitle>
              <CardDescription>
                Optimieren Sie Ihren Blog-Post für Suchmaschinen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta-Titel</Label>
                <Input
                  id="metaTitle"
                  value={formData.seo?.metaTitle || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    seo: { ...prev.seo, metaTitle: e.target.value } 
                  }))}
                  placeholder="SEO-Titel (max. 60 Zeichen)"
                  maxLength={60}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta-Beschreibung</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.seo?.metaDescription || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    seo: { ...prev.seo, metaDescription: e.target.value } 
                  }))}
                  placeholder="SEO-Beschreibung (max. 160 Zeichen)"
                  maxLength={160}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  value={formData.seo?.keywords || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    seo: { ...prev.seo, keywords: e.target.value } 
                  }))}
                  placeholder="Keyword1, Keyword2, Keyword3"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlogPostEditor;
