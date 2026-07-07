import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isAdmin: false,
    isLoading: true,
  });

  const checkAdminRole = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) return false;
      return !!data;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const isAdmin = session?.user ? await checkAdminRole(session.user.id) : false;
      setState({
        user: session?.user ?? null,
        session,
        isAdmin,
        isLoading: false,
      });
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const isAdmin = session?.user ? await checkAdminRole(session.user.id) : false;
        setState({
          user: session?.user ?? null,
          session,
          isAdmin,
          isLoading: false,
        });
      }
    );

    return () => subscription.unsubscribe();
  }, [checkAdminRole]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user: state.user,
    session: state.session,
    isAdmin: state.isAdmin,
    isLoading: state.isLoading,
    signIn,
    signOut,
  };
}
