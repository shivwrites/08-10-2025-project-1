import { useState } from 'react';
import {
  Globe,
  Layout,
  Image,
  ExternalLink,
  Share2,
  Plus,
  Upload,
  FileText,
  Link2,
  Palette,
  Settings,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Check,
  Copy,
  Loader2,
  Github,
  Linkedin,
  Code2,
  User,
  Briefcase,
  Target,
  Clock,
  MessageSquare,
  Mail,
  ChevronRight,
  GripVertical,
  Eye,
  Rocket,
  Star
} from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  liveUrl: string;
  githubUrl: string;
  featured: boolean;
}

interface Template {
  id: number;
  name: string;
  category: string;
  preview: string;
  description: string;
  blocks: string[];
  gradient: string;
}

interface Block {
  id: string;
  type: string;
  icon: React.ReactNode;
  description: string;
}

interface PortfolioBlock {
  id: number;
  type: string;
  title: string;
  content: string;
  position: number;
  visible: boolean;
}

interface SEOSettings {
  title: string;
  description: string;
  keywords: string;
}

type Step = 'onboarding' | 'import' | 'template' | 'editor' | 'preview' | 'publish';
type PreviewDevice = 'mobile' | 'tablet' | 'desktop';
type ImportStatus = '' | 'uploading' | 'processing' | 'success';

const AICareerPortfolio = () => {
  const [step, setStep] = useState<Step>('onboarding');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [portfolioBlocks, setPortfolioBlocks] = useState<PortfolioBlock[]>([]);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus>('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [seoSettings, setSeoSettings] = useState<SEOSettings>({
    title: '',
    description: '',
    keywords: ''
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({
    title: '',
    description: '',
    technologies: [],
    imageUrl: '',
    liveUrl: '',
    githubUrl: '',
    featured: false
  });

  const templates: Template[] = [
    {
      id: 1,
      name: 'Executive Professional',
      category: 'Corporate',
      preview: 'Professional blue theme with clean layout',
      description: 'Perfect for executives and senior professionals',
      blocks: ['Header', 'About', 'Experience', 'Skills', 'Contact'],
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      id: 2,
      name: 'Developer Portfolio',
      category: 'Tech',
      preview: 'Dark theme with code focus',
      description: 'Ideal for software developers and engineers',
      blocks: ['Header', 'About', 'Projects', 'Skills', 'Experience', 'Contact'],
      gradient: 'from-gray-600 to-gray-800'
    },
    {
      id: 3,
      name: 'Creative Showcase',
      category: 'Creative',
      preview: 'Purple-pink theme for visual professionals',
      description: 'Great for designers and creative professionals',
      blocks: ['Header', 'About', 'Portfolio', 'Skills', 'Testimonials', 'Contact'],
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 4,
      name: 'Clean Minimal',
      category: 'Minimalist',
      preview: 'Clean gray theme',
      description: 'Simple and clean for any professional',
      blocks: ['Header', 'About', 'Experience', 'Contact'],
      gradient: 'from-gray-400 to-gray-600'
    }
  ];

  const blockLibrary: Block[] = [
    {
      id: 'header',
      type: 'Header',
      icon: <User className="w-5 h-5" />,
      description: 'Name, title, and hero image'
    },
    {
      id: 'about',
      type: 'About',
      icon: <FileText className="w-5 h-5" />,
      description: 'Professional summary and bio'
    },
    {
      id: 'projects',
      type: 'Projects',
      icon: <Briefcase className="w-5 h-5" />,
      description: 'Portfolio showcase'
    },
    {
      id: 'skills',
      type: 'Skills',
      icon: <Target className="w-5 h-5" />,
      description: 'Technical and soft skills'
    },
    {
      id: 'experience',
      type: 'Experience',
      icon: <Clock className="w-5 h-5" />,
      description: 'Work history and achievements'
    },
    {
      id: 'testimonials',
      type: 'Testimonials',
      icon: <MessageSquare className="w-5 h-5" />,
      description: 'Client recommendations'
    },
    {
      id: 'contact',
      type: 'Contact',
      icon: <Mail className="w-5 h-5" />,
      description: 'Contact information'
    }
  ];

  const mockProjects: Project[] = [
    {
      id: 1,
      title: 'E-Commerce Platform',
      description: 'Full-stack e-commerce solution with React and Node.js',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      imageUrl: '/api/placeholder/400/300',
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com/example',
      featured: true
    },
    {
      id: 2,
      title: 'Task Management App',
      description: 'Collaborative task management with real-time updates',
      technologies: ['Vue.js', 'Firebase', 'Tailwind CSS'],
      imageUrl: '/api/placeholder/400/300',
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com/example',
      featured: false
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];
      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF, DOCX, and DOC files are allowed');
        return;
      }
      setUploadedFile(file);
      setImportStatus('uploading');

      // Simulate processing
      setTimeout(() => {
        setImportStatus('processing');
        setTimeout(() => {
          setImportStatus('success');
        }, 2000);
      }, 1000);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleGeneratePortfolio = () => {
    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      setPortfolioBlocks(
        blockLibrary.map((block, index) => ({
          id: Date.now() + index,
          type: block.type,
          title: block.type,
          content: `Sample ${block.type} content`,
          position: index,
          visible: true
        }))
      );
      setPortfolioUrl('https://portfolio.yourcareer.com/johndoe');
      setIsGenerating(false);
      setStep('editor');
    }, 3000);
  };

  const handleAddBlock = (block: Block) => {
    const newBlock: PortfolioBlock = {
      id: Date.now(),
      type: block.type,
      title: block.type,
      content: `Sample ${block.type} content`,
      position: portfolioBlocks.length,
      visible: true
    };
    setPortfolioBlocks([...portfolioBlocks, newBlock]);
  };

  const handlePublish = () => {
    setStep('publish');
  };

  const getDeviceSize = () => {
    switch (previewDevice) {
      case 'mobile':
        return 'max-w-xs';
      case 'tablet':
        return 'max-w-md';
      case 'desktop':
        return 'max-w-4xl';
      default:
        return 'max-w-4xl';
    }
  };

  const getProgressWidth = () => {
    switch (step) {
      case 'onboarding':
        return '16.67%';
      case 'import':
        return '33.33%';
      case 'template':
        return '50%';
      case 'editor':
        return '66.67%';
      case 'preview':
        return '83.33%';
      case 'publish':
        return '100%';
      default:
        return '0%';
    }
  };

  const getStepNumber = () => {
    const steps: Record<Step, string> = {
      onboarding: 'Step 1 of 6',
      import: 'Step 2 of 6',
      template: 'Step 3 of 6',
      editor: 'Step 4 of 6',
      preview: 'Step 5 of 6',
      publish: 'Step 6 of 6'
    };
    return steps[step];
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(portfolioUrl);
  };

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Portfolio Creation Progress</h2>
          <span className="text-sm text-slate-500">{getStepNumber()}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: getProgressWidth() }}
          />
        </div>
      </div>

      {/* Step Content */}
      {step === 'onboarding' && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-indigo-500/30">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-slate-800 mb-6">
            Build Your Professional Portfolio in Minutes
          </h2>
          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto">
            Our AI analyzes your resume and professional data to create a stunning, personalized
            portfolio website that showcases your expertise and achievements.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-5xl mx-auto">
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Import Your Data</h3>
              <p className="text-slate-600">
                Upload your resume or connect your LinkedIn profile to get started
              </p>
            </div>

            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Choose Your Style</h3>
              <p className="text-slate-600">
                Select from professional templates designed for your industry
              </p>
            </div>

            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">AI Generates</h3>
              <p className="text-slate-600">
                Get a complete portfolio ready to publish in minutes
              </p>
            </div>
          </div>

          <button
            onClick={() => setStep('import')}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg shadow-indigo-500/30"
          >
            Start Building My Portfolio
          </button>
        </div>
      )}

      {step === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resume Upload */}
          <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Upload Your Resume</h2>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">Drop your resume here</h3>
              <p className="text-slate-500 mb-4">PDF, DOCX, or DOC files only (max 5MB)</p>
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Choose File
              </label>

              {uploadedFile && (
                <div className="mt-4">
                  {importStatus === 'uploading' && (
                    <div className="p-3 bg-amber-100 border border-amber-300 rounded-lg">
                      <div className="flex items-center justify-center gap-2 text-amber-700">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium">Uploading...</span>
                      </div>
                    </div>
                  )}
                  {importStatus === 'processing' && (
                    <div className="p-3 bg-indigo-100 border border-indigo-300 rounded-lg">
                      <div className="flex items-center justify-center gap-2 text-indigo-700">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium">Processing resume...</span>
                      </div>
                    </div>
                  )}
                  {importStatus === 'success' && (
                    <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-lg">
                      <div className="flex items-center justify-center gap-2 text-emerald-700">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">{uploadedFile.name} processed successfully</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Social Integration */}
          <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Social Integration</h2>
            </div>

            <div className="space-y-4">
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2">
                <Linkedin className="w-5 h-5" />
                Connect LinkedIn
              </button>

              <button className="w-full bg-slate-700 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors duration-200 flex items-center justify-center gap-2">
                <Github className="w-5 h-5" />
                Connect GitHub
              </button>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Existing Portfolio URL
                </label>
                <input
                  type="url"
                  placeholder="https://yourportfolio.com"
                  className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 text-center">
            <button
              onClick={() => setStep('template')}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30"
            >
              Continue to Templates
              <ChevronRight className="w-5 h-5 inline ml-2" />
            </button>
          </div>
        </div>
      )}

      {step === 'template' && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Choose Your Template</h2>
            <p className="text-xl text-slate-600">
              Select a professional template that matches your industry and style
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className={`bg-white/50 backdrop-blur-xl border rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 shadow-lg ${
                  selectedTemplate?.id === template.id
                    ? 'border-indigo-500 ring-2 ring-indigo-500/50'
                    : 'border-white/30 hover:border-indigo-500/50'
                }`}
              >
                <div
                  className={`w-full h-32 bg-gradient-to-r ${template.gradient} rounded-lg mb-4 flex items-center justify-center`}
                >
                  <Layout className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{template.name}</h3>
                <p className="text-sm text-slate-600 mb-3">{template.description}</p>
                <div className="flex flex-wrap gap-1">
                  {template.blocks.map((block, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded"
                    >
                      {block}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {selectedTemplate && (
            <div className="text-center">
              <button
                onClick={handleGeneratePortfolio}
                disabled={isGenerating}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Portfolio...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Generate My Portfolio
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Block Library */}
          <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <Layout className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Block Library</h3>
            </div>

            <div className="space-y-3">
              {blockLibrary.map((block) => (
                <div
                  key={block.id}
                  onClick={() => handleAddBlock(block)}
                  className="bg-white/30 backdrop-blur-xl border border-white/20 rounded-lg p-4 cursor-pointer hover:border-indigo-500/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                      {block.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800">{block.type}</h4>
                      <p className="text-sm text-slate-500">{block.description}</p>
                    </div>
                    <Plus className="w-4 h-4 text-slate-400 ml-auto" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-purple-100 border border-purple-200 rounded-lg">
              <h4 className="font-medium text-purple-700 mb-2">AI Assistant</h4>
              <p className="text-sm text-slate-600 mb-3">
                Enhance your content with AI suggestions
              </p>
              <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Get AI Suggestions
              </button>
            </div>
          </div>

          {/* Center - Portfolio Preview */}
          <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Portfolio Preview</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    previewDevice === 'mobile'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('tablet')}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    previewDevice === 'tablet'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    previewDevice === 'desktop'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              className="bg-white rounded-lg p-6 overflow-auto border border-slate-200"
              style={{ maxHeight: '600px' }}
            >
              <div className={`mx-auto ${getDeviceSize()}`}>
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">John Doe</h1>
                  <p className="text-xl text-slate-600">Senior Software Engineer</p>
                </div>

                <div className="space-y-8">
                  <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">About</h2>
                    <p className="text-slate-700">
                      Experienced software engineer with 5+ years of experience in full-stack
                      development...
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {['React', 'Node.js', 'Python', 'AWS', 'Docker'].map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Projects</h2>
                    <div className="grid grid-cols-1 gap-4">
                      {mockProjects.map((project) => (
                        <div
                          key={project.id}
                          className="border border-slate-200 rounded-lg p-4"
                        >
                          <h3 className="font-semibold text-slate-900 mb-2">
                            {project.title}
                          </h3>
                          <p className="text-slate-600 text-sm mb-2">{project.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {project.technologies.map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Customization */}
          <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Customization</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Portfolio URL
                </label>
                <input
                  type="text"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Theme</label>
                <select className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>Professional Blue</option>
                  <option>Dark Theme</option>
                  <option>Minimal Gray</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Custom Domain (Premium)
                </label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="yourname.com"
                  className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">SEO Title</label>
                <input
                  type="text"
                  value={seoSettings.title}
                  onChange={(e) => setSeoSettings({ ...seoSettings, title: e.target.value })}
                  placeholder="John Doe - Software Engineer"
                  className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  SEO Description
                </label>
                <textarea
                  value={seoSettings.description}
                  onChange={(e) =>
                    setSeoSettings({ ...seoSettings, description: e.target.value })
                  }
                  placeholder="Professional portfolio of John Doe, Senior Software Engineer..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('preview')}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={handlePublish}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-slate-800">Portfolio Preview</h2>
            <div className="flex gap-4">
              <button
                onClick={() => setStep('editor')}
                className="bg-slate-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-700 transition-colors duration-200"
              >
                Edit Portfolio
              </button>
              <button
                onClick={handlePublish}
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-200 flex items-center gap-2"
              >
                <Rocket className="w-4 h-4" />
                Publish Portfolio
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="w-32 h-32 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <User className="w-16 h-16 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4">John Doe</h1>
                <p className="text-2xl text-slate-600 mb-6">Senior Software Engineer</p>
                <div className="flex justify-center gap-4">
                  <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200">
                    Download Resume
                  </button>
                  <button className="bg-slate-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-700 transition-colors duration-200">
                    Contact Me
                  </button>
                </div>
              </div>

              <div className="space-y-12">
                <section>
                  <h2 className="text-3xl font-bold text-slate-900 mb-6">About Me</h2>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    Experienced software engineer with 5+ years of experience in full-stack
                    development. Passionate about creating scalable web applications and leading
                    development teams. Expertise in React, Node.js, Python, and cloud
                    technologies.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold text-slate-900 mb-6">Skills</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      'React',
                      'Node.js',
                      'Python',
                      'AWS',
                      'Docker',
                      'MongoDB',
                      'TypeScript',
                      'GraphQL'
                    ].map((skill) => (
                      <div
                        key={skill}
                        className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center"
                      >
                        <span className="font-medium text-indigo-900">{skill}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-3xl font-bold text-slate-900 mb-6">Featured Projects</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {mockProjects.map((project) => (
                      <div
                        key={project.id}
                        className="border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
                      >
                        <h3 className="text-xl font-semibold text-slate-900 mb-3">
                          {project.title}
                        </h3>
                        <p className="text-slate-600 mb-4">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-4">
                          <button className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                            <ExternalLink className="w-4 h-4" />
                            View Live
                          </button>
                          <button className="text-slate-600 hover:text-slate-700 font-medium flex items-center gap-1">
                            <Github className="w-4 h-4" />
                            GitHub
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-3xl font-bold text-slate-900 mb-6">Contact</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Email</h3>
                      <p className="text-slate-600">john.doe@example.com</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Phone</h3>
                      <p className="text-slate-600">+1 (555) 123-4567</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Location</h3>
                      <p className="text-slate-600">San Francisco, CA</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Social</h3>
                      <div className="flex gap-4">
                        <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                          <Linkedin className="w-4 h-4" />
                          LinkedIn
                        </button>
                        <button className="text-slate-600 hover:text-slate-700 flex items-center gap-1">
                          <Github className="w-4 h-4" />
                          GitHub
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'publish' && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/30">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-slate-800 mb-6">
            Portfolio Published Successfully!
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Your professional portfolio is now live and ready to share
          </p>

          <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 max-w-2xl mx-auto mb-8 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Your Portfolio URL</h3>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={portfolioUrl}
                readOnly
                className="flex-1 px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-lg"
              />
              <button
                onClick={copyToClipboard}
                className="bg-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              <a
                href={portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setStep('editor')}
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors duration-200"
            >
              Continue Editing
            </button>
            <button className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-emerald-700 transition-colors duration-200 flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share Portfolio
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICareerPortfolio;







