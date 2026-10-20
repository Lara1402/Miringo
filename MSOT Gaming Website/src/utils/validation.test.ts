import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './validation';

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('validates a valid student registration', () => {
      const data = {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        accountType: 'student' as const,
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates a valid faculty applicant registration', () => {
      const data = {
        fullName: 'Dr. John Smith',
        email: 'john@university.edu',
        password: 'SecurePassword1',
        confirmPassword: 'SecurePassword1',
        accountType: 'faculty' as const,
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects passwords that do not match', () => {
      const data = {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123',
        accountType: 'student' as const,
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Passwords do not match');
      }
    });

    it('rejects passwords shorter than 8 characters', () => {
      const data = {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Pass1',
        confirmPassword: 'Pass1',
        accountType: 'student' as const,
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects invalid email formats', () => {
      const data = {
        fullName: 'Jane Doe',
        email: 'not-an-email',
        password: 'Password123',
        confirmPassword: 'Password123',
        accountType: 'student' as const,
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('does not allow admin as a public registration accountType', () => {
      const data = {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        accountType: 'admin' as any,
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('validates valid login credentials', () => {
      const data = {
        email: 'user@example.com',
        password: 'Password123',
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects empty password', () => {
      const data = {
        email: 'user@example.com',
        password: '',
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('validates valid email address', () => {
      const data = { email: 'reset@example.com' };
      const result = forgotPasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('resetPasswordSchema', () => {
    it('validates matching strong passwords', () => {
      const data = {
        password: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects mismatched passwords', () => {
      const data = {
        password: 'NewPassword123',
        confirmPassword: 'MismatchPassword123',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
