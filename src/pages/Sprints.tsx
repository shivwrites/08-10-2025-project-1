import { useState } from 'react';
import {
  Search, BookOpen, Trophy, Star, Clock, Users, Play,
  CheckCircle2, Flame, Target, Award, TrendingUp, Filter,
  ChevronRight, X
} from 'lucide-react';

// Types
interface Sprint {
  id: number;
  title: string;
  description: string;
  technology: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  participants: number;
  rating: number;
  deliverable: string;
  skills: string[];
  prerequisites: string[];
  category: string;
  featured: boolean;
  completionRate: number;
  estimatedHours: number;
  industry: string;
  thumbnail: string;
}

interface UserProgress {
  sprintId: number;
  progress: number;
  currentMilestone: number;
  totalMilestones: number;
  timeSpent: number;
  startDate: string;
  status: 'in_progress' | 'completed' | 'paused';
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate: string | null;
}

// Sample data
const sprintsData: Sprint[] = [
  {
    id: 1,
    title: 'Modern E-commerce Platform',
    description: 'Build a full-stack e-commerce platform with React, Node.js, and MongoDB',
    technology: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    difficulty: 'intermediate',
    duration: '3 weeks',
    participants: 1240,
    rating: 4.8,
    deliverable: 'Complete e-commerce website with payment integration',
    skills: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Authentication', 'Payment Processing'],
    prerequisites: ['JavaScript', 'HTML/CSS', 'Basic React'],
    category: 'fullstack',
    featured: true,
    completionRate: 78,
    estimatedHours: 40,
    industry: 'E-commerce',
    thumbnail: '🛒'
  },
  {
    id: 2,
    title: 'AI-Powered Chat Application',
    description: 'Create an intelligent chat application with OpenAI integration',
    technology: ['React', 'TypeScript', 'OpenAI', 'WebSocket'],
    difficulty: 'advanced',
    duration: '2 weeks',
    participants: 890,
    rating: 4.9,
    deliverable: 'Real-time chat app with AI responses',
    skills: ['React', 'TypeScript', 'OpenAI API', 'WebSocket', 'Real-time Communication'],
    prerequisites: ['React', 'TypeScript', 'API Integration'],
    category: 'ai',
    featured: true,
    completionRate: 65,
    estimatedHours: 30,
    industry: 'AI/ML',
    thumbnail: '🤖'
  },
  {
    id: 3,
    title: 'Mobile-First Dashboard Design',
    description: 'Design and build a responsive dashboard with modern UI/UX',
    technology: ['React', 'Tailwind CSS', 'Chart.js', 'Framer Motion'],
    difficulty: 'beginner',
    duration: '2 weeks',
    participants: 2100,
    rating: 4.7,
    deliverable: 'Responsive dashboard with data visualization',
    skills: ['React', 'Tailwind CSS', 'Chart.js', 'Responsive Design', 'UI/UX'],
    prerequisites: ['HTML/CSS', 'JavaScript', 'Basic React'],
    category: 'frontend',
    featured: false,
    completionRate: 85,
    estimatedHours: 25,
    industry: 'SaaS',
    thumbnail: '📊'
  },
  {
    id: 4,
    title: 'DevOps Pipeline Mastery',
    description: 'Master CI/CD pipelines with Docker, GitHub Actions, and AWS',
    technology: ['Docker', 'GitHub Actions', 'AWS', 'Kubernetes'],
    difficulty: 'advanced',
    duration: '3 weeks',
    participants: 650,
    rating: 4.6,
    deliverable: 'Complete DevOps pipeline with automated deployment',
    skills: ['Docker', 'CI/CD', 'AWS', 'Kubernetes', 'Infrastructure as Code'],
    prerequisites: ['Linux', 'Git', 'Basic Cloud Knowledge'],
    category: 'devops',
    featured: false,
    completionRate: 70,
    estimatedHours: 45,
    industry: 'DevOps',
    thumbnail: '⚙️'
  },
  {
    id: 5,
    title: 'React Native Mobile App',
    description: 'Build a cross-platform mobile app with React Native and Expo',
    technology: ['React Native', 'Expo', 'Firebase', 'Redux'],
    difficulty: 'intermediate',
    duration: '3 weeks',
    participants: 980,
    rating: 4.5,
    deliverable: 'Cross-platform mobile application',
    skills: ['React Native', 'Expo', 'Firebase', 'Redux', 'Mobile Development'],
    prerequisites: ['React', 'JavaScript', 'Mobile Development Basics'],
    category: 'mobile',
    featured: false,
    completionRate: 75,
    estimatedHours: 35,
    industry: 'Mobile',
    thumbnail: '📱'
  },
  {
    id: 6,
    title: 'Microservices Architecture Sprint',
    description: 'Design and implement a microservices architecture with Node.js',
    technology: ['Node.js', 'Docker', 'Redis', 'PostgreSQL', 'API Gateway'],
    difficulty: 'advanced',
    duration: '4 weeks',
    participants: 420,
    rating: 4.8,
    deliverable: 'Scalable microservices system',
    skills: ['Node.js', 'Microservices', 'Docker', 'Redis', 'PostgreSQL', 'API Design'],
    prerequisites: ['Node.js', 'Database Knowledge', 'System Design'],
    category: 'backend',
    featured: false,
    completionRate: 60,
    estimatedHours: 50,
    industry: 'Enterprise',
    thumbnail: '🏗️'
  }
];

const userProgress: UserProgress[] = [
  { sprintId: 1, progress: 65, currentMilestone: 3, totalMilestones: 5, timeSpent: 26, startDate: '2024-01-15', status: 'in_progress' },
  { sprintId: 3, progress: 100, currentMilestone: 5, totalMilestones: 5, timeSpent: 25, startDate: '2024-01-01', status: 'completed' }
];

const achievementsData: Achievement[] = [
  { id: 1, title: 'First Sprint Complete', description: 'Completed your first learning sprint', icon: '🏆', earned: true, earnedDate: '2024-01-20' },
  { id: 2, title: 'Frontend Master', description: 'Completed 3 frontend sprints', icon: '🎨', earned: true, earnedDate: '2024-01-25' },
  { id: 3, title: 'Full-Stack Developer', description: 'Completed both frontend and backend sprints', icon: '💻', earned: false, earnedDate: null },
  { id: 4, title: 'Sprint Streak', description: 'Completed 5 sprints in a row', icon: '🔥', earned: false, earnedDate: null },
  { id: 5, title: 'Advanced Learner', description: 'Completed 3 advanced difficulty sprints', icon: '🚀', earned: false, earnedDate: null },
  { id: 6, title: 'Community Helper', description: 'Helped 10 other learners in sprint discussions', icon: '🤝', earned: false, earnedDate: null }
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

const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'frontend': return '💻';
    case 'backend': return '🗄️';
    case 'fullstack': return '🌐';
    case 'mobile': return '📱';
    case 'ai': return '🧠';
    case 'devops': return '⚙️';
    default: return '📚';
  }
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'frontend': return 'text-blue-600 bg-blue-100';
    case 'backend': return 'text-green-600 bg-green-100';
    case 'fullstack': return 'text-purple-600 bg-purple-100';
    case 'mobile': return 'text-pink-600 bg-pink-100';
    case 'ai': return 'text-orange-600 bg-orange-100';
    case 'devops': return 'text-slate-600 bg-slate-100';
    default: return 'text-slate-600 bg-slate-100';
  }
};

// Tabs configuration
const tabs = [
  { id: 'browse', label: 'Browse Sprints', icon: Search },
  { id: 'my-sprints', label: 'My Sprints', icon: BookOpen },
  { id: 'achievements', label: 'Achievements', icon: Trophy }
];

export default function Sprints() {
  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTechnology, setFilterTechnology] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterDuration, setFilterDuration] = useState('all');
  const [enrolledSprints, setEnrolledSprints] = useState<number[]>([1, 3]);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [showSprintDetail, setShowSprintDetail] = useState(false);

  // Handle sprint enrollment
  const handleEnrollSprint = (sprintId: number) => {
    if (enrolledSprints.includes(sprintId)) {
      setEnrolledSprints(enrolledSprints.filter(id => id !== sprintId));
    } else {
      setEnrolledSprints([...enrolledSprints, sprintId]);
    }
  };

  // Filter sprints
  const filteredSprints = sprintsData.filter(sprint => {
    const matchesSearch = sprint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sprint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sprint.technology.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTechnology = filterTechnology === 'all' || sprint.technology.includes(filterTechnology);
    const matchesDifficulty = filterDifficulty === 'all' || sprint.difficulty === filterDifficulty;
    const matchesDuration = filterDuration === 'all' || 
      (filterDuration === '1-2' && sprint.duration.includes('2 weeks')) ||
      (filterDuration === '2-3' && sprint.duration.includes('3 weeks')) ||
      (filterDuration === '3+' && sprint.duration.includes('4 weeks'));
    
    return matchesSearch && matchesTechnology && matchesDifficulty && matchesDuration;
  });

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
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Browse Sprints Tab */}
      {activeTab === 'browse' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filters */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search sprints..."
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Technology</label>
                  <select
                    value={filterTechnology}
                    onChange={(e) => setFilterTechnology(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Technologies</option>
                    <option value="React">React</option>
                    <option value="Node.js">Node.js</option>
                    <option value="TypeScript">TypeScript</option>
                    <option value="Docker">Docker</option>
                    <option value="AWS">AWS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Difficulty</label>
                  <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Duration</label>
                  <select
                    value={filterDuration}
                    onChange={(e) => setFilterDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Durations</option>
                    <option value="1-2">1-2 weeks</option>
                    <option value="2-3">2-3 weeks</option>
                    <option value="3+">3+ weeks</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Featured Sprints */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                Featured Sprints
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sprintsData.filter(sprint => sprint.featured).map((sprint) => (
                  <div key={sprint.id} className="bg-white/60 border border-slate-200 rounded-xl p-6 hover:border-orange-300 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{sprint.thumbnail}</span>
                          <h3 className="text-xl font-semibold text-slate-900">{sprint.title}</h3>
                        </div>
                        <p className="text-slate-600 mb-3">{sprint.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {sprint.technology.slice(0, 3).map((tech) => (
                            <span key={tech} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                              {tech}
                            </span>
                          ))}
                          {sprint.technology.length > 3 && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                              +{sprint.technology.length - 3} more
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {sprint.duration}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {sprint.participants.toLocaleString()}
                          </span>
                          <span>•</span>
                          <span>{sprint.estimatedHours} hours</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(sprint.difficulty)}`}>
                            {sprint.difficulty}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-yellow-600">
                            <Star className="w-4 h-4 fill-yellow-400" />
                            {sprint.rating}
                          </span>
                        </div>
                        {enrolledSprints.includes(sprint.id) && (
                          <div className="mb-3">
                            <div className="flex justify-between text-sm text-slate-500 mb-1">
                              <span>Progress</span>
                              <span>{userProgress.find(p => p.sprintId === sprint.id)?.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${userProgress.find(p => p.sprintId === sprint.id)?.progress || 0}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {enrolledSprints.includes(sprint.id) ? (
                        <button className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center gap-2">
                          <Play className="w-4 h-4" />
                          Continue Sprint
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleEnrollSprint(sprint.id)}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
                        >
                          Start Sprint
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setSelectedSprint(sprint);
                          setShowSprintDetail(true);
                        }}
                        className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-300 transition-colors duration-200"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Sprints */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">All Sprints</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSprints.filter(sprint => !sprint.featured).map((sprint) => (
                  <div key={sprint.id} className="bg-white/60 border border-slate-200 rounded-xl p-4 hover:border-orange-300 transition-all duration-300">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-xl">{sprint.thumbnail}</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900">{sprint.title}</h3>
                        <p className="text-sm text-slate-600 mb-2">{sprint.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(sprint.difficulty)}`}>
                        {sprint.difficulty}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(sprint.category)}`}>
                        {getCategoryIcon(sprint.category)} {sprint.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {sprint.duration}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {sprint.rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {enrolledSprints.includes(sprint.id) ? (
                        <button className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 text-sm">
                          Continue
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleEnrollSprint(sprint.id)}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 text-sm"
                        >
                          Start Sprint
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setSelectedSprint(sprint);
                          setShowSprintDetail(true);
                        }}
                        className="bg-slate-200 text-slate-700 px-3 py-2 rounded-lg font-medium hover:bg-slate-300 transition-colors duration-200 text-sm"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Progress */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Active Sprints</span>
                  <span className="text-sm font-medium text-slate-900">{enrolledSprints.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Completed</span>
                  <span className="text-sm font-medium text-green-600">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Total Hours</span>
                  <span className="text-sm font-medium text-slate-900">51 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Achievements</span>
                  <span className="text-sm font-medium text-yellow-600">2 earned</span>
                </div>
              </div>
            </div>

            {/* Trending This Week */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Trending This Week
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm">⚛️</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">React</h4>
                    <p className="text-sm text-slate-500">+340 new learners</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm">🐍</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Python</h4>
                    <p className="text-sm text-slate-500">+280 new learners</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm">⚡</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">TypeScript</h4>
                    <p className="text-sm text-slate-500">+190 new learners</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sprint Tips */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Sprint Tips</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2" />
                  <p className="text-sm text-slate-600">Set aside 2-3 hours daily for consistent progress</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2" />
                  <p className="text-sm text-slate-600">Join the community discussions for help</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2" />
                  <p className="text-sm text-slate-600">Complete the deliverable for maximum learning</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2" />
                  <p className="text-sm text-slate-600">Share your progress to stay motivated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My Sprints Tab */}
      {activeTab === 'my-sprints' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Sprints */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Active Sprints</h2>
              {enrolledSprints.length > 0 ? (
                <div className="space-y-4">
                  {sprintsData.filter(sprint => enrolledSprints.includes(sprint.id)).map((sprint) => {
                    const progress = userProgress.find(p => p.sprintId === sprint.id);
                    return (
                      <div key={sprint.id} className="bg-white/60 border border-slate-200 rounded-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">{sprint.thumbnail}</span>
                              <h3 className="text-xl font-semibold text-slate-900">{sprint.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(sprint.difficulty)}`}>
                                {sprint.difficulty}
                              </span>
                            </div>
                            <p className="text-slate-600 mb-3">{sprint.description}</p>
                            <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                              <span>Milestone {progress?.currentMilestone || 0}/{progress?.totalMilestones || 0}</span>
                              <span>•</span>
                              <span>{progress?.timeSpent || 0} hours spent</span>
                              <span>•</span>
                              <span>Started {progress?.startDate || 'N/A'}</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
                              <div 
                                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress?.progress || 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center gap-2">
                            <Play className="w-4 h-4" />
                            Continue Sprint
                          </button>
                          <button className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-300 transition-colors duration-200">
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No Active Sprints</h3>
                  <p className="text-slate-500 mb-6">Start a learning sprint to begin your focused learning journey</p>
                  <button 
                    onClick={() => setActiveTab('browse')}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                  >
                    Browse Sprints
                  </button>
                </div>
              )}
            </div>

            {/* Completed Sprints */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Completed Sprints</h2>
              <div className="space-y-4">
                {sprintsData.filter(sprint => userProgress.find(p => p.sprintId === sprint.id && p.status === 'completed')).map((sprint) => (
                  <div key={sprint.id} className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{sprint.thumbnail}</span>
                          <h3 className="text-xl font-semibold text-slate-900">{sprint.title}</h3>
                          <span className="px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </span>
                        </div>
                        <p className="text-slate-600 mb-3">{sprint.description}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-yellow-500" />
                            Certificate Available
                          </span>
                          <span>•</span>
                          <span>100% Complete</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center gap-2">
                        <Trophy className="w-4 h-4" />
                        View Certificate
                      </button>
                      <button className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-300 transition-colors duration-200">
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Sprint Progress */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Current Sprint Progress</h3>
              <div className="space-y-4">
                {enrolledSprints.length > 0 ? (
                  sprintsData.filter(sprint => enrolledSprints.includes(sprint.id)).map((sprint) => {
                    const progress = userProgress.find(p => p.sprintId === sprint.id);
                    return (
                      <div key={sprint.id} className="bg-white/60 border border-slate-200 rounded-lg p-4">
                        <h4 className="font-medium text-slate-900 mb-2">{sprint.title}</h4>
                        <div className="flex justify-between text-sm text-slate-500 mb-2">
                          <span>Progress</span>
                          <span>{progress?.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                          <div 
                            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress?.progress || 0}%` }}
                          />
                        </div>
                        <div className="text-sm text-slate-500">
                          Milestone {progress?.currentMilestone || 0}/{progress?.totalMilestones || 0}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-500 text-sm">No active sprints</p>
                )}
              </div>
            </div>

            {/* Learning Streak */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Learning Streak
              </h3>
              <div className="flex items-center gap-2 mb-4">
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    i < 5 ? 'bg-orange-500' : 'bg-slate-200'
                  }`}>
                    {i < 5 && <Flame className="w-4 h-4 text-white" />}
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-600">5 day streak! Keep it up!</p>
            </div>

            {/* Recommended Next */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Recommended Next</h3>
              <div className="bg-white/60 border border-slate-200 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 mb-2">AI-Powered Chat Application</h4>
                <p className="text-sm text-slate-500 mb-3">Build an intelligent chat app with OpenAI</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor('advanced')}`}>
                    advanced
                  </span>
                  <span className="text-sm text-slate-500">2 weeks</span>
                </div>
                <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300">
                  Start Sprint
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Achievements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {achievementsData.map((achievement) => (
                  <div key={achievement.id} className={`border rounded-xl p-6 ${
                    achievement.earned 
                      ? 'bg-yellow-50 border-yellow-200' 
                      : 'bg-white/60 border-slate-200'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        achievement.earned ? 'bg-yellow-500' : 'bg-slate-200'
                      }`}>
                        <span className="text-xl">{achievement.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-2 ${
                          achievement.earned ? 'text-yellow-700' : 'text-slate-400'
                        }`}>
                          {achievement.title}
                        </h3>
                        <p className={`text-sm mb-2 ${
                          achievement.earned ? 'text-slate-600' : 'text-slate-400'
                        }`}>
                          {achievement.description}
                        </p>
                        {achievement.earned && achievement.earnedDate && (
                          <p className="text-xs text-yellow-600">
                            Earned on {achievement.earnedDate}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Achievement Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Earned</span>
                  <span className="text-sm font-medium text-yellow-600">2/6</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Completion Rate</span>
                  <span className="text-sm font-medium text-slate-900">33%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Next Achievement</span>
                  <span className="text-sm font-medium text-slate-900">Full-Stack Developer</span>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Skill Progress</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">React</span>
                    <span className="text-sm font-medium text-slate-900">85%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">Node.js</span>
                    <span className="text-sm font-medium text-slate-900">70%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '70%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">TypeScript</span>
                    <span className="text-sm font-medium text-slate-900">60%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sprint Detail Modal */}
      {showSprintDetail && selectedSprint && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">{selectedSprint.title}</h2>
              <button
                onClick={() => setShowSprintDetail(false)}
                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sprint Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Sprint Details</h3>
                  <p className="text-slate-600 mb-4">{selectedSprint.description}</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">Deliverable:</span>
                      <span className="text-sm text-slate-900">{selectedSprint.deliverable}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">Duration:</span>
                      <span className="text-sm text-slate-900">{selectedSprint.duration}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">Estimated Hours:</span>
                      <span className="text-sm text-slate-900">{selectedSprint.estimatedHours} hours</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">Industry:</span>
                      <span className="text-sm text-slate-900">{selectedSprint.industry}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Technology Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSprint.technology.map((tech) => (
                      <span key={tech} className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Skills You'll Learn</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSprint.skills.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-indigo-100 text-indigo-600 text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Prerequisites</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSprint.prerequisites.map((prereq) => (
                      <span key={prereq} className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full">
                        {prereq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sprint Stats */}
              <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Sprint Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Participants</span>
                      <span className="text-sm font-medium text-slate-900">{selectedSprint.participants.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Rating</span>
                      <span className="text-sm font-medium text-slate-900 flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {selectedSprint.rating}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Completion Rate</span>
                      <span className="text-sm font-medium text-slate-900">{selectedSprint.completionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Difficulty</span>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${getDifficultyColor(selectedSprint.difficulty)}`}>
                        {selectedSprint.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {enrolledSprints.includes(selectedSprint.id) ? (
                    <button className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center gap-2">
                      <Play className="w-5 h-5" />
                      Continue Sprint
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        handleEnrollSprint(selectedSprint.id);
                        setShowSprintDetail(false);
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
                    >
                      Start Sprint
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







