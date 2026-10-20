import { describe, it, expect } from 'vitest';
import { getRedirectPath, canAccessRoute } from './routes';

describe('Route Access and Redirection Utilities', () => {
  describe('getRedirectPath', () => {
    it('redirects admin to /admin/users', () => {
      expect(getRedirectPath('admin', 'not_required')).toBe('/admin/users');
    });

    it('redirects approved faculty to /faculty/dashboard', () => {
      expect(getRedirectPath('faculty', 'approved')).toBe('/faculty/dashboard');
    });

    it('redirects pending faculty to /faculty/pending', () => {
      expect(getRedirectPath('faculty', 'pending')).toBe('/faculty/pending');
    });

    it('redirects rejected faculty to /faculty/pending', () => {
      expect(getRedirectPath('faculty', 'rejected')).toBe('/faculty/pending');
    });

    it('redirects student to /dashboard', () => {
      expect(getRedirectPath('student', 'not_required')).toBe('/dashboard');
    });
  });

  describe('canAccessRoute', () => {
    it('denies unauthenticated visitors access to protected routes', () => {
      expect(canAccessRoute('/admin/users', undefined, undefined)).toBe(false);
      expect(canAccessRoute('/dashboard', undefined, undefined)).toBe(false);
    });

    it('allows admin to access /admin/users', () => {
      expect(canAccessRoute('/admin/users', 'admin', 'not_required')).toBe(true);
    });

    it('denies student access to /admin/users', () => {
      expect(canAccessRoute('/admin/users', 'student', 'not_required')).toBe(false);
    });

    it('denies faculty access to /admin/users', () => {
      expect(canAccessRoute('/admin/users', 'faculty', 'approved')).toBe(false);
    });

    it('allows approved faculty to access /faculty/dashboard', () => {
      expect(canAccessRoute('/faculty/dashboard', 'faculty', 'approved')).toBe(true);
    });

    it('denies pending faculty access to /faculty/dashboard', () => {
      expect(canAccessRoute('/faculty/dashboard', 'faculty', 'pending')).toBe(false);
    });

    it('denies rejected faculty access to /faculty/dashboard', () => {
      expect(canAccessRoute('/faculty/dashboard', 'faculty', 'rejected')).toBe(false);
    });

    it('denies student access to /faculty/dashboard', () => {
      expect(canAccessRoute('/faculty/dashboard', 'student', 'not_required')).toBe(false);
    });

    it('allows pending faculty to access /faculty/pending', () => {
      expect(canAccessRoute('/faculty/pending', 'faculty', 'pending')).toBe(true);
    });

    it('allows rejected faculty to access /faculty/pending to view status', () => {
      expect(canAccessRoute('/faculty/pending', 'faculty', 'rejected')).toBe(true);
    });
  });
});
