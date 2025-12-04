import { createClient } from '@supabase/supabase-js'

// Fallback values (same as in public/js/supabase.js)
const DEFAULT_SUPABASE_URL = 'https://bialelscmftlquykreij.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpYWxlbHNjbWZ0bHF1eWtyZWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NzgxMTgsImV4cCI6MjA3NTQ1NDExOH0.wUywvxuTxDlgwVi6y8KaT9E64D4iVRKFFoqUx8wAalI'

// Get Supabase URL and key from environment variables or use defaults
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY

// Ensure URL has protocol
if (supabaseUrl && !supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  supabaseUrl = `https://${supabaseUrl}`
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase Url or Key missing', { supabaseUrl, supabaseAnonKey: supabaseAnonKey ? '***' : 'missing' })
  throw new Error('Supabase Url or Key missing')
}

console.log('Initializing Supabase client with URL:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth helper functions
export const auth = {
  // Sign up a new user
  async signUp(email: string, password: string, name: string) {
    try {
      const redirectUrl = `${window.location.origin}/login`
      console.log('Signing up with redirect URL:', redirectUrl)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: name,
          }
        }
      })
      
      if (error) {
        console.error('Supabase sign up error:', error)
      } else {
        console.log('Sign up successful, data:', data)
      }
      
      return { data, error }
    } catch (err) {
      console.error('Sign up exception:', err)
      return { 
        data: null, 
        error: { 
          message: err instanceof Error ? err.message : 'Failed to sign up. Please check your internet connection.' 
        } 
      }
    }
  },

  // Sign in an existing user
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign out the current user
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Reset password
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }
}

