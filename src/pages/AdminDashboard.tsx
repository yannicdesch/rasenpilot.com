
import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, FileText, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLawn } from '@/context/LawnContext';

const AdminDashboard = () => {
  const { isAdmin } = useLawn();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-gray-900">
      <MainNavigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-800 dark:text-green-400 flex items-center gap-2">
                <Shield className="h-8 w-8" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Verwalten Sie Ihre Website-Inhalte und Benutzer
              </p>
            </div>
            
            <div className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
              Administrator
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Blog Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Blog-Verwaltung
                </CardTitle>
                <CardDescription>
                  Erstellen und bearbeiten Sie Blog-Inhalte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link to="/blog/new">
                    <Button className="w-full" variant="outline">
                      Neuen Beitrag erstellen
                    </Button>
                  </Link>
                  <Link to="/blog">
                    <Button className="w-full" variant="outline">
                      Beiträge verwalten
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            {/* SEO Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  SEO-Verwaltung
                </CardTitle>
                <CardDescription>
                  SEO-Optimierungen und Content-Management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/seo">
                  <Button className="w-full" variant="outline">
                    SEO-Inhalte verwalten
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            {/* User Management (Future Feature) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Benutzerverwaltung
                </CardTitle>
                <CardDescription>
                  Benutzerkonten und Rollen verwalten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/admin/users">
                  <Button className="w-full" variant="outline">
                    Benutzer verwalten
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
