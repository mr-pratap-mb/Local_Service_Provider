-- Enable uuid generator
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id INT NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3) Trigger function to auto-insert notification when a booking is made
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_on_booking ON public.bookings;
CREATE TRIGGER trg_notify_on_booking
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE PROCEDURE public.notify_on_booking();

-- 4) Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 5) RLS policies for bookings
DROP POLICY IF EXISTS insert_bookings ON public.bookings;
CREATE POLICY insert_bookings
ON public.bookings
FOR INSERT
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS select_own_bookings ON public.bookings;
CREATE POLICY select_own_bookings
ON public.bookings
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = provider_id);

DROP POLICY IF EXISTS update_status ON public.bookings;
CREATE POLICY update_status
ON public.bookings
FOR UPDATE
USING (auth.uid() = provider_id OR auth.uid() = user_id);

-- 6) RLS policies for notifications
DROP POLICY IF EXISTS select_notifications ON public.notifications;
CREATE POLICY select_notifications
ON public.notifications
FOR SELECT
USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS insert_notifications ON public.notifications;
CREATE POLICY insert_notifications
ON public.notifications
FOR INSERT
WITH CHECK (
  -- Allow trigger inserts (auth.uid() will be null)
  auth.role() = 'service_role' OR
  -- Allow users to send notifications
  auth.uid() = sender_id
);

DROP POLICY IF EXISTS update_read_status ON public.notifications;
CREATE POLICY update_read_status
ON public.notifications
FOR UPDATE
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);

-- 7) Create publication safely
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime FOR TABLE public.bookings, public.notifications;
  END IF;
END
$$;
