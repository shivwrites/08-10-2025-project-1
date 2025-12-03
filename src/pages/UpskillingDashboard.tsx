import { useState } from 'react';
import {
  BarChart3, Target, BookOpen, Zap, Trophy, TrendingUp,
  Clock, Award, ChevronRight, Play, CheckCircle2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';

// Types
interface Skill {
  id: number;
  name: string;
  currentLevel: number;
  targetLevel: number;
  marketDemand: 'high' | 'medium' | 'low';
  trendDirection: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

interface LearningPath {
  id: number;
  title: string;
  description: string;
  progress: number;
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skills: string[];
  nextMilestone: string;
}

interface Sprint {
  id: number;
  title: string;
  description: string;
  duration: string;
  status: 'active' | 'upcoming' | 'completed';
  progress: number;
  deliverable: string;
  startDate: string;
  endDate: string;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  color: string;
  date: string;
}

// Sample data
const skills: Skill[] = [
  { id: 1, name: 'React', currentLevel: 85, targetLevel: 90, marketDemand: 'high', trendDirection: 'up', lastUpdated: '2024-03-15' },
  { id: 2, name: 'TypeScript', currentLevel: 75, targetLevel: 85, marketDemand: 'high', trendDirection: 'up', lastUpdated: '2024-03-14' },
  { id: 3, name: 'Node.js', currentLevel: 70, targetLevel: 80, marketDemand: 'medium', trendDirection: 'stable', lastUpdated: '2024-03-12' },
  { id: 4, name: 'Python', currentLevel: 60, targetLevel: 75, marketDemand: 'high', trendDirection: 'up', lastUpdated: '2024-03-10' },
];

const learningPaths: LearningPath[] = [
  {
    id: 1,
    title: 'Full Stack Development',
    description: 'Master modern web development with React, Node.js, and databases',
    progress: 65,
    estimatedTime: '6 months',
    difficulty: 'intermediate',
    skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
    nextMilestone: 'Build a complete e-commerce application'
  },
  {
    id: 2,
    title: 'AI/ML Engineering',
    description: 'Learn machine learning fundamentals and AI development',
    progress: 25,
    estimatedTime: '8 months',
    difficulty: 'advanced',
    skills: ['Python', 'TensorFlow', 'Data Science', 'MLOps'],
    nextMilestone: 'Complete your first ML project'
  },
  {
    id: 3,
    title: 'DevOps & Cloud',
    description: 'Master cloud infrastructure and deployment strategies',
    progress: 40,
    estimatedTime: '4 months',
    difficulty: 'intermediate',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    nextMilestone: 'Deploy a scalable microservices architecture'
  }
];

const sprints: Sprint[] = [
  {
    id: 1,
    title: 'React Performance Optimization',
    description: 'Learn advanced React patterns and optimization techniques',
    duration: '2 weeks',
    status: 'active',
    progress: 60,
    deliverable: 'Optimized React application',
    startDate: '2024-03-10',
    endDate: '2024-03-24'
  },
  {
    id: 2,
    title: 'TypeScript Advanced Patterns',
    description: 'Master advanced TypeScript features and design patterns',
    duration: '3 weeks',
    status: 'upcoming',
    progress: 0,
    deliverable: 'TypeScript utility library',
    startDate: '2024-03-25',
    endDate: '2024-04-15'
  },
  {
    id: 3,
    title: 'Node.js Microservices',
    description: 'Build scalable microservices with Node.js',
    duration: '4 weeks',
    status: 'completed',
    progress: 100,
    deliverable: 'Microservices architecture',
    startDate: '2024-02-15',
    endDate: '2024-03-10'
  }
];

const achievements: Achievement[] = [
  { id: 1, title: 'Sprint Completed', description: 'React Performance Optimization', color: 'bg-green-500', date: '2024-03-15' },
  { id: 2, title: 'Skill Milestone', description: 'React Level 85%', color: 'bg-blue-500', date: '2024-03-14' },
  { id: 3, title: 'Market Alignment', description: 'High demand skills improved', color: 'bg-purple-500', date: '2024-03-12' }
];

// Learning hours chart data
const learningHoursData = [
  { name: 'Mon', hours: 2.5 },
  { name: 'Tue', hours: 3.0 },
  { name: 'Wed', hours: 1.5 },
  { name: 'Thu', hours: 4.0 },
  { name: 'Fri', hours: 2.0 },
  { name: 'Sat', hours: 5.0 },
  { name: 'Sun', hours: 3.5 },
];

// Skill progress chart data
const skillProgressData = skills.map(skill => ({
  name: skill.name,
  current: skill.currentLevel,
  target: skill.targetLevel,
  gap: skill.targetLevel - skill.currentLevel
}));

// Helper functions
const getSkillLevelColor = (level: number): string => {
  if (level >= 80) return 'text-green-600';
  if (level >= 60) return 'text-blue-600';
  if (level >= 40) return 'text-yellow-600';
  return 'text-red-600';
};

const getMarketDemandColor = (demand: string): string => {
  switch (demand) {
    case 'high': return 'text-green-600 bg-green-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'low': return 'text-red-600 bg-red-100';
    default: return 'text-slate-600 bg-slate-100';
  }
};

const getTrendIcon = (trend: string): string => {
  switch (trend) {
    case 'up': return '📈';
    case 'down': return '📉';
    case 'stable': return '➡️';
    default: return '➡️';
  }
};

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'beginner': return 'text-green-600 bg-green-100';
    case 'intermediate': return 'text-yellow-600 bg-yellow-100';
    case 'advanced': return 'text-red-600 bg-red-100';
    default: return 'text-slate-600 bg-slate-100';
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active': return 'text-green-600 bg-green-100';
    case 'completed': return 'text-blue-600 bg-blue-100';
    case 'upcoming': return 'text-orange-600 bg-orange-100';
    default: return 'text-slate-600 bg-slate-100';
  }
};

// Tabs configuration
const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'skills', label: 'Skills Radar', icon: Target },
  { id: 'paths', label: 'Learning Paths', icon: BookOpen },
  { id: 'sprints', label: 'Learning Sprints', icon: Zap },
  { id: 'certifications', label: 'Certifications', icon: Trophy }
];

export default function UpskillingDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-2 shadow-sm">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg'
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
          <div className="lg:col-span-2 space-y-8">
            {/* Learning Progress Overview */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Learning Progress Overview</h2>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-white/50 rounded-xl">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">12</div>
                  <div className="text-sm text-slate-500">Skills Tracked</div>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-xl">
                  <div className="text-3xl font-bold text-green-600 mb-2">65%</div>
                  <div className="text-sm text-slate-500">Avg. Progress</div>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-xl">
                  <div className="text-3xl font-bold text-purple-600 mb-2">8</div>
                  <div className="text-sm text-slate-500">Completed Sprints</div>
                </div>
              </div>

              {/* Learning Hours Chart */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Learning Hours This Week</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={learningHoursData}>
                      <defs>
                        <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
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
                      <Area 
                        type="monotone" 
                        dataKey="hours" 
                        stroke="#6366f1" 
                        fillOpacity={1} 
                        fill="url(#hoursGradient)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Active Learning Paths */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Active Learning Paths</h3>
                <div className="space-y-4">
                  {learningPaths.slice(0, 2).map((path) => (
                    <div key={path.id} className="bg-white/60 border border-slate-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900 mb-2">{path.title}</h4>
                          <p className="text-slate-600 mb-3">{path.description}</p>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(path.difficulty)}`}>
                              {path.difficulty}
                            </span>
                            <span className="text-sm text-slate-500 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {path.estimatedTime}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-indigo-600 mb-1">{path.progress}%</div>
                          <div className="text-sm text-slate-500">Progress</div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-slate-500 mb-2">
                          <span>Progress</span>
                          <span>{path.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${path.progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-slate-600 mb-2">
                          <strong>Next Milestone:</strong> {path.nextMilestone}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {path.skills.map((skill) => (
                            <span key={skill} className="px-2 py-1 bg-indigo-100 text-indigo-600 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2">
                        <Play className="w-4 h-4" />
                        Continue Learning
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Learning Sprints */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Current Learning Sprints</h3>
              <div className="space-y-4">
                {sprints.filter(sprint => sprint.status === 'active').map((sprint) => (
                  <div key={sprint.id} className="bg-white/60 border border-slate-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900 mb-2">{sprint.title}</h4>
                        <p className="text-slate-600 mb-3">{sprint.description}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {sprint.duration}
                          </span>
                          <span>•</span>
                          <span>Deliverable: {sprint.deliverable}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sprint.status)}`}>
                        {sprint.status}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-slate-500 mb-2">
                        <span>Progress</span>
                        <span>{sprint.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${sprint.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skill Radar Summary */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Skill Radar Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">4</div>
                  <div className="text-xs text-slate-500">High Demand Skills</div>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">3</div>
                  <div className="text-xs text-slate-500">Trending Up</div>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">2</div>
                  <div className="text-xs text-slate-500">Skills to Learn</div>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">85%</div>
                  <div className="text-xs text-slate-500">Market Alignment</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-300">
                  Start New Sprint
                </button>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200">
                  Browse Learning Paths
                </button>
                <button className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200">
                  Plan Certifications
                </button>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Achievements</h3>
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="bg-white/60 border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full ${achievement.color} mt-1.5 flex-shrink-0`} />
                      <div>
                        <h4 className="font-medium text-slate-900">{achievement.title}</h4>
                        <p className="text-sm text-slate-600">{achievement.description}</p>
                        <p className="text-xs text-slate-500 mt-1">{achievement.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Skills Portfolio</h2>

              {/* Skill Progress Chart */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Skill Progress vs Target</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skillProgressData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={12} />
                      <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={80} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="current" name="Current Level" fill="#6366f1" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="target" name="Target Level" fill="#c7d2fe" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Skills List */}
              <div className="space-y-6">
                {skills.map((skill) => (
                  <div key={skill.id} className="bg-white/60 border border-slate-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">{skill.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMarketDemandColor(skill.marketDemand)}`}>
                              {skill.marketDemand} demand
                            </span>
                            <div className="flex items-center gap-1">
                              <span>{getTrendIcon(skill.trendDirection)}</span>
                              <span className="text-sm text-slate-500">{skill.trendDirection}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                            <span>Current: {skill.currentLevel}%</span>
                            <span>Target: {skill.targetLevel}%</span>
                            <span>Updated: {skill.lastUpdated}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getSkillLevelColor(skill.currentLevel)}`}>
                          {skill.currentLevel}%
                        </div>
                        <div className="text-sm text-slate-500">Current Level</div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-slate-500 mb-2">
                        <span>Progress to Target</span>
                        <span>{skill.currentLevel}/{skill.targetLevel}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(skill.currentLevel / skill.targetLevel) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-500">
                        {skill.targetLevel - skill.currentLevel}% to reach target
                      </div>
                      <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200">
                        Update Progress
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Market Insights */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Market Insights</h3>
              <div className="space-y-4">
                <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-700 mb-1 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Trending Skill
                  </h4>
                  <p className="text-sm text-green-600">AI/ML skills are in high demand (+25% growth)</p>
                </div>
                <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-700 mb-1 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Opportunity
                  </h4>
                  <p className="text-sm text-blue-600">React developers earn 15% more than average</p>
                </div>
                <div className="bg-purple-100 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-700 mb-1 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Recommendation
                  </h4>
                  <p className="text-sm text-purple-600">Focus on TypeScript to boost your market value</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Learning Paths Tab */}
      {activeTab === 'paths' && (
        <div className="space-y-8">
          <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Learning Paths</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {learningPaths.map((path) => (
                <div key={path.id} className="bg-white/60 border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{path.title}</h3>
                      <p className="text-slate-600 mb-3">{path.description}</p>
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(path.difficulty)}`}>
                          {path.difficulty}
                        </span>
                        <span className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {path.estimatedTime}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-600 mb-1">{path.progress}%</div>
                      <div className="text-sm text-slate-500">Progress</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-slate-500 mb-2">
                      <span>Progress</span>
                      <span>{path.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${path.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {path.skills.map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-indigo-100 text-indigo-600 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2">
                    <ChevronRight className="w-4 h-4" />
                    Continue Learning
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Learning Sprints Tab */}
      {activeTab === 'sprints' && (
        <div className="space-y-8">
          <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Learning Sprints</h2>
              <button className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Start New Sprint
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sprints.map((sprint) => (
                <div key={sprint.id} className="bg-white/60 border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{sprint.title}</h3>
                      <p className="text-slate-600 mb-3">{sprint.description}</p>
                      <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {sprint.duration}
                        </span>
                        <span>•</span>
                        <span>{sprint.deliverable}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sprint.status)}`}>
                      {sprint.status}
                    </span>
                  </div>
                  
                  {sprint.status === 'active' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-slate-500 mb-2">
                        <span>Progress</span>
                        <span>{sprint.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${sprint.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                    <span>Start: {sprint.startDate}</span>
                    <span>End: {sprint.endDate}</span>
                  </div>
                  
                  <button className={`w-full py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
                    sprint.status === 'active' 
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : sprint.status === 'completed'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}>
                    {sprint.status === 'active' ? (
                      <>
                        <Play className="w-4 h-4" />
                        Continue Sprint
                      </>
                    ) : sprint.status === 'completed' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        View Results
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Start Sprint
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Certifications Tab */}
      {activeTab === 'certifications' && (
        <div className="space-y-8">
          <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">Certification Planning</h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                Plan and track your professional certifications to boost your career
              </p>
              <button className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-300">
                Plan Certifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





