import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

function App() {
  // Initialize currentPage from localStorage or default to 'landing'
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('currentPage') || 'landing';
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app load only
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const savedPage = localStorage.getItem('currentPage') || 'landing';
        
        if (session?.user) {
          // User is authenticated - preserve current page
          // Only redirect to dashboard if we're starting fresh (landing page)
          if (savedPage === 'landing') {
            setCurrentPage('dashboard');
            localStorage.setItem('currentPage', 'dashboard');
          } else {
            setCurrentPage(savedPage);
          }
        } else {
          // User is not authenticated, but allow navigation to login/signup pages
          if (savedPage !== 'login' && savedPage !== 'signup' && 
              savedPage !== 'email-confirmation' && savedPage !== 'forgot-password' && 
              savedPage !== 'password-reset-confirmation') {
            setCurrentPage('landing');
            localStorage.setItem('currentPage', 'landing');
          } else {
            setCurrentPage(savedPage);
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setCurrentPage('landing');
        localStorage.setItem('currentPage', 'landing');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Only redirect to dashboard if we're currently on landing page
        const currentSavedPage = localStorage.getItem('currentPage') || 'landing';
        if (currentSavedPage === 'landing') {
          setCurrentPage('dashboard');
          localStorage.setItem('currentPage', 'dashboard');
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentPage('landing');
        localStorage.setItem('currentPage', 'landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []); // No dependencies needed

  useEffect(() => {
    // Listen for messages from the iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'navigate-to-signup') {
        setCurrentPage('signup');
        localStorage.setItem('currentPage', 'signup');
      } else if (event.data === 'navigate-to-login') {
        setCurrentPage('login');
        localStorage.setItem('currentPage', 'login');
      } else if (event.data === 'navigate-to-email-confirmation') {
        setCurrentPage('email-confirmation');
        localStorage.setItem('currentPage', 'email-confirmation');
      } else if (event.data === 'navigate-to-forgot-password') {
        setCurrentPage('forgot-password');
        localStorage.setItem('currentPage', 'forgot-password');
      } else if (event.data === 'navigate-to-password-reset-confirmation') {
        setCurrentPage('password-reset-confirmation');
        localStorage.setItem('currentPage', 'password-reset-confirmation');
      } else if (event.data === 'navigate-to-landing') {
        setCurrentPage('landing');
        localStorage.setItem('currentPage', 'landing');
      } else if (event.data === 'navigate-to-dashboard') {
        setCurrentPage('dashboard');
        localStorage.setItem('currentPage', 'dashboard');
      } else if (event.data && event.data.type === 'dashboard-page-change') {
        // Handle dashboard internal page changes
        const dashboardPage = event.data.page;
        localStorage.setItem('dashboardPage', dashboardPage);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#64748b', fontSize: '16px' }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (currentPage === 'signup') {
    return (
      <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
        <iframe
          src="/signup.html"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block'
          }}
          title="Career Clarified Signup Page"
        />
      </div>
    );
  }

  if (currentPage === 'login') {
    return (
      <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
        <iframe
          src="/login.html"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block'
          }}
          title="Career Clarified Login Page"
        />
      </div>
    );
  }

  if (currentPage === 'email-confirmation') {
    return (
      <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
        <iframe
          src="/email-confirmation.html"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block'
          }}
          title="Career Clarified Email Confirmation Page"
        />
      </div>
    );
  }

  if (currentPage === 'forgot-password') {
    return (
      <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
        <iframe
          src="/forgot-password.html"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block'
          }}
          title="Career Clarified Forgot Password Page"
        />
      </div>
    );
  }

  if (currentPage === 'password-reset-confirmation') {
    return (
      <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
        <iframe
          src="/password-reset-confirmation.html"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block'
          }}
          title="Career Clarified Password Reset Confirmation Page"
        />
      </div>
    );
  }

  if (currentPage === 'dashboard') {
    return (
      <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
        <iframe
          src="/dashboard.html"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block'
          }}
          title="Career Clarified Dashboard"
        />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe
        src="/landing.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
        title="Career Clarified Landing Page"
      />
    </div>
  );
}

export default App;
