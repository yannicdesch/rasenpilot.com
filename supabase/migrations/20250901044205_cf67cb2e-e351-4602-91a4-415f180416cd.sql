-- Add helper functions for communication tracking

-- Function to track communication events
CREATE OR REPLACE FUNCTION public.track_communication_event(
  p_channel TEXT,
  p_event_type TEXT,
  p_message_id TEXT,
  p_user_id UUID DEFAULT NULL,
  p_phone_number TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.communication_events (
    channel, event_type, message_id, user_id, phone_number, metadata
  ) VALUES (
    p_channel, p_event_type, p_message_id, p_user_id, p_phone_number, p_metadata
  );
END;
$$;

-- Function to update communication contact
CREATE OR REPLACE FUNCTION public.update_communication_contact(
  p_user_id UUID,
  p_phone_number TEXT,
  p_country_code TEXT,
  p_whatsapp_opt_in BOOLEAN,
  p_sms_opt_in BOOLEAN
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.communication_contacts (
    user_id, phone_number, country_code, whatsapp_opt_in, sms_opt_in
  ) VALUES (
    p_user_id, p_phone_number, p_country_code, p_whatsapp_opt_in, p_sms_opt_in
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    phone_number = EXCLUDED.phone_number,
    country_code = EXCLUDED.country_code,
    whatsapp_opt_in = EXCLUDED.whatsapp_opt_in,
    sms_opt_in = EXCLUDED.sms_opt_in,
    updated_at = now();
END;
$$;

-- Function to get communication analytics
CREATE OR REPLACE FUNCTION public.get_communication_analytics(p_timeframe TEXT DEFAULT 'week')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  days_back INTEGER;
  start_date TIMESTAMP WITH TIME ZONE;
  sms_stats RECORD;
  whatsapp_stats RECORD;
  result JSONB;
BEGIN
  -- Calculate date range
  days_back := CASE 
    WHEN p_timeframe = 'day' THEN 1
    WHEN p_timeframe = 'week' THEN 7
    WHEN p_timeframe = 'month' THEN 30
    ELSE 7
  END;
  
  start_date := now() - (days_back || ' days')::interval;
  
  -- Get SMS statistics
  SELECT 
    COUNT(*) FILTER (WHERE event_type = 'sent') as sent,
    COUNT(*) FILTER (WHERE event_type = 'delivered') as delivered,
    COUNT(*) FILTER (WHERE event_type = 'read') as read,
    COUNT(*) FILTER (WHERE event_type = 'clicked') as clicked,
    COUNT(*) FILTER (WHERE event_type = 'replied') as replied,
    COUNT(*) FILTER (WHERE event_type = 'failed') as failed
  INTO sms_stats
  FROM public.communication_events 
  WHERE channel = 'sms' AND timestamp >= start_date;
  
  -- Get WhatsApp statistics  
  SELECT 
    COUNT(*) FILTER (WHERE event_type = 'sent') as sent,
    COUNT(*) FILTER (WHERE event_type = 'delivered') as delivered,
    COUNT(*) FILTER (WHERE event_type = 'read') as read,
    COUNT(*) FILTER (WHERE event_type = 'clicked') as clicked,
    COUNT(*) FILTER (WHERE event_type = 'replied') as replied,
    COUNT(*) FILTER (WHERE event_type = 'failed') as failed
  INTO whatsapp_stats
  FROM public.communication_events 
  WHERE channel = 'whatsapp' AND timestamp >= start_date;
  
  -- Build result JSON
  result := jsonb_build_object(
    'sms', jsonb_build_object(
      'sent', COALESCE(sms_stats.sent, 0),
      'delivered', COALESCE(sms_stats.delivered, 0),
      'read', COALESCE(sms_stats.read, 0),
      'clicked', COALESCE(sms_stats.clicked, 0),
      'replied', COALESCE(sms_stats.replied, 0),
      'failed', COALESCE(sms_stats.failed, 0),
      'deliveryRate', CASE WHEN COALESCE(sms_stats.sent, 0) > 0 
        THEN (COALESCE(sms_stats.delivered, 0)::FLOAT / sms_stats.sent * 100)::INTEGER 
        ELSE 0 END,
      'readRate', CASE WHEN COALESCE(sms_stats.delivered, 0) > 0 
        THEN (COALESCE(sms_stats.read, 0)::FLOAT / sms_stats.delivered * 100)::INTEGER 
        ELSE 0 END
    ),
    'whatsapp', jsonb_build_object(
      'sent', COALESCE(whatsapp_stats.sent, 0),
      'delivered', COALESCE(whatsapp_stats.delivered, 0),
      'read', COALESCE(whatsapp_stats.read, 0),
      'clicked', COALESCE(whatsapp_stats.clicked, 0),
      'replied', COALESCE(whatsapp_stats.replied, 0),
      'failed', COALESCE(whatsapp_stats.failed, 0),
      'deliveryRate', CASE WHEN COALESCE(whatsapp_stats.sent, 0) > 0 
        THEN (COALESCE(whatsapp_stats.delivered, 0)::FLOAT / whatsapp_stats.sent * 100)::INTEGER 
        ELSE 0 END,
      'readRate', CASE WHEN COALESCE(whatsapp_stats.delivered, 0) > 0 
        THEN (COALESCE(whatsapp_stats.read, 0)::FLOAT / whatsapp_stats.delivered * 100)::INTEGER 
        ELSE 0 END
    ),
    'combined', jsonb_build_object(
      'totalSent', COALESCE(sms_stats.sent, 0) + COALESCE(whatsapp_stats.sent, 0),
      'totalDelivered', COALESCE(sms_stats.delivered, 0) + COALESCE(whatsapp_stats.delivered, 0),
      'totalRead', COALESCE(sms_stats.read, 0) + COALESCE(whatsapp_stats.read, 0),
      'totalClicked', COALESCE(sms_stats.clicked, 0) + COALESCE(whatsapp_stats.clicked, 0),
      'totalReplied', COALESCE(sms_stats.replied, 0) + COALESCE(whatsapp_stats.replied, 0)
    )
  );
  
  RETURN result;
END;
$$;