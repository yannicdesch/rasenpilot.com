
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';
import { Globe } from 'lucide-react';

const languages = [
  { value: 'de', label: 'Deutsch' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' }
];

const LanguageSelector: React.FC = () => {
  const [language, setLanguage] = useState('de');
  
  useEffect(() => {
    const fetchLanguagePreference = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.language) {
        setLanguage(user.user_metadata.language);
      }
    };
    
    fetchLanguagePreference();
  }, []);
  
  const handleLanguageChange = async (value: string) => {
    setLanguage(value);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { language: value }
      });
      
      if (error) throw error;
      
      toast.success('Spracheinstellung gespeichert');
    } catch (error: any) {
      toast.error(`Fehler beim Speichern der Spracheinstellung: ${error.message}`);
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Globe size={16} className="text-muted-foreground" />
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sprache auswählen" />
        </SelectTrigger>
        <SelectContent>
          {languages.map(lang => (
            <SelectItem key={lang.value} value={lang.value}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
