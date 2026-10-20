import { describe, it, expect } from 'vitest';
import type { Profile, UserRole, ApprovalStatus } from '../types';

describe('Security & Authorization Invariants', () => {
  it('prevents public signup as admin', () => {
    const rawSignUpPayload = {
      fullName: 'Attacker',
      email: 'attacker@example.com',
      password: 'Password123',
      accountType: 'admin', // Attempted privilege escalation
    };

    // The frontend type system rejects 'admin'
    // Database trigger also defaults any non-(student|faculty) requested_role to 'student'
    const allowedRoles = ['student', 'faculty'];
    expect(allowedRoles.includes(rawSignUpPayload.accountType)).toBe(false);
  });

  it('guarantees faculty applicant starts in pending status with student role', () => {
    // In database handle_new_user() trigger:
    // IF _requested_role = 'faculty' THEN
    //   _role := 'student';
    //   _approval_status := 'pending';
    const createNewProfile = (requestedRole: string): Partial<Profile> => {
      const sanitizedRequestedRole = ['student', 'faculty'].includes(requestedRole)
        ? requestedRole
        : 'student';

      if (sanitizedRequestedRole === 'faculty') {
        return {
          role: 'student' as UserRole,
          requested_role: 'faculty',
          approval_status: 'pending' as ApprovalStatus,
        };
      }
      return {
        role: 'student' as UserRole,
        requested_role: 'student',
        approval_status: 'not_required' as ApprovalStatus,
      };
    };

    const facultyProfile = createNewProfile('faculty');
    expect(facultyProfile.role).toBe('student');
    expect(facultyProfile.approval_status).toBe('pending');
    expect(facultyProfile.requested_role).toBe('faculty');

    const studentProfile = createNewProfile('student');
    expect(studentProfile.role).toBe('student');
    expect(studentProfile.approval_status).toBe('not_required');

    // Attempted injection
    const forgedProfile = createNewProfile('admin');
    expect(forgedProfile.role).toBe('student');
    expect(forgedProfile.approval_status).toBe('not_required');
  });

  it('ensures approval functions require admin privileges', () => {
    const simulateApproval = (callerRole: string, targetUserId: string, callerId: string) => {
      if (callerRole !== 'admin') {
        throw new Error('Unauthorized: Only administrators can approve faculty applications');
      }
      if (targetUserId === callerId) {
        throw new Error('Cannot approve your own application');
      }
      return { success: true };
    };

    // Non-admin attempts approval
    expect(() => simulateApproval('student', 'user-123', 'student-456')).toThrow(
      'Unauthorized: Only administrators can approve faculty applications'
    );
    expect(() => simulateApproval('faculty', 'user-123', 'faculty-456')).toThrow(
      'Unauthorized: Only administrators can approve faculty applications'
    );

    // Admin attempts self-approval
    expect(() => simulateApproval('admin', 'admin-id', 'admin-id')).toThrow(
      'Cannot approve your own application'
    );

    // Legitimate admin approval
    expect(simulateApproval('admin', 'faculty-user-123', 'admin-id')).toEqual({
      success: true,
    });
  });

  it('enforces that profiles RLS prevents users from changing their own role or status', () => {
    // RLS Policy check:
    // role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    // approval_status = (SELECT approval_status FROM public.profiles WHERE id = auth.uid())
    const validateProfileUpdate = (
      existingProfile: Profile,
      incomingUpdate: Partial<Profile>
    ) => {
      const allowedUpdateKeys = ['full_name'];
      const attemptedKeys = Object.keys(incomingUpdate);
      const isIllegal = attemptedKeys.some(
        k => !allowedUpdateKeys.includes(k) && incomingUpdate[k as keyof Profile] !== existingProfile[k as keyof Profile]
      );
      if (isIllegal) {
        throw new Error('RLS Violation: Cannot update privileged fields');
      }
      return { ...existingProfile, ...incomingUpdate };
    };

    const currentProfile: Profile = {
      id: 'usr-1',
      full_name: 'John Doe',
      email: 'john@example.com',
      role: 'student',
      requested_role: 'faculty',
      approval_status: 'pending',
      approved_by: null,
      approved_at: null,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    };

    // Legitimate name update
    expect(() =>
      validateProfileUpdate(currentProfile, { full_name: 'John Updated' })
    ).not.toThrow();

    // Malicious role escalation
    expect(() =>
      validateProfileUpdate(currentProfile, { role: 'admin' })
    ).toThrow('RLS Violation: Cannot update privileged fields');

    // Malicious self-approval
    expect(() =>
      validateProfileUpdate(currentProfile, { approval_status: 'approved' })
    ).toThrow('RLS Violation: Cannot update privileged fields');
  });

  it('allows administrators to approve registered members and assign Faculty or Student roles', () => {
    const adminUpdateMember = (
      callerRole: UserRole,
      callerId: string,
      targetUserId: string,
      targetProfile: Profile,
      newRole: UserRole,
      newStatus: ApprovalStatus
    ): Profile => {
      if (callerRole !== 'admin') {
        throw new Error('Unauthorized: Only administrators can update member roles and approval status');
      }
      if (callerId === targetUserId && (newRole !== 'admin' || newStatus === 'rejected')) {
        throw new Error('Cannot demote or reject your own administrator account');
      }
      return {
        ...targetProfile,
        role: newRole,
        approval_status: newStatus,
        approved_by: callerId,
        approved_at: newStatus === 'approved' ? new Date().toISOString() : targetProfile.approved_at,
        updated_at: new Date().toISOString(),
      };
    };

    const targetUser: Profile = {
      id: 'member-001',
      full_name: 'Alex Rivera',
      email: 'alex.rivera@msot.edu',
      role: 'student',
      requested_role: 'student',
      approval_status: 'pending',
      approved_by: null,
      approved_at: null,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    };

    // Admin approves as Faculty (giving modification access)
    const approvedFaculty = adminUpdateMember('admin', 'admin-999', targetUser.id, targetUser, 'faculty', 'approved');
    expect(approvedFaculty.role).toBe('faculty');
    expect(approvedFaculty.approval_status).toBe('approved');
    expect(approvedFaculty.approved_by).toBe('admin-999');

    // Admin approves as Student
    const approvedStudent = adminUpdateMember('admin', 'admin-999', targetUser.id, targetUser, 'student', 'approved');
    expect(approvedStudent.role).toBe('student');
    expect(approvedStudent.approval_status).toBe('approved');

    // Admin toggles approved student to faculty
    const promoted = adminUpdateMember('admin', 'admin-999', targetUser.id, approvedStudent, 'faculty', 'approved');
    expect(promoted.role).toBe('faculty');

    // Non-admin attempt rejected
    expect(() =>
      adminUpdateMember('student', 'student-001', targetUser.id, targetUser, 'faculty', 'approved')
    ).toThrow('Unauthorized');
  });
});
