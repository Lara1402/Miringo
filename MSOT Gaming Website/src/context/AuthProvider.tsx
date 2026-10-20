import { useEffect, useState, useCallback, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { profileService } from '../services/profileService';
import type { AuthState, Profile } from '../types';
import { AuthContext } from '../context/AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    initialized: false,
  });

  const loadProfile = useCallback(async (user: User) => {
    try {
      let profile = await profileService.getProfile(user.id);
      const isAdmin = user.email?.toLowerCase() === 'sudhanshu91730@gmail.com';

      // Auto-elevate primary administrator if registered as student
      if (profile && isAdmin && profile.role !== 'admin') {
        profile = { ...profile, role: 'admin', approval_status: 'not_required' };
        supabase
          .from('profiles')
          .update({ role: 'admin', approval_status: 'not_required' })
          .eq('id', user.id)
          .then(() => {});
      }

      // If record is not in database yet, attempt to upsert it
      if (!profile) {
        const defaultRole = isAdmin ? 'admin' : ((user.user_metadata?.requested_role as any) || 'student');
        try {
          const { data: created } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              full_name: user.user_metadata?.full_name || (isAdmin ? 'Administrator' : 'Student Member'),
              email: user.email || '',
              role: defaultRole,
              requested_role: 'student',
              approval_status: 'not_required',
              email_verified: Boolean(user.email_confirmed_at),
            })
            .select()
            .single();

          if (created) {
            profile = created as Profile;
          }
        } catch {
          // ignore database error if table is not yet migrated
        }
      }

      // Safe fallback profile so authenticated users are never blocked
      if (!profile) {
        profile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || (isAdmin ? 'Administrator' : 'Student Member'),
          email: user.email || '',
          role: isAdmin ? 'admin' : 'student',
          requested_role: 'student',
          approval_status: 'not_required',
          approved_by: null,
          approved_at: null,
          email_verified: Boolean(user.email_confirmed_at),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      setState(prev => ({ ...prev, user, profile, loading: false, initialized: true }));
    } catch (error) {
      console.error('Failed to load profile:', error);
      const isAdmin = user.email?.toLowerCase() === 'sudhanshu91730@gmail.com';
      const fallback: Profile = {
        id: user.id,
        full_name: user.user_metadata?.full_name || (isAdmin ? 'Administrator' : 'Student Member'),
        email: user.email || '',
        role: isAdmin ? 'admin' : 'student',
        requested_role: 'student',
        approval_status: 'not_required',
        approved_by: null,
        approved_at: null,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setState(prev => ({ ...prev, user, profile: fallback, loading: false, initialized: true }));
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (state.user) {
      await loadProfile(state.user);
    }
  }, [state.user, loadProfile]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user);
      } else {
        setState(prev => ({ ...prev, loading: false, initialized: true }));
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setState({ user: null, profile: null, loading: false, initialized: true });
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setState(prev => ({ ...prev, user: session.user }));
        } else if (event === 'PASSWORD_RECOVERY') {
          if (session?.user) {
            setState(prev => ({ ...prev, user: session.user, loading: false, initialized: true }));
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    await supabase.auth.signOut();
    setState({ user: null, profile: null, loading: false, initialized: true });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
