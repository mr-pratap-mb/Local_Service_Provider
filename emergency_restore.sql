-- EMERGENCY PROFILE RESTORATION
-- Run this in Supabase SQL Editor to quickly restore basic profiles

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'provider')),
    phone TEXT,
    whatsapp_number TEXT,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restore all users from auth.users
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
SELECT 
    id,
    email,
    'user' as role,
    created_at,
    NOW()
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Disable RLS temporarily for easier management
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Check results
SELECT COUNT(*) as restored_profiles FROM public.profiles;

-- Re-enable RLS with permissive policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations" ON public.profiles;
CREATE POLICY "Allow all operations" ON public.profiles
    FOR ALL USING (true) WITH CHECK (true);
