
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
      
      // In einem echten Setup würden wir auf die users Tabelle zugreifen
      // Da wir aber keinen direkten Zugriff auf die admin.listUsers API haben,
      // holen wir stattdessen Daten aus einer Tabelle "profiles" oder einer ähnlichen
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*');
      
      if (fetchError) {
        throw fetchError;
      }

      console.log('Fetched user data:', data);
      
      if (data && Array.isArray(data)) {
        // Transformieren der Daten zu unserem User-Format
        const transformedUsers: User[] = data.map(user => ({
          id: user.id || '',
          name: user.full_name || null,
          email: user.email || '',
          status: user.is_active ? 'active' as const : 'inactive' as const,
          role: user.role === 'admin' ? 'admin' as const : 'user' as const,
          created_at: user.created_at || '',
          last_sign_in_at: user.last_sign_in_at || null
        }));
        
        setUsers(transformedUsers);
      } else {
        // Fallback, wenn keine Daten kommen oder Format nicht stimmt
        throw new Error('Unerwartetes Datenformat');
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      
      const errorMsg = err.message || 'Failed to fetch users';
      setError(`${errorMsg}. Überprüfen Sie Ihre Administratorrechte.`);
      
      toast.error('Fehler beim Abrufen der Benutzerdaten', {
        description: 'Stellen Sie sicher, dass Sie Administratorrechte haben.'
      });
      
      // Fallback auf Beispieldaten, damit die UI nicht leer ist
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
