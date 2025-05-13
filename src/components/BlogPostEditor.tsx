
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Book, BookOpen } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

type BlogPostType = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  readTime: number;
  tags: string;
  date: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
};

const initialBlogPost: BlogPostType = {
  id: Date.now(),
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  image: '/placeholder.svg',
  category: 'Rasenpflege',
  readTime: 5,
  tags: '',
  date: new Date().toISOString().split('T')[0],
  seo: {
    metaTitle: '',
    metaDescription: '',
    keywords: '',
  }
};

const BlogPostEditor = () => {
  const [blogPost, setBlogPost] = useState<BlogPostType>(initialBlogPost);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  
  useEffect(() => {
    if (id) {
      // Try to load from localStorage first
      const savedPosts = localStorage.getItem('blogPosts');
      if (savedPosts) {
        try {
          const parsedPosts = JSON.parse(savedPosts);
          const foundPost = parsedPosts.find((post: BlogPostType) => post.id === parseInt(id));
          if (foundPost) {
            setBlogPost(foundPost);
            return;
          }
        } catch (e) {
          console.error('Error parsing saved blog posts:', e);
        }
      }
      
      // Fallback to sample data if ID is 1, 2, or 3
      if (['1', '2', '3'].includes(id)) {
        // Simulate fetching from API
        console.log(`Loading sample post ${id}`);
        // In a real app, you'd fetch from an API here
      }
    }
  }, [id]);
  
  const handleChange = (field: keyof BlogPostType | string, value: string | number) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setBlogPost(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof BlogPostType],
          [child]: value
        }
      }));
    } else {
      setBlogPost(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // If title changes, generate a slug
    if (field === 'title' && typeof value === 'string') {
      const slug = value
        .toLowerCase()
        .replace(/[äöüß]/g, match => {
          if (match === 'ä') return 'ae';
          if (match === 'ö') return 'oe';
          if (match === 'ü') return 'ue';
          if (match === 'ß') return 'ss';
          return match;
        })
        .replace(/[^\w\s]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/-+/g, '-'); // Replace multiple - with single -
      
      setBlogPost(prev => ({
        ...prev,
        slug
      }));
    }
    
    setSavedStatus(null);
  };
  
  const handleSave = () => {
    try {
      // In a real app, you would save to a database
      // For now, we'll use localStorage
      const savedPosts = localStorage.getItem('blogPosts');
      let posts = savedPosts ? JSON.parse(savedPosts) : [];
      
      // Check if post already exists
      const existingPostIndex = posts.findIndex((post: BlogPostType) => post.id === blogPost.id);
      
      if (existingPostIndex >= 0) {
        // Update existing post
        posts[existingPostIndex] = blogPost;
      } else {
        // Add new post
        posts.push(blogPost);
      }
      
      localStorage.setItem('blogPosts', JSON.stringify(posts));
      
      setSavedStatus('Blogbeitrag erfolgreich gespeichert!');
      toast({
        title: "Erfolgreich gespeichert",
        description: "Ihr Blogbeitrag wurde erfolgreich gespeichert."
      });
      
      setTimeout(() => {
        setSavedStatus(null);
      }, 3000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fehler beim Speichern",
        description: "Der Blogbeitrag konnte nicht gespeichert werden."
      });
      console.error('Error saving blog post:', error);
    }
  };
  
  const handlePreview = () => {
    setPreviewMode(!previewMode);
  };
  
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange('tags', e.target.value);
  };
  
  return (
    <Card className="w-full">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Inhalt
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2" onClick={handlePreview}>
            <BookOpen className="h-4 w-4" />
            Vorschau
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input 
              id="title"
              value={blogPost.title} 
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Titel des Blogbeitrags"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slug">URL-Slug</Label>
            <Input 
              id="slug"
              value={blogPost.slug} 
              onChange={(e) => handleChange('slug', e.target.value)}
              placeholder="url-freundlicher-slug"
            />
            <p className="text-xs text-muted-foreground">
              Dies ist der Teil der URL, der für diesen Beitrag verwendet wird.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="excerpt">Auszug / Teaser</Label>
            <Textarea 
              id="excerpt"
              value={blogPost.excerpt} 
              onChange={(e) => handleChange('excerpt', e.target.value)}
              placeholder="Kurze Zusammenfassung des Inhalts (wird in Vorschau angezeigt)"
              className="resize-y h-20"
            />
            <p className="text-xs text-muted-foreground">
              {blogPost.excerpt.length}/160 Zeichen
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Inhalt</Label>
            <Textarea 
              id="content"
              value={blogPost.content} 
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Hauptinhalt des Blogbeitrags"
              className="resize-y min-h-[300px]"
            />
            <p className="text-xs text-muted-foreground">
              {blogPost.content.length} Zeichen (empfohlen: mindestens 2000)
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategorie</Label>
              <Input 
                id="category"
                value={blogPost.category} 
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="z.B. Rasenpflege"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="readTime">Lesezeit (Minuten)</Label>
              <Input 
                id="readTime"
                type="number"
                value={blogPost.readTime.toString()} 
                onChange={(e) => handleChange('readTime', parseInt(e.target.value) || 1)}
                min={1}
                max={60}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (mit Kommas trennen)</Label>
            <Input 
              id="tags"
              value={blogPost.tags} 
              onChange={handleTagsChange}
              placeholder="z.B. Rasenmähen, Düngen, Sommerpflege"
            />
          </div>
        </TabsContent>

        <TabsContent value="seo" className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seo-title">SEO Titel</Label>
            <Input 
              id="seo-title"
              value={blogPost.seo.metaTitle || blogPost.title} 
              onChange={(e) => handleChange('seo.metaTitle', e.target.value)}
              placeholder="SEO-optimierter Titel (oft gleich wie Haupttitel)"
            />
            <p className="text-xs text-muted-foreground">
              {(blogPost.seo.metaTitle || blogPost.title).length}/60 Zeichen (Empfohlen: 50-60)
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="seo-description">Meta-Beschreibung</Label>
            <Textarea 
              id="seo-description"
              value={blogPost.seo.metaDescription || blogPost.excerpt} 
              onChange={(e) => handleChange('seo.metaDescription', e.target.value)}
              placeholder="Kurze Beschreibung für Suchmaschinen"
              className="resize-y h-20"
            />
            <p className="text-xs text-muted-foreground">
              {(blogPost.seo.metaDescription || blogPost.excerpt).length}/160 Zeichen (Empfohlen: 150-160)
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="seo-keywords">Keywords (mit Kommas getrennt)</Label>
            <Input 
              id="seo-keywords"
              value={blogPost.seo.keywords} 
              onChange={(e) => handleChange('seo.keywords', e.target.value)}
              placeholder="z.B. Rasen mähen, Rasenpflege Tipps, gesunder Rasen"
            />
          </div>
        </TabsContent>

        <TabsContent value="preview" className="p-4">
          {previewMode && (
            <div className="border rounded-md p-6 max-w-3xl mx-auto bg-white">
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-3">{blogPost.title || 'Titel des Beitrags'}</h1>
                <div className="flex items-center text-sm text-gray-500 gap-4 mb-4">
                  <span>{blogPost.date}</span>
                  <span>{blogPost.category}</span>
                  <span>{blogPost.readTime} min Lesezeit</span>
                </div>
                <p className="text-gray-700 italic">{blogPost.excerpt || 'Auszug des Beitrags...'}</p>
              </div>
              
              <div className="prose max-w-none">
                {blogPost.content ? (
                  <p style={{ whiteSpace: 'pre-wrap' }}>{blogPost.content}</p>
                ) : (
                  <p className="text-gray-400">Noch kein Inhalt verfügbar.</p>
                )}
              </div>
              
              {blogPost.tags && (
                <div className="mt-6 pt-4 border-t">
                  <div className="flex flex-wrap gap-2">
                    {blogPost.tags.split(',').map((tag, index) => (
                      <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CardFooter className="flex justify-between items-center p-4 border-t">
        <div>
          {savedStatus && (
            <p className="text-sm text-green-600">{savedStatus}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/blog')}
          >
            Abbrechen
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-green-600 hover:bg-green-700"
          >
            Blogbeitrag speichern
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BlogPostEditor;
