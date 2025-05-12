
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
import { ArrowRight, Check, Leaf, Cloud, MessageSquare, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLawn } from '@/context/LawnContext';

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

const features = [
  {
    title: 'KI-gestützte Pflegepläne',
    description: 'Erhalten Sie einen personalisierten 2-Wochen-Pflegeplan basierend auf Ihrer Rasenart, Standort und Zielen',
    icon: <Leaf className="h-12 w-12 text-green-600"/>
  },
  {
    title: 'Wetterbasierte Empfehlungen',
    description: 'Erhalten Sie intelligente Bewässerungsvorschläge basierend auf lokalen Wettervorhersagen',
    icon: <Cloud className="h-12 w-12 text-blue-500"/>
  },
  {
    title: 'Rasenpilot KI-Assistent',
    description: 'Stellen Sie Fragen und erhalten Sie jederzeit fachkundige Rasenpflege-Beratung',
    icon: <MessageSquare className="h-12 w-12 text-green-700"/>
  }
];

const Index = () => {
  const [step, setStep] = useState(1);
  const { setProfile } = useLawn();
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
      description: "Ihr Rasenpflegeplan wird generiert."
    });
    
    // Save the lawn profile in context
    setProfile(data);
    
    // Redirect to care plan page
    navigate('/care-plan');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-100 to-green-50 py-16 md:py-24 border-b border-green-200">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-1/2">
                <div className="inline-block bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full text-green-800 font-medium text-sm mb-4 shadow-sm">
                  <Sprout className="inline-block mr-1 h-4 w-4" /> Ihr persönlicher Rasenberater
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-800 mb-6 text-shadow">
                  Ihr KI-gestützter<br/> Rasenpflege-Assistent
                </h1>
                <p className="text-lg text-gray-700 mb-8 bg-white/50 backdrop-blur-sm p-4 rounded-lg shadow-sm">
                  Erhalten Sie personalisierte Rasenpflegepläne, Expertenberatung und wetterkluge Empfehlungen für den perfekten Rasen mit minimalem Aufwand.
                </p>
                <Button
                  className="garden-button px-8 py-6 text-lg rounded-full bg-green-600 hover:bg-green-700"
                  size="lg"
                  onClick={() => document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Jetzt starten <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <div className="md:w-1/2 mt-8 md:mt-0">
                <div className="relative">
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-400/20 rounded-full z-0"></div>
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-green-400/20 rounded-full z-0"></div>
                  <img
                    src="https://images.unsplash.com/photo-1605296867304-46d5465a13f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGxhd24lMjBjYXJlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60"
                    alt="Perfekter grüner Rasen"
                    className="rounded-2xl shadow-xl w-full h-auto object-cover border-4 border-white relative z-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 leaf-pattern">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4 text-green-800">Wie Rasenpilot funktioniert</h2>
            <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">Unser intelligenter Assistent hilft Ihnen bei jedem Schritt Ihrer Rasenpflege</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border-green-100 hover-grow bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <div className="mb-4 bg-green-50 p-4 rounded-full inline-block">{feature.icon}</div>
                    <CardTitle className="text-xl text-green-800">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Get Started Form */}
        <section id="get-started" className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-2 text-green-800">Erstellen Sie Ihr Rasenprofil</h2>
            <p className="text-center text-gray-600 mb-8">Wir verwenden diese Informationen, um Ihren personalisierten Pflegeplan zu erstellen</p>
            
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
                                Nicht sicher? Wählen Sie "Andere/Nicht sicher" und unsere KI kann Ihnen helfen, ihn zu identifizieren
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
                        
                        <div className="pt-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Laden Sie ein Foto Ihres Rasens hoch (optional)</label>
                          <div className="border-2 border-dashed border-green-300 bg-green-50 rounded-md p-8 text-center">
                            <input type="file" className="hidden" id="lawn-photo" accept="image/*" />
                            <label htmlFor="lawn-photo" className="cursor-pointer">
                              <div className="space-y-2 text-gray-600">
                                <Sprout className="h-12 w-12 mx-auto text-green-500 mb-2" />
                                <p className="text-sm">Ziehen Sie ein Bild hierher oder klicken Sie zum Durchsuchen</p>
                                <p className="text-xs">JPG, PNG oder GIF bis zu 10MB</p>
                              </div>
                            </label>
                          </div>
                        </div>
                        
                        <div className="pt-6 flex justify-between items-center">
                          <Button type="button" variant="outline" className="border-green-200" onClick={() => setStep(1)}>
                            Zurück
                          </Button>
                          <Button type="submit" className="garden-button bg-green-600 hover:bg-green-700">
                            Meinen Pflegeplan generieren <Sprout className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="py-16 bg-green-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4 text-green-800">Was unsere Benutzer sagen</h2>
            <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">Entdecken Sie, wie Rasenpilot anderen Gartenbesitzern geholfen hat</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white border-green-100 hover-grow">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4">
                      {i === 1 && "Rasenpilot hat die Art und Weise, wie ich mich um meinen Rasen kümmere, komplett verändert. Der personalisierte Plan ist so einfach zu befolgen, und mein Rasen sieht besser aus als je zuvor!"}
                      {i === 2 && "Die Möglichkeit, jederzeit mit dem KI-Assistenten zu chatten, wenn ich Fragen habe, war unglaublich hilfreich. Es ist, als hätte man rund um die Uhr einen Rasenexperten zur Hand."}
                      {i === 3 && "Die wetterbasierte Empfehlungen haben mir so viel Zeit und Wasser gespart. Ich mache mir keine Sorgen mehr, an Regentagen zu bewässern."}
                    </p>
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                        {i === 1 && "M"}
                        {i === 2 && "S"}
                        {i === 3 && "D"}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {i === 1 && "Michael R."}
                          {i === 2 && "Sarah T."}
                          {i === 3 && "David M."}
                        </p>
                        <p className="text-xs text-gray-500">
                          {i === 1 && "Hausbesitzer, Bayern"}
                          {i === 2 && "Hobby-Gärtnerin, NRW"}
                          {i === 3 && "Rasenliebhaber, Baden-Württemberg"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-green-800 text-white py-8 border-t border-green-700">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Leaf className="h-6 w-6 mr-2" />
            <span className="text-xl font-bold">Rasenpilot</span>
          </div>
          <p className="text-green-100 mb-4">Ihr intelligenter Begleiter für die perfekte Rasenpflege</p>
          <div className="text-sm text-green-200">
            &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
