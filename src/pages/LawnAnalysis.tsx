
import React, { useCallback, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, AlertCircle, Camera, Star, Lock, FlaskConical, MapPin } from 'lucide-react';
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

const LawnAnalysis = () => {
  const navigate = useNavigate();
  const { profile } = useLawn();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [zipCode, setZipCode] = useState<string>(profile?.zipCode || '');
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
  }, []);

  const startAnalysis = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setAnalysisStep(0);

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
          p_user_id: null,
          p_image_path: uploadData.path,
          p_grass_type: profile?.grassType || 'unbekannt',
          p_lawn_goal: profile?.lawnGoal || 'gesunder-rasen',
          p_metadata: JSON.stringify({ 
            auto_analysis: true, 
            conversion_optimized: true,
            upload_timestamp: new Date().toISOString(),
            zipCode: zipCode || profile?.zipCode
          })
        });

      if (jobError) throw jobError;

      const jobId = jobData;
      console.log('Created analysis job:', jobId);

      // Start the actual AI analysis
      const { error: analysisError } = await supabase.functions.invoke('start-analysis', {
        body: { jobId }
      });

      if (analysisError) {
        console.error('Failed to start analysis:', analysisError);
        throw new Error('Analyse konnte nicht gestartet werden');
      }

      clearInterval(tipInterval);
      
      // Success feedback
      toast({
        title: "🎉 Analyse gestartet!",
        description: "Ihr Foto wird jetzt von der KI analysiert...",
      });

      // Navigate to results after brief success message
      setTimeout(() => {
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-3">
            Rasenfoto hochladen
          </h1>
          <p className="text-lg text-slate-700">
            In 30 Sekunden zu deinem perfekten Pflegeplan.
          </p>
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
          <div
            className={`bg-green-50 border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragOver 
                ? 'border-green-400 bg-green-100' 
                : error
                ? 'border-red-300 bg-red-50'
                : 'border-green-200 hover:border-green-300 hover:bg-green-100'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
            role="button"
            aria-label="Rasenfoto hochladen"
            tabIndex={0}
          >
            {!isUploading && !preview ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center">
                  {error ? (
                    <AlertCircle className="h-8 w-8 text-white" />
                  ) : (
                    <Upload className="h-8 w-8 text-white" />
                  )}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Foto hier ablegen
                </h3>
                
                <p className="text-green-600 font-medium underline mb-3">
                  oder klicken zum Auswählen
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
        </div>

        {/* Zipcode Input for Weather Enhancement */}
        <div className="mb-6">
          <div className="bg-white rounded-xl p-4 shadow-md border border-blue-100">
            <Label htmlFor="zipcode" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              Postleitzahl für wetterbasierte Empfehlungen (optional)
            </Label>
            <Input
              id="zipcode"
              type="text"
              placeholder="z.B. 10115 für Berlin"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors"
              maxLength={5}
            />
            <p className="text-xs text-gray-500 mt-1">
              Optimale Pflegezeiten basierend auf lokalen Wetterbedingungen
            </p>
          </div>
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
