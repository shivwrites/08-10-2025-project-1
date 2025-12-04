import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, supabase } from '../lib/supabase';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const { data, error } = await auth.signUp(email, password, name);

      if (error) {
        // Handle specific error types
        let errorMessage = error.message;
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_NAME_NOT_RESOLVED')) {
          errorMessage = 'Network error: Cannot connect to Supabase. Please check your internet connection and verify your Supabase project is active.';
        }
        setError(errorMessage);
        console.error('Sign up error:', error);
      } else if (data) {
        setSuccess(true);
      } else {
        setError('No data returned from sign up. Please try again.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_NAME_NOT_RESOLVED')) {
        setError('Network error: Cannot connect to Supabase. Please check your internet connection and verify your Supabase project is active.');
      } else {
        setError(errorMessage);
      }
      console.error('Sign up exception:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error) {
      // Handle error (e.g., setError state)
      console.error("LinkedIn signup error:", error);
      setError(error instanceof Error ? error.message : 'Failed to sign up with LinkedIn');
    }
  };

  const handleGoogleSignup = () => {
    // TODO: Implement Google signup
    alert('Google signup coming soon');
  };

  const handleResendEmail = async () => {
    if (!email) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Resend confirmation email by calling signUp again
      const { data, error } = await auth.signUp(email, password, name);

      if (error) {
        setError(error.message);
      } else {
        // Show success feedback (you could add a toast here)
        alert('Confirmation email has been resent!');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEmailApp = () => {
    // Open default email client
    window.location.href = 'mailto:';
  };

  return (
    <div style={{
      background: 'linear-gradient(to bottom, #dee5fb, #dee5fb)',
      backgroundImage: 'url("https://ik.imagekit.io/fdd16n9cy/di.png?updatedAt=1757770843990")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      minHeight: '100vh'
    }}>
      <style>{`
        body {
          font-family: 'Inter', sans-serif;
        }

        .section-banner-sun {
          height: 300px;
          width: 300px;
          position: relative;
          transition: left 0.3s linear;
          background-color: #E6E6FA;
          border-radius: 50%;
          animation: shadowPulse 5s ease-in-out infinite, spin 20s linear infinite;
          box-shadow:
            0px 0px 40px 20px #7891D5,
            -5px 0px 10px 1px #E8F0FF inset,
            15px 2px 40px 20px #4D69B4c5 inset,
            -24px -2px 50px 25px #7891D5c2 inset,
            150px 0px 80px 35px #2B448Caa inset;
        }
        .curved-corner-star {
          display: flex;
          position: relative;
        }
        #curved-corner-bottomleft,
        #curved-corner-bottomright,
        #curved-corner-topleft,
        #curved-corner-topright {
          width: 4px;
          height: 5px;
          overflow: hidden;
          position: relative;
        }
        #curved-corner-bottomleft:before,
        #curved-corner-bottomright:before,
        #curved-corner-topleft:before,
        #curved-corner-topright:before {
          content: "";
          display: block;
          width: 200%;
          height: 200%;
          position: absolute;
          border-radius: 50%;
        }
        #curved-corner-bottomleft:before {
          bottom: 0;
          left: 0;
          box-shadow: -5px 5px 0 0 #E8F0FF;
        }
        #curved-corner-bottomright:before {
          bottom: 0;
          right: 0;
          box-shadow: 5px 5px 0 0 #E8F0FF;
        }
        #curved-corner-topleft:before {
          top: 0;
          left: 0;
          box-shadow: -5px -5px 0 0 #E8F0FF;
        }
        #curved-corner-topright:before {
          top: 0;
          right: 0;
          box-shadow: 5px -5px 0 0 #E8F0FF;
        }
        @keyframes twinkling {
          0%, 100% {
            opacity: 0.1;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes shadowPulse {
          0%, 100% {
            box-shadow:
              0px 0px 40px 20px #7891D5,
              -5px 0px 10px 1px #E8F0FF inset,
              15px 2px 40px 20px #4D69B4c5 inset,
              -24px -2px 50px 25px #7891D5c2 inset,
              150px 0px 80px 35px #2B448Caa inset;
          }
          50% {
            box-shadow:
              0px 0px 60px 30px #AEBFE3,
              -5px 0px 20px 5px #E8F0FF inset,
              15px 2px 60px 30px #4D69B4c5 inset,
              -24px -2px 70px 35px #7891D5c2 inset,
              150px 0px 100px 45px #2B448Caa inset;
          }
        }
        #star-1 {
          position: absolute;
          left: -20px;
          animation: twinkling 3s infinite;
        }
        #star-2 {
          position: absolute;
          left: -40px;
          top: 30px;
          animation: twinkling 2s infinite;
        }
        #star-3 {
          position: absolute;
          left: 350px;
          top: 90px;
          animation: twinkling 4s infinite;
        }
        #star-4 {
          position: absolute;
          left: 200px;
          top: 290px;
          animation: twinkling 3s infinite;
        }
        #star-5 {
          position: absolute;
          left: 50px;
          top: 270px;
          animation: twinkling 1.5s infinite;
        }
        #star-6 {
          position: absolute;
          left: 250px;
          top: -50px;
          animation: twinkling 4s infinite;
        }
        #star-7 {
          position: absolute;
          left: 290px;
          top: 60px;
          animation: twinkling 2s infinite;
        }
      `}</style>

      {/* Centering wrapper with background */}
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Card container */}
        <div className={`flex w-full ${success ? 'max-w-md' : 'max-w-6xl'} rounded-2xl shadow-2xl overflow-hidden`}>
          {/* Left Side: Sign Up Form or Email Sent UI */}
          <div className={`w-full ${success ? '' : 'lg:w-1/2'} flex flex-col justify-center py-12 px-4 sm:px-6 ${success ? 'lg:px-8' : 'lg:px-20 xl:px-24'} bg-[#eff2fd] bg-opacity-95`}>
            <div className="mx-auto w-full max-w-sm">
              {success ? (
                /* Email Sent Success UI */
                <div className="text-center">
                  {/* Icon */}
                  <div className="flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Header Section */}
                  <div className="mt-4">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Check your email</h2>
                    <p className="mt-2 text-base text-gray-600">
                      We've sent a confirmation link to <span className="font-semibold text-gray-900">{email}</span>.
                    </p>
                  </div>

                  {/* Action Section */}
                  <div className="mt-8">
                    <button
                      onClick={handleOpenEmailApp}
                      className="flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Open email app
                    </button>
                  </div>
                  
                  {/* Footer Link */}
                  <p className="mt-10 text-center text-sm text-gray-500">
                    Didn't receive the email? 
                    <button
                      onClick={handleResendEmail}
                      disabled={isLoading}
                      className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Click to resend
                    </button>
                  </p>
                  <p className="mt-4 text-center text-sm text-gray-500">
                    <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold leading-6 text-gray-600 hover:text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
                      </svg>
                      Back to log in
                    </Link>
                  </p>
                </div>
              ) : (
                /* Sign Up Form */
                <>
                  {/* Header Section */}
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create an account</h2>
                    <p className="mt-2 text-sm text-indigo-600">
                      Start your 30-day free trial.
                    </p>
                  </div>

                  {/* Form Section */}
                  <div className="mt-8">
                    <div className="mt-6">
                      {error && (
                        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">
                          {error}
                        </div>
                      )}
                      <form onSubmit={handleSignup} className="space-y-6">
                        {/* Name Input */}
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name*</label>
                          <div className="mt-1">
                            <input
                              id="name"
                              name="name"
                              type="text"
                              autoComplete="name"
                              required
                              placeholder="Enter your name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#7F56D9] focus:outline-none focus:ring-[#7F56D9] sm:text-sm"
                            />
                          </div>
                        </div>
                        {/* Email Input */}
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email*</label>
                          <div className="mt-1">
                            <input
                              id="email"
                              name="email"
                              type="email"
                              autoComplete="email"
                              required
                              placeholder="Enter your email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#7F56D9] focus:outline-none focus:ring-[#7F56D9] sm:text-sm"
                            />
                          </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1">
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password*</label>
                          <div className="mt-1">
                            <input
                              id="password"
                              name="password"
                              type="password"
                              autoComplete="new-password"
                              required
                              placeholder="Create a password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#7F56D9] focus:outline-none focus:ring-[#7F56D9] sm:text-sm"
                            />
                          </div>
                          <p className="text-xs text-gray-500">Must be at least 8 characters.</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4 pt-2">
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? 'Creating account...' : 'Get started'}
                          </button>
                          <button
                            type="button"
                            onClick={handleGoogleSignup}
                            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                          >
                            <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            <span>Sign up with Google</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleLinkedInSignup}
                            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                          >
                            <svg className="h-5 w-5" fill="#0A66C2" aria-hidden="true" viewBox="0 0 24 24">
                              <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-4.484 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                            </svg>
                            <span>Sign up with LinkedIn</span>
                          </button>
                        </div>
                      </form>
                      
                      <p className="mt-10 text-center text-sm text-gray-500">
                        Already have an account?
                        <Link to="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 ml-1">
                          Log in
                        </Link>
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Side: Decorative Graphic */}
          {!success && (
            <div className="relative hidden lg:block lg:w-1/2 bg-white bg-opacity-20">
            <div className="absolute inset-0 h-full w-full flex items-center justify-center p-12">
              <div className="relative">
                {/* Sun Animation */}
                <div className="section-banner-sun">
                  <div id="star-1">
                    <div className="curved-corner-star">
                      <div id="curved-corner-bottomright"></div>
                      <div id="curved-corner-bottomleft"></div>
                    </div>
                    <div className="curved-corner-star">
                      <div id="curved-corner-topright"></div>
                      <div id="curved-corner-topleft"></div>
                    </div>
                  </div>
                  <div id="star-2">
                    <div className="curved-corner-star">
                      <div id="curved-corner-bottomright"></div>
                      <div id="curved-corner-bottomleft"></div>
                    </div>
                    <div className="curved-corner-star">
                      <div id="curved-corner-topright"></div>
                      <div id="curved-corner-topleft"></div>
                    </div>
                  </div>
                  <div id="star-3">
                    <div className="curved-corner-star">
                      <div id="curved-corner-bottomright"></div>
                      <div id="curved-corner-bottomleft"></div>
                    </div>
                    <div className="curved-corner-star">
                      <div id="curved-corner-topright"></div>
                      <div id="curved-corner-topleft"></div>
                    </div>
                  </div>
                  <div id="star-4">
                    <div className="curved-corner-star">
                      <div id="curved-corner-bottomright"></div>
                      <div id="curved-corner-bottomleft"></div>
                    </div>
                    <div className="curved-corner-star">
                      <div id="curved-corner-topright"></div>
                      <div id="curved-corner-topleft"></div>
                    </div>
                  </div>
                  <div id="star-5">
                    <div className="curved-corner-star">
                      <div id="curved-corner-bottomright"></div>
                      <div id="curved-corner-bottomleft"></div>
                    </div>
                    <div className="curved-corner-star">
                      <div id="curved-corner-topright"></div>
                      <div id="curved-corner-topleft"></div>
                    </div>
                  </div>
                  <div id="star-6">
                    <div className="curved-corner-star">
                      <div id="curved-corner-bottomright"></div>
                      <div id="curved-corner-bottomleft"></div>
                    </div>
                    <div className="curved-corner-star">
                      <div id="curved-corner-topright"></div>
                      <div id="curved-corner-topleft"></div>
                    </div>
                  </div>
                  <div id="star-7">
                    <div className="curved-corner-star">
                      <div id="curved-corner-bottomright"></div>
                      <div id="curved-corner-bottomleft"></div>
                    </div>
                    <div className="curved-corner-star">
                      <div id="curved-corner-topright"></div>
                      <div id="curved-corner-topleft"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Signup;



