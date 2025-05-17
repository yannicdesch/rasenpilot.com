
import React, { useState } from 'react';
import { FileText, PlusCircle, ExternalLink, Edit, Trash2, Eye, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useContent } from '@/hooks/useContent';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const ContentManagement = () => {
  const navigate = useNavigate();
  const [contentType, setContentType] = useState('blog');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  const { blogPosts, pages, isLoading, deleteBlogPost, refreshContent } = useContent();
  
  const filteredBlogPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || post.status === filter;
    return matchesSearch && matchesFilter;
  });
  
  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleCreateNewPost = () => {
    navigate('/blog/new');
  };
  
  const handleEditPost = (id: number) => {
    navigate(`/blog/edit/${id}`);
  };
  
  const handleViewPost = (id: number) => {
    // In a real app, this would navigate to the public post URL
    toast.info('Diese Aktion würde den Blog-Beitrag in einem neuen Tab öffnen');
  };
  
  const handleDeletePost = async (id: number) => {
    await deleteBlogPost(id);
  };
  
  const handleEditPage = (id: number) => {
    // In a real app, this would open a page editor
    toast.info('Seiteneditor würde geöffnet werden');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 border-3 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          <p className="text-green-600">Inhalte werden geladen...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Inhaltsverwaltung
        </h2>
        <Tabs value={contentType} onValueChange={setContentType} className="w-auto">
          <TabsList>
            <TabsTrigger value="blog">Blog-Beiträge</TabsTrigger>
            <TabsTrigger value="pages">Seiten</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {contentType === 'blog' && (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Beiträge suchen..."
                className="pl-9 w-full sm:w-[250px]"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex gap-2 items-center w-full sm:w-auto">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Beiträge</SelectItem>
                  <SelectItem value="published">Veröffentlicht</SelectItem>
                  <SelectItem value="draft">Entwurf</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleCreateNewPost}
                className="ml-2 bg-green-600 hover:bg-green-700 flex-shrink-0"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Neuer Beitrag
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Titel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Aufrufe</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBlogPosts.length > 0 ? (
                    filteredBlogPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={post.status === 'published' ? 'default' : 'secondary'}
                            className={post.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}
                          >
                            {post.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
                          </Badge>
                        </TableCell>
                        <TableCell>{post.author}</TableCell>
                        <TableCell>{post.category}</TableCell>
                        <TableCell>{post.date}</TableCell>
                        <TableCell>{post.views.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {post.status === 'published' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleViewPost(post.id)}
                                title="Ansehen"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditPost(post.id)}
                              title="Bearbeiten"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-500 hover:text-red-700"
                                  title="Löschen"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Blogbeitrag löschen</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Sind Sie sicher, dass Sie den Blogbeitrag "{post.title}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeletePost(post.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Löschen
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Keine Blog-Beiträge gefunden.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Zeige {filteredBlogPosts.length} von {blogPosts.length} Beiträgen
            </div>
            <Button variant="outline" onClick={() => navigate('/seo-management')}>
              SEO-Verwaltung öffnen
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      )}
      
      {contentType === 'pages' && (
        <>
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Seiten suchen..."
                className="pl-9 w-[250px]"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Seitentitel</TableHead>
                    <TableHead>Pfad</TableHead>
                    <TableHead>Letzte Aktualisierung</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPages.length > 0 ? (
                    filteredPages.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell className="font-medium">{page.title}</TableCell>
                        <TableCell>{page.path}</TableCell>
                        <TableCell>{page.lastUpdated}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => window.open(page.path, '_blank')}
                              title="Ansehen"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditPage(page.id)}
                              title="Bearbeiten"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Keine Seiten gefunden.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="text-sm text-muted-foreground">
            Zeige {filteredPages.length} von {pages.length} Seiten
          </div>
        </>
      )}
    </div>
  );
};

export default ContentManagement;
