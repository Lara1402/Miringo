-- ============================================================
-- MSOT Gamified Learning Platform - Admin Member Management
-- Migration 003: Member Approval & Role Assignment (Faculty / Student)
-- ============================================================

-- 1. Policy allowing administrators to update any profile
DROP POLICY IF EXISTS "admins_update_all_profiles" ON public.profiles;
CREATE POLICY "admins_update_all_profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2. General admin function to approve and assign roles (Student or Faculty)
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
  -- Verify caller is admin
  SELECT role INTO caller_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  IF caller_role IS NULL OR caller_role != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can update member roles and approval status';
  END IF;
  
  -- Validate inputs
  IF new_role NOT IN ('student', 'faculty', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  
  IF new_status NOT IN ('pending', 'approved', 'rejected', 'not_required') THEN
    RAISE EXCEPTION 'Invalid status: %', new_status;
  END IF;
  
  -- Prevent admin from demoting or rejecting themselves
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
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User with ID % not found', target_user_id;
  END IF;
  
  RETURN result;
END;
$$;
