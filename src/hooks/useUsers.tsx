
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastSignIn?: string;
  createdAt: string;
}

const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if users table exists first
      const { error: checkError } = await supabase
        .from('profiles')
        .select('count(*)', { count: 'exact' })
        .limit(1);

      if (checkError) {
        console.error('Profiles table does not exist:', checkError);
        // Create mock data for development
        setUsers([
          {
            id: '1',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            email: 'user@example.com',
            name: 'Regular User',
            role: 'user',
            isActive: true,
            createdAt: new Date().toISOString()
          }
        ]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching users:', fetchError);
        throw fetchError;
      }

      // Transform data to match User interface
      const transformedUsers: User[] = (data || []).map(profile => ({
        id: profile.id,
        email: profile.email,
        name: profile.full_name || profile.email, // Use full_name or fallback to email
        role: (profile.role === 'admin' || profile.role === 'user') ? profile.role : 'user',
        isActive: profile.is_active ?? true,
        lastSignIn: profile.last_sign_in_at || undefined,
        createdAt: profile.created_at
      }));

      setUsers(transformedUsers);
    } catch (err: any) {
      console.error('Error in fetchUsers:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user role:', error);
        throw error;
      }

      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: newRole }
          : user
      ));

      toast.success(`Benutzerrolle zu ${newRole === 'admin' ? 'Administrator' : 'Benutzer'} geändert`);
    } catch (err: any) {
      console.error('Error updating user role:', err);
      toast.error('Fehler beim Ändern der Benutzerrolle', {
        description: err.message
      });
      throw err;
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user status:', error);
        throw error;
      }

      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, isActive }
          : user
      ));

      toast.success(`Benutzer ${isActive ? 'aktiviert' : 'deaktiviert'}`);
    } catch (err: any) {
      console.error('Error updating user status:', err);
      toast.error('Fehler beim Ändern des Benutzerstatus', {
        description: err.message
      });
      throw err;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        throw error;
      }

      setUsers(prev => prev.filter(user => user.id !== userId));
      toast.success('Benutzer gelöscht');
    } catch (err: any) {
      console.error('Error deleting user:', err);
      toast.error('Fehler beim Löschen des Benutzers', {
        description: err.message
      });
      throw err;
    }
  };

  const createUser = async (userData: { email: string; full_name: string; role: 'user' | 'admin'; is_active: boolean }) => {
    try {
      // Generate a UUID for the new user
      const userId = crypto.randomUUID();
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          is_active: userData.is_active
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }

      const newUser: User = {
        id: data.id,
        email: data.email,
        name: data.full_name || data.email,
        role: (data.role === 'admin' || data.role === 'user') ? data.role : 'user',
        isActive: data.is_active ?? true,
        createdAt: data.created_at
      };

      setUsers(prev => [newUser, ...prev]);
      toast.success('Benutzer erstellt!');
      return newUser;
    } catch (err: any) {
      console.error('Error creating user:', err);
      toast.error('Fehler beim Erstellen des Benutzers', {
        description: err.message
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    error,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
    createUser,
    refetch: fetchUsers
  };
};

export default useUsers;
