import { useState } from 'react';
import {
  Award, FileCheck, Share2, Plus, Download, ExternalLink,
  Calendar, Building2, X, CheckCircle2, Clock, Eye,
  BadgeCheck, Shield, Sparkles, TrendingUp, Filter, Search
} from 'lucide-react';

// Types
interface Certification {
  id: number;
  name: string;
  issuer: string;
  issuerLogo?: string;
  dateEarned: string;
  expirationDate?: string;
  credentialId: string;
  credentialUrl: string;
  skills: string[];
  category: 'cloud' | 'development' | 'data' | 'security' | 'management' | 'other';
  status: 'active' | 'expiring-soon' | 'expired';
  verificationStatus: 'verified' | 'pending' | 'unverified';
  badgeImage?: string;
  description: string;
}

interface NewCertification {
  name: string;
  issuer: string;
  dateEarned: string;
  expirationDate: string;
  credentialId: string;
  credentialUrl: string;
  skills: string;
  category: string;
  description: string;
}

// Sample certifications data
const sampleCertifications: Certification[] = [
  {
    id: 1,
    name: 'AWS Solutions Architect - Professional',
    issuer: 'Amazon Web Services',
    dateEarned: '2024-02-15',
    expirationDate: '2027-02-15',
    credentialId: 'AWS-SAP-2024-0123',
    credentialUrl: 'https://aws.amazon.com/verify/SAP2024',
    skills: ['Cloud Architecture', 'AWS', 'System Design', 'Security'],
    category: 'cloud',
    status: 'active',
    verificationStatus: 'verified',
    description: 'Validates advanced technical skills in designing distributed applications and systems on AWS.'
  },
  {
    id: 2,
    name: 'Google Cloud Professional Data Engineer',
    issuer: 'Google Cloud',
    dateEarned: '2024-01-10',
    expirationDate: '2026-01-10',
    credentialId: 'GCP-PDE-2024-0456',
    credentialUrl: 'https://cloud.google.com/verify/PDE2024',
    skills: ['Data Engineering', 'BigQuery', 'Machine Learning', 'GCP'],
    category: 'data',
    status: 'active',
    verificationStatus: 'verified',
    description: 'Demonstrates ability to design, build, and maintain data processing systems on Google Cloud.'
  },
  {
    id: 3,
    name: 'Certified Kubernetes Administrator (CKA)',
    issuer: 'Linux Foundation',
    dateEarned: '2023-11-20',
    expirationDate: '2024-11-20',
    credentialId: 'LF-CKA-2023-0789',
    credentialUrl: 'https://training.linuxfoundation.org/verify/CKA2023',
    skills: ['Kubernetes', 'Docker', 'Container Orchestration', 'DevOps'],
    category: 'development',
    status: 'expiring-soon',
    verificationStatus: 'verified',
    description: 'Validates skills to perform the responsibilities of a Kubernetes administrator.'
  },
  {
    id: 4,
    name: 'Professional Scrum Master I (PSM I)',
    issuer: 'Scrum.org',
    dateEarned: '2023-08-05',
    credentialId: 'PSM-2023-1234',
    credentialUrl: 'https://scrum.org/verify/PSM2023',
    skills: ['Scrum', 'Agile', 'Team Leadership', 'Project Management'],
    category: 'management',
    status: 'active',
    verificationStatus: 'verified',
    description: 'Demonstrates fundamental knowledge of Scrum and ability to support Scrum Teams.'
  },
  {
    id: 5,
    name: 'CompTIA Security+',
    issuer: 'CompTIA',
    dateEarned: '2023-05-12',
    expirationDate: '2026-05-12',
    credentialId: 'COMP-SEC-2023-5678',
    credentialUrl: 'https://comptia.org/verify/SEC2023',
    skills: ['Cybersecurity', 'Network Security', 'Risk Management', 'Compliance'],
    category: 'security',
    status: 'active',
    verificationStatus: 'verified',
    description: 'Validates baseline skills for performing core security functions.'
  },
  {
    id: 6,
    name: 'Meta React Developer Certificate',
    issuer: 'Meta',
    dateEarned: '2024-03-01',
    credentialId: 'META-REACT-2024-9012',
    credentialUrl: 'https://coursera.org/verify/REACT2024',
    skills: ['React', 'JavaScript', 'Front-End Development', 'UI/UX'],
    category: 'development',
    status: 'active',
    verificationStatus: 'pending',
    description: 'Professional certificate demonstrating proficiency in React development.'
  }
];

// Category configurations
const categories = [
  { id: 'all', label: 'All', icon: Award },
  { id: 'cloud', label: 'Cloud', icon: Shield },
  { id: 'development', label: 'Development', icon: FileCheck },
  { id: 'data', label: 'Data', icon: TrendingUp },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'management', label: 'Management', icon: Building2 },
];

// Helper functions
const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'cloud': return 'text-blue-600 bg-blue-100 border-blue-200';
    case 'development': return 'text-purple-600 bg-purple-100 border-purple-200';
    case 'data': return 'text-green-600 bg-green-100 border-green-200';
    case 'security': return 'text-red-600 bg-red-100 border-red-200';
    case 'management': return 'text-orange-600 bg-orange-100 border-orange-200';
    default: return 'text-slate-600 bg-slate-100 border-slate-200';
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active': return 'text-green-600 bg-green-100';
    case 'expiring-soon': return 'text-yellow-600 bg-yellow-100';
    case 'expired': return 'text-red-600 bg-red-100';
    default: return 'text-slate-600 bg-slate-100';
  }
};

const getVerificationColor = (status: string): string => {
  switch (status) {
    case 'verified': return 'text-green-600';
    case 'pending': return 'text-yellow-600';
    case 'unverified': return 'text-slate-400';
    default: return 'text-slate-400';
  }
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getDaysUntilExpiration = (expirationDate?: string): number | null => {
  if (!expirationDate) return null;
  const today = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function Certifications() {
  const [certifications, setCertifications] = useState<Certification[]>(sampleCertifications);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newCertification, setNewCertification] = useState<NewCertification>({
    name: '',
    issuer: '',
    dateEarned: '',
    expirationDate: '',
    credentialId: '',
    credentialUrl: '',
    skills: '',
    category: 'development',
    description: ''
  });

  // Filter certifications
  const filteredCertifications = certifications.filter(cert => {
    const matchesCategory = selectedCategory === 'all' || cert.category === selectedCategory;
    const matchesSearch = cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Stats
  const totalCerts = certifications.length;
  const activeCerts = certifications.filter(c => c.status === 'active').length;
  const verifiedCerts = certifications.filter(c => c.verificationStatus === 'verified').length;
  const expiringCerts = certifications.filter(c => c.status === 'expiring-soon').length;

  // Handle add certification
  const handleAddCertification = () => {
    const newCert: Certification = {
      id: certifications.length + 1,
      name: newCertification.name,
      issuer: newCertification.issuer,
      dateEarned: newCertification.dateEarned,
      expirationDate: newCertification.expirationDate || undefined,
      credentialId: newCertification.credentialId,
      credentialUrl: newCertification.credentialUrl,
      skills: newCertification.skills.split(',').map(s => s.trim()),
      category: newCertification.category as Certification['category'],
      status: 'active',
      verificationStatus: 'pending',
      description: newCertification.description
    };
    setCertifications([newCert, ...certifications]);
    setShowAddModal(false);
    setNewCertification({
      name: '',
      issuer: '',
      dateEarned: '',
      expirationDate: '',
      credentialId: '',
      credentialUrl: '',
      skills: '',
      category: 'development',
      description: ''
    });
  };

  // Handle share
  const handleShare = (cert: Certification) => {
    setSelectedCertification(cert);
    setShowShareModal(true);
  };

  // Handle verify
  const handleVerify = (cert: Certification) => {
    if (cert.credentialUrl) {
      window.open(cert.credentialUrl, '_blank');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Certification Wallet</h1>
          <p className="text-slate-600 mt-1">Manage and showcase your professional credentials</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 shadow-lg shadow-orange-500/25"
        >
          <Plus className="w-5 h-5" />
          Add Certification
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{totalCerts}</div>
              <div className="text-sm text-slate-500">Total Certificates</div>
            </div>
          </div>
        </div>
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{activeCerts}</div>
              <div className="text-sm text-slate-500">Active</div>
            </div>
          </div>
        </div>
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <BadgeCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{verifiedCerts}</div>
              <div className="text-sm text-slate-500">Verified</div>
            </div>
          </div>
        </div>
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{expiringCerts}</div>
              <div className="text-sm text-slate-500">Expiring Soon</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search certifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/80"
            />
          </div>
          
          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Certifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCertifications.map((cert) => {
          const daysUntilExpiration = getDaysUntilExpiration(cert.expirationDate);
          
          return (
            <div
              key={cert.id}
              className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              {/* Badge Header */}
              <div className={`h-2 ${
                cert.category === 'cloud' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                cert.category === 'development' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                cert.category === 'data' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                cert.category === 'security' ? 'bg-gradient-to-r from-red-500 to-rose-500' :
                cert.category === 'management' ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
                'bg-gradient-to-r from-slate-500 to-slate-600'
              }`} />
              
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${getCategoryColor(cert.category)} border`}>
                      <Award className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-amber-600 transition-colors">
                        {cert.name}
                      </h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <Building2 className="w-3 h-3" />
                        {cert.issuer}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cert.status)}`}>
                    {cert.status === 'active' ? 'Active' : cert.status === 'expiring-soon' ? 'Expiring Soon' : 'Expired'}
                  </span>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 ${getVerificationColor(cert.verificationStatus)}`}>
                    {cert.verificationStatus === 'verified' ? <BadgeCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {cert.verificationStatus}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(cert.category)}`}>
                    {cert.category}
                  </span>
                </div>

                {/* Dates */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Earned: {formatDate(cert.dateEarned)}</span>
                  </div>
                  {cert.expirationDate && (
                    <div className={`flex items-center gap-2 ${
                      daysUntilExpiration && daysUntilExpiration < 90 ? 'text-yellow-600' : 'text-slate-600'
                    }`}>
                      <Clock className="w-4 h-4" />
                      <span>
                        Expires: {formatDate(cert.expirationDate)}
                        {daysUntilExpiration && daysUntilExpiration > 0 && daysUntilExpiration < 90 && (
                          <span className="ml-1 text-yellow-600 font-medium">
                            ({daysUntilExpiration} days left)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Credential ID */}
                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <div className="text-xs text-slate-500 mb-1">Credential ID</div>
                  <div className="text-sm font-mono text-slate-700">{cert.credentialId}</div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {cert.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                    {cert.skills.length > 3 && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                        +{cert.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerify(cert)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Verify
                  </button>
                  <button
                    onClick={() => handleShare(cert)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2.5 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCertifications.length === 0 && (
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-12 shadow-sm text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-900 mb-4">No Certifications Found</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'all' 
              ? "No certifications match your current filters. Try adjusting your search."
              : "Start building your professional credentials by adding your first certification."}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 mx-auto hover:from-amber-600 hover:to-orange-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Your First Certification
          </button>
        </div>
      )}

      {/* Add Certification Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Add New Certification</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Certification Name *
                  </label>
                  <input
                    type="text"
                    value={newCertification.name}
                    onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g., AWS Solutions Architect"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Issuing Organization *
                  </label>
                  <input
                    type="text"
                    value={newCertification.issuer}
                    onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g., Amazon Web Services"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date Earned *
                  </label>
                  <input
                    type="date"
                    value={newCertification.dateEarned}
                    onChange={(e) => setNewCertification({ ...newCertification, dateEarned: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Expiration Date (if applicable)
                  </label>
                  <input
                    type="date"
                    value={newCertification.expirationDate}
                    onChange={(e) => setNewCertification({ ...newCertification, expirationDate: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Credential ID *
                  </label>
                  <input
                    type="text"
                    value={newCertification.credentialId}
                    onChange={(e) => setNewCertification({ ...newCertification, credentialId: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g., AWS-123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={newCertification.category}
                    onChange={(e) => setNewCertification({ ...newCertification, category: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="cloud">Cloud</option>
                    <option value="development">Development</option>
                    <option value="data">Data</option>
                    <option value="security">Security</option>
                    <option value="management">Management</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Credential URL
                </label>
                <input
                  type="url"
                  value={newCertification.credentialUrl}
                  onChange={(e) => setNewCertification({ ...newCertification, credentialUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="https://verify.example.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={newCertification.skills}
                  onChange={(e) => setNewCertification({ ...newCertification, skills: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., Cloud Architecture, AWS, System Design"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newCertification.description}
                  onChange={(e) => setNewCertification({ ...newCertification, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  placeholder="Brief description of what this certification validates..."
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCertification}
                disabled={!newCertification.name || !newCertification.issuer || !newCertification.dateEarned || !newCertification.credentialId}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Certification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedCertification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Share Certificate</h2>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-slate-900 mb-1">{selectedCertification.name}</h3>
                <p className="text-sm text-slate-500">{selectedCertification.issuer}</p>
              </div>

              <div className="space-y-3">
                <button className="w-full p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </div>
                  <span className="font-medium text-slate-700">Share on LinkedIn</span>
                </button>
                
                <button className="w-full p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-slate-600" />
                  </div>
                  <span className="font-medium text-slate-700">Copy verification link</span>
                </button>

                <button className="w-full p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-medium text-slate-700">Download as PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





