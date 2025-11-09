-- Add new optional fields to bookings table
ALTER TABLE public.bookings
ADD COLUMN detailedAddress TEXT,
ADD COLUMN anyMessage TEXT;
