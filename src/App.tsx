import { useState, useEffect } from 'react';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  useEffect(() => {
    // Listen for messages from the iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'navigate-to-signup') {
        setCurrentPage('signup');
      } else if (event.data === 'navigate-to-login') {
        setCurrentPage('login');
      } else if (event.data === 'navigate-to-email-confirmation') {
        setCurrentPage('email-confirmation');
      } else if (event.data === 'navigate-to-forgot-password') {
        setCurrentPage('forgot-password');
      } else if (event.data === 'navigate-to-password-reset-confirmation') {
        setCurrentPage('password-reset-confirmation');
      } else if (event.data === 'navigate-to-landing') {
        setCurrentPage('landing');
      } else if (event.data === 'navigate-to-dashboard') {
        setCurrentPage('dashboard');
      } else if (event.data === 'navigate-to-smart-resume-studio') {
        setCurrentPage('smart-resume-studio');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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

  if (currentPage === 'smart-resume-studio') {
    return (
      <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
        <iframe
          src="/smart-resume-studio.html"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block'
          }}
          title="Smart Resume Studio"
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
