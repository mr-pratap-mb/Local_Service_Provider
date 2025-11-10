-- MANUAL RESTORATION QUERIES FOR PROFILES TABLE
-- Run these queries in Supabase SQL Editor to restore profiles

-- 1. First, check if profiles table exists and its structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if there's a backup table
SELECT COUNT(*) as backup_count FROM information_schema.tables 
WHERE table_name = 'profiles_backup' AND table_schema = 'public';

-- 3. If backup exists, restore from backup
-- (Only run this if the above query returns backup_count > 0)
/*
INSERT INTO public.profiles 
SELECT * FROM public.profiles_backup
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    whatsapp_number = EXCLUDED.whatsapp_number,
    location = EXCLUDED.location,
    updated_at = NOW();
*/

-- 4. If no backup exists, restore basic profiles from auth.users
-- This creates basic profiles for all authenticated users
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    'user' as role,  -- Default to 'user', you can update providers manually
    au.created_at,
    NOW() as updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL  -- Only for users without profiles
ON CONFLICT (id) DO NOTHING;

-- 5. Update specific users to 'provider' role if you know their emails
-- Replace the email addresses with actual provider emails
/*
UPDATE public.profiles 
SET role = 'provider', updated_at = NOW()
WHERE email IN (
    'provider1@example.com',
    'provider2@example.com',
    'provider3@example.com'
    -- Add more provider emails as needed
);
*/

-- 6. Check current profiles count
SELECT 
    role,
    COUNT(*) as count
FROM public.profiles 
GROUP BY role;

-- 7. View all current profiles
SELECT 
    id,
    full_name,
    email,
    role,
    whatsapp_number,
    location,
    created_at
FROM public.profiles 
ORDER BY created_at DESC;

-- 8. If you need to add specific profile data, use this template:
/*
INSERT INTO public.profiles (id, full_name, email, role, whatsapp_number, location)
VALUES 
    ('user-uuid-1', 'John Doe', 'john@example.com', 'provider', '+1234567890', 'New York, NY'),
    ('user-uuid-2', 'Jane Smith', 'jane@example.com', 'user', '+0987654321', 'Los Angeles, CA')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    whatsapp_number = EXCLUDED.whatsapp_number,
    location = EXCLUDED.location,
    updated_at = NOW();
*/

-- 9. Enable RLS and create policies (if not already done)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 10. Verify everything is working
SELECT 'Profiles restored successfully!' as status,
       COUNT(*) as total_profiles,
       COUNT(CASE WHEN role = 'provider' THEN 1 END) as providers,
       COUNT(CASE WHEN role = 'user' THEN 1 END) as users
FROM public.profiles;
