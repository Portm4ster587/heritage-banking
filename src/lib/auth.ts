import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export const signUp = async (email: string, password: string) => {
  const redirectUrl = `${window.location.origin}/dashboard`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl
    }
  });
  
  return { data, error };
};

export const signIn = async (usernameOrEmail: string, password: string) => {
  // Check if input looks like an email
  const isEmail = usernameOrEmail.includes('@');
  
  if (!isEmail) {
    // Look up email by username
    const { data: userData, error: lookupError } = await supabase
      .rpc('get_user_by_username', { _username: usernameOrEmail });
    
    if (lookupError || !userData || userData.length === 0) {
      return { 
        data: null, 
        error: new Error('Invalid username or password') 
      };
    }
    
    // Sign in with the found email
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userData[0].email,
      password
    });
    
    return { data, error };
  }
  
  // Sign in with email directly
  const { data, error } = await supabase.auth.signInWithPassword({
    email: usernameOrEmail,
    password
  });
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  return { error };
};