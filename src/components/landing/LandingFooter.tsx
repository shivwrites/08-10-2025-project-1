import { Link } from 'react-router-dom';

export default function LandingFooter() {
  return (
    <footer
      className="relative bg-cover bg-center pt-8 sm:pt-12"
      style={{
        backgroundImage: "url('https://ik.imagekit.io/fdd16n9cy/di.png?updatedAt=1757770843990')",
      }}
    >
      {/* Overlay to brighten the background image */}
      <div className="absolute inset-0 bg-white/40 z-0"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="bg-white/80 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-xl"
          style={{
            border: '1px solid rgba(255, 255, 255, 0.18)',
          }}
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
            <div className="max-w-3xl mb-8 md:mb-0">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 text-indigo-600">
                Empower Your Career Journey Today
              </h2>
              <p className="text-base sm:text-lg text-slate-600">
                Join thousands transforming their careers with our innovative AI-driven platform.
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/signup"
                className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors duration-300 shadow-sm"
              >
                Subscribe
              </Link>
              <button className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-md hover:bg-indigo-50 transition-colors duration-300">
                Contact
              </button>
            </div>
          </div>

          {/* Footer Links Section */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-16">
            {/* Resources */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-indigo-600">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    Blog Posts
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    Terms of Use
                  </a>
                </li>
              </ul>
            </div>
            {/* Company */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-indigo-600">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    Press Releases
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <Link to="/dashboard" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            {/* Connect */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-indigo-600">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    Facebook
                  </a>
                </li>
                <li>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    YouTube
                  </a>
                </li>
              </ul>
            </div>
            {/* Community */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-indigo-600">Community</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    User Forum
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    Feedback
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    Events
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    Webinars
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    Workshops
                  </a>
                </li>
              </ul>
            </div>
            {/* Newsletters */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-indigo-600">Newsletters</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    Join Our Community
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    Stay Updated
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    Get Involved
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    Share Your Story
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    Explore Opportunities
                  </a>
                </li>
              </ul>
            </div>
            {/* Legal */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-indigo-600">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    Accessibility
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    User Agreement
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    Sitemap
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="mt-16 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2">
                <svg
                  className="h-8 w-auto text-indigo-600"
                  viewBox="0 0 32 32"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M4 4H20V20H4V4Z" />
                  <path d="M12 12H28V28H12V12Z" fillOpacity="0.7" />
                </svg>
                <span className="font-bold text-xl text-slate-900">Career Clarified</span>
              </Link>

              {/* Overlapping Avatars */}
              <div className="flex -space-x-4">
                <img
                  className="inline-block h-12 w-12 rounded-full ring-2 ring-white"
                  src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="User 1"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://placehold.co/48x48/E0E0E0/000000?text=U1';
                  }}
                />
                <img
                  className="inline-block h-12 w-12 rounded-full ring-2 ring-white"
                  src="https://images.unsplash.com/photo-1550525811-e586910b323f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="User 2"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://placehold.co/48x48/E0E0E0/000000?text=U2';
                  }}
                />
                <img
                  className="inline-block h-12 w-12 rounded-full ring-2 ring-white"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="User 3"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://placehold.co/48x48/E0E0E0/000000?text=U3';
                  }}
                />
                <img
                  className="inline-block h-12 w-12 rounded-full ring-2 ring-white"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="User 4"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://placehold.co/48x48/E0E0E0/000000?text=U4';
                  }}
                />
                <div className="flex items-center justify-center h-12 w-12 rounded-full ring-2 ring-white bg-gray-200 text-gray-600 font-semibold">
                  +99
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-between items-center space-y-4 space-y-reverse sm:space-y-0">
              <p className="text-sm text-slate-500">© 2025 Career Clarified. All rights reserved.</p>
              <div className="flex space-x-4">
                {/* Social Icons */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-indigo-600 transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-indigo-600 transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-indigo-600 transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.793 2.013 10.147 2 12.315 2zm-1.163 1.943h.001c-2.296 0-2.586.01-3.486.05-1.178.05-1.84.21-2.494.45-1.025.38-1.88.94-2.73 1.78a6.8 6.8 0 00-1.78 2.73c-.24 1.15-.4 1.81-.45 2.49-.04 1.02-.05 1.28-.05 3.48s.01 2.46.05 3.48c.05 1.18.21 1.84.45 2.49.38 1.02.94 1.88 1.78 2.73a6.8 6.8 0 002.73 1.78c1.15.24 1.81.4 2.49.45 1.02.04 1.28.05 3.48.05s2.46-.01 3.48-.05c1.18-.05 1.84-.21 2.49-.45.99-.38 1.84-.94 2.73-1.78.79-.85 1.35-1.7 1.78-2.73.24-1.15.4-1.81.45-2.49.04-1.02.05-1.28.05-3.48s-.01-2.46-.05-3.48c-.05-1.18-.21-1.84-.45-2.49-.38-.99-.94-1.84-1.78-2.73-.85-.79-1.7-1.35-2.73-1.78-1.15-.24-1.81-.4-2.49-.45-1.02-.04-1.28-.05-3.48-.05zm-4.4 2.61a5.4 5.4 0 1110.8 0 5.4 5.4 0 01-10.8 0zM12 15.11a3.11 3.11 0 100-6.22 3.11 3.11 0 000 6.22zm4.3-8.11a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-indigo-600 transition-colors"
                  aria-label="YouTube"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.701V8.115l6.5 4.333-6.5 4.437z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}



