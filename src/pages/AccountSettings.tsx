import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import UserDataManagement from '@/components/UserDataManagement';
import CookieSettings from '@/components/CookieSettings';
import ConsentManagement from '@/components/ConsentManagement';
import EmailPreferencesSettings from '@/components/EmailPreferencesSettings';
import LawnProfileSettings from '@/components/LawnProfileSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Cookie, User, Mail, Leaf } from 'lucide-react';

const AccountSettings = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('data');

  useEffect(() => {
    // Check if there's a state parameter to set active tab
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Account-Einstellungen
            </h1>
            <p className="text-muted-foreground">
              Verwalten Sie Ihre Daten und Datenschutz-Einstellungen
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Meine Daten</span>
                <span className="sm:hidden">Daten</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                <span className="hidden sm:inline">Rasen-Profil</span>
                <span className="sm:hidden">Rasen</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">E-Mail</span>
                <span className="sm:hidden">E-Mail</span>
              </TabsTrigger>
              <TabsTrigger value="cookies" className="flex items-center gap-2">
                <Cookie className="h-4 w-4" />
                <span className="hidden sm:inline">Cookies</span>
                <span className="sm:hidden">Cookies</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="data" className="space-y-6">
              <UserDataManagement />
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <LawnProfileSettings />
            </TabsContent>

            <TabsContent value="email" className="space-y-6">
              <ConsentManagement />
              <EmailPreferencesSettings />
            </TabsContent>

            <TabsContent value="cookies" className="space-y-6">
              <CookieSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;