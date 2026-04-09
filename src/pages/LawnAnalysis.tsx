
import React, { useCallback, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, AlertCircle, Camera, Star, Lock, Shield, MapPin, Crown, Zap, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import MainNavigation from '@/components/MainNavigation';
import { supabase } from '@/lib/supabase';
import lawnBefore from '@/assets/lawn-before.jpg';
import lawnAfter from '@/assets/lawn-after.jpg';
import SEO from '@/components/SEO';
import { useLawn } from '@/context/LawnContext';
import { useFreeTierLimit } from '@/hooks/useFreeTierLimit';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { trackAnalysisStarted } from '@/lib/analytics/conversionTracking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trackMetaViewContent } from '@/lib/analytics/metaPixel';

const ExampleResultPreview = () => {
  const [revealed, setRevealed] = useState(false);
  
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 text-center mb-3">So sieht deine Analyse aus:</h2>
      <div className="relative bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
        <div className={`p-5 space-y-4 transition-all duration-500 ${!revealed ? 'blur-sm select-none' : ''}`}>
          {/* Fake result preview */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Lawn Score</span>
            <span className="text-2xl font-bold text-green-600">72/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-gradient-to-r from-yellow-400 to-green-500 h-3 rounded-full" style={{ width: '72%' }} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-green-50 rounded-lg p-3">
              <p className="font-medium text-green-800">✅ Dichte</p>
              <p className="text-gray-600 text-xs">Guter Wuchs, leichte Lücken</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="font-medium text-yellow-800">⚠️ Feuchtigkeit</p>
              <p className="text-gray-600 text-xs">Leicht trocken</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="font-medium text-green-800">✅ Bodenqualität</p>
              <p className="text-gray-600 text-xs">Nährstoffreich</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <p className="font-medium text-red-800">🔴 Unkraut</p>
              <p className="text-gray-600 text-xs">Klee erkannt</p>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="font-semibold text-green-800 text-sm mb-1">Schritt 1: Düngen</p>
            <p className="text-xs text-gray-600">Bringe einen stickstoffreichen Langzeitdünger aus, um die Lücken im Rasen zu schließen.</p>
          </div>
        </div>
        
        {!revealed && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/30">
            <Button
              onClick={() => setRevealed(true)}
              variant="outline"
              className="bg-white shadow-lg border-green-300 text-green-700 hover:bg-green-50"
            >
              <Eye className="mr-2 h-4 w-4" />
              Beispiel ansehen
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const LawnAnalysis = () => {
  const navigate = useNavigate();
  const { profile } = useLawn();
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const { hasReachedLimit, remainingAnalyses, canAnalyze, loading: limitLoading, markAnonymousAnalysisUsed } = useFreeTierLimit();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [zipCode, setZipCode] = useState<string>(profile?.zipCode || '10115');
  const [locationStatus, setLocationStatus] = useState<'detecting' | 'success' | 'failed'>('detecting');
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rotating lawn tips during analysis
  const lawnTips = [
    "Tipp: Zu wenig Stickstoff ist oft die Ursache für braune Flecken.",
    "Wussten Sie? Regelmäßiges Vertikutieren verbessert die Nährstoffaufnahme.",
    "Profi-Trick: Morgens gießen reduziert Pilzbefall um 80%.",
    "Geheimnis: Der richtige pH-Wert macht 70% eines gesunden Rasens aus.",
    "Fakt: Überdüngung schadet mehr als zu wenig Dünger.",
    "Tipp: Mulchmähen spart 30% der Düngungskosten."
  ];

  // Auto-detect location and track ViewContent on mount
  React.useEffect(() => {
    detectUserLocation();
    trackMetaViewContent('Lawn Analysis', 'analysis');
  }, []);

  const detectUserLocation = async () => {
    if (profile?.zipCode) {
      setZipCode(profile.zipCode);
      setUserLocation(profile.zipCode);
      setLocationStatus('success');
      return;
    }

    if (navigator.geolocation) {
      setLocationStatus('detecting');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Use OpenStreetMap Nominatim for reliable reverse geocoding
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=de`,
              { headers: { 'User-Agent': 'RasenPilot/1.0' } }
            );
            
            if (response.ok) {
              const data = await response.json();
              const address = data.address;
              // Extract city name: try city, town, village, municipality in order
              const cityName = address?.city || address?.town || address?.village || address?.municipality || address?.county;
              const postcode = address?.postcode;
              
              if (postcode) {
                setZipCode(postcode);
              }
              if (cityName) {
                setUserLocation(cityName);
                setLocationStatus('success');
                return;
              }
            }
            // If API fails, use default fallback
            setZipCode('10115');
            setUserLocation('Deutschland');
            setLocationStatus('success');
          } catch (error) {
            console.error('Reverse geocoding failed:', error);
            setZipCode('10115');
            setUserLocation('Deutschland');
            setLocationStatus('success');
          }
        },
        (error) => {
          console.error('Geolocation failed:', error);
          setZipCode('10115');
          setUserLocation('Deutschland');
          setLocationStatus('success');
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setZipCode('10115');
      setUserLocation('Deutschland');
      setLocationStatus('success');
    }
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

    if (file.size > maxSize) {
      return "Datei zu groß (max. 10 MB).";
    }

    if (!allowedTypes.includes(file.type)) {
      return "Nur JPG/PNG erlaubt.";
    }

    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    setError(null);
    
    // Wait for limit check to complete
    if (limitLoading) {
      toast({
        title: "Bitte warten",
        description: "Ihr Analyse-Status wird überprüft...",
      });
      return;
    }

    // Check if limit reached - require login if anonymous, show upgrade if logged in
    if (hasReachedLimit && !isPremium) {
      if (!user) {
        setError("Ihre kostenlose Analyse wurde bereits verwendet. Bitte melden Sie sich an oder upgraden Sie auf Premium.");
        toast({
          title: "Kostenlose Analyse aufgebraucht",
          description: "Melden Sie sich an oder upgraden Sie auf Premium für weitere Analysen.",
          variant: "destructive"
        });
      } else {
        setError("Sie haben Ihre kostenlose Analyse bereits verwendet.");
        toast({
          title: "Analyse-Limit erreicht",
          description: "Upgraden Sie auf Premium für unbegrenzte Analysen!",
          variant: "destructive"
        });
      }
      return;
    }
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      // Start analysis automatically
      startAnalysis(file);
    };
    reader.readAsDataURL(file);
  }, [hasReachedLimit, isPremium, user, limitLoading]);

  const startAnalysis = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setAnalysisStep(0);

    // Track conversion event
    trackAnalysisStarted(user?.id);

    try {
      // Simulate analysis progress with tips rotation
      const tipInterval = setInterval(() => {
        setAnalysisStep((prev) => (prev + 1) % lawnTips.length);
      }, 5000);

      // Upload progress simulation
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Upload to storage
      const fileName = `lawn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${file.name.split('.').pop()}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('lawn-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create analysis job
      const { data: jobData, error: jobError } = await supabase
        .rpc('create_analysis_job', {
          p_user_id: user?.id || null,
          p_image_path: uploadData.path,
          p_grass_type: profile?.grassType || 'unbekannt',
          p_lawn_goal: profile?.lawnGoal || 'gesunder-rasen',
          p_metadata: JSON.stringify({ 
            auto_analysis: true, 
            conversion_optimized: true,
            upload_timestamp: new Date().toISOString(),
            zipCode: zipCode || '10115',
            userLocation: userLocation,
            locationMethod: locationStatus
          })
        });

      if (jobError) throw jobError;

      const jobId = jobData;
      console.log('Created analysis job:', jobId);

      // Start the actual AI analysis
      console.log('🚀 Starting AI analysis with job ID:', jobId);
      const { data: analysisResponse, error: analysisError } = await supabase.functions.invoke('start-analysis', {
        body: { jobId }
      });

      console.log('Analysis response:', analysisResponse);
      console.log('Analysis error:', analysisError);

      if (analysisError) {
        console.error('Failed to start analysis:', analysisError);
        throw new Error(`Analyse konnte nicht gestartet werden: ${analysisError.message}`);
      }

      // Poll for completion before navigating (max 60 seconds)
      console.log('⏳ Waiting for analysis to complete...');
      let pollAttempts = 0;
      const maxAttempts = 30; // 30 * 2s = 60s max
      let analysisCompleted = false;

      while (pollAttempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        pollAttempts++;
        
        try {
          const { data: jobStatus } = await supabase
            .rpc('get_analysis_job', { p_job_id: jobId });
          
          const status = (jobStatus as any)?.status;
          console.log(`Poll ${pollAttempts}/${maxAttempts}: status = ${status}`);
          
          if (status === 'completed') {
            analysisCompleted = true;
            break;
          } else if (status === 'failed') {
            throw new Error('Die Analyse ist fehlgeschlagen. Bitte versuche es erneut.');
          }
        } catch (pollError: any) {
          if (pollError.message?.includes('fehlgeschlagen')) throw pollError;
          console.warn('Poll error, retrying...', pollError);
        }
      }

      clearInterval(tipInterval);
      
      // Mark anonymous analysis as used
      if (!user) {
        markAnonymousAnalysisUsed();
      }

      if (!analysisCompleted) {
        // Navigate anyway after timeout - result page will handle polling
        console.log('⚠️ Analysis not yet complete after timeout, navigating anyway...');
      }
      
      console.log('✅ Analysis complete, navigating to results...');
      navigate(`/analysis-result/${jobId}`);

    } catch (error) {
      console.error('Analysis error:', error);
      setIsUploading(false);
      toast({
        title: "Fehler bei der Analyse",
        description: "Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="min-h-[100dvh] md:min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
      <SEO 
        title="Kostenlose Rasenanalyse — KI erkennt Probleme sofort | Rasenpilot"
        description="Foto hochladen, KI analysiert Moos, Pilze, Nährstoffmangel und gibt dir einen persönlichen Pflegeplan. 100% kostenlos, keine Anmeldung nötig."
        keywords="Rasen Analyse App, Rasenanalyse, KI Rasenanalyse, Rasen analysieren App, kostenlos, Pflegeplan"
        canonical="https://www.rasenpilot.com/lawn-analysis"
      />
      
      <MainNavigation />
      
      <div className="flex-1 flex flex-col container mx-auto px-4 py-3 md:py-6 max-w-md">

        {/* Compact limit banner — mobile: 1-2 lines, desktop: full card */}
        {!user && hasReachedLimit && !limitLoading && (
          <>
            {/* Mobile: compact single-line */}
            <div className="md:hidden mb-3 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 flex items-center justify-between">
              <span className="text-xs text-amber-800 font-medium">Kostenlose Analyse aufgebraucht</span>
              <Button 
                onClick={() => navigate('/subscription?ref=analysis-limit')}
                size="sm"
                className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white px-3"
              >
                Premium testen
              </Button>
            </div>
            {/* Desktop: full card */}
            <Card className="hidden md:block mb-6 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-800">
                  <Crown className="h-5 w-5 text-amber-600" />
                  Kostenlose Analyse aufgebraucht
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <p className="text-sm text-amber-700">
                  Du hast deine kostenlose Analyse bereits verwendet. Melde dich an oder starte mit Premium:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-xs text-gray-700">Unbegrenzte Analysen</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-xs text-gray-700">Persönlicher Pflegeplan</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-xs text-gray-700">Wetter-Empfehlungen</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-xs text-gray-700">KI-Chat Support</span>
                  </div>
                </div>
                <div className="text-center py-2">
                  <span className="text-xs text-gray-500">Ab nur </span>
                  <span className="text-lg font-bold text-green-700">9,99€</span>
                  <span className="text-xs text-gray-500">/Monat</span>
                  <span className="block text-xs text-green-600 font-medium">7 Tage kostenlos testen</span>
                </div>
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={() => navigate('/subscription?ref=analysis-limit')}
                    size="lg"
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md"
                  >
                    <Crown className="mr-2 h-5 w-5" />
                    Jetzt Premium starten
                  </Button>
                  <Button 
                    onClick={() => navigate('/auth?redirect=/lawn-analysis')}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Bereits registriert? Anmelden
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Free analysis available banner */}
        {!user && !hasReachedLimit && !limitLoading && (
          <>
            {/* Mobile: compact */}
            <div className="md:hidden mb-3 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2">
              <p className="text-xs font-semibold text-amber-800">🎉 1 kostenlose Analyse · Danach: ab 9,99€/Monat</p>
            </div>
            {/* Desktop: full */}
            <Card className="hidden md:block mb-6 border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 rounded-full p-2">
                    <Star className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-800">🎉 1 kostenlose Analyse verfügbar</p>
                    <p className="text-xs text-amber-600">Keine Anmeldung nötig · Danach: ab 9,99€/Monat — jetzt kostenlos starten!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Logged-in user limit banners */}
        {user && !isPremium && (
          <>
            {/* Mobile: compact */}
            <div className="md:hidden mb-3">
              {hasReachedLimit ? (
                <div className="bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-amber-800 font-medium">Analyse aufgebraucht</span>
                  <Button 
                    onClick={() => navigate('/subscription?ref=analysis-limit')}
                    size="sm"
                    className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white px-3"
                  >
                    Premium testen
                  </Button>
                </div>
              ) : !limitLoading ? (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg px-3 py-2">
                  <p className="text-xs text-yellow-700 font-medium">⭐ 1 kostenlose Analyse verfügbar</p>
                </div>
              ) : null}
            </div>
            {/* Desktop: full card */}
            <Card className={`hidden md:block mb-6 ${hasReachedLimit ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg' : 'border-yellow-300 bg-yellow-50'}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  {limitLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-yellow-700">Lade Status...</span>
                    </>
                  ) : hasReachedLimit ? (
                    <>
                      <Crown className="h-5 w-5 text-amber-600" />
                      <span className="text-amber-800 text-base">Jetzt Premium freischalten</span>
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 text-yellow-600" />
                      <span className="text-yellow-700">Kostenlose Analyse: {remainingAnalyses} von 1 verfügbar</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {hasReachedLimit ? (
                  <div className="space-y-4">
                    <p className="text-sm text-amber-800">
                      Du hast deine kostenlose Analyse verwendet. Mit Premium erhältst du:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-xs text-gray-700">Unbegrenzte Analysen</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-xs text-gray-700">Persönlicher Pflegeplan</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-xs text-gray-700">Wetter-Empfehlungen</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-xs text-gray-700">KI-Chat Support</span>
                      </div>
                    </div>
                    <div className="text-center py-2">
                      <span className="text-xs text-gray-500">Ab nur </span>
                      <span className="text-lg font-bold text-green-700">9,99€</span>
                      <span className="text-xs text-gray-500">/Monat</span>
                      <span className="block text-xs text-green-600 font-medium">7 Tage kostenlos testen</span>
                    </div>
                    <Button 
                      onClick={() => navigate('/subscription?ref=analysis-limit')}
                      size="lg"
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md"
                    >
                      <Crown className="mr-2 h-5 w-5" />
                      Jetzt Premium starten
                    </Button>
                  </div>
                ) : !limitLoading && (
                  <p className="text-sm text-yellow-700">
                    Dies ist deine kostenlose Analyse. Für unbegrenzte Analysen upgrade auf Premium.
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
        
        {/* 3-Step Process — visible on all devices */}
        <div className="flex items-center justify-center gap-2 mb-4 md:mb-6">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs md:text-sm font-bold">1</div>
            <span className="text-xs md:text-sm font-medium text-foreground">Foto</span>
          </div>
          <div className="w-6 md:w-8 h-px bg-border" />
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs md:text-sm font-bold">2</div>
            <span className="text-xs md:text-sm text-muted-foreground">KI analysiert</span>
          </div>
          <div className="w-6 md:w-8 h-px bg-border" />
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs md:text-sm font-bold">3</div>
            <span className="text-xs md:text-sm text-muted-foreground">Ergebnis</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-3 md:mb-6">
          <h1 className="text-2xl md:text-4xl font-bold text-green-800 mb-1 md:mb-3">
            Zeig uns deinen Rasen
          </h1>
          <p className="text-sm md:text-lg text-slate-700">
            KI-Analyse in 30 Sekunden
          </p>
          
          {/* Location Status — desktop only */}
          <div className="hidden md:block mt-4 space-y-2">
            {locationStatus === 'detecting' && (
              <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Standort wird erkannt...</span>
              </div>
            )}
            {locationStatus === 'success' && userLocation && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                <MapPin className="h-4 w-4" />
                <span>Standort: {userLocation}</span>
              </div>
            )}
          </div>

          {/* PLZ Input — desktop only (on mobile it's inside the upload box) */}
          <div className="hidden md:block mt-3 max-w-xs mx-auto">
            <Label htmlFor="plz-input-desktop" className="text-xs text-gray-500">Deine PLZ (optional — für lokale Wettertipps)</Label>
            <Input
              id="plz-input-desktop"
              type="text"
              placeholder="z.B. 69190"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="mt-1 text-center text-sm h-9"
              maxLength={5}
            />
          </div>
        </div>

        {/* Upload Dropzone — flex-1 on mobile to fill remaining space */}
        <div className="flex-1 md:flex-none mb-3 md:mb-6 flex flex-col">
          {/* Block upload when limit reached */}
          {user && !isPremium && hasReachedLimit && !limitLoading ? (
            <div className="flex-1 md:flex-none bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-6 md:p-8 text-center opacity-60 cursor-not-allowed flex flex-col items-center justify-center">
              <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 bg-gray-400 rounded-full flex items-center justify-center">
                <Lock className="h-7 w-7 md:h-8 md:w-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-2">
                Upload gesperrt
              </h3>
              <p className="text-gray-500 text-sm mb-3">
                Kostenlose Analyse aufgebraucht.
              </p>
              <Button 
                onClick={() => navigate('/subscription?ref=analysis-limit')}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
              >
                <Crown className="mr-2 h-4 w-4" />
                Premium upgraden
              </Button>
            </div>
          ) : (
          <div
            className={`flex-1 md:flex-none bg-green-50 border-2 border-dashed rounded-2xl p-5 md:p-8 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[200px] ${
              limitLoading
                ? 'cursor-wait opacity-70 border-gray-300'
                : isDragOver 
                ? 'border-green-400 bg-green-100 cursor-pointer' 
                : error
                ? 'border-red-300 bg-red-50 cursor-pointer'
                : 'border-green-200 hover:border-green-300 hover:bg-green-100 cursor-pointer'
            }`}
            onDrop={limitLoading ? undefined : handleDrop}
            onDragOver={limitLoading ? undefined : handleDragOver}
            onDragLeave={limitLoading ? undefined : handleDragLeave}
            onClick={limitLoading ? undefined : handleClick}
            role="button"
            aria-label="Rasenfoto hochladen"
            tabIndex={limitLoading ? -1 : 0}
          >
            {!isUploading && !preview ? (
              <>
                <div className={`w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${limitLoading ? 'bg-gray-400' : 'bg-green-600'}`}>
                  {limitLoading ? (
                    <div className="h-7 w-7 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  ) : error ? (
                    <AlertCircle className="h-7 w-7 text-white" />
                  ) : (
                    <Camera className="h-7 w-7 text-white" />
                  )}
                </div>
                
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-1">
                  {limitLoading ? 'Lade Status...' : '📸 Foto hochladen'}
                </h3>
                
                <p className={`text-sm font-medium mb-2 ${limitLoading ? 'text-gray-500' : 'text-green-600 underline'}`}>
                  {limitLoading ? '' : 'Tippen zum Auswählen'}
                </p>
                
                <p className="text-xs text-gray-400 mb-3">
                  JPG/PNG · max. 10 MB
                </p>

                {/* PLZ inside upload box — mobile only */}
                <div className="md:hidden w-full max-w-[180px] mx-auto" onClick={(e) => e.stopPropagation()}>
                  <Input
                    id="plz-input-mobile"
                    type="text"
                    placeholder="PLZ (optional)"
                    value={zipCode === '10115' ? '' : zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="text-center text-xs h-8 bg-white/80"
                    maxLength={5}
                  />
                </div>

                <p className="hidden md:block text-xs text-gray-400 italic mt-2">
                  💡 Tipp: Fotografiere bei Tageslicht von oben — für beste Ergebnisse
                </p>
                
                {error && (
                  <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-xs font-medium">{error}</p>
                  </div>
                )}
              </>
            ) : isUploading ? (
              <div className="space-y-4 md:space-y-6 w-full">
                {preview && (
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-lg overflow-hidden">
                    <img src={preview} alt="Uploaded lawn" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="w-10 h-10 md:w-12 md:h-12 mx-auto bg-green-600 rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
                
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
                    Analysiere … ca. 30 s
                  </h3>
                  
                  <Progress value={uploadProgress} className="mb-3" />
                  
                  <div className="bg-green-100 rounded-lg p-2 md:p-3 min-h-10 flex items-center justify-center">
                    <p className="text-xs md:text-sm text-green-800 font-medium text-center">
                      {lawnTips[analysisStep]}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {preview && (
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-lg overflow-hidden">
                    <img src={preview} alt="Uploaded lawn" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="w-10 h-10 md:w-12 md:h-12 mx-auto bg-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                
                <h3 className="text-base md:text-lg font-semibold text-green-800">
                  Upload erfolgreich!
                </h3>
              </div>
            )}
          </div>
          )}
        </div>

        {/* Trust Line — compact on mobile */}
        <div className="text-center text-xs text-gray-400 mb-3 md:mb-8">
          <span className="md:hidden">✅ Kostenlos · 🔒 DSGVO · ⚡ 30 Sek</span>
          <div className="hidden md:flex items-center justify-center space-x-6 text-gray-500">
            <div className="flex items-center space-x-1">
              <Zap className="h-4 w-4 text-green-500" />
              <span>Kostenlos & ohne Anmeldung</span>
            </div>
            <div className="flex items-center space-x-1">
              <Lock className="h-4 w-4" />
              <span>Ergebnis in 30 Sekunden</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4" />
              <span>DSGVO-konform</span>
            </div>
          </div>
        </div>

        {/* Example Result Preview — desktop only (on mobile: shown after analysis) */}
        <div className="hidden md:block">
          <ExampleResultPreview />
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default LawnAnalysis;
