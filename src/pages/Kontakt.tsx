import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, MapPin, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MainNavigation from '@/components/MainNavigation';

const Kontakt = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Nachricht gesendet!",
      description: "Vielen Dank für Ihre Nachricht. Wir melden uns bald bei Ihnen.",
    });

    setFormData({
      name: '',
      email: '',
      message: ''
    });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-dm-serif text-foreground mb-4">
              Kontaktieren Sie uns
            </h1>
            <p className="text-xl text-muted-foreground font-poppins max-w-2xl mx-auto">
              Haben Sie Fragen zu Ihrer Rasenpflege oder unserem Service? Wir helfen Ihnen gerne weiter!
            </p>
          </div>

          <Card className="border border-border shadow-xl bg-card/50 backdrop-blur">
            <CardContent className="p-8 md:p-10">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Contact Information */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-foreground font-poppins">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      Kontaktinformationen
                    </h2>
                    <div className="space-y-3 text-muted-foreground font-poppins">
                      <p className="text-lg font-semibold text-foreground">Rasenpilot</p>
                      <p>Yannic Desch</p>
                      <p>Am Hocholzergraben 56</p>
                      <p>69190 Walldorf</p>
                      <p className="pt-2">
                        E-Mail: <a href="mailto:info@rasenpilot.com" className="text-primary hover:text-primary/80 font-medium transition-colors">info@rasenpilot.com</a>
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-2xl p-6 border border-primary/10">
                    <h3 className="font-semibold text-foreground mb-3 font-poppins">Schnelle Antwortzeiten</h3>
                    <p className="text-sm text-muted-foreground font-poppins">
                      Wir antworten in der Regel innerhalb von 24 Stunden auf Ihre Anfragen. Bei dringenden Anliegen kontaktieren Sie uns bitte direkt per E-Mail.
                    </p>
                  </div>
                </div>

                {/* Contact Form */}
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-foreground font-poppins">Schreiben Sie uns</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <Label htmlFor="name" className="text-foreground font-poppins font-medium">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-2 border-border focus:border-primary focus:ring-primary"
                        placeholder="Ihr vollständiger Name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-foreground font-poppins font-medium">E-Mail *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-2 border-border focus:border-primary focus:ring-primary"
                        placeholder="ihre.email@beispiel.de"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-foreground font-poppins font-medium">Nachricht *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="mt-2 border-border focus:border-primary focus:ring-primary resize-none"
                        placeholder="Teilen Sie uns Ihr Anliegen mit..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 py-6 text-lg font-poppins font-semibold"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Wird gesendet...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Nachricht absenden
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Kontakt;