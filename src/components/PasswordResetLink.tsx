
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';

const resetSchema = z.object({
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein'),
});

type ResetFormValues = z.infer<typeof resetSchema>;

const PasswordResetLink: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ResetFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: window.location.origin + '/auth',
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast.success('Wenn ein Konto mit dieser E-Mail existiert, erhalten Sie einen Link zum Zurücksetzen Ihres Passworts.');
    } catch (error: any) {
      toast.error('Fehler beim Senden des Passwort-Reset-Links: ' + (error.message || 'Unbekannter Fehler'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Passwort zurücksetzen</CardTitle>
        <CardDescription>
          Geben Sie Ihre E-Mail-Adresse ein, um einen Link zum Zurücksetzen Ihres Passworts zu erhalten.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <div className="text-center p-4">
            <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4">
              <p>Wenn ein Konto mit dieser E-Mail existiert, haben wir einen Link zum Zurücksetzen Ihres Passworts gesendet.</p>
              <p className="mt-2">Bitte überprüfen Sie Ihren Posteingang (und gegebenenfalls Ihren Spam-Ordner).</p>
            </div>
            <Button 
              onClick={() => setIsSuccess(false)} 
              variant="outline" 
              className="mt-2"
            >
              Zurück
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-Mail</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="deine@email.de" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <CardFooter className="px-0 pt-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Wird verarbeitet...' : 'Link zum Zurücksetzen senden'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default PasswordResetLink;
