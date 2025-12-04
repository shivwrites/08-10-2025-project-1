// Supabase configuration for HTML pages
const SUPABASE_URL = 'https://bialelscmftlquykreij.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpYWxlbHNjbWZ0bHF1eWtyZWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NzgxMTgsImV4cCI6MjA3NTQ1NDExOH0.wUywvxuTxDlgwVi6y8KaT9E64D4iVRKFFoqUx8wAalI'

// Initialize Supabase client
let supabaseClient = null;
let initAttempted = false;

function initSupabaseClient() {
  // If already initialized, return the client
  if (supabaseClient) {
    return supabaseClient;
  }

  // Check if Supabase library is loaded
  if (typeof supabase === 'undefined') {
    if (!initAttempted) {
      console.warn('Supabase library not loaded yet, will retry...');
      initAttempted = true;
      // Retry after a short delay
      setTimeout(() => {
        if (typeof supabase !== 'undefined') {
          initSupabaseClient();
        }
      }, 100);
    }
    return null;
  }
  
  // Initialize the client
  try {
    const { createClient } = supabase;
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    console.log('Supabase client initialized successfully');
    return supabaseClient;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

// Initialize on load - try multiple times to ensure library is loaded
function attemptInit() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initSupabaseClient();
    });
  } else {
    // Try immediately
    initSupabaseClient();
    // Also try after a short delay in case script loads asynchronously
    setTimeout(initSupabaseClient, 50);
  }
}

attemptInit();

// Auth helper functions for HTML pages
const AuthService = {
  // Sign up a new user
  async signUp(email, password, name) {
    try {
      const client = initSupabaseClient();
      if (!client) {
        return { 
          data: null, 
          error: { 
            message: 'Supabase client not initialized. Please refresh the page.' 
          } 
        };
      }

      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: name,
          }
        }
      })
      return { data, error }
    } catch (err) {
      console.error('Sign up error:', err);
      return { 
        data: null, 
        error: { 
          message: err.message || 'Failed to sign up. Please check your internet connection and try again.' 
        } 
      }
    }
  },

  // Sign in an existing user
  async signIn(email, password) {
    try {
      const client = initSupabaseClient();
      if (!client) {
        return { 
          data: null, 
          error: { 
            message: 'Supabase client not initialized. Please refresh the page.' 
          } 
        };
      }

      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } catch (err) {
      console.error('Sign in error:', err);
      return { 
        data: null, 
        error: { 
          message: err.message || 'Failed to sign in. Please check your internet connection and try again.' 
        } 
      }
    }
  },

  // Sign out the current user
  async signOut() {
    try {
      const client = initSupabaseClient();
      if (!client) {
        return { error: { message: 'Supabase client not initialized.' } };
      }

      const { error } = await client.auth.signOut()
      return { error }
    } catch (err) {
      return { error: { message: err.message || 'Failed to sign out.' } }
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const client = initSupabaseClient();
      if (!client) {
        return { 
          data: null, 
          error: { 
            message: 'Supabase client not initialized. Please refresh the page.' 
          } 
        };
      }

      const { data, error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { data, error }
    } catch (err) {
      console.error('Reset password error:', err);
      return { 
        data: null, 
        error: { 
          message: err.message || 'Failed to send password reset email.' 
        } 
      }
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const client = initSupabaseClient();
      if (!client) {
        return null;
      }

      const { data: { user } } = await client.auth.getUser()
      return user
    } catch (err) {
      console.error('Get current user error:', err);
      return null
    }
  }
}

// Make AuthService available globally
window.AuthService = AuthService

