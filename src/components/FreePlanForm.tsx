
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Constants for form options
const grassTypes = [
  { value: 'bermuda', label: 'Bermuda' },
  { value: 'fescue', label: 'Fescue / Schwingel' },
  { value: 'kentucky', label: 'Kentucky Bluegrass / Wiesenrispe' },
  { value: 'zoysia', label: 'Zoysia' },
  { value: 'st-augustine', label: 'St. Augustine' },
  { value: 'other', label: 'Ich weiß es nicht' }
];

const lawnGoals = [
  { value: 'repair', label: 'Rasen reparieren' },
  { value: 'appearance', label: 'Aussehen verbessern' },
  { value: 'child-safe', label: 'Kinderfreundlicher Rasen' },
  { value: 'luxury', label: 'Luxuriöser Rasen' },
  { value: 'eco', label: 'Umweltfreundliche Pflege' },
  { value: 'low-maintenance', label: 'Weniger Pflegeaufwand' }
];

interface FreePlanFormProps {
  onFormSubmit: (data: any) => void;
}

const FreePlanForm: React.FC<FreePlanFormProps> = ({ onFormSubmit }) => {
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
      title: "Dein 14-Tage-Plan ist bereit!",
      description: "Tägliche Aufgaben für die nächsten 2 Wochen..."
    });
    
    onFormSubmit(data);
  };

  return (
    <Card className="border-green-200 shadow-lg">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl text-green-800">Rasen-Check starten</CardTitle>
        <CardDescription>
          Beantworte diese kurzen Fragen für deinen personalisierten 14-Tage-Plan
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
                    <FormLabel>Ungefähre Rasenfläche (m²)</FormLabel>
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
                  <FormLabel>Rasentyp (optional)</FormLabel>
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
                    Keine Sorge, wenn du es nicht weißt - unsere KI kann es auch anhand eines Fotos erkennen
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
                Meinen kostenlosen 14-Tage-Plan erstellen <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FreePlanForm;
