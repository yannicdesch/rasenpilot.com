import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  Clock, 
  Mail, 
  Star, 
  TrendingUp, 
  Calendar,
  Smartphone,
  Download,
  Users,
  Target,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';

interface PostAnalysisConversionProps {
  score: number;
  userId?: string;
  onEmailCaptured?: (email: string) => void;
  onRegistrationComplete?: () => void;
}

const PostAnalysisConversion: React.FC<PostAnalysisConversionProps> = ({
  score,
  userId,
  onEmailCaptured,
  onRegistrationComplete
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'initial' | 'email' | 'success'>('initial');
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes

  // Timer for urgency
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEmailSubmit = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Bitte geben Sie eine gültige E-Mail-Adresse ein');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save to subscribers table
      const { error } = await supabase
        .from('subscribers')
        .insert({
          email,
          subscribed: true
        });

      if (error) throw error;

      // Send welcome email with analysis details
      const analysisId = window.location.pathname.split('/').pop() || '';
      const firstName = email.split('@')[0]; // Extract name from email
      
      try {
        const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
          body: {
            email,
            firstName,
            analysisScore: score,
            analysisId
          }
        });

        if (emailError) {
          console.error('Error sending welcome email:', emailError);
          // Don't fail the entire process if email fails
        }
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't fail the entire process if email fails
      }

      trackEvent('conversion', 'email_captured', 'post_analysis');
      setStep('success');
      onEmailCaptured?.(email);
      
      toast.success('Perfekt! Ihr personalisierter Pflegeplan wird vorbereitet...');
      
    } catch (error) {
      console.error('Error saving email:', error);
      toast.error('Fehler beim Speichern. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return { message: "Ausgezeichnet! Ihr Rasen ist in Top-Zustand", color: "text-green-600", emoji: "🌟" };
    if (score >= 60) return { message: "Gut! Mit den richtigen Maßnahmen wird Ihr Rasen perfekt", color: "text-yellow-600", emoji: "🚀" };
    return { message: "Potential erkannt! Wir zeigen Ihnen den Weg zum Traumrasen", color: "text-orange-600", emoji: "💪" };
  };

  const scoreMsg = getScoreMessage(score);

  if (step === 'success') {
    return (
      <Card className="border-green-200 shadow-lg">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            Perfekt! Ihr Plan wird erstellt...
          </h3>
          <p className="text-gray-600 mb-4">
            Sie erhalten in wenigen Minuten Ihren personalisierten 7-Tage-Pflegeplan per E-Mail.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Wetter-optimierte Empfehlungen</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Produktempfehlungen für Ihren Rasen</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Wöchentliche Tipps und Erinnerungen</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'email') {
    return (
      <Card className="border-green-200 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">{scoreMsg.emoji}</span>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Score: {score}/100
            </Badge>
          </div>
          <CardTitle className="text-xl text-green-800">
            {scoreMsg.message}
          </CardTitle>
          <div className="flex items-center justify-center gap-2 text-red-600 mt-3">
            <Clock className="h-4 w-4" />
            <span className="font-medium">Nur noch {formatTime(timeRemaining)} verfügbar!</span>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Ihr kostenloser 7-Tage-Aktionsplan enthält:
              </h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Tag-für-Tag Anweisungen basierend auf Ihrem {score}-Punkte-Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Wetterbasierte Pflegeempfehlungen für Ihre Region</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Einkaufsliste mit Mengenangaben</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>SMS-Erinnerungen für optimale Timing</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">E-Mail für Ihren kostenlosen Plan:</span>
              </div>
              <Input
                type="email"
                placeholder="ihre.email@beispiel.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-green-200 focus:ring-green-500"
              />
              
              <Button 
                onClick={handleEmailSubmit}
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Plan wird erstellt...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Kostenlosen 7-Tage-Plan sichern
                  </>
                )}
              </Button>
              
              <div className="text-center text-xs text-gray-500">
                ✓ Kein Spam ✓ Jederzeit abbestellbar ✓ 100% kostenlos
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs text-gray-600 pt-4 border-t">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>23.847 zufriedene Nutzer</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500" />
                <span>4.8/5 Bewertung</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">{scoreMsg.emoji}</span>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Score: {score}/100
          </Badge>
        </div>
        <CardTitle className={`text-xl ${scoreMsg.color}`}>
          {scoreMsg.message}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Progress visualization */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ihr Rasen-Potential</span>
              <span className="font-medium">{score}%</span>
            </div>
            <Progress value={score} className="h-3" />
            <div className="text-center text-sm text-gray-500">
              {100 - score} Punkte bis zum Traumrasen!
            </div>
          </div>

          {/* Value proposition */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Bereit für den nächsten Schritt?
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              Basierend auf Ihrer Analyse erstellen wir einen personalisierten 7-Tage-Aktionsplan, 
              der Ihren Rasen {score < 60 ? 'um mindestens 20 Punkte verbessert' : 'zur Perfektion führt'}.
            </p>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-green-500" />
                <span>7-Tage-Plan</span>
              </div>
              <div className="flex items-center gap-1">
                <Smartphone className="h-3 w-3 text-green-500" />
                <span>SMS-Erinnerungen</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span>Wetterbasiert</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3 text-green-500" />
                <span>Score-optimiert</span>
              </div>
            </div>
          </div>

          {/* Urgency timer */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center justify-center gap-2 text-red-700">
              <Clock className="h-4 w-4" />
              <span className="font-medium text-sm">
                Kostenloses Angebot läuft ab in: {formatTime(timeRemaining)}
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            onClick={() => setStep('email')}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-medium"
          >
            <Download className="mr-2 h-5 w-5" />
            Jetzt kostenlosen Plan erstellen
          </Button>
          
          <div className="text-center text-xs text-gray-500">
            ✓ 100% kostenlos ✓ Sofort verfügbar ✓ Kein Abo
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostAnalysisConversion;