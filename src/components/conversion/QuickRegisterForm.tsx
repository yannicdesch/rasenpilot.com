
import React, { useState } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, UserRoundPlus } from 'lucide-react';
import { trackRegistrationStep } from '@/lib/analytics';

// Define schema for quick registration
const quickRegisterSchema = z.object({
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein"),
  password: z.string().min(6, "Das Passwort muss mindestens 6 Zeichen lang sein"),
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein").optional(),
});

type QuickRegisterValues = z.infer<typeof quickRegisterSchema>;

interface QuickRegisterFormProps {
  onSubmit: (data: QuickRegisterValues) => Promise<void>;
  isSubmitting: boolean;
}

const QuickRegisterForm: React.FC<QuickRegisterFormProps> = ({ onSubmit, isSubmitting }) => {
  const form = useForm<QuickRegisterValues>({
    resolver: zodResolver(quickRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const handleSubmit = (data: QuickRegisterValues) => {
    trackRegistrationStep('quick_register_attempt');
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 max-w-md mx-auto mb-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <UserRoundPlus className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input placeholder="Dein Name" className="pl-10" {...field} />
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
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="deine@email.de"
                    type="email"
                    className="pl-10"
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Passwort (mind. 6 Zeichen)"
                    type="password"
                    className="pl-10"
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
          className="w-full py-2 text-base bg-green-600 hover:bg-green-700"
          disabled={isSubmitting}
        >
          Account erstellen
        </Button>
      </form>
    </Form>
  );
};

export default QuickRegisterForm;
