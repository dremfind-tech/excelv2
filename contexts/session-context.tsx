"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '@/lib/supabase';

interface Session {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface SessionContextType {
  session: Session;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<Session>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });
  const router = useRouter();
  const supabase = createClient();

  // Load session on mount and listen for auth changes
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      
      if (authSession?.user) {
        await loadUserProfile(authSession.user);
      } else {
        setSession({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, authSession) => {
      if (event === 'SIGNED_IN' && authSession?.user) {
        await loadUserProfile(authSession.user);
      } else if (event === 'SIGNED_OUT') {
        setSession({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Load user profile from profiles table
  const loadUserProfile = async (authUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          await createUserProfile(authUser);
          return;
        }
        throw error;
      }

      setSession({
        user: profile,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      setSession({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  };

  // Create user profile if it doesn't exist
  const createUserProfile = async (authUser: SupabaseUser) => {
    try {
      const newProfile = {
        id: authUser.id,
        email: authUser.email!,
        name: authUser.user_metadata?.name || authUser.email!.split('@')[0],
        plan: 'Free' as const,
      };

      const { data: profile, error } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (error) throw error;

      setSession({
        user: profile,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      setSession({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setSession(prev => ({ ...prev, isLoading: true }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // User profile will be loaded by the auth state change listener
    } catch (error) {
      setSession(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<void> => {
    setSession(prev => ({ ...prev, isLoading: true }));

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        console.error('Signup error:', error);
        if (error.message.includes('already registered')) {
          throw new Error('This email is already registered. Please sign in instead.');
        }
        if (error.message.includes('422')) {
          throw new Error('Invalid email or password format. Please check your input.');
        }
        throw new Error(error.message || 'Signup failed');
      }

      if (data.user && !data.user.email_confirmed_at) {
        // Email confirmation required
        setSession(prev => ({ ...prev, isLoading: false }));
        throw new Error('Please check your email to confirm your account before signing in.');
      }

      // If signup successful and confirmed, the auth state change will handle session
    } catch (error) {
      setSession(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    // Prevent multiple logout calls
    if (!session.isAuthenticated && !session.user) {
      console.log('Already logged out, skipping logout process');
      router.push('/');
      return;
    }

    try {
      // Clear session state immediately to prevent any UI flicker
      setSession({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });

      // Call our logout API to handle server-side cleanup
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Server logout successful:', result);
        } else {
          console.warn('Logout API failed, proceeding with client-side cleanup');
        }
      } catch (apiError) {
        console.warn('Logout API error:', apiError);
      }

      // Also sign out from Supabase client-side (backup)
      try {
        // Check if there's actually a session before trying to sign out
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          const { error } = await supabase.auth.signOut({ scope: 'global' });
          
          if (error) {
            // Don't log error if session is already missing
            if (!error.message?.includes('session missing') && error.message !== 'Auth session missing!') {
              console.error('Error during Supabase logout:', error);
            }
          }
        }
      } catch (supabaseError: any) {
        // Ignore session missing errors as user is already logged out
        if (!supabaseError.message?.includes('session missing') && supabaseError.message !== 'Auth session missing!') {
          console.error('Supabase logout error:', supabaseError);
        }
      }

      // Clear any additional cookies and storage manually
      if (typeof document !== 'undefined') {
        // Clear ALL possible auth-related cookies
        const cookies = [
          // Supabase specific cookies
          'supabase-auth-token', 
          'supabase.auth.token',
          'sb-access-token', 
          'sb-refresh-token',
          // Dynamic Supabase project cookies
          `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`,
          // Generic auth cookies
          'auth-token',
          'access-token',
          'refresh-token',
          'session',
          'user-session',
          'jwt',
          'token',
          // Additional patterns
          'auth',
          'authentication',
          'login'
        ];
        
        cookies.forEach(cookieName => {
          // Clear with multiple domain/path combinations to ensure complete removal
          const expireDate = 'Thu, 01 Jan 1970 00:00:00 UTC';
          
          // Clear for current hostname
          document.cookie = `${cookieName}=; expires=${expireDate}; path=/; domain=${window.location.hostname}`;
          // Clear for parent domain
          const domain = window.location.hostname;
          const parts = domain.split('.');
          if (parts.length > 1) {
            document.cookie = `${cookieName}=; expires=${expireDate}; path=/; domain=.${parts.slice(-2).join('.')}`;
          }
          // Clear for root path
          document.cookie = `${cookieName}=; expires=${expireDate}; path=/;`;
          // Clear with max-age
          document.cookie = `${cookieName}=; expires=${expireDate}; path=/; max-age=0`;
          // Clear with secure flag
          document.cookie = `${cookieName}=; expires=${expireDate}; path=/; secure`;
          // Clear with httpOnly false
          document.cookie = `${cookieName}=; expires=${expireDate}; path=/; httpOnly=false`;
        });
        
        console.log(`Cleared ${cookies.length} cookie patterns from browser`);
        
        // Clear ALL localStorage items (not just auth-related ones for complete cleanup)
        const localStorageKeys = Object.keys(localStorage);
        localStorageKeys.forEach(key => {
          if (key.includes('supabase') || 
              key.includes('auth') || 
              key.includes('token') || 
              key.includes('session') ||
              key.includes('user') ||
              key.includes('login')) {
            localStorage.removeItem(key);
          }
        });
        
        // Clear specific known localStorage keys
        const knownKeys = [
          'supabase.auth.token',
          'sb-access-token',
          'sb-refresh-token',
          'authToken',
          'accessToken',
          'refreshToken',
          'userSession',
          'currentUser'
        ];
        knownKeys.forEach(key => localStorage.removeItem(key));
        
        // Clear ALL sessionStorage
        sessionStorage.clear();
        
        // Clear IndexedDB if present (some auth libraries use it)
        if ('indexedDB' in window) {
          try {
            indexedDB.deleteDatabase('supabase-auth');
          } catch (e) {
            console.warn('Could not clear IndexedDB:', e);
          }
        }
      }
      
      // Redirect to home page
      router.push('/');
      
      // Force page reload to ensure all state is completely cleared
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }, 100);
      
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if there's an error, clear local state and redirect
      setSession({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      router.push('/');
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!session.user) throw new Error('No user logged in');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id)
        .select()
        .single();

      if (error) throw error;

      setSession(prev => ({
        ...prev,
        user: data
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const refreshSession = async (): Promise<void> => {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      
      if (authSession?.user) {
        await loadUserProfile(authSession.user);
      } else {
        setSession({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  const contextValue: SessionContextType = {
    session,
    user: session.user,
    isAuthenticated: session.isAuthenticated,
    isLoading: session.isLoading,
    login,
    signup,
    logout,
    updateProfile,
    refreshSession
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextType {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

// Hook for protected routes
export function useRequireAuth(): SessionContextType {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session.isLoading && !session.isAuthenticated) {
      router.push('/signin');
    }
  }, [session.isAuthenticated, session.isLoading, router]);

  return session;
}