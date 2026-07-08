-- ========================================================
-- Supabase Database Schema: Profiles Table & Auth Triggers
-- ========================================================
-- Copy and run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- to create the public.profiles table and setup automatic profile creation.

-- 1. Create the public profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT,
  is_premium BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Allow anyone to read profiles (or you can restrict to authenticated users)
CREATE POLICY "Public profiles are viewable by everyone." 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile." 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile." 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- 4. Create Postgres trigger function to sync new users from auth.users automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_premium)
  VALUES (new.id, new.email, false)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger the function every time a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE PROCEDURE public.handle_new_user();
