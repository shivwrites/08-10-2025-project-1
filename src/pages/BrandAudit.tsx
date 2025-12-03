import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Linkedin,
  BarChart3,
  Target,
  Award,
  Zap,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Lightbulb,
  Users,
  Eye,
  MessageSquare,
  Briefcase,
  Filter,
  LayoutGrid,
  List,
  Download,
  Plus,
  ChevronRight,
  Star,
  Trophy,
  Flame,
  Calendar,
  Activity,
  PieChart,
  Settings,
  User,
  Globe,
  Github,
  FileText,
  Brain,
  Sparkles,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  type BrandScore,
  type Recommendation,
  type BrandArchetype,
  type BrandAnalysisResult,
  performBrandAnalysis,
  generateBrandScore,
} from '../lib/brandAnalysisEngine';

// Types
interface Insight {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  isRead: boolean;
  tags: string[];
  source: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  deadline: string;
  status: 'active' | 'completed' | 'paused';
  category: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

type TabId = 'dashboard' | 'analysis' | 'intelligence' | 'insights' | 'goals' | 'achievements';

// Mock data generators
const generateMockInsights = (): Insight[] => [
  {
    id: '1',
    title: 'Your LinkedIn Engagement is Trending Up! 📈',
    description: 'Great progress this week! Your brand score improved by 8 points. Your engagement metrics are trending upward.',
    category: 'engagement',
    priority: 'high',
    timestamp: '5 mins ago',
    isRead: false,
    tags: ['linkedin', 'engagement'],
    source: 'brand-audit',
  },
  {
    id: '2',
    title: 'Monthly Brand Review: Strategic Positioning',
    description: 'This month has been a journey of growth and learning. You\'ve made meaningful progress in building your professional brand.',
    category: 'review',
    priority: 'medium',
    timestamp: '2 days ago',
    isRead: true,
    tags: ['review', 'monthly'],
    source: 'brand-audit',
  },
  {
    id: '3',
    title: 'Profile Optimization Opportunity',
    description: 'Adding a professional summary could increase your profile views by up to 30%.',
    category: 'optimization',
    priority: 'high',
    timestamp: '1 week ago',
    isRead: false,
    tags: ['profile', 'optimization'],
    source: 'brand-audit',
  },
  {
    id: '4',
    title: 'Skill Endorsements Growing',
    description: 'Your top skills have received 15 new endorsements this month. Keep showcasing your expertise!',
    category: 'skills',
    priority: 'low',
    timestamp: '2 weeks ago',
    isRead: true,
    tags: ['skills', 'endorsements'],
    source: 'brand-audit',
  },
];

const generateMockGoals = (): Goal[] => [
  {
    id: '1',
    title: 'Reach 500 LinkedIn Connections',
    description: 'Expand your professional network',
    targetValue: 500,
    currentValue: 385,
    deadline: '2025-03-01',
    status: 'active',
    category: 'network',
  },
  {
    id: '2',
    title: 'Complete Profile to 100%',
    description: 'Fill out all LinkedIn profile sections',
    targetValue: 100,
    currentValue: 85,
    deadline: '2025-02-15',
    status: 'active',
    category: 'profile',
  },
  {
    id: '3',
    title: 'Post Weekly Content',
    description: 'Share valuable insights regularly',
    targetValue: 12,
    currentValue: 4,
    deadline: '2025-04-01',
    status: 'active',
    category: 'content',
  },
];

const generateMockAchievements = (): Achievement[] => [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first brand audit',
    icon: '🎯',
    unlockedAt: '2025-01-15',
    category: 'milestones',
    rarity: 'common',
  },
  {
    id: '2',
    title: 'Rising Star',
    description: 'Reach a brand score of 70+',
    icon: '⭐',
    unlockedAt: '2025-01-20',
    category: 'score',
    rarity: 'rare',
  },
  {
    id: '3',
    title: 'Network Builder',
    description: 'Connect with 250+ professionals',
    icon: '🤝',
    unlockedAt: null,
    category: 'network',
    rarity: 'rare',
  },
  {
    id: '4',
    title: 'Thought Leader',
    description: 'Receive 100+ engagements on a post',
    icon: '💡',
    unlockedAt: null,
    category: 'content',
    rarity: 'epic',
  },
  {
    id: '5',
    title: 'Brand Master',
    description: 'Achieve a perfect brand score of 100',
    icon: '👑',
    unlockedAt: null,
    category: 'score',
    rarity: 'legendary',
  },
];

// Mock brand score history for charts
const generateScoreHistory = () => {
  const history = [];
  const baseScore = 55;
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i * 7);
    history.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: Math.min(100, baseScore + Math.floor(Math.random() * 10) + (6 - i) * 3),
      visibility: Math.min(100, 60 + Math.floor(Math.random() * 15) + (6 - i) * 2),
      engagement: Math.min(100, 50 + Math.floor(Math.random() * 12) + (6 - i) * 3),
    });
  }
  return history;
};

// Component
export default function BrandAudit() {
  // State
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'analyzing' | 'complete'>('idle');
  const [brandScore, setBrandScore] = useState<BrandScore>({
    overall: 78,
    linkedin: 82,
    resume: 75,
    portfolio: 70,
    github: 68,
  });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: '1',
      priority: 'high',
      category: 'LinkedIn',
      title: 'Complete Your LinkedIn Profile',
      description: 'Your profile is missing key information that could improve visibility.',
      impact: 'High impact',
      difficulty: 'easy',
      example: 'Add a professional headline and about section.',
      actionableSteps: ['Update headline', 'Write summary', 'Add experience details'],
    },
    {
      id: '2',
      priority: 'medium',
      category: 'Resume',
      title: 'Add Quantifiable Achievements',
      description: 'Include metrics and numbers to demonstrate your impact.',
      impact: 'Medium impact',
      difficulty: 'medium',
      example: 'Changed "Improved sales" to "Increased sales by 35% in Q2 2024"',
      actionableSteps: ['Review each role', 'Add numbers/percentages', 'Quantify impact'],
    },
    {
      id: '3',
      priority: 'medium',
      category: 'GitHub',
      title: 'Improve Repository Documentation',
      description: 'Add README files to your repositories for better visibility.',
      impact: 'Medium impact',
      difficulty: 'easy',
      example: 'Include project description, setup instructions, and screenshots.',
      actionableSteps: ['Create README template', 'Add to each repo', 'Include screenshots'],
    },
  ]);
  const [brandArchetype, setBrandArchetype] = useState<BrandArchetype>({
    name: 'The Innovator',
    description: 'A forward-thinking professional who combines technical expertise with creative problem-solving.',
    traits: ['Creative', 'Technical', 'Growth-minded'],
  });
  const [insights, setInsights] = useState<Insight[]>(generateMockInsights());
  const [goals, setGoals] = useState<Goal[]>(generateMockGoals());
  const [achievements, setAchievements] = useState<Achievement[]>(generateMockAchievements());
  const [scoreHistory] = useState(generateScoreHistory());
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleString());
  const [linkedinConnected, setLinkedinConnected] = useState(true);
  const [insightFilter, setInsightFilter] = useState<string>('all');
  const [insightView, setInsightView] = useState<'grid' | 'list'>('grid');

  // Radar chart data
  const radarData = [
    { metric: 'Visibility', value: brandScore.linkedin, fullMark: 100 },
    { metric: 'Engagement', value: 75, fullMark: 100 },
    { metric: 'Presence', value: brandScore.portfolio, fullMark: 100 },
    { metric: 'Network', value: 70, fullMark: 100 },
    { metric: 'Content', value: brandScore.github, fullMark: 100 },
    { metric: 'Skills', value: brandScore.resume, fullMark: 100 },
  ];

  // Analysis function
  const runBrandAnalysis = useCallback(async () => {
    setAnalysisStatus('analyzing');
    
    // Simulate analysis with progress
    const steps = ['Analyzing LinkedIn profile...', 'Scanning resume content...', 'Evaluating portfolio...', 'Checking GitHub activity...', 'Generating insights...'];
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Generate new scores with slight improvements
    const newScore: BrandScore = {
      overall: Math.min(100, brandScore.overall + Math.floor(Math.random() * 5)),
      linkedin: Math.min(100, brandScore.linkedin + Math.floor(Math.random() * 3)),
      resume: Math.min(100, brandScore.resume + Math.floor(Math.random() * 4)),
      portfolio: Math.min(100, brandScore.portfolio + Math.floor(Math.random() * 3)),
      github: Math.min(100, brandScore.github + Math.floor(Math.random() * 3)),
    };

    setBrandScore(newScore);
    setLastUpdated(new Date().toLocaleString());
    setAnalysisStatus('complete');

    // Add new insight
    const newInsight: Insight = {
      id: Date.now().toString(),
      title: 'Brand Re-analysis Complete! 🎉',
      description: `Your brand score is now ${newScore.overall}/100. Great progress!`,
      category: 'review',
      priority: 'high',
      timestamp: 'Just now',
      isRead: false,
      tags: ['analysis', 'update'],
      source: 'brand-audit',
    };
    setInsights(prev => [newInsight, ...prev]);
  }, [brandScore]);

  // Get score color
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'from-slate-400 to-slate-500';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-slate-400 to-slate-500';
    }
  };

  // Tab configuration
  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'analysis', label: 'Brand Analysis', icon: <PieChart className="w-4 h-4" /> },
    { id: 'intelligence', label: 'Brand Intelligence', icon: <Brain className="w-4 h-4" /> },
    { id: 'insights', label: 'Insights', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'goals', label: 'Goals', icon: <Target className="w-4 h-4" /> },
    { id: 'achievements', label: 'Achievements', icon: <Trophy className="w-4 h-4" /> },
  ];

  // Render Dashboard Tab
  const renderDashboardTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content - Left 2/3 */}
      <div className="lg:col-span-2 space-y-6">
        {/* Overall Brand Score */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Your Overall Brand Score
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-bold ${getScoreColor(brandScore.overall)}`}>
                {brandScore.overall}
              </span>
              <span className="text-slate-500">/ 100</span>
            </div>
            <button
              onClick={runBrandAnalysis}
              disabled={analysisStatus === 'analyzing'}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50"
            >
              {analysisStatus === 'analyzing' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Re-analyze Brand
                </>
              )}
            </button>
          </div>
          <p className="text-slate-500 text-sm mt-2">Last updated: {lastUpdated}</p>
        </div>

        {/* Key Metrics Breakdown */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Key Metrics Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'LinkedIn', score: brandScore.linkedin, icon: <Linkedin className="w-5 h-5" /> },
              { label: 'Resume', score: brandScore.resume, icon: <FileText className="w-5 h-5" /> },
              { label: 'Portfolio', score: brandScore.portfolio, icon: <Globe className="w-5 h-5" /> },
              { label: 'GitHub', score: brandScore.github, icon: <Github className="w-5 h-5" /> },
            ].map((metric) => (
              <div key={metric.label} className="bg-slate-50 rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2 text-slate-500">{metric.icon}</div>
                <div className={`text-2xl font-bold ${getScoreColor(metric.score)}`}>
                  {metric.score}
                </div>
                <div className="text-slate-500 text-sm capitalize">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Recommendations */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Top Recommendations</h3>
          <div className="space-y-3">
            {recommendations.slice(0, 3).map((rec) => (
              <div key={rec.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-slate-800">{rec.title}</h4>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(rec.difficulty)}`}>
                    {rec.difficulty}
                  </span>
                </div>
                <p className="text-slate-600 text-sm line-clamp-2">{rec.description}</p>
                <button className="text-indigo-600 text-sm mt-2 flex items-center gap-1 hover:text-indigo-800">
                  View Details <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar - Right 1/3 */}
      <div className="space-y-6">
        {/* LinkedIn Connection Status */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">LinkedIn Connection</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Linkedin className={`w-6 h-6 ${linkedinConnected ? 'text-blue-500' : 'text-slate-400'}`} />
              <span className="font-medium text-slate-800">
                {linkedinConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <button className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm disabled:opacity-50">
              {linkedinConnected ? 'Sync Now' : 'Connect'}
            </button>
          </div>
          {linkedinConnected && (
            <p className="text-slate-500 text-xs mt-2">Last synced: {lastUpdated}</p>
          )}
        </div>

        {/* Recent Insights */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Insights</h3>
          <div className="space-y-3">
            {insights.slice(0, 2).map((insight) => (
              <div key={insight.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-slate-800 text-sm">{insight.title}</h4>
                  {!insight.isRead && (
                    <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">New</span>
                  )}
                </div>
                <p className="text-slate-600 text-xs line-clamp-2">{insight.description}</p>
                <button className="text-indigo-600 text-xs mt-2 hover:text-indigo-800">Read More</button>
              </div>
            ))}
          </div>
        </div>

        {/* Goals Progress */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Goals Progress</h3>
          <div className="space-y-3">
            {goals.slice(0, 2).map((goal) => (
              <div key={goal.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-slate-800 text-sm">{goal.title}</h4>
                  <span className="text-xs text-slate-500">
                    {Math.round((goal.currentValue / goal.targetValue) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(goal.currentValue / goal.targetValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Achievements</h3>
          <div className="space-y-3">
            {achievements.filter(a => a.unlockedAt).slice(0, 2).map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-3 bg-slate-50 rounded-lg p-3 border border-slate-200">
                <span className="text-2xl">{achievement.icon}</span>
                <div>
                  <h4 className="font-medium text-slate-800 text-sm">{achievement.title}</h4>
                  <p className="text-slate-500 text-xs">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Render Analysis Tab
  const renderAnalysisTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Brand Analysis</h2>
          <p className="text-slate-600 text-sm mt-1">Comprehensive overview of your personal brand performance</p>
        </div>
        <button
          onClick={runBrandAnalysis}
          disabled={analysisStatus === 'analyzing'}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${analysisStatus === 'analyzing' ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Brand Archetype */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border border-purple-200 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <User className="w-6 h-6 text-purple-600" />
          Your Brand Archetype
        </h3>
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold text-purple-700">{brandArchetype.name}</h4>
            <p className="text-slate-600 mt-2">{brandArchetype.description}</p>
            <div className="flex gap-2 mt-3">
              {brandArchetype.traits.map((trait) => (
                <span key={trait} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {trait}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Skills Radar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Score Trend */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Score Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={scoreHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                fill="url(#colorScore)"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendations Dashboard */}
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border border-amber-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-amber-600" />
              Actionable Recommendations
            </h3>
            <p className="text-sm text-slate-600 mt-1">Prioritized recommendations to improve your brand score</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-sm font-medium text-slate-700">Filter by:</span>
          {['all', 'LinkedIn', 'Resume', 'Portfolio', 'GitHub', 'General'].map((cat) => (
            <button
              key={cat}
              onClick={() => setInsightFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                insightFilter === cat
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>

        {/* Recommendations List */}
        <div className="space-y-4">
          {recommendations
            .filter(rec => insightFilter === 'all' || rec.category === insightFilter)
            .map((rec) => (
              <div key={rec.id} className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(rec.priority)}`}>
                        {rec.priority} priority
                      </span>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        {rec.category}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(rec.difficulty)}`}>
                        {rec.difficulty}
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-1">{rec.title}</h4>
                    <p className="text-slate-600 text-sm mb-3">{rec.description}</p>
                    {rec.actionableSteps && rec.actionableSteps.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-slate-700 mb-2">Action steps:</p>
                        <div className="flex flex-wrap gap-2">
                          {rec.actionableSteps.map((step, i) => (
                            <span key={i} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                              {i + 1}. {step}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                    Start <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Industry Benchmarking */}
      <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 border border-violet-200 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-violet-600" />
          Industry Benchmarking
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/60 rounded-xl p-5 border border-violet-200">
            <div className="text-3xl font-bold text-violet-600">Top 25%</div>
            <div className="text-sm text-slate-600 mt-1">You outperform 75% of professionals in your industry</div>
          </div>
          <div className="bg-white/60 rounded-xl p-5 border border-violet-200">
            <div className="text-3xl font-bold text-green-600">+12</div>
            <div className="text-sm text-slate-600 mt-1">Points above industry average (66)</div>
          </div>
          <div className="bg-white/60 rounded-xl p-5 border border-violet-200">
            <div className="text-3xl font-bold text-blue-600">8 pts</div>
            <div className="text-sm text-slate-600 mt-1">To reach top 10% (requires 86+)</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Intelligence Tab
  const renderIntelligenceTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Brand Intelligence</h2>
          <p className="text-slate-600 text-sm mt-1">AI-powered insights and predictive analytics</p>
        </div>
      </div>

      {/* Predictive Analytics */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          Score Forecasting
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/60 rounded-xl p-5 border border-blue-200 text-center">
            <div className="text-xs text-slate-500 mb-1">7 Days</div>
            <div className="text-3xl font-bold text-blue-600">{Math.min(100, brandScore.overall + 3)}</div>
          </div>
          <div className="bg-white/60 rounded-xl p-5 border border-indigo-200 text-center">
            <div className="text-xs text-slate-500 mb-1">30 Days</div>
            <div className="text-3xl font-bold text-indigo-600">{Math.min(100, brandScore.overall + 8)}</div>
          </div>
          <div className="bg-white/60 rounded-xl p-5 border border-purple-200 text-center">
            <div className="text-xs text-slate-500 mb-1">90 Days</div>
            <div className="text-3xl font-bold text-purple-600">{Math.min(100, brandScore.overall + 15)}</div>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-white/60 rounded-xl p-5 border border-blue-200">
          <h4 className="font-semibold text-slate-800 mb-4">Projected Trend</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={scoreHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" name="Overall" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
              <Line type="monotone" dataKey="visibility" name="Visibility" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
              <Line type="monotone" dataKey="engagement" name="Engagement" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Competitive Analysis */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-600" />
          Competitive Analysis
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[
              { name: 'You', score: brandScore.overall },
              { name: 'Industry Avg', score: 66 },
              { name: 'Top 25%', score: 75 },
              { name: 'Top 10%', score: 86 },
              { name: 'Top 1%', score: 95 },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]}>
              {/* Dynamic colors would go here */}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // Render Insights Tab
  const renderInsightsTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">AI-Generated Insights</h2>
          <p className="text-slate-600 text-sm mt-1">Discover actionable recommendations to improve your personal brand</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 flex-wrap">
            <select className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="all">All Categories</option>
              <option value="engagement">Engagement</option>
              <option value="review">Review</option>
              <option value="optimization">Optimization</option>
              <option value="content">Content</option>
            </select>
            <select className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          <div className="flex items-center gap-2 border border-slate-300 rounded-lg p-1 bg-white">
            <button
              onClick={() => setInsightView('grid')}
              className={`px-3 py-1 rounded text-sm transition-colors ${insightView === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setInsightView('list')}
              className={`px-3 py-1 rounded text-sm transition-colors ${insightView === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-xl p-4">
          <div className="text-2xl font-bold text-slate-800">{insights.length}</div>
          <div className="text-sm text-slate-600">Total Insights</div>
        </div>
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-xl p-4">
          <div className="text-2xl font-bold text-red-600">{insights.filter(i => !i.isRead).length}</div>
          <div className="text-sm text-slate-600">Unread</div>
        </div>
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-xl p-4">
          <div className="text-2xl font-bold text-yellow-600">{insights.filter(i => i.priority === 'high').length}</div>
          <div className="text-sm text-slate-600">High Priority</div>
        </div>
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-xl p-4">
          <div className="text-2xl font-bold text-green-600">{insights.length}</div>
          <div className="text-sm text-slate-600">Actionable</div>
        </div>
      </div>

      {/* Insights Grid/List */}
      <div className={insightView === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`bg-white/50 backdrop-blur-xl border ${!insight.isRead ? 'border-indigo-300' : 'border-white/30'} shadow-lg rounded-2xl p-6 transition-all hover:shadow-xl`}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(insight.priority)}`}>
                  {insight.priority}
                </span>
                {!insight.isRead && (
                  <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">New</span>
                )}
              </div>
              <span className="text-xs text-slate-500">{insight.timestamp}</span>
            </div>
            <h4 className="font-semibold text-slate-800 mb-2">{insight.title}</h4>
            <p className="text-slate-600 text-sm mb-4">{insight.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {insight.tags.map((tag) => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                  #{tag}
                </span>
              ))}
            </div>
            <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800 flex items-center gap-1">
              Read More <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Goals Tab
  const renderGoalsTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Brand Goals</h2>
          <p className="text-slate-600 text-sm mt-1">Track your progress towards your personal brand objectives</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = (goal.currentValue / goal.targetValue) * 100;
          return (
            <div key={goal.id} className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  goal.status === 'active' ? 'bg-green-100 text-green-700' :
                  goal.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {goal.status}
                </span>
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">{goal.title}</h4>
              <p className="text-slate-600 text-sm mb-4">{goal.description}</p>
              <div className="mb-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600">{goal.currentValue} / {goal.targetValue}</span>
                  <span className="font-medium text-indigo-600">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3 h-3" />
                <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render Achievements Tab
  const renderAchievementsTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Achievements</h2>
          <p className="text-slate-600 text-sm mt-1">Celebrate your brand building milestones</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">
            {achievements.filter(a => a.unlockedAt).length} / {achievements.length} unlocked
          </span>
        </div>
      </div>

      {/* Achievement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['common', 'rare', 'epic', 'legendary'].map((rarity) => (
          <div key={rarity} className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold bg-gradient-to-r ${getRarityColor(rarity)} bg-clip-text text-transparent`}>
              {achievements.filter(a => a.rarity === rarity && a.unlockedAt).length}
            </div>
            <div className="text-sm text-slate-600 capitalize">{rarity}</div>
          </div>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`relative bg-white/50 backdrop-blur-xl border shadow-lg rounded-2xl p-6 transition-all ${
              achievement.unlockedAt ? 'border-white/30' : 'border-slate-200 opacity-60'
            }`}
          >
            {/* Rarity indicator */}
            <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${getRarityColor(achievement.rarity)}`} />
            
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${
                achievement.unlockedAt 
                  ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)}` 
                  : 'bg-slate-200'
              }`}>
                {achievement.unlockedAt ? achievement.icon : '🔒'}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800">{achievement.title}</h4>
                <p className="text-slate-600 text-sm mt-1">{achievement.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white`}>
                    {achievement.rarity}
                  </span>
                  {achievement.unlockedAt && (
                    <span className="text-xs text-slate-500">
                      Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardTab();
      case 'analysis':
        return renderAnalysisTab();
      case 'intelligence':
        return renderIntelligenceTab();
      case 'insights':
        return renderInsightsTab();
      case 'goals':
        return renderGoalsTab();
      case 'achievements':
        return renderAchievementsTab();
      default:
        return renderDashboardTab();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="pt-6">
        {/* Navigation Tabs */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-lg p-1.5 grid grid-cols-3 md:grid-cols-6 gap-1.5 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-indigo-50'
              }`}
            >
              {tab.icon}
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}





