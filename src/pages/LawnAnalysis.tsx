
import React, { useCallback, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, AlertCircle, Camera, Star, Lock, FlaskConical, MapPin, Crown } from 'lucide-react';
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

const LawnAnalysis = () => {
  const navigate = useNavigate();
  const { profile } = useLawn();
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const { hasReachedLimit, remainingAnalyses, canAnalyze, loading: limitLoading } = useFreeTierLimit();
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

  // Auto-detect location on component mount
  React.useEffect(() => {
    detectUserLocation();
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
            // Convert coordinates to zip code using reverse geocoding
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=dummy`
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data.length > 0) {
                // For demo purposes, use a default zip based on major German cities
                const germanZips: Record<string, string> = {
                  'Berlin': '10115',
                  'Hamburg': '20095',
                  'Munich': '80331',
                  'Cologne': '50667',
                  'Frankfurt': '60311'
                };
                const detectedZip = germanZips[data[0].name] || '10115';
                setZipCode(detectedZip);
                setUserLocation(data[0].name);
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
            setLocationStatus('failed');
          }
        },
        (error) => {
          console.error('Geolocation failed:', error);
          // Use default fallback
          setZipCode('10115');
          setUserLocation('Deutschland');
          setLocationStatus('success');
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    } else {
      // Use default fallback
      setZipCode('10115');
      setUserLocation('Deutschland');
      setLocationStatus('success');
    }
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

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
    
    // Check if user is logged in - show error but don't redirect immediately
    if (!user) {
      setError("Bitte melden Sie sich an, um eine Rasenanalyse durchzuführen.");
      toast({
        title: "Anmeldung erforderlich",
        description: "Bitte melden Sie sich an, um eine Rasenanalyse durchzuführen.",
        variant: "destructive"
      });
      return;
    }

    // Wait for limit check to complete
    if (limitLoading) {
      toast({
        title: "Bitte warten",
        description: "Ihr Analyse-Status wird überprüft...",
      });
      return;
    }

    // Check if limit reached - show error but don't redirect
    if (hasReachedLimit && !isPremium) {
      setError("Sie haben Ihre kostenlose Analyse bereits verwendet.");
      toast({
        title: "Analyse-Limit erreicht",
        description: "Sie haben Ihre kostenlose Analyse bereits verwendet. Upgraden Sie auf Premium für unbegrenzte Analysen!",
        variant: "destructive"
      });
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
  }, [hasReachedLimit, isPremium, user, limitLoading, navigate]);

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

      clearInterval(tipInterval);
      
      // Success feedback
      toast({
        title: "🎉 Analyse gestartet!",
        description: "Ihr Foto wird jetzt von der KI analysiert...",
      });

      console.log('✅ Analysis started successfully, navigating to results...');
      // Navigate to results after brief success message
      setTimeout(() => {
        console.log('🔗 Navigating to:', `/analysis-result/${jobId}`);
        navigate(`/analysis-result/${jobId}`);
      }, 2000);

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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <SEO 
        title="Kostenlose KI-Rasenanalyse - Perfekten Pflegeplan in 30 Sekunden"
        description="Laden Sie ein Foto Ihres Rasens hoch und erhalten Sie in 30 Sekunden eine professionelle KI-Analyse mit personalisiertem Pflegeplan. Über 50.000 erfolgreiche Analysen."
        keywords="Rasenanalyse, KI Rasen, Rasenpflege, Rasen analysieren, kostenlos, Pflegeplan"
        canonical="https://www.rasenpilot.com/lawn-analysis"
      />
      
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-6 max-w-md">

        {/* Free Tier Limit Warning */}
        {user && !isPremium && (
          <Card className={`mb-6 ${hasReachedLimit ? 'border-red-300 bg-red-50' : 'border-yellow-300 bg-yellow-50'}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                {limitLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-yellow-700">Lade Status...</span>
                  </>
                ) : hasReachedLimit ? (
                  <>
                    <Lock className="h-4 w-4 text-red-600" />
                    <span className="text-red-700">Analyse-Limit erreicht</span>
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
                <>
                  <p className="text-sm text-red-700 mb-3">
                    Sie haben Ihre kostenlose Analyse bereits verwendet. Upgraden Sie auf Premium für unbegrenzte Analysen!
                  </p>
                  <Button 
                    onClick={() => navigate('/subscription?ref=analysis-limit')}
                    size="sm"
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Jetzt Premium upgraden
                  </Button>
                </>
              ) : !limitLoading && (
                <p className="text-sm text-yellow-700">
                  Dies ist Ihre kostenlose Analyse. Für unbegrenzte Analysen upgraden Sie auf Premium.
                </p>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-3">
            Rasenfoto hochladen
          </h1>
          <p className="text-lg text-slate-700">
            In 30 Sekunden zu deinem perfekten Pflegeplan.
          </p>
          
          {/* Location Status */}
          <div className="mt-4">
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
        </div>

        {/* Before/After Visual Teaser */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-green-100">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <img 
                  src={lawnBefore} 
                  alt="Ungesunder Rasen vorher" 
                  className="w-full h-24 object-cover rounded-lg"
                />
                <div className="absolute top-2 left-2 bg-green-800 text-white px-2 py-1 rounded text-xs font-medium">
                  Vorher
                </div>
              </div>
              <div className="relative">
                <img 
                  src={lawnAfter} 
                  alt="Gesunder Rasen nachher" 
                  className="w-full h-24 object-cover rounded-lg"
                />
                <div className="absolute top-2 left-2 bg-green-800 text-white px-2 py-1 rounded text-xs font-medium">
                  Nachher
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 italic mt-3">
              Dein Rasen könnte so aussehen …
            </p>
          </div>
        </div>

        {/* Upload Dropzone */}
        <div className="mb-6">
          {/* Block upload when limit reached */}
          {user && !isPremium && hasReachedLimit && !limitLoading ? (
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center opacity-60 cursor-not-allowed">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-400 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Upload gesperrt
              </h3>
              <p className="text-gray-500 mb-4">
                Sie haben Ihre kostenlose Analyse bereits verwendet.
              </p>
              <Button 
                onClick={() => navigate('/subscription?ref=analysis-limit')}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
              >
                <Crown className="mr-2 h-4 w-4" />
                Jetzt Premium upgraden
              </Button>
            </div>
          ) : (
          <div
            className={`bg-green-50 border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
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
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${limitLoading ? 'bg-gray-400' : 'bg-green-600'}`}>
                  {limitLoading ? (
                    <div className="h-8 w-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  ) : error ? (
                    <AlertCircle className="h-8 w-8 text-white" />
                  ) : (
                    <Upload className="h-8 w-8 text-white" />
                  )}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {limitLoading ? 'Lade Status...' : 'Foto hier ablegen'}
                </h3>
                
                <p className={`font-medium mb-3 ${limitLoading ? 'text-gray-500' : 'text-green-600 underline'}`}>
                  {limitLoading ? 'Bitte warten...' : 'oder klicken zum Auswählen'}
                </p>
                
                <p className="text-sm text-gray-500">
                  JPG/PNG, max. 10 MB
                </p>
                
                {error && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}
              </>
            ) : isUploading ? (
              <div className="space-y-6">
                {preview && (
                  <div className="w-20 h-20 mx-auto rounded-lg overflow-hidden">
                    <img src={preview} alt="Uploaded lawn" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="w-12 h-12 mx-auto bg-green-600 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Analysiere … ca. 30 s
                  </h3>
                  
                  <Progress value={uploadProgress} className="mb-4" />
                  
                  <div className="bg-green-100 rounded-lg p-3 min-h-12 flex items-center justify-center">
                    <p className="text-sm text-green-800 font-medium text-center">
                      {lawnTips[analysisStep]}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {preview && (
                  <div className="w-20 h-20 mx-auto rounded-lg overflow-hidden">
                    <img src={preview} alt="Uploaded lawn" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="w-12 h-12 mx-auto bg-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-green-800">
                  Upload erfolgreich!
                </h3>
              </div>
            )}
          </div>
          )}
        </div>

        {/* Trust Line */}
        <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>50.000+ Analysen</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Lock className="h-4 w-4" />
            <span>Nur zur Auswertung</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <FlaskConical className="h-4 w-4" />
            <span>Wissenschaftlich validiert</span>
          </div>
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
