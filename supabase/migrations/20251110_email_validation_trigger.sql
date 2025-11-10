-- Create function to check for disposable emails
CREATE OR REPLACE FUNCTION check_valid_email()
RETURNS TRIGGER AS $$
DECLARE
  dummy_domains TEXT[] := ARRAY[
    'yopmail.com', 
    'mailinator.com', 
    'tempmail.com', 
    '10minutemail.com', 
    'guerrillamail.com', 
    'dispostable.com', 
    'fakeinbox.com', 
    'trashmail.com',
    'example.com'
  ];
  domain TEXT;
BEGIN
  domain := split_part(NEW.email, '@', 2);
  
  IF domain = ANY(dummy_domains) THEN
    RAISE EXCEPTION 'Disposable emails are not allowed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to auth.users table to prevent signup with disposable emails
DROP TRIGGER IF EXISTS check_valid_email_trigger ON auth.users;
CREATE TRIGGER check_valid_email_trigger
BEFORE INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION check_valid_email();

-- Attach trigger to profiles table as additional check
DROP TRIGGER IF EXISTS check_valid_email_profiles_trigger ON public.profiles;
CREATE TRIGGER check_valid_email_profiles_trigger
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION check_valid_email();
