
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Trophy, Medal, Award, MapPin, Leaf, Calendar, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import LazyImage from '@/components/LazyImage';

interface HighscoreEntry {
  id: string;
  user_name: string;
  lawn_score: number;
  lawn_image_url: string | null;
  location: string | null;
  grass_type: string | null;
  lawn_size: string | null;
  analysis_date: string;
  created_at: string;
}

const LawnHighscore = () => {
  const [highscores, setHighscores] = useState<HighscoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<HighscoreEntry | null>(null);

  useEffect(() => {
    fetchHighscores();
    
    // Simple auto-refresh when component mounts or becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchHighscores();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchHighscores = async (showRefreshMessage = false) => {
    if (showRefreshMessage) {
      setRefreshing(true);
    }
    
    try {
      const { data, error } = await supabase
        .from('lawn_highscores')
        .select('*')
        .order('lawn_score', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching highscores:', error);
        toast.error('Fehler beim Laden der Bestenliste');
      } else {
        setHighscores(data || []);
        if (showRefreshMessage && data && data.length > 0) {
          toast.success('Bestenliste aktualisiert!');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Fehler beim Laden der Bestenliste');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchHighscores(true);
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Award className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-600">#{index + 1}</span>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-green-400';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const handleImageClick = (entry: HighscoreEntry) => {
    if (entry.lawn_image_url) {
      setSelectedImage(entry.lawn_image_url);
      setSelectedEntry(entry);
    }
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setSelectedEntry(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold text-green-800">
            Rasen-Bestenliste
          </h1>
        </div>
        <p className="text-gray-600 mb-4">
          Die besten Rasen-Analysen unserer Community
        </p>
        <Button 
          onClick={handleManualRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="text-green-700 border-green-300 hover:bg-green-50"
        >
          {refreshing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Wird aktualisiert...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Aktualisieren
            </>
          )}
        </Button>
      </div>

      {highscores.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Noch keine Einträge in der Bestenliste. Sei der Erste!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {highscores.map((entry, index) => (
            <Card key={entry.id} className={`${index < 3 ? 'border-2 border-yellow-200 bg-yellow-50' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-12 h-12">
                      {getRankIcon(index)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-green-800">
                          {entry.user_name}
                        </h3>
                        <Badge className={`${getScoreColor(entry.lawn_score)} text-white`}>
                          {entry.lawn_score}/100
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {entry.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{entry.location}</span>
                          </div>
                        )}
                        {entry.grass_type && (
                          <div className="flex items-center gap-1">
                            <Leaf className="h-4 w-4" />
                            <span>{entry.grass_type}</span>
                          </div>
                        )}
                        {entry.lawn_size && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs">📏</span>
                            <span>{entry.lawn_size}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(entry.analysis_date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image Thumbnail */}
                  <div className="ml-4">
                    {entry.lawn_image_url ? (
                      <div 
                        className="relative group cursor-pointer"
                        onClick={() => handleImageClick(entry)}
                      >
                        <LazyImage
                          src={entry.lawn_image_url}
                          alt={`Rasen von ${entry.user_name}`}
                          className="w-20 h-20 rounded-lg object-cover border-2 border-green-200 group-hover:border-green-400 transition-colors"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 bg-green-50 p-6 rounded-lg border border-green-200">
        <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Wie funktioniert die Bestenliste?
        </h3>
        <ul className="text-green-700 space-y-1 text-sm">
          <li>• Jede Rasen-Analyse wird automatisch bewertet</li>
          <li>• Nur dein bester Score wird in der Bestenliste angezeigt</li>
          <li>• Verbessere deinen Rasen und steige in der Rangliste auf!</li>
          <li>• Die Top 3 erhalten besondere Auszeichnungen</li>
          <li>• Klicke auf ein Rasenbild, um es in voller Größe zu betrachten</li>
        </ul>
      </div>

      {/* Image Zoom Modal */}
      <Dialog open={!!selectedImage} onOpenChange={closeImageModal}>
        <DialogContent className="max-w-4xl w-full h-full max-h-[90vh] p-2">
          <DialogHeader className="sr-only">
            <DialogTitle>
              Rasenbild von {selectedEntry?.user_name}
            </DialogTitle>
            <DialogDescription>
              Detailansicht des Rasenbildes mit Analysedaten
            </DialogDescription>
          </DialogHeader>
          {selectedImage && selectedEntry && (
            <div className="flex flex-col h-full">
              {/* Header with entry details */}
              <div className="flex items-center justify-between p-4 border-b bg-green-50 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-semibold text-lg text-green-800">
                      {selectedEntry.user_name}
                    </h3>
                  </div>
                  <Badge className={`${getScoreColor(selectedEntry.lawn_score)} text-white`}>
                    {selectedEntry.lawn_score}/100
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {selectedEntry.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedEntry.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(selectedEntry.analysis_date)}</span>
                  </div>
                </div>
              </div>
              
              {/* Image container */}
              <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
                <img
                  src={selectedImage}
                  alt={`Rasen von ${selectedEntry.user_name}`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  style={{ maxHeight: 'calc(90vh - 120px)' }}
                />
              </div>
              
              {/* Additional info */}
              <div className="p-4 border-t bg-green-50 rounded-b-lg">
                <div className="flex justify-center gap-6 text-sm text-gray-600">
                  {selectedEntry.grass_type && (
                    <div className="flex items-center gap-1">
                      <Leaf className="h-4 w-4" />
                      <span>{selectedEntry.grass_type}</span>
                    </div>
                  )}
                  {selectedEntry.lawn_size && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs">📏</span>
                      <span>{selectedEntry.lawn_size}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LawnHighscore;
