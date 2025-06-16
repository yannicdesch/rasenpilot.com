
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, UserRound } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein').optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: {
    name?: string;
    email: string;
  };
  onSubmit: (values: ProfileFormValues) => Promise<boolean>;
  loading: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user, onSubmit, loading }) => {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
    }
  });

  // Update form when user data changes
  React.useEffect(() => {
    console.log('ProfileForm: User data changed, updating form:', user);
    form.reset({
      name: user.name || '',
      email: user.email || '',
    });
  }, [user, form]);

  const handleSubmit = async (values: ProfileFormValues) => {
    console.log('ProfileForm: Submitting values:', values);
    const success = await onSubmit(values);
    if (success) {
      console.log('ProfileForm: Update successful, resetting form');
      form.reset(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <UserRound className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Dein Name" 
                    className="pl-10 bg-white border-gray-300 text-gray-800" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">E-Mail</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="deine@email.de" 
                    className="pl-10 bg-gray-100 border-gray-300 text-gray-600" 
                    disabled 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full bg-green-600 hover:bg-green-700" 
          disabled={loading}
        >
          {loading ? 'Wird gespeichert...' : 'Speichern'}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
