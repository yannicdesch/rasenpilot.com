
import React, { useState, useEffect } from 'react';
import MainNavigation from '@/components/MainNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Users, FileText, Settings, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLawn } from '@/context/LawnContext';
import { Helmet } from 'react-helmet-async';
import SiteAnalytics from '@/components/admin/SiteAnalytics';
import UserManagement from '@/components/admin/UserManagement';
import ContentManagement from '@/components/admin/ContentManagement';
import { SiteSettings } from '@/components/admin/SiteSettings';
import EmailSubscribers from '@/components/admin/EmailSubscribers';
import { Card } from '@/components/ui/card';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userData } = useLawn();
  const [activeTab, setActiveTab] = useState('analytics');
  const [localAuthStatus, setLocalAuthStatus] = useState<boolean | null>(null);
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user just successfully logged in as admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsLoading(true);
      
      // Prüfen auf Admin-Login-Flag
      const adminLoginSuccess = localStorage.getItem('admin_login_success');
      
      if (adminLoginSuccess) {
        console.log('Admin login success flag found, setting admin status to true');
        setLocalAuthStatus(true);
        setIsAdminUser(true);
        setIsLoading(false);
        return;
      }
      
      // Sessionüberprüfung
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLocalAuthStatus(false);
          setIsAdminUser(false);
          setIsLoading(false);
          return;
        }
        
        const isLoggedIn = !!data.session;
        setLocalAuthStatus(isLoggedIn);
        
        // Wenn eingeloggt, Benutzerrolle überprüfen
        if (isLoggedIn && data.session) {
          try {
            // Benutzerrolle aus der profiles Tabelle abrufen
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', data.session.user.id)
              .single();
              
            if (userError) {
              console.warn('Konnte Benutzerrolle nicht abrufen:', userError);
              // Fallback: Behandeln als nicht-Admin
              setIsAdminUser(false);
            } else {
              // Admin-Status basierend auf der Rolle setzen
              setIsAdminUser(userData?.role === 'admin');
              
              if (userData?.role !== 'admin') {
                toast.error('Sie haben keine Administratorrechte');
              }
            }
          } catch (e) {
            console.error('Error checking user role:', e);
            setIsAdminUser(false);
          }
        } else {
          setIsAdminUser(false);
        }
      } catch (e) {
        console.error('Error in admin status check:', e);
        setLocalAuthStatus(false);
        setIsAdminUser(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
        <MainNavigation />
        <main className="flex-grow flex items-center justify-center">
          <div className="w-12 h-12 border-3 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  // Admin-Berechtigung von verschiedenen Quellen prüfen
  const hasAdminAccess = 
    (isAuthenticated && userData?.role === 'admin') || 
    localAuthStatus === true && isAdminUser === true;
    
  console.log('Admin access check:', {
    isAuthenticated,
    userDataRole: userData?.role,
    localAuthStatus,
    isAdminUser,
    hasAdminAccess
  });

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

          {hasAdminAccess ? (
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
          ) : (
            <Card className="p-6">
              <div className="flex flex-col items-center max-w-md mx-auto">
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-amber-600" />
                </div>
                <h2 className="text-2xl font-semibold text-center mb-2">Admin Anmeldung</h2>
                <p className="text-gray-500 text-center mb-6">
                  Bitte melden Sie sich an, um auf den Administrationsbereich zuzugreifen
                </p>
                <AdminLoginForm />
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
