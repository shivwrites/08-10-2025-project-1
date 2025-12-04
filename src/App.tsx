import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy load components for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));
const DashboardHome = lazy(() => import('./pages/DashboardHome'));
const ResumeStudio = lazy(() => import('./pages/ResumeStudio'));
const ApplicationTailor = lazy(() => import('./pages/ApplicationTailor'));
const CoverLetterGenerator = lazy(() => import('./pages/CoverLetterGenerator'));
const JobFinder = lazy(() => import('./pages/JobFinder'));
const JobTracker = lazy(() => import('./pages/JobTracker'));
const InterviewPrep = lazy(() => import('./pages/InterviewPrep'));
const WorkHistoryManager = lazy(() => import('./pages/WorkHistoryManager'));
const BrandAudit = lazy(() => import('./pages/BrandAudit'));
const ContentEngine = lazy(() => import('./pages/ContentEngine'));
const AICareerPortfolio = lazy(() => import('./pages/AICareerPortfolio'));
const CareerEventScout = lazy(() => import('./pages/CareerEventScout'));
const UpskillingDashboard = lazy(() => import('./pages/UpskillingDashboard'));
const SkillRadar = lazy(() => import('./pages/SkillRadar'));
const LearningPath = lazy(() => import('./pages/LearningPath'));
const Sprints = lazy(() => import('./pages/Sprints'));
const Certifications = lazy(() => import('./pages/Certifications'));
const SkillBenchmarking = lazy(() => import('./pages/SkillBenchmarking'));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-indigo-600 font-medium">Loading Application...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Landing page - outside DashboardLayout */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth routes - outside DashboardLayout */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Dashboard routes with layout - Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              
              {/* Career Hub Routes */}
              <Route path="resume-studio" element={<ResumeStudio />} />
              <Route path="application-tailor" element={<ApplicationTailor />} />
              <Route path="cover-letter" element={<CoverLetterGenerator />} />
              <Route path="job-finder" element={<JobFinder />} />
              <Route path="job-tracker" element={<JobTracker />} />
              <Route path="interview-prep" element={<InterviewPrep />} />
              <Route path="work-history" element={<WorkHistoryManager />} />
              
              {/* Brand Building Routes */}
              <Route path="brand-audit" element={<BrandAudit />} />
              <Route path="content-engine" element={<ContentEngine />} />
              <Route path="portfolio" element={<AICareerPortfolio />} />
              <Route path="event-scout" element={<CareerEventScout />} />
              
              {/* Upskilling Routes */}
              <Route path="upskilling" element={<UpskillingDashboard />} />
              <Route path="skill-radar" element={<SkillRadar />} />
              <Route path="learning-path" element={<LearningPath />} />
              <Route path="sprints" element={<Sprints />} />
              <Route path="certifications" element={<Certifications />} />
              <Route path="benchmarking" element={<SkillBenchmarking />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
