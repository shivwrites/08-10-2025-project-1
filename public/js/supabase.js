// Supabase configuration for HTML pages
const SUPABASE_URL = 'https://bialelscmftlquykreij.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpYWxlbHNjbWZ0bHF1eWtyZWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NzgxMTgsImV4cCI6MjA3NTQ1NDExOH0.wUywvxuTxDlgwVi6y8KaT9E64D4iVRKFFoqUx8wAalI'

// Initialize Supabase client
const { createClient } = supabase
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Auth helper functions for HTML pages
const AuthService = {
  // Sign up a new user
  async signUp(email, password, name) {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      })
      return { data, error }
    } catch (err) {
      return { data: null, error: err }
    }
  },

  // Sign in an existing user
  async signIn(email, password) {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } catch (err) {
      return { data: null, error: err }
    }
  },

  // Sign out the current user
  async signOut() {
    try {
      const { error } = await supabaseClient.auth.signOut()
      return { error }
    } catch (err) {
      return { error: err }
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { data, error }
    } catch (err) {
      return { data: null, error: err }
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabaseClient.auth.getUser()
      return user
    } catch (err) {
      return null
    }
  }
}

// Make AuthService available globally
window.AuthService = AuthService

