
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  status: 'active' | 'inactive';
  source: string;
  dateSubscribed: string;
  openRate: number;
  interests: string[];
}

const useSubscribers = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscribers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching subscribers:', fetchError);
        throw fetchError;
      }

      // Transform data to match Subscriber interface
      const transformedSubscribers: Subscriber[] = (data || []).map(subscriber => ({
        id: subscriber.id,
        email: subscriber.email,
        name: subscriber.name || undefined,
        status: (subscriber.status === 'active' || subscriber.status === 'inactive') ? subscriber.status : 'active',
        source: subscriber.source || 'Website',
        dateSubscribed: subscriber.created_at,
        openRate: subscriber.open_rate || 0,
        interests: subscriber.interests || []
      }));

      setSubscribers(transformedSubscribers);
    } catch (err: any) {
      console.error('Error in fetchSubscribers:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addSubscriber = async (subscriberData: Omit<Subscriber, 'id' | 'dateSubscribed' | 'openRate'>) => {
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .insert([{
          email: subscriberData.email,
          name: subscriberData.name,
          status: subscriberData.status,
          source: subscriberData.source,
          interests: subscriberData.interests
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding subscriber:', error);
        throw error;
      }

      const newSubscriber: Subscriber = {
        id: data.id,
        email: data.email,
        name: data.name || undefined,
        status: (data.status === 'active' || data.status === 'inactive') ? data.status : 'active',
        source: data.source || 'Website',
        dateSubscribed: data.created_at,
        openRate: data.open_rate || 0,
        interests: data.interests || []
      };

      setSubscribers(prev => [newSubscriber, ...prev]);
      toast.success('Abonnent hinzugefügt!');
      return newSubscriber;
    } catch (err: any) {
      console.error('Error adding subscriber:', err);
      toast.error('Fehler beim Hinzufügen des Abonnenten', {
        description: err.message
      });
      throw err;
    }
  };

  const updateSubscriber = async (id: string, updates: Partial<Subscriber>) => {
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .update({
          email: updates.email,
          name: updates.name,
          status: updates.status,
          source: updates.source,
          interests: updates.interests,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating subscriber:', error);
        throw error;
      }

      const updatedSubscriber: Subscriber = {
        id: data.id,
        email: data.email,
        name: data.name || undefined,
        status: (data.status === 'active' || data.status === 'inactive') ? data.status : 'active',
        source: data.source || 'Website',
        dateSubscribed: data.created_at,
        openRate: data.open_rate || 0,
        interests: data.interests || []
      };

      setSubscribers(prev => prev.map(sub => sub.id === id ? updatedSubscriber : sub));
      toast.success('Abonnent aktualisiert!');
      return updatedSubscriber;
    } catch (err: any) {
      console.error('Error updating subscriber:', err);
      toast.error('Fehler beim Aktualisieren des Abonnenten', {
        description: err.message
      });
      throw err;
    }
  };

  const deleteSubscriber = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subscribers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting subscriber:', error);
        throw error;
      }

      setSubscribers(prev => prev.filter(sub => sub.id !== id));
      toast.success('Abonnent gelöscht!');
    } catch (err: any) {
      console.error('Error deleting subscriber:', err);
      toast.error('Fehler beim Löschen des Abonnenten', {
        description: err.message
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  return {
    subscribers,
    isLoading,
    error,
    addSubscriber,
    updateSubscriber,
    deleteSubscriber,
    refetch: fetchSubscribers
  };
};

export default useSubscribers;
