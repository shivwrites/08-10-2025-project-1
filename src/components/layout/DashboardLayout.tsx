import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

export default function DashboardLayout() {
  const location = useLocation();
  
  // State for mobile sidebar visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State for dropdown menus - all open by default
  const [openDropdowns, setOpenDropdowns] = useState<string[]>(['career-hub', 'brand-building', 'upskilling']);

  // Toggle dropdown menu
  const toggleDropdown = (menuName: string) => {
    setOpenDropdowns(prev => 
      prev.includes(menuName)
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  // Check if a path is active
  const isActive = (path: string) => location.pathname === `/dashboard${path}`;
  const isDashboardHome = location.pathname === '/dashboard';

  // Link style helper
  const getLinkClass = (path: string) => {
    const active = isActive(path);
    return `sidebar-link flex items-center space-x-4 px-3 py-2 text-sm font-medium rounded-lg group transition-colors ${
      active 
        ? 'bg-indigo-100 text-indigo-700' 
        : 'text-slate-600 hover:bg-slate-100'
    }`;
  };

  return (
    <div 
      className="flex h-screen overflow-hidden" 
      style={{ 
        backgroundImage: "url('https://ik.imagekit.io/fdd16n9cy/di.png?updatedAt=1757770843990')", 
        backgroundSize: 'cover', 
        backgroundAttachment: 'fixed' 
      }}
    >
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside 
        id="sidebar" 
        className={`
          fixed lg:relative inset-y-0 left-0 z-40
          w-[16.5rem] bg-white/50 backdrop-blur-xl border-r border-white/30 
          flex flex-col flex-shrink-0
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="logo-container flex items-center justify-between p-4 h-20 flex-shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <svg className="h-8 w-auto text-indigo-600" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H20V20H4V4Z"></path>
              <path d="M12 12H28V28H12V12Z" fillOpacity="0.7"></path>
            </svg>
            <span className="sidebar-text">Career Clarified</span>
          </Link>
          {/* Close button for mobile */}
          <button 
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-6 custom-scrollbar overflow-y-auto">
          <div>
            <h3 className="px-3 mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 sidebar-text">Overview</h3>
            <Link 
              to="/dashboard" 
              className={`sidebar-link flex items-center space-x-4 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                isDashboardHome ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              <span className="sidebar-text">Dashboard</span>
            </Link>
          </div>

          {/* Career Hub Dropdown */}
          <div className="dropdown-container">
            <button 
              onClick={() => toggleDropdown('career-hub')}
              className="dropdown-toggle flex items-center justify-between w-full p-3 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 sidebar-text">Career Hub</h3>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={`dropdown-chevron text-slate-500 transition-transform duration-200 ${openDropdowns.includes('career-hub') ? 'rotate-90' : ''}`}
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            {openDropdowns.includes('career-hub') && (
              <div className="dropdown-content pl-4 pt-1 space-y-1">
                <Link to="/dashboard/resume-studio" className={getLinkClass('/resume-studio')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-indigo-600 flex-shrink-0"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="m18 13-3.5 3.5a2 2 0 0 1-2.82 0L10 15"/><path d="m15 16 4 4"/></svg>
                  <span className="sidebar-text">Smart Resume Studio</span>
                </Link>
                <Link to="/dashboard/application-tailor" className={getLinkClass('/application-tailor')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-indigo-600 flex-shrink-0"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                  <span className="sidebar-text">Application Tailor</span>
                </Link>
                <Link to="/dashboard/cover-letter" className={getLinkClass('/cover-letter')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-indigo-600 flex-shrink-0"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <span className="sidebar-text">Cover Letter Generator</span>
                </Link>
                <Link to="/dashboard/job-finder" className={getLinkClass('/job-finder')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-indigo-600 flex-shrink-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <span className="sidebar-text">Job Finder</span>
                </Link>
                <Link to="/dashboard/job-tracker" className={getLinkClass('/job-tracker')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-indigo-600 flex-shrink-0"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><path d="M8 10v4"/><path d="M12 10v2"/><path d="M16 10v6"/></svg>
                  <span className="sidebar-text">Job Tracker</span>
                </Link>
                <Link to="/dashboard/interview-prep" className={getLinkClass('/interview-prep')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-indigo-600 flex-shrink-0"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>
                  <span className="sidebar-text">Interview Prep Kit</span>
                </Link>
                <Link to="/dashboard/work-history" className={getLinkClass('/work-history')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-indigo-600 flex-shrink-0"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  <span className="sidebar-text">Work History Manager</span>
                </Link>
              </div>
            )}
          </div>

          {/* Brand Building Dropdown */}
          <div className="dropdown-container">
            <button 
              onClick={() => toggleDropdown('brand-building')}
              className="dropdown-toggle flex items-center justify-between w-full p-3 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 sidebar-text">Brand Building</h3>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={`dropdown-chevron text-slate-500 transition-transform duration-200 ${openDropdowns.includes('brand-building') ? 'rotate-90' : ''}`}
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            {openDropdowns.includes('brand-building') && (
              <div className="dropdown-content pl-4 pt-1 space-y-1">
                <Link to="/dashboard/brand-audit" className={getLinkClass('/brand-audit')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-indigo-600 flex-shrink-0"><path d="M3 6V3h3"/><path d="M18 3h3v3"/><path d="M3 18v3h3"/><path d="M18 18h3v3"/><path d="M7 12h10"/></svg>
                  <span className="sidebar-text">AI Personal Brand Audit</span>
                </Link>
                <Link to="/dashboard/content-engine" className={getLinkClass('/content-engine')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-indigo-600 flex-shrink-0"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                  <span className="sidebar-text">Content Engine</span>
                </Link>
                <Link to="/dashboard/portfolio" className={getLinkClass('/portfolio')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-indigo-600 flex-shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                  <span className="sidebar-text">AI Career Portfolio</span>
                </Link>
                <Link to="/dashboard/event-scout" className={getLinkClass('/event-scout')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-indigo-600 flex-shrink-0"><path d="M14 19a6 6 0 0 0-12 0"/><circle cx="8" cy="10" r="4"/><path d="M22 19a6 6 0 0 0-6-6 4 4 0 1 0 0-8"/></svg>
                  <span className="sidebar-text">Career Event Scout</span>
                </Link>
              </div>
            )}
          </div>

          {/* Upskilling Dropdown */}
          <div className="dropdown-container">
            <button 
              onClick={() => toggleDropdown('upskilling')}
              className="dropdown-toggle flex items-center justify-between w-full p-3 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 sidebar-text">Upskilling</h3>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={`dropdown-chevron text-slate-500 transition-transform duration-200 ${openDropdowns.includes('upskilling') ? 'rotate-90' : ''}`}
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            {openDropdowns.includes('upskilling') && (
              <div className="dropdown-content pl-4 pt-1 space-y-1">
                <Link to="/dashboard/upskilling" className={getLinkClass('/upskilling')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-indigo-600 flex-shrink-0"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                  <span className="sidebar-text">Upskilling Dashboard</span>
                </Link>
                <Link to="/dashboard/skill-radar" className={getLinkClass('/skill-radar')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-indigo-600 flex-shrink-0"><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62A10 10 0 1 0 21.71 9.62"/><path d="M12 12v10"/><path d="M15.21 15.21A5 5 0 0 0 12 12"/></svg>
                  <span className="sidebar-text">Skill Radar</span>
                </Link>
                <Link to="/dashboard/learning-path" className={getLinkClass('/learning-path')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-indigo-600 flex-shrink-0"><path d="M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4 4V8a2 2 0 0 0-2-2z"/><path d="M12 13v8"/><path d="M12 3v3"/></svg>
                  <span className="sidebar-text">Learning Path</span>
                </Link>
                <Link to="/dashboard/sprints" className={getLinkClass('/sprints')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-indigo-600 flex-shrink-0"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  <span className="sidebar-text">Sprints</span>
                </Link>
                <Link to="/dashboard/certifications" className={getLinkClass('/certifications')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-indigo-600 flex-shrink-0"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                  <span className="sidebar-text">Certifications</span>
                </Link>
                <Link to="/dashboard/benchmarking" className={getLinkClass('/benchmarking')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-indigo-600 flex-shrink-0"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M14 15V9h-6"/><path d="M21 3h-6v6h6V3z"/></svg>
                  <span className="sidebar-text">Skill Benchmarking</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
        <div className="border-t border-white/30 p-2 flex items-center mt-auto flex-shrink-0">
          <button 
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300"><path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/></svg>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden main-bg-color" style={{ backgroundColor: '#dee5fb' }}>
        <div className="flex-1 relative overflow-y-auto custom-scrollbar">
          <div id="scroll-fade-overlay"></div>
          {/* Persistent Navigation Bar */}
          <header className="sticky top-6 z-10 max-w-7xl mx-auto w-full flex items-center justify-between gap-4 h-20 pl-4 lg:pl-6 pr-2 bg-white/50 backdrop-blur-xl flex-shrink-0 rounded-full shadow-lg border border-white/30 mt-6 mb-5">
            {/* Mobile menu button */}
            <button 
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
              </svg>
            </button>

            {/* Header Title */}
            <div id="header-title" className="flex items-center gap-3 flex-shrink-0">
              <div id="header-icon-container" className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              </div>
              <div className="hidden sm:block">
                <h1 id="header-main-title" className="text-xl font-bold text-slate-900">AI Mentor for Brand Growth</h1>
                <p id="header-subtitle" className="text-slate-600 text-xs mt-1">Your personal AI coach for career and brand development</p>
              </div>
            </div>

            {/* Central Search Bar */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-slate-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
                <input 
                  type="text" 
                  id="search-input" 
                  placeholder="Search features, jobs, or content..." 
                  className="w-full h-12 pl-11 pr-4 bg-white/50 border border-transparent rounded-full focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-300"
                />
                <button 
                  id="search-button" 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-indigo-600 hover:text-indigo-800"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Shortcuts Container */}
              <div id="shortcuts-container">
                {/* Dropped shortcuts will appear here */}
              </div>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button id="user-menu-button" className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <img id="user-avatar" src="https://placehold.co/64x64/e2e8f0/64748b?text=U" className="w-full h-full rounded-full object-cover" alt="User avatar" />
                </button>
                {/* Notification Badge on User Icon */}
                <span id="user-icon-notification-badge" className="absolute top-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold transform translate-x-1/4 -translate-y-1/4 ring-2 ring-white notification-ring hidden"></span>

                <div id="user-menu" className="absolute right-0 mt-2 w-64 rounded-2xl shadow-lg border border-white/30 p-4 hidden z-50">
                  <div className="flex items-center gap-3 mb-4">
                    <img id="user-avatar-dropdown" src="https://placehold.co/48x48/e2e8f0/64748b?text=U" className="w-12 h-12 rounded-full object-cover" alt="User avatar" />
                    <div>
                      <h4 className="font-semibold text-slate-800">User Name</h4>
                      <button id="upload-photo-button" className="text-xs text-indigo-600 hover:underline">Upload Photo</button>
                      <input type="file" id="photo-upload" className="hidden" accept="image/*" />
                    </div>
                  </div>
                  <div className="border-t border-slate-200 pt-2 space-y-2">
                    <button id="notification-menu-button" className="user-menu-item group w-full text-left text-sm text-slate-700 rounded-md p-2 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-500 dark:text-slate-400"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                      <span>Notifications</span>
                      {/* Notification Badge in Dropdown */}
                      <span id="dropdown-notification-badge" className="ml-auto bg-indigo-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full hidden"></span>
                    </button>
                    <button id="edit-shortcuts-button" className="user-menu-item group w-full text-left text-sm text-slate-700 rounded-md p-2 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-500 dark:text-slate-400"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                      <span>Customize Shortcuts</span>
                    </button>
                    <div id="dark-mode-row" className="user-menu-item group w-full text-left text-sm text-slate-700 rounded-md p-2 flex items-center justify-between gap-2 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-500 dark:text-slate-400"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                        <span>Dark Mode</span>
                      </div>
                      <button id="dark-mode-toggle" className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-slate-200">
                        <span className="sr-only">Enable dark mode</span>
                        <span className="inline-block w-4 h-4 transform bg-white rounded-full transition-transform translate-x-1"></span>
                      </button>
                    </div>
                    <button id="settings-button" className="user-menu-item group w-full text-left text-sm text-slate-700 rounded-md p-2 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-500 dark:text-slate-400"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                      <span>Settings</span>
                    </button>
                    <button id="signout-button" className="user-menu-item group w-full text-left text-sm text-slate-700 rounded-md p-2 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-500 dark:text-slate-400"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>
          
          {/* Main Content Area - Outlet for nested routes */}
          <div id="main-padding-wrapper" className="px-6 md:px-8 pb-6 relative z-0">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
