
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Sparkles, Users, ArrowRight, Leaf } from 'lucide-react';

const SimplifiedLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-green-800">Rasenpilot</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/blog-overview')}
            >
              Blog
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-green-800 mb-6">
          AI-Powered Lawn Analysis
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Upload a photo of your lawn and get instant AI analysis with a personalized care plan. 
          Simple, fast, and effective.
        </p>
        <Button 
          size="lg"
          onClick={() => navigate('/lawn-analysis')}
          className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
        >
          <Camera className="mr-2 h-5 w-5" />
          Analyze Your Lawn Now
        </Button>
      </section>

      {/* How it Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-green-800 mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Upload Photo</h3>
              <p className="text-gray-600">
                Take a photo of your lawn and upload it to our platform
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. AI Analysis</h3>
              <p className="text-gray-600">
                Our AI analyzes your lawn and gives you a health score
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Get Care Plan</h3>
              <p className="text-gray-600">
                Sign up to receive your personalized lawn care plan
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="bg-green-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-green-800 mb-12">
            Why Choose Rasenpilot?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-green-800 mb-2">Instant Analysis</h3>
                <p className="text-gray-600">Get your lawn health score in seconds</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-green-800 mb-2">Unlimited Analysis</h3>
                <p className="text-gray-600">Analyze as many photos as you want</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-green-800 mb-2">Personal Care Plans</h3>
                <p className="text-gray-600">Get step-by-step improvement plans</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-green-800 mb-2">Expert Tips</h3>
                <p className="text-gray-600">Access our blog for lawn care expertise</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-green-800 mb-6">
          Ready to Transform Your Lawn?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Start with a free analysis today
        </p>
        <Button 
          size="lg"
          onClick={() => navigate('/lawn-analysis')}
          className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
        >
          Get Started Now
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-green-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-6 w-6" />
            <span className="text-xl font-bold">Rasenpilot</span>
          </div>
          <p className="text-green-200">
            © 2024 Rasenpilot. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SimplifiedLanding;
