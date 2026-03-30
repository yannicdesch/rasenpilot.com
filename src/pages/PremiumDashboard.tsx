import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Calendar, 
  MessageSquare, 
  CloudRain, 
  Camera, 
  Bell, 
  Headphones,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Trophy,
  Target,
  Leaf,
  MapPin,
  Sparkles,
  Award,
  Edit3,
  Settings,
  CreditCard,
  Share2,
  Gift,
  Sprout
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useProfileData } from '@/hooks/useProfileData';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import MainNavigation from '@/components/MainNavigation';

const PremiumDashboard = () => {
  const { subscription, isPremium, loading: subLoading, openCustomerPortal } = useSubscription();
  const { user } = useProfileData();
  const { latestAnalysis, lawnProfile, dashboardStats, loading: dataLoading } = useDashboardData();
  const navigate = useNavigate();

  const isLoading = subLoading || dataLoading;

  React.useEffect(() => {
    if (!isLoading && !isPremium) {
      navigate('/subscription?ref=premium-dashboard');
    }
  }, [isPremium, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-green-800 text-sm">Premium-Zugang wird geprüft...</p>
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <>
        <SEO title="Premium Mitgliedschaft erforderlich - Rasenpilot" description="Upgrade zu Premium für Zugang zu exklusiven Rasenpflege-Features." />
        <MainNavigation />
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
          <div className="max-w-2xl mx-auto pt-12">
            <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader className="text-center">
                <Crown className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                <CardTitle className="text-2xl text-yellow-800">Premium Mitgliedschaft erforderlich</CardTitle>
                <CardDescription className="text-yellow-700">Upgrade zu Premium für Zugang zu exklusiven Features</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link to="/subscription">
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">Jetzt Premium abonnieren</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  const score = latestAnalysis?.score || 0;
  const getMotivation = (s: number) => {
    if (s === 0) return { text: 'Starte deine erste Analyse!', emoji: '📷' };
    if (s < 60) return { text: 'Dein Rasen braucht Aufmerksamkeit', emoji: '⚠️' };
    if (s <= 80) return { text: 'Guter Fortschritt!', emoji: '💪' };
    return { text: 'Traumrasen in Sicht!', emoji: '🏆' };
  };
  const motivation = getMotivation(score);

  const analysisLevel = Math.min(Math.floor((dashboardStats?.totalAnalyses || 0) / 5) + 1, 10);
  const analysesInLevel = (dashboardStats?.totalAnalyses || 0) % 5;
  const analysesForNextLevel = 5;

  const getSeasonalTip = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return { text: '🌱 Frühlings-Tipp: Jetzt ist der beste Zeitpunkt zum Düngen! Erstelle deinen Pflegeplan →', season: 'spring' };
    if (month >= 5 && month <= 7) return { text: '☀️ Sommer-Tipp: Regelmäßig bewässern und nicht zu kurz mähen! Prüfe die Wetterberatung →', season: 'summer' };
    if (month >= 8 && month <= 10) return { text: '🍂 Herbst-Tipp: Zeit zum Vertikutieren und Nachsäen! Erstelle deinen Pflegeplan →', season: 'autumn' };
    return { text: '❄️ Winter-Tipp: Rasen schonen und auf die Frühjahrspflege vorbereiten! Plane voraus →', season: 'winter' };
  };
  const seasonalTip = getSeasonalTip();

  const premiumFeatures = [
    {
      icon: Calendar,
      title: "Ganzjahres-Pflegeplan",
      description: "Personalisierte Pflegepläne für jede Jahreszeit",
      action: "Meinen Plan ansehen",
      link: "/care-calendar",
      borderColor: "border-l-green-500",
      badge: "Neu"
    },
    {
      icon: MessageSquare,
      title: "Unbegrenzte KI-Beratung",
      description: "Stelle so viele Fragen wie du möchtest",
      action: "KI-Chat starten",
      link: "/chat",
      borderColor: "border-l-blue-500",
    },
    {
      icon: CloudRain,
      title: "Wetter-Alerts & Tipps",
      description: "Automatische Tipps basierend auf der Wettervorhersage",
      action: "Wetter-Tipps anzeigen",
      link: "/weather-advice",
      borderColor: "border-l-sky-500",
    },
    {
      icon: Camera,
      title: "Fortschritts-Tracking",
      description: "Verfolge die Entwicklung deines Rasens über Zeit",
      action: "Mein Fortschritt",
      link: "/analysis-history",
      borderColor: "border-l-purple-500",
      badge: "Neu"
    },
    {
      icon: Bell,
      title: "Email-Erinnerungen",
      description: "Nie wieder wichtige Pflegetermine vergessen",
      action: "Einstellungen anpassen",
      link: "/account-settings",
      borderColor: "border-l-orange-500",
    },
    {
      icon: Headphones,
      title: "Priority Support",
      description: "Bevorzugter Kundensupport und persönliche Beratung",
      action: "Support kontaktieren",
      link: "/kontakt",
      borderColor: "border-l-red-500",
    }
  ];

  const quickActions = [
    {
      title: "Neue Rasenanalyse",
      description: "Analysiere deinen Rasen mit KI",
      link: "/lawn-analysis",
      icon: Camera,
      primary: true,
    },
    {
      title: "Wetter-Ratgeber",
      description: "Aktuelle Pflegetipps",
      link: "/weather-advice",
      icon: CloudRain,
      badgeText: "Aktuell: 18°C ☀️",
    },
    {
      title: "Saisonaler Guide",
      description: "Monatliche Pflegeempfehlungen",
      link: "/season-guide",
      icon: Calendar,
    }
  ];

  return (
    <>
      <SEO 
        title="Premium Dashboard - Rasenpilot"
        description="Dein persönliches Premium Dashboard mit exklusiven Rasenpflege-Features."
      />
      <MainNavigation />
      
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50/30">
        {/* Hero Welcome Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-700 to-emerald-800" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          
          <div className="relative max-w-6xl mx-auto px-4 py-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-yellow-400/20 rounded-xl">
                    <Crown className="h-7 w-7 text-yellow-300" />
                  </div>
                  <Badge className="bg-yellow-400/20 text-yellow-200 border-yellow-400/30 text-xs uppercase tracking-wider">
                    {subscription.subscription_tier || 'Premium'} Mitglied
                  </Badge>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  Willkommen zurück, {user?.name || 'Rasenpilot'}! {motivation.emoji}
                </h1>
                <p className="text-green-100 text-lg mb-5">{motivation.text}</p>

                {/* Lawn Health Progress */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-100 text-sm font-medium">Rasen-Gesundheit</span>
                    <span className="text-white font-bold text-xl">{score}/100</span>
                  </div>
                  <Progress value={score} className="h-3 bg-white/20" />
                  <p className="text-green-200 text-xs mt-2">
                    {score === 0 ? 'Starte deine erste Analyse für deinen persönlichen Score' :
                     score < 60 ? 'Noch etwas Arbeit nötig – du schaffst das!' :
                     score < 80 ? 'Du bist auf dem richtigen Weg! 🌱' :
                     'Hervorragend! Dein Rasen ist in Topform! 🏆'}
                  </p>
                </div>
              </div>

              {/* CTA + Last Analysis Preview */}
              <div className="flex flex-col items-end gap-3">
                <Link to="/lawn-analysis">
                  <Button size="lg" className="bg-white text-green-700 hover:bg-green-50 font-semibold shadow-lg shadow-black/10 text-base px-6">
                    <Camera className="h-5 w-5 mr-2" />
                    Jetzt Rasen analysieren →
                  </Button>
                </Link>
                {subscription.subscription_end && (
                  <p className="text-green-200 text-xs">
                    Aktiv bis: {new Date(subscription.subscription_end).toLocaleDateString('de-DE')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Stats + Analysis Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 -mt-6">
            {/* Latest Analysis Card */}
            <Card className="lg:col-span-2 shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Camera className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Dein Rasen-Status</CardTitle>
                      <CardDescription>Letzte Analyse & Fortschritt</CardDescription>
                    </div>
                  </div>
                  {latestAnalysis && (
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {score}
                      </div>
                      <div className="text-sm text-gray-500">Punkte</div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {latestAnalysis ? (
                  <div className="space-y-4">
                    {latestAnalysis.image_url && (
                      <div className="relative rounded-xl overflow-hidden">
                        <img 
                          src={latestAnalysis.image_url} 
                          alt="Letzte Rasenanalyse" 
                          className="w-full h-48 object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-bold">
                          {score}/100
                        </div>
                      </div>
                    )}
                    <p className="text-gray-700">{latestAnalysis.summary_short}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Analysiert am {new Date(latestAnalysis.created_at).toLocaleDateString('de-DE')}
                      </div>
                      <Link to="/analysis-history">
                        <Button variant="outline" size="sm">Mein Fortschritt</Button>
                      </Link>
                    </div>
                    {dashboardStats?.improvementTrend !== undefined && dashboardStats?.improvementTrend !== 0 && (
                      <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                        dashboardStats.improvementTrend > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {dashboardStats.improvementTrend > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="font-medium">
                          {dashboardStats.improvementTrend > 0 ? '+' : ''}{dashboardStats.improvementTrend} Punkte seit letzter Analyse
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-gray-600 mb-4">Noch keine Analyse durchgeführt</p>
                    <Link to="/lawn-analysis">
                      <Button className="bg-green-600 hover:bg-green-700">Erste Analyse starten</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Deine Statistiken
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardStats ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Beste Bewertung</span>
                      <span className="font-bold text-lg text-green-600">{dashboardStats.bestScore}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Durchschnitt</span>
                      <span className="font-semibold">{dashboardStats.averageScore}</span>
                    </div>

                    {/* Analysis Level Progress */}
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Level {analysisLevel}</span>
                        <span className="text-xs text-gray-500">{dashboardStats.totalAnalyses} Analysen</span>
                      </div>
                      <Progress value={(analysesInLevel / analysesForNextLevel) * 100} className="h-2.5 mb-1" />
                      <p className="text-xs text-gray-500">
                        {analysesForNextLevel - analysesInLevel} Analysen bis Level {analysisLevel + 1}
                      </p>
                    </div>

                    {/* Trend Indicator */}
                    {dashboardStats.improvementTrend !== undefined && dashboardStats.improvementTrend !== 0 && (
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                        dashboardStats.improvementTrend > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {dashboardStats.improvementTrend > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        Trend: {dashboardStats.improvementTrend > 0 ? '↑ Aufwärts' : '↓ Abwärts'}
                      </div>
                    )}

                    {/* Detail Scores */}
                    {latestAnalysis && (latestAnalysis.density_score || latestAnalysis.sunlight_score || latestAnalysis.moisture_score || latestAnalysis.soil_score) && (
                      <div className="pt-3 border-t">
                        <div className="text-sm font-medium text-gray-700 mb-3">Detail-Scores</div>
                        <div className="space-y-2">
                          {latestAnalysis.density_score && (
                            <div className="flex items-center justify-between text-sm">
                              <span>🌱 Dichte</span>
                              <span className="font-semibold">{latestAnalysis.density_score}/100</span>
                            </div>
                          )}
                          {latestAnalysis.sunlight_score && (
                            <div className="flex items-center justify-between text-sm">
                              <span>🌞 Sonne</span>
                              <span className="font-semibold">{latestAnalysis.sunlight_score}/100</span>
                            </div>
                          )}
                          {latestAnalysis.moisture_score && (
                            <div className="flex items-center justify-between text-sm">
                              <span>💧 Feuchtigkeit</span>
                              <span className="font-semibold">{latestAnalysis.moisture_score}/100</span>
                            </div>
                          )}
                          {latestAnalysis.soil_score && (
                            <div className="flex items-center justify-between text-sm">
                              <span>🪱 Boden</span>
                              <span className="font-semibold">{latestAnalysis.soil_score}/100</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {dashboardStats.rankInRegion && dashboardStats.totalUsersInRegion && (
                      <div className="pt-3 border-t">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium">Regional-Ranking</span>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">#{dashboardStats.rankInRegion}</div>
                          <div className="text-xs text-gray-600">von {dashboardStats.totalUsersInRegion} in deiner Region</div>
                          <Progress 
                            value={((dashboardStats.totalUsersInRegion - dashboardStats.rankInRegion + 1) / dashboardStats.totalUsersInRegion) * 100} 
                            className="mt-2 h-2"
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-gray-600 py-4">
                    <Target className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Statistiken werden nach der ersten Analyse verfügbar</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Lawn Profile */}
          {lawnProfile && (
            <Card className="mb-8 border-0 shadow-sm bg-gradient-to-r from-purple-50/50 to-pink-50/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Leaf className="h-5 w-5 text-purple-600" />
                    Dein Rasen-Profil
                  </CardTitle>
                  <Link to="/account-settings" state={{ activeTab: 'profile' }}>
                    <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                      <Edit3 className="h-4 w-4 mr-1" /> Bearbeiten
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg"><Sparkles className="h-4 w-4 text-purple-600" /></div>
                    <div>
                      <p className="text-xs text-gray-500">Grasart</p>
                      <p className="font-semibold text-sm">{lawnProfile.grass_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg"><Target className="h-4 w-4 text-purple-600" /></div>
                    <div>
                      <p className="text-xs text-gray-500">Rasengröße</p>
                      <p className="font-semibold text-sm">{lawnProfile.lawn_size}</p>
                    </div>
                  </div>
                  {lawnProfile.location && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg"><MapPin className="h-4 w-4 text-purple-600" /></div>
                      <div>
                        <p className="text-xs text-gray-500">Region</p>
                        <p className="font-semibold text-sm">{lawnProfile.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>Schnellzugriff</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.link} className="group">
                  <Card className={`h-full transition-all duration-200 group-hover:shadow-lg ${
                    action.primary
                      ? 'bg-gradient-to-br from-green-600 to-emerald-700 text-white border-0 shadow-md shadow-green-200'
                      : 'border-gray-200 hover:border-green-300'
                  }`}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          action.primary ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-green-100'
                        }`}>
                          <action.icon className={`h-6 w-6 ${action.primary ? 'text-white' : 'text-gray-600 group-hover:text-green-600'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${action.primary ? 'text-white' : 'text-gray-800'}`}>{action.title}</h3>
                            {action.badgeText && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-0">{action.badgeText}</Badge>
                            )}
                          </div>
                          <p className={`text-sm ${action.primary ? 'text-green-100' : 'text-gray-500'}`}>{action.description}</p>
                        </div>
                        <ArrowRight className={`h-5 w-5 ${action.primary ? 'text-white/70' : 'text-gray-400 group-hover:text-green-600'}`} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Seasonal Tip Banner */}
          <Link to="/care-calendar" className="block mb-8">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Sprout className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-green-800 font-medium">{seasonalTip.text}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-green-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Premium Features / Werkzeuge */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>Deine Werkzeuge</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {premiumFeatures.map((feature, index) => (
                <Card key={index} className={`h-full border-0 shadow-sm hover:shadow-md transition-all border-l-4 ${feature.borderColor}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <feature.icon className="h-5 w-5 text-gray-600" />
                        <CardTitle className="text-base">{feature.title}</CardTitle>
                      </div>
                      {feature.badge && (
                        <Badge className="bg-green-100 text-green-700 border-0 text-xs">{feature.badge}</Badge>
                      )}
                    </div>
                    <CardDescription className="text-sm">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Link to={feature.link}>
                      <Button variant="ghost" className="w-full justify-between text-green-700 hover:text-green-800 hover:bg-green-50 p-2 h-auto">
                        <span className="text-sm font-medium">{feature.action}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Bottom Section: Account + Referral */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <Card className="border-0 shadow-none bg-gray-50/50">
              <CardContent className="p-4 flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Abonnement verwalten</p>
                </div>
                <Button variant="ghost" size="sm" onClick={openCustomerPortal} className="text-gray-500 hover:text-gray-700">
                  Öffnen
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-gray-50/50">
              <CardContent className="p-4 flex items-center gap-3">
                <Settings className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Account-Einstellungen</p>
                </div>
                <Link to="/account-settings">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                    Öffnen
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-gradient-to-r from-green-50/50 to-emerald-50/50">
              <CardContent className="p-4 flex items-center gap-3">
                <Gift className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Empfehle Rasenpilot</p>
                  <p className="text-xs text-green-600">Freunde einladen & 1 Monat gratis</p>
                </div>
                <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700" onClick={() => {
                  navigator.clipboard.writeText('https://rasenpilot.lovable.app');
                  import('sonner').then(({ toast }) => toast.success('Link kopiert!'));
                }}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default PremiumDashboard;
