import { useState } from 'react';
import {
  Target, TrendingUp, Briefcase, DollarSign, Search, Filter,
  ChevronDown, Star, StarOff, Eye, BookOpen, ExternalLink,
  BarChart3, Activity, Zap, Clock, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, Legend, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';

// Types
interface SkillData {
  id: number;
  name: string;
  category: 'technical' | 'soft' | 'tools' | 'industry';
  demandScore: number;
  growthRate: number;
  salaryImpact: number;
  jobCount: number;
  trend: 'rising' | 'falling' | 'stable';
  emergingStatus: 'hot' | 'emerging' | 'established' | 'declining';
  isWatched: boolean;
  learningResources: string[];
  timeToLearn: string;
  relatedSkills: string[];
  trendHistory: number[];
}

interface TargetRole {
  id: string;
  title: string;
  description: string;
  requiredSkills: { name: string; level: number }[];
}

// Sample skills data with radar chart format
const radarSkillsData = [
  { subject: 'React', current: 85, target: 95, fullMark: 100 },
  { subject: 'TypeScript', current: 75, target: 90, fullMark: 100 },
  { subject: 'Node.js', current: 70, target: 85, fullMark: 100 },
  { subject: 'Python', current: 60, target: 80, fullMark: 100 },
  { subject: 'AWS', current: 50, target: 75, fullMark: 100 },
  { subject: 'Docker', current: 65, target: 80, fullMark: 100 },
  { subject: 'SQL', current: 80, target: 85, fullMark: 100 },
  { subject: 'GraphQL', current: 55, target: 70, fullMark: 100 },
];

// Skills database
const skillsData: SkillData[] = [
  {
    id: 1,
    name: 'AI/ML',
    category: 'technical',
    demandScore: 95,
    growthRate: 45,
    salaryImpact: 25,
    jobCount: 12500,
    trend: 'rising',
    emergingStatus: 'hot',
    isWatched: true,
    learningResources: ['Coursera', 'Fast.ai', 'Kaggle'],
    timeToLearn: '6-12 months',
    relatedSkills: ['Python', 'TensorFlow', 'Data Science'],
    trendHistory: [72, 75, 78, 82, 85, 88, 91, 93, 94, 95]
  },
  {
    id: 2,
    name: 'Kubernetes',
    category: 'tools',
    demandScore: 88,
    growthRate: 32,
    salaryImpact: 20,
    jobCount: 8500,
    trend: 'rising',
    emergingStatus: 'emerging',
    isWatched: false,
    learningResources: ['Kubernetes.io', 'CNCF', 'Linux Academy'],
    timeToLearn: '3-6 months',
    relatedSkills: ['Docker', 'DevOps', 'Cloud'],
    trendHistory: [68, 70, 72, 74, 76, 78, 80, 82, 84, 88]
  },
  {
    id: 3,
    name: 'Product Management',
    category: 'soft',
    demandScore: 82,
    growthRate: 28,
    salaryImpact: 18,
    jobCount: 9200,
    trend: 'rising',
    emergingStatus: 'established',
    isWatched: false,
    learningResources: ['Product School', 'Reforge', 'Mind the Product'],
    timeToLearn: '6-12 months',
    relatedSkills: ['Agile', 'User Research', 'Analytics'],
    trendHistory: [70, 71, 72, 73, 74, 76, 78, 79, 80, 82]
  },
  {
    id: 4,
    name: 'Cybersecurity',
    category: 'technical',
    demandScore: 91,
    growthRate: 38,
    salaryImpact: 22,
    jobCount: 6800,
    trend: 'rising',
    emergingStatus: 'hot',
    isWatched: true,
    learningResources: ['Cybrary', 'SANS', 'CompTIA'],
    timeToLearn: '6-18 months',
    relatedSkills: ['Network Security', 'Penetration Testing', 'Compliance'],
    trendHistory: [75, 77, 79, 81, 83, 85, 87, 89, 90, 91]
  },
  {
    id: 5,
    name: 'Blockchain',
    category: 'technical',
    demandScore: 65,
    growthRate: -12,
    salaryImpact: 15,
    jobCount: 3200,
    trend: 'falling',
    emergingStatus: 'declining',
    isWatched: false,
    learningResources: ['Ethereum.org', 'CryptoZombies', 'Blockchain Council'],
    timeToLearn: '3-9 months',
    relatedSkills: ['Solidity', 'Web3', 'Smart Contracts'],
    trendHistory: [78, 76, 74, 72, 70, 68, 67, 66, 65, 65]
  },
  {
    id: 6,
    name: 'Data Visualization',
    category: 'tools',
    demandScore: 76,
    growthRate: 15,
    salaryImpact: 12,
    jobCount: 5400,
    trend: 'stable',
    emergingStatus: 'established',
    isWatched: false,
    learningResources: ['Tableau', 'D3.js', 'Power BI'],
    timeToLearn: '2-4 months',
    relatedSkills: ['Tableau', 'D3.js', 'Power BI'],
    trendHistory: [74, 74, 75, 75, 75, 76, 76, 76, 76, 76]
  }
];

// Target roles
const targetRoles: TargetRole[] = [
  {
    id: 'senior-frontend',
    title: 'Senior Frontend Engineer',
    description: 'Lead frontend development and architecture',
    requiredSkills: [
      { name: 'React', level: 95 },
      { name: 'TypeScript', level: 90 },
      { name: 'Node.js', level: 75 },
      { name: 'GraphQL', level: 70 },
      { name: 'AWS', level: 60 },
    ]
  },
  {
    id: 'fullstack-lead',
    title: 'Full Stack Tech Lead',
    description: 'Lead full stack development teams',
    requiredSkills: [
      { name: 'React', level: 85 },
      { name: 'Node.js', level: 90 },
      { name: 'TypeScript', level: 85 },
      { name: 'AWS', level: 80 },
      { name: 'Docker', level: 85 },
    ]
  },
  {
    id: 'ml-engineer',
    title: 'ML Engineer',
    description: 'Build and deploy machine learning models',
    requiredSkills: [
      { name: 'Python', level: 95 },
      { name: 'TensorFlow', level: 85 },
      { name: 'AWS', level: 75 },
      { name: 'Docker', level: 70 },
      { name: 'SQL', level: 80 },
    ]
  }
];

// Helper functions
const getDemandColor = (score: number): string => {
  if (score >= 90) return 'text-red-600 bg-red-100';
  if (score >= 80) return 'text-orange-600 bg-orange-100';
  if (score >= 70) return 'text-yellow-600 bg-yellow-100';
  if (score >= 60) return 'text-blue-600 bg-blue-100';
  return 'text-slate-600 bg-slate-100';
};

const getGrowthColor = (rate: number): string => {
  if (rate > 0) return 'text-green-600';
  if (rate < 0) return 'text-red-600';
  return 'text-slate-600';
};

const getEmergingColor = (status: string): string => {
  switch (status) {
    case 'hot': return 'text-red-600 bg-red-100';
    case 'emerging': return 'text-orange-600 bg-orange-100';
    case 'established': return 'text-blue-600 bg-blue-100';
    case 'declining': return 'text-slate-600 bg-slate-100';
    default: return 'text-slate-600 bg-slate-100';
  }
};

const getTrendIcon = (trend: string): string => {
  switch (trend) {
    case 'rising': return '📈';
    case 'falling': return '📉';
    case 'stable': return '➡️';
    default: return '➡️';
  }
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'technical': return 'text-blue-600 bg-blue-100';
    case 'soft': return 'text-green-600 bg-green-100';
    case 'tools': return 'text-orange-600 bg-orange-100';
    case 'industry': return 'text-purple-600 bg-purple-100';
    default: return 'text-slate-600 bg-slate-100';
  }
};

// Views configuration
const views = [
  { id: 'radar', label: 'Skill Radar', icon: Target },
  { id: 'trending', label: 'Trending Skills', icon: TrendingUp },
  { id: 'watchlist', label: 'My Watchlist', icon: Star },
];

// Categories for filtering
const categories = [
  { id: 'all', label: 'All Categories' },
  { id: 'technical', label: 'Technical' },
  { id: 'soft', label: 'Soft Skills' },
  { id: 'tools', label: 'Tools & Platforms' },
  { id: 'industry', label: 'Industry Knowledge' },
];

export default function SkillRadar() {
  const [activeView, setActiveView] = useState('radar');
  const [selectedRole, setSelectedRole] = useState(targetRoles[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [skills, setSkills] = useState(skillsData);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Toggle watchlist
  const toggleWatchlist = (skillId: number) => {
    setSkills(skills.map(skill =>
      skill.id === skillId ? { ...skill, isWatched: !skill.isWatched } : skill
    ));
  };

  // Filter skills
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.relatedSkills.some(rs => rs.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Watchlist skills
  const watchlistSkills = skills.filter(skill => skill.isWatched);

  // Render sparkline
  const renderSparkline = (data: number[], color: string) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 80;
      const y = 20 - ((value - min) / range) * 20;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="80" height="20" className="inline-block">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Skill Radar</h1>
          <p className="text-slate-600 mt-1">Track trending skills and compare against target roles</p>
        </div>

        {/* View Tabs */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-xl p-1 flex gap-1">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                activeView === view.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <view.icon className="w-4 h-4" />
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Radar View */}
      {activeView === 'radar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Radar Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Skills Comparison</h2>
                    <p className="text-sm text-slate-500">Your skills vs {selectedRole.title}</p>
                  </div>
                </div>

                {/* Role Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Briefcase className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">{selectedRole.title}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {showRoleDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                      {targetRoles.map((role) => (
                        <button
                          key={role.id}
                          onClick={() => {
                            setSelectedRole(role);
                            setShowRoleDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg ${
                            selectedRole.id === role.id ? 'bg-indigo-50' : ''
                          }`}
                        >
                          <div className="font-medium text-slate-900">{role.title}</div>
                          <div className="text-xs text-slate-500">{role.description}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Radar Chart */}
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarSkillsData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={{ fill: '#64748b', fontSize: 10 }}
                    />
                    <Radar
                      name="Current Skills"
                      dataKey="current"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Target Role"
                      dataKey="target"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.2}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                    <Legend />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Gap Analysis */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Skill Gaps to Address</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {radarSkillsData
                    .map(skill => ({
                      ...skill,
                      gap: skill.target - skill.current
                    }))
                    .sort((a, b) => b.gap - a.gap)
                    .slice(0, 4)
                    .map((skill) => (
                      <div key={skill.subject} className="bg-white/60 border border-slate-200 rounded-lg p-4">
                        <div className="text-sm font-medium text-slate-900 mb-1">{skill.subject}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-sm">{skill.current}%</span>
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                          <span className="text-green-600 font-medium text-sm">{skill.target}%</span>
                        </div>
                        <div className="text-xs text-red-500 mt-1">Gap: {skill.gap}%</div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Role Requirements */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                Role Requirements
              </h3>
              <p className="text-sm text-slate-500 mb-4">{selectedRole.description}</p>
              <div className="space-y-3">
                {selectedRole.requiredSkills.map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{skill.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-8">{skill.level}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Progress</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">72%</div>
                  <div className="text-xs text-slate-500">Role Match</div>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">4</div>
                  <div className="text-xs text-slate-500">Skills to Improve</div>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">6mo</div>
                  <div className="text-xs text-slate-500">Est. Time to Goal</div>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">+18%</div>
                  <div className="text-xs text-slate-500">Salary Potential</div>
                </div>
              </div>
            </div>

            {/* Recommended Actions */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Recommended Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Start Learning Path
                </button>
                <button className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2">
                  <Target className="w-4 h-4" />
                  Set Skill Goals
                </button>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  View Market Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trending Skills View */}
      {activeView === 'trending' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill) => (
              <div
                key={skill.id}
                className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">{skill.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(skill.category)}`}>
                        {skill.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEmergingColor(skill.emergingStatus)}`}>
                        {skill.emergingStatus}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleWatchlist(skill.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      skill.isWatched 
                        ? 'bg-yellow-100 text-yellow-600' 
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {skill.isWatched ? <Star className="w-5 h-5 fill-current" /> : <StarOff className="w-5 h-5" />}
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-slate-500">Demand Score</div>
                    <div className="text-xl font-bold text-indigo-600">{skill.demandScore}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Growth Rate</div>
                    <div className={`text-xl font-bold ${getGrowthColor(skill.growthRate)}`}>
                      {skill.growthRate > 0 ? '+' : ''}{skill.growthRate}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Salary Impact</div>
                    <div className="text-xl font-bold text-green-600">+{skill.salaryImpact}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Job Openings</div>
                    <div className="text-xl font-bold text-slate-900">{skill.jobCount.toLocaleString()}</div>
                  </div>
                </div>

                {/* Trend Sparkline */}
                <div className="flex items-center justify-between mb-4 p-3 bg-white/50 rounded-lg">
                  <div className="text-sm text-slate-500">30-Day Trend</div>
                  <div className="flex items-center gap-2">
                    {renderSparkline(skill.trendHistory, skill.trend === 'rising' ? '#10b981' : skill.trend === 'falling' ? '#ef4444' : '#6b7280')}
                    <span>{getTrendIcon(skill.trend)}</span>
                  </div>
                </div>

                {/* Time to Learn & Resources */}
                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-4 h-4" />
                    {skill.timeToLearn}
                  </div>
                  <div className="flex items-center gap-1 text-indigo-600">
                    <BookOpen className="w-4 h-4" />
                    {skill.learningResources.length} resources
                  </div>
                </div>

                {/* Related Skills */}
                <div className="mb-4">
                  <div className="text-xs text-slate-500 mb-2">Related Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {skill.relatedSkills.map((related) => (
                      <span key={related} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                        {related}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm flex items-center justify-center gap-1">
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button className="flex-1 bg-white border border-slate-200 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors text-sm flex items-center justify-center gap-1">
                    <ExternalLink className="w-4 h-4" />
                    Resources
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Watchlist View */}
      {activeView === 'watchlist' && (
        <div className="space-y-6">
          {watchlistSkills.length === 0 ? (
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-12 shadow-sm text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No skills in your watchlist</h3>
              <p className="text-slate-500 mb-6">Start tracking skills by clicking the star icon on any skill card</p>
              <button 
                onClick={() => setActiveView('trending')}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Browse Trending Skills
              </button>
            </div>
          ) : (
            <>
              {/* Watchlist Analytics */}
              <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Watchlist Analytics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white/50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">{watchlistSkills.length}</div>
                    <div className="text-sm text-slate-500">Skills Tracked</div>
                  </div>
                  <div className="text-center p-4 bg-white/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(watchlistSkills.reduce((acc, s) => acc + s.demandScore, 0) / watchlistSkills.length)}
                    </div>
                    <div className="text-sm text-slate-500">Avg. Demand</div>
                  </div>
                  <div className="text-center p-4 bg-white/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      +{Math.round(watchlistSkills.reduce((acc, s) => acc + s.growthRate, 0) / watchlistSkills.length)}%
                    </div>
                    <div className="text-sm text-slate-500">Avg. Growth</div>
                  </div>
                  <div className="text-center p-4 bg-white/50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {watchlistSkills.reduce((acc, s) => acc + s.jobCount, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-500">Total Jobs</div>
                  </div>
                </div>
              </div>

              {/* Watchlist Trend Chart */}
              <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Watchlist Demand Trends</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={watchlistSkills[0]?.trendHistory.map((_, idx) => {
                        const dataPoint: Record<string, number | string> = { name: `Day ${idx + 1}` };
                        watchlistSkills.forEach(skill => {
                          dataPoint[skill.name] = skill.trendHistory[idx];
                        });
                        return dataPoint;
                      }) || []}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0'
                        }}
                      />
                      <Legend />
                      {watchlistSkills.map((skill, idx) => (
                        <Area
                          key={skill.id}
                          type="monotone"
                          dataKey={skill.name}
                          stroke={['#6366f1', '#10b981', '#f59e0b', '#ef4444'][idx % 4]}
                          fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444'][idx % 4]}
                          fillOpacity={0.1}
                          strokeWidth={2}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Watchlist Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {watchlistSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">{skill.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(skill.category)}`}>
                            {skill.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEmergingColor(skill.emergingStatus)}`}>
                            {skill.emergingStatus}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleWatchlist(skill.id)}
                        className="p-2 rounded-lg bg-yellow-100 text-yellow-600"
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mb-4">
                      <div className="text-center p-2 bg-white/50 rounded-lg">
                        <div className="text-lg font-bold text-indigo-600">{skill.demandScore}</div>
                        <div className="text-xs text-slate-500">Demand</div>
                      </div>
                      <div className="text-center p-2 bg-white/50 rounded-lg">
                        <div className={`text-lg font-bold ${getGrowthColor(skill.growthRate)}`}>
                          {skill.growthRate > 0 ? '+' : ''}{skill.growthRate}%
                        </div>
                        <div className="text-xs text-slate-500">Growth</div>
                      </div>
                      <div className="text-center p-2 bg-white/50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">+{skill.salaryImpact}%</div>
                        <div className="text-xs text-slate-500">Salary</div>
                      </div>
                      <div className="text-center p-2 bg-white/50 rounded-lg">
                        <div className="text-lg font-bold text-slate-900">{(skill.jobCount / 1000).toFixed(1)}k</div>
                        <div className="text-xs text-slate-500">Jobs</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm">
                        Start Learning
                      </button>
                      <button className="flex-1 bg-white border border-slate-200 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors text-sm">
                        Set Goal
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}





