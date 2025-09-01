-- Create communication tracking tables

-- Table for communication events (SMS, WhatsApp, Email tracking)
CREATE TABLE public.communication_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'whatsapp', 'email')),
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'read', 'clicked', 'replied', 'failed')),
  message_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT,
  email TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for communication contacts and preferences
CREATE TABLE public.communication_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  phone_number TEXT,
  country_code TEXT DEFAULT '+49',
  email TEXT,
  whatsapp_opt_in BOOLEAN DEFAULT false,
  sms_opt_in BOOLEAN DEFAULT false,
  email_opt_in BOOLEAN DEFAULT true,
  last_sms_date TIMESTAMP WITH TIME ZONE,
  last_whatsapp_date TIMESTAMP WITH TIME ZONE,
  last_email_date TIMESTAMP WITH TIME ZONE,
  total_sms_count INTEGER DEFAULT 0,
  total_whatsapp_count INTEGER DEFAULT 0,
  total_email_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.communication_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for communication_events
CREATE POLICY "Users can view their own communication events" 
ON public.communication_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all communication events" 
ON public.communication_events 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- Create policies for communication_contacts
CREATE POLICY "Users can view their own communication contact" 
ON public.communication_contacts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own communication contact" 
ON public.communication_contacts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own communication contact" 
ON public.communication_contacts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all communication contacts" 
ON public.communication_contacts 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes for better performance
CREATE INDEX idx_communication_events_user_id ON public.communication_events(user_id);
CREATE INDEX idx_communication_events_channel ON public.communication_events(channel);
CREATE INDEX idx_communication_events_message_id ON public.communication_events(message_id);
CREATE INDEX idx_communication_events_timestamp ON public.communication_events(timestamp);
CREATE INDEX idx_communication_contacts_user_id ON public.communication_contacts(user_id);
CREATE INDEX idx_communication_contacts_phone ON public.communication_contacts(phone_number);

-- Function to increment SMS count
CREATE OR REPLACE FUNCTION public.increment_sms_count(user_id_param UUID, phone_number_param TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.communication_contacts (user_id, phone_number, total_sms_count, last_sms_date)
  VALUES (user_id_param, phone_number_param, 1, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_sms_count = communication_contacts.total_sms_count + 1,
    last_sms_date = now(),
    phone_number = COALESCE(communication_contacts.phone_number, phone_number_param);
END;
$$;

-- Function to increment WhatsApp count
CREATE OR REPLACE FUNCTION public.increment_whatsapp_count(user_id_param UUID, phone_number_param TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.communication_contacts (user_id, phone_number, total_whatsapp_count, last_whatsapp_date)
  VALUES (user_id_param, phone_number_param, 1, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_whatsapp_count = communication_contacts.total_whatsapp_count + 1,
    last_whatsapp_date = now(),
    phone_number = COALESCE(communication_contacts.phone_number, phone_number_param);
END;
$$;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_communication_contact_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_communication_contacts_updated_at
BEFORE UPDATE ON public.communication_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_communication_contact_updated_at();