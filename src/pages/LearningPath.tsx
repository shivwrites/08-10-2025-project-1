import { useState } from 'react';
import {
  BookOpen, BarChart3, Users, TrendingUp, Plus, Play, CheckCircle2,
  Clock, Trophy, Zap, ChevronDown, ChevronRight, Video, FileText,
  Code, HelpCircle, Award, Flame, Target
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';

// Types
interface LearningPathData {
  id: number;
  title: string;
  description: string;
  skills: string[];
  duration: number;
  estimatedHours: number;
  progress: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'in-progress' | 'completed' | 'not-started' | 'paused';
  projects: number;
  streak: number;
  nextActivity: string;
  createdAt: string;
}

interface WeeklySprint {
  week: number;
  title: string;
  objectives: string[];
  activities: Activity[];
  project: {
    title: string;
    estimatedTime: string;
    completed: boolean;
  };
  completed: boolean;
}

interface Activity {
  id: number;
  title: string;
  type: 'video' | 'reading' | 'practice' | 'quiz' | 'project';
  duration: number;
  completed: boolean;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  date: string;
}

// Sample data
const learningPaths: LearningPathData[] = [
  {
    id: 1,
    title: 'Full-Stack React Development',
    description: 'Master React, Node.js, and MongoDB for complete web development',
    skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Express'],
    duration: 90,
    estimatedHours: 120,
    progress: 65,
    difficulty: 'intermediate',
    status: 'in-progress',
    projects: 4,
    streak: 12,
    nextActivity: 'Complete Authentication Module',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    title: 'Cloud Architecture Fundamentals',
    description: 'Learn AWS services and cloud deployment strategies',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
    duration: 60,
    estimatedHours: 80,
    progress: 100,
    difficulty: 'advanced',
    status: 'completed',
    projects: 6,
    streak: 0,
    nextActivity: 'Certificate Available',
    createdAt: '2023-11-20'
  },
  {
    id: 3,
    title: 'Python for Data Science',
    description: 'Master Python, pandas, and machine learning basics',
    skills: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'Matplotlib'],
    duration: 75,
    estimatedHours: 100,
    progress: 0,
    difficulty: 'beginner',
    status: 'not-started',
    projects: 5,
    streak: 0,
    nextActivity: 'Start Introduction to Python',
    createdAt: '2024-02-01'
  }
];

const weeklySprints: WeeklySprint[] = [
  {
    week: 1,
    title: 'React Fundamentals',
    objectives: [
      'Understand React components and JSX',
      'Learn state management with useState',
      'Practice event handling'
    ],
    activities: [
      { id: 1, title: 'Introduction to React', type: 'video', duration: 45, completed: true },
      { id: 2, title: 'JSX and Components', type: 'reading', duration: 30, completed: true },
      { id: 3, title: 'State and Props', type: 'practice', duration: 60, completed: true },
      { id: 4, title: 'Week 1 Quiz', type: 'quiz', duration: 15, completed: true }
    ],
    project: { title: 'Hello World Component', estimatedTime: '2 hours', completed: true },
    completed: true
  },
  {
    week: 2,
    title: 'Hooks and State Management',
    objectives: [
      'Master React Hooks (useState, useEffect)',
      'Learn custom hooks',
      'Understand state lifting'
    ],
    activities: [
      { id: 5, title: 'useState Hook Deep Dive', type: 'video', duration: 50, completed: true },
      { id: 6, title: 'useEffect Hook', type: 'reading', duration: 40, completed: true },
      { id: 7, title: 'Custom Hooks', type: 'practice', duration: 90, completed: false },
      { id: 8, title: 'Week 2 Quiz', type: 'quiz', duration: 15, completed: false }
    ],
    project: { title: 'Counter App with Hooks', estimatedTime: '3 hours', completed: false },
    completed: false
  },
  {
    week: 3,
    title: 'Advanced Patterns',
    objectives: [
      'Context API for global state',
      'Performance optimization',
      'Error boundaries'
    ],
    activities: [
      { id: 9, title: 'Context API Tutorial', type: 'video', duration: 55, completed: false },
      { id: 10, title: 'React.memo & useMemo', type: 'reading', duration: 35, completed: false },
      { id: 11, title: 'Optimization Practice', type: 'practice', duration: 75, completed: false },
      { id: 12, title: 'Week 3 Quiz', type: 'quiz', duration: 15, completed: false }
    ],
    project: { title: 'Theme Switcher App', estimatedTime: '4 hours', completed: false },
    completed: false
  },
  {
    week: 4,
    title: 'Backend Integration',
    objectives: [
      'REST API communication',
      'Async/await patterns',
      'Data fetching best practices'
    ],
    activities: [
      { id: 13, title: 'Fetch API & Axios', type: 'video', duration: 45, completed: false },
      { id: 14, title: 'Error Handling', type: 'reading', duration: 30, completed: false },
      { id: 15, title: 'API Integration Project', type: 'project', duration: 120, completed: false }
    ],
    project: { title: 'Weather App with API', estimatedTime: '5 hours', completed: false },
    completed: false
  }
];

const recentAchievements: Achievement[] = [
  { id: 1, title: 'Week 1 Complete', description: 'Finished React Fundamentals', icon: '🏆', date: '2024-03-10' },
  { id: 2, title: 'Streak Milestone', description: '10 days in a row!', icon: '🔥', date: '2024-03-08' },
  { id: 3, title: 'Project Complete', description: 'Todo App with Hooks', icon: '💻', date: '2024-03-05' }
];

// Learning progress chart data
const progressData = [
  { name: 'Week 1', hours: 12, progress: 100 },
  { name: 'Week 2', hours: 10, progress: 75 },
  { name: 'Week 3', hours: 8, progress: 40 },
  { name: 'Week 4', hours: 6, progress: 20 },
];

// Helper functions
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
    case 'completed': return 'text-green-600 bg-green-100';
    case 'in-progress': return 'text-blue-600 bg-blue-100';
    case 'paused': return 'text-yellow-600 bg-yellow-100';
    case 'not-started': return 'text-slate-600 bg-slate-100';
    default: return 'text-slate-600 bg-slate-100';
  }
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'video': return <Video className="w-4 h-4" />;
    case 'reading': return <FileText className="w-4 h-4" />;
    case 'practice': return <Code className="w-4 h-4" />;
    case 'quiz': return <HelpCircle className="w-4 h-4" />;
    case 'project': return <Target className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
};

// Tabs configuration
const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'paths', label: 'My Learning Paths', icon: BookOpen },
  { id: 'discover', label: 'Discover Paths', icon: TrendingUp },
  { id: 'community', label: 'Community', icon: Users }
];

export default function LearningPath() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expandedWeek, setExpandedWeek] = useState<number | null>(2);

  const currentPath = learningPaths.find(p => p.status === 'in-progress');

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-2 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
          <button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 ml-4">
            <Plus className="w-4 h-4" />
            Create Learning Path
          </button>
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Learning Path */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Current Learning Path</h2>
              
              {currentPath ? (
                <div className="bg-white/60 border border-slate-200 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">{currentPath.title}</h3>
                      <p className="text-slate-600 mb-4">{currentPath.description}</p>
                      <div className="flex items-center gap-4 mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentPath.difficulty)}`}>
                          {currentPath.difficulty}
                        </span>
                        <span className="text-sm text-slate-500">{currentPath.progress}% Complete</span>
                        <span className="text-sm text-slate-500 flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-500" />
                          {currentPath.streak} day streak
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${currentPath.progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-slate-500">
                        <span className="font-medium">Next:</span> {currentPath.nextActivity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Continue Learning
                    </button>
                    <button className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-300 transition-colors duration-200">
                      View Details
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No Active Learning Path</h3>
                  <p className="text-slate-500 mb-6">Start a new learning journey to begin your skill development</p>
                  <button className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300">
                    Create Learning Path
                  </button>
                </div>
              )}
            </div>

            {/* Weekly Learning Timeline */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Weekly Learning Timeline</h2>
              
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />
                
                <div className="space-y-6">
                  {weeklySprints.map((sprint) => (
                    <div key={sprint.week} className="relative pl-16">
                      {/* Timeline dot */}
                      <div className={`absolute left-4 w-5 h-5 rounded-full border-4 ${
                        sprint.completed 
                          ? 'bg-green-500 border-green-200' 
                          : sprint.week === expandedWeek 
                          ? 'bg-blue-500 border-blue-200' 
                          : 'bg-slate-300 border-slate-100'
                      }`} />
                      
                      <div className="bg-white/60 border border-slate-200 rounded-xl overflow-hidden">
                        {/* Header */}
                        <button
                          onClick={() => setExpandedWeek(expandedWeek === sprint.week ? null : sprint.week)}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              sprint.completed ? 'bg-green-500' : 'bg-indigo-500'
                            }`}>
                              {sprint.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              ) : (
                                <span className="text-white font-bold">{sprint.week}</span>
                              )}
                            </div>
                            <div className="text-left">
                              <h4 className="font-semibold text-slate-900">Week {sprint.week}: {sprint.title}</h4>
                              <p className="text-sm text-slate-500">{sprint.objectives.length} objectives • {sprint.activities.length} activities</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {sprint.completed && (
                              <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                                Completed
                              </span>
                            )}
                            {expandedWeek === sprint.week ? (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </button>
                        
                        {/* Expanded Content */}
                        {expandedWeek === sprint.week && (
                          <div className="px-6 pb-6 border-t border-slate-100">
                            {/* Objectives */}
                            <div className="mt-4 mb-6">
                              <h5 className="text-sm font-semibold text-slate-700 mb-2">Learning Objectives</h5>
                              <ul className="space-y-1">
                                {sprint.objectives.map((objective, idx) => (
                                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                    {objective}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            {/* Activities */}
                            <div className="mb-6">
                              <h5 className="text-sm font-semibold text-slate-700 mb-3">Activities</h5>
                              <div className="space-y-2">
                                {sprint.activities.map((activity) => (
                                  <div key={activity.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        activity.completed ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'
                                      }`}>
                                        {getActivityIcon(activity.type)}
                                      </div>
                                      <div>
                                        <p className={`font-medium ${activity.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                                          {activity.title}
                                        </p>
                                        <p className="text-xs text-slate-500">{activity.duration} min • {activity.type}</p>
                                      </div>
                                    </div>
                                    {activity.completed ? (
                                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    ) : (
                                      <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
                                        Start
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Project */}
                            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-indigo-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <Target className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-900">Week Project: {sprint.project.title}</p>
                                    <p className="text-sm text-slate-500">Estimated: {sprint.project.estimatedTime}</p>
                                  </div>
                                </div>
                                {sprint.project.completed ? (
                                  <span className="px-3 py-1 bg-green-100 text-green-600 text-sm font-medium rounded-full">
                                    Completed
                                  </span>
                                ) : (
                                  <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all">
                                    Start Project
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Chart */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Learning Progress</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressData}>
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
                    <Bar dataKey="hours" name="Hours Spent" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Learning Stats */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Learning Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Current Streak
                  </span>
                  <span className="text-sm font-bold text-orange-500">12 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-500" />
                    Weekly Goal
                  </span>
                  <span className="text-sm font-medium text-slate-900">8/10 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Total Hours
                  </span>
                  <span className="text-sm font-medium text-slate-900">156 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <Code className="w-4 h-4 text-green-500" />
                    Projects
                  </span>
                  <span className="text-sm font-medium text-slate-900">8 completed</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-500" />
                    Skills
                  </span>
                  <span className="text-sm font-medium text-slate-900">12 mastered</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center justify-center gap-2">
                  <Play className="w-4 h-4" />
                  Continue Session
                </button>
                <button className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2">
                  <Code className="w-4 h-4" />
                  Review Projects
                </button>
                <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  Join Study Group
                </button>
                <button className="w-full bg-yellow-600 text-white py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors duration-200 flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" />
                  Ask AI Tutor
                </button>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Achievements</h3>
              <div className="space-y-3">
                {recentAchievements.map((achievement) => (
                  <div key={achievement.id} className="bg-white/60 border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <h4 className="font-medium text-slate-900">{achievement.title}</h4>
                        <p className="text-sm text-slate-500">{achievement.description}</p>
                        <p className="text-xs text-slate-400 mt-1">{achievement.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My Learning Paths Tab */}
      {activeTab === 'paths' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">My Learning Paths</h2>
              <div className="space-y-4">
                {learningPaths.map((path) => (
                  <div key={path.id} className="bg-white/60 border border-slate-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{path.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(path.status)}`}>
                            {path.status.replace('-', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(path.difficulty)}`}>
                            {path.difficulty}
                          </span>
                        </div>
                        <p className="text-slate-600 mb-3">{path.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {path.skills.map((skill) => (
                            <span key={skill} className="px-2 py-1 bg-indigo-100 text-indigo-600 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {path.duration} days
                          </span>
                          <span>•</span>
                          <span>{path.estimatedHours} hours</span>
                          <span>•</span>
                          <span>{path.projects} projects</span>
                          {path.streak > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Flame className="w-4 h-4 text-orange-500" />
                                {path.streak} day streak
                              </span>
                            </>
                          )}
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${path.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {path.status === 'in-progress' && (
                        <button className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center gap-2">
                          <Play className="w-4 h-4" />
                          Continue
                        </button>
                      )}
                      {path.status === 'not-started' && (
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200">
                          Start Path
                        </button>
                      )}
                      {path.status === 'completed' && (
                        <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors duration-200 flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          View Certificate
                        </button>
                      )}
                      <button className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-300 transition-colors duration-200">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Overall Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Paths Started</span>
                  <span className="text-sm font-medium text-slate-900">
                    {learningPaths.filter(p => p.status !== 'not-started').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Paths Completed</span>
                  <span className="text-sm font-medium text-green-600">
                    {learningPaths.filter(p => p.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Total Hours</span>
                  <span className="text-sm font-medium text-slate-900">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Skills Learned</span>
                  <span className="text-sm font-medium text-slate-900">12</span>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Recommended Paths</h3>
              <div className="space-y-3">
                <div className="bg-white/60 border border-slate-200 rounded-lg p-3">
                  <h4 className="font-medium text-slate-900 mb-1">Advanced React Patterns</h4>
                  <p className="text-sm text-slate-500">Master advanced React concepts</p>
                </div>
                <div className="bg-white/60 border border-slate-200 rounded-lg p-3">
                  <h4 className="font-medium text-slate-900 mb-1">Full-Stack TypeScript</h4>
                  <p className="text-sm text-slate-500">End-to-end TypeScript development</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discover Tab */}
      {activeTab === 'discover' && (
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-4">Discover Learning Paths</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Explore curated learning paths designed by industry experts to help you achieve your career goals
            </p>
            <button className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-300">
              Browse All Paths
            </button>
          </div>
        </div>
      )}

      {/* Community Tab */}
      {activeTab === 'community' && (
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-4">Learning Community</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Connect with fellow learners, share your progress, and collaborate on projects
            </p>
            <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300">
              Join Community
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

