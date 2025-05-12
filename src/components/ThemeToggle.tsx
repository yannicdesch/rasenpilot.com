
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Moon, Sun } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ThemeToggle = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    const fetchThemePreference = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.theme) {
        setTheme(user.user_metadata.theme);
        applyTheme(user.user_metadata.theme);
      } else {
        // Check system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setTheme('dark');
          applyTheme('dark');
        }
      }
    };
    
    fetchThemePreference();
  }, []);
  
  const applyTheme = (theme: 'light' | 'dark') => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { theme: newTheme }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast.error(`Fehler beim Speichern der Theme-Einstellung: ${error.message}`);
    }
  };
  
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Dunkles Design aktivieren' : 'Helles Design aktivieren'}
    >
      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
    </Button>
  );
};

export default ThemeToggle;
