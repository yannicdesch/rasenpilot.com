
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
import { ArrowRight, Check, Leaf, Calendar } from 'lucide-react';
import { useLawn } from '@/context/LawnContext';
import FeatureCallToAction from '@/components/FeatureCallToAction';

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
  { value: 'other', label: 'Andere/Nicht sicher' }
];

const lawnGoals = [
  { value: 'greener', label: 'Grünerer Rasen' },
  { value: 'patches', label: 'Kahle Stellen reparieren' },
  { value: 'weeds', label: 'Unkraut bekämpfen' },
  { value: 'water', label: 'Wasserverbrauch reduzieren' },
  { value: 'maintenance', label: 'Weniger Pflegeaufwand' }
];

const FreePlan = () => {
  const [step, setStep] = useState(1);
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
      title: "Profil erstellt!",
      description: "Ihr kostenloser Rasenpflegeplan wird generiert."
    });
    
    // Speichern Sie das temporäre Profil im Kontext
    setTemporaryProfile(data);
    
    // Weiterleiten zur Pflegeplan-Vorschau-Seite
    navigate('/free-care-plan');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-100 to-green-50 py-12 md:py-16 border-b border-green-200">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-4">Ihr kostenloser 14-Tage-Pflegeplan</h1>
              <p className="text-lg text-gray-700 mb-6">
                Erstellen Sie einen personalisierten Pflegeplan für Ihren Rasen, ohne sich zu registrieren. 
                Für erweiterte Funktionen und dauerhafte Speicherung können Sie später ein Konto erstellen.
              </p>
            </div>
          </div>
        </section>
        
        {/* Form Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <Card className="border-green-200 shadow-lg">
              <CardContent className="pt-6">
                {step === 1 ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-green-600 rounded-full h-10 w-10 flex items-center justify-center text-white font-semibold">1</div>
                      <h3 className="text-lg font-medium">Grundlegende Raseninformationen</h3>
                    </div>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(() => setStep(2))} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="zipCode"
                            rules={{ required: "PLZ wird benötigt" }}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Postleitzahl</FormLabel>
                                <FormControl>
                                  <Input placeholder="Geben Sie Ihre PLZ ein" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Wir verwenden dies für lokales Wetter und Wachstumsbedingungen
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
                                    <SelectValue placeholder="Wählen Sie Ihren Rasentyp" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {grassTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Nicht sicher? Wählen Sie "Andere/Nicht sicher"
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-4 flex justify-end">
                          <Button type="submit" className="garden-button bg-green-600 hover:bg-green-700">
                            Weiter <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-green-600 rounded-full h-10 w-10 flex items-center justify-center text-white font-semibold">2</div>
                      <h3 className="text-lg font-medium">Ihre Rasenpflegeziele</h3>
                    </div>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="lawnGoal"
                          rules={{ required: "Ziel wird benötigt" }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hauptziel</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Was ist Ihr Hauptziel für Ihren Rasen?" />
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
                        
                        <div className="pt-6 flex justify-between items-center">
                          <Button type="button" variant="outline" className="border-green-200" onClick={() => setStep(1)}>
                            Zurück
                          </Button>
                          <Button type="submit" className="garden-button bg-green-600 hover:bg-green-700">
                            Meinen kostenlosen Pflegeplan generieren <Calendar className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="mt-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-green-800 mb-2">Mit dem Premium-Konto erhalten Sie noch mehr</h2>
                <p className="text-gray-600">Registrieren Sie sich, um auf alle Funktionen zuzugreifen</p>
              </div>
              <FeatureCallToAction />
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
