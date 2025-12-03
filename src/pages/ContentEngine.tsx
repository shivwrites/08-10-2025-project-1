import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PenTool,
  Calendar,
  Share2,
  MessageCircle,
  ThumbsUp,
  BarChart3,
  TrendingUp,
  Target,
  Sparkles,
  Zap,
  FileText,
  Copy,
  Download,
  Clock,
  Eye,
  RefreshCw,
  Plus,
  ChevronRight,
  ChevronLeft,
  Settings,
  Filter,
  Search,
  LayoutGrid,
  List,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Bookmark,
  Trash2,
  Edit3,
  MoreVertical,
  Send,
  Linkedin,
  Twitter,
  Globe,
  ArrowRight,
  Award,
  Users,
  Hash,
  Layers,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Legend,
} from 'recharts';

// Types
interface ContentItem {
  id: number;
  type: string;
  title: string;
  content: string;
  metadata: {
    topic?: string;
    platforms?: string[];
    tone?: string;
    timestamp?: number;
    expertiseArea?: string;
    estimatedEngagement?: number;
  };
}

interface ScheduledPost {
  id: number;
  content: string;
  title: string;
  platform: string;
  scheduledDate: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'publishing';
  contentType: string;
  metadata: {
    originalContentId?: number | null;
    tone?: string;
    visibility?: string;
    retryCount?: number;
    errorMessage?: string | null;
    publishedAt?: string | null;
    createdAt?: string;
  };
}

interface ExpertiseArea {
  id: number;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  authorityScore: number;
  contentCount: number;
  lastUpdated: number;
  createdAt: number;
}

interface ContentSuggestion {
  id: number;
  topic: string;
  angle: string;
  contentType: string;
  estimatedEngagement: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeToCreate: string;
  platforms: string[];
}

interface TrendingTopic {
  id: number;
  title: string;
  relevanceScore: number;
  engagementPotential: number;
  competitionLevel: 'Low' | 'Medium' | 'High';
  timeframe: string;
  category: string;
  keywords: string[];
}

interface AnalyticsData {
  totalContent: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  averageEngagementRate: number;
  contentByPlatform: Record<string, number>;
  contentByType: Record<string, number>;
  topPerformingContent: Array<{
    id: string;
    title: string;
    platform: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagement_rate: number;
  }>;
  generationStats: {
    totalGenerated: number;
    postsGenerated: number;
    articlesGenerated: number;
    threadsGenerated: number;
    totalWords: number;
    averageWordsPerContent: number;
  };
  scheduledStats: {
    total: number;
    drafts: number;
    scheduled: number;
    published: number;
    failed: number;
  };
  timeSeriesData: Array<{
    date: string;
    contentGenerated: number;
    views: number;
    engagement: number;
  }>;
  expertiseAreaStats: Array<{
    name: string;
    contentCount: number;
    averageEngagement: number;
    totalViews: number;
  }>;
}

type TabId = 'dashboard' | 'generator' | 'calendar' | 'analytics' | 'templates';

// Storage keys
const CONTENT_STORAGE_KEY = 'content_engine_generated_content';
const SCHEDULED_POSTS_STORAGE_KEY = 'content_engine_scheduled_posts';
const EXPERTISE_STORAGE_KEY = 'content_engine_expertise_areas';

// Mock data
const trendingTopics: TrendingTopic[] = [
  {
    id: 1,
    title: 'AI Ethics in Software Development',
    relevanceScore: 92,
    engagementPotential: 85,
    competitionLevel: 'Medium',
    timeframe: 'This Week',
    category: 'Technology',
    keywords: ['AI', 'Ethics', 'Development', 'Responsibility'],
  },
  {
    id: 2,
    title: 'Remote Work Culture Evolution',
    relevanceScore: 88,
    engagementPotential: 78,
    competitionLevel: 'High',
    timeframe: 'This Month',
    category: 'Workplace',
    keywords: ['Remote Work', 'Culture', 'Productivity', 'Team Building'],
  },
  {
    id: 3,
    title: 'Sustainable Tech Practices',
    relevanceScore: 85,
    engagementPotential: 72,
    competitionLevel: 'Low',
    timeframe: 'Next Week',
    category: 'Sustainability',
    keywords: ['Green Tech', 'Sustainability', 'Environment', 'Innovation'],
  },
];

const contentSuggestions: ContentSuggestion[] = [
  {
    id: 1,
    topic: 'The Future of AI in Healthcare',
    angle: 'Personal experience with AI diagnostics',
    contentType: 'LinkedIn Post',
    estimatedEngagement: 450,
    difficulty: 'Medium',
    timeToCreate: '15 min',
    platforms: ['LinkedIn', 'Twitter'],
  },
  {
    id: 2,
    topic: 'Building Inclusive Tech Teams',
    angle: 'Data-driven approach to diversity',
    contentType: 'Article',
    estimatedEngagement: 320,
    difficulty: 'Easy',
    timeToCreate: '25 min',
    platforms: ['LinkedIn', 'Medium'],
  },
  {
    id: 3,
    topic: 'Cybersecurity Best Practices',
    angle: 'Lessons from recent breaches',
    contentType: 'Thread',
    estimatedEngagement: 280,
    difficulty: 'Hard',
    timeToCreate: '20 min',
    platforms: ['Twitter', 'LinkedIn'],
  },
];

const defaultExpertiseAreas: ExpertiseArea[] = [
  {
    id: 1,
    name: 'Software Architecture',
    level: 'Expert',
    authorityScore: 85,
    contentCount: 24,
    lastUpdated: Date.now() - 2 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  },
  {
    id: 2,
    name: 'AI & Machine Learning',
    level: 'Advanced',
    authorityScore: 72,
    contentCount: 18,
    lastUpdated: Date.now() - 7 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
  },
  {
    id: 3,
    name: 'DevOps & Infrastructure',
    level: 'Intermediate',
    authorityScore: 58,
    contentCount: 12,
    lastUpdated: Date.now() - 14 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
  },
];

// Helper functions
const loadContentHistory = (): ContentItem[] => {
  try {
    const stored = localStorage.getItem(CONTENT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading content history:', error);
    return [];
  }
};

const saveContentToHistory = (contentData: Omit<ContentItem, 'id'>): ContentItem => {
  const history = loadContentHistory();
  const newContent: ContentItem = {
    id: Date.now(),
    ...contentData,
    metadata: {
      ...contentData.metadata,
      timestamp: Date.now(),
    },
  };
  history.unshift(newContent);
  const limitedHistory = history.slice(0, 100);
  localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(limitedHistory));
  return newContent;
};

const loadScheduledPosts = (): ScheduledPost[] => {
  try {
    const stored = localStorage.getItem(SCHEDULED_POSTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading scheduled posts:', error);
    return [];
  }
};

const saveScheduledPost = (postData: Partial<ScheduledPost>): ScheduledPost => {
  const posts = loadScheduledPosts();
  const newPost: ScheduledPost = {
    id: postData.id || Date.now(),
    content: postData.content || '',
    title: postData.title || (postData.content?.substring(0, 50) + '...') || '',
    platform: postData.platform || 'LinkedIn',
    scheduledDate: postData.scheduledDate || new Date().toISOString(),
    status: postData.status || 'draft',
    contentType: postData.contentType || 'post',
    metadata: {
      originalContentId: postData.metadata?.originalContentId || null,
      tone: postData.metadata?.tone || 'professional',
      visibility: postData.metadata?.visibility || 'PUBLIC',
      retryCount: postData.metadata?.retryCount || 0,
      errorMessage: postData.metadata?.errorMessage || null,
      publishedAt: postData.metadata?.publishedAt || null,
      createdAt: postData.metadata?.createdAt || new Date().toISOString(),
    },
  };
  posts.push(newPost);
  posts.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  localStorage.setItem(SCHEDULED_POSTS_STORAGE_KEY, JSON.stringify(posts));
  return newPost;
};

const loadExpertiseAreas = (): ExpertiseArea[] => {
  try {
    const stored = localStorage.getItem(EXPERTISE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultExpertiseAreas;
  } catch (error) {
    console.error('Error loading expertise areas:', error);
    return defaultExpertiseAreas;
  }
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const formatPercentage = (num: number): string => {
  return num.toFixed(1) + '%';
};

const getTimeAgo = (date: Date | number): string => {
  const now = new Date();
  const d = typeof date === 'number' ? new Date(date) : date;
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Main Component
const ContentEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [activeGenerator, setActiveGenerator] = useState<string | null>(null);
  const [contentHistory, setContentHistory] = useState<ContentItem[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [expertiseAreas, setExpertiseAreas] = useState<ExpertiseArea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    topic?: string;
    targetAudience?: string;
    tone?: string;
    platforms?: string[];
    contentType?: string;
    contentLength?: string;
    expertiseArea?: string;
  }>({});

  // Calendar state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState(30);

  // Load data on mount
  useEffect(() => {
    setContentHistory(loadContentHistory());
    setScheduledPosts(loadScheduledPosts());
    setExpertiseAreas(loadExpertiseAreas());
  }, []);

  // Simulate AI content generation
  const generateContent = async (type: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      let content = '';
      const topic = formData.topic || 'professional development';
      const tone = formData.tone || 'professional';

      switch (type) {
        case 'post':
          content = `🚀 ${topic.charAt(0).toUpperCase() + topic.slice(1)}\n\nAs professionals, we often overlook the importance of continuous growth in our field.\n\nHere are 3 key insights I've learned:\n\n1️⃣ Stay curious - Never stop learning\n2️⃣ Build connections - Your network is your net worth\n3️⃣ Share knowledge - Teaching others reinforces your own understanding\n\nWhat strategies have helped you grow professionally? Let me know in the comments! 👇\n\n#ProfessionalDevelopment #CareerGrowth #Leadership`;
          break;
        case 'article':
          content = `# ${topic.charAt(0).toUpperCase() + topic.slice(1)}: A Comprehensive Guide\n\n## Introduction\n\nIn today's rapidly evolving professional landscape, understanding ${topic} has become more crucial than ever...\n\n## Key Insights\n\n### 1. The Foundation\nBuilding a strong foundation in ${topic} requires dedication and consistent effort...\n\n### 2. Advanced Strategies\nOnce you've mastered the basics, these advanced strategies will help you excel...\n\n### 3. Future Trends\nLooking ahead, the industry is moving towards...\n\n## Conclusion\n\nEmbracing these principles will position you for success in your professional journey.`;
          break;
        case 'thread':
          content = `🧵 THREAD: Everything you need to know about ${topic}\n\n1/ Let's dive deep into what makes ${topic} so important in today's world.\n\n2/ First, understand the fundamentals. Without a strong foundation, everything else falls apart.\n\n3/ Next, practice consistently. Theory without application is meaningless.\n\n4/ Connect with others who share your interests. Community accelerates learning.\n\n5/ Finally, never stop iterating. The best professionals are always improving.\n\n6/ What's your biggest challenge with ${topic}? Reply and let's discuss! 🔥`;
          break;
        default:
          content = `Generated content about ${topic} with a ${tone} tone.`;
      }

      setGeneratedContent(content);

      // Save to history
      const savedContent = saveContentToHistory({
        type,
        title: topic,
        content,
        metadata: {
          topic,
          platforms: formData.platforms || ['LinkedIn'],
          tone,
          expertiseArea: formData.expertiseArea,
        },
      });

      setContentHistory([savedContent, ...contentHistory.slice(0, 99)]);
    } catch (err) {
      setError('Failed to generate content. Please try again.');
      console.error('Error generating content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate dashboard metrics
  const dashboardMetrics = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const contentThisWeek = contentHistory.filter((item) => {
      const itemDate = new Date(item.metadata?.timestamp || 0);
      return itemDate >= oneWeekAgo;
    }).length;

    const publishedThisWeek = scheduledPosts.filter((post) => {
      const postDate = new Date(post.scheduledDate);
      return postDate >= oneWeekAgo && post.status === 'published';
    }).length;

    const avgAuthority =
      expertiseAreas.length > 0
        ? Math.round(expertiseAreas.reduce((sum, area) => sum + area.authorityScore, 0) / expertiseAreas.length)
        : 0;

    return {
      contentGeneratedThisWeek: contentThisWeek,
      publishedThisWeek,
      totalContent: contentHistory.length,
      scheduledCount: scheduledPosts.filter((p) => p.status === 'scheduled').length,
      avgAuthorityScore: avgAuthority,
      expertiseCount: expertiseAreas.length,
    };
  }, [contentHistory, scheduledPosts, expertiseAreas]);

  // Generate mock analytics data
  useEffect(() => {
    if (activeTab === 'analytics') {
      setAnalyticsLoading(true);
      // Simulate loading analytics
      setTimeout(() => {
        const mockData: AnalyticsData = {
          totalContent: contentHistory.length || 42,
          totalViews: 15420,
          totalLikes: 892,
          totalComments: 234,
          totalShares: 156,
          averageEngagementRate: 4.8,
          contentByPlatform: {
            LinkedIn: 28,
            Twitter: 12,
            Medium: 2,
          },
          contentByType: {
            Post: 25,
            Article: 10,
            Thread: 7,
          },
          topPerformingContent: [
            {
              id: '1',
              title: 'AI in Modern Development',
              platform: 'LinkedIn',
              views: 2450,
              likes: 156,
              comments: 42,
              shares: 28,
              engagement_rate: 8.2,
            },
            {
              id: '2',
              title: 'Remote Work Best Practices',
              platform: 'LinkedIn',
              views: 1890,
              likes: 98,
              comments: 31,
              shares: 19,
              engagement_rate: 6.5,
            },
            {
              id: '3',
              title: 'Building Effective Teams',
              platform: 'Twitter',
              views: 1560,
              likes: 87,
              comments: 25,
              shares: 15,
              engagement_rate: 5.8,
            },
          ],
          generationStats: {
            totalGenerated: contentHistory.length || 42,
            postsGenerated: 25,
            articlesGenerated: 10,
            threadsGenerated: 7,
            totalWords: 28500,
            averageWordsPerContent: 678,
          },
          scheduledStats: {
            total: scheduledPosts.length || 12,
            drafts: scheduledPosts.filter((p) => p.status === 'draft').length || 3,
            scheduled: scheduledPosts.filter((p) => p.status === 'scheduled').length || 5,
            published: scheduledPosts.filter((p) => p.status === 'published').length || 4,
            failed: scheduledPosts.filter((p) => p.status === 'failed').length || 0,
          },
          timeSeriesData: Array.from({ length: timeRange }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (timeRange - 1 - i));
            return {
              date: date.toISOString().split('T')[0],
              contentGenerated: Math.floor(Math.random() * 3),
              views: Math.floor(Math.random() * 500) + 100,
              engagement: Math.floor(Math.random() * 50) + 10,
            };
          }),
          expertiseAreaStats: expertiseAreas.map((area) => ({
            name: area.name,
            contentCount: area.contentCount,
            averageEngagement: area.authorityScore * 0.08,
            totalViews: area.contentCount * Math.floor(Math.random() * 200 + 100),
          })),
        };
        setAnalyticsData(mockData);
        setAnalyticsLoading(false);
      }, 1000);
    }
  }, [activeTab, timeRange, contentHistory, scheduledPosts, expertiseAreas]);

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Tab components
  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'generator', label: 'Create', icon: <PenTool className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'templates', label: 'Templates', icon: <Bookmark className="w-4 h-4" /> },
  ];

  const generators = [
    { id: 'post-generator', name: 'Post Generator', icon: <FileText className="w-5 h-5" />, description: 'Create engaging social media posts' },
    { id: 'article-generator', name: 'Article Writer', icon: <BookOpen className="w-5 h-5" />, description: 'Write long-form articles and blog posts' },
    { id: 'thread-generator', name: 'Thread Maker', icon: <MessageSquare className="w-5 h-5" />, description: 'Create Twitter/X threads' },
    { id: 'carousel-maker', name: 'Carousel Maker', icon: <Layers className="w-5 h-5" />, description: 'Design carousel slide content' },
  ];

  // Render Dashboard Tab
  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">This Week</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{dashboardMetrics.contentGeneratedThisWeek}</div>
          <div className="text-sm text-gray-600">Content Generated</div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Send className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Published</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{dashboardMetrics.publishedThisWeek}</div>
          <div className="text-sm text-gray-600">Posts This Week</div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-full">Queued</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{dashboardMetrics.scheduledCount}</div>
          <div className="text-sm text-gray-600">Scheduled Posts</div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">Authority</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{dashboardMetrics.avgAuthorityScore}%</div>
          <div className="text-sm text-gray-600">Average Authority</div>
        </div>
      </div>

      {/* Quick Actions & Trending Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Quick Create</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {generators.map((gen) => (
              <button
                key={gen.id}
                onClick={() => {
                  setActiveTab('generator');
                  setActiveGenerator(gen.id);
                }}
                className="flex flex-col items-center gap-3 p-4 bg-white/60 hover:bg-white/80 border border-gray-200 rounded-xl transition-all duration-200 hover:shadow-md group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-violet-100 group-hover:to-purple-100 rounded-xl flex items-center justify-center transition-colors">
                  {gen.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{gen.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Trending Topics */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Trending Topics</h2>
          </div>
          <div className="space-y-4">
            {trendingTopics.map((topic) => (
              <div
                key={topic.id}
                className="flex items-center justify-between p-4 bg-white/60 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{topic.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{topic.category}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-500">{topic.timeframe}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                    topic.competitionLevel === 'Low' ? 'text-green-600 bg-green-100' :
                    topic.competitionLevel === 'Medium' ? 'text-yellow-600 bg-yellow-100' :
                    'text-red-600 bg-red-100'
                  }`}>
                    {topic.competitionLevel}
                  </div>
                  <button
                    onClick={() => {
                      setFormData({ topic: topic.title });
                      setActiveTab('generator');
                      setActiveGenerator('post-generator');
                    }}
                    className="p-2 text-violet-600 hover:bg-violet-100 rounded-lg transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Suggestions */}
      <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Content Suggestions</h2>
          </div>
          <button className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contentSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-white/60 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  suggestion.difficulty === 'Easy' ? 'text-green-600 bg-green-100' :
                  suggestion.difficulty === 'Medium' ? 'text-yellow-600 bg-yellow-100' :
                  'text-red-600 bg-red-100'
                }`}>
                  {suggestion.difficulty}
                </span>
                <span className="text-xs text-gray-500">{suggestion.timeToCreate}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{suggestion.topic}</h3>
              <p className="text-sm text-gray-600 mb-4">{suggestion.angle}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <ThumbsUp className="w-4 h-4" />
                  <span>~{suggestion.estimatedEngagement}</span>
                </div>
                <button
                  onClick={() => {
                    setFormData({
                      topic: suggestion.topic,
                      platforms: suggestion.platforms,
                      contentType: suggestion.contentType,
                    });
                    setActiveTab('generator');
                    setActiveGenerator('post-generator');
                  }}
                  className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Content */}
      {contentHistory.length > 0 && (
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Recent Content</h2>
            </div>
          </div>
          <div className="space-y-4">
            {contentHistory.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-white/60 border border-gray-200 rounded-xl"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-violet-100 text-violet-600 rounded-full">{item.type}</span>
                    <span className="text-xs text-gray-500">{getTimeAgo(item.metadata?.timestamp || Date.now())}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(item.content)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expertise Areas */}
      <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Expertise Areas</h2>
          </div>
          <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Area
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {expertiseAreas.map((area) => (
            <div
              key={area.id}
              className="bg-white/60 border border-gray-200 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{area.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  area.level === 'Expert' ? 'text-purple-600 bg-purple-100' :
                  area.level === 'Advanced' ? 'text-blue-600 bg-blue-100' :
                  area.level === 'Intermediate' ? 'text-green-600 bg-green-100' :
                  'text-gray-600 bg-gray-100'
                }`}>
                  {area.level}
                </span>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Authority Score</span>
                  <span className="font-semibold">{area.authorityScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${area.authorityScore}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{area.contentCount} posts</span>
                <span>{getTimeAgo(area.lastUpdated)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Generator Tab
  const renderGenerator = () => (
    <div className="space-y-8">
      {/* Generator Selection */}
      {!activeGenerator && (
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Content Generators</h2>
          </div>
          <p className="text-gray-600 mb-8">Choose a generator to create professional content for your brand.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {generators.map((gen) => (
              <button
                key={gen.id}
                onClick={() => setActiveGenerator(gen.id)}
                className="flex flex-col items-center gap-4 p-6 bg-white/60 hover:bg-white/80 border border-gray-200 rounded-2xl transition-all duration-200 hover:shadow-lg group text-left"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  {gen.icon}
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 mb-1">{gen.name}</h3>
                  <p className="text-sm text-gray-600">{gen.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Generator */}
      {activeGenerator && (
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveGenerator(null);
                  setGeneratedContent(null);
                  setError(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <PenTool className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {generators.find((g) => g.id === activeGenerator)?.name || 'Post Generator'}
              </h2>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic / Theme</label>
                <input
                  type="text"
                  value={formData.topic || ''}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g., AI in Healthcare, Remote Work Tips"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all bg-white/60"
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <select
                  value={formData.targetAudience || 'professionals'}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all bg-white/60"
                >
                  <option value="professionals">Professionals</option>
                  <option value="executives">Executives & Leaders</option>
                  <option value="developers">Developers & Engineers</option>
                  <option value="entrepreneurs">Entrepreneurs</option>
                  <option value="students">Students & New Grads</option>
                </select>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                <div className="flex flex-wrap gap-2">
                  {['professional', 'conversational', 'inspiring', 'educational', 'humorous'].map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setFormData({ ...formData, tone })}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        formData.tone === tone
                          ? 'bg-violet-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platforms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {['LinkedIn', 'Twitter', 'Facebook', 'Instagram', 'Medium'].map((platform) => (
                    <button
                      key={platform}
                      onClick={() => {
                        const current = formData.platforms || [];
                        const updated = current.includes(platform)
                          ? current.filter((p) => p !== platform)
                          : [...current, platform];
                        setFormData({ ...formData, platforms: updated });
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                        formData.platforms?.includes(platform)
                          ? 'bg-violet-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {platform === 'LinkedIn' && <Linkedin className="w-4 h-4" />}
                      {platform === 'Twitter' && <Twitter className="w-4 h-4" />}
                      {platform === 'Facebook' && <Globe className="w-4 h-4" />}
                      {platform === 'Instagram' && <Globe className="w-4 h-4" />}
                      {platform === 'Medium' && <BookOpen className="w-4 h-4" />}
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Length */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Length</label>
                <div className="flex gap-2">
                  {['short', 'medium', 'long'].map((length) => (
                    <button
                      key={length}
                      onClick={() => setFormData({ ...formData, contentLength: length })}
                      className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        formData.contentLength === length
                          ? 'bg-violet-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {length.charAt(0).toUpperCase() + length.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={() => generateContent(activeGenerator?.includes('article') ? 'article' : activeGenerator?.includes('thread') ? 'thread' : 'post')}
                disabled={isLoading || !formData.topic}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Content
                  </>
                )}
              </button>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="bg-white/60 border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Preview</h3>
                {generatedContent && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(generatedContent)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="min-h-[400px] p-4 bg-gray-50 rounded-xl">
                {generatedContent ? (
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">{generatedContent}</div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <FileText className="w-12 h-12 mb-4 opacity-50" />
                    <p>Your generated content will appear here</p>
                  </div>
                )}
              </div>
              {generatedContent && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-500">{generatedContent.split(/\s+/).length} words</span>
                  <span className="text-sm text-gray-500">{generatedContent.length} characters</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content History */}
      {contentHistory.length > 0 && (
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Content History</h2>
          </div>
          <div className="space-y-4">
            {contentHistory.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between p-4 bg-white/60 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 bg-violet-100 text-violet-600 rounded-full">{item.type}</span>
                    {item.metadata?.platforms?.map((p) => (
                      <span key={p} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">{p}</span>
                    ))}
                    <span className="text-xs text-gray-500">{getTimeAgo(item.metadata?.timestamp || Date.now())}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => copyToClipboard(item.content)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render Calendar Tab
  const renderCalendar = () => {
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getPostsForDay = (day: number) => {
      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      return scheduledPosts.filter((post) => post.scheduledDate.split('T')[0] === dateStr);
    };

    return (
      <div className="space-y-8">
        {/* Calendar Header */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Content Calendar</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-lg font-semibold text-gray-900 min-w-[150px] text-center">
                  {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Today
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden">
            {/* Week day headers */}
            {weekDays.map((day) => (
              <div key={day} className="bg-gray-50 p-3 text-center text-sm font-semibold text-gray-600">
                {day}
              </div>
            ))}

            {/* Empty cells for days before first of month */}
            {Array.from({ length: firstDayOfMonth }, (_, i) => (
              <div key={`empty-${i}`} className="bg-gray-50 min-h-[100px] p-2" />
            ))}

            {/* Days */}
            {days.map((day) => {
              const postsForDay = getPostsForDay(day);
              const isToday = new Date().toDateString() === new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day).toDateString();

              return (
                <div
                  key={day}
                  className={`bg-white min-h-[100px] p-2 ${isToday ? 'ring-2 ring-violet-500 ring-inset' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-violet-600' : 'text-gray-900'}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {postsForDay.slice(0, 2).map((post) => (
                      <div
                        key={post.id}
                        className={`text-xs p-1.5 rounded truncate cursor-pointer transition-colors ${
                          post.status === 'published' ? 'bg-green-100 text-green-700' :
                          post.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                          post.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}
                        title={post.title}
                      >
                        {post.title}
                      </div>
                    ))}
                    {postsForDay.length > 2 && (
                      <div className="text-xs text-gray-500 pl-1">+{postsForDay.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scheduled Posts List */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Scheduled Posts</h2>
            </div>
            <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> Schedule Post
            </button>
          </div>

          {scheduledPosts.length > 0 ? (
            <div className="space-y-4">
              {scheduledPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 bg-white/60 border border-gray-200 rounded-xl"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{post.title}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        post.status === 'published' ? 'text-green-600 bg-green-100' :
                        post.status === 'scheduled' ? 'text-blue-600 bg-blue-100' :
                        post.status === 'failed' ? 'text-red-600 bg-red-100' :
                        'text-gray-600 bg-gray-100'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{post.platform}</span>
                      <span>•</span>
                      <span>{new Date(post.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled posts</h3>
              <p className="text-gray-500">Schedule your content to maintain a consistent posting schedule.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Analytics Tab
  const renderAnalytics = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Content Analytics</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAnalyticsLoading(true)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${analyticsLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-violet-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
          </div>
        </div>

        {analyticsLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          </div>
        ) : analyticsData ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/60 rounded-xl p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Total Content</div>
                <div className="text-2xl font-bold text-gray-900">{analyticsData.totalContent}</div>
              </div>
              <div className="bg-white/60 rounded-xl p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Total Views</div>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.totalViews)}</div>
              </div>
              <div className="bg-white/60 rounded-xl p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Engagement Rate</div>
                <div className="text-2xl font-bold text-gray-900">{formatPercentage(analyticsData.averageEngagementRate)}</div>
              </div>
              <div className="bg-white/60 rounded-xl p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Total Engagement</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(analyticsData.totalLikes + analyticsData.totalComments + analyticsData.totalShares)}
                </div>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/60 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <ThumbsUp className="w-4 h-4" /> Likes
                </div>
                <div className="text-xl font-bold text-gray-900">{formatNumber(analyticsData.totalLikes)}</div>
              </div>
              <div className="bg-white/60 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <MessageCircle className="w-4 h-4" /> Comments
                </div>
                <div className="text-xl font-bold text-gray-900">{formatNumber(analyticsData.totalComments)}</div>
              </div>
              <div className="bg-white/60 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Share2 className="w-4 h-4" /> Shares
                </div>
                <div className="text-xl font-bold text-gray-900">{formatNumber(analyticsData.totalShares)}</div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data Yet</h3>
            <p className="text-gray-600">Start generating content to see your analytics here.</p>
          </div>
        )}
      </div>

      {/* Charts */}
      {analyticsData && (
        <>
          {/* Performance Over Time */}
          <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Content Performance Over Time</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.timeSeriesData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="views" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorViews)" name="Views" />
                  <Area type="monotone" dataKey="engagement" stroke="#10b981" fillOpacity={1} fill="url(#colorEngagement)" name="Engagement" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Content Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* By Platform */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Content by Platform</h3>
              <div className="space-y-4">
                {Object.entries(analyticsData.contentByPlatform).map(([platform, count]) => {
                  const maxCount = Math.max(...Object.values(analyticsData.contentByPlatform));
                  return (
                    <div key={platform}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{platform}</span>
                        <span className="text-sm font-semibold text-gray-900">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${(count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* By Type */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Content by Type</h3>
              <div className="space-y-4">
                {Object.entries(analyticsData.contentByType).map(([type, count]) => {
                  const maxCount = Math.max(...Object.values(analyticsData.contentByType));
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{type}</span>
                        <span className="text-sm font-semibold text-gray-900">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                          style={{ width: `${(count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Performing Content */}
          <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Top Performing Content</h3>
            <div className="space-y-4">
              {analyticsData.topPerformingContent.map((content, index) => (
                <div
                  key={content.id}
                  className="flex items-center justify-between p-4 bg-white/60 border border-gray-200 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-500' :
                      'bg-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{content.title}</div>
                      <div className="text-sm text-gray-600">{content.platform}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{formatNumber(content.views)} views</div>
                    <div className="text-xs text-gray-600">{formatPercentage(content.engagement_rate)} engagement</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generation Stats */}
          <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Generation Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white/60 rounded-lg p-4 border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Total Generated</div>
                <div className="text-lg font-bold text-gray-900">{analyticsData.generationStats.totalGenerated}</div>
              </div>
              <div className="bg-white/60 rounded-lg p-4 border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Posts</div>
                <div className="text-lg font-bold text-gray-900">{analyticsData.generationStats.postsGenerated}</div>
              </div>
              <div className="bg-white/60 rounded-lg p-4 border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Articles</div>
                <div className="text-lg font-bold text-gray-900">{analyticsData.generationStats.articlesGenerated}</div>
              </div>
              <div className="bg-white/60 rounded-lg p-4 border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Threads</div>
                <div className="text-lg font-bold text-gray-900">{analyticsData.generationStats.threadsGenerated}</div>
              </div>
              <div className="bg-white/60 rounded-lg p-4 border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Avg Words</div>
                <div className="text-lg font-bold text-gray-900">{Math.round(analyticsData.generationStats.averageWordsPerContent)}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Render Templates Tab
  const renderTemplates = () => (
    <div className="space-y-8">
      <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Content Templates</h2>
          </div>
          <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Template
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pre-built templates */}
          {[
            { name: 'Thought Leadership Post', type: 'post', platform: 'LinkedIn', description: 'Share insights and establish authority' },
            { name: 'Product Launch Announcement', type: 'post', platform: 'All', description: 'Announce new products or features' },
            { name: 'Weekly Tips Thread', type: 'thread', platform: 'Twitter', description: 'Share weekly tips and tricks' },
            { name: 'Case Study Article', type: 'article', platform: 'Medium', description: 'Deep-dive case studies' },
            { name: 'Behind the Scenes', type: 'post', platform: 'Instagram', description: 'Show your work process' },
            { name: 'Industry News Carousel', type: 'carousel', platform: 'LinkedIn', description: 'Curate and share news' },
          ].map((template, index) => (
            <div
              key={index}
              className="bg-white/60 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                  {template.type === 'post' && <FileText className="w-5 h-5 text-gray-600" />}
                  {template.type === 'thread' && <MessageSquare className="w-5 h-5 text-gray-600" />}
                  {template.type === 'article' && <BookOpen className="w-5 h-5 text-gray-600" />}
                  {template.type === 'carousel' && <Layers className="w-5 h-5 text-gray-600" />}
                </div>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">{template.platform}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              <button
                onClick={() => {
                  setActiveTab('generator');
                  setActiveGenerator(`${template.type}-generator`);
                }}
                className="w-full py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 font-medium rounded-lg transition-colors"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
              <PenTool className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Content Engine</h1>
              <p className="text-gray-600">Generate professional content to build your brand</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-2 shadow-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'generator' && renderGenerator()}
        {activeTab === 'calendar' && renderCalendar()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'templates' && renderTemplates()}
      </div>
    </div>
  );
};

export default ContentEngine;





