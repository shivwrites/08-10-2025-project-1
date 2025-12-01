import { useState, useEffect, useMemo, DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, MapPin, DollarSign, Calendar, Building2, ExternalLink, 
  Plus, Search, X, GripVertical, ChevronRight, FileText, MessageSquare,
  Target, TrendingUp, Award, Archive, XCircle, Clock, CheckCircle2
} from 'lucide-react';
import { FeatureIntegration } from '../lib/featureIntegration';

// --- Types ---
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

interface Column {
  id: string;
  title: string;
  color: string;
  icon: React.ReactNode;
}

interface Analytics {
  total: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  averageMatchScore: number;
  totalApplied: number;
  totalInterviews: number;
  totalOffers: number;
}

// --- Job Tracking Utilities ---
const JobTrackingUtils = {
  getAllTrackedJobs(): TrackedJob[] {
    try {
      const stored = localStorage.getItem('tracked_jobs');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error loading tracked jobs:', e);
      return [];
    }
  },

  saveTrackedJobs(jobs: TrackedJob[]): boolean {
    try {
      localStorage.setItem('tracked_jobs', JSON.stringify(jobs));
      localStorage.setItem('tracked_jobs_last_updated', Date.now().toString());
      return true;
    } catch (e) {
      console.error('Error saving tracked jobs:', e);
      return false;
    }
  },

  getAnalytics(): Analytics {
    const jobs = this.getAllTrackedJobs();
    const stats: Analytics = {
      total: jobs.length,
      byStatus: {},
      bySource: {},
      averageMatchScore: 0,
      totalApplied: 0,
      totalInterviews: 0,
      totalOffers: 0
    };

    let totalMatchScore = 0;
    jobs.forEach(job => {
      stats.byStatus[job.status] = (stats.byStatus[job.status] || 0) + 1;
      stats.bySource[job.source] = (stats.bySource[job.source] || 0) + 1;
      if (job.matchScore) totalMatchScore += job.matchScore;
      if (['applied', 'interviewing', 'offer'].includes(job.status) || job.applicationDate) stats.totalApplied++;
      if (['interviewing', 'offer'].includes(job.status) || job.interviewDate) stats.totalInterviews++;
      if (job.status === 'offer') stats.totalOffers++;
    });

    stats.averageMatchScore = jobs.length > 0 ? Math.round(totalMatchScore / jobs.length) : 0;
    return stats;
  }
};

// --- Main Component ---
const JobTracker = () => {
  const navigate = useNavigate();
  const [jobCards, setJobCards] = useState<TrackedJob[]>([]);
  const [selectedCard, setSelectedCard] = useState<TrackedJob | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'details' | 'notes' | 'ai'>('details');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<number | null>(null);

  // Kanban columns
  const columns: Column[] = [
    { id: 'new-leads', title: 'New Leads', color: 'bg-blue-500', icon: <Target className="w-4 h-4" /> },
    { id: 'reviewing', title: 'Reviewing', color: 'bg-yellow-500', icon: <Clock className="w-4 h-4" /> },
    { id: 'applied', title: 'Applied', color: 'bg-purple-500', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'interviewing', title: 'Interviewing', color: 'bg-orange-500', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'offer', title: 'Offer', color: 'bg-green-500', icon: <Award className="w-4 h-4" /> },
    { id: 'rejected', title: 'Rejected', color: 'bg-red-500', icon: <XCircle className="w-4 h-4" /> },
    { id: 'archived', title: 'Archived', color: 'bg-slate-500', icon: <Archive className="w-4 h-4" /> }
  ];

  // Load jobs from localStorage
  useEffect(() => {
    const loadJobs = () => {
      const jobs = JobTrackingUtils.getAllTrackedJobs();
      setJobCards(jobs);
    };

    loadJobs();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tracked_jobs') {
        loadJobs();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(loadJobs, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Analytics
  const analytics = useMemo(() => JobTrackingUtils.getAnalytics(), [jobCards]);

  // Get column count
  const getColumnCount = (status: string): number => {
    return jobCards.filter(card => card.status === status).length;
  };

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Match score color
  const getMatchScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Drag and drop handlers
  const handleDragStart = (e: DragEvent<HTMLDivElement>, cardId: number) => {
    e.dataTransfer.setData('text/plain', cardId.toString());
    setDraggedCardId(cardId);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setDraggedCardId(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, newStatus: string) => {
    e.preventDefault();
    const cardId = parseFloat(e.dataTransfer.getData('text/plain'));

    const updatedCards = jobCards.map(card => {
      if (card.id === cardId) {
        const updated = { ...card, status: newStatus };
        
        // Auto-set dates based on status
        if (newStatus === 'applied' && !updated.applicationDate) {
          updated.applicationDate = new Date().toISOString().split('T')[0];
        }
        
        return updated;
      }
      return card;
    });

    setJobCards(updatedCards);
    JobTrackingUtils.saveTrackedJobs(updatedCards);
    setDraggedCardId(null);

    // Show notification for interviewing status
    if (newStatus === 'interviewing') {
      const card = updatedCards.find(c => c.id === cardId);
      if (card) {
        showNotification(`"${card.title}" moved to Interviewing! Good luck!`, 'success');
      }
    }
  };

  // Handle card click
  const handleCardClick = (card: TrackedJob) => {
    setSelectedCard(card);
    setShowCardModal(true);
    setActiveModalTab('details');
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowCardModal(false);
    setSelectedCard(null);
  };

  // Handle save notes
  const handleSaveNotes = () => {
    if (selectedCard) {
      const updated = jobCards.map(card =>
        card.id === selectedCard.id ? { ...card, ...selectedCard } : card
      );
      setJobCards(updated);
      JobTrackingUtils.saveTrackedJobs(updated);
      showNotification('Notes saved!', 'success');
    }
  };

  // Handle add job manually
  const handleAddJobManually = () => {
    const title = prompt('Enter job title:');
    const company = prompt('Enter company name:');
    
    if (title && company) {
      const newJob: TrackedJob = {
        id: Date.now() + Math.random(),
        title: title,
        company: company,
        location: prompt('Enter location (optional):') || 'Not specified',
        salary: prompt('Enter salary (optional):') || 'Competitive',
        matchScore: 0,
        postedDate: new Date().toISOString().split('T')[0],
        source: 'Manual Entry',
        status: 'new-leads',
        notes: '',
        applicationDate: '',
        interviewDate: '',
        contacts: '',
        url: '#',
        addedFrom: 'manual',
        addedAt: new Date().toISOString()
      };
      
      const updated = [...jobCards, newJob];
      setJobCards(updated);
      JobTrackingUtils.saveTrackedJobs(updated);
      showNotification('Job added manually!', 'success');
    }
  };

  // Handle delete job
  const handleDeleteJob = (jobId: number) => {
    if (confirm('Are you sure you want to delete this job?')) {
      const updated = jobCards.filter(card => card.id !== jobId);
      setJobCards(updated);
      JobTrackingUtils.saveTrackedJobs(updated);
      handleCloseModal();
      showNotification('Job removed from tracker', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl ${
          notification.type === 'success' ? 'bg-green-500' :
          notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } text-white animate-slide-in`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">{notification.type === 'success' ? '✓' : notification.type === 'error' ? '✕' : 'ℹ️'}</span>
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Analytics Dashboard */}
      {jobCards.length > 0 && (
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Job Search Analytics
            </h3>
            <div className="flex gap-3">
              <button
                onClick={handleAddJobManually}
                className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:from-indigo-600 hover:to-violet-700 transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Job Manually
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700 mb-1">{getColumnCount('new-leads')}</div>
              <div className="text-xs font-medium text-blue-600">New Leads</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-700 mb-1">{analytics.totalApplied}</div>
              <div className="text-xs font-medium text-emerald-600">Applied</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <MessageSquare className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-700 mb-1">{analytics.totalInterviews}</div>
              <div className="text-xs font-medium text-amber-600">Interviews</div>
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
              <Award className="w-6 h-6 text-teal-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-teal-700 mb-1">{analytics.totalOffers}</div>
              <div className="text-xs font-medium text-teal-600">Offers</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
              <Briefcase className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700 mb-1">{analytics.total}</div>
              <div className="text-xs font-medium text-purple-600">Total Tracked</div>
            </div>
            <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 text-center">
              <Target className="w-6 h-6 text-pink-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-pink-700 mb-1">{analytics.averageMatchScore}%</div>
              <div className="text-xs font-medium text-pink-600">Avg. Match</div>
            </div>
          </div>

          {/* Top Sources */}
          {Object.keys(analytics.bySource).length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="text-sm font-semibold text-slate-700 mb-3">Top Sources:</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(analytics.bySource)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([source, count]) => (
                    <span key={source} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                      {source}: {count}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Kanban Board */}
      <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-lg">
        {jobCards.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Jobs Tracked Yet</h3>
            <p className="text-slate-600 mb-6">Start by adding jobs from Job Finder or add them manually.</p>
            <button
              onClick={handleAddJobManually}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-violet-700 transition-all flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Add Your First Job
            </button>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map((column) => (
              <div key={column.id} className="flex-shrink-0 w-72">
                <div className="bg-slate-50/80 rounded-2xl p-4 min-h-96">
                  {/* Column Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      {column.icon}
                      {column.title}
                    </h3>
                    <span className="text-sm text-slate-500 ml-auto">({getColumnCount(column.id)})</span>
                  </div>

                  {/* Drop Zone */}
                  <div
                    className={`space-y-3 min-h-80 transition-colors rounded-xl p-2 ${
                      draggedCardId ? 'bg-indigo-50/50 border-2 border-dashed border-indigo-300' : ''
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                    {jobCards
                      .filter(card => card.status === column.id)
                      .map((card) => (
                        <div
                          key={card.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, card.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => handleCardClick(card)}
                          className={`bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all ${
                            draggedCardId === card.id ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm text-slate-800 mb-1 line-clamp-1">{card.title}</h4>
                              <p className="text-xs text-slate-600">{card.company}</p>
                            </div>
                            {card.matchScore > 0 && (
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getMatchScoreColor(card.matchScore)}`}>
                                {card.matchScore}%
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 text-xs text-slate-500">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              <span className="line-clamp-1">{card.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-3 h-3" />
                              <span>{card.salary}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              <span>Posted: {card.postedDate}</span>
                            </div>
                            {card.applicationDate && (
                              <div className="flex items-center gap-2 text-emerald-600">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Applied: {card.applicationDate}</span>
                              </div>
                            )}
                            {card.interviewDate && (
                              <div className="flex items-center gap-2 text-amber-600">
                                <MessageSquare className="w-3 h-3" />
                                <span>Interview: {card.interviewDate}</span>
                              </div>
                            )}
                          </div>

                          {/* Drag Handle */}
                          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-center">
                            <GripVertical className="w-4 h-4 text-slate-300" />
                          </div>
                        </div>
                      ))}

                    {getColumnCount(column.id) === 0 && (
                      <div className="text-center py-8 text-slate-400 text-sm">
                        Drag jobs here
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Card Modal */}
      {showCardModal && selectedCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedCard.title}</h2>
                <p className="text-slate-600">{selectedCard.company}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200">
              {[
                { id: 'details', label: 'Job Details', icon: <FileText className="w-4 h-4" /> },
                { id: 'notes', label: 'Notes & Activity', icon: <MessageSquare className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveModalTab(tab.id as 'details' | 'notes')}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    activeModalTab === tab.id
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {activeModalTab === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Job Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-800">{selectedCard.company}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-800">{selectedCard.location}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-800">{selectedCard.salary}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-800">Posted: {selectedCard.postedDate}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Application Status</h3>
                      <div className="space-y-3">
                        {selectedCard.matchScore > 0 && (
                          <div className="flex items-center gap-3">
                            <Target className="w-5 h-5 text-slate-400" />
                            <span className="text-slate-800">Match Score: {selectedCard.matchScore}%</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <ExternalLink className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-800">Source: {selectedCard.source}</span>
                        </div>
                        {selectedCard.applicationDate && (
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            <span className="text-slate-800">Applied: {selectedCard.applicationDate}</span>
                          </div>
                        )}
                        {selectedCard.interviewDate && (
                          <div className="flex items-center gap-3">
                            <MessageSquare className="w-5 h-5 text-amber-500" />
                            <span className="text-slate-800">Interview: {selectedCard.interviewDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedCard.whyMatch && (
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                      <p className="text-sm text-indigo-700">
                        <strong>Why this matches:</strong> {selectedCard.whyMatch}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <a
                      href={selectedCard.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-violet-700 transition-all flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Job Posting
                    </a>
                    <button
                      onClick={() => {
                        // Navigate to Resume Studio with job data
                        FeatureIntegration.navigateToResumeStudio(navigate, {
                          type: 'tailor-for-job',
                          data: {
                            id: selectedCard.id,
                            title: selectedCard.title,
                            company: selectedCard.company,
                            location: selectedCard.location,
                            description: selectedCard.description,
                            salary: selectedCard.salary,
                            source: selectedCard.source,
                            url: selectedCard.url,
                          }
                        });
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Create Tailored Resume
                    </button>
                    <button
                      onClick={() => handleDeleteJob(selectedCard.id)}
                      className="px-6 py-3 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition-all flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {activeModalTab === 'notes' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-3">Contacts</label>
                    <input
                      type="text"
                      value={selectedCard.contacts}
                      onChange={(e) => setSelectedCard({ ...selectedCard, contacts: e.target.value })}
                      placeholder="hr@company.com, recruiter@company.com"
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-3">Application Date</label>
                      <input
                        type="date"
                        value={selectedCard.applicationDate}
                        onChange={(e) => setSelectedCard({ ...selectedCard, applicationDate: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-3">Interview Date</label>
                      <input
                        type="date"
                        value={selectedCard.interviewDate}
                        onChange={(e) => setSelectedCard({ ...selectedCard, interviewDate: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-3">Notes</label>
                    <textarea
                      value={selectedCard.notes}
                      onChange={(e) => setSelectedCard({ ...selectedCard, notes: e.target.value })}
                      placeholder="Add your notes about this job application..."
                      rows={4}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none resize-none transition-all"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveNotes}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-violet-700 transition-all"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default JobTracker;

