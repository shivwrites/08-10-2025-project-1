import { useState, useEffect, useCallback } from 'react';
import { 
  Search, Briefcase, MapPin, DollarSign, Calendar, Building2, 
  ExternalLink, BookmarkPlus, Check, ChevronDown, X, Loader2, 
  Star, Clock, Users, FileText, Upload, Sparkles, Target, TrendingUp, 
  AlertCircle, Zap, BarChart3
} from 'lucide-react';
import {
  getJobRecommendations,
  predictSalary,
  calculateSuccessProbability,
  generateJobAlerts,
  calculateQuickMatchScore,
  type JobRecommendation,
  type ResumeProfile,
  type SalaryPrediction,
  type SuccessProbability,
  type JobAlert
} from '../lib/predictiveJobMatching';

// --- Types ---
interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  requirements: string;
  postedDate: string;
  url: string;
  source: string;
  matchScore: number;
  whyMatch?: string;
}

interface Filters {
  datePosted: string;
  experienceLevel: string;
  remote: string;
  salaryRange: string;
}

interface ResumeFilters {
  workType: string;
  remote: string;
  experienceLevel: string;
  minSalary: string;
  location: string;
}

interface TrackedJob {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchScore: number;
  postedDate: string;
  source: string;
  status: string;
  notes: string;
  applicationDate: string;
  interviewDate: string;
  contacts: string;
  url: string;
  whyMatch?: string;
  description?: string;
  addedFrom: string;
  addedAt: string;
}

interface ResumeData {
  personalInfo?: {
    name?: string;
    email?: string;
    location?: string;
  };
  skills?: {
    technical?: string[];
    soft?: string[];
  };
  experience?: Array<{
    position?: string;
    company?: string;
    description?: string;
  }>;
  summary?: string;
}

// --- Job Tracking Utilities ---
const JobTrackingUtils = {
  getAllTrackedJobs(): TrackedJob[] {
    try {
      const stored = localStorage.getItem('tracked_jobs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveTrackedJobs(jobs: TrackedJob[]): boolean {
    try {
      localStorage.setItem('tracked_jobs', JSON.stringify(jobs));
      localStorage.setItem('tracked_jobs_last_updated', Date.now().toString());
      return true;
    } catch {
      return false;
    }
  },

  addJobToTracker(job: Job, source = 'job-finder', status = 'new-leads'): { success: boolean; message: string; duplicate?: boolean; job?: TrackedJob } {
    const trackedJobs = this.getAllTrackedJobs();
    
    const isDuplicate = trackedJobs.some(tracked => {
      const urlMatch = tracked.url && job.url && tracked.url.toLowerCase() === job.url.toLowerCase();
      const titleCompanyMatch = tracked.title === job.title && tracked.company === job.company;
      return urlMatch || titleCompanyMatch;
    });

    if (isDuplicate) {
      return { success: false, message: 'This job is already being tracked', duplicate: true };
    }

    const trackerJob: TrackedJob = {
      id: Date.now() + Math.random(),
      title: job.title || 'Untitled Position',
      company: job.company || 'Unknown Company',
      location: job.location || 'Not specified',
      salary: job.salary || 'Competitive',
      matchScore: job.matchScore || 0,
      postedDate: job.postedDate || new Date().toISOString().split('T')[0],
      source: job.source || source,
      status: status,
      notes: job.whyMatch ? `Why this matches: ${job.whyMatch}` : '',
      applicationDate: '',
      interviewDate: '',
      contacts: '',
      url: job.url || '#',
      whyMatch: job.whyMatch || '',
      description: job.description,
      addedFrom: source,
      addedAt: new Date().toISOString()
    };

    trackedJobs.push(trackerJob);
    this.saveTrackedJobs(trackedJobs);

    return { success: true, message: 'Job added to tracker!', job: trackerJob };
  },

  isJobTracked(job: Job): boolean {
    const trackedJobs = this.getAllTrackedJobs();
    return trackedJobs.some(tracked => {
      const urlMatch = tracked.url && job.url && tracked.url.toLowerCase() === job.url.toLowerCase();
      const titleCompanyMatch = tracked.title === job.title && tracked.company === job.company;
      return urlMatch || titleCompanyMatch;
    });
  },

  bulkAddJobs(jobs: Job[], source = 'job-finder', minMatchScore = 0): { total: number; added: number; duplicates: number } {
    const filteredJobs = minMatchScore > 0 ? jobs.filter(job => (job.matchScore || 0) >= minMatchScore) : jobs;
    let added = 0;
    let duplicates = 0;

    filteredJobs.forEach(job => {
      const result = this.addJobToTracker(job, source, 'new-leads');
      if (result.success) added++;
      if (result.duplicate) duplicates++;
    });

    return { total: filteredJobs.length, added, duplicates };
  }
};

// --- Location Database ---
const locationDatabase = [
  'Remote', 'Remote, Worldwide',
  'Hyderabad, Telangana, India', 'Mumbai, Maharashtra, India', 'Delhi, India',
  'Bangalore, Karnataka, India', 'Chennai, Tamil Nadu, India', 'Pune, Maharashtra, India',
  'New York, NY, United States', 'Los Angeles, CA, United States', 'San Francisco, CA, United States',
  'Chicago, IL, United States', 'Boston, MA, United States', 'Seattle, WA, United States',
  'Austin, TX, United States', 'Denver, CO, United States', 'Miami, FL, United States',
  'London, England, United Kingdom', 'Manchester, England, United Kingdom', 'Berlin, Germany',
  'Paris, France', 'Amsterdam, Netherlands', 'Toronto, Ontario, Canada', 'Vancouver, BC, Canada',
  'Sydney, NSW, Australia', 'Melbourne, VIC, Australia', 'Singapore', 'Tokyo, Japan',
  'Dubai, United Arab Emirates'
];

// --- Job Titles Database ---
const jobTitlesDatabase = [
  'Software Engineer', 'Senior Software Engineer', 'Full Stack Developer',
  'Frontend Developer', 'Backend Developer', 'DevOps Engineer',
  'Data Scientist', 'Data Analyst', 'Business Analyst',
  'Product Manager', 'Senior Product Manager', 'Technical Product Manager',
  'Project Manager', 'Program Manager', 'Scrum Master',
  'UX Designer', 'UI Designer', 'Product Designer',
  'Marketing Manager', 'Digital Marketing Manager', 'Content Marketing Manager',
  'Sales Manager', 'Business Development Manager', 'Account Manager',
  'Machine Learning Engineer', 'AI Engineer', 'Cloud Engineer',
  'QA Engineer', 'Test Engineer', 'Security Engineer'
];

// --- Mock Job Generator ---
const generateMockJobs = (query: string, location: string, count = 15): Job[] => {
  const companies = ['TechCorp', 'InnovateLabs', 'DataSystems Inc', 'CloudFirst', 'NextGen Solutions', 
    'GlobalTech', 'StartupXYZ', 'Enterprise Co', 'Digital Ventures', 'AI Innovations',
    'FutureTech', 'CodeMasters', 'ByteWorks', 'TechPioneers', 'SmartSolutions'];
  const types = ['Full-time', 'Part-time', 'Contract', 'Remote'];
  const sources = ['LinkedIn', 'Indeed', 'Glassdoor', 'Company Website', 'AngelList'];
  
  return Array.from({ length: count }, (_, i) => {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const matchScore = Math.floor(Math.random() * 25) + 75;
    const daysAgo = Math.floor(Math.random() * 14);
    const postedDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return {
      id: i + 1,
      title: query || 'Software Engineer',
      company,
      location: location || 'Remote',
      salary: `$${80 + Math.floor(Math.random() * 80)}k - $${140 + Math.floor(Math.random() * 60)}k`,
      type: types[Math.floor(Math.random() * types.length)],
      description: `We are looking for a talented ${query || 'professional'} to join our growing team at ${company}. This role offers exciting opportunities to work on cutting-edge projects, collaborate with talented engineers, and make a significant impact on our products.`,
      requirements: 'Relevant experience, strong communication skills, team collaboration abilities, and a passion for technology. Experience with modern tools and frameworks is preferred.',
      postedDate,
      url: `https://careers.${company.toLowerCase().replace(/\s+/g, '')}.com/jobs/${i + 1}`,
      source: sources[Math.floor(Math.random() * sources.length)],
      matchScore,
      whyMatch: `This role aligns well with your ${query ? `experience in ${query}` : 'background'} and offers excellent growth opportunities.`
    };
  });
};

// --- Main Component ---
const JobFinder = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'search' | 'resumes' | 'results' | 'resume-results'>('search');
  
  // Quick Search state
  const [quickSearchJobTitle, setQuickSearchJobTitle] = useState('');
  const [quickSearchLocation, setQuickSearchLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [jobResults, setJobResults] = useState<Job[]>([]);
  
  // Personalized Search state
  const [personalizedJobResults, setPersonalizedJobResults] = useState<Job[]>([]);
  const [isSearchingPersonalized, setIsSearchingPersonalized] = useState(false);
  const [selectedSearchStrategy, setSelectedSearchStrategy] = useState<string | null>(null);
  
  // Resume state
  const [uploadedResumes, setUploadedResumes] = useState<Record<string, ResumeData>>({});
  const [activeResume, setActiveResume] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  
  // Suggestions state
  const [jobTitleSuggestions, setJobTitleSuggestions] = useState<string[]>([]);
  const [showJobTitleSuggestions, setShowJobTitleSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState<Filters>({
    datePosted: 'Any time',
    experienceLevel: 'Any level',
    remote: 'Any',
    salaryRange: 'Any'
  });
  const [showFilterDropdown, setShowFilterDropdown] = useState<Record<string, boolean>>({});
  
  // Resume filters state
  const [resumeFilters, setResumeFilters] = useState<ResumeFilters>({
    workType: 'Full-time',
    remote: 'Any',
    experienceLevel: 'Any level',
    minSalary: 'Any',
    location: ''
  });
  
  // Tracking state
  const [trackedJobIds, setTrackedJobIds] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Predictive matching state
  const [predictiveRecommendations, setPredictiveRecommendations] = useState<JobRecommendation[]>([]);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [selectedJobForAnalysis, setSelectedJobForAnalysis] = useState<Job | null>(null);
  const [salaryPrediction, setSalaryPrediction] = useState<SalaryPrediction | null>(null);
  const [successProbability, setSuccessProbability] = useState<SuccessProbability | null>(null);
  const [isAnalyzingJob, setIsAnalyzingJob] = useState(false);
  const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([]);

  // Load data on mount
  useEffect(() => {
    // Load tracked jobs
    const tracked = JobTrackingUtils.getAllTrackedJobs();
    setTrackedJobIds(new Set(tracked.map(j => j.url)));
    
    // Load saved resumes
    const savedResumes = localStorage.getItem('parsed_resumes');
    if (savedResumes) {
      const resumes = JSON.parse(savedResumes);
      setUploadedResumes(resumes);
      
      const activeResumeName = localStorage.getItem('active_resume_for_job_search');
      if (activeResumeName && resumes[activeResumeName]) {
        setActiveResume(activeResumeName);
        setResumeData(resumes[activeResumeName]);
      } else if (Object.keys(resumes).length > 0) {
        const firstResume = Object.keys(resumes)[0];
        setActiveResume(firstResume);
        setResumeData(resumes[firstResume]);
      }
    }
  }, []);

  // Show notification
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // Handle job title input
  const handleJobTitleChange = (value: string) => {
    setQuickSearchJobTitle(value);
    if (value.trim().length > 0) {
      const filtered = jobTitlesDatabase.filter(title =>
        title.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10);
      setJobTitleSuggestions(filtered);
      setShowJobTitleSuggestions(true);
    } else {
      setJobTitleSuggestions([]);
      setShowJobTitleSuggestions(false);
    }
  };

  // Handle location input
  const handleLocationChange = (value: string) => {
    setQuickSearchLocation(value);
    if (value.trim().length > 0) {
      const filtered = locationDatabase.filter(loc =>
        loc.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10);
      setLocationSuggestions(filtered);
      setShowLocationSuggestions(true);
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  };

  // Handle filter toggle
  const handleToggleFilter = (filterType: string) => {
    setShowFilterDropdown(prev => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [filterType]: !prev[filterType]
    }));
  };

  // Handle filter selection
  const handleSelectFilter = (filterType: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setShowFilterDropdown({});
  };

  // Quick search
  const handleQuickSearch = async () => {
    if (!quickSearchJobTitle.trim()) {
      showNotification('Please enter a job title', 'error');
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const results = generateMockJobs(quickSearchJobTitle, quickSearchLocation);
    setJobResults(results);
    setIsSearching(false);
    setActiveTab('results');
  };

  // Convert ResumeData to ResumeProfile
  const convertToResumeProfile = (data: ResumeData | null): ResumeProfile | null => {
    if (!data) return null;
    
    return {
      skills: [
        ...(data.skills?.technical || []),
        ...(data.skills?.soft || [])
      ],
      experience: (data.experience || []).map(exp => ({
        title: exp.position || 'Unknown',
        company: exp.company || 'Unknown',
        duration: 'Not specified',
        description: exp.description || ''
      })),
      education: [],
      location: data.personalInfo?.location,
      yearsOfExperience: data.experience?.length || 0,
      industry: undefined,
      currentSalary: undefined
    };
  };

  // Personalized search with predictive matching
  const handlePersonalizedSearch = async () => {
    if (!activeResume || !resumeData) {
      showNotification('Please select a resume first', 'error');
      return;
    }

    setIsSearchingPersonalized(true);
    setIsGeneratingRecommendations(true);
    
    try {
      // Generate mock jobs first
      const recentJob = resumeData.experience?.[0]?.position || 'Software Engineer';
      const mockJobs = generateMockJobs(recentJob, resumeFilters.location || 'Remote', 20);
      
      // Convert to JobListing format
      const jobListings = mockJobs.map(job => ({
        id: job.id.toString(),
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        requirements: job.requirements,
        salaryRange: job.salary,
        postedDate: job.postedDate,
        source: job.source,
        experienceLevel: filters.experienceLevel !== 'Any level' ? filters.experienceLevel : undefined
      }));

      // Convert resume to profile
      const profile = convertToResumeProfile(resumeData);
      if (!profile) {
        throw new Error('Failed to convert resume to profile');
      }

      // Get AI-powered recommendations
      const recommendations = await getJobRecommendations(profile, jobListings, 20);
      setPredictiveRecommendations(recommendations);

      // Convert recommendations back to Job format for display
      const enhancedResults: Job[] = recommendations.map(rec => ({
        id: parseInt(rec.job.id),
        title: rec.job.title,
        company: rec.job.company,
        location: rec.job.location,
        salary: rec.salaryPrediction 
          ? `$${rec.salaryPrediction.predictedMin}k - $${rec.salaryPrediction.predictedMax}k`
          : rec.job.salaryRange || 'Competitive',
        type: 'Full-time',
        description: rec.job.description,
        requirements: rec.job.requirements,
        postedDate: rec.job.postedDate,
        url: `https://careers.${rec.job.company.toLowerCase().replace(/\s+/g, '')}.com/jobs/${rec.job.id}`,
        source: rec.job.source,
        matchScore: rec.matchScore,
        whyMatch: rec.reasons.join(' | ')
      }));

      setPersonalizedJobResults(enhancedResults);
      setIsSearchingPersonalized(false);
      setIsGeneratingRecommendations(false);
      setActiveTab('resume-results');
      showNotification('Found personalized job matches!', 'success');
    } catch (error) {
      console.error('Error in personalized search:', error);
      // Fallback to basic matching
      const recentJob = resumeData.experience?.[0]?.position || 'Software Engineer';
      const results = generateMockJobs(recentJob, resumeFilters.location || 'Remote', 20);
      setPersonalizedJobResults(results);
      setIsSearchingPersonalized(false);
      setIsGeneratingRecommendations(false);
      setActiveTab('resume-results');
      showNotification('Using basic matching (AI features require API key)', 'info');
    }
  };

  // Analyze job with predictive features
  const handleAnalyzeJob = async (job: Job) => {
    if (!resumeData) {
      showNotification('Please select a resume first', 'error');
      return;
    }

    setSelectedJobForAnalysis(job);
    setIsAnalyzingJob(true);

    try {
      const profile = convertToResumeProfile(resumeData);
      if (!profile) {
        throw new Error('Failed to convert resume to profile');
      }

      const jobListing: JobListing = {
        id: job.id.toString(),
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        requirements: job.requirements,
        salaryRange: job.salary,
        postedDate: job.postedDate,
        source: job.source
      };

      // Get salary prediction and success probability in parallel
      const [salaryPred, successProb] = await Promise.all([
        predictSalary(profile, jobListing),
        calculateSuccessProbability(profile, jobListing)
      ]);

      setSalaryPrediction(salaryPred);
      setSuccessProbability(successProb);
    } catch (error) {
      console.error('Error analyzing job:', error);
      showNotification('Failed to analyze job. Please check your API key.', 'error');
    } finally {
      setIsAnalyzingJob(false);
    }
  };

  // Generate job alerts
  const handleGenerateJobAlerts = async () => {
    if (!resumeData) {
      showNotification('Please select a resume first', 'error');
      return;
    }

    try {
      const profile = convertToResumeProfile(resumeData);
      if (!profile) {
        throw new Error('Failed to convert resume to profile');
      }

      const alerts = await generateJobAlerts(profile);
      setJobAlerts(alerts);
      showNotification(`Generated ${alerts.length} job alerts!`, 'success');
    } catch (error) {
      console.error('Error generating job alerts:', error);
      showNotification('Failed to generate alerts. Please check your API key.', 'error');
    }
  };

  // Handle resume upload
  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.type.includes('text') && !file.name.endsWith('.docx')) {
      showNotification('Please upload a PDF, DOCX, or TXT file', 'error');
      return;
    }

    setIsUploadingResume(true);

    try {
      // Read file content
      const reader = new FileReader();
      const fileContent = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      // Simple parsing (in production, use OpenAI or proper parser)
      const parsedData: ResumeData = {
        personalInfo: { name: '', email: '', location: '' },
        skills: { technical: [], soft: [] },
        experience: [],
        summary: fileContent.substring(0, 500)
      };

      // Extract skills from content
      const commonSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'SQL', 'AWS', 'Docker', 'Git'];
      parsedData.skills!.technical = commonSkills.filter(skill => 
        fileContent.toLowerCase().includes(skill.toLowerCase())
      );

      // Save to localStorage
      const savedResumes = JSON.parse(localStorage.getItem('parsed_resumes') || '{}');
      savedResumes[file.name] = parsedData;
      localStorage.setItem('parsed_resumes', JSON.stringify(savedResumes));

      setUploadedResumes(savedResumes);
      setActiveResume(file.name);
      setResumeData(parsedData);
      localStorage.setItem('active_resume_for_job_search', file.name);

      showNotification('Resume uploaded successfully!', 'success');
    } catch (error) {
      showNotification('Failed to upload resume. Please try again.', 'error');
    } finally {
      setIsUploadingResume(false);
      event.target.value = '';
    }
  };

  // Select resume
  const handleSelectResume = (resumeName: string) => {
    const savedResumes = JSON.parse(localStorage.getItem('parsed_resumes') || '{}');
    if (savedResumes[resumeName]) {
      setActiveResume(resumeName);
      setResumeData(savedResumes[resumeName]);
      localStorage.setItem('active_resume_for_job_search', resumeName);
    }
  };

  // Delete resume
  const handleDeleteResume = (resumeName: string) => {
    if (!confirm(`Are you sure you want to delete "${resumeName}"?`)) return;
    
    const savedResumes = JSON.parse(localStorage.getItem('parsed_resumes') || '{}');
    delete savedResumes[resumeName];
    localStorage.setItem('parsed_resumes', JSON.stringify(savedResumes));
    setUploadedResumes(savedResumes);
    
    if (activeResume === resumeName) {
      const remaining = Object.keys(savedResumes);
      if (remaining.length > 0) {
        handleSelectResume(remaining[0]);
      } else {
        setActiveResume(null);
        setResumeData(null);
        localStorage.removeItem('active_resume_for_job_search');
      }
    }
  };

  // Track job
  const handleTrackJob = (job: Job) => {
    const result = JobTrackingUtils.addJobToTracker(job, 'job-finder', 'new-leads');
    
    if (result.success) {
      showNotification(`"${job.title}" added to Job Tracker!`, 'success');
      const tracked = JobTrackingUtils.getAllTrackedJobs();
      setTrackedJobIds(new Set(tracked.map(j => j.url)));
    } else if (result.duplicate) {
      showNotification('This job is already in your tracker', 'info');
    }
  };

  // Apply and track
  const handleApplyAndTrack = (job: Job) => {
    const result = JobTrackingUtils.addJobToTracker(job, 'job-finder', 'applied');
    
    if (result.success || result.duplicate) {
      window.open(job.url, '_blank');
      showNotification('Opening application page...', 'success');
      const tracked = JobTrackingUtils.getAllTrackedJobs();
      setTrackedJobIds(new Set(tracked.map(j => j.url)));
    }
  };

  // Bulk track
  const handleBulkTrack = (jobs: Job[], minScore = 80) => {
    const result = JobTrackingUtils.bulkAddJobs(jobs, 'job-finder', minScore);
    showNotification(
      `Added ${result.added} jobs to tracker${result.duplicates > 0 ? ` (${result.duplicates} duplicates skipped)` : ''}`,
      result.added > 0 ? 'success' : 'info'
    );
    const tracked = JobTrackingUtils.getAllTrackedJobs();
    setTrackedJobIds(new Set(tracked.map(j => j.url)));
  };

  // Export CSV
  const handleExportCSV = (jobs: Job[]) => {
    const csv = jobs.map(job =>
      `"${job.title}","${job.company}","${job.location}","${job.salary}","${job.type}","${job.url}"`
    ).join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent('Title,Company,Location,Salary,Type,URL\n' + csv);
    const link = document.createElement('a');
    link.href = csvContent;
    link.download = `job-search-results-${Date.now()}.csv`;
    link.click();
    showNotification('Results exported to CSV', 'success');
  };

  // Check if tracked
  const isJobTracked = (job: Job): boolean => trackedJobIds.has(job.url);

  // Match score color
  const getMatchScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Render job card
  const renderJobCard = (job: Job, index: number) => (
    <div key={index} className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <h3 className="text-xl font-bold text-slate-800">{job.title}</h3>
            {job.matchScore > 0 && (
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getMatchScoreColor(job.matchScore)}`}>
                {job.matchScore}% match
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-slate-600 mb-4 flex-wrap">
            <span className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              {job.company}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {job.salary}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {job.postedDate}
            </span>
          </div>
          
          <p className="text-slate-700 mb-4">{job.description}</p>
          
          {job.whyMatch && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Why this matches:</strong> {job.whyMatch}
              </p>
            </div>
          )}

          {isJobTracked(job) && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                <Check className="w-4 h-4" />
                Already tracked
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-2">
            {isJobTracked(job) ? (
              <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-200 transition-all flex items-center gap-1">
                <Check className="w-4 h-4" />
                View in Tracker
              </button>
            ) : (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handleTrackJob(job); }}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-semibold hover:bg-purple-200 transition-all flex items-center gap-1"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  Track This Job
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleApplyAndTrack(job); }}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-xl font-semibold hover:bg-green-200 transition-all flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Apply & Track
                </button>
              </>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); handleAnalyzeJob(job); }}
              disabled={isAnalyzingJob || !resumeData}
              className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl font-semibold hover:bg-orange-200 transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzingJob && selectedJobForAnalysis?.id === job.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4" />
                  Analyze Match
                </>
              )}
            </button>
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              Apply Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl ${
          notification.type === 'success' ? 'bg-green-500' :
          notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } text-white`} style={{ animation: 'slideIn 0.3s ease-out' }}>
          <div className="flex items-center gap-3">
            <span className="text-xl">{notification.type === 'success' ? '✓' : notification.type === 'error' ? '✕' : 'ℹ️'}</span>
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-2">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'search' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-gray-100'
            }`}
          >
            <Search className="w-4 h-4" />
            Quick Search
          </button>
          <button
            onClick={() => setActiveTab('resumes')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'resumes' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            Personalized Jobs
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'results' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-gray-100'
            }`}
          >
            <Target className="w-4 h-4" />
            Search Results{jobResults.length > 0 ? ` (${jobResults.length})` : ''}
          </button>
          <button
            onClick={() => setActiveTab('resume-results')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'resume-results' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-gray-100'
            }`}
          >
            <Star className="w-4 h-4" />
            Personalized Results{personalizedJobResults.length > 0 ? ` (${personalizedJobResults.length})` : ''}
          </button>
        </div>
      </div>

      {/* Quick Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-8">
          <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 relative">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Find Your Dream Job</h2>
            <p className="text-slate-600 mb-8">Enter your job title and location to get AI-powered job recommendations</p>
            
            {/* Search Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Job Title Input */}
              <div className="md:col-span-2 relative">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={quickSearchJobTitle}
                    onChange={(e) => handleJobTitleChange(e.target.value)}
                    onFocus={() => quickSearchJobTitle.trim() && setShowJobTitleSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowJobTitleSuggestions(false), 200)}
                    placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
                    className="w-full pl-10 pr-8 py-3 bg-white/70 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                  {quickSearchJobTitle && (
                    <button
                      onClick={() => { setQuickSearchJobTitle(''); setShowJobTitleSuggestions(false); }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {showJobTitleSuggestions && jobTitleSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                    {jobTitleSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => { setQuickSearchJobTitle(suggestion); setShowJobTitleSuggestions(false); }}
                        className="w-full px-4 py-3 text-left text-slate-800 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Input */}
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Location (Optional)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={quickSearchLocation}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    onFocus={() => quickSearchLocation.trim() && setShowLocationSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                    placeholder="City, State"
                    className="w-full pl-10 pr-8 py-3 bg-white/70 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                  {quickSearchLocation && (
                    <button
                      onClick={() => { setQuickSearchLocation(''); setShowLocationSuggestions(false); }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                    {locationSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => { setQuickSearchLocation(suggestion); setShowLocationSuggestions(false); }}
                        className="w-full px-4 py-3 text-left text-slate-800 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleQuickSearch}
              disabled={!quickSearchJobTitle.trim() || isSearching}
              className={`w-full px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                quickSearchJobTitle.trim() && !isSearching
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching for jobs...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search Jobs
                </>
              )}
            </button>

            {/* Filter Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              {/* Date Posted */}
              <div className="relative">
                <button
                  onClick={() => handleToggleFilter('datePosted')}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${
                    filters.datePosted !== 'Any time'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  {filters.datePosted}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showFilterDropdown.datePosted && (
                  <div className="absolute z-50 top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden">
                    {['Any time', 'Past 24 hours', 'Past week', 'Past month'].map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSelectFilter('datePosted', option)}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                          filters.datePosted === option ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Experience Level */}
              <div className="relative">
                <button
                  onClick={() => handleToggleFilter('experienceLevel')}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${
                    filters.experienceLevel !== 'Any level'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  {filters.experienceLevel}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showFilterDropdown.experienceLevel && (
                  <div className="absolute z-50 top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden">
                    {['Any level', 'Intern', 'Entry level', 'Mid-Senior level', 'Executive', 'Director'].map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSelectFilter('experienceLevel', option)}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                          filters.experienceLevel === option ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Remote */}
              <div className="relative">
                <button
                  onClick={() => handleToggleFilter('remote')}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${
                    filters.remote !== 'Any'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  {filters.remote}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showFilterDropdown.remote && (
                  <div className="absolute z-50 top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden">
                    {['Any', 'Remote', 'On-site', 'Hybrid'].map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSelectFilter('remote', option)}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                          filters.remote === option ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Salary Range */}
              <div className="relative">
                <button
                  onClick={() => handleToggleFilter('salaryRange')}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${
                    filters.salaryRange !== 'Any'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  {filters.salaryRange}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showFilterDropdown.salaryRange && (
                  <div className="absolute z-50 top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden">
                    {['Any', '$50k - $80k', '$80k - $120k', '$120k+', '$150k+'].map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSelectFilter('salaryRange', option)}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                          filters.salaryRange === option ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active Filters */}
            {(filters.datePosted !== 'Any time' || filters.experienceLevel !== 'Any level' || filters.remote !== 'Any' || filters.salaryRange !== 'Any') && (
              <div className="mt-4 flex flex-wrap gap-2 items-center">
                <span className="text-sm text-slate-600 font-medium">Active filters:</span>
                {filters.datePosted !== 'Any time' && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-2">
                    {filters.datePosted}
                    <button onClick={() => handleSelectFilter('datePosted', 'Any time')}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.experienceLevel !== 'Any level' && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-2">
                    {filters.experienceLevel}
                    <button onClick={() => handleSelectFilter('experienceLevel', 'Any level')}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.remote !== 'Any' && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-2">
                    {filters.remote}
                    <button onClick={() => handleSelectFilter('remote', 'Any')}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.salaryRange !== 'Any' && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-2">
                    {filters.salaryRange}
                    <button onClick={() => handleSelectFilter('salaryRange', 'Any')}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => setFilters({ datePosted: 'Any time', experienceLevel: 'Any level', remote: 'Any', salaryRange: 'Any' })}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-full text-xs font-medium"
                >
                  Clear all
                </button>
              </div>
            )}

            {resumeData && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-blue-700">
                    <strong>Resume detected!</strong> We'll match jobs to your skills and experience for better results.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* How It Works */}
          {jobResults.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">AI Search</h3>
                <p className="text-sm text-slate-600">Our AI searches across multiple job boards and generates job listings tailored to you</p>
              </div>
              
              <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Smart Matching</h3>
                <p className="text-sm text-slate-600">Jobs are matched against your resume to show relevance and fit</p>
              </div>
              
              <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Quick Actions</h3>
                <p className="text-sm text-slate-600">Track jobs, tailor your resume, or apply with one click</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Personalized Jobs Tab */}
      {activeTab === 'resumes' && (
        <div className="space-y-6">
          {/* Upload Section */}
          {Object.keys(uploadedResumes).length === 0 && (
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Upload Your Resume</h2>
              <p className="text-slate-600 mb-6">Upload your CV/resume and get AI-powered job recommendations tailored to your skills.</p>
              
              <div className="flex flex-col items-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleResumeUpload}
                    className="hidden"
                    disabled={isUploadingResume}
                  />
                  <div className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                    isUploadingResume
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600'
                  }`}>
                    {isUploadingResume ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Upload Resume
                      </>
                    )}
                  </div>
                </label>
                <span className="text-sm text-slate-600 mt-2">Supports PDF, DOCX, and TXT files</span>
              </div>
            </div>
          )}

          {/* Uploaded Resumes */}
          {Object.keys(uploadedResumes).length > 0 && (
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-800">Your Resumes</h2>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleResumeUpload}
                    className="hidden"
                    disabled={isUploadingResume}
                  />
                  <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload New
                  </div>
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {Object.entries(uploadedResumes).map(([name, data]) => (
                  <div
                    key={name}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      activeResume === name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                    onClick={() => handleSelectResume(name)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 truncate max-w-[200px]">{name}</h3>
                          {activeResume === name && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">Active</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteResume(name); }}
                        className="text-red-500 hover:text-red-700 text-lg font-bold px-2"
                      >
                        ×
                      </button>
                    </div>
                    {data.skills?.technical && data.skills.technical.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {data.skills.technical.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                        {data.skills.technical.length > 3 && (
                          <span className="text-xs text-slate-500">+{data.skills.technical.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Strategy & Filters */}
          {activeResume && uploadedResumes[activeResume] && (
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Customize Your Job Search</h2>
              <p className="text-slate-600 mb-6">Select a search strategy based on your goals</p>
              
              {/* Search Strategy Buttons */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Search jobs based on</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: 'background', label: 'Your Background' },
                    { id: 'career_progression', label: 'Next Career Step' },
                    { id: 'skill_based', label: 'Skill-Based Match' },
                    { id: 'passion_based', label: 'Passion & Interests' },
                    { id: 'industry_switch', label: 'Industry Switch' }
                  ].map(strategy => (
                    <button
                      key={strategy.id}
                      onClick={() => setSelectedSearchStrategy(selectedSearchStrategy === strategy.id ? null : strategy.id)}
                      disabled={isSearchingPersonalized}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                        selectedSearchStrategy === strategy.id
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg ring-2 ring-blue-300'
                          : 'bg-white/70 border border-slate-300 text-slate-700 hover:border-blue-500 hover:bg-blue-50'
                      } ${isSearchingPersonalized ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {strategy.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Work Type</label>
                  <select
                    value={resumeFilters.workType}
                    onChange={(e) => setResumeFilters(prev => ({ ...prev, workType: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/70 border border-slate-300 rounded-xl text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Remote Preference</label>
                  <select
                    value={resumeFilters.remote}
                    onChange={(e) => setResumeFilters(prev => ({ ...prev, remote: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/70 border border-slate-300 rounded-xl text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    <option value="Any">Any</option>
                    <option value="Remote">Remote Only</option>
                    <option value="On-site">On-site Only</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Experience Level</label>
                  <select
                    value={resumeFilters.experienceLevel}
                    onChange={(e) => setResumeFilters(prev => ({ ...prev, experienceLevel: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/70 border border-slate-300 rounded-xl text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    <option value="Any level">Any Level</option>
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={resumeFilters.location}
                    onChange={(e) => setResumeFilters(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State or Remote"
                    className="w-full px-4 py-3 bg-white/70 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={handlePersonalizedSearch}
                disabled={isSearchingPersonalized}
                className={`w-full px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 ${
                  !isSearchingPersonalized
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSearchingPersonalized ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Finding personalized jobs...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Find Personalized Jobs
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Search Results Tab */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {jobResults.length > 0 ? (
            <>
              <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      <Target className="w-6 h-6 text-blue-600" />
                      Search Results ({jobResults.length})
                    </h2>
                    <p className="text-slate-600">Searching for: "{quickSearchJobTitle}"</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleBulkTrack(jobResults, 80)}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors flex items-center gap-2 text-sm"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                      Track All 80%+
                    </button>
                    <button
                      onClick={() => handleExportCSV(jobResults)}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center gap-2 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Export CSV
                    </button>
                    <button
                      onClick={() => setActiveTab('search')}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                    >
                      New Search
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {jobResults.map((job, index) => renderJobCard(job, index))}
              </div>
            </>
          ) : (
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-12 text-center">
              <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No search results yet</h3>
              <p className="text-slate-600 mb-6">Your search results will appear here after you search for jobs</p>
              <button
                onClick={() => setActiveTab('search')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all"
              >
                Start Searching
              </button>
            </div>
          )}
        </div>
      )}

      {/* Personalized Results Tab */}
      {activeTab === 'resume-results' && (
        <div className="space-y-6">
          {personalizedJobResults.length > 0 ? (
            <>
              <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      <Star className="w-6 h-6 text-yellow-500" />
                      Personalized Job Matches ({personalizedJobResults.length})
                    </h2>
                    <p className="text-slate-600">Jobs matched to your resume: {activeResume}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleBulkTrack(personalizedJobResults, 85)}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors flex items-center gap-2 text-sm"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                      Track All 85%+
                    </button>
                    <button
                      onClick={() => handleExportCSV(personalizedJobResults)}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center gap-2 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Export CSV
                    </button>
                    <button
                      onClick={() => setActiveTab('resumes')}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                    >
                      New Search
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {personalizedJobResults.map((job, index) => renderJobCard(job, index))}
              </div>
            </>
          ) : (
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-12 text-center">
              <Star className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No personalized results yet</h3>
              <p className="text-slate-600 mb-6">Upload a resume and search to see personalized job matches</p>
              <button
                onClick={() => setActiveTab('resumes')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Get Personalized Jobs
              </button>
            </div>
          )}
        </div>
      )}

      {/* Job Analysis Modal */}
      {selectedJobForAnalysis && (salaryPrediction || successProbability) && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-800">Job Match Analysis</h3>
              <button
                onClick={() => {
                  setSelectedJobForAnalysis(null);
                  setSalaryPrediction(null);
                  setSuccessProbability(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-slate-50 rounded-xl">
              <h4 className="text-lg font-semibold text-slate-800 mb-2">{selectedJobForAnalysis.title}</h4>
              <p className="text-slate-600">{selectedJobForAnalysis.company} • {selectedJobForAnalysis.location}</p>
            </div>

            {/* Salary Prediction */}
            {salaryPrediction && (
              <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <h4 className="text-xl font-bold text-slate-800">Salary Prediction</h4>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-slate-600 mb-1">Minimum</p>
                    <p className="text-2xl font-bold text-green-700">${salaryPrediction.predictedMin}k</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600 mb-1">Median</p>
                    <p className="text-2xl font-bold text-green-700">${salaryPrediction.predictedMedian}k</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600 mb-1">Maximum</p>
                    <p className="text-2xl font-bold text-green-700">${salaryPrediction.predictedMax}k</p>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Confidence</span>
                    <span className="text-sm font-bold text-green-700">{salaryPrediction.confidence}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${salaryPrediction.confidence}%` }}
                    />
                  </div>
                </div>
                {salaryPrediction.marketComparison && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Market Percentile:</span>
                      <span className="font-semibold text-slate-800">{salaryPrediction.marketComparison.percentile}th</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Industry Average:</span>
                      <span className="font-semibold text-slate-800">${salaryPrediction.marketComparison.industryAverage}k</span>
                    </div>
                  </div>
                )}
                {salaryPrediction.factors.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-sm font-medium text-slate-700 mb-2">Key Factors:</p>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {salaryPrediction.factors.map((factor, idx) => (
                        <li key={idx}>• {factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Success Probability */}
            {successProbability && (
              <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <h4 className="text-xl font-bold text-slate-800">Application Success Probability</h4>
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold text-slate-700">Overall Probability</span>
                    <span className={`text-3xl font-bold ${
                      successProbability.overallProbability >= 70 ? 'text-green-600' :
                      successProbability.overallProbability >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {successProbability.overallProbability}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        successProbability.overallProbability >= 70 ? 'bg-green-500' :
                        successProbability.overallProbability >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${successProbability.overallProbability}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Qualifications</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${successProbability.breakdown.qualifications}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{successProbability.breakdown.qualifications}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Experience</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${successProbability.breakdown.experience}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{successProbability.breakdown.experience}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Skills</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${successProbability.breakdown.skills}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{successProbability.breakdown.skills}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Location</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${successProbability.breakdown.location}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{successProbability.breakdown.location}%</span>
                    </div>
                  </div>
                </div>
                {successProbability.riskFactors.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-900 mb-2">Risk Factors:</p>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      {successProbability.riskFactors.map((risk, idx) => (
                        <li key={idx}>⚠️ {risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {successProbability.improvementSuggestions.length > 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-2">Improvement Suggestions:</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {successProbability.improvementSuggestions.map((suggestion, idx) => (
                        <li key={idx}>💡 {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedJobForAnalysis(null);
                  setSalaryPrediction(null);
                  setSuccessProbability(null);
                }}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (selectedJobForAnalysis) {
                    handleTrackJob(selectedJobForAnalysis);
                    setSelectedJobForAnalysis(null);
                    setSalaryPrediction(null);
                    setSuccessProbability(null);
                  }
                }}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all"
              >
                Track This Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default JobFinder;
