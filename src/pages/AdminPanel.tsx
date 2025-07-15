
import React from 'react';
import SecureAdminAuth from '@/components/admin/SecureAdminAuth';
import MainNavigation from '@/components/MainNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Users, Settings, FileText, Globe, Database, BookOpen } from 'lucide-react';
import SiteAnalytics from '@/components/admin/SiteAnalytics';
import UserManagement from '@/components/admin/UserManagement';
import SiteSettings from '@/components/admin/SiteSettings';
import ContentManagement from '@/components/admin/ContentManagement';

import { DatabaseSetup } from '@/components/admin/DatabaseSetup';
import BlogManagement from '@/components/admin/BlogManagement';

const AdminPanel = () => {
  return (
    <SecureAdminAuth>
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <MainNavigation />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-green-800 mb-2">
                Admin Panel
              </h1>
              <p className="text-gray-600">
                Verwalten Sie Ihre Website und analysieren Sie wichtige Kennzahlen
              </p>
            </div>

            <Tabs defaultValue="analytics" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Statistiken</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Benutzer</span>
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Inhalte</span>
                </TabsTrigger>
                <TabsTrigger value="blog" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Blog</span>
                </TabsTrigger>
                <TabsTrigger value="database" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="hidden sm:inline">Datenbank</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Einstellungen</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analytics">
                <SiteAnalytics />
              </TabsContent>

              <TabsContent value="users">
                <UserManagement />
              </TabsContent>

              <TabsContent value="content">
                <ContentManagement />
              </TabsContent>

              <TabsContent value="blog">
                <BlogManagement />
              </TabsContent>

              <TabsContent value="database">
                <DatabaseSetup />
              </TabsContent>

              <TabsContent value="settings">
                <SiteSettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </SecureAdminAuth>
  );
};

export default AdminPanel;
