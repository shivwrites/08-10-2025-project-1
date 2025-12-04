import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleResetPassword = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
    }
    setIsLoading(true);
    
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // On success, show success message
      setIsSubmitted(true);
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setIsSubmitted(false);
    handleResetPassword();
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
      `}</style>

      {/* Centering wrapper with background */}
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Card container */}
        <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
          {/* Forgot Password Form */}
          <div className="w-full flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#eff2fd] bg-opacity-95">
            <div className="mx-auto w-full max-w-sm">
              {!isSubmitted ? (
                <>
                  {/* Header Section */}
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Forgot password?</h2>
                    <p className="mt-2 text-sm text-gray-600">
                      No worries, we'll send you reset instructions.
                    </p>
                  </div>

                  {/* Form Section */}
                <div className="mt-8">
                  <div className="mt-6">
                    <form onSubmit={handleResetPassword} className="space-y-6">
                      {/* Email Input */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-4 pt-2">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Sending reset email...' : 'Reset password'}
                        </button>
                      </div>
                    </form>
                    
                    <p className="mt-8 text-center text-sm text-gray-500">
                      <Link to="/login" className="flex items-center justify-center gap-2 font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                        <ArrowLeft className="w-5 h-5" />
                        Back to log in
                      </Link>
                    </p>
                  </div>
                </div>
                </>
              ) : (
                <div className="mx-auto w-full max-w-sm text-center">
                  {/* Icon */}
                  <div className="flex justify-center">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 overflow-hidden">
                      {/* Email Icon */}
                      <svg 
                        className="email-icon-animated h-6 w-6 text-indigo-600" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth="1.5" 
                        stroke="currentColor" 
                        aria-hidden="true"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" 
                        />
                      </svg>
                      {/* Checkmark Icon */}
                      <svg 
                        className="checkmark-icon-animated h-7 w-7 text-indigo-600 absolute opacity-0" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth="2.5" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M4.5 12.75l6 6 9-13.5" 
                        />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Header Section */}
                  <div className="mt-4">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Check your email</h2>
                    <p className="mt-4 text-base text-gray-600">
                      We've sent password reset instructions to your email address.
                    </p>
                  </div>

                  {/* Footer Links */}
                  <div className="mt-10 space-y-4">
                    <p className="text-center text-sm text-gray-500">
                      Didn't receive the email?&nbsp;
                      <button
                        onClick={handleResend}
                        className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 cursor-pointer"
                      >
                        Click to resend
                      </button>
                    </p>
                    <p className="text-center text-sm text-gray-500">
                      <Link 
                        to="/login" 
                        className="inline-flex items-center justify-center gap-1.5 font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20" 
                          fill="currentColor" 
                          className="w-5 h-5"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                        Back to log in
                      </Link>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;


