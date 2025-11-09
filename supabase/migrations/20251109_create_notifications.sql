-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  service_id UUID REFERENCES services(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert notifications for themselves" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger for booking notifications
CREATE OR REPLACE FUNCTION notify_booking_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for provider when a booking is created
  INSERT INTO notifications (user_id, message, type, status, service_id)
  SELECT 
    s.provider_id,
    'New booking request for ' || s.title,
    'booking_request',
    'pending',
    NEW.service_id
  FROM services s
  WHERE s.id = NEW.service_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_notification
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking_request();

-- Trigger for booking status updates
CREATE OR REPLACE FUNCTION notify_booking_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for user when booking status changes
  IF NEW.status <> OLD.status THEN
    INSERT INTO notifications (user_id, message, type, status, service_id)
    VALUES (
      NEW.user_id,
      'Booking status updated to ' || NEW.status || ' for service ' || (SELECT title FROM services WHERE id = NEW.service_id),
      'booking_update',
      NEW.status,
      NEW.service_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_status_update
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking_update();
