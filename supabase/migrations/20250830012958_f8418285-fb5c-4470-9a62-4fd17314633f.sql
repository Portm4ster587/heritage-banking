-- Fix search path security issue by adding SET search_path = public
CREATE OR REPLACE FUNCTION create_admin_notification(
  notification_type TEXT,
  notification_title TEXT,
  notification_message TEXT,
  ref_user_id UUID DEFAULT NULL,
  reference_id UUID DEFAULT NULL,
  notification_priority TEXT DEFAULT 'normal'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, user_id, reference_id, priority)
  VALUES (notification_type, notification_title, notification_message, ref_user_id, reference_id, notification_priority)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;