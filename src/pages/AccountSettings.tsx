import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import UserDataManagement from '@/components/UserDataManagement';
import CookieSettings from '@/components/CookieSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Cookie, User } from 'lucide-react';

const AccountSettings = () => {
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

          <Tabs defaultValue="data" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Meine Daten</span>
                <span className="sm:hidden">Daten</span>
              </TabsTrigger>
              <TabsTrigger value="cookies" className="flex items-center gap-2">
                <Cookie className="h-4 w-4" />
                <span className="hidden sm:inline">Cookie-Einstellungen</span>
                <span className="sm:hidden">Cookies</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="data" className="space-y-6">
              <UserDataManagement />
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