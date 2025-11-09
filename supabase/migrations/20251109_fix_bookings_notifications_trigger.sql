-- Fix for the notify_on_booking trigger to remove role setting which causes errors
CREATE OR REPLACE FUNCTION public.notify_on_booking() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (recipient_id, sender_id, type, payload)
  VALUES (
    NEW.provider_id,
    NEW.user_id,
    'booking_request',
    jsonb_build_object(
      'booking_id', NEW.id,
      'service_id', NEW.service_id,
      'scheduled_date', NEW.scheduled_date
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also create a function and trigger for booking status updates to notify users
CREATE OR REPLACE FUNCTION public.notify_booking_status_update() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status <> OLD.status THEN
    INSERT INTO public.notifications (recipient_id, sender_id, type, payload, read)
    VALUES (
      NEW.user_id,
      NEW.provider_id,
      'booking_update',
      jsonb_build_object(
        'booking_id', NEW.id,
        'service_id', NEW.service_id,
        'status', NEW.status
      ),
      FALSE
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_booking_status_update ON public.bookings;
CREATE TRIGGER trg_notify_booking_status_update
AFTER UPDATE ON public.bookings
FOR EACH ROW
EXECUTE PROCEDURE public.notify_booking_status_update();

-- Update RLS policy for notifications insert to allow trigger operations
DROP POLICY IF EXISTS insert_notifications ON public.notifications;
CREATE POLICY insert_notifications
ON public.notifications
FOR INSERT
WITH CHECK (TRUE);
