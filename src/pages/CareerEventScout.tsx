import { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Video,
  ExternalLink,
  Filter,
  Search,
  Bookmark,
  BookmarkCheck,
  Star,
  TrendingUp,
  MessageSquare,
  UserPlus,
  Clock,
  DollarSign,
  Lightbulb,
  Target,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Bell,
  Mail,
  Linkedin,
  Github,
  Twitter,
  Award,
  Zap,
  BarChart3,
  Globe,
  Building2,
  Briefcase,
  Heart,
  Share2,
  Eye,
  ArrowRight,
  Check,
  X,
  Plus,
  Tag,
  Send,
  CalendarPlus,
  ClipboardList
} from 'lucide-react';

// Types
interface CareerEvent {
  id: number;
  title: string;
  type: string;
  date: string;
  location: string;
  isVirtual: boolean;
  description: string;
  attendees: number;
  speakers: string[];
  relevanceScore: number;
  industry: string;
  skills: string[];
  url: string;
  price: string;
  isBookmarked: boolean;
}

interface RoleModel {
  id: number;
  name: string;
  title: string;
  company: string;
  industry: string;
  followersCount: number;
  engagementRate: number;
  contentThemes: string[];
  recentPosts: {
    id: number;
    text: string;
    platform: string;
    date: string;
    likes: number;
    comments: number;
    shares: number;
    views: number;
    isTrending: boolean;
    preview: string;
  }[];
  postingFrequency: string;
  averageEngagement: number;
  linkedinUrl: string;
  twitterUrl: string;
  isFollowing: boolean;
  influenceScore: number;
  topSkills: string[];
  achievements: string[];
  whyFollow: string;
  mutualConnections: number;
  sharedInterests: string[];
}

interface NetworkingOpportunity {
  id: number;
  type: string;
  name: string;
  title: string;
  company: string;
  mutualConnections: number;
  relevanceScore: number;
  contactInfo: string;
  suggestedApproach: string;
  eventContext: string;
  linkedin: string | null;
  twitter: string | null;
  github: string | null;
  lastContactDate: string | null;
  nextFollowUp: string | null;
}

// Mock Data
const careerEvents: CareerEvent[] = [
  {
    id: 1,
    title: 'React Conf 2024',
    type: 'Conference',
    date: '2024-03-15',
    location: 'San Francisco, CA',
    isVirtual: false,
    description: 'The premier React conference featuring the latest in React development',
    attendees: 2500,
    speakers: ['Dan Abramov', 'Sophie Alpert', 'Andrew Clark'],
    relevanceScore: 95,
    industry: 'Technology',
    skills: ['React', 'JavaScript', 'Frontend'],
    url: 'https://reactconf.com',
    price: '$299',
    isBookmarked: false
  },
  {
    id: 2,
    title: 'AI in Healthcare Workshop',
    type: 'Workshop',
    date: '2024-03-20',
    location: 'Virtual',
    isVirtual: true,
    description: 'Hands-on workshop on implementing AI solutions in healthcare',
    attendees: 150,
    speakers: ['Dr. Sarah Chen', 'Prof. Michael Rodriguez'],
    relevanceScore: 88,
    industry: 'Healthcare',
    skills: ['AI', 'Machine Learning', 'Healthcare'],
    url: 'https://ai-healthcare-workshop.com',
    price: 'Free',
    isBookmarked: true
  },
  {
    id: 3,
    title: 'Tech Networking Mixer',
    type: 'Networking',
    date: '2024-03-25',
    location: 'New York, NY',
    isVirtual: false,
    description: 'Connect with fellow tech professionals and industry leaders',
    attendees: 300,
    speakers: ['John Smith', 'Jane Doe'],
    relevanceScore: 82,
    industry: 'Technology',
    skills: ['Networking', 'Career Development'],
    url: 'https://tech-mixer.com',
    price: '$50',
    isBookmarked: false
  },
  {
    id: 4,
    title: 'Cloud Architecture Summit',
    type: 'Conference',
    date: '2024-04-10',
    location: 'Seattle, WA',
    isVirtual: false,
    description: 'Deep dive into modern cloud architecture patterns and best practices',
    attendees: 1800,
    speakers: ['Werner Vogels', 'Kelsey Hightower'],
    relevanceScore: 91,
    industry: 'Technology',
    skills: ['Cloud', 'AWS', 'Architecture'],
    url: 'https://cloudsummit.com',
    price: '$399',
    isBookmarked: false
  },
  {
    id: 5,
    title: 'UX Design Webinar Series',
    type: 'Webinar',
    date: '2024-04-05',
    location: 'Virtual',
    isVirtual: true,
    description: 'Weekly webinar series covering UX design principles and tools',
    attendees: 500,
    speakers: ['Julie Zhuo', 'Don Norman'],
    relevanceScore: 76,
    industry: 'Design',
    skills: ['UX', 'Design', 'User Research'],
    url: 'https://uxwebinar.com',
    price: 'Free',
    isBookmarked: false
  }
];

const roleModels: RoleModel[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    title: 'Senior Software Engineer',
    company: 'Google',
    industry: 'Technology',
    followersCount: 12500,
    engagementRate: 8.5,
    contentThemes: ['React', 'Career Growth', 'Diversity'],
    recentPosts: [
      {
        id: 1,
        text: 'Just shipped a new feature at Google! Excited to share how we optimized React performance by 40%.',
        platform: 'LinkedIn',
        date: '2 days ago',
        likes: 1240,
        comments: 89,
        shares: 156,
        views: 8500,
        isTrending: true,
        preview: 'We just shipped a major performance improvement to our React application...'
      },
      {
        id: 2,
        text: 'Tips for junior developers: Focus on fundamentals, build projects, and don\'t be afraid to ask questions.',
        platform: 'Twitter',
        date: '5 days ago',
        likes: 890,
        comments: 45,
        shares: 120,
        views: 12000,
        isTrending: false,
        preview: 'Here are 5 tips that helped me grow as a developer...'
      }
    ],
    postingFrequency: '3-4 posts/week',
    averageEngagement: 8.5,
    linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
    twitterUrl: 'https://twitter.com/sarahjohnson',
    isFollowing: true,
    influenceScore: 92,
    topSkills: ['React', 'TypeScript', 'System Design', 'Mentoring', 'Open Source'],
    achievements: [
      'Open source contributor with 5k+ GitHub stars',
      'Speaker at React Conf 2023',
      'Mentored 50+ junior developers'
    ],
    whyFollow: 'Sarah shares practical React tips and career advice for developers.',
    mutualConnections: 12,
    sharedInterests: ['React', 'Open Source', 'Career Development', 'System Design']
  },
  {
    id: 2,
    name: 'Michael Chen',
    title: 'VP of Engineering',
    company: 'Stripe',
    industry: 'Fintech',
    followersCount: 8500,
    engagementRate: 7.2,
    contentThemes: ['Leadership', 'Engineering', 'Startups'],
    recentPosts: [
      {
        id: 1,
        text: 'Building great engineering teams requires trust, clear communication, and a culture of continuous learning.',
        platform: 'LinkedIn',
        date: '1 day ago',
        likes: 2100,
        comments: 234,
        shares: 312,
        views: 12000,
        isTrending: true,
        preview: 'After scaling teams from 10 to 200+ engineers, I\'ve learned...'
      }
    ],
    postingFrequency: '2-3 posts/week',
    averageEngagement: 7.2,
    linkedinUrl: 'https://linkedin.com/in/michaelchen',
    twitterUrl: 'https://twitter.com/michaelchen',
    isFollowing: false,
    influenceScore: 88,
    topSkills: ['Engineering Leadership', 'Team Building', 'Scalable Systems', 'Product Strategy'],
    achievements: [
      'Scaled engineering team from 10 to 200+ engineers',
      'Built payment infrastructure handling $100B+ annually'
    ],
    whyFollow: 'Michael provides deep insights into engineering leadership and scaling teams.',
    mutualConnections: 8,
    sharedInterests: ['Engineering Leadership', 'Team Building', 'Scalable Systems']
  }
];

const networkingOpportunities: NetworkingOpportunity[] = [
  {
    id: 1,
    type: 'Event Attendee',
    name: 'Alex Rodriguez',
    title: 'Product Manager',
    company: 'Microsoft',
    mutualConnections: 3,
    relevanceScore: 85,
    contactInfo: 'alex.rodriguez@microsoft.com',
    suggestedApproach: 'Mention your shared interest in React and ask about their experience at Microsoft',
    eventContext: 'React Conf 2024',
    linkedin: 'https://linkedin.com/in/alexrodriguez',
    twitter: 'https://twitter.com/alexrodriguez',
    github: null,
    lastContactDate: null,
    nextFollowUp: null
  },
  {
    id: 2,
    type: 'Speaker',
    name: 'Dr. Lisa Wang',
    title: 'AI Research Director',
    company: 'OpenAI',
    mutualConnections: 1,
    relevanceScore: 92,
    contactInfo: 'lisa.wang@openai.com',
    suggestedApproach: 'Reference their recent research paper and ask about future AI trends',
    eventContext: 'AI in Healthcare Workshop',
    linkedin: 'https://linkedin.com/in/lisawang',
    twitter: 'https://twitter.com/lisawang',
    github: 'https://github.com/lisawang',
    lastContactDate: '2024-01-15',
    nextFollowUp: '2024-02-15'
  },
  {
    id: 3,
    type: 'Organizer',
    name: 'Sarah Chen',
    title: 'Engineering Manager',
    company: 'Google',
    mutualConnections: 7,
    relevanceScore: 88,
    contactInfo: 'sarah.chen@google.com',
    suggestedApproach: 'Discuss the event organization and ask about upcoming tech conferences',
    eventContext: 'Tech Leadership Summit 2024',
    linkedin: 'https://linkedin.com/in/sarahchen',
    twitter: null,
    github: null,
    lastContactDate: '2024-01-10',
    nextFollowUp: null
  },
  {
    id: 4,
    type: 'Event Attendee',
    name: 'Michael Johnson',
    title: 'Senior Software Engineer',
    company: 'Amazon',
    mutualConnections: 2,
    relevanceScore: 75,
    contactInfo: 'michael.j@amazon.com',
    suggestedApproach: 'Connect over shared experience at the conference and discuss cloud architecture',
    eventContext: 'AWS re:Invent 2024',
    linkedin: 'https://linkedin.com/in/michaeljohnson',
    twitter: 'https://twitter.com/michaelj',
    github: 'https://github.com/michaelj',
    lastContactDate: null,
    nextFollowUp: null
  },
  {
    id: 5,
    type: 'Speaker',
    name: 'Emily Davis',
    title: 'VP of Engineering',
    company: 'Netflix',
    mutualConnections: 5,
    relevanceScore: 95,
    contactInfo: 'emily.davis@netflix.com',
    suggestedApproach: 'Reference their talk on scalable systems and ask for career advice',
    eventContext: 'ScaleConf 2024',
    linkedin: 'https://linkedin.com/in/emilydavis',
    twitter: 'https://twitter.com/emilydavis',
    github: null,
    lastContactDate: '2024-01-20',
    nextFollowUp: '2024-02-20'
  }
];

// Helper functions
const getRelevanceColor = (score: number) => {
  if (score >= 90) return 'text-emerald-600 bg-emerald-100 border-emerald-200';
  if (score >= 80) return 'text-blue-600 bg-blue-100 border-blue-200';
  if (score >= 70) return 'text-amber-600 bg-amber-100 border-amber-200';
  return 'text-red-600 bg-red-100 border-red-200';
};

const getEventTypeIcon = (type: string) => {
  switch (type) {
    case 'Conference': return <Users className="w-5 h-5" />;
    case 'Workshop': return <Target className="w-5 h-5" />;
    case 'Networking': return <UserPlus className="w-5 h-5" />;
    case 'Webinar': return <Video className="w-5 h-5" />;
    case 'Meetup': return <Users className="w-5 h-5" />;
    default: return <Calendar className="w-5 h-5" />;
  }
};

const getEventTypeColor = (type: string) => {
  switch (type) {
    case 'Conference': return 'text-purple-600 bg-purple-100 border-purple-200';
    case 'Workshop': return 'text-blue-600 bg-blue-100 border-blue-200';
    case 'Networking': return 'text-emerald-600 bg-emerald-100 border-emerald-200';
    case 'Webinar': return 'text-orange-600 bg-orange-100 border-orange-200';
    case 'Meetup': return 'text-pink-600 bg-pink-100 border-pink-200';
    default: return 'text-slate-600 bg-slate-100 border-slate-200';
  }
};

const getContactTypeColor = (type: string) => {
  switch (type) {
    case 'Speaker': return 'text-purple-600 bg-purple-100';
    case 'Organizer': return 'text-emerald-600 bg-emerald-100';
    case 'Event Attendee': return 'text-blue-600 bg-blue-100';
    case 'Sponsor': return 'text-amber-600 bg-amber-100';
    default: return 'text-slate-600 bg-slate-100';
  }
};

const formatNumber = (num: number) => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getAvatarGradient = (name: string) => {
  const gradients = [
    'from-blue-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-pink-500 to-rose-600',
    'from-indigo-500 to-blue-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-blue-600',
    'from-violet-500 to-purple-600'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

export default function CareerEventScout() {
  const [activeTab, setActiveTab] = useState('events');
  
  // Events state
  const [events, setEvents] = useState(careerEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  
  // Role Models state
  const [roleModelSearch, setRoleModelSearch] = useState('');
  const [roleModelFilterIndustry, setRoleModelFilterIndustry] = useState('all');
  const [following, setFollowing] = useState<number[]>([1]);
  
  // Networking state
  const [networkingSearch, setNetworkingSearch] = useState('');
  const [networkingFilterType, setNetworkingFilterType] = useState('all');
  const [networkingNotes, setNetworkingNotes] = useState<Record<number, string>>({});
  const [expandedContact, setExpandedContact] = useState<number | null>(null);

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || event.type.toLowerCase() === filterType.toLowerCase();
    const matchesLocation = filterLocation === 'all' || 
                           (filterLocation === 'virtual' && event.isVirtual) ||
                           (filterLocation === 'in-person' && !event.isVirtual);
    return matchesSearch && matchesType && matchesLocation;
  });

  // Filter role models
  const filteredRoleModels = roleModels.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(roleModelSearch.toLowerCase()) ||
                          model.company.toLowerCase().includes(roleModelSearch.toLowerCase()) ||
                          model.title.toLowerCase().includes(roleModelSearch.toLowerCase());
    const matchesIndustry = roleModelFilterIndustry === 'all' || 
                            model.industry.toLowerCase() === roleModelFilterIndustry.toLowerCase();
    return matchesSearch && matchesIndustry;
  });

  // Filter networking opportunities
  const filteredNetworking = networkingOpportunities.filter(opp => {
    const matchesSearch = opp.name.toLowerCase().includes(networkingSearch.toLowerCase()) ||
                          opp.company.toLowerCase().includes(networkingSearch.toLowerCase()) ||
                          opp.title.toLowerCase().includes(networkingSearch.toLowerCase());
    const matchesType = networkingFilterType === 'all' || 
                        opp.type.toLowerCase() === networkingFilterType.toLowerCase();
    return matchesSearch && matchesType;
  }).sort((a, b) => b.relevanceScore - a.relevanceScore);

  const handleBookmark = (eventId: number) => {
    setEvents(events.map(e => 
      e.id === eventId ? { ...e, isBookmarked: !e.isBookmarked } : e
    ));
  };

  const handleFollow = (roleModelId: number) => {
    setFollowing(prev => 
      prev.includes(roleModelId) 
        ? prev.filter(id => id !== roleModelId)
        : [...prev, roleModelId]
    );
  };

  const tabs = [
    { id: 'events', label: 'Career Events', icon: Calendar },
    { id: 'role-models', label: 'Role Models', icon: Star },
    { id: 'networking', label: 'Networking', icon: UserPlus },
    { id: 'insights', label: 'AI Insights', icon: Lightbulb }
  ];

  const bookmarkedEvents = events.filter(e => e.isBookmarked);
  const uniqueIndustries = [...new Set(roleModels.map(m => m.industry))];

  // Generate AI insights
  const generateInsights = () => {
    const insights = [];
    
    if (bookmarkedEvents.length > 0) {
      const topEvent = bookmarkedEvents.sort((a, b) => b.relevanceScore - a.relevanceScore)[0];
      const eventDate = new Date(topEvent.date);
      const daysUntil = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil > 0 && daysUntil <= 30) {
        insights.push({
          id: 'event-reminder',
          category: 'Event Recommendation',
          icon: Calendar,
          color: 'blue',
          priority: 'high',
          title: `Upcoming Event: ${topEvent.title}`,
          message: `${topEvent.title} is in ${daysUntil} days. With a ${topEvent.relevanceScore}% relevance score, this ${topEvent.type.toLowerCase()} aligns perfectly with your interests in ${topEvent.skills.slice(0, 2).join(' and ')}.`,
          confidence: topEvent.relevanceScore,
          actionText: 'View Event'
        });
      }
    }

    const highRelevanceContacts = filteredNetworking.filter(opp => opp.relevanceScore >= 85).slice(0, 3);
    if (highRelevanceContacts.length > 0) {
      const topContact = highRelevanceContacts[0];
      insights.push({
        id: 'networking-opportunity',
        category: 'Networking Strategy',
        icon: UserPlus,
        color: 'emerald',
        priority: 'high',
        title: `High-Value Connection: ${topContact.name}`,
        message: `${topContact.name} (${topContact.title} at ${topContact.company}) has a ${topContact.relevanceScore}% relevance score. ${topContact.mutualConnections > 0 ? `You have ${topContact.mutualConnections} mutual connections.` : ''}`,
        confidence: topContact.relevanceScore,
        actionText: 'View Contact'
      });
    }

    const followedModels = roleModels.filter(m => following.includes(m.id));
    if (followedModels.length > 0) {
      const topModel = followedModels.sort((a, b) => b.influenceScore - a.influenceScore)[0];
      insights.push({
        id: 'role-model-learning',
        category: 'Skill Development',
        icon: Target,
        color: 'purple',
        priority: 'medium',
        title: `Learn from ${topModel.name}`,
        message: `You're following ${topModel.name} who excels in ${topModel.topSkills.slice(0, 2).join(' and ')}. Engaging with their content could accelerate your learning.`,
        confidence: topModel.influenceScore,
        actionText: 'View Profile'
      });
    }

    // Skill trends insight
    const allSkills = events.flatMap(e => e.skills);
    const skillFrequency: Record<string, number> = {};
    allSkills.forEach(skill => {
      skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
    });
    const topSkills = Object.entries(skillFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([skill]) => skill);

    if (topSkills.length > 0) {
      insights.push({
        id: 'skill-trend',
        category: 'Industry Trends',
        icon: TrendingUp,
        color: 'amber',
        priority: 'medium',
        title: `Trending Skills: ${topSkills.join(', ')}`,
        message: `Based on the events you're exploring, ${topSkills.join(', ')} are appearing frequently. These skills are in high demand.`,
        confidence: 75,
        actionText: 'Explore Events'
      });
    }

    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Career Event Scout</h1>
          <p className="text-slate-500 mt-1">Discover events, role models, and networking opportunities</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
            {bookmarkedEvents.length} Bookmarked
          </span>
          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
            {following.length} Following
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events, skills, or topics..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 placeholder-slate-400"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                  >
                    <option value="all">All Types</option>
                    <option value="conference">Conferences</option>
                    <option value="workshop">Workshops</option>
                    <option value="networking">Networking</option>
                    <option value="webinar">Webinars</option>
                  </select>
                  <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                  >
                    <option value="all">All Locations</option>
                    <option value="virtual">Virtual Only</option>
                    <option value="in-person">In-Person Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Events List */}
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${getAvatarGradient(event.title)} text-white`}>
                        {getEventTypeIcon(event.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-slate-800">{event.title}</h3>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getEventTypeColor(event.type)}`}>
                            {event.type}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getRelevanceColor(event.relevanceScore)}`}>
                            {event.relevanceScore}% Match
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-3 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {event.date}
                          </div>
                          <div className="flex items-center gap-1">
                            {event.isVirtual ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                            {event.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.attendees} attendees
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {event.price}
                          </div>
                        </div>
                        <p className="text-slate-600 mb-3">{event.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {event.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <div className="text-sm text-slate-500">
                          <strong className="text-slate-700">Speakers:</strong> {event.speakers.join(', ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleBookmark(event.id)}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          event.isBookmarked
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {event.isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                      </button>
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bookmarked Events */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-amber-500" />
                Bookmarked Events
              </h3>
              {bookmarkedEvents.length > 0 ? (
                <div className="space-y-3">
                  {bookmarkedEvents.map((event) => (
                    <div key={event.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <h4 className="font-medium text-slate-800 mb-1">{event.title}</h4>
                      <div className="text-sm text-slate-500">
                        {event.date} • {event.location}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No bookmarked events yet. Click the bookmark icon to save events.</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Event Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-700">{events.length}</div>
                  <div className="text-xs text-blue-600">Total Events</div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-emerald-700">{events.filter(e => e.isVirtual).length}</div>
                  <div className="text-xs text-emerald-600">Virtual Events</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-700">{events.filter(e => e.type === 'Conference').length}</div>
                  <div className="text-xs text-purple-600">Conferences</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-amber-700">{bookmarkedEvents.length}</div>
                  <div className="text-xs text-amber-600">Bookmarked</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Models Tab */}
      {activeTab === 'role-models' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={roleModelSearch}
                    onChange={(e) => setRoleModelSearch(e.target.value)}
                    placeholder="Search by name, company, or title..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 placeholder-slate-400"
                  />
                </div>
                <select
                  value={roleModelFilterIndustry}
                  onChange={(e) => setRoleModelFilterIndustry(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                >
                  <option value="all">All Industries</option>
                  {uniqueIndustries.map((industry) => (
                    <option key={industry} value={industry.toLowerCase()}>{industry}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Role Models List */}
            <div className="space-y-4">
              {filteredRoleModels.map((model) => {
                const isFollowing = following.includes(model.id);
                const latestPost = model.recentPosts[0];
                
                return (
                  <div
                    key={model.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarGradient(model.name)} flex items-center justify-center text-white font-bold text-xl`}>
                        {getInitials(model.name)}
                      </div>
                      
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-slate-800">{model.name}</h3>
                              {model.influenceScore >= 90 && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex items-center gap-1">
                                  <Award className="w-3 h-3" /> Top Influencer
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600">{model.title} at {model.company}</p>
                          </div>
                          <button
                            onClick={() => handleFollow(model.id)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 ${
                              isFollowing
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                          >
                            {isFollowing ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                            {isFollowing ? 'Following' : 'Follow'}
                          </button>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {formatNumber(model.followersCount)} followers
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {model.engagementRate}% engagement
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {model.influenceScore} influence
                          </div>
                          <div className="flex items-center gap-1">
                            <UserPlus className="w-4 h-4" />
                            {model.mutualConnections} mutual
                          </div>
                        </div>

                        {/* Content Themes */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {model.contentThemes.map((theme) => (
                            <span key={theme} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium">
                              {theme}
                            </span>
                          ))}
                        </div>

                        {/* Why Follow */}
                        <p className="text-slate-600 text-sm mb-3">{model.whyFollow}</p>

                        {/* Latest Post */}
                        {latestPost && (
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-2 mb-2">
                              {latestPost.platform === 'LinkedIn' ? (
                                <Linkedin className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Twitter className="w-4 h-4 text-sky-500" />
                              )}
                              <span className="text-xs text-slate-500">{latestPost.date}</span>
                              {latestPost.isTrending && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full flex items-center gap-1">
                                  <Zap className="w-3 h-3" /> Trending
                                </span>
                              )}
                            </div>
                            <p className="text-slate-700 text-sm">{latestPost.text}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {formatNumber(latestPost.likes)}</span>
                              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {formatNumber(latestPost.comments)}</span>
                              <span className="flex items-center gap-1"><Share2 className="w-3 h-3" /> {formatNumber(latestPost.shares)}</span>
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {formatNumber(latestPost.views)}</span>
                            </div>
                          </div>
                        )}

                        {/* Social Links */}
                        <div className="flex items-center gap-2 mt-3">
                          <a
                            href={model.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                          <a
                            href={model.twitterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-sky-100 text-sky-500 rounded-lg hover:bg-sky-200 transition-colors"
                          >
                            <Twitter className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Following */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                Following ({following.length})
              </h3>
              {following.length > 0 ? (
                <div className="space-y-3">
                  {roleModels.filter(m => following.includes(m.id)).map((model) => (
                    <div key={model.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(model.name)} flex items-center justify-center text-white font-medium text-sm`}>
                        {getInitials(model.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-800 truncate">{model.name}</div>
                        <div className="text-xs text-slate-500 truncate">{model.company}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Not following anyone yet. Click Follow to start.</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Total Role Models</span>
                  <span className="font-semibold text-slate-800">{roleModels.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Following</span>
                  <span className="font-semibold text-emerald-600">{following.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Avg Influence Score</span>
                  <span className="font-semibold text-purple-600">
                    {Math.round(roleModels.reduce((a, b) => a + b.influenceScore, 0) / roleModels.length)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Networking Tab */}
      {activeTab === 'networking' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={networkingSearch}
                    onChange={(e) => setNetworkingSearch(e.target.value)}
                    placeholder="Search contacts, companies, or events..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 placeholder-slate-400"
                  />
                </div>
                <select
                  value={networkingFilterType}
                  onChange={(e) => setNetworkingFilterType(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                >
                  <option value="all">All Contact Types</option>
                  <option value="speaker">Speakers</option>
                  <option value="organizer">Organizers</option>
                  <option value="event attendee">Attendees</option>
                  <option value="sponsor">Sponsors</option>
                </select>
              </div>
            </div>

            {/* Networking Opportunities */}
            <div className="space-y-4">
              {filteredNetworking.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getAvatarGradient(opportunity.name)} flex items-center justify-center text-white font-bold text-lg`}>
                      {getInitials(opportunity.name)}
                    </div>

                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-slate-800">{opportunity.name}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getContactTypeColor(opportunity.type)}`}>
                              {opportunity.type}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRelevanceColor(opportunity.relevanceScore)}`}>
                              {opportunity.relevanceScore}% Match
                            </span>
                          </div>
                          <p className="text-slate-600">{opportunity.title} at {opportunity.company}</p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                        <div className="flex items-center gap-1">
                          <UserPlus className="w-4 h-4" />
                          {opportunity.mutualConnections} mutual connections
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {opportunity.eventContext}
                        </div>
                        {opportunity.lastContactDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Last contacted: {opportunity.lastContactDate}
                          </div>
                        )}
                      </div>

                      {/* Suggested Approach */}
                      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 mb-3">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-xs font-medium text-indigo-700 mb-1">Suggested Approach</div>
                            <p className="text-sm text-indigo-800">{opportunity.suggestedApproach}</p>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedContact === opportunity.id && (
                        <div className="space-y-3 mb-3">
                          {/* Notes */}
                          <div>
                            <label className="text-sm font-medium text-slate-700 mb-1 block">Your Notes</label>
                            <textarea
                              value={networkingNotes[opportunity.id] || ''}
                              onChange={(e) => setNetworkingNotes({ ...networkingNotes, [opportunity.id]: e.target.value })}
                              placeholder="Add notes about this contact..."
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400 text-sm resize-none"
                              rows={3}
                            />
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {opportunity.linkedin && (
                          <a
                            href={opportunity.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <Linkedin className="w-4 h-4" /> Connect
                          </a>
                        )}
                        {opportunity.twitter && (
                          <a
                            href={opportunity.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <Twitter className="w-4 h-4" /> Follow
                          </a>
                        )}
                        {opportunity.github && (
                          <a
                            href={opportunity.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <Github className="w-4 h-4" /> GitHub
                          </a>
                        )}
                        <a
                          href={`mailto:${opportunity.contactInfo}`}
                          className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm font-medium flex items-center gap-1"
                        >
                          <Mail className="w-4 h-4" /> Email
                        </a>
                        <button
                          onClick={() => setExpandedContact(expandedContact === opportunity.id ? null : opportunity.id)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium flex items-center gap-1"
                        >
                          {expandedContact === opportunity.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          {expandedContact === opportunity.id ? 'Less' : 'More'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Hot Leads */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Hot Leads
              </h3>
              <div className="space-y-3">
                {networkingOpportunities
                  .filter(o => o.relevanceScore >= 85)
                  .slice(0, 3)
                  .map((opp) => (
                    <div key={opp.id} className="flex items-center gap-3 p-2 bg-amber-50 rounded-lg border border-amber-100">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(opp.name)} flex items-center justify-center text-white font-medium text-sm`}>
                        {getInitials(opp.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-800 truncate">{opp.name}</div>
                        <div className="text-xs text-slate-500 truncate">{opp.company}</div>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                        {opp.relevanceScore}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Networking Stats */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Networking Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Total Contacts</span>
                  <span className="font-semibold text-slate-800">{networkingOpportunities.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">High Match (85%+)</span>
                  <span className="font-semibold text-emerald-600">
                    {networkingOpportunities.filter(o => o.relevanceScore >= 85).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Events Covered</span>
                  <span className="font-semibold text-blue-600">
                    {new Set(networkingOpportunities.map(o => o.eventContext)).size}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* AI-Generated Insights */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">AI Career Insights</h2>
                  <p className="text-indigo-100">Personalized recommendations based on your activity</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="px-3 py-1 bg-white/20 rounded-full">{insights.length} insights available</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">Updated just now</span>
              </div>
            </div>

            {/* Insights List */}
            <div className="space-y-4">
              {insights.map((insight) => {
                const Icon = insight.icon;
                const colorClasses: Record<string, string> = {
                  blue: 'bg-blue-100 text-blue-600 border-blue-200',
                  emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200',
                  purple: 'bg-purple-100 text-purple-600 border-purple-200',
                  amber: 'bg-amber-100 text-amber-600 border-amber-200',
                  rose: 'bg-rose-100 text-rose-600 border-rose-200'
                };

                return (
                  <div
                    key={insight.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[insight.color] || colorClasses.blue}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            {insight.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            insight.priority === 'high' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {insight.priority === 'high' ? 'High Priority' : 'Recommended'}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">{insight.title}</h3>
                        <p className="text-slate-600 mb-3">{insight.message}</p>
                        
                        {/* Confidence Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-slate-500">Confidence Score</span>
                            <span className="font-medium text-slate-700">{insight.confidence}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                insight.confidence >= 80 
                                  ? 'bg-emerald-500' 
                                  : insight.confidence >= 60 
                                    ? 'bg-amber-500' 
                                    : 'bg-slate-400'
                              }`}
                              style={{ width: `${insight.confidence}%` }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (insight.id === 'event-reminder') setActiveTab('events');
                            else if (insight.id === 'networking-opportunity') setActiveTab('networking');
                            else if (insight.id === 'role-model-learning') setActiveTab('role-models');
                            else if (insight.id === 'skill-trend') setActiveTab('events');
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          {insight.actionText}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {insights.length === 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                  <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">No Insights Yet</h3>
                  <p className="text-slate-500">
                    Bookmark events, follow role models, and explore networking opportunities to generate personalized insights.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity Summary */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-500" />
                Your Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <BookmarkCheck className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{bookmarkedEvents.length}</div>
                    <div className="text-sm text-slate-500">Events Bookmarked</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{following.length}</div>
                    <div className="text-sm text-slate-500">Role Models Following</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{networkingOpportunities.length}</div>
                    <div className="text-sm text-slate-500">Networking Contacts</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                Pro Tips
              </h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  Bookmark events with 80%+ match for best results
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  Follow role models in your target industry
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  Reach out to contacts within 48 hours of events
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

