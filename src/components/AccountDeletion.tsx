
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AccountDeletion: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmation !== 'LÖSCHEN') {
      toast.error('Bitte geben Sie "LÖSCHEN" ein, um fortzufahren');
      return;
    }

    setIsDeleting(true);
    try {
      // First delete user data from tables
      // This would depend on your data structure
      // For example: await supabase.from('profiles').delete().eq('user_id', user.id);
      
      // Then delete the user's account
      const { error } = await supabase.auth.admin.deleteUser(
        (await supabase.auth.getUser()).data.user?.id || ''
      );
      
      if (error) throw error;
      
      await supabase.auth.signOut();
      toast.success('Ihr Account wurde erfolgreich gelöscht');
      navigate('/auth');
    } catch (error: any) {
      toast.error(`Fehler beim Löschen des Accounts: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full flex items-center gap-2">
          <Trash2 size={16} />
          Account löschen
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Account löschen</DialogTitle>
          <DialogDescription>
            Diese Aktion kann nicht rückgängig gemacht werden. Dadurch werden Ihr Account und alle zugehörigen Daten dauerhaft gelöscht.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Label htmlFor="confirmation" className="text-red-500 font-semibold">
            Geben Sie "LÖSCHEN" ein, um zu bestätigen
          </Label>
          <Input
            id="confirmation"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="mt-2"
            placeholder="LÖSCHEN"
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
            Abbrechen
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={confirmation !== 'LÖSCHEN' || isDeleting}
          >
            {isDeleting ? 'Wird gelöscht...' : 'Account löschen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AccountDeletion;
