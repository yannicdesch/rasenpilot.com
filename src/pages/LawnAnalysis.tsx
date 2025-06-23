
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Sparkles, ArrowRight, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const LawnAnalysis = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  React.useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image too large. Please choose an image under 10MB.');
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setAnalysisResult(null);
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      // Simulate analysis - in real app, this would call your AI service
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockAnalysis = {
        score: Math.floor(Math.random() * 40) + 60, // Score between 60-100
        issues: [
          'Slight nutrient deficiency detected',
          'Some brown patches visible',
          'Overall lawn density could be improved'
        ],
        recommendations: [
          'Apply nitrogen-rich fertilizer',
          'Increase watering frequency',
          'Consider overseeding in sparse areas'
        ]
      };

      setAnalysisResult(mockAnalysis);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSignUp = () => {
    navigate('/auth?tab=register', { 
      state: { 
        analysisResult,
        redirectTo: '/care-plan'
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-800 mb-4">
              Lawn Analysis
            </h1>
            <p className="text-gray-600 text-lg">
              Upload a photo of your lawn to get an instant AI-powered analysis
            </p>
          </div>

          {/* Image Upload */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Upload Your Lawn Photo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedImage ? (
                <div className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Click to upload or drag and drop</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button asChild className="bg-green-600 hover:bg-green-700">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Image
                    </label>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <img 
                    src={selectedImage} 
                    alt="Your lawn" 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="flex gap-4">
                    <Button
                      onClick={analyzeImage}
                      disabled={isAnalyzing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Analyze Lawn
                        </>
                      )}
                    </Button>
                    <Button variant="outline" asChild>
                      <label htmlFor="image-upload" className="cursor-pointer">
                        Change Image
                      </label>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysisResult && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl text-green-800">
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Score */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {analysisResult.score}/100
                  </div>
                  <p className="text-gray-600">Lawn Health Score</p>
                </div>

                {/* Issues */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Issues Detected:</h3>
                  <ul className="space-y-2">
                    {analysisResult.issues.map((issue: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span className="text-gray-700">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Quick Recommendations:</h3>
                  <ul className="space-y-2">
                    {analysisResult.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Call to Action */}
                {!isAuthenticated && (
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
                    <h3 className="font-semibold text-green-800 mb-2">
                      Get Your Complete Care Plan
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Sign up to receive a personalized lawn care plan with detailed steps and timeline.
                    </p>
                    <Button 
                      onClick={handleSignUp}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Sign Up for Care Plan
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LawnAnalysis;
