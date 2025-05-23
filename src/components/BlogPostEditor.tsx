import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Book, BookOpen, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useContent } from '@/hooks/useContent';
import { Badge } from '@/components/ui/badge';

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
  author: string;
  status: 'published' | 'draft';
  views: number;
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
  author: 'Admin',
  status: 'draft',
  views: 0,
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
  const { blogPosts, createBlogPost, updateBlogPost } = useContent();
  
  useEffect(() => {
    if (id) {
      // Try to find the post in our content hook data
      const foundPost = blogPosts.find(post => post.id === parseInt(id));
      
      if (foundPost) {
        // Convert the post to our full BlogPostType format
        const fullPost: BlogPostType = {
          id: foundPost.id,
          title: foundPost.title || '',
          slug: foundPost.slug || '',
          excerpt: foundPost.excerpt || '',
          content: foundPost.content || '',
          image: '/placeholder.svg',
          category: foundPost.category || 'Rasenpflege',
          readTime: 5,
          tags: foundPost.tags || '',
          date: foundPost.date || new Date().toISOString().split('T')[0],
          author: foundPost.author || 'Admin',
          status: foundPost.status || 'draft',
          views: foundPost.views || 0,
          seo: {
            metaTitle: foundPost.seo?.metaTitle || '',
            metaDescription: foundPost.seo?.metaDescription || '',
            keywords: foundPost.seo?.keywords || '',
          }
        };
        
        setBlogPost(fullPost);
        return;
      }
      
      // Fallback to localStorage
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
        console.log(`Loading sample post ${id}`);
        // In a real app, you'd fetch from an API here
      }
    }
  }, [id, blogPosts]);
  
  const handleChange = (field: keyof BlogPostType | string, value: string | number) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'seo') {
        setBlogPost(prev => ({
          ...prev,
          seo: {
            ...prev.seo,
            [child]: value
          }
        }));
      }
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
  
  const handleSave = async () => {
    try {
      // Prepare the post data in the format expected by our hooks
      const postData = {
        title: blogPost.title,
        slug: blogPost.slug,
        excerpt: blogPost.excerpt,
        content: blogPost.content,
        category: blogPost.category,
        tags: blogPost.tags,
        date: blogPost.date,
        author: blogPost.author,
        status: blogPost.status,
        seo: blogPost.seo
      };
      
      let success;
      
      if (id) {
        // Update existing post
        success = await updateBlogPost(parseInt(id), postData);
      } else {
        // Create new post
        const newId = await createBlogPost(postData);
        success = !!newId;
        if (newId) {
          // Redirect to edit page with the new ID
          navigate(`/blog/edit/${newId}`);
        }
      }
      
      if (success) {
        setSavedStatus('Blogbeitrag erfolgreich gespeichert!');
        
        setTimeout(() => {
          setSavedStatus(null);
        }, 3000);
      }
    } catch (error) {
      toast.error('Fehler beim Speichern', {
        description: 'Der Blogbeitrag konnte nicht gespeichert werden.'
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

  // Check if SEO title exceeds recommended length
  const seoTitleTooLong = (blogPost.seo.metaTitle || blogPost.title).length > 60;
  
  // Check if SEO description exceeds recommended length  
  const seoDescriptionTooLong = (blogPost.seo.metaDescription || blogPost.excerpt).length > 160;
  
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
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-title">SEO Titel</Label>
              {seoTitleTooLong && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Zu lang
                </Badge>
              )}
            </div>
            <Input 
              id="seo-title"
              value={blogPost.seo.metaTitle || blogPost.title} 
              onChange={(e) => handleChange('seo.metaTitle', e.target.value)}
              placeholder="SEO-optimierter Titel (oft gleich wie Haupttitel)"
              className={seoTitleTooLong ? 'border-red-300 focus-visible:ring-red-300' : ''}
            />
            <p className={`text-xs ${seoTitleTooLong ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
              {(blogPost.seo.metaTitle || blogPost.title).length}/60 Zeichen (Empfohlen: 50-60)
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-description">Meta-Beschreibung</Label>
              {seoDescriptionTooLong && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Zu lang
                </Badge>
              )}
            </div>
            <Textarea 
              id="seo-description"
              value={blogPost.seo.metaDescription || blogPost.excerpt} 
              onChange={(e) => handleChange('seo.metaDescription', e.target.value)}
              placeholder="Kurze Beschreibung für Suchmaschinen"
              className={`resize-y h-20 ${seoDescriptionTooLong ? 'border-red-300 focus-visible:ring-red-300' : ''}`}
            />
            <p className={`text-xs ${seoDescriptionTooLong ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
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
            disabled={seoTitleTooLong || seoDescriptionTooLong}
          >
            Blogbeitrag speichern
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BlogPostEditor;
