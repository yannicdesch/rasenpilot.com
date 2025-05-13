
import React, { useEffect, useState } from 'react';
import MainNavigation from '@/components/MainNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';
import { Label } from '@/components/ui/label';

interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
  createdAt?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // In a real application, you would create a Supabase function to securely fetch users
      // For this demo, we're just showing an example of how it would work
      const { data, error } = await supabase
        .from('users_view') // This would be a secure view or function in a real setup
        .select('*');
        
      if (error) throw error;
      
      // If no data, create mock data for demonstration
      if (!data || data.length === 0) {
        const mockUsers = [
          { 
            id: '1', 
            email: 'admin@example.com', 
            name: 'Admin User', 
            isAdmin: true, 
            createdAt: new Date().toISOString() 
          },
          { 
            id: '2', 
            email: 'user@example.com', 
            name: 'Regular User', 
            isAdmin: false, 
            createdAt: new Date().toISOString() 
          },
        ];
        setUsers(mockUsers);
      } else {
        setUsers(data);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Fehler beim Laden der Benutzer: ' + error.message);
      
      // Set mock data for demonstration
      const mockUsers = [
        { 
          id: '1', 
          email: 'admin@example.com', 
          name: 'Admin User', 
          isAdmin: true, 
          createdAt: new Date().toISOString() 
        },
        { 
          id: '2', 
          email: 'user@example.com', 
          name: 'Regular User', 
          isAdmin: false, 
          createdAt: new Date().toISOString() 
        },
      ];
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const handleToggleAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      // In a real app, this would be handled by a secure Supabase function
      // For this demo, we just update the local state
      
      toast.success(`Benutzerrechte wurden ${isAdmin ? 'erteilt' : 'entzogen'}`);
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isAdmin } : user
      ));
    } catch (error: any) {
      toast.error('Fehler beim Aktualisieren der Benutzerrechte: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-gray-900">
      <MainNavigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-800 dark:text-green-400 flex items-center gap-2">
                <Users className="h-8 w-8" />
                Benutzerverwaltung
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Verwalten Sie Benutzer und deren Berechtigungen
              </p>
            </div>
            
            <Button onClick={() => fetchUsers()}>Aktualisieren</Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Benutzer</CardTitle>
              <CardDescription>Alle registrierten Benutzer und ihre Berechtigungen</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Benutzer werden geladen...</div>
              ) : (
                <div className="space-y-4">
                  {users.map(user => (
                    <div key={user.id} className="border p-4 rounded-md flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.name || 'Kein Name'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.isAdmin}
                          onCheckedChange={(checked) => handleToggleAdmin(user.id, checked)}
                        />
                        <Label htmlFor="admin-switch" className="flex items-center gap-1">
                          {user.isAdmin && <Shield className="h-4 w-4 text-green-600" />}
                          {user.isAdmin ? 'Admin' : 'Nutzer'}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UserManagement;
