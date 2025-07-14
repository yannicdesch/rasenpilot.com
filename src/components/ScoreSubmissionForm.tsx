import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Trophy, Mail, User, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScoreSubmissionFormProps {
  score: number;
  onSubmitSuccess: () => void;
}

const ScoreSubmissionForm: React.FC<ScoreSubmissionFormProps> = ({ score, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    zipcode: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nickname || !formData.email || !formData.zipcode) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie alle Felder aus.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Here we would normally submit to the database
      // For now, we'll simulate the submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onSubmitSuccess();
      setFormData({ nickname: '', email: '', zipcode: '' });
    } catch (error) {
      toast({
        title: "Fehler beim Einreichen",
        description: "Leider konnte Ihr Score nicht eingereicht werden. Versuchen Sie es später erneut.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
      <CardContent className="p-4 md:p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500 text-white rounded-full mb-3">
            <Trophy className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Fantastischer Score: {score}/100!
          </h3>
          <p className="text-gray-600 text-sm md:text-base">
            Teile deinen Erfolg mit anderen Rasen-Enthusiasten und trage dich in unsere Bestenliste ein!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nickname" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nickname *
              </Label>
              <Input
                id="nickname"
                name="nickname"
                type="text"
                value={formData.nickname}
                onChange={handleInputChange}
                placeholder="z.B. RasenProfi2024"
                className="mt-1"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="zipcode" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Postleitzahl *
              </Label>
              <Input
                id="zipcode"
                name="zipcode"
                type="text"
                value={formData.zipcode}
                onChange={handleInputChange}
                placeholder="z.B. 12345"
                maxLength={5}
                className="mt-1"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              E-Mail Adresse *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="ihre@email.de"
              className="mt-1"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Ihre E-Mail wird nicht öffentlich angezeigt und nur für Benachrichtigungen verwendet.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Score wird eingereicht...
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-4 w-4" />
                Zur Bestenliste hinzufügen
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ScoreSubmissionForm;