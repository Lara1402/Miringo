-- ============================================================
-- MSOT Gamified Learning Platform - Complete Database Setup
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'admin')),
  requested_role TEXT NOT NULL DEFAULT 'student' CHECK (requested_role IN ('student', 'faculty')),
  approval_status TEXT NOT NULL DEFAULT 'not_required' CHECK (approval_status IN ('not_required', 'pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON public.profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_profiles_requested_role ON public.profiles(requested_role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Security Definer Helper & Zero-Recursion Policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'profiles' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT (COALESCE(auth.jwt()->>'email', '') = 'sudhanshu91730@gmail.com')
  OR (COALESCE(auth.jwt()->'app_metadata'->>'role', '') = 'admin');
$$;

-- (A) SELECT: All authenticated users can read member profiles.
-- Essential for gamified learning: leaderboards, leagues, peer assistance, and admin view.
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- (B) INSERT: Users can insert their own profile during signup
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- (C) UPDATE: Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- (D) UPDATE: Admins can update any member profile (approve, assign faculty, reject)
CREATE POLICY "profiles_admin_update"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt()->>'email') = 'sudhanshu91730@gmail.com'
    OR (auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

-- (E) DELETE: Admins can delete profiles if needed
CREATE POLICY "profiles_admin_delete"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (
    (auth.jwt()->>'email') = 'sudhanshu91730@gmail.com'
    OR (auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

-- 4. Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _requested_role TEXT;
  _role TEXT;
  _approval_status TEXT;
BEGIN
  _requested_role := COALESCE(
    NEW.raw_user_meta_data->>'requested_role',
    'student'
  );
  
  IF _requested_role NOT IN ('student', 'faculty') THEN
    _requested_role := 'student';
  END IF;
  
  -- Auto-promote sudhanshu91730@gmail.com to admin
  IF NEW.email = 'sudhanshu91730@gmail.com' THEN
    _role := 'admin';
    _approval_status := 'not_required';
  ELSIF _requested_role = 'faculty' THEN
    _role := 'student';
    _approval_status := 'pending';
  ELSE
    _role := 'student';
    _approval_status := 'not_required';
  END IF;
  
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    role,
    requested_role,
    approval_status,
    email_verified
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    _role,
    _requested_role,
    _approval_status,
    (NEW.email_confirmed_at IS NOT NULL)
  )
  ON CONFLICT (id) DO UPDATE
  SET
    role = EXCLUDED.role,
    approval_status = EXCLUDED.approval_status;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Trigger to sync email confirmation
CREATE OR REPLACE FUNCTION public.handle_user_email_confirmed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at) THEN
    UPDATE public.profiles
    SET email_verified = true, updated_at = now()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_email_confirmed();

-- 6. Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 7. Admin function to update member approval and roles
CREATE OR REPLACE FUNCTION public.admin_update_member(
  target_user_id UUID,
  new_role TEXT,
  new_status TEXT
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
  result public.profiles;
BEGIN
  SELECT role INTO caller_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  IF caller_role IS NULL OR caller_role != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can update member roles and approval status';
  END IF;
  
  IF new_role NOT IN ('student', 'faculty', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  
  IF new_status NOT IN ('pending', 'approved', 'rejected', 'not_required') THEN
    RAISE EXCEPTION 'Invalid status: %', new_status;
  END IF;
  
  IF target_user_id = auth.uid() AND (new_role != 'admin' OR new_status = 'rejected') THEN
    RAISE EXCEPTION 'Cannot demote or reject your own administrator account';
  END IF;

  UPDATE public.profiles
  SET
    role = new_role,
    approval_status = new_status,
    approved_by = auth.uid(),
    approved_at = CASE 
      WHEN new_status = 'approved' THEN COALESCE(approved_at, now())
      ELSE approved_at 
    END,
    updated_at = now()
  WHERE id = target_user_id
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;

-- 8. Backfill / Promote existing users from auth.users (including sudhanshu91730@gmail.com)
INSERT INTO public.profiles (
  id,
  full_name,
  email,
  role,
  requested_role,
  approval_status,
  email_verified
)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'full_name', 'Administrator'),
  email,
  CASE WHEN email = 'sudhanshu91730@gmail.com' THEN 'admin' ELSE 'student' END,
  'student',
  'not_required',
  (email_confirmed_at IS NOT NULL)
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET 
  role = CASE WHEN EXCLUDED.email = 'sudhanshu91730@gmail.com' THEN 'admin' ELSE public.profiles.role END,
  approval_status = CASE WHEN EXCLUDED.email = 'sudhanshu91730@gmail.com' THEN 'not_required' ELSE public.profiles.approval_status END;
