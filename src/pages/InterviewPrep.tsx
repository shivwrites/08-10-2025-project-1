import { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Play,
  Target,
  BookOpen,
  Heart,
  BarChart3,
  Lightbulb,
  CheckSquare,
  Search,
  RefreshCw,
  ChevronRight,
  Check,
  X,
  Clock,
  Star,
  AlertCircle,
  Copy,
  Briefcase
} from 'lucide-react';
import {
  InterviewPrepStorage,
  generateQuestionsForRole,
  prioritizeQuestions,
  type InterviewQuestion,
  type JobData,
  type PracticeSession,
  type StoryItem,
  type AnswerFeedback
} from '../utils/interviewPrepStorage';

const InterviewPrep = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('overview');

  // Job & Questions state
  const [currentJob, setCurrentJob] = useState<JobData | null>(null);
  const [isJobLoaded, setIsJobLoaded] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Question interaction state
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [practiceAnswer, setPracticeAnswer] = useState('');

  // Mock interview state
  const [showMockInterview, setShowMockInterview] = useState(false);
  const [mockInterviewState, setMockInterviewState] = useState<{
    currentQuestion: number;
    answers: { question: string; answer: string }[];
    currentAnswer?: string;
    startTime?: Date;
  }>({ currentQuestion: 0, answers: [] });

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('id');

  // Progress state
  const [questionProgress, setQuestionProgress] = useState<Record<string, { reviewed?: boolean }>>({});
  const [userAnswers, setUserAnswers] = useState<Record<string, { answer: string; savedAt: string; version: number }>>({});
  const [answerFeedback, setAnswerFeedback] = useState<Record<number, AnswerFeedback>>({});
  const [practiceSessions, setPracticeSessions] = useState<PracticeSession[]>([]);

  // STAR mode state
  const [starMode, setStarMode] = useState(false);
  const [starAnswers, setStarAnswers] = useState({
    Situation: '',
    Task: '',
    Action: '',
    Result: ''
  });

  // Wellness state
  const [anxietyLevel, setAnxietyLevel] = useState<number | null>(null);
  const [confidenceScore, setConfidenceScore] = useState(50);
  const [userStories, setUserStories] = useState<StoryItem[]>([]);
  const [questionPriorities, setQuestionPriorities] = useState<Record<number, 'Critical' | 'High' | 'Medium' | 'Low'>>({});
  const [showAnxietyAssessment, setShowAnxietyAssessment] = useState(false);
  const [anxietyAssessmentAnswers, setAnxietyAssessmentAnswers] = useState<Record<string, number>>({});

  // Company research state
  const [showCompanyResearch, setShowCompanyResearch] = useState(false);
  const [companyResearch, setCompanyResearch] = useState<{ culture: string; values: string[]; tips: string[] } | null>(null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'practice', label: 'Practice', icon: Target },
    { id: 'questions', label: 'Questions', icon: MessageSquare },
    { id: 'stories', label: 'Story Bank', icon: BookOpen },
    { id: 'wellness', label: 'Wellness', icon: Heart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'tips', label: 'Tips & Guides', icon: Lightbulb },
    { id: 'checklist', label: 'Checklist', icon: CheckSquare }
  ];

  const features = [
    {
      icon: '🧠',
      title: 'AI Mock Interviews',
      description: 'Practice with AI-powered interviewers that adapt to your responses and provide real-time feedback.'
    },
    {
      icon: '💬',
      title: 'Question Bank',
      description: 'Access thousands of interview questions organized by role, company, and difficulty level.'
    },
    {
      icon: '📄',
      title: 'Answer Templates',
      description: 'Get structured templates and examples for common interview questions and scenarios.'
    },
    {
      icon: '🎯',
      title: 'Performance Analytics',
      description: 'Track your progress with detailed analytics on your interview performance and improvement areas.'
    }
  ];

  const quickStartSteps = [
    { number: 1, title: 'Set Your Goals', description: 'Define your target role and company preferences to personalize your preparation.' },
    { number: 2, title: 'Practice Sessions', description: 'Start with AI mock interviews tailored to your specific role and industry.' },
    { number: 3, title: 'Track Progress', description: 'Monitor your improvement and refine your approach based on detailed analytics.' }
  ];

  // Build story bank from resume
  const buildStoryBankFromResume = () => {
    try {
      const stories = InterviewPrepStorage.buildStoryBankFromResume();
      const savedStories = currentJob?.jobId ? InterviewPrepStorage.loadStoryBank(currentJob.jobId) : [];
      const allStories = [...stories, ...savedStories.filter(s => s.source === 'manual')];
      const uniqueStories = allStories.filter((story, index, self) =>
        index === self.findIndex(s => s.title === story.title)
      );
      return uniqueStories;
    } catch (e) {
      console.error('Error building story bank:', e);
      return [];
    }
  };

  // Anxiety assessment
  const assessAnxietyLevel = () => {
    const questions = [
      { id: 'nervous', fear: 'Being too nervous', reverse: false },
      { id: 'stumped', fear: 'Being stumped by questions', reverse: false },
      { id: 'late', fear: 'Being late', reverse: false },
      { id: 'underqualified', fear: 'Being underqualified', reverse: false },
      { id: 'unprepared', fear: 'Not being prepared', reverse: true }
    ];

    if (Object.keys(anxietyAssessmentAnswers).length === questions.length) {
      let totalScore = 0;
      questions.forEach(q => {
        const answer = anxietyAssessmentAnswers[q.id] || 3;
        totalScore += q.reverse ? (6 - answer) : answer;
      });
      const averageScore = totalScore / questions.length;
      const anxiety = Math.round(averageScore);
      return {
        level: anxiety,
        fears: questions.filter(q => {
          const answer = anxietyAssessmentAnswers[q.id] || 3;
          const score = q.reverse ? (6 - answer) : answer;
          return score >= 4;
        }).map(q => q.fear)
      };
    }
    return null;
  };

  // Calculate confidence score
  const calculateConfidenceScore = () => {
    if (!currentJob || !interviewQuestions.length) return 50;

    let score = 0;

    // Questions reviewed (30% weight)
    const reviewedCount = Object.keys(questionProgress).filter(k => questionProgress[k].reviewed).length;
    const reviewProgress = (reviewedCount / interviewQuestions.length) * 100;
    score += (reviewProgress * 0.3);

    // Answers saved (25% weight)
    const answersCount = Object.keys(userAnswers).length;
    const answersProgress = Math.min((answersCount / interviewQuestions.length) * 100, 100);
    score += (answersProgress * 0.25);

    // Critical questions reviewed (20% weight)
    const criticalQuestions = interviewQuestions.filter(q => (questionPriorities[q.id] || 'Medium') === 'Critical');
    const criticalReviewed = criticalQuestions.filter(q => questionProgress[q.id]?.reviewed).length;
    const criticalProgress = criticalQuestions.length > 0 ? (criticalReviewed / criticalQuestions.length) * 100 : 50;
    score += (criticalProgress * 0.2);

    // Practice sessions (15% weight)
    const sessionsCount = practiceSessions.length;
    const sessionsScore = Math.min(sessionsCount * 10, 100);
    score += (sessionsScore * 0.15);

    // Story bank prepared (10% weight)
    const storiesCount = userStories.length;
    const storiesScore = Math.min(storiesCount * 5, 100);
    score += (storiesScore * 0.1);

    return Math.round(Math.min(Math.max(score, 0), 100));
  };

  // Save answer
  const saveAnswer = (questionId: number, answer: string) => {
    setUserAnswers(prev => {
      const updated = {
        ...prev,
        [questionId]: {
          answer,
          savedAt: new Date().toISOString(),
          version: (prev[questionId]?.version || 0) + 1
        }
      };
      if (currentJob?.jobId) {
        InterviewPrepStorage.savePrepData(currentJob.jobId, {
          userAnswers: updated,
          questionProgress
        });
      }
      return updated;
    });
  };

  // Update question progress
  const updateProgress = (questionId: number, field: string, value: boolean) => {
    setQuestionProgress(prev => {
      const updated = { ...prev, [questionId]: { ...prev[questionId], [field]: value } };
      if (currentJob?.jobId) {
        InterviewPrepStorage.savePrepData(currentJob.jobId, {
          userAnswers,
          questionProgress: updated
        });
      }
      return updated;
    });
  };

  // Mark interview as prepared
  const markInterviewPrepared = () => {
    if (!currentJob) return;

    const prepData = {
      questionsReviewed: Object.keys(questionProgress).filter(k => questionProgress[k].reviewed).length,
      totalQuestions: interviewQuestions.length,
      practiceSessions: practiceSessions.length,
      userAnswers
    };

    InterviewPrepStorage.savePrepData(currentJob.jobId, prepData);
    alert('Interview prep completed and saved!');
  };

  // Load job data
  useEffect(() => {
    const loadJobData = async (jobData: JobData) => {
      try {
        setError(null);
        setLoading(true);

        if (!jobData || !jobData.jobTitle) {
          throw new Error('Invalid job data provided');
        }

        setCurrentJob(jobData);
        setIsJobLoaded(true);

        // Load saved prep data
        if (jobData.jobId) {
          const savedData = InterviewPrepStorage.loadPrepData(jobData.jobId);
          if (savedData) {
            if (savedData.userAnswers) setUserAnswers(savedData.userAnswers);
            if (savedData.questionProgress) setQuestionProgress(savedData.questionProgress);
          }
        }

        // Generate questions
        const questions = generateQuestionsForRole(
          jobData.jobTitle || jobData.title || '',
          jobData.company
        );
        setInterviewQuestions(questions);

        // Prioritize questions
        const priorities = prioritizeQuestions(questions, jobData, jobData.interviewDate);
        setQuestionPriorities(priorities);

        // Build story bank from resume
        const stories = buildStoryBankFromResume();
        setUserStories(stories);

        // Load saved story bank and merge
        if (jobData.jobId) {
          const savedStories = InterviewPrepStorage.loadStoryBank(jobData.jobId);
          if (savedStories.length > 0) {
            const mergedStories = [...stories, ...savedStories.filter(s => s.source === 'manual')];
            const uniqueStories = mergedStories.filter((story, index, self) =>
              index === self.findIndex(s => s.title === story.title)
            );
            setUserStories(uniqueStories);
          }
        }

        // Load anxiety and confidence data
        if (jobData.jobId) {
          const anxietyData = InterviewPrepStorage.loadAnxietyData(jobData.jobId);
          if (anxietyData) {
            setAnxietyLevel(anxietyData.level || null);
            setAnxietyAssessmentAnswers(anxietyData.assessmentAnswers || {});
          }

          const confidenceData = InterviewPrepStorage.loadConfidenceHistory(jobData.jobId);
          if (confidenceData && confidenceData.currentScore !== undefined) {
            setConfidenceScore(confidenceData.currentScore);
          }
        }

        // Load practice sessions
        const sessions = InterviewPrepStorage.getAllSessions().filter(
          s => s.jobId === jobData.jobId
        );
        setPracticeSessions(sessions);

        setLoading(false);
      } catch (e) {
        console.error('Error loading job data:', e);
        setError((e as Error).message || 'Failed to load job data. Please try again.');
        setLoading(false);
      }
    };

    // Check localStorage for job data from Job Tracker
    const storedJob = localStorage.getItem('current_interview_job');
    if (storedJob) {
      try {
        const jobData = JSON.parse(storedJob);
        loadJobData(jobData);
        localStorage.removeItem('current_interview_job');
      } catch (e) {
        setError('Invalid job data format');
        console.error('Error parsing stored job data:', e);
      }
    }

    // Listen for custom event
    const handleLoadJob = (e: CustomEvent) => {
      const jobCard = e.detail;
      const jobData: JobData = {
        jobTitle: jobCard.title,
        company: jobCard.company,
        location: jobCard.location,
        jobDescription: jobCard.notes || jobCard.description || '',
        matchScore: jobCard.matchScore,
        applicationDate: jobCard.applicationDate,
        interviewDate: jobCard.interviewDate || new Date().toISOString().split('T')[0],
        jobId: jobCard.id,
        source: jobCard.source || '',
        salary: jobCard.salary || ''
      };
      loadJobData(jobData);
    };

    window.addEventListener('interview-prep:load-job', handleLoadJob as EventListener);
    return () => window.removeEventListener('interview-prep:load-job', handleLoadJob as EventListener);
  }, []);

  // Update confidence score when progress changes
  useEffect(() => {
    if (currentJob && interviewQuestions.length > 0) {
      const newConfidence = calculateConfidenceScore();
      if (Math.abs(newConfidence - confidenceScore) > 1) {
        setConfidenceScore(newConfidence);
        if (currentJob.jobId) {
          InterviewPrepStorage.saveConfidenceScore(currentJob.jobId, newConfidence);
        }
      }
    }
  }, [questionProgress, userAnswers, practiceSessions, userStories, interviewQuestions.length]);

  // Filter and sort questions
  const filteredQuestions = useMemo(() => {
    let filtered = [...interviewQuestions];

    if (searchQuery) {
      filtered = filtered.filter(q =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(q => q.category === filterCategory);
    }

    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === filterDifficulty);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(q => {
        const priority = questionPriorities[q.id] || 'Medium';
        return priority === filterPriority;
      });
    }

    if (sortBy === 'category') {
      filtered.sort((a, b) => a.category.localeCompare(b.category));
    } else if (sortBy === 'difficulty') {
      const diffOrder: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };
      filtered.sort((a, b) => (diffOrder[a.difficulty] || 0) - (diffOrder[b.difficulty] || 0));
    } else if (sortBy === 'priority') {
      const priorityOrder: Record<string, number> = { Critical: 1, High: 2, Medium: 3, Low: 4 };
      filtered.sort((a, b) => {
        const aPriority = questionPriorities[a.id] || 'Medium';
        const bPriority = questionPriorities[b.id] || 'Medium';
        return (priorityOrder[aPriority] || 3) - (priorityOrder[bPriority] || 3);
      });
    } else {
      filtered.sort((a, b) => a.id - b.id);
    }

    return filtered;
  }, [interviewQuestions, searchQuery, filterCategory, filterDifficulty, filterPriority, sortBy, questionPriorities]);

  // Generate sample answer (mock)
  const generateSampleAnswer = async (question: string, jobTitle: string, company: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return `This is a sample answer for: "${question}"

When answering this question for a ${jobTitle} position at ${company}, you should:

1. Be specific and provide concrete examples from your experience
2. Use the STAR method (Situation, Task, Action, Result) for behavioral questions
3. Show enthusiasm for the role and company
4. Keep your answer concise but comprehensive (1-2 minutes when spoken)

Remember to tailor your response to highlight skills and experiences relevant to this specific role.`;
  };

  // Fetch company research (mock)
  const fetchCompanyResearch = async (company: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setCompanyResearch({
      culture: `${company} is known for its innovative culture and commitment to employee growth. They emphasize collaboration, creativity, and continuous learning.`,
      values: [
        'Innovation and creativity',
        'Customer-first mindset',
        'Integrity and transparency',
        'Continuous improvement',
        'Teamwork and collaboration'
      ],
      tips: [
        `Research ${company}'s recent news and achievements`,
        'Prepare examples that demonstrate company values',
        'Show enthusiasm for their products/services',
        'Ask thoughtful questions about team dynamics',
        'Highlight relevant experience with similar companies'
      ]
    });
    setLoading(false);
  };

  // Navigate to job tracker
  const goToJobTracker = () => {
    window.location.href = '/dashboard/job-tracker';
  };

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-lg p-1">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900">Error</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !showSampleAnswer && !showPracticeModal && !showCompanyResearch && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
          <p className="text-indigo-700">Loading interview preparation data...</p>
        </div>
      )}

      {/* Job Info Banner */}
      {currentJob && !loading && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-indigo-900">
                  {currentJob.jobTitle || currentJob.title}
                </h3>
                {currentJob.matchScore && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    currentJob.matchScore >= 90 ? 'bg-green-500/20 text-green-700' :
                    currentJob.matchScore >= 80 ? 'bg-indigo-500/20 text-indigo-700' :
                    'bg-yellow-500/20 text-yellow-700'
                  }`}>
                    {currentJob.matchScore}% Match
                  </span>
                )}
              </div>
              <p className="text-indigo-700 font-medium mb-2">
                {currentJob.company} {currentJob.location ? `• ${currentJob.location}` : ''}
              </p>
              {currentJob.interviewDate && (
                <p className="text-indigo-600 text-sm">
                  📅 Interview scheduled for: {new Date(currentJob.interviewDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => {
                  setShowCompanyResearch(true);
                  fetchCompanyResearch(currentJob.company);
                }}
                className="text-purple-600 hover:text-purple-800 border border-purple-300 px-3 py-2 rounded-lg hover:bg-purple-100/50 transition-colors text-sm font-medium"
              >
                Company Info <ChevronRight className="w-4 h-4 inline" />
              </button>
              <button
                onClick={goToJobTracker}
                className="text-indigo-600 hover:text-indigo-800 border border-indigo-300 px-4 py-2 rounded-lg hover:bg-indigo-100/50 transition-colors text-sm font-medium"
              >
                View in Tracker <ChevronRight className="w-4 h-4 inline" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="bg-white/30 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                        <span className="text-xl">{feature.icon}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800">{feature.title}</h3>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Quick Start Guide</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickStartSteps.map((step, index) => (
                  <div key={index} className="bg-white/30 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{step.number}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">{step.title}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!currentJob && (
              <div className="text-center py-12 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl">
                <Briefcase className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Get Started</h2>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  Select a job from your Job Tracker to start personalized interview preparation.
                </p>
                <button
                  onClick={goToJobTracker}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 mx-auto hover:bg-indigo-700 transition-all duration-300"
                >
                  Go to Job Tracker <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Practice Tab */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            {currentJob ? (
              <>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Prepare for your interview at {currentJob.company}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Role: <span className="font-semibold">{currentJob.jobTitle || currentJob.title}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={() => setActiveTab('questions')}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:border-indigo-500 transition-all duration-300 text-left"
                  >
                    <div className="text-3xl mb-3">💬</div>
                    <h4 className="font-semibold text-slate-800 mb-2">Review Common Questions</h4>
                    <p className="text-slate-600 text-sm">
                      Browse questions typically asked for {currentJob.jobTitle || currentJob.title} roles
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setShowMockInterview(true);
                      setMockInterviewState({
                        currentQuestion: 0,
                        answers: [],
                        currentAnswer: '',
                        startTime: new Date()
                      });
                    }}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:border-indigo-500 transition-all duration-300 text-left"
                  >
                    <div className="text-3xl mb-3">🧠</div>
                    <h4 className="font-semibold text-slate-800 mb-2">Start AI Mock Interview</h4>
                    <p className="text-slate-600 text-sm">
                      Practice with AI interviewer tailored to this role
                    </p>
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Start Your Practice Session</h2>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  Select a job from your Job Tracker to start personalized interview preparation.
                </p>
                <button
                  onClick={goToJobTracker}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 mx-auto hover:bg-indigo-700 transition-all duration-300"
                >
                  Go to Job Tracker <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            {currentJob ? (
              <>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <h3 className="text-xl font-bold text-slate-800">
                    Interview Questions for {currentJob.jobTitle || currentJob.title}
                  </h3>
                  <button
                    onClick={() => {
                      const questions = generateQuestionsForRole(
                        currentJob.jobTitle || currentJob.title || '',
                        currentJob.company
                      );
                      setInterviewQuestions(questions);
                      const priorities = prioritizeQuestions(questions, currentJob, currentJob.interviewDate);
                      setQuestionPriorities(priorities);
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Questions
                  </button>
                </div>

                {/* Search and Filters */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Categories</option>
                      <option value="General">General</option>
                      <option value="Technical">Technical</option>
                      <option value="Behavioral">Behavioral</option>
                      <option value="Role-Specific">Role-Specific</option>
                    </select>
                    <select
                      value={filterDifficulty}
                      onChange={(e) => setFilterDifficulty(e.target.value)}
                      className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Priorities</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="id">Sort by ID</option>
                      <option value="priority">Sort by Priority</option>
                      <option value="category">Sort by Category</option>
                      <option value="difficulty">Sort by Difficulty</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Showing {filteredQuestions.length} of {interviewQuestions.length} questions
                    </div>
                    {interviewQuestions.filter(q => (questionPriorities[q.id] || 'Medium') === 'Critical').length > 0 && (
                      <button
                        onClick={() => {
                          setFilterPriority('Critical');
                          setFilterCategory('all');
                          setFilterDifficulty('all');
                          setSearchQuery('');
                        }}
                        className="text-sm px-3 py-1.5 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        🎯 Start with Critical ({interviewQuestions.filter(q => (questionPriorities[q.id] || 'Medium') === 'Critical').length})
                      </button>
                    )}
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                  {filteredQuestions.length > 0 ? (
                    filteredQuestions.map((q) => {
                      const progress = questionProgress[q.id] || {};
                      const savedAnswer = userAnswers[q.id];
                      const priority = questionPriorities[q.id] || 'Medium';

                      return (
                        <div
                          key={q.id}
                          className={`bg-white border rounded-xl p-6 hover:shadow-lg transition-all duration-300 ${
                            progress.reviewed ? 'border-green-300 bg-green-50/50' : 'border-gray-200'
                          } ${
                            priority === 'Critical' ? 'border-l-4 border-l-red-500' :
                            priority === 'High' ? 'border-l-4 border-l-orange-500' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={progress.reviewed || false}
                                  onChange={(e) => updateProgress(q.id, 'reviewed', e.target.checked)}
                                  className="w-4 h-4 text-indigo-600 rounded"
                                />
                                <span className="text-lg font-bold text-slate-400">{q.id}.</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-800 mb-2">{q.question}</h4>
                                {savedAnswer && (
                                  <p className="text-xs text-green-700 mb-1">✓ Answer saved</p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 ml-2 flex-wrap">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                priority === 'Critical' ? 'bg-red-500 text-white font-bold' :
                                priority === 'High' ? 'bg-orange-500 text-white' :
                                priority === 'Low' ? 'bg-gray-300 text-gray-700' :
                                'bg-yellow-200 text-yellow-800'
                              }`}>
                                {priority === 'Critical' && '🔥 '}{priority}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                q.category === 'General' ? 'bg-blue-100 text-blue-700' :
                                q.category === 'Technical' ? 'bg-purple-100 text-purple-700' :
                                q.category === 'Behavioral' ? 'bg-amber-100 text-amber-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {q.category}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {q.difficulty}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-4">
                            <button
                              onClick={async () => {
                                setSelectedQuestion(q);
                                setShowSampleAnswer(true);
                                setLoading(true);
                                const answer = await generateSampleAnswer(q.question, currentJob.jobTitle || currentJob.title || '', currentJob.company);
                                setSelectedQuestion({ ...q, sampleAnswer: answer });
                                setLoading(false);
                              }}
                              className="text-sm font-medium px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                            >
                              View Sample Answer <ChevronRight className="w-4 h-4 inline" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedQuestion(q);
                                setPracticeAnswer(savedAnswer?.answer || '');
                                setShowPracticeModal(true);
                              }}
                              className="text-sm font-medium px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                            >
                              Practice Answer <ChevronRight className="w-4 h-4 inline" />
                            </button>
                            {savedAnswer && (
                              <button
                                onClick={() => {
                                  setSelectedQuestion(q);
                                  setPracticeAnswer(savedAnswer.answer);
                                  setShowPracticeModal(true);
                                }}
                                className="text-sm font-medium px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                              >
                                View My Answer <ChevronRight className="w-4 h-4 inline" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-600">
                        {searchQuery || filterCategory !== 'all' || filterDifficulty !== 'all'
                          ? 'No questions match your filters. Try adjusting your search.'
                          : `Generating questions for ${currentJob.jobTitle || currentJob.title}...`}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Browse Interview Questions</h2>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  Select a job from your Job Tracker to see personalized interview questions.
                </p>
                <button
                  onClick={goToJobTracker}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 mx-auto hover:bg-indigo-700 transition-all duration-300"
                >
                  Go to Job Tracker <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stories Tab */}
        {activeTab === 'stories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Story Bank</h3>
              <button
                onClick={() => {
                  const stories = buildStoryBankFromResume();
                  setUserStories(stories);
                  if (currentJob?.jobId) {
                    InterviewPrepStorage.saveStoryBank(currentJob.jobId, stories);
                  }
                  alert(`Loaded ${stories.length} stories from your resume!`);
                }}
                className="text-sm px-4 py-2 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh from Resume
              </button>
            </div>

            {userStories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userStories.map((story) => (
                  <div
                    key={story.id}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 mb-2">{story.title}</h4>
                        {story.company && (
                          <p className="text-sm text-slate-600 mb-1">
                            {story.company} {story.position ? `• ${story.position}` : ''}
                          </p>
                        )}
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          story.source === 'resume'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {story.source === 'resume' ? '📄 From Resume' : '✍️ Manual'}
                        </span>
                      </div>
                    </div>

                    {story.description && (
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{story.description}</p>
                    )}

                    {story.starFormat && (
                      <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                        <div className="text-xs font-semibold mb-2 text-indigo-600">STAR Format:</div>
                        <div className="space-y-1 text-xs text-slate-700">
                          <div><strong>Situation:</strong> {story.starFormat.Situation}</div>
                          <div><strong>Task:</strong> {story.starFormat.Task}</div>
                          <div><strong>Action:</strong> {story.starFormat.Action}</div>
                          <div><strong>Result:</strong> {story.starFormat.Result}</div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (story.starFormat) {
                          setStarAnswers(story.starFormat);
                          setStarMode(true);
                          setShowPracticeModal(true);
                          setSelectedQuestion({ id: 0, question: 'Tell me about a time when...', category: 'Behavioral', difficulty: 'Medium' });
                        }
                      }}
                      className="w-full text-sm px-4 py-2 rounded-lg font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                    >
                      Practice with STAR <ChevronRight className="w-4 h-4 inline" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-slate-800 mb-4">No Stories Yet</h2>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  {InterviewPrepStorage.getResumeData()
                    ? 'Click "Refresh from Resume" to extract stories from your resume.'
                    : 'Upload your resume first to extract stories for behavioral questions.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Wellness Tab */}
        {activeTab === 'wellness' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Interview Wellness & Confidence</h3>

            {/* Confidence Meter */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-indigo-900">Confidence Level</h4>
                <span className={`text-2xl font-bold ${
                  confidenceScore >= 80 ? 'text-green-600' :
                  confidenceScore >= 60 ? 'text-indigo-600' :
                  confidenceScore >= 40 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {confidenceScore}%
                </span>
              </div>
              <div className="w-full h-6 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    confidenceScore >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                    confidenceScore >= 60 ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' :
                    confidenceScore >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                    'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                  style={{ width: `${confidenceScore}%` }}
                ></div>
              </div>
              <p className="text-sm mt-2 text-indigo-700">
                {confidenceScore >= 80 ? "Excellent! You're well prepared." :
                 confidenceScore >= 60 ? 'Good progress! Keep practicing.' :
                 confidenceScore >= 40 ? "You're on the right track. Focus on critical questions." :
                 'Start with critical questions to build confidence.'}
              </p>
            </div>

            {/* Anxiety Assessment */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-slate-800">Anxiety Assessment</h4>
                {anxietyLevel && (
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    anxietyLevel <= 3 ? 'bg-green-100 text-green-700' :
                    anxietyLevel <= 6 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    Level {anxietyLevel}/10
                  </span>
                )}
              </div>

              {anxietyLevel === null ? (
                <div>
                  <p className="text-slate-600 mb-4">
                    Take a quick assessment to identify your specific interview fears and get personalized coping strategies.
                  </p>
                  <button
                    onClick={() => setShowAnxietyAssessment(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Start Assessment
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-700">
                    Your anxiety level: <strong>{anxietyLevel}/10</strong>
                  </p>
                  <button
                    onClick={() => setShowAnxietyAssessment(true)}
                    className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    Retake Assessment
                  </button>
                </div>
              )}
            </div>

            {/* Progress Indicators */}
            {currentJob && interviewQuestions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="text-xl font-bold text-green-900">
                    {interviewQuestions.filter(q => (questionPriorities[q.id] || 'Medium') === 'Critical').filter(q => questionProgress[q.id]?.reviewed).length} / {interviewQuestions.filter(q => (questionPriorities[q.id] || 'Medium') === 'Critical').length}
                  </div>
                  <div className="text-xs text-green-700">Critical Questions Reviewed</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <div className="text-2xl mb-2">📚</div>
                  <div className="text-xl font-bold text-purple-900">{userStories.length}</div>
                  <div className="text-xs text-purple-700">Stories Prepared</div>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                  <div className="text-2xl mb-2">💬</div>
                  <div className="text-xl font-bold text-indigo-900">{Object.keys(userAnswers).length}</div>
                  <div className="text-xs text-indigo-700">Answers Saved</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {currentJob ? (
              <>
                <h3 className="text-xl font-bold text-slate-800 mb-6">Interview Preparation Analytics</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                    <div className="text-3xl mb-2">📋</div>
                    <div className="text-2xl font-bold text-indigo-900 mb-1">{interviewQuestions.length}</div>
                    <div className="text-sm text-indigo-700">Total Questions</div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="text-3xl mb-2">✓</div>
                    <div className="text-2xl font-bold text-green-900 mb-1">
                      {Object.keys(questionProgress).filter(k => questionProgress[k].reviewed).length}
                    </div>
                    <div className="text-sm text-green-700">Questions Reviewed</div>
                    <div className="text-xs text-green-600 mt-1">
                      {interviewQuestions.length > 0 ? Math.round((Object.keys(questionProgress).filter(k => questionProgress[k].reviewed).length / interviewQuestions.length) * 100) : 0}% Complete
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <div className="text-3xl mb-2">💬</div>
                    <div className="text-2xl font-bold text-purple-900 mb-1">{Object.keys(userAnswers).length}</div>
                    <div className="text-sm text-purple-700">Answers Saved</div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <div className="text-3xl mb-2">🎯</div>
                    <div className="text-2xl font-bold text-amber-900 mb-1">{practiceSessions.length}</div>
                    <div className="text-sm text-amber-700">Practice Sessions</div>
                  </div>
                </div>

                {currentJob.interviewDate && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <h4 className="font-semibold text-amber-900 mb-2">📅 Interview Date</h4>
                    <p className="text-amber-700">
                      {new Date(currentJob.interviewDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-amber-600 mt-2">
                      {Math.ceil((new Date(currentJob.interviewDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days until interview
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Track Your Progress</h2>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  Select a job from your Job Tracker to see analytics.
                </p>
                <button
                  onClick={goToJobTracker}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 mx-auto hover:bg-indigo-700 transition-all duration-300"
                >
                  Go to Job Tracker <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tips Tab */}
        {activeTab === 'tips' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Interview Tips & Guides</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                <h4 className="font-semibold text-indigo-900 mb-3">💼 Before the Interview</h4>
                <ul className="space-y-2 text-sm text-indigo-700">
                  <li>✓ Research the company thoroughly</li>
                  <li>✓ Review the job description</li>
                  <li>✓ Prepare questions to ask</li>
                  <li>✓ Plan your outfit (business professional)</li>
                  <li>✓ Test your technology (for virtual interviews)</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h4 className="font-semibold text-green-900 mb-3">🎤 During the Interview</h4>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>✓ Maintain eye contact</li>
                  <li>✓ Use the STAR method for behavioral questions</li>
                  <li>✓ Listen carefully before answering</li>
                  <li>✓ Show enthusiasm and interest</li>
                  <li>✓ Ask thoughtful questions</li>
                </ul>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <h4 className="font-semibold text-purple-900 mb-3">📧 After the Interview</h4>
                <ul className="space-y-2 text-sm text-purple-700">
                  <li>✓ Send a thank-you email within 24 hours</li>
                  <li>✓ Reference specific discussion points</li>
                  <li>✓ Reiterate your interest</li>
                  <li>✓ Follow up if you haven't heard back</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <h4 className="font-semibold text-amber-900 mb-3">💡 General Tips</h4>
                <ul className="space-y-2 text-sm text-amber-700">
                  <li>✓ Practice common questions</li>
                  <li>✓ Prepare examples from your experience</li>
                  <li>✓ Quantify your achievements</li>
                  <li>✓ Research salary ranges</li>
                  <li>✓ Be prepared to negotiate</li>
                </ul>
              </div>
            </div>

            {currentJob && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mt-6">
                <h4 className="font-semibold text-indigo-900 mb-3">📋 Follow-up Email Template</h4>
                <div className="bg-white rounded-lg p-4 mb-3">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
{`Subject: Thank You - ${currentJob.jobTitle || currentJob.title} Position

Dear [Interviewer Name],

Thank you for taking the time to speak with me today about the ${currentJob.jobTitle || currentJob.title} position at ${currentJob.company}. I enjoyed learning more about [specific topic discussed].

I'm particularly excited about [specific aspect of role/company mentioned]. I believe my experience in [relevant experience] aligns well with what you're looking for.

I look forward to hearing from you and the next steps in the process.

Best regards,
[Your Name]`}
                  </pre>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`Subject: Thank You - ${currentJob.jobTitle || currentJob.title} Position

Dear [Interviewer Name],

Thank you for taking the time to speak with me today about the ${currentJob.jobTitle || currentJob.title} position at ${currentJob.company}. I enjoyed learning more about the role and company.

I'm particularly excited about the opportunity to contribute to [specific aspect]. I believe my experience aligns well with what you're looking for.

I look forward to hearing from you.

Best regards,
[Your Name]`);
                    alert('Email template copied to clipboard!');
                  }}
                  className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Template
                </button>
              </div>
            )}
          </div>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Interview Preparation Checklist</h3>

            {currentJob && currentJob.interviewDate && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-amber-900 mb-2">
                  📅 Interview Date: {new Date(currentJob.interviewDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h4>
                <p className="text-sm text-amber-700">
                  Days until interview: {Math.ceil((new Date(currentJob.interviewDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {[
                { category: '📋 Preparation', items: [
                  'Research company culture and values',
                  'Review job description thoroughly',
                  'Prepare questions to ask interviewers',
                  'Review your resume and be ready to discuss it',
                  'Practice answers to common questions'
                ]},
                { category: '💼 Professional Materials', items: [
                  'Prepare multiple copies of your resume',
                  'Bring portfolio/work samples (if applicable)',
                  'Prepare references list',
                  'Bring notebook and pen for notes'
                ]},
                { category: '👔 Attire & Appearance', items: [
                  'Plan professional outfit',
                  'Ensure outfit is clean and pressed',
                  'Groom professionally',
                  'Check appearance in mirror'
                ]},
                { category: '💻 Technology (Virtual Interviews)', items: [
                  'Test video/camera setup',
                  'Test microphone and audio',
                  'Check internet connection',
                  'Close unnecessary applications',
                  'Prepare quiet, professional space'
                ]},
                { category: '🗓️ Day Before', items: [
                  'Review your prepared answers',
                  "Get a good night's sleep",
                  'Set multiple alarms',
                  'Prepare everything you need'
                ]},
                { category: '📞 Day Of', items: [
                  'Eat a good breakfast',
                  'Leave with plenty of time',
                  'Arrive 10-15 minutes early',
                  'Turn off phone or set to silent',
                  'Bring positive attitude and confidence'
                ]}
              ].map((section, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-slate-800 mb-4">{section.category}</h4>
                  <div className="space-y-2">
                    {section.items.map((item, itemIdx) => (
                      <label key={itemIdx} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded" />
                        <span className="text-sm text-slate-700">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sample Answer Modal */}
      {showSampleAnswer && selectedQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">Sample Answer</h3>
              <button
                onClick={() => {
                  setShowSampleAnswer(false);
                  setSelectedQuestion(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-4 p-4 rounded-lg bg-indigo-50">
              <p className="font-semibold text-slate-800">{selectedQuestion.question}</p>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="mt-2 text-slate-600">Generating sample answer...</p>
              </div>
            ) : selectedQuestion.sampleAnswer ? (
              <div className="text-slate-700 whitespace-pre-wrap">{selectedQuestion.sampleAnswer}</div>
            ) : null}
          </div>
        </div>
      )}

      {/* Practice Modal */}
      {showPracticeModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">Practice Your Answer</h3>
              <button
                onClick={() => {
                  setShowPracticeModal(false);
                  setSelectedQuestion(null);
                  setPracticeAnswer('');
                  setStarMode(false);
                  setStarAnswers({ Situation: '', Task: '', Action: '', Result: '' });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-4 p-4 rounded-lg bg-purple-50">
              <p className="font-semibold text-slate-800">{selectedQuestion.question}</p>
            </div>

            {/* STAR Framework Toggle */}
            <div className="mb-4 flex items-center gap-2">
              <button
                onClick={() => setStarMode(!starMode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  starMode
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {starMode ? '⭐ STAR Mode Active' : '✨ Use STAR Framework'}
              </button>
            </div>

            {/* STAR Framework Builder */}
            {starMode ? (
              <div className="space-y-4">
                {Object.entries({
                  Situation: "What was the situation or context?",
                  Task: "What was your responsibility?",
                  Action: "What specific actions did YOU take?",
                  Result: "What was the outcome? Use numbers!"
                }).map(([key, prompt]) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold mb-2 text-slate-700">
                      {key} <span className="text-xs font-normal text-gray-500">({prompt})</span>
                    </label>
                    <textarea
                      value={starAnswers[key as keyof typeof starAnswers]}
                      onChange={(e) => setStarAnswers({ ...starAnswers, [key]: e.target.value })}
                      placeholder={prompt}
                      className="w-full h-24 px-4 py-2 rounded-lg border border-gray-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    const allFilled = starAnswers.Situation && starAnswers.Task && starAnswers.Action && starAnswers.Result;
                    if (allFilled) {
                      const combined = `Situation: ${starAnswers.Situation}\n\nTask: ${starAnswers.Task}\n\nAction: ${starAnswers.Action}\n\nResult: ${starAnswers.Result}`;
                      setPracticeAnswer(combined);
                      setStarMode(false);
                      alert('Answer combined! Review and edit if needed.');
                    } else {
                      alert('Please fill in all STAR components.');
                    }
                  }}
                  disabled={!starAnswers.Situation || !starAnswers.Task || !starAnswers.Action || !starAnswers.Result}
                  className={`w-full py-2 rounded-lg font-medium transition-colors ${
                    starAnswers.Situation && starAnswers.Task && starAnswers.Action && starAnswers.Result
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  ✓ Combine into Complete Answer
                </button>
              </div>
            ) : (
              <textarea
                value={practiceAnswer}
                onChange={(e) => setPracticeAnswer(e.target.value)}
                placeholder="Write your answer here..."
                className="w-full h-64 px-4 py-3 rounded-lg border border-gray-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  if (practiceAnswer.trim()) {
                    saveAnswer(selectedQuestion.id, practiceAnswer);
                    setShowPracticeModal(false);
                    alert('Answer saved!');
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Save Answer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Company Research Modal */}
      {showCompanyResearch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">
                Company Research: {currentJob?.company}
              </h3>
              <button
                onClick={() => setShowCompanyResearch(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-2 text-slate-600">Researching company...</p>
              </div>
            ) : companyResearch ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Culture & Values</h4>
                  <p className="text-slate-700">{companyResearch.culture}</p>
                </div>
                {companyResearch.values.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Key Values</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {companyResearch.values.map((value, i) => (
                        <li key={i} className="text-slate-700">{value}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {companyResearch.tips.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Interview Tips</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {companyResearch.tips.map((tip, i) => (
                        <li key={i} className="text-slate-700">{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Anxiety Assessment Modal */}
      {showAnxietyAssessment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Interview Anxiety Assessment</h3>
              <button
                onClick={() => setShowAnxietyAssessment(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm mb-6 text-slate-600">
              Rate each statement on a scale of 1-5 (1 = Not worried at all, 5 = Very worried)
            </p>

            <div className="space-y-6">
              {[
                { id: 'nervous', question: 'How nervous do you feel about the interview?' },
                { id: 'stumped', question: 'How worried are you about being stumped by questions?' },
                { id: 'late', question: 'How concerned are you about being late?' },
                { id: 'underqualified', question: 'Do you feel underqualified for this role?' },
                { id: 'unprepared', question: 'How prepared do you feel?' }
              ].map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold mb-3 text-slate-800">{item.question}</p>
                  <div className="flex gap-2 justify-between">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        onClick={() => {
                          setAnxietyAssessmentAnswers({
                            ...anxietyAssessmentAnswers,
                            [item.id]: value
                          });
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          anxietyAssessmentAnswers[item.id] === value
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  const assessment = assessAnxietyLevel();
                  if (assessment) {
                    setAnxietyLevel(assessment.level);
                    if (currentJob?.jobId) {
                      InterviewPrepStorage.saveAnxietyData(currentJob.jobId, {
                        level: assessment.level,
                        fears: assessment.fears,
                        assessmentAnswers: anxietyAssessmentAnswers,
                        date: new Date().toISOString()
                      });
                    }
                    setShowAnxietyAssessment(false);
                    alert(`Assessment complete! Your anxiety level is ${assessment.level}/10.`);
                  } else {
                    alert('Please answer all questions.');
                  }
                }}
                disabled={Object.keys(anxietyAssessmentAnswers).length < 5}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                  Object.keys(anxietyAssessmentAnswers).length === 5
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Complete Assessment
              </button>
              <button
                onClick={() => {
                  setShowAnxietyAssessment(false);
                  setAnxietyAssessmentAnswers({});
                }}
                className="px-6 py-3 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Mock Interview Modal */}
      {showMockInterview && currentJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">
                AI Mock Interview - {currentJob.jobTitle || currentJob.title}
              </h3>
              <button
                onClick={() => {
                  setShowMockInterview(false);
                  setMockInterviewState({ currentQuestion: 0, answers: [] });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {mockInterviewState.currentQuestion < Math.min(5, filteredQuestions.length) ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-indigo-50">
                  <p className="text-sm text-indigo-700 mb-2">
                    Question {mockInterviewState.currentQuestion + 1} of {Math.min(5, filteredQuestions.length)}
                  </p>
                  <p className="font-semibold text-slate-800">
                    {filteredQuestions[mockInterviewState.currentQuestion]?.question || 'Loading...'}
                  </p>
                </div>
                <textarea
                  value={mockInterviewState.currentAnswer || ''}
                  onChange={(e) => setMockInterviewState({ ...mockInterviewState, currentAnswer: e.target.value })}
                  placeholder="Type your answer here..."
                  className="w-full h-48 px-4 py-3 rounded-lg border border-gray-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const newAnswers = [...mockInterviewState.answers, {
                        question: filteredQuestions[mockInterviewState.currentQuestion]?.question || '',
                        answer: mockInterviewState.currentAnswer || ''
                      }];
                      setMockInterviewState({
                        ...mockInterviewState,
                        currentQuestion: mockInterviewState.currentQuestion + 1,
                        answers: newAnswers,
                        currentAnswer: ''
                      });
                    }}
                    disabled={!mockInterviewState.currentAnswer?.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next Question <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setShowMockInterview(false);
                      setMockInterviewState({ currentQuestion: 0, answers: [] });
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                  >
                    End Interview
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-slate-800">Interview Complete! 🎉</h4>
                <p className="text-slate-600">You've completed the mock interview. Review your answers below.</p>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {mockInterviewState.answers.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-lg border bg-gray-50 border-gray-200">
                      <p className="font-semibold mb-2 text-slate-800">Q{idx + 1}: {item.question}</p>
                      <p className="text-sm text-slate-600">{item.answer}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const session: PracticeSession = {
                      jobId: currentJob.jobId,
                      jobTitle: currentJob.jobTitle || currentJob.title,
                      company: currentJob.company,
                      date: new Date().toISOString(),
                      answers: mockInterviewState.answers,
                      duration: mockInterviewState.startTime
                        ? Math.round((new Date().getTime() - mockInterviewState.startTime.getTime()) / 1000 / 60)
                        : 0
                    };
                    InterviewPrepStorage.saveSession(session);
                    setPracticeSessions([...practiceSessions, session]);
                    setShowMockInterview(false);
                    alert('Mock interview session saved!');
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Session
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Button - Mark as Prepared */}
      {currentJob && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <button
            onClick={markInterviewPrepared}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 hover:scale-105"
          >
            <Check className="w-5 h-5" />
            Mark as Prepared
          </button>
        </div>
      )}
    </div>
  );
};

export default InterviewPrep;







