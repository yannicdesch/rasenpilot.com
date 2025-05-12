
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Activity, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ActivityEvent {
  id: string;
  created_at: string;
  type: string;
  description: string;
}

const ActivityHistory: React.FC = () => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // This is a mockup of activities since we don't have an actual activities table yet
        // In a real implementation, you would fetch from your activities table
        const mockActivities: ActivityEvent[] = [
          {
            id: '1',
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            type: 'login',
            description: 'Anmeldung am System'
          },
          {
            id: '2',
            created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            type: 'profile_update',
            description: 'Profilinformationen aktualisiert'
          },
          {
            id: '3',
            created_at: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
            type: 'lawn_data',
            description: 'Rasendaten aktualisiert'
          }
        ];
        
        setActivities(mockActivities);
      } catch (error) {
        console.error('Error fetching activity history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP', { locale: de });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <Activity size={16} className="text-blue-500" />;
      case 'profile_update':
        return <Activity size={16} className="text-green-500" />;
      case 'lawn_data':
        return <Activity size={16} className="text-yellow-500" />;
      default:
        return <Activity size={16} />;
    }
  };

  if (loading) {
    return <p className="text-center py-4">Lade Aktivitäten...</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Aktivitätsverlauf</h3>
      
      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground">Keine Aktivitäten gefunden</p>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getActivityIcon(activity.type)}
                  <span className="text-sm">{activity.description}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar size={12} />
                  {formatDate(activity.created_at)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityHistory;
