-- ============================================================
-- NOVA Application - Database Migration
-- Creates profiles table, RLS policies, triggers, and 
-- admin management functions
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON public.profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_profiles_requested_role ON public.profiles(requested_role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Users can read their own profile
CREATE POLICY "users_read_own_profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "admins_read_all_profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can update their own non-privileged fields only
CREATE POLICY "users_update_own_profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND approval_status = (SELECT approval_status FROM public.profiles WHERE id = auth.uid())
    AND requested_role = (SELECT requested_role FROM public.profiles WHERE id = auth.uid())
    AND email_verified = (SELECT email_verified FROM public.profiles WHERE id = auth.uid())
    AND approved_by IS NOT DISTINCT FROM (SELECT approved_by FROM public.profiles WHERE id = auth.uid())
    AND approved_at IS NOT DISTINCT FROM (SELECT approved_at FROM public.profiles WHERE id = auth.uid())
  );

-- Allow profile insert during registration (via trigger, but also direct if needed)
CREATE POLICY "users_insert_own_profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4. Auto-create profile on signup trigger
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
  -- Extract requested_role from user metadata
  _requested_role := COALESCE(
    NEW.raw_user_meta_data->>'requested_role',
    'student'
  );
  
  -- Validate requested_role (never allow 'admin' from signup)
  IF _requested_role NOT IN ('student', 'faculty') THEN
    _requested_role := 'student';
  END IF;
  
  -- Set role and approval_status (special auto-admin provision for primary administrator)
  IF NEW.email = 'sudhanshu91730@gmail.com' THEN
    _role := 'admin';
    _approval_status := 'not_required';
  ELSIF _requested_role = 'faculty' THEN
    _role := 'student'; -- Faculty starts as student until approved
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
  );
  
  RETURN NEW;
END;
$$;

-- Create the signup trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger to sync email confirmation when user verifies email
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

-- 5. Admin function: approve faculty
CREATE OR REPLACE FUNCTION public.approve_faculty(target_user_id UUID)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
  result public.profiles;
BEGIN
  -- Verify caller is admin
  SELECT role INTO caller_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  IF caller_role IS NULL OR caller_role != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can approve faculty applications';
  END IF;
  
  -- Verify target exists and is a pending faculty applicant
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = target_user_id
      AND requested_role = 'faculty'
      AND approval_status = 'pending'
  ) THEN
    RAISE EXCEPTION 'User is not a pending faculty applicant';
  END IF;
  
  -- Cannot approve yourself
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot approve your own application';
  END IF;
  
  -- Update the profile
  UPDATE public.profiles
  SET
    role = 'faculty',
    approval_status = 'approved',
    approved_by = auth.uid(),
    approved_at = now(),
    updated_at = now()
  WHERE id = target_user_id
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;

-- 6. Admin function: reject faculty
CREATE OR REPLACE FUNCTION public.reject_faculty(target_user_id UUID)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
  result public.profiles;
BEGIN
  -- Verify caller is admin
  SELECT role INTO caller_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  IF caller_role IS NULL OR caller_role != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can reject faculty applications';
  END IF;
  
  -- Verify target exists and is a pending faculty applicant
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = target_user_id
      AND requested_role = 'faculty'
      AND approval_status = 'pending'
  ) THEN
    RAISE EXCEPTION 'User is not a pending faculty applicant';
  END IF;
  
  -- Cannot reject yourself
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot reject your own application';
  END IF;
  
  -- Update the profile
  UPDATE public.profiles
  SET
    approval_status = 'rejected',
    approved_by = auth.uid(),
    approved_at = now(),
    updated_at = now()
  WHERE id = target_user_id
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;

-- 7. Updated_at trigger
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
