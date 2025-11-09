-- Update bookings table to ensure status check constraint matches application values
ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE public.bookings
ADD CONSTRAINT bookings_status_check
CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled'));
