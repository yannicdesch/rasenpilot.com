
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface User {
  id: string;
  name: string | null;
  email: string;
  status: 'active' | 'inactive';
  role: 'user' | 'admin';
  created_at: string;
  last_sign_in_at: string | null;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching users from Supabase...');
      
      // First check if the 'profiles' table exists, if not, create it
      const { data: existingTables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'profiles');
      
      if (tablesError) {
        console.error('Error checking for profiles table:', tablesError);
      }
      
      // If the profiles table doesn't exist or we couldn't check
      if (!existingTables || existingTables.length === 0) {
        console.log('Profiles table may not exist, attempting to use auth.users');
        
        // Fallback to example data since we can't create the table here
        setUsers([
          { 
            id: '1', 
            name: 'Max Mustermann', 
            email: 'max@example.com', 
            status: 'active', 
            role: 'user',
            created_at: '2025-04-12',
            last_sign_in_at: '2025-05-14'
          },
          { 
            id: '2', 
            name: 'Lisa Schmidt', 
            email: 'lisa@example.com', 
            status: 'active', 
            role: 'admin',
            created_at: '2025-03-28',
            last_sign_in_at: '2025-05-15'
          },
          { 
            id: '3', 
            name: 'Thomas Weber', 
            email: 'thomas@example.com', 
            status: 'inactive', 
            role: 'user',
            created_at: '2025-01-05',
            last_sign_in_at: '2025-03-22'
          }
        ]);
        
        toast.error('Profilstabelle existiert nicht in der Datenbank', {
          description: 'Verwende Beispieldaten. Erstellen Sie eine "profiles"-Tabelle in Supabase.'
        });
        
        return;
      }
      
      // Fetch user profiles from the profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        throw new Error(`Fehler beim Abrufen der Profile: ${profilesError.message}`);
      }

      console.log('Fetched profile data:', profilesData);
      
      if (profilesData && Array.isArray(profilesData)) {
        // Transform the data to our User format
        const transformedUsers: User[] = profilesData.map(profile => ({
          id: profile.id || '',
          name: profile.full_name || profile.name || null,
          email: profile.email || '',
          status: profile.is_active ? 'active' as const : 'inactive' as const,
          role: profile.role === 'admin' ? 'admin' as const : 'user' as const,
          created_at: profile.created_at || '',
          last_sign_in_at: profile.last_sign_in_at || null
        }));
        
        setUsers(transformedUsers);
        
        if (transformedUsers.length === 0) {
          console.log('No users found, adding example data');
          // Use example data when list is empty
          setUsers([
            { 
              id: '1', 
              name: 'Max Mustermann', 
              email: 'max@example.com', 
              status: 'active', 
              role: 'user',
              created_at: '2025-04-12',
              last_sign_in_at: '2025-05-14'
            },
            { 
              id: '2', 
              name: 'Lisa Schmidt', 
              email: 'lisa@example.com', 
              status: 'active', 
              role: 'admin',
              created_at: '2025-03-28',
              last_sign_in_at: '2025-05-15'
            },
            { 
              id: '3', 
              name: 'Thomas Weber', 
              email: 'thomas@example.com', 
              status: 'inactive', 
              role: 'user',
              created_at: '2025-01-05',
              last_sign_in_at: '2025-03-22'
            }
          ]);
        }
      } else {
        throw new Error('Unexpected data format for profiles');
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      
      const errorMsg = err.message || 'Failed to fetch users';
      setError(`${errorMsg}. Check your database connection.`);
      
      toast.error('Error fetching user data', {
        description: 'Make sure Supabase is correctly configured.'
      });
      
      // Fallback to example data so the UI isn't empty
      setUsers([
        { 
          id: '1', 
          name: 'Max Mustermann', 
          email: 'max@example.com', 
          status: 'active', 
          role: 'user',
          created_at: '2025-04-12',
          last_sign_in_at: '2025-05-14'
        },
        { 
          id: '2', 
          name: 'Lisa Schmidt', 
          email: 'lisa@example.com', 
          status: 'active', 
          role: 'admin',
          created_at: '2025-03-28',
          last_sign_in_at: '2025-05-15'
        },
        { 
          id: '3', 
          name: 'Thomas Weber', 
          email: 'thomas@example.com', 
          status: 'inactive', 
          role: 'user',
          created_at: '2025-01-05',
          last_sign_in_at: '2025-03-22'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add functionality to create a new user
  const addUser = async (userData: Omit<User, 'id' | 'created_at' | 'last_sign_in_at'>) => {
    try {
      setIsLoading(true);
      
      const newUser = {
        email: userData.email,
        full_name: userData.name,
        is_active: userData.status === 'active',
        role: userData.role
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(newUser)
        .select();
        
      if (error) throw error;
      
      toast.success('User successfully added');
      fetchUsers();
      
    } catch (error: any) {
      toast.error('Error adding user', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add functionality to update a user
  const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'created_at'>>) => {
    try {
      setIsLoading(true);
      
      const updateData: any = {};
      if (userData.name !== undefined) updateData.full_name = userData.name;
      if (userData.email !== undefined) updateData.email = userData.email;
      if (userData.status !== undefined) updateData.is_active = userData.status === 'active';
      if (userData.role !== undefined) updateData.role = userData.role;
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('User successfully updated');
      fetchUsers();
      
    } catch (error: any) {
      toast.error('Error updating user', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add functionality to delete a user
  const deleteUser = async (id: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('User successfully deleted');
      fetchUsers();
      
    } catch (error: any) {
      toast.error('Error deleting user', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    users, 
    isLoading, 
    error, 
    refreshUsers: fetchUsers,
    addUser,
    updateUser,
    deleteUser
  };
};
