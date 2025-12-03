import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
                  {!isSubmitted ? (
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
                  ) : (
                    <div className="space-y-6">
                      {/* Success Message */}
                      <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">Check your email</h3>
                        <p className="mt-2 text-sm text-gray-600">
                          We've sent password reset instructions to <span className="font-medium text-gray-900">{email}</span>
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                          Didn't receive the email? Check your spam folder or try again.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <p className="mt-8 text-center text-sm text-gray-500">
                    <Link to="/login" className="flex items-center justify-center gap-2 font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                      <ArrowLeft className="w-5 h-5" />
                      Back to log in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

