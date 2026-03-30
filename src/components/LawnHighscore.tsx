import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, Trophy, TrendingUp, Crown, Users, 
  RefreshCw, Flame, Target, Zap, Filter
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLawn } from '@/context/LawnContext';
import { useSubscription } from '@/hooks/useSubscription';
import { getRank } from '@/lib/rankSystem';

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
  zip_code: string | null;
  user_id: string | null;
}

const LawnHighscore = () => {
  const navigate = useNavigate();
  const { profile } = useLawn();
  const { isPremium } = useSubscription();
  const [allScores, setAllScores] = useState<HighscoreEntry[]>([]);
  const [neighborhoodScores, setNeighborhoodScores] = useState<HighscoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userZip, setUserZip] = useState<string | null>(null);
  const [userScore, setUserScore] = useState<number | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [filter, setFilter] = useState<'plz' | 'deutschland'>('plz');

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let zip: string | null = null;

      if (user) {
        const { data: lawnProfile } = await supabase
          .from('lawn_profiles')
          .select('zip_code')
          .eq('user_id', user.id)
          .maybeSingle();
        
        zip = lawnProfile?.zip_code || null;
        setUserZip(zip);

        const { data: ownScore } = await supabase
          .from('lawn_highscores')
          .select('lawn_score')
          .eq('user_id', user.id)
          .maybeSingle();
        
        setUserScore(ownScore?.lawn_score || null);
      }

      const { data, error } = await supabase
        .from('lawn_highscores_public')
        .select('*')
        .order('lawn_score', { ascending: false })
        .limit(100);

      if (error) throw error;

      const scores = (data || []) as HighscoreEntry[];
      setAllScores(scores);

      if (zip) {
        const prefix = zip.substring(0, 2);
        const nearby = scores.filter(s => s.zip_code?.startsWith(prefix));
        setNeighborhoodScores(nearby);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userScore !== null && neighborhoodScores.length > 0) {
      const rank = neighborhoodScores.filter(s => s.lawn_score > userScore).length + 1;
      setUserRank(rank);
    }
  }, [userScore, neighborhoodScores]);

  const getAnonymizedName = (name: string) => {
    const first = name.charAt(0).toUpperCase();
    return `${first}***`;
  };

  const getMotivationalMessage = () => {
    if (!userScore || !userRank || neighborhoodScores.length === 0) {
      return 'Analysiere deinen Rasen, um dein Ranking zu sehen!';
    }
    if (userRank === 1) return '🏆 Du hast den besten Rasen in deiner Nachbarschaft!';
    if (userRank <= 3) return `🔥 Top 3! Nur noch ${neighborhoodScores[0]?.lawn_score - userScore} Punkte bis zur Spitze!`;
    const ahead = neighborhoodScores[userRank - 2];
    if (ahead) return `💪 Noch ${ahead.lawn_score - userScore} Punkte bis zum nächsten Platz!`;
    return '🌱 Verbessere deinen Rasen und steige auf!';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const displayScores = filter === 'plz' && userZip ? neighborhoodScores : allScores.slice(0, 50);
  const totalNeighbors = filter === 'plz' ? neighborhoodScores.length : allScores.length;

  // Find weekly winner (most recent top score from this week)
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weeklyWinner = displayScores.find(s => new Date(s.created_at) >= weekStart);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-3">
          <Trophy className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">
            {userZip && filter === 'plz' ? `Nachbarschaft ${userZip}` : 'Rasen-Ranking Deutschland'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          🏆 Bestenliste {userZip && filter === 'plz' ? `— PLZ ${userZip}` : ''}
        </h1>
        <p className="text-muted-foreground text-sm">
          {filter === 'plz' && userZip
            ? `${totalNeighbors} Rasenflächen in PLZ-Region ${userZip.substring(0, 2)}xxx`
            : `${totalNeighbors} Rasenflächen deutschlandweit`
          }
        </p>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as 'plz' | 'deutschland')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plz" disabled={!userZip}>
            <MapPin className="h-4 w-4 mr-1" />
            Meine PLZ
          </TabsTrigger>
          <TabsTrigger value="deutschland">
            <Users className="h-4 w-4 mr-1" />
            Deutschland
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* User's Position Card */}
      {userScore !== null && userRank !== null && filter === 'plz' && (
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dein Platz</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-primary">#{userRank}</span>
                  <span className="text-sm text-muted-foreground">von {totalNeighbors}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg">{getRank(userScore).emoji}</span>
                  <span className={`text-sm font-semibold ${getRank(userScore).color}`}>{getRank(userScore).name}</span>
                </div>
                <p className="text-sm text-foreground font-medium">{getMotivationalMessage()}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                  <span className="text-xl font-bold text-primary">{userScore}</span>
                </div>
                <span className="text-xs text-muted-foreground">Dein Score</span>
              </div>
            </div>

            {/* Progress to next rank */}
            {userRank > 1 && neighborhoodScores[userRank - 2] && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Dein Score: {userScore}</span>
                  <span>Platz {userRank - 1}: {neighborhoodScores[userRank - 2].lawn_score}</span>
                </div>
                <Progress 
                  value={(userScore / neighborhoodScores[userRank - 2].lawn_score) * 100} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  <Target className="h-3 w-3 inline mr-1" />
                  💡 Nur {neighborhoodScores[userRank - 2].lawn_score - userScore} Punkte bis Platz {userRank - 1}!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top-Rasen {userZip && filter === 'plz' ? `(PLZ ${userZip.substring(0, 2)}***)` : ''}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {displayScores.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {userZip && filter === 'plz'
                  ? 'Noch keine Nachbarn im Ranking. Sei der Erste!'
                  : 'Noch keine Einträge. Analysiere deinen Rasen!'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {displayScores.map((entry, index) => {
                const isCurrentUser = entry.user_id === profile?.userId;
                const entryRank = getRank(entry.lawn_score || 0);
                const isWeeklyWinner = weeklyWinner?.id === entry.id && index === 0;
                const isFirst = index === 0;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      isCurrentUser ? 'bg-green-50 border-l-4 border-l-green-500' : 'hover:bg-muted/50'
                    }`}
                  >
                    {/* Rank medal */}
                    <div className="w-8 text-center flex-shrink-0">
                      {index === 0 ? <span className="text-xl">🥇</span>
                        : index === 1 ? <span className="text-xl">🥈</span>
                        : index === 2 ? <span className="text-xl">🥉</span>
                        : <span className="text-sm font-bold text-muted-foreground">{index + 1}</span>
                      }
                    </div>

                    {/* Name, rank badge & location */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground text-sm truncate">
                          {isCurrentUser ? (
                            <span className="text-green-700 font-bold">Du</span>
                          ) : (
                            getAnonymizedName(entry.user_name)
                          )}
                        </span>
                        <span className="text-sm" title={entryRank.name}>{entryRank.emoji}</span>
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-xs border-green-300 text-green-700">Du</Badge>
                        )}
                        {isWeeklyWinner && (
                          <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-300">
                            <Zap className="h-3 w-3 mr-0.5" />
                            Wochensieger
                          </Badge>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 ${entryRank.color}`}>{entryRank.name}</p>
                      {isFirst && (
                        <p className="text-xs text-muted-foreground italic mt-0.5">
                          Dieser Mensch hat kein Hobby außer Rasen. Respekt. 😄
                        </p>
                      )}
                    </div>

                    {/* Score */}
                    <div className={`font-bold text-sm px-3 py-1 rounded-full ${entryRank.bgColor} ${entryRank.color}`}>
                      {entry.lawn_score} Pkt
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Pressure CTA */}
      {userScore !== null && userRank !== null && userRank > 1 && (
        <Card className="border-destructive/20 bg-gradient-to-r from-destructive/5 to-orange-50">
          <CardContent className="p-5 text-center">
            <Flame className="h-8 w-8 text-destructive mx-auto mb-2" />
            <h3 className="font-bold text-foreground mb-1">
              {userRank > 3 
                ? `${userRank - 1} Nachbarn haben einen besseren Rasen als du!`
                : 'Fast an der Spitze – gib nicht auf!'
              }
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isPremium 
                ? 'Nutze deinen Pflegeplan und verbessere deinen Score.'
                : 'Premium-Nutzer verbessern ihren Score 3x schneller mit personalisiertem Pflegeplan.'
              }
            </p>
            {!isPremium ? (
              <Button onClick={() => navigate('/subscription?ref=neighborhood-ranking')} className="bg-primary hover:bg-primary/90">
                <Crown className="h-4 w-4 mr-2" />
                Premium holen & aufsteigen
              </Button>
            ) : (
              <Button onClick={() => navigate('/lawn-analysis')} className="bg-primary hover:bg-primary/90">
                <TrendingUp className="h-4 w-4 mr-2" />
                Neue Analyse starten
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* No ZIP prompt */}
      {!userZip && (
        <Card className="border-border">
          <CardContent className="p-5 text-center">
            <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <h3 className="font-semibold text-foreground mb-1">Dein lokales Ranking sehen</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Erstelle ein Rasenprofil mit deiner PLZ, um zu sehen wie dein Rasen im Vergleich zu deinen Nachbarn abschneidet.
            </p>
            <Button variant="outline" onClick={() => navigate('/lawn-analysis')}>Rasen analysieren</Button>
          </CardContent>
        </Card>
      )}

      {/* How it works */}
      <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground mb-2">ℹ️ So funktioniert's</p>
        <p>• Dein bester Analyse-Score wird automatisch ins Ranking aufgenommen</p>
        <p>• Nur Nutzer in deiner PLZ-Region (gleiche ersten 2 Ziffern) werden angezeigt</p>
        <p>• Namen werden anonymisiert – niemand sieht deinen vollen Namen</p>
        <p>• Der ⚡ Wochensieger bekommt ein besonderes Badge!</p>
        <p>• Verbessere deinen Rasen und steige im Ranking auf!</p>
      </div>
    </div>
  );
};

export default LawnHighscore;
