-- ==============================================================================
-- FIX: INFINITE RECURSION IN ROW LEVEL SECURITY (RLS) FOR "profiles"
-- Copy and run this ENTIRE script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rjwjanjpctypununlzbv/sql/new
-- ==============================================================================

-- 1. DYNAMICALLY DROP EVERY EXISTING POLICY ON public.profiles
-- This ensures ANY old recursive policy (e.g. from 001_create_profiles.sql)
-- is completely wiped out, regardless of what it was named.
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

-- 2. CREATE A ZERO-RECURSION ADMIN HELPER FUNCTION
-- Uses auth.jwt() directly in memory; NEVER queries public.profiles!
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT (COALESCE(auth.jwt()->>'email', '') = 'sudhanshu91730@gmail.com')
  OR (COALESCE(auth.jwt()->'app_metadata'->>'role', '') = 'admin');
$$;

-- 3. CREATE ZERO-RECURSION RLS POLICIES ON public.profiles

-- (A) SELECT: All authenticated users can read member profiles.
-- Essential for gamified learning: leaderboards, leagues, peer assistance, and admin view.
-- ZERO subqueries = ZERO recursion!
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
-- Checked directly from the JWT; NEVER touches public.profiles!
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

-- 4. RPC FUNCTION: admin_get_users (SECURITY DEFINER fallback)
CREATE OR REPLACE FUNCTION public.admin_get_users(search_query TEXT DEFAULT NULL)
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.profiles
  WHERE (
    search_query IS NULL 
    OR search_query = ''
    OR full_name ILIKE '%' || search_query || '%'
    OR email ILIKE '%' || search_query || '%'
  )
  ORDER BY created_at DESC;
END;
$$;

-- 5. RPC FUNCTION: admin_update_member (Securely updates roles and approvals)
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
  caller_email TEXT;
  result public.profiles;
BEGIN
  caller_email := auth.jwt()->>'email';
  
  IF caller_email IS NULL OR (caller_email != 'sudhanshu91730@gmail.com' AND NOT public.is_admin()) THEN
    RAISE EXCEPTION 'Unauthorized: Only administrator can update member roles and approval status';
  END IF;
  
  IF new_role NOT IN ('student', 'faculty', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  
  IF new_status NOT IN ('pending', 'approved', 'rejected', 'not_required') THEN
    RAISE EXCEPTION 'Invalid status: %', new_status;
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

-- 6. MAKE SURE SUDHANSHU91730@GMAIL.COM IS ADMIN IN PROFILES
UPDATE public.profiles
SET role = 'admin', approval_status = 'not_required'
WHERE email = 'sudhanshu91730@gmail.com';
