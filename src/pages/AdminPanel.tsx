
import React, { useState } from 'react';
import MainNavigation from '@/components/MainNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Users, FileText, Settings, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLawn } from '@/context/LawnContext';
import { Helmet } from 'react-helmet-async';
import SiteAnalytics from '@/components/admin/SiteAnalytics';
import UserManagement from '@/components/admin/UserManagement';
import ContentManagement from '@/components/admin/ContentManagement';
import SiteSettings from '@/components/admin/SiteSettings';
import EmailSubscribers from '@/components/admin/EmailSubscribers';
import { Card } from '@/components/ui/card';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userData } = useLawn();
  const [activeTab, setActiveTab] = useState('analytics');
  
  // Redirect to auth page if not logged in or not admin
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    } else if (userData?.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, userData]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <Helmet>
        <title>Admin Panel - Rasenpilot</title>
        <meta name="description" content="Administrationsbereich für Rasenpilot - Verwalten Sie Ihre Website, Inhalte und Benutzer" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <MainNavigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-green-800 flex items-center gap-2">
              <Settings className="h-8 w-8" />
              Admin Panel
            </h1>
            <p className="text-gray-600 mt-2">
              Verwalten Sie Ihre Website, Inhalte und Benutzer
            </p>
          </div>

          <Card className="p-0 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-5 rounded-none bg-muted/50">
                <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-background">
                  <BarChart className="h-4 w-4" />
                  <span className="hidden sm:inline">Statistiken</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-background">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Benutzer</span>
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-2 data-[state=active]:bg-background">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Inhalte</span>
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center gap-2 data-[state=active]:bg-background">
                  <Mail className="h-4 w-4" />
                  <span className="hidden sm:inline">E-Mail-Abonnenten</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-background">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Einstellungen</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="analytics" className="p-4">
                <SiteAnalytics />
              </TabsContent>
              
              <TabsContent value="users" className="p-4">
                <UserManagement />
              </TabsContent>
              
              <TabsContent value="content" className="p-4">
                <ContentManagement />
              </TabsContent>
              
              <TabsContent value="email" className="p-4">
                <EmailSubscribers />
              </TabsContent>
              
              <TabsContent value="settings" className="p-4">
                <SiteSettings />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
