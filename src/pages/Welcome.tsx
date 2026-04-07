import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Mail, ArrowRight, RefreshCcw, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';

export default function Welcome() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  
  const sessionId = searchParams.get('session_id') || '';

  useEffect(() => {
    const fetchEmail = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch the customer email from the Stripe checkout session
        const { data, error } = await supabase.functions.invoke('check-subscription', {
          body: { action: 'get-session-email', session_id: sessionId }
        });
        
        if (data?.email) {
          setEmail(data.email);
        }
      } catch (err) {
        console.error('Could not fetch session email:', err);
      } finally {
        setLoading(false);
      }
    };

    // Also check URL param as fallback
    const urlEmail = searchParams.get('email');
    if (urlEmail && urlEmail !== '{customer_email}') {
      setEmail(urlEmail);
      setLoading(false);
    } else {
      fetchEmail();
    }
  }, [sessionId, searchParams]);

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: "Fehler",
        description: "Keine E-Mail-Adresse gefunden.",
        variant: "destructive",
      });
      return;
    }
    
    setResending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "E-Mail gesendet! ✉️",
        description: "Bitte prüfe dein Postfach (auch den Spam-Ordner).",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "E-Mail konnte nicht gesendet werden.",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <SEO noindex={true} 
        title="Willkommen bei Rasenpilot Premium 🌱"
        description="Deine Zahlung war erfolgreich. Setze jetzt dein Passwort um loszulegen."
        canonical="/welcome"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50/30 flex items-center justify-center px-4">
        <Card className="max-w-lg w-full border-2 border-green-200 shadow-xl">
          <CardContent className="pt-10 pb-8 px-8 text-center space-y-6">
            {/* Success Icon */}
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            {/* Heading */}
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                Zahlung erfolgreich! ✅
              </h1>
              <p className="text-xl text-green-700 font-semibold">
                Willkommen bei Rasenpilot Premium 🌱
              </p>
            </div>
            
            {/* Email Info */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <Mail className="h-5 w-5" />
                <span className="font-medium">Wir haben dir eine E-Mail geschickt an:</span>
              </div>
              {loading ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                </div>
              ) : email ? (
                <p className="text-lg font-bold text-gray-900">{email}</p>
              ) : (
                <p className="text-sm text-gray-500">Deine registrierte E-Mail-Adresse</p>
              )}
              <p className="text-sm text-gray-600">
                Klick auf den Link in der E-Mail um dein Passwort zu setzen und loszulegen.
              </p>
            </div>
            
            {/* Resend Button */}
            <Button
              variant="outline"
              onClick={handleResendEmail}
              disabled={resending || !email}
              className="w-full py-5"
            >
              {resending ? (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  E-Mail erneut senden
                </>
              )}
            </Button>
            
            {/* Already have account */}
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-500 mb-3">
                Du hast bereits ein Konto?
              </p>
              <Button
                variant="ghost"
                onClick={() => navigate('/auth')}
                className="text-green-700 hover:text-green-800"
              >
                Zum Login <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
