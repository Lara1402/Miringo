-- ============================================================
-- NOVA Application - Initial Admin Setup
-- ============================================================
-- INSTRUCTIONS:
-- 1. First, register an account at the application using email:
--    sudhanshu91730@gmail.com
-- 2. After registering and verifying your email, run this SQL
--    in the Supabase SQL Editor.
-- 3. This script promotes the registered user to admin role.
-- ============================================================

-- IMPORTANT: This script uses the authenticated user's profile
-- that was already created through normal registration.
-- It does NOT create a new user or bypass authentication.

-- Promote the user with the specified email to admin
-- This should only be run once during initial setup
DO $$
DECLARE
  target_id UUID;
BEGIN
  -- Find the user by email
  SELECT id INTO target_id
  FROM public.profiles
  WHERE email = 'sudhanshu91730@gmail.com';
  
  IF target_id IS NULL THEN
    RAISE EXCEPTION 'User with email sudhanshu91730@gmail.com not found. Please register first through the application.';
  END IF;
  
  -- Promote to admin
  UPDATE public.profiles
  SET 
    role = 'admin',
    approval_status = 'not_required',
    requested_role = 'student',  -- Reset requested_role since admin
    updated_at = now()
  WHERE id = target_id;
  
  RAISE NOTICE 'Successfully promoted user to admin role.';
END;
$$;
