
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Calendar, Info, MessageSquare, Mail, Lock, UserRoundPlus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from '@/components/ui/input';
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Define schema for quick registration
const quickRegisterSchema = z.object({
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein"),
  password: z.string().min(6, "Das Passwort muss mindestens 6 Zeichen lang sein"),
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein").optional(),
});

type QuickRegisterValues = z.infer<typeof quickRegisterSchema>;

interface ConversionPromptProps {
  onRegister: () => void;
  onContinueWithoutRegistration: () => void;
  onQuickRegister?: (email: string) => void;
}

const ConversionPrompt: React.FC<ConversionPromptProps> = ({ 
  onRegister, 
  onContinueWithoutRegistration,
  onQuickRegister
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<QuickRegisterValues>({
    resolver: zodResolver(quickRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const handleQuickRegister = async (data: QuickRegisterValues) => {
    if (!isSupabaseConfigured()) {
      toast.error('Supabase-Konfiguration fehlt. Bitte verwenden Sie gültige Anmeldedaten.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name || "",
          },
        },
      });

      if (error) {
        throw error;
      }

      // Check if we have a session - user is authenticated
      if (authData.session) {
        toast.success('Registrierung erfolgreich!');
        navigate('/free-care-plan');
      } else {
        // If confirmation is required
        toast.success('Registrierung erfolgreich! Bitte überprüfe deine E-Mails für den Bestätigungslink.');
        navigate('/auth?tab=login');
      }
    } catch (error: any) {
      toast.error('Fehler bei der Registrierung: ' + (error.message || 'Unbekannter Fehler'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-green-200 shadow-lg">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl text-green-800">
          Dein Plan ist bereit!
        </CardTitle>
        <CardDescription>
          3 personalisierte Aufgaben für die nächsten 7 Tage
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="mb-6">
          <Alert className="bg-green-50 border-green-200 mb-4">
            <Info className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Erster Blick auf deinen Plan</AlertTitle>
            <AlertDescription className="text-green-700">
              Deine erste Aufgabe: Rasen auf optimale Höhe mähen (3-4cm)
            </AlertDescription>
          </Alert>
          
          <div className="text-center px-4 py-6 border border-gray-200 rounded-lg bg-gray-50 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-green-800">
              Speichere deinen Pflegeplan – kostenlos & individuell erweiterbar
            </h3>
            
            <div className="space-y-3 text-left max-w-md mx-auto mb-6">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Zugriff auf deinen vollständigen Plan</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Wetter-Updates & Erinnerungen</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>KI-Chat & Fortschrittsverlauf</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Später kostenlos erweitern möglich</span>
              </div>
            </div>
            
            {/* Quick registration form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleQuickRegister)} className="space-y-4 max-w-md mx-auto mb-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <UserRoundPlus className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <Input placeholder="Dein Name" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <Input 
                            placeholder="deine@email.de"
                            type="email"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <Input 
                            placeholder="Passwort (mind. 6 Zeichen)"
                            type="password"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit"
                  className="w-full py-2 text-base bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  Account erstellen
                </Button>
              </form>
            </Form>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                className="py-6 text-lg bg-green-600 hover:bg-green-700" 
                onClick={onRegister}
              >
                Vollständig registrieren
              </Button>
              <Button 
                variant="outline"
                className="border-green-200"
                onClick={onContinueWithoutRegistration}
              >
                Ohne Registrierung fortfahren
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-100 rounded-lg bg-white shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <h3 className="font-medium">14-Tage Pflegeplan</h3>
            </div>
            <p className="text-sm text-gray-600">
              Tägliche Pflegeaufgaben für gesundes Rasenwachstum
            </p>
          </div>
          
          <div className="p-4 border border-gray-100 rounded-lg bg-white shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <h3 className="font-medium">KI-Chat Assistent</h3>
            </div>
            <p className="text-sm text-gray-600">
              Beantwortet deine Fragen zur Rasenpflege
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversionPrompt;
