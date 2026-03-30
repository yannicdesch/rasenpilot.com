
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
  ) => {
    try {
      console.log('Updating highscore for user:', userName, 'with score:', lawnScore);

      const { data, error } = await supabase.rpc('update_user_highscore', {
        p_user_id: userId,
        p_user_name: userName,
        p_lawn_score: lawnScore,
        p_lawn_image_url: lawnImageUrl,
        p_location: location,
        p_grass_type: grassType,
        p_lawn_size: lawnSize,
      });

      if (error) {
        console.error('Error updating highscore:', error);
        toast.error('Fehler beim Aktualisieren der Bestenliste');
      } else {
        console.log('Highscore updated successfully');
        
        const { data: currentScore } = await supabase
          .from('lawn_highscores')
          .select('lawn_score')
          .eq('user_id', userId)
          .single();
        
        if (currentScore && currentScore.lawn_score === lawnScore) {
          toast.success(`Glückwunsch! Neuer Bestwert: ${lawnScore}/100 🏆`);
        } else if (currentScore && currentScore.lawn_score > lawnScore) {
          toast.error(`Score ${lawnScore}/100 ist niedriger als dein Bestwert (${currentScore.lawn_score}/100). Nur bessere Scores werden gespeichert.`);
        } else if (lawnScore >= 80) {
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
