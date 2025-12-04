import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-2" id="page-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`transition-all duration-300 rounded-full ${
            isScrolled
              ? 'bg-white shadow-lg border-none'
              : 'bg-white/25 backdrop-blur-md border border-white/18'
          }`}
          id="header-container"
        >
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center space-x-2">
              <svg
                className="h-8 w-auto text-indigo-600"
                viewBox="0 0 32 32"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4 4H20V20H4V4Z"></path>
                <path d="M12 12H28V28H12V12Z" fillOpacity="0.7"></path>
              </svg>
              <span className="text-lg font-bold text-slate-800">Career Clarified</span>
            </Link>
            
            <nav className="hidden md:flex items-center justify-center flex-1 space-x-8">
              <a href="#benefits" className="text-lg text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Benefits
              </a>
              <a href="#" className="text-lg text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Pricing
              </a>
              <a href="#success-stories" className="text-lg text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Success Stories
              </a>
              <a href="#" className="text-lg text-slate-600 hover:text-slate-900 font-medium transition-colors">
                FAQ
              </a>
            </nav>
            
            <div className="hidden md:flex items-center space-x-2">
              <Link
                to="/login"
                className="bg-indigo-50 text-slate-900 px-4 py-2 rounded-full font-medium transition-colors border border-slate-200 hover:bg-indigo-100"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-600 text-white px-4 py-2 rounded-full font-medium transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/40"
              >
                Sign Up
              </Link>
            </div>
            
            <button
              className="md:hidden text-slate-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full mt-2 left-0 right-0 p-2">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/18">
            <nav className="flex flex-col p-4 space-y-2">
              <a
                href="#benefits"
                className="text-lg text-slate-600 hover:text-slate-900 font-medium transition-colors p-2 text-center rounded-lg hover:bg-slate-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Benefits
              </a>
              <a
                href="#"
                className="text-lg text-slate-600 hover:text-slate-900 font-medium transition-colors p-2 text-center rounded-lg hover:bg-slate-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="#success-stories"
                className="text-lg text-slate-600 hover:text-slate-900 font-medium transition-colors p-2 text-center rounded-lg hover:bg-slate-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Success Stories
              </a>
              <a
                href="#"
                className="text-lg text-slate-600 hover:text-slate-900 font-medium transition-colors p-2 text-center rounded-lg hover:bg-slate-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </a>
              <div className="flex flex-col items-center space-y-4 pt-4 border-t border-slate-200">
                <Link
                  to="/login"
                  className="w-full bg-indigo-50 text-slate-900 px-4 py-2 rounded-full font-medium transition-colors border border-slate-200 hover:bg-indigo-100 text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-full font-medium transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/40 text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}



