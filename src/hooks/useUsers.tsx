
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
      
      // Fetch users from the auth.users table
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        throw authError;
      }

      // Transform the data to match our User interface
      const transformedUsers: User[] = authUsers.users.map(user => ({
        id: user.id,
        name: user.user_metadata?.full_name || null,
        email: user.email || '',
        status: user.banned ? 'inactive' : 'active',
        role: user.role === 'supabase_admin' ? 'admin' : 'user',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      }));

      setUsers(transformedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. You might not have admin privileges.');
      toast.error('Failed to fetch users', {
        description: 'Make sure you have admin privileges to access user data.'
      });
      
      // Fall back to sample data if there's an error
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

  const refreshUsers = () => {
    fetchUsers();
  };

  return { users, isLoading, error, refreshUsers };
};
