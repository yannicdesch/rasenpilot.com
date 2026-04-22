DROP FUNCTION IF EXISTS public.increment_sms_count(uuid, text);
DROP FUNCTION IF EXISTS public.increment_whatsapp_count(uuid, text);
DROP FUNCTION IF EXISTS public.track_communication_event(text, text, text, uuid, text, jsonb);
DROP FUNCTION IF EXISTS public.update_communication_contact(uuid, text, text, boolean, boolean);
DROP FUNCTION IF EXISTS public.get_communication_analytics(text);
DROP TABLE IF EXISTS public.communication_events CASCADE;
DROP TABLE IF EXISTS public.communication_contacts CASCADE;