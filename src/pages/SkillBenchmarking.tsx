import { useState } from 'react';
import {
  BarChart3, TrendingUp, Target, Users, DollarSign, ChevronDown,
  ArrowUpRight, ArrowDownRight, Briefcase, Award, Zap, Info,
  Filter, RefreshCw, Download, Share2, Sparkles
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, Line, Area, AreaChart,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Cell
} from 'recharts';

// Types
interface TargetRole {
  id: string;
  title: string;
  level: string;
  avgSalary: number;
  salaryRange: { min: number; max: number };
  demandScore: number;
  growthRate: number;
}

interface SkillComparison {
  skill: string;
  yourLevel: number;
  marketAvg: number;
  topPerformers: number;
  gap: number;
  importance: 'critical' | 'important' | 'nice-to-have';
  trend: 'rising' | 'stable' | 'declining';
}

interface SalaryTrend {
  year: string;
  yourRole: number;
  targetRole: number;
  marketAvg: number;
}

interface MarketDemand {
  month: string;
  jobPostings: number;
  applications: number;
  ratio: number;
}

// Sample data
const targetRoles: TargetRole[] = [
  {
    id: 'senior-dev',
    title: 'Senior Developer',
    level: 'Senior',
    avgSalary: 145000,
    salaryRange: { min: 120000, max: 175000 },
    demandScore: 85,
    growthRate: 12
  },
  {
    id: 'tech-lead',
    title: 'Tech Lead',
    level: 'Lead',
    avgSalary: 175000,
    salaryRange: { min: 150000, max: 210000 },
    demandScore: 78,
    growthRate: 15
  },
  {
    id: 'staff-engineer',
    title: 'Staff Engineer',
    level: 'Staff',
    avgSalary: 205000,
    salaryRange: { min: 175000, max: 250000 },
    demandScore: 65,
    growthRate: 18
  },
  {
    id: 'engineering-manager',
    title: 'Engineering Manager',
    level: 'Manager',
    avgSalary: 190000,
    salaryRange: { min: 160000, max: 230000 },
    demandScore: 72,
    growthRate: 10
  },
  {
    id: 'principal-engineer',
    title: 'Principal Engineer',
    level: 'Principal',
    avgSalary: 240000,
    salaryRange: { min: 200000, max: 300000 },
    demandScore: 55,
    growthRate: 20
  }
];

const skillComparisonData: SkillComparison[] = [
  { skill: 'React', yourLevel: 85, marketAvg: 70, topPerformers: 95, gap: 10, importance: 'critical', trend: 'rising' },
  { skill: 'TypeScript', yourLevel: 75, marketAvg: 65, topPerformers: 90, gap: 15, importance: 'critical', trend: 'rising' },
  { skill: 'Node.js', yourLevel: 70, marketAvg: 72, topPerformers: 88, gap: 18, importance: 'important', trend: 'stable' },
  { skill: 'System Design', yourLevel: 55, marketAvg: 68, topPerformers: 92, gap: 37, importance: 'critical', trend: 'rising' },
  { skill: 'AWS', yourLevel: 60, marketAvg: 70, topPerformers: 90, gap: 30, importance: 'important', trend: 'rising' },
  { skill: 'Docker/K8s', yourLevel: 65, marketAvg: 68, topPerformers: 85, gap: 20, importance: 'important', trend: 'rising' },
  { skill: 'SQL', yourLevel: 80, marketAvg: 75, topPerformers: 88, gap: 8, importance: 'important', trend: 'stable' },
  { skill: 'Leadership', yourLevel: 50, marketAvg: 72, topPerformers: 95, gap: 45, importance: 'critical', trend: 'rising' }
];

const salaryTrendData: SalaryTrend[] = [
  { year: '2020', yourRole: 95000, targetRole: 130000, marketAvg: 85000 },
  { year: '2021', yourRole: 105000, targetRole: 140000, marketAvg: 92000 },
  { year: '2022', yourRole: 118000, targetRole: 155000, marketAvg: 100000 },
  { year: '2023', yourRole: 128000, targetRole: 165000, marketAvg: 108000 },
  { year: '2024', yourRole: 135000, targetRole: 175000, marketAvg: 115000 },
  { year: '2025', yourRole: 145000, targetRole: 190000, marketAvg: 125000 }
];

const marketDemandData: MarketDemand[] = [
  { month: 'Jan', jobPostings: 4200, applications: 8500, ratio: 2.02 },
  { month: 'Feb', jobPostings: 4500, applications: 8200, ratio: 1.82 },
  { month: 'Mar', jobPostings: 5100, applications: 9100, ratio: 1.78 },
  { month: 'Apr', jobPostings: 4800, applications: 8800, ratio: 1.83 },
  { month: 'May', jobPostings: 5300, applications: 9500, ratio: 1.79 },
  { month: 'Jun', jobPostings: 5600, applications: 10200, ratio: 1.82 },
  { month: 'Jul', jobPostings: 5200, applications: 9800, ratio: 1.88 },
  { month: 'Aug', jobPostings: 5400, applications: 9600, ratio: 1.78 }
];

// Radar chart data
const radarData = skillComparisonData.map(s => ({
  skill: s.skill,
  You: s.yourLevel,
  'Market Avg': s.marketAvg,
  'Top Performers': s.topPerformers
}));

// Helper functions
const formatSalary = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const getImportanceColor = (importance: string): string => {
  switch (importance) {
    case 'critical': return 'text-red-600 bg-red-100';
    case 'important': return 'text-orange-600 bg-orange-100';
    case 'nice-to-have': return 'text-blue-600 bg-blue-100';
    default: return 'text-slate-600 bg-slate-100';
  }
};

const getTrendColor = (trend: string): string => {
  switch (trend) {
    case 'rising': return 'text-green-600';
    case 'declining': return 'text-red-600';
    default: return 'text-slate-600';
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'rising': return <ArrowUpRight className="w-4 h-4" />;
    case 'declining': return <ArrowDownRight className="w-4 h-4" />;
    default: return <span className="text-sm">→</span>;
  }
};

// Custom tooltip components
const SalaryTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200">
        <p className="font-semibold text-slate-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatSalary(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SkillGapTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200">
        <p className="font-semibold text-slate-900 mb-2">{data.skill}</p>
        <p className="text-sm text-indigo-600">Your Level: {data.yourLevel}%</p>
        <p className="text-sm text-slate-500">Market Avg: {data.marketAvg}%</p>
        <p className="text-sm text-green-600">Top Performers: {data.topPerformers}%</p>
        <p className="text-sm text-red-500 mt-1">Gap to Top: {data.gap}%</p>
      </div>
    );
  }
  return null;
};

// Tab configuration
const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'skills', label: 'Skill Gaps', icon: Target },
  { id: 'salary', label: 'Market Value', icon: DollarSign },
  { id: 'demand', label: 'Market Demand', icon: TrendingUp }
];

export default function SkillBenchmarking() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRole, setSelectedRole] = useState(targetRoles[1]); // Default to Tech Lead
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [comparisonView, setComparisonView] = useState<'bar' | 'radar'>('bar');

  // Calculate metrics
  const overallMatch = Math.round(
    skillComparisonData.reduce((acc, s) => acc + (s.yourLevel / s.topPerformers) * 100, 0) / skillComparisonData.length
  );
  
  const criticalSkillsGap = skillComparisonData
    .filter(s => s.importance === 'critical')
    .reduce((acc, s) => acc + s.gap, 0) / skillComparisonData.filter(s => s.importance === 'critical').length;

  const salaryPotential = Math.round(
    ((selectedRole.avgSalary - salaryTrendData[salaryTrendData.length - 1].yourRole) / 
    salaryTrendData[salaryTrendData.length - 1].yourRole) * 100
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Skill Benchmarking</h1>
          <p className="text-slate-600 mt-1">Compare your skills against market standards</p>
        </div>

        {/* Role Selector */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-3 px-5 py-3 bg-white/50 backdrop-blur-xl border border-white/30 rounded-xl hover:bg-white/70 transition-all shadow-sm"
          >
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <div className="text-left">
              <div className="text-xs text-slate-500">Comparing against</div>
              <div className="font-semibold text-slate-900">{selectedRole.title}</div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200">
                <p className="text-xs font-medium text-slate-500 uppercase">Select Target Role</p>
              </div>
              {targetRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 ${
                    selectedRole.id === role.id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900">{role.title}</div>
                      <div className="text-sm text-slate-500">{formatSalary(role.avgSalary)} avg</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">+{role.growthRate}%</div>
                      <div className="text-xs text-slate-400">growth</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm text-slate-500">Role Match</div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{overallMatch}%</div>
          <div className="text-sm text-green-600 flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-4 h-4" />
            +5% this month
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm text-slate-500">Critical Gap</div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{Math.round(criticalSkillsGap)}%</div>
          <div className="text-sm text-slate-500 mt-1">avg gap in critical skills</div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm text-slate-500">Salary Potential</div>
          </div>
          <div className="text-3xl font-bold text-slate-900">+{salaryPotential}%</div>
          <div className="text-sm text-slate-500 mt-1">
            {formatSalary(selectedRole.avgSalary)} target
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm text-slate-500">Market Demand</div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{selectedRole.demandScore}</div>
          <div className="text-sm text-green-600 flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-4 h-4" />
            +{selectedRole.growthRate}% YoY
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-2 shadow-sm">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skill Comparison Chart */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">You vs Market</h2>
                    <p className="text-sm text-slate-500">Skills comparison for {selectedRole.title}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setComparisonView('bar')}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                      comparisonView === 'bar' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    Bar Chart
                  </button>
                  <button
                    onClick={() => setComparisonView('radar')}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                      comparisonView === 'radar' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    Radar Chart
                  </button>
                </div>
              </div>

              <div className="h-80">
                {comparisonView === 'bar' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={skillComparisonData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={12} />
                      <YAxis type="category" dataKey="skill" stroke="#64748b" fontSize={12} width={90} />
                      <Tooltip content={<SkillGapTooltip />} />
                      <Legend />
                      <Bar dataKey="yourLevel" name="Your Level" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={12} />
                      <Bar dataKey="marketAvg" name="Market Avg" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={12} />
                      <Line type="monotone" dataKey="topPerformers" name="Top Performers" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Radar name="You" dataKey="You" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} strokeWidth={2} />
                      <Radar name="Market Avg" dataKey="Market Avg" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} strokeWidth={2} />
                      <Radar name="Top Performers" dataKey="Top Performers" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Salary Trends */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Salary Trajectory</h2>
                  <p className="text-sm text-slate-500">Your growth vs market trends</p>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salaryTrendData}>
                    <defs>
                      <linearGradient id="yourRoleGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="targetRoleGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip content={<SalaryTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="yourRole" name="Your Role" stroke="#6366f1" fill="url(#yourRoleGradient)" strokeWidth={2} />
                    <Area type="monotone" dataKey="targetRole" name={selectedRole.title} stroke="#10b981" fill="url(#targetRoleGradient)" strokeWidth={2} />
                    <Line type="monotone" dataKey="marketAvg" name="Market Avg" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Target Role Details */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                Target Role Details
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Average Salary</div>
                  <div className="text-2xl font-bold text-green-600">{formatSalary(selectedRole.avgSalary)}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Salary Range</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-700">{formatSalary(selectedRole.salaryRange.min)}</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-indigo-500 to-green-500 h-2 rounded-full" style={{ width: '60%' }} />
                    </div>
                    <span className="text-sm text-slate-700">{formatSalary(selectedRole.salaryRange.max)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-indigo-600">{selectedRole.demandScore}</div>
                    <div className="text-xs text-slate-500">Demand Score</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">+{selectedRole.growthRate}%</div>
                    <div className="text-xs text-slate-500">YoY Growth</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Skill Gaps */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                Priority Skill Gaps
              </h3>
              <div className="space-y-3">
                {skillComparisonData
                  .filter(s => s.importance === 'critical')
                  .sort((a, b) => b.gap - a.gap)
                  .slice(0, 4)
                  .map((skill) => (
                    <div key={skill.skill} className="bg-white/60 border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-900">{skill.skill}</span>
                        <span className={`text-sm font-medium ${getImportanceColor(skill.importance)} px-2 py-0.5 rounded-full`}>
                          {skill.importance}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
                              style={{ width: `${skill.yourLevel}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-slate-600 w-16">
                          {skill.yourLevel}% → {skill.topPerformers}%
                        </span>
                      </div>
                      <div className={`text-sm mt-2 flex items-center gap-1 ${getTrendColor(skill.trend)}`}>
                        {getTrendIcon(skill.trend)}
                        {skill.trend} demand
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Take Action</h3>
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Create Learning Plan
                </button>
                <button className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
                <button className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skill Gaps Tab */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Detailed Skill Gap Analysis</h2>
                  <p className="text-sm text-slate-500">Compare your skills against {selectedRole.title} requirements</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Skill</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-slate-600">Your Level</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-slate-600">Market Avg</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-slate-600">Top Performers</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-slate-600">Gap</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-slate-600">Priority</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-slate-600">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {skillComparisonData.map((skill) => (
                    <tr key={skill.skill} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-medium text-slate-900">{skill.skill}</td>
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-20 bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${skill.yourLevel}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-700 w-8">{skill.yourLevel}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center text-slate-600">{skill.marketAvg}%</td>
                      <td className="py-4 px-4 text-center text-green-600 font-medium">{skill.topPerformers}%</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          skill.gap > 25 ? 'bg-red-100 text-red-600' : 
                          skill.gap > 15 ? 'bg-yellow-100 text-yellow-600' : 
                          'bg-green-100 text-green-600'
                        }`}>
                          {skill.gap}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImportanceColor(skill.importance)}`}>
                          {skill.importance}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`flex items-center justify-center gap-1 ${getTrendColor(skill.trend)}`}>
                          {getTrendIcon(skill.trend)}
                          {skill.trend}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Skill Gap Visualization */}
          <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Gap Visualization</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="skill" stroke="#64748b" fontSize={11} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip content={<SkillGapTooltip />} />
                  <Legend />
                  <Bar dataKey="yourLevel" name="Your Level" stackId="a" fill="#6366f1" />
                  <Bar dataKey="gap" name="Gap to Top" stackId="a" fill="#fbbf24" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Market Value Tab */}
      {activeTab === 'salary' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Salary Comparison */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Salary Trends Over Time</h2>
                  <p className="text-sm text-slate-500">Historical and projected salary data</p>
                </div>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salaryTrendData}>
                    <defs>
                      <linearGradient id="salaryGradient1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="salaryGradient2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip content={<SalaryTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="yourRole" name="Your Current Role" stroke="#6366f1" fill="url(#salaryGradient1)" strokeWidth={3} />
                    <Area type="monotone" dataKey="targetRole" name={selectedRole.title} stroke="#10b981" fill="url(#salaryGradient2)" strokeWidth={3} />
                    <Line type="monotone" dataKey="marketAvg" name="Market Average" stroke="#94a3b8" strokeWidth={2} strokeDasharray="8 8" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Role Comparison */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Role Salary Comparison</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={targetRoles} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${value / 1000}k`} />
                    <YAxis type="category" dataKey="title" stroke="#64748b" fontSize={11} width={120} />
                    <Tooltip formatter={(value: number) => formatSalary(value)} />
                    <Bar dataKey="avgSalary" name="Average Salary" radius={[0, 4, 4, 0]}>
                      {targetRoles.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.id === selectedRole.id ? '#6366f1' : '#cbd5e1'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Salary Insights */}
          <div className="space-y-6">
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Salary Insights</h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <ArrowUpRight className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-700">Upside Potential</h4>
                      <p className="text-sm text-green-600">
                        Reaching {selectedRole.title} could increase your salary by{' '}
                        <strong>{formatSalary(selectedRole.avgSalary - salaryTrendData[salaryTrendData.length - 1].yourRole)}</strong>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-700">Market Position</h4>
                      <p className="text-sm text-blue-600">
                        You're currently earning{' '}
                        <strong>{Math.round((salaryTrendData[salaryTrendData.length - 1].yourRole / salaryTrendData[salaryTrendData.length - 1].marketAvg - 1) * 100)}%</strong>{' '}
                        above market average
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-700">Growth Rate</h4>
                      <p className="text-sm text-amber-600">
                        {selectedRole.title} salaries are growing at{' '}
                        <strong>+{selectedRole.growthRate}%</strong> per year
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Salary Range</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500">Minimum</span>
                    <span className="font-medium text-slate-700">{formatSalary(selectedRole.salaryRange.min)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500">Average</span>
                    <span className="font-medium text-green-600">{formatSalary(selectedRole.avgSalary)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Maximum</span>
                    <span className="font-medium text-slate-700">{formatSalary(selectedRole.salaryRange.max)}</span>
                  </div>
                </div>
                <div className="h-3 bg-slate-200 rounded-full relative">
                  <div 
                    className="absolute h-3 bg-gradient-to-r from-slate-400 via-green-500 to-slate-400 rounded-full"
                    style={{ left: '0%', width: '100%' }}
                  />
                  <div 
                    className="absolute w-1 h-5 bg-green-600 rounded-full -top-1"
                    style={{ left: `${((selectedRole.avgSalary - selectedRole.salaryRange.min) / (selectedRole.salaryRange.max - selectedRole.salaryRange.min)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Market Demand Tab */}
      {activeTab === 'demand' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Job Market Trends */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Job Market Trends</h2>
                  <p className="text-sm text-slate-500">Job postings vs applications for {selectedRole.title}</p>
                </div>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={marketDemandData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="jobPostings" name="Job Postings" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="left" dataKey="applications" name="Applications" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="ratio" name="Competition Ratio" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Demand by Region */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Demand Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-5">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">5.6K</div>
                  <div className="text-sm text-indigo-700 font-medium">Active Job Postings</div>
                  <div className="text-xs text-indigo-500 mt-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    +12% from last month
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                  <div className="text-3xl font-bold text-green-600 mb-2">1.8x</div>
                  <div className="text-sm text-green-700 font-medium">Competition Ratio</div>
                  <div className="text-xs text-green-500 mt-1">Applicants per job</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
                  <div className="text-3xl font-bold text-amber-600 mb-2">14 days</div>
                  <div className="text-sm text-amber-700 font-medium">Avg. Time to Hire</div>
                  <div className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3" />
                    -3 days from avg
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Market Insights Sidebar */}
          <div className="space-y-6">
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Top Hiring Companies
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Google', openings: 234, growth: '+15%' },
                  { name: 'Microsoft', openings: 189, growth: '+12%' },
                  { name: 'Amazon', openings: 312, growth: '+22%' },
                  { name: 'Meta', openings: 156, growth: '+8%' },
                  { name: 'Apple', openings: 98, growth: '+5%' },
                ].map((company, idx) => (
                  <div key={company.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-sm font-bold text-slate-600">
                        {idx + 1}
                      </div>
                      <span className="font-medium text-slate-900">{company.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-700">{company.openings}</div>
                      <div className="text-xs text-green-600">{company.growth}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Market Outlook</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm text-slate-600">Strong demand expected through 2025</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm text-slate-600">Remote roles increasing by 25%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                  <span className="text-sm text-slate-600">AI/ML skills premium: +18% salary</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-amber-500 rounded-full" />
                  <span className="text-sm text-slate-600">Entry barrier decreasing for juniors</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







