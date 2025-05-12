
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/use-toast';
import { ArrowRight, Check, Calendar, Info, MessageSquare } from 'lucide-react';
import { useLawn } from '@/context/LawnContext';
import FeatureCallToAction from '@/components/FeatureCallToAction';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const grassTypes = [
  { value: 'bermuda', label: 'Bermuda' },
  { value: 'fescue', label: 'Fescue / Schwingel' },
  { value: 'kentucky', label: 'Kentucky Bluegrass / Wiesenrispe' },
  { value: 'zoysia', label: 'Zoysia' },
  { value: 'st-augustine', label: 'St. Augustine' },
  { value: 'ryegrass', label: 'Ryegrass / Raigras' },
  { value: 'bahia', label: 'Bahia' },
  { value: 'centipede', label: 'Hundertfüßer' },
  { value: 'buffalo', label: 'Buffalo' },
  { value: 'bent', label: 'Bentgrass / Straußgras' },
  { value: 'other', label: 'Ich weiß es nicht' }
];

const lawnGoals = [
  { value: 'greener', label: 'Grünerer Rasen' },
  { value: 'patches', label: 'Kahle Stellen reparieren' },
  { value: 'weeds', label: 'Unkraut bekämpfen' },
  { value: 'water', label: 'Wasserverbrauch reduzieren' },
  { value: 'maintenance', label: 'Weniger Pflegeaufwand' }
];

const FreePlan = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { setTemporaryProfile } = useLawn();
  const navigate = useNavigate();
  
  const form = useForm({
    defaultValues: {
      zipCode: '',
      grassType: '',
      lawnSize: '',
      lawnGoal: '',
    }
  });
  
  const onSubmit = (data: any) => {
    toast({
      title: "Dein Plan ist bereit!",
      description: "3 personalisierte Aufgaben für die nächsten 7 Tage..."
    });
    
    // Save the temporary profile in context
    setTemporaryProfile(data);
    
    // Show registration prompt instead of direct navigation
    setFormSubmitted(true);
    
    // We're not navigating automatically anymore
    // navigate('/free-care-plan');
  };

  // Handle navigation to free care plan when user chooses to continue without registration
  const handleContinueWithoutRegistration = () => {
    navigate('/free-care-plan');
  };

  // Handle navigation to registration page
  const handleRegister = () => {
    navigate('/auth', { state: { redirectTo: '/free-care-plan' } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      
      <main className="flex-grow">
        {/* Hero Section - Updated with new headline */}
        <section className="bg-gradient-to-br from-green-100 to-green-50 py-12 md:py-16 border-b border-green-200">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-4">
                Dein persönlicher Rasenpflege-Plan – in 30 Sekunden, kostenlos
              </h1>
              <p className="text-lg text-gray-700 mb-6">
                Basierend auf deinem Standort, Rasentyp & Ziel. Sofort starten – ohne Anmeldung.
              </p>
            </div>
          </div>
        </section>
        
        {/* Form Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            {!formSubmitted ? (
              // Step 1: Show the form for gathering lawn data
              <Card className="border-green-200 shadow-lg">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl text-green-800">Rasen-Check starten</CardTitle>
                  <CardDescription>
                    Beantworte diese 4 kurzen Fragen für deinen personalisierten Plan
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="zipCode"
                          rules={{ required: "PLZ wird benötigt" }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postleitzahl</FormLabel>
                              <FormControl>
                                <Input placeholder="Deine PLZ" {...field} />
                              </FormControl>
                              <FormDescription>
                                Für lokale Wetterbedingungen
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="lawnSize"
                          rules={{ required: "Rasengröße wird benötigt" }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ungefähre Rasengröße (m²)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="z.B. 500" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="grassType"
                        rules={{ required: "Rasentyp wird benötigt" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rasentyp</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Wähle deinen Rasentyp" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {grassTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Keine Sorge, wenn du es nicht weißt - wähle "Ich weiß es nicht"
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lawnGoal"
                        rules={{ required: "Ziel wird benötigt" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Was ist dein Hauptziel?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Wähle dein wichtigstes Ziel" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {lawnGoals.map((goal) => (
                                  <SelectItem key={goal.value} value={goal.value}>{goal.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4 flex justify-center">
                        <Button 
                          type="submit" 
                          className="w-full md:w-2/3 py-6 text-lg garden-button bg-green-600 hover:bg-green-700"
                        >
                          Meinen kostenlosen Pflegeplan generieren <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            ) : (
              // Step 2: Show the soft-gate conversion point after form submission
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
                      
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button 
                          className="py-6 text-lg bg-green-600 hover:bg-green-700" 
                          onClick={handleRegister}
                        >
                          Jetzt kostenlos registrieren
                        </Button>
                        <Button 
                          variant="outline"
                          className="border-green-200"
                          onClick={handleContinueWithoutRegistration}
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
            )}
            
            <div className="mt-8">
              {!formSubmitted && (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-green-800 mb-2">Mit dem Premium-Konto erhältst du noch mehr</h2>
                    <p className="text-gray-600">Registriere dich, um auf alle Funktionen zuzugreifen</p>
                  </div>
                  <FeatureCallToAction />
                </>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-white py-6 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
};

export default FreePlan;
