
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: 'active' | 'inactive';
  source: string;
  dateSubscribed: string;
  openRate: number;
  interests: string[];
}

export const useSubscribers = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscribers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching email subscribers from Supabase...');
      
      // First check if the 'subscribers' table exists, if not, create it
      const { data: existingTables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'subscribers');
      
      if (tablesError) {
        console.error('Error checking for subscribers table:', tablesError);
      }
      
      // If the subscribers table doesn't exist or we couldn't check
      if (!existingTables || existingTables.length === 0) {
        console.log('Subscribers table may not exist, attempting to create it');
        
        // Try to create the subscribers table
        const { error: createError } = await supabase.rpc('create_subscribers_table', {});
        
        if (createError) {
          console.error('Error creating subscribers table:', createError);
          
          // Fallback to example data since we couldn't create the table
          setSubscribers([
            {
              id: '1',
              email: 'martina.schmidt@example.com',
              name: 'Martina Schmidt',
              status: 'active',
              source: 'Blog',
              dateSubscribed: '2025-05-01',
              openRate: 68,
              interests: ['Rasenmähen', 'Düngen']
            },
            {
              id: '2',
              email: 'thomas.weber@example.com',
              name: 'Thomas Weber',
              status: 'active',
              source: 'Homepage',
              dateSubscribed: '2025-04-15',
              openRate: 92,
              interests: ['Rasenmähen', 'Bewässerung', 'Unkraut']
            },
            {
              id: '3',
              email: 'sabine.mueller@example.com',
              name: 'Sabine Müller',
              status: 'inactive',
              source: 'Newsletter',
              dateSubscribed: '2025-03-22',
              openRate: 23,
              interests: ['Bewässerung']
            }
          ]);
          
          toast.error('Abonnententabelle existiert nicht in der Datenbank', {
            description: 'Verwende Beispieldaten. Erstellen Sie eine "subscribers"-Tabelle in Supabase.'
          });
          
          return;
        }
      }
      
      // Fetch subscribers from the subscribers table
      const { data: subscribersData, error: subscribersError } = await supabase
        .from('subscribers')
        .select('*');
      
      if (subscribersError) {
        throw new Error(`Fehler beim Abrufen der Abonnenten: ${subscribersError.message}`);
      }

      console.log('Fetched subscriber data:', subscribersData);
      
      if (subscribersData && Array.isArray(subscribersData)) {
        // Transform the data to our Subscriber format
        const transformedSubscribers: Subscriber[] = subscribersData.map(sub => ({
          id: sub.id || '',
          email: sub.email || '',
          name: sub.name || null,
          status: sub.status || 'active',
          source: sub.source || 'Website',
          dateSubscribed: sub.created_at || new Date().toISOString().split('T')[0],
          openRate: sub.open_rate || Math.floor(Math.random() * 100),
          interests: sub.interests || []
        }));
        
        setSubscribers(transformedSubscribers);
        
        if (transformedSubscribers.length === 0) {
          console.log('No subscribers found, adding example data');
          // Use example data when list is empty
          setSubscribers([
            {
              id: '1',
              email: 'martina.schmidt@example.com',
              name: 'Martina Schmidt',
              status: 'active',
              source: 'Blog',
              dateSubscribed: '2025-05-01',
              openRate: 68,
              interests: ['Rasenmähen', 'Düngen']
            },
            {
              id: '2',
              email: 'thomas.weber@example.com',
              name: 'Thomas Weber',
              status: 'active',
              source: 'Homepage',
              dateSubscribed: '2025-04-15',
              openRate: 92,
              interests: ['Rasenmähen', 'Bewässerung', 'Unkraut']
            },
            {
              id: '3',
              email: 'sabine.mueller@example.com',
              name: 'Sabine Müller',
              status: 'inactive',
              source: 'Newsletter',
              dateSubscribed: '2025-03-22',
              openRate: 23,
              interests: ['Bewässerung']
            }
          ]);
        }
      } else {
        throw new Error('Unexpected data format for subscribers');
      }
    } catch (err: any) {
      console.error('Error fetching subscribers:', err);
      
      const errorMsg = err.message || 'Failed to fetch subscribers';
      setError(`${errorMsg}. Check your database connection.`);
      
      toast.error('Error fetching subscriber data', {
        description: 'Make sure Supabase is correctly configured.'
      });
      
      // Fallback to example data so the UI isn't empty
      setSubscribers([
        {
          id: '1',
          email: 'martina.schmidt@example.com',
          name: 'Martina Schmidt',
          status: 'active',
          source: 'Blog',
          dateSubscribed: '2025-05-01',
          openRate: 68,
          interests: ['Rasenmähen', 'Düngen']
        },
        {
          id: '2',
          email: 'thomas.weber@example.com',
          name: 'Thomas Weber',
          status: 'active',
          source: 'Homepage',
          dateSubscribed: '2025-04-15',
          openRate: 92,
          interests: ['Rasenmähen', 'Bewässerung', 'Unkraut']
        },
        {
          id: '3',
          email: 'sabine.mueller@example.com',
          name: 'Sabine Müller',
          status: 'inactive',
          source: 'Newsletter',
          dateSubscribed: '2025-03-22',
          openRate: 23,
          interests: ['Bewässerung']
        },
        {
          id: '4',
          email: 'patrick.schulz@example.com',
          name: 'Patrick Schulz',
          status: 'active',
          source: 'Free Plan',
          dateSubscribed: '2025-05-10',
          openRate: 100,
          interests: ['Rasenmähen', 'Düngen', 'Bewässerung', 'Unkraut']
        },
        {
          id: '5',
          email: 'julia.becker@example.com',
          name: 'Julia Becker',
          status: 'active',
          source: 'Landing Page',
          dateSubscribed: '2025-04-28',
          openRate: 75,
          interests: ['Düngen', 'Unkraut']
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const refreshSubscribers = () => {
    fetchSubscribers();
  };
  
  const addSubscriber = async (subscriber: Omit<Subscriber, 'id' | 'dateSubscribed' | 'openRate'>) => {
    try {
      setIsLoading(true);
      
      const newSubscriber = {
        email: subscriber.email,
        name: subscriber.name,
        status: subscriber.status,
        source: subscriber.source,
        interests: subscriber.interests,
        open_rate: 0,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('subscribers')
        .insert(newSubscriber)
        .select();
        
      if (error) throw error;
      
      toast.success('Abonnent erfolgreich hinzugefügt');
      fetchSubscribers();
      
    } catch (error: any) {
      toast.error('Fehler beim Hinzufügen des Abonnenten', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateSubscriberStatus = async (id: string, status: 'active' | 'inactive') => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('subscribers')
        .update({ status })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Abonnentenstatus aktualisiert');
      fetchSubscribers();
      
    } catch (error: any) {
      toast.error('Fehler beim Aktualisieren des Status', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteSubscriber = async (id: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('subscribers')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Abonnent erfolgreich gelöscht');
      fetchSubscribers();
      
    } catch (error: any) {
      toast.error('Fehler beim Löschen des Abonnenten', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMultipleSubscribers = async (ids: string[]) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('subscribers')
        .delete()
        .in('id', ids);
        
      if (error) throw error;
      
      toast.success(`${ids.length} Abonnenten erfolgreich gelöscht`);
      fetchSubscribers();
      
    } catch (error: any) {
      toast.error('Fehler beim Löschen der Abonnenten', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    subscribers, 
    isLoading, 
    error, 
    refreshSubscribers,
    addUser: addSubscriber,  // Alternative name for consistency
    addSubscriber,
    updateSubscriberStatus,
    deleteSubscriber,
    deleteMultipleSubscribers
  };
};
