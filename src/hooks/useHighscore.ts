
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useHighscore = () => {
  const updateUserHighscore = async (
    userId: string,
    userName: string,
    lawnScore: number,
    lawnImageUrl?: string | null,
    location?: string | null,
    grassType?: string | null,
    lawnSize?: string | null,
    email?: string | null
  ) => {
    try {
      console.log('Updating highscore for user:', userName, 'with score:', lawnScore);
      console.log('Full parameters:', {
        p_user_id: userId,
        p_user_name: userName,
        p_lawn_score: lawnScore,
        p_lawn_image_url: lawnImageUrl,
        p_location: location,
        p_grass_type: grassType,
        p_lawn_size: lawnSize,
        p_email: email
      });
      
      const { data, error } = await supabase.rpc('update_user_highscore', {
        p_user_id: userId,
        p_user_name: userName,
        p_lawn_score: lawnScore,
        p_lawn_image_url: lawnImageUrl,
        p_location: location,
        p_grass_type: grassType,
        p_lawn_size: lawnSize,
        p_email: email
      });

      console.log('Database response:', { data, error });

      if (error) {
        console.error('Error updating highscore:', error);
        toast.error('Fehler beim Aktualisieren der Bestenliste');
      } else {
        console.log('Highscore updated successfully');
        if (lawnScore >= 80) {
          toast.success(`Glückwunsch! Dein Score von ${lawnScore}/100 könnte es in die Bestenliste schaffen! 🏆`);
        }
      }
    } catch (error) {
      console.error('Error updating highscore:', error);
      toast.error('Fehler beim Aktualisieren der Bestenliste');
    }
  };

  return { updateUserHighscore };
};
