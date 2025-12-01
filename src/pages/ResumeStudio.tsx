import { useState, useRef, useEffect, useMemo, memo } from 'react';
import React from 'react';
import { 
  analyzeResumeATS, 
  enhanceResumeText, 
  analyzeCareerGaps,
  generateProfessionalSummary,
  extractAndMatchKeywords,
  ATSAnalysisResult,
  EnhancedTextResult,
  GapJustificationResult,
  KeywordExtractionResult
} from '../lib/resumeAI';
import {
  resumeTemplates,
  getTemplateById,
  getTemplateCategories,
  isTwoColumnTemplate,
  ResumeTemplate
} from '../lib/resumeTemplates';
import {
  FeatureIntegration,
  LinkedInProfileData,
  JobDataForResume,
  ResumeStudioAction
} from '../lib/featureIntegration';
import {
  exportToPDF,
  exportToHTML,
  exportToTXT,
  exportToRTF,
  exportToJSON,
  createShareableLink,
  generateQRCodeUrl,
  copyToClipboard,
  getAllShareableLinks,
  deleteShareableLink,
  ShareableLinkData
} from '../lib/resumeExport';
import { useNavigate } from 'react-router-dom';

// --- Types ---
interface Resume {
  id: string;
  title: string;
  type: 'master' | 'campaign';
  content: string;
  atsScore: number;
  createdAt: string;
  updatedAt: string;
  templateId?: string;
  photoUrl?: string;
}

interface FormattingSettings {
  alignment: string;
  textColor: string;
  highlightColor: string;
  fontStyle: string;
  fontSize: number;
  headingSize: number;
  sectionSpacing: number;
  paragraphSpacing: number;
  lineSpacing: number;
  topBottomMargin: number;
  sideMargins: number;
  paragraphIndent: number;
}

// --- 1. LEGACY ICON SYSTEM (Exact Replica) ---
// This preserves the exact visual look of your original icons.

interface IconProps {
  className?: string;
}

const CreateIcon = ({ svgContent, className }: { svgContent: string, className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    dangerouslySetInnerHTML={{ __html: svgContent }}
  />
);

const FileText = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />`} />;
const Upload = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />`} />;
const Plus = (props: IconProps) => <CreateIcon {...props} svgContent={`<line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />`} />;
const AlertCircle = (props: IconProps) => <CreateIcon {...props} svgContent={`<circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />`} />;
const CheckCircle = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />`} />;
const ArrowRight = (props: IconProps) => <CreateIcon {...props} svgContent={`<line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />`} />;
const Shield = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />`} />;
const Clock = (props: IconProps) => <CreateIcon {...props} svgContent={`<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />`} />;
const Sparkles = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="m12 3-1.9 1.9-3.2.9 1 3.1-.9 3.2 3.1 1 1.9 1.9 1.9-1.9 3.1-1-.9-3.2 1-3.1-3.2-.9z" /><path d="M5 22s1.5-2 4-2" /><path d="m19 22-4-2" /><path d="M22 5s-2-1.5-2-4" /><path d="m2 5 2-4" />`} />;
const Download = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />`} />;
const Save = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />`} />;
const RotateCcw = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />`} />;
const X = (props: IconProps) => <CreateIcon {...props} svgContent={`<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />`} />;
const List = (props: IconProps) => <CreateIcon {...props} svgContent={`<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>`} />;
const ListOrdered = (props: IconProps) => <CreateIcon {...props} svgContent={`<line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>`} />;
const AlignCenter = (props: IconProps) => <CreateIcon {...props} svgContent={`<line x1="18" x2="6" y1="10" y2="10"/><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="14" y2="14"/><line x1="18" x2="6" y1="18" y2="18"/>`} />;
const AlignLeft = (props: IconProps) => <CreateIcon {...props} svgContent={`<line x1="17" x2="3" y1="10" y2="10"/><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="14" y2="14"/><line x1="17" x2="3" y1="18" y2="18"/>`} />;
const AlignRight = (props: IconProps) => <CreateIcon {...props} svgContent={`<line x1="21" x2="7" y1="10" y2="10"/><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="14" y2="14"/><line x1="21" x2="7" y1="18" y2="18"/>`} />;
const Bold = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>`} />;
const Target = (props: IconProps) => <CreateIcon {...props} svgContent={`<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>`} />;
const ExternalLink = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>`} />;
const Briefcase = (props: IconProps) => <CreateIcon {...props} svgContent={`<rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>`} />;
const MapPin = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`} />;
const Building = (props: IconProps) => <CreateIcon {...props} svgContent={`<rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>`} />;
const User = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`} />;
const Link2 = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" y1="12" x2="16" y2="12"/>`} />;
const Copy = (props: IconProps) => <CreateIcon {...props} svgContent={`<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>`} />;
const Trash2 = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>`} />;
const FileJson = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/>`} />;
const LinkIcon = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>`} />;
const Table = (props: IconProps) => <CreateIcon {...props} svgContent={`<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/>`} />;
const Heading1 = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="m17 12 3-2v8"/>`} />;
const Heading2 = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/>`} />;
const Strikethrough = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" x2="20" y1="12" y2="12"/>`} />;
const Subscript = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="m4 5 8 8"/><path d="m12 5-8 8"/><path d="M20 19h-4c0-1.5.44-2 1.5-2.5S20 15.33 20 14c0-.47-.17-.93-.48-1.29a2.11 2.11 0 0 0-2.62-.44c-.42.24-.74.62-.9 1.07"/>`} />;
const Superscript = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="m4 19 8-8"/><path d="m12 19-8-8"/><path d="M20 12h-4c0-1.5.442-2 1.5-2.5S20 8.334 20 7c0-.472-.17-.93-.484-1.29a2.105 2.105 0 0 0-2.617-.436c-.42.239-.738.614-.899 1.06"/>`} />;
const Highlighter = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>`} />;
const IndentIncrease = (props: IconProps) => <CreateIcon {...props} svgContent={`<polyline points="3 8 7 12 3 16"/><line x1="21" x2="11" y1="12" y2="12"/><line x1="21" x2="11" y1="6" y2="6"/><line x1="21" x2="11" y1="18" y2="18"/>`} />;
const IndentDecrease = (props: IconProps) => <CreateIcon {...props} svgContent={`<polyline points="7 8 3 12 7 16"/><line x1="21" x2="11" y1="12" y2="12"/><line x1="21" x2="11" y1="6" y2="6"/><line x1="21" x2="11" y1="18" y2="18"/>`} />;
const RemoveFormat = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/><path d="m17 15 4 4m0-4-4 4"/>`} />;
const Move = (props: IconProps) => <CreateIcon {...props} svgContent={`<polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/>`} />;
const SpellCheck = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="m6 16 6-12 6 12"/><path d="M8 12h8"/><path d="m16 20 2 2 4-4"/>`} />;
const Moon = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>`} />;
const Sun = (props: IconProps) => <CreateIcon {...props} svgContent={`<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>`} />;
const PanelLeft = (props: IconProps) => <CreateIcon {...props} svgContent={`<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>`} />;
const PanelRight = (props: IconProps) => <CreateIcon {...props} svgContent={`<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/>`} />;
const History = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>`} />;
const GitBranch = (props: IconProps) => <CreateIcon {...props} svgContent={`<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>`} />;
const RotateCw = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>`} />;
const Diff = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M12 3v14"/><path d="M5 10h14"/><path d="M5 21h14"/><path d="M19 16v5"/><path d="M19 21h-4"/>`} />;
const Edit2 = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>`} />;
const MessageCircle = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>`} />;
const MessageSquare = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`} />;
const Users = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`} />;
const Send = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>`} />;
const Reply = (props: IconProps) => <CreateIcon {...props} svgContent={`<polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>`} />;
const Italic = (props: IconProps) => <CreateIcon {...props} svgContent={`<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>`} />;
const Underline = (props: IconProps) => <CreateIcon {...props} svgContent={`<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>`} />;

// --- Performance Utilities ---

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Resume Studio Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 bg-red-50 border border-red-200 rounded-xl text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h3>
          <p className="text-sm text-red-600 mb-4">{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Skeleton Component
const LoadingSkeleton = memo(({ className = '', variant = 'default' }: { className?: string; variant?: 'default' | 'card' | 'text' | 'avatar' }) => {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded';
  
  switch (variant) {
    case 'card':
      return (
        <div className={`${baseClasses} ${className}`}>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-20 bg-gray-300 rounded"></div>
          </div>
        </div>
      );
    case 'text':
      return <div className={`${baseClasses} h-4 ${className}`}></div>;
    case 'avatar':
      return <div className={`${baseClasses} w-10 h-10 rounded-full ${className}`}></div>;
    default:
      return <div className={`${baseClasses} ${className}`}></div>;
  }
});

// --- Helper Components ---

interface AICopilotProps {
  activeResume: Resume | null;
  selectedText: string;
  aiProcessing: boolean;
  atsAnalysis: ATSAnalysisResult | null;
  enhancedTextResult: EnhancedTextResult | null;
  gapAnalysis: GapJustificationResult | null;
  keywordMatchResult: KeywordExtractionResult | null;
  atsScoreHistory: { date: string; score: number; resumeId: string }[];
  onATSOptimization: () => void;
  onEnhanceText: () => void;
  onGapJustification: () => void;
  onGenerateSummary: () => void;
  onApplyEnhancedText: () => void;
  onClearResults: () => void;
  onKeywordMatch: (jobDesc: string) => void;
}

const AICopilot = ({ 
  activeResume, 
  selectedText, 
  aiProcessing, 
  atsAnalysis,
  enhancedTextResult,
  gapAnalysis,
  keywordMatchResult,
  atsScoreHistory,
  onATSOptimization, 
  onEnhanceText, 
  onGapJustification,
  onGenerateSummary,
  onApplyEnhancedText,
  onClearResults,
  onKeywordMatch
}: AICopilotProps) => {
  const [activeAITab, setActiveAITab] = useState<'dashboard' | 'tools' | 'keywords'>('dashboard');
  const [showGapDetails, setShowGapDetails] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [jobDescInput, setJobDescInput] = useState('');

  // Score color helpers
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-r from-green-400 to-emerald-500';
    if (score >= 60) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    return 'bg-gradient-to-r from-red-400 to-rose-500';
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getPriorityBadge = (importance: 'critical' | 'important' | 'nice-to-have') => {
    switch (importance) {
      case 'critical': return 'bg-red-100 text-red-700 border border-red-200';
      case 'important': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      default: return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };

  // Category icons and labels
  const categoryInfo: Record<string, { icon: string; label: string; description: string }> = {
    keywordOptimization: { icon: '🔑', label: 'Keywords', description: 'How well your resume matches job-related keywords' },
    formatting: { icon: '📄', label: 'Formatting', description: 'Document structure and ATS-friendly formatting' },
    sectionCompleteness: { icon: '📋', label: 'Sections', description: 'Completeness of resume sections' },
    actionVerbs: { icon: '💪', label: 'Action Verbs', description: 'Use of strong, impactful action verbs' },
    quantifiableAchievements: { icon: '📊', label: 'Metrics', description: 'Numbers and quantifiable achievements' },
    readability: { icon: '👁️', label: 'Readability', description: 'Clarity and ease of reading' }
  };

  // Circular progress component
  const CircularProgress = ({ score, size = 80 }: { score: number; size?: number }) => {
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;
    
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            className="text-gray-200"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className="transition-all duration-1000 ease-out"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            stroke={getScoreRingColor(score)}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-slate-800">{score}</span>
        </div>
      </div>
    );
  };

  // Get recent history for current resume
  const recentHistory = atsScoreHistory
    .filter(h => activeResume && h.resumeId === activeResume.id)
    .slice(-5);

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
        <button
          onClick={() => setActiveAITab('dashboard')}
          className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
            activeAITab === 'dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveAITab('tools')}
          className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
            activeAITab === 'tools' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          🛠️ Tools
        </button>
        <button
          onClick={() => setActiveAITab('keywords')}
          className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
            activeAITab === 'keywords' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          🔍 Keywords
        </button>
      </div>

      {/* Clear Results Button */}
      {(atsAnalysis || enhancedTextResult || gapAnalysis || keywordMatchResult) && (
        <button 
          onClick={onClearResults}
          className="w-full text-xs text-slate-500 hover:text-red-600 py-1 transition-colors"
        >
          Clear All Results
        </button>
      )}

      {/* DASHBOARD TAB */}
      {activeAITab === 'dashboard' && (
        <div className="space-y-4">
          {!activeResume ? (
            <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <div className="text-3xl mb-2">📝</div>
              <p className="text-sm text-slate-600">Select a resume to view ATS analytics</p>
            </div>
          ) : (
            <>
              {/* Main Score Card */}
              <div className="p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl text-white">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur rounded-xl p-2">
                    <CircularProgress score={atsAnalysis?.overallScore || activeResume.atsScore} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/80 text-xs uppercase tracking-wide">ATS Compatibility Score</p>
                    <p className="text-2xl font-bold">{atsAnalysis?.overallScore || activeResume.atsScore}%</p>
                    <p className="text-white/70 text-xs mt-1">
                      {(atsAnalysis?.overallScore || activeResume.atsScore) >= 80 
                        ? '✓ Excellent - Ready for applications!' 
                        : (atsAnalysis?.overallScore || activeResume.atsScore) >= 60 
                        ? '⚠ Good - Some improvements needed' 
                        : '⚡ Needs work - Review suggestions below'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onATSOptimization}
                  disabled={aiProcessing}
                  className="mt-3 w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {aiProcessing ? 'Analyzing...' : '🔄 Re-analyze Resume'}
                </button>
              </div>

              {/* Score History Mini Chart */}
              {recentHistory.length > 1 && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Score History</p>
                  <div className="flex items-end gap-1 h-12">
                    {recentHistory.map((h, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        <div 
                          className={`w-full rounded-t ${getScoreBarColor(h.score)}`}
                          style={{ height: `${h.score * 0.4}px` }}
                          title={`${h.score}% - ${new Date(h.date).toLocaleDateString()}`}
                        />
                        <span className="text-[8px] text-slate-400 mt-1">{h.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Breakdown */}
              {atsAnalysis && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">Detailed Breakdown</p>
                  {Object.entries(atsAnalysis.breakdown).map(([key, value]) => {
                    const info = categoryInfo[key] || { icon: '📌', label: key, description: '' };
                    const isExpanded = expandedCategory === key;
                    
                    return (
                      <div key={key} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <button 
                          onClick={() => setExpandedCategory(isExpanded ? null : key)}
                          className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors"
                        >
                          <span className="text-lg">{info.icon}</span>
                          <div className="flex-1 text-left">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-slate-700">{info.label}</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded ${getScoreColor(value.score)}`}>
                                {value.score}%
                              </span>
                            </div>
                            <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-500 ${getScoreBarColor(value.score)}`}
                                style={{ width: `${value.score}%` }}
                              />
                            </div>
                          </div>
                          <ArrowRight className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {isExpanded && (
                          <div className="px-3 pb-3 border-t border-slate-100">
                            <p className="text-xs text-slate-600 py-2">{value.feedback}</p>
                            
                            {/* Show issues or suggestions */}
                            {('issues' in value && value.issues.length > 0) && (
                              <div className="mt-2">
                                <p className="text-xs font-semibold text-red-600 mb-1">Issues Found:</p>
                                <ul className="space-y-1">
                                  {value.issues.map((issue: string, idx: number) => (
                                    <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                                      <span className="text-red-400 mt-0.5">✗</span>
                                      {issue}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {('suggestions' in value && value.suggestions.length > 0) && (
                              <div className="mt-2">
                                <p className="text-xs font-semibold text-green-600 mb-1">Suggestions:</p>
                                <ul className="space-y-1">
                                  {value.suggestions.map((sug: string, idx: number) => (
                                    <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                                      <span className="text-green-400 mt-0.5">✓</span>
                                      {sug}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {('missingSections' in value && value.missingSections.length > 0) && (
                              <div className="mt-2">
                                <p className="text-xs font-semibold text-orange-600 mb-1">Missing Sections:</p>
                                <div className="flex flex-wrap gap-1">
                                  {value.missingSections.map((sec: string, idx: number) => (
                                    <span key={idx} className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                                      {sec}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {('weakVerbs' in value && value.weakVerbs.length > 0) && (
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-xs font-semibold text-red-600 mb-1">Weak Verbs:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {value.weakVerbs.slice(0, 5).map((verb: string, idx: number) => (
                                      <span key={idx} className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[10px] rounded line-through">
                                        {verb}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-green-600 mb-1">Try Instead:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {value.strongAlternatives.slice(0, 5).map((alt: string, idx: number) => (
                                      <span key={idx} className="px-1.5 py-0.5 bg-green-50 text-green-600 text-[10px] rounded">
                                        {alt}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Top Improvements */}
              {atsAnalysis && atsAnalysis.topImprovements.length > 0 && (
                <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1">
                    <span>⚡</span> Priority Improvements
                  </p>
                  <ul className="space-y-2">
                    {atsAnalysis.topImprovements.map((improvement, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-white/50 p-2 rounded">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          idx === 0 ? 'bg-red-500 text-white' : idx === 1 ? 'bg-orange-500 text-white' : 'bg-yellow-500 text-white'
                        }`}>
                          {idx + 1}
                        </span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Industry Keywords */}
              {atsAnalysis && atsAnalysis.industryKeywords.length > 0 && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-xs font-semibold text-indigo-800 mb-2">🔑 Recommended Keywords</p>
                  <div className="flex flex-wrap gap-1">
                    {atsAnalysis.industryKeywords.map((keyword, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white text-indigo-700 text-xs rounded-full border border-indigo-200 hover:bg-indigo-100 cursor-pointer transition-colors">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TOOLS TAB */}
      {activeAITab === 'tools' && (
        <div className="space-y-3">
          {/* Enhanced Text Results */}
          {enhancedTextResult && (
            <div className="bg-white border border-green-200 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">✨ Enhanced Text Ready</span>
                <button
                  onClick={onApplyEnhancedText}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                >
                  Apply
                </button>
              </div>
              <div className="p-2 bg-green-50 rounded text-xs text-slate-700 max-h-32 overflow-y-auto">
                {enhancedTextResult.enhancedText}
              </div>
              {enhancedTextResult.changes.length > 0 && (
                <div className="pt-2 border-t border-green-100">
                  <p className="text-xs font-semibold text-slate-700 mb-1">Changes Made:</p>
                  <ul className="space-y-1">
                    {enhancedTextResult.changes.slice(0, 3).map((change, idx) => (
                      <li key={idx} className="text-xs text-slate-600">• {change}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Gap Analysis Results */}
          {gapAnalysis && (
            <div className="bg-white border border-orange-200 rounded-lg overflow-hidden">
              <button 
                onClick={() => setShowGapDetails(!showGapDetails)}
                className="w-full p-3 flex items-center justify-between hover:bg-orange-50"
              >
                <span className="text-sm font-medium text-orange-800">
                  {gapAnalysis.detectedGaps.length > 0 
                    ? `${gapAnalysis.detectedGaps.length} Gap(s) Detected`
                    : 'No Significant Gaps Found'}
                </span>
                <ArrowRight className={`w-4 h-4 text-orange-400 transition-transform ${showGapDetails ? 'rotate-90' : ''}`} />
              </button>
              
              {showGapDetails && (
                <div className="px-3 pb-3 space-y-3 border-t border-orange-100">
                  {gapAnalysis.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="pt-2">
                      <p className="text-xs font-semibold text-slate-700 mb-2">{suggestion.gap}</p>
                      <ul className="space-y-1">
                        {suggestion.justifications.map((just, jIdx) => (
                          <li key={jIdx} className="text-xs text-slate-600 flex items-start gap-2">
                            <span className="text-orange-500 mt-0.5">•</span>
                            {just}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {gapAnalysis.generalAdvice && (
                    <div className="pt-2 border-t border-orange-100">
                      <p className="text-xs font-semibold text-slate-700 mb-1">General Advice:</p>
                      <p className="text-xs text-slate-600">{gapAnalysis.generalAdvice}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* AI Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={onATSOptimization}
              disabled={!activeResume || aiProcessing}
              className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Shield className="w-5 h-5 text-blue-500" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-slate-800">ATS Optimization</p>
                <p className="text-xs text-slate-500">Full ATS analysis & suggestions</p>
              </div>
            </button>
            
            <button
              onClick={onEnhanceText}
              disabled={!selectedText || aiProcessing}
              className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 border border-yellow-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-slate-800">Enhance Selected Text</p>
                <p className="text-xs text-slate-500">
                  {selectedText ? `"${selectedText.slice(0, 25)}${selectedText.length > 25 ? '...' : ''}"` : 'Select text first'}
                </p>
              </div>
            </button>
            
            <button
              onClick={onGapJustification}
              disabled={!activeResume || aiProcessing}
              className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 border border-orange-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Clock className="w-5 h-5 text-orange-500" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-slate-800">Gap Justification</p>
                <p className="text-xs text-slate-500">Detect & explain career gaps</p>
              </div>
            </button>

            <button
              onClick={onGenerateSummary}
              disabled={!activeResume || aiProcessing}
              className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-5 h-5 text-purple-500" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-slate-800">Generate Summary</p>
                <p className="text-xs text-slate-500">AI-powered professional summary</p>
              </div>
            </button>
          </div>
          
          {aiProcessing && (
            <div className="p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg space-y-3">
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-indigo-700 font-medium">AI is analyzing...</p>
              </div>
              <LoadingSkeleton variant="text" className="w-3/4 mx-auto" />
              <LoadingSkeleton variant="text" className="w-1/2 mx-auto" />
            </div>
          )}
        </div>
      )}

      {/* KEYWORDS TAB */}
      {activeAITab === 'keywords' && (
        <div className="space-y-4">
          {!activeResume ? (
            <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <div className="text-3xl mb-2">🔍</div>
              <p className="text-sm text-slate-600">Select a resume to match keywords</p>
            </div>
          ) : (
            <>
              {/* Job Description Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Paste Job Description</label>
                <textarea
                  value={jobDescInput}
                  onChange={(e) => setJobDescInput(e.target.value)}
                  placeholder="Paste the job description here to analyze keyword match..."
                  className="w-full h-24 px-3 py-2 text-xs border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={() => onKeywordMatch(jobDescInput)}
                  disabled={!jobDescInput.trim() || aiProcessing}
                  className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiProcessing ? 'Analyzing...' : '🔍 Analyze Keyword Match'}
                </button>
              </div>

              {/* Keyword Match Results */}
              {keywordMatchResult && (
                <div className="space-y-3">
                  {/* Match Percentage */}
                  <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-xs uppercase tracking-wide">Keyword Match</p>
                        <p className="text-3xl font-bold">{keywordMatchResult.matchPercentage}%</p>
                      </div>
                      <CircularProgress score={keywordMatchResult.matchPercentage} size={60} />
                    </div>
                  </div>

                  {/* Missing Critical Keywords */}
                  {keywordMatchResult.missingCritical.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs font-semibold text-red-800 mb-2">⚠️ Missing Critical Keywords</p>
                      <div className="flex flex-wrap gap-1">
                        {keywordMatchResult.missingCritical.map((keyword, idx) => (
                          <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full border border-red-200">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Keywords */}
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-semibold text-slate-700 mb-2">All Keywords</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {keywordMatchResult.keywords.map((kw, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                              kw.found ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                              {kw.found ? '✓' : '✗'}
                            </span>
                            <span className="text-xs text-slate-700">{kw.keyword}</span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${getPriorityBadge(kw.importance)}`}>
                            {kw.importance}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  {keywordMatchResult.recommendations.length > 0 && (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <p className="text-xs font-semibold text-indigo-800 mb-2">💡 Recommendations</p>
                      <ul className="space-y-1">
                        {keywordMatchResult.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                            <span className="text-indigo-500 mt-0.5">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// --- LEGACY RESUME PREVIEW WITH DRAG AND DROP ---
interface ResumePreviewProps {
  content: string;
  colors: { primary: string; secondary: string; accent: string };
  formatting: FormattingSettings;
  template: ResumeTemplate;
  photoUrl?: string | null;
  onContentChange: (content: string) => void;
  editorRef: React.RefObject<HTMLDivElement>;
}

const ResumePreview = ({ content, colors, formatting, template, photoUrl, onContentChange, editorRef }: ResumePreviewProps) => {
  const [isDndActive, setIsDndActive] = useState(false);
  const dndActivationRef = useRef({ count: 0, timestamp: 0 });

  // Merge template styles with formatting overrides
  const pageStyle: React.CSSProperties = {
    fontFamily: formatting.fontStyle || template.styles.fontFamily,
    fontSize: `${formatting.fontSize}pt`,
    lineHeight: formatting.lineSpacing,
    padding: template.layout === 'single-column' 
      ? `${formatting.topBottomMargin}mm ${formatting.sideMargins}mm`
      : '0',
    color: formatting.textColor || '#333',
    minHeight: '297mm',
    width: '210mm',
    backgroundColor: 'white',
  };

  // Template-specific wrapper styles
  const getTemplateWrapperClass = () => {
    if (isTwoColumnTemplate(template)) {
      return 'flex min-h-[297mm]';
    }
    return '';
  };


  // Effect to toggle the dnd-active class
  useEffect(() => {
    const editorNode = editorRef.current;
    if (editorNode) {
        editorNode.classList.toggle('dnd-active', isDndActive);
    }
  }, [isDndActive]);

  // Logic to handle the specific "Right-click to enable drag" behavior
  useEffect(() => {
    const editorNode = editorRef.current;
    if (!editorNode) return;

    let draggedElement: HTMLElement | null = null;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const now = Date.now();
      // Logic: Detect double right click
      if (now - dndActivationRef.current.timestamp > 500) {
        dndActivationRef.current.count = 1;
      } else {
        dndActivationRef.current.count++;
      }
      dndActivationRef.current.timestamp = now;
      
      if (dndActivationRef.current.count === 2) {
        setIsDndActive(true);
        dndActivationRef.current.count = 0;
        // Visual feedback
        editorNode.style.outline = "2px dashed #6366f1";
      }
    };

    const handleDeactivationClick = (e: MouseEvent) => {
      if (isDndActive && e.button !== 2 && !editorNode.classList.contains('dragging-active')) {
        setIsDndActive(false);
        editorNode.style.outline = "none";
      }
    };

    const handleDragStart = (e: DragEvent) => {
      if (!isDndActive) {
        e.preventDefault();
        return;
      }
      const target = e.target as HTMLElement;
      draggedElement = target.closest('.resume-section') as HTMLElement;
      
      if (draggedElement) {
        editorNode.classList.add('dragging-active');
        setTimeout(() => draggedElement!.classList.add('dragging'), 0);
        e.dataTransfer!.effectAllowed = 'move';
        e.dataTransfer!.setData('text/plain', 'dragging');
      } else {
        e.preventDefault();
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (!isDndActive) return;
      
      const target = e.target as HTMLElement;
      const closestSection = target.closest('.resume-section');
      if (!closestSection || closestSection === draggedElement) return;
      
      const rect = closestSection.getBoundingClientRect();
      const isAfter = e.clientY > rect.top + rect.height / 2;
      
      editorNode.querySelectorAll('.drag-over-indicator').forEach((el: Element) => el.remove());
      
      const placeholder = document.createElement('div');
      placeholder.className = 'drag-over-indicator';
      placeholder.textContent = draggedElement?.dataset.sectionName ? `${draggedElement.dataset.sectionName} will be placed here` : 'Drop here';
      placeholder.style.height = '4px';
      placeholder.style.backgroundColor = '#6366f1';
      placeholder.style.margin = '10px 0';
      placeholder.style.borderRadius = '2px';
      placeholder.style.fontSize = '10px';
      placeholder.style.color = '#6366f1';
      placeholder.style.textAlign = 'center';

      if (closestSection.parentNode) {
          if (isAfter) {
            closestSection.parentNode.insertBefore(placeholder, closestSection.nextSibling);
          } else {
            closestSection.parentNode.insertBefore(placeholder, closestSection);
          }
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const placeholder = editorNode.querySelector('.drag-over-indicator');
      if (draggedElement && placeholder && placeholder.parentNode) {
        placeholder.parentNode.insertBefore(draggedElement, placeholder);
        onContentChange(editorNode.innerHTML);
      }
      if (placeholder) placeholder.remove();
      if (draggedElement) draggedElement.classList.remove('dragging');
      editorNode.classList.remove('dragging-active');
      draggedElement = null;
      setIsDndActive(false);
      editorNode.style.outline = "none";
    };

    const handleDragEnd = () => {
        if (draggedElement) draggedElement.classList.remove('dragging');
        editorNode.querySelectorAll('.drag-over-indicator').forEach((el: Element) => el.remove());
        editorNode.classList.remove('dragging-active');
        draggedElement = null;
    };

    // Attach Listeners
    editorNode.addEventListener('contextmenu', handleContextMenu);
    editorNode.addEventListener('click', handleDeactivationClick);
    editorNode.addEventListener('dragstart', handleDragStart);
    editorNode.addEventListener('dragover', handleDragOver);
    editorNode.addEventListener('drop', handleDrop);
    editorNode.addEventListener('dragend', handleDragEnd);

    // Make sections draggable
    const sections = editorNode.querySelectorAll('.resume-section');
    sections.forEach((section: Element) => section.setAttribute('draggable', 'true'));

    return () => {
      editorNode.removeEventListener('contextmenu', handleContextMenu);
      editorNode.removeEventListener('click', handleDeactivationClick);
      editorNode.removeEventListener('dragstart', handleDragStart);
      editorNode.removeEventListener('dragover', handleDragOver);
      editorNode.removeEventListener('drop', handleDrop);
      editorNode.removeEventListener('dragend', handleDragEnd);
    };
  }, [content, isDndActive, onContentChange]);

  // Apply formatting changes to editor
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.fontFamily = formatting.fontStyle;
      editorRef.current.style.fontSize = `${formatting.fontSize}pt`;
      editorRef.current.style.lineHeight = String(formatting.lineSpacing);
      editorRef.current.style.padding = `${formatting.topBottomMargin}mm ${formatting.sideMargins}mm`;
      editorRef.current.style.color = formatting.textColor;
      
      const headings = editorRef.current.querySelectorAll('p > b, p > strong, h1, h2, h3');
      headings.forEach((heading) => {
        (heading as HTMLElement).style.color = colors.primary;
      });
    }
  }, [formatting, colors, editorRef]);

  // Prevent cursor jumping
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
    }
  }, [content]);

  return (
    <div className="w-full bg-transparent p-8 flex justify-center overflow-auto h-full custom-scrollbar">
      <div className="relative">
        {/* Template indicator badge */}
        <div className="absolute -top-6 left-0 text-xs text-slate-400 flex items-center gap-2">
          <span>Template: {template.name}</span>
          {template.supportsPhoto && <span className="text-indigo-500">📷</span>}
        </div>
        
        {/* Resume Container */}
        <div 
          className={`shadow-2xl resume-content-view ${getTemplateWrapperClass()}`}
          style={pageStyle}
        >
          {/* Two-Column Left Sidebar */}
          {isTwoColumnTemplate(template) && template.layout === 'sidebar-left' && (
            <div 
              className="w-1/3 p-6 text-white"
              style={{ 
                background: `linear-gradient(to bottom, ${template.styles.accentColor}, ${colors.accent || template.styles.accentColor})`,
                minHeight: '297mm'
              }}
            >
              {/* Photo in sidebar */}
              {template.supportsPhoto && (
                <div className="mb-6 text-center">
                  {photoUrl ? (
                    <img 
                      src={photoUrl} 
                      alt="Profile" 
                      className="w-28 h-28 rounded-full mx-auto border-4 border-white/30 object-cover"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full mx-auto border-4 border-white/30 bg-white/10 flex items-center justify-center">
                      <span className="text-white/50 text-xs">Photo</span>
                    </div>
                  )}
                </div>
              )}
              {/* Sidebar content - will be populated by user */}
              <div className="text-xs text-white/80 mt-4">
                <p className="text-[10px] uppercase tracking-wider text-white/60 mb-2">Contact & Skills</p>
                <p className="text-white/70 italic text-[10px]">Add contact info and skills in the editor →</p>
              </div>
            </div>
          )}

          {/* Main Editor Content */}
          <div 
            ref={editorRef}
            contentEditable={true}
            suppressContentEditableWarning={true}
            onInput={(e) => onContentChange(e.currentTarget.innerHTML)}
            className={`focus:outline-none focus:ring-2 focus:ring-indigo-400 custom-scrollbar ${
              isTwoColumnTemplate(template) ? 'flex-1' : ''
            }`}
            style={{
              padding: isTwoColumnTemplate(template) 
                ? '24px' 
                : `${formatting.topBottomMargin}mm ${formatting.sideMargins}mm`,
              minHeight: '297mm',
              ...(template.accentPosition === 'left' && !isTwoColumnTemplate(template) ? {
                borderLeft: `4px solid ${template.styles.accentColor}`
              } : {})
            }}
          >
          </div>

          {/* Two-Column Right Sidebar */}
          {isTwoColumnTemplate(template) && template.layout === 'sidebar-right' && (
            <div 
              className="w-1/4 p-6 text-white"
              style={{ 
                background: `linear-gradient(to bottom, ${template.styles.accentColor}, ${colors.accent || template.styles.accentColor})`,
                minHeight: '297mm'
              }}
            >
              {/* Photo in sidebar */}
              {template.supportsPhoto && (
                <div className="mb-6">
                  {photoUrl ? (
                    <img 
                      src={photoUrl} 
                      alt="Profile" 
                      className="w-full aspect-square object-cover grayscale"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-white/10 flex items-center justify-center">
                      <span className="text-white/50 text-xs">Photo</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drag and Drop hint */}
        {isDndActive && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Drag sections to reorder • Click to exit
          </div>
        )}
      </div>
    </div>
  );
};

interface ResumeListViewerProps {
  resumes: Resume[];
  onSelectResume: (resumeId: string) => void;
  onCreateNew: () => void;
  onImport: () => void;
}

const ResumeListViewer = ({ resumes, onSelectResume, onCreateNew, onImport }: ResumeListViewerProps) => {
  return (
    <div className="p-8 text-slate-800 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Resume Library</h2>
        <div className="flex gap-3">
          <button
            onClick={onImport}
            className="px-4 py-2 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New
          </button>
        </div>
      </div>
      {resumes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume: Resume) => (
            <div key={resume.id} className="bg-white/70 backdrop-blur-xl p-6 rounded-lg border border-white/30 hover:border-indigo-300 transition-all shadow-lg">
              <h3 className="font-semibold text-lg text-slate-900">{resume.title}</h3>
              <p className={`text-xs font-medium uppercase mt-1 ${resume.type === 'master' ? 'text-amber-600' : 'text-cyan-600'}`}>{resume.type}</p>
              <p className="text-sm text-slate-600 mt-2">ATS Score: {resume.atsScore}%</p>
              <p className="text-xs text-slate-500 mt-1">Updated: {new Date(resume.updatedAt).toLocaleDateString()}</p>
              <button
                onClick={() => onSelectResume(resume.id)}
                className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm"
              >
                Edit this Resume
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl">
          <FileText className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-semibold text-slate-700">No Resumes Yet</h3>
          <p className="text-slate-500 mt-2 mb-6">Create or import a resume to get started.</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={onImport}
              className="px-6 py-3 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Import Resume
            </button>
            <button
              onClick={onCreateNew}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---
export default function ResumeStudio() {
  const navigate = useNavigate();
  const [step, setStep] = useState('selection'); // selection, studio, list, upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [activeResume, setActiveResume] = useState<Resume | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [, setViewMode] = useState('edit');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('classic-professional');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [selectedColors, setSelectedColors] = useState({
    primary: '#3B82F6',
    secondary: '#64748B',
    accent: '#8B5CF6'
  });
  const [formattingSettings, setFormattingSettings] = useState<FormattingSettings>({
    alignment: 'left',
    textColor: '#334155',
    highlightColor: 'transparent',
    fontStyle: 'Inter',
    fontSize: 11,
    headingSize: 14,
    sectionSpacing: 16,
    paragraphSpacing: 8,
    lineSpacing: 1.4,
    topBottomMargin: 20,
    sideMargins: 20,
    paragraphIndent: 0
  });
  const [activeSections, setActiveSections] = useState([
    'Heading', 'Profile', 'Core Skills', 'Experience', 'Education'
  ]);
  const [undoHistory, setUndoHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState(-1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // UI State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('resumeStudio_darkMode');
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileRightPanelOpen, setIsMobileRightPanelOpen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [newResumeType, setNewResumeType] = useState<'master' | 'campaign'>('campaign');
  const [activeTab, setActiveTab] = useState('design');
  const [templateCategory, setTemplateCategory] = useState('all');
  const [selectedText, setSelectedText] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [toast, setToast] = useState<{message: string, type: string} | null>(null);
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysisResult | null>(null);
  const [enhancedTextResult, setEnhancedTextResult] = useState<EnhancedTextResult | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<GapJustificationResult | null>(null);
  
  // Integration state
  const [showLinkedInImport, setShowLinkedInImport] = useState(false);
  const [showTailorForJob, setShowTailorForJob] = useState(false);
  const [linkedInProfile, setLinkedInProfile] = useState<LinkedInProfileData | null>(null);
  const [targetJob, setTargetJob] = useState<JobDataForResume | null>(null);
  const [trackedJobs, setTrackedJobs] = useState<JobDataForResume[]>([]);
  
  // Export state
  const [exportTab, setExportTab] = useState<'download' | 'share'>('download');
  const [shareableLink, setShareableLink] = useState<{ id: string; url: string } | null>(null);
  const [sharedLinks, setSharedLinks] = useState<ShareableLinkData[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Enhanced editor state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [isDragModeActive, setIsDragModeActive] = useState(false);
  const [spellCheckEnabled, setSpellCheckEnabled] = useState(true);
  const [highlightColor, setHighlightColor] = useState('#FFEB3B');
  
  // ATS Analytics Dashboard state
  const [atsScoreHistory, setAtsScoreHistory] = useState<{ date: string; score: number; resumeId: string }[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('atsScoreHistory') || '[]');
    } catch {
      return [];
    }
  });
  const [keywordMatchResult, setKeywordMatchResult] = useState<KeywordExtractionResult | null>(null);
  const [autoSaveEnabled] = useState(true);
  
  // Version Control State
  interface ResumeVersion {
    id: string;
    resumeId: string;
    content: string;
    timestamp: string;
    label: string;
    changeType: 'auto' | 'manual' | 'ai-enhanced' | 'import' | 'template-change';
    changeSummary: string;
    atsScore?: number;
  }
  
  const [versions, setVersions] = useState<ResumeVersion[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('resumeStudio_versions') || '[]');
    } catch {
      return [];
    }
  });
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showVersionCompare, setShowVersionCompare] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null);
  const [lastVersionContent, setLastVersionContent] = useState<string>('');
  
  // Collaboration State
  interface ResumeComment {
    id: string;
    resumeId: string;
    author: string;
    authorEmail: string;
    content: string;
    timestamp: string;
    section?: string;
    resolved: boolean;
    replies: { id: string; author: string; content: string; timestamp: string }[];
  }
  
  interface ReviewRequest {
    id: string;
    resumeId: string;
    resumeTitle: string;
    requesterName: string;
    reviewerEmail: string;
    reviewerName: string;
    message: string;
    status: 'pending' | 'in-review' | 'completed';
    createdAt: string;
    completedAt?: string;
    feedback?: string;
  }
  
  const [comments, setComments] = useState<ResumeComment[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('resumeStudio_comments') || '[]');
    } catch {
      return [];
    }
  });
  const [reviewRequests, setReviewRequests] = useState<ReviewRequest[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('resumeStudio_reviews') || '[]');
    } catch {
      return [];
    }
  });
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newReviewEmail, setNewReviewEmail] = useState('');
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewMessage, setNewReviewMessage] = useState('');
  const [userName, setUserName] = useState(() => localStorage.getItem('resumeStudio_userName') || 'You');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('resumeStudio_userEmail') || '');
  
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const handleSaveRef = useRef<((silent?: boolean) => Promise<void>) | null>(null);
  const handleUndoRef = useRef<(() => void) | null>(null);

  // Constants
  const sectionTemplates: Record<string, string> = {
    'Heading': `<div class="resume-section" data-section-name="Heading"><p><b>[YOUR NAME]</b></p><p>[Your Title/Position]</p><p>[Your Email] | [Your Phone] | [Your LinkedIn]</p></div>`,
    'Profile': `<div class="resume-section" data-section-name="Profile"><p><br></p><p><b>PROFESSIONAL SUMMARY</b></p><p>[Write a compelling summary of your professional background and key achievements]</p></div>`,
    'Core Skills': `<div class="resume-section" data-section-name="Core Skills"><p><br></p><p><b>CORE SKILLS</b></p><p>• [Skill 1]</p><p>• [Skill 2]</p><p>• [Skill 3]</p></div>`,
    'Experience': `<div class="resume-section" data-section-name="Experience"><p><br></p><p><b>EXPERIENCE</b></p><p>[Job Title] | [Company Name] | [Start Date - End Date]</p><p>• [Achievement or responsibility]</p><p>• [Achievement or responsibility]</p><p>• [Achievement or responsibility]</p></div>`,
    'Education': `<div class="resume-section" data-section-name="Education"><p><br></p><p><b>EDUCATION</b></p><p>[Degree] in [Field of Study]</p><p>[University Name] | [Graduation Year]</p></div>`,
    'Projects': `<div class="resume-section" data-section-name="Projects"><p><br></p><p><b>PROJECTS</b></p><p>[Project Name] | [Link to Project]</p><p>• [Description of the project and your role]</p></div>`,
    'Certifications': `<div class="resume-section" data-section-name="Certifications"><p><br></p><p><b>CERTIFICATIONS</b></p><p>• [Certification Name] - [Issuing Organization] ([Year])</p></div>`,
    'Languages': `<div class="resume-section" data-section-name="Languages"><p><br></p><p><b>LANGUAGES</b></p><p>• [Language] (Native/Fluent/Professional/Basic)</p></div>`,
    'Volunteering': `<div class="resume-section" data-section-name="Volunteering"><p><br></p><p><b>VOLUNTEER EXPERIENCE</b></p><p>[Role] | [Organization] | [Dates]</p><p>• [Description of your contributions and impact.]</p></div>`,
    'Publications': `<div class="resume-section" data-section-name="Publications"><p><br></p><p><b>PUBLICATIONS</b></p><p>• [Title of Publication], <i>[Journal or Conference Name]</i>, [Year]</p></div>`,
    'Professional Affiliations': `<div class="resume-section" data-section-name="Professional Affiliations"><p><br></p><p><b>PROFESSIONAL AFFILIATIONS</b></p><p>• [Member/Role], [Organization Name]</p></div>`,
    'Interests': `<div class="resume-section" data-section-name="Interests"><p><br></p><p><b>INTERESTS</b></p><p>[Interest 1], [Interest 2], [Interest 3]</p></div>`,
    'Awards & Honors': `<div class="resume-section" data-section-name="Awards & Honors"><p><br></p><p><b>AWARDS & HONORS</b></p><p>• [Award Name] - [Awarding Body] ([Year])</p></div>`,
    'References': `<div class="resume-section" data-section-name="References"><p><br></p><p><b>REFERENCES</b></p><p>Available upon request.</p></div>`,
    'Custom Section': `<div class="resume-section" data-section-name="Custom Section"><p><br></p><p><b>[CUSTOM SECTION TITLE]</b></p><p>[Your content here]</p></div>`,
  };

  // Use imported templates from resumeTemplates.ts
  const templates = resumeTemplates;
  const templateCategories = getTemplateCategories();
  const currentTemplate = getTemplateById(selectedTemplateId) || templates[0];

  const colorPalettes = [
    { name: 'Blue', primary: '#3B82F6', secondary: '#64748B', accent: '#8B5CF6' },
    { name: 'Green', primary: '#10B981', secondary: '#64748B', accent: '#F59E0B' },
    { name: 'Purple', primary: '#8B5CF6', secondary: '#64748B', accent: '#EF4444' },
    { name: 'Orange', primary: '#F97316', secondary: '#64748B', accent: '#06B6D4' },
    { name: 'Red', primary: '#EF4444', secondary: '#64748B', accent: '#10B981' },
  ];

  // --- Logic Functions ---

  const showToast = (message: string, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Validation Utilities ---
  const ValidationUtils = {
    sanitizeInput(input: string) {
      if (typeof input !== 'string') return '';
      return input.trim().replace(/[<>]/g, '');
    },
    
    validateResumeTitle(title: string) {
      if (!title || typeof title !== 'string') {
        return { valid: false, error: 'Resume title is required' };
      }
      const trimmed = title.trim();
      if (trimmed.length === 0) {
        return { valid: false, error: 'Resume title cannot be empty' };
      }
      if (trimmed.length > 100) {
        return { valid: false, error: 'Resume title must be less than 100 characters' };
      }
      if (!/^[a-zA-Z0-9\s\-_.,()]+$/.test(trimmed)) {
        return { valid: false, error: 'Resume title contains invalid characters' };
      }
      return { valid: true, error: '' };
    },
    
    validateFile(file: File) {
      if (!file) {
        return { valid: false, error: 'No file selected' };
      }
      
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain'
      ];
      
      const fileName = file.name.toLowerCase();
      const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
      const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (!allowedTypes.includes(file.type) && !hasValidExtension) {
        return { valid: false, error: 'Please select a valid file type (PDF, DOCX, DOC, or TXT)' };
      }
      
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return { valid: false, error: `File size must be less than ${(maxSize / 1024 / 1024).toFixed(0)}MB` };
      }
      
      if (file.size === 0) {
        return { valid: false, error: 'File is empty' };
      }
      
      return { valid: true, error: '' };
    },
    
    validateResumeData(resume: Resume) {
      if (!resume || typeof resume !== 'object') {
        return { valid: false, error: 'Invalid resume data structure' };
      }
      if (!resume.id || typeof resume.id !== 'string') {
        return { valid: false, error: 'Resume must have a valid ID' };
      }
      if (!resume.title || typeof resume.title !== 'string') {
        return { valid: false, error: 'Resume must have a title' };
      }
      return { valid: true, error: '' };
    },
    
    validateSectionName(sectionName: string) {
      if (!sectionName || typeof sectionName !== 'string') {
        return { valid: false, error: 'Section name is required' };
      }
      if (sectionName.trim().length === 0) {
        return { valid: false, error: 'Section name cannot be empty' };
      }
      if (sectionName.length > 50) {
        return { valid: false, error: 'Section name must be less than 50 characters' };
      }
      return { valid: true, error: '' };
    },
    
    sanitizeFileName(fileName: string) {
      return fileName.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 255);
    }
  };

  // --- Error Handling Utilities ---
  const ErrorHandler = {
    handleStorageError(error: unknown, operation: string) {
      console.error(`Storage error during ${operation}:`, error);
      const message = (error as { name?: string })?.name === 'QuotaExceededError' 
        ? 'Storage quota exceeded. Please free up space or delete old resumes.'
        : `Failed to ${operation}. Please try again.`;
      showToast(message, 'error');
      return message;
    },
    
    handleAPIError(error: unknown, operation: string) {
      console.error(`API error during ${operation}:`, error);
      let message = `Failed to ${operation}.`;
      
      const errorMessage = (error as { message?: string })?.message;
      if (errorMessage) {
        if (errorMessage.includes('API key')) {
          message = 'OpenAI API key not found. Please set it in Settings.';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          message = 'Network error. Please check your connection.';
        } else {
          message = errorMessage;
        }
      }
      
      showToast(message, 'error');
      return message;
    }
  };

  const mockUserCV = `JOHN DOE
Software Engineer
john.doe@email.com | (555) 123-4567 | LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years developing scalable web applications using React, Node.js, and cloud technologies. Proven track record of leading cross-functional teams and delivering high-impact solutions.

CORE SKILLS
• Frontend: React, TypeScript, JavaScript, HTML5, CSS3
• Backend: Node.js, Python, Express.js, RESTful APIs
• Databases: PostgreSQL, MongoDB, Redis
• Cloud: AWS, Docker, Kubernetes
• Tools: Git, Jenkins, Jira, Agile/Scrum

EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2022-Present
• Led development of microservices architecture serving 100K+ users
• Implemented CI/CD pipelines reducing deployment time by 60%
• Mentored 3 junior developers and conducted code reviews
• Collaborated with product team to define technical requirements

Software Engineer | StartupXYZ | 2020-2022
• Built responsive web applications using React and Node.js
• Optimized database queries improving application performance by 40%
• AWS Certified Solutions Architect
• Certified Scrum Master (CSM)`;

  const plainTextToHtml = (text: string) => {
    if (!text) return '';
    return text.split('\n').map(line => `<p>${line || '<br>'}</p>`).join('');
  };

  const availableSections = ['Heading', 'Profile', 'Core Skills', 'Experience', 'Education', 'Projects', 'Certifications', 'Languages', 'Volunteering', 'Publications', 'Professional Affiliations', 'Interests', 'Awards & Honors', 'References', 'Custom Section'];

  const fontStyles = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Source Sans Pro', 'Century Gothic'];

  // Memoized computed values for better performance
  const filteredTemplates = useMemo(() => 
    templateCategory === 'all' ? templates : templates.filter(t => t.category === templateCategory as ResumeTemplate['category']),
    [templateCategory, templates]
  );
  
  // Memoized word count
  const wordCount = useMemo(() => {
    if (!editorContent) return 0;
    const text = editorContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text ? text.split(' ').length : 0;
  }, [editorContent]);
  
  // Memoized character count
  const charCount = useMemo(() => {
    if (!editorContent) return 0;
    return editorContent.replace(/<[^>]*>/g, '').length;
  }, [editorContent]);

  const handleChooseCV = () => {
    setStep('upload');
  };

  const handleStartFromScratch = () => {
    try {
      if (!activeSections || activeSections.length === 0) {
        showToast('No sections available. Please refresh the page.', 'error');
        return;
      }
      
      const initialContent = activeSections
        .map(sectionName => {
          const template = sectionTemplates[sectionName];
          if (!template) {
            console.warn(`Missing template for section: ${sectionName}`);
            return '';
          }
          return template;
        })
        .filter(content => content.length > 0)
        .join('');
      
      if (initialContent.length === 0) {
        showToast('Failed to generate initial resume content', 'error');
        return;
      }
      
      const emptyResume: Resume = {
        id: 'new-cv-' + Date.now(),
        title: 'New Resume',
        type: 'master',
        content: initialContent,
        atsScore: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const validation = ValidationUtils.validateResumeData(emptyResume);
      if (!validation.valid) {
        showToast(validation.error, 'error');
        return;
      }
      
      setResumes([emptyResume]);
      setActiveResumeId(emptyResume.id);
      setActiveResume(emptyResume);
      setEditorContent(initialContent);
      setUndoHistory([initialContent]);
      setHistoryPointer(0);
      setStep('studio');
      
      try {
        localStorage.setItem('smart_resume_studio_resumes', JSON.stringify([emptyResume]));
      } catch (storageError) {
        ErrorHandler.handleStorageError(storageError, 'create new resume');
      }
    } catch (error) {
      console.error('Error starting from scratch:', error);
      showToast('An error occurred while creating the resume', 'error');
    }
  };

  const processImportedFile = async (file: File) => {
    if (!file) {
      showToast('Please select a file to import', 'error');
      return;
    }
    
    const validation = ValidationUtils.validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error);
      showToast(validation.error, 'error');
      return;
    }
    
    setIsProcessing(true);
    setUploadError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const sanitizedTitle = ValidationUtils.sanitizeFileName(
        file.name.replace(/\.[^/.]+$/, '')
      ) || 'Imported Resume';
      
      const duplicateExists = resumes.some(r => 
        r.title.trim().toLowerCase() === sanitizedTitle.toLowerCase()
      );
      
      const finalTitle = duplicateExists 
        ? `${sanitizedTitle} (${Date.now()})`
        : sanitizedTitle;
      
      const newResume: Resume = {
        id: Date.now().toString(),
        title: finalTitle,
        type: 'master',
        content: plainTextToHtml(mockUserCV),
        atsScore: 75,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const resumeValidation = ValidationUtils.validateResumeData(newResume);
      if (!resumeValidation.valid) {
        showToast(resumeValidation.error, 'error');
        setIsProcessing(false);
        return;
      }
      
      const updatedResumes = [...resumes, newResume];
      
      try {
        localStorage.setItem('smart_resume_studio_resumes', JSON.stringify(updatedResumes));
        setResumes(updatedResumes);
        setActiveResumeId(newResume.id);
        setActiveResume(newResume);
        setEditorContent(newResume.content);
        setUndoHistory([newResume.content]);
        setHistoryPointer(0);
        setStep('studio');
        setUploadedFile(null);
        setUploadError('');
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        showToast('Resume imported successfully', 'success');
      } catch (storageError) {
        ErrorHandler.handleStorageError(storageError, 'import resume');
      }
    } catch (error) {
      console.error('Error processing imported file:', error);
      const errorMessage = (error as { message?: string })?.message || 'Failed to process the uploaded file';
      setUploadError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResumeSelect = (resumeId: string) => {
    try {
      if (!resumeId || typeof resumeId !== 'string') {
        showToast('Invalid resume ID', 'error');
        return;
      }
      
      const resume = resumes.find(r => r.id === resumeId);
      if (!resume) {
        showToast('Resume not found', 'error');
        return;
      }
      
      const validation = ValidationUtils.validateResumeData(resume);
      if (!validation.valid) {
        showToast(`Cannot load resume: ${validation.error}`, 'error');
        return;
      }
      
      setActiveResumeId(resumeId);
      setActiveResume(resume);
      setEditorContent(resume.content || '');
      setUndoHistory([resume.content || '']);
      setHistoryPointer(0);
      setViewMode('edit');
      setStep('studio');
      
      // Load template and photo from resume
      if (resume.templateId) {
        setSelectedTemplateId(resume.templateId);
      }
      if (resume.photoUrl) {
        setProfilePhotoUrl(resume.photoUrl);
      } else {
        setProfilePhotoUrl(null);
      }
    } catch (error) {
      console.error('Error selecting resume:', error);
      showToast('An error occurred while loading the resume', 'error');
    }
  };

  const handleContentChange = (newContent: string) => {
    try {
      if (typeof newContent !== 'string') {
        console.warn('Invalid content type:', typeof newContent);
        return;
      }
      
      if (newContent.length > 1000000) {
        showToast('Content is too large. Please reduce the size.', 'error');
        return;
      }
      
      if (newContent !== editorContent) {
        const newHistory = undoHistory.slice(0, historyPointer + 1);
        
        if (newHistory.length > 50) {
          newHistory.shift();
          setHistoryPointer(newHistory.length - 1);
        }
        
        newHistory.push(newContent);
        setUndoHistory(newHistory);
        setHistoryPointer(newHistory.length - 1);
        setEditorContent(newContent);
        
        if (autoSaveEnabled && activeResume) {
          if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
          }
          autoSaveTimeoutRef.current = setTimeout(() => {
            if (handleSaveRef.current) {
              handleSaveRef.current(true);
            }
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error handling content change:', error);
      showToast('An error occurred while updating content', 'error');
    }
  };

  const handleUndo = () => {
    try {
      if (historyPointer > 0) {
        const newPointer = historyPointer - 1;
        if (undoHistory[newPointer]) {
          setHistoryPointer(newPointer);
          setEditorContent(undoHistory[newPointer]);
        } else {
          showToast('Cannot undo: History data is invalid', 'error');
        }
      }
    } catch (error) {
      console.error('Error during undo:', error);
      showToast('Failed to undo change', 'error');
    }
  };

  const handleSave = async (silent = false) => {
    if (!activeResume) {
      showToast('No resume selected', 'error');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const validation = ValidationUtils.validateResumeData(activeResume);
      if (!validation.valid) {
        showToast(validation.error, 'error');
        setIsLoading(false);
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedResume = { 
        ...activeResume, 
        content: editorContent, 
        updatedAt: new Date().toISOString() 
      };
      
      const updatedResumes = resumes.map(r => 
        r.id === activeResume.id ? updatedResume : r
      );
      
      try {
        localStorage.setItem('smart_resume_studio_resumes', JSON.stringify(updatedResumes));
        setResumes(updatedResumes);
        setActiveResume(updatedResume);
        
        // Create auto-version on save (only if content changed)
        if (!silent && lastVersionContent !== editorContent) {
          createVersion('auto', 'Auto-save checkpoint');
        }
        
        if (!silent) {
          showToast('Resume saved successfully', 'success');
        }
      } catch (storageError) {
        ErrorHandler.handleStorageError(storageError, 'save resume');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error saving resume:', error);
      setIsLoading(false);
      showToast('An unexpected error occurred while saving', 'error');
    }
  };

  // Store latest function references in refs for keyboard shortcuts
  handleSaveRef.current = handleSave;
  handleUndoRef.current = handleUndo;

  const createNewResume = async () => {
    try {
      const titleValidation = ValidationUtils.validateResumeTitle(newResumeTitle);
      if (!titleValidation.valid) {
        showToast(titleValidation.error, 'error');
        return;
      }
      
      const sanitizedTitle = ValidationUtils.sanitizeInput(newResumeTitle);
      const duplicateExists = resumes.some(r => 
        r.title.trim().toLowerCase() === sanitizedTitle.toLowerCase()
      );
      
      if (duplicateExists) {
        showToast('A resume with this title already exists', 'error');
        return;
      }
      
      const newResume: Resume = {
        id: Date.now().toString(),
        title: sanitizedTitle,
        type: newResumeType,
        content: newResumeType === 'master' 
          ? activeSections.map(sectionName => sectionTemplates[sectionName] || '').join('')
          : (resumes.find(r => r.type === 'master')?.content || activeSections.map(sectionName => sectionTemplates[sectionName] || '').join('')),
        atsScore: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const resumeValidation = ValidationUtils.validateResumeData(newResume);
      if (!resumeValidation.valid) {
        showToast(resumeValidation.error, 'error');
        return;
      }
      
      const updatedResumes = [...resumes, newResume];
      
      try {
        localStorage.setItem('smart_resume_studio_resumes', JSON.stringify(updatedResumes));
        setResumes(updatedResumes);
        setActiveResumeId(newResume.id);
        setActiveResume(newResume);
        setEditorContent(newResume.content);
        setUndoHistory([newResume.content]);
        setHistoryPointer(0);
        setShowCreateModal(false);
        setNewResumeTitle('');
        setViewMode('edit');
        setStep('studio');
        showToast(`${newResumeType === 'master' ? 'Master' : 'Campaign'} resume created`, 'success');
      } catch (storageError) {
        ErrorHandler.handleStorageError(storageError, 'create resume');
      }
    } catch (error) {
      console.error('Error creating resume:', error);
      showToast('An unexpected error occurred while creating the resume', 'error');
    }
  };

  const applyTextColor = (color: string) => {
    try {
      if (!color || typeof color !== 'string') {
        showToast('Invalid color value', 'error');
        return;
      }
      
      if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
        showToast('Please enter a valid color (hex format)', 'error');
        return;
      }
      
      if (!editorRef.current) {
        showToast('Editor not ready', 'error');
        return;
      }
      
      editorRef.current.focus();
      document.execCommand('foreColor', false, color);
      handleContentChange(editorRef.current.innerHTML);
    } catch (error) {
      console.error('Error applying text color:', error);
      showToast('Failed to apply text color', 'error');
    }
  };

  const applyFormat = (command: string, value: string | null = null) => {
    try {
      if (!editorRef.current) {
        showToast('Editor not ready', 'error');
        return;
      }
      
      const validCommands = ['bold', 'italic', 'underline', 'insertUnorderedList', 'insertOrderedList', 'justifyLeft', 'justifyCenter', 'justifyRight'];
      if (!validCommands.includes(command)) {
        console.warn('Invalid format command:', command);
        return;
      }
    
      const alignmentCommands: Record<string, string> = {
        justifyLeft: 'left',
        justifyCenter: 'center',
        justifyRight: 'right'
      };
      
      if (command in alignmentCommands) {
        const alignment = alignmentCommands[command];
        editorRef.current.focus();
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        const editorNode = editorRef.current;
        
        if (!editorNode.contains(range.commonAncestorContainer)) return;
        
        const paragraphsToAlign = new Set<Element>();
        const allParagraphs = editorNode.querySelectorAll('p');
        allParagraphs.forEach(p => {
          if (range.intersectsNode(p)) {
            paragraphsToAlign.add(p);
          }
        });
        
        if (paragraphsToAlign.size === 0 && range.collapsed) {
          let currentNode: Node | null = range.startContainer;
          while (currentNode && currentNode !== editorNode) {
            if (currentNode.nodeName === 'P') {
              paragraphsToAlign.add(currentNode as Element);
              break;
            }
            currentNode = currentNode.parentNode;
          }
        }
        
        paragraphsToAlign.forEach(p => {
          (p as HTMLElement).style.textAlign = alignment;
        });
      } else {
        editorRef.current.focus();
        document.execCommand(command, false, value || undefined);
      }
      
      handleContentChange(editorRef.current.innerHTML);
    } catch (error) {
      console.error('Error applying format:', error);
      showToast('Failed to apply formatting', 'error');
    }
  };

  // --- Enhanced Editor Functions ---

  const applyHeading = (level: 1 | 2 | 3) => {
    try {
      if (!editorRef.current) return;
      editorRef.current.focus();
      document.execCommand('formatBlock', false, `h${level}`);
      handleContentChange(editorRef.current.innerHTML);
    } catch (error) {
      console.error('Error applying heading:', error);
    }
  };

  const applyStrikethrough = () => {
    try {
      if (!editorRef.current) return;
      editorRef.current.focus();
      document.execCommand('strikeThrough', false);
      handleContentChange(editorRef.current.innerHTML);
    } catch (error) {
      console.error('Error applying strikethrough:', error);
    }
  };

  const applyHighlight = (color: string) => {
    try {
      if (!editorRef.current) return;
      editorRef.current.focus();
      document.execCommand('hiliteColor', false, color);
      handleContentChange(editorRef.current.innerHTML);
    } catch (error) {
      console.error('Error applying highlight:', error);
    }
  };

  const insertLink = () => {
    try {
      if (!editorRef.current) return;
      
      // Get current selection
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        setLinkText(selection.toString());
      }
      
      setShowLinkModal(true);
    } catch (error) {
      console.error('Error preparing link insertion:', error);
    }
  };

  const confirmInsertLink = () => {
    try {
      if (!editorRef.current || !linkUrl) {
        showToast('Please enter a URL', 'error');
        return;
      }
      
      // Validate URL
      let url = linkUrl;
      if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:')) {
        url = 'https://' + url;
      }
      
      editorRef.current.focus();
      
      // If we have link text, insert a new link
      if (linkText) {
        const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #3B82F6; text-decoration: underline;">${linkText}</a>`;
        document.execCommand('insertHTML', false, linkHtml);
      } else {
        // Just create link from selection
        document.execCommand('createLink', false, url);
      }
      
      handleContentChange(editorRef.current.innerHTML);
      setShowLinkModal(false);
      setLinkUrl('');
      setLinkText('');
      showToast('Link inserted', 'success');
    } catch (error) {
      console.error('Error inserting link:', error);
      showToast('Failed to insert link', 'error');
    }
  };

  const removeLink = () => {
    try {
      if (!editorRef.current) return;
      editorRef.current.focus();
      document.execCommand('unlink', false);
      handleContentChange(editorRef.current.innerHTML);
      showToast('Link removed', 'success');
    } catch (error) {
      console.error('Error removing link:', error);
    }
  };

  const insertTable = () => {
    try {
      if (!editorRef.current) return;
      
      // Generate table HTML
      let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 1em 0;">';
      for (let i = 0; i < tableRows; i++) {
        tableHtml += '<tr>';
        for (let j = 0; j < tableCols; j++) {
          const cellStyle = 'border: 1px solid #ddd; padding: 8px; text-align: left;';
          if (i === 0) {
            tableHtml += `<th style="${cellStyle} background-color: #f3f4f6; font-weight: 600;">Header ${j + 1}</th>`;
          } else {
            tableHtml += `<td style="${cellStyle}">Cell ${i},${j + 1}</td>`;
          }
        }
        tableHtml += '</tr>';
      }
      tableHtml += '</table><p><br></p>';
      
      editorRef.current.focus();
      document.execCommand('insertHTML', false, tableHtml);
      handleContentChange(editorRef.current.innerHTML);
      setShowTableModal(false);
      setTableRows(3);
      setTableCols(3);
      showToast('Table inserted', 'success');
    } catch (error) {
      console.error('Error inserting table:', error);
      showToast('Failed to insert table', 'error');
    }
  };

  const increaseIndent = () => {
    try {
      if (!editorRef.current) return;
      editorRef.current.focus();
      document.execCommand('indent', false);
      handleContentChange(editorRef.current.innerHTML);
    } catch (error) {
      console.error('Error increasing indent:', error);
    }
  };

  const decreaseIndent = () => {
    try {
      if (!editorRef.current) return;
      editorRef.current.focus();
      document.execCommand('outdent', false);
      handleContentChange(editorRef.current.innerHTML);
    } catch (error) {
      console.error('Error decreasing indent:', error);
    }
  };

  const removeFormatting = () => {
    try {
      if (!editorRef.current) return;
      editorRef.current.focus();
      document.execCommand('removeFormat', false);
      handleContentChange(editorRef.current.innerHTML);
      showToast('Formatting removed', 'success');
    } catch (error) {
      console.error('Error removing formatting:', error);
    }
  };

  const toggleDragMode = () => {
    setIsDragModeActive(!isDragModeActive);
    if (!isDragModeActive) {
      showToast('Drag mode enabled. Drag sections to reorder.', 'info');
    }
  };

  const toggleSpellCheck = () => {
    setSpellCheckEnabled(!spellCheckEnabled);
    if (editorRef.current) {
      editorRef.current.setAttribute('spellcheck', (!spellCheckEnabled).toString());
    }
    showToast(spellCheckEnabled ? 'Spell check disabled' : 'Spell check enabled', 'info');
  };

  // --- Dark Mode Toggle ---
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('resumeStudio_darkMode', String(newMode));
    showToast(newMode ? '🌙 Dark mode enabled' : '☀️ Light mode enabled', 'info');
  };

  // --- Mobile Panel Toggles ---
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
    if (!isMobileSidebarOpen) setIsMobileRightPanelOpen(false);
  };

  const toggleMobileRightPanel = () => {
    setIsMobileRightPanelOpen(!isMobileRightPanelOpen);
    if (!isMobileRightPanelOpen) setIsMobileSidebarOpen(false);
  };

  const insertHorizontalRule = () => {
    try {
      if (!editorRef.current) return;
      editorRef.current.focus();
      document.execCommand('insertHorizontalRule', false);
      handleContentChange(editorRef.current.innerHTML);
    } catch (error) {
      console.error('Error inserting horizontal rule:', error);
    }
  };

  const clearAllFormatting = () => {
    try {
      if (!editorRef.current) return;
      const plainText = editorRef.current.innerText;
      const cleanHtml = plainText.split('\n').map(line => `<p>${line || '<br>'}</p>`).join('');
      editorRef.current.innerHTML = cleanHtml;
      handleContentChange(cleanHtml);
      showToast('All formatting cleared', 'success');
    } catch (error) {
      console.error('Error clearing formatting:', error);
    }
  };

  const handleAddSection = (sectionName: string) => {
    try {
      const validation = ValidationUtils.validateSectionName(sectionName);
      if (!validation.valid) {
        showToast(validation.error, 'error');
        return;
      }
      
      if (activeSections.includes(sectionName)) {
        showToast('Section already exists', 'error');
        return;
      }
      
      if (!sectionTemplates[sectionName]) {
        showToast('Invalid section type', 'error');
        return;
      }
      
      setActiveSections([...activeSections, sectionName]);
      const sectionContent = sectionTemplates[sectionName];
      if (sectionContent) {
        const newContent = editorContent + sectionContent;
        handleContentChange(newContent);
        showToast(`${sectionName} section added`, 'success');
      }
    } catch (error) {
      console.error('Error adding section:', error);
      showToast('An error occurred while adding the section', 'error');
    }
  };

  const handleDeleteSection = (sectionName: string) => {
    try {
      const validation = ValidationUtils.validateSectionName(sectionName);
      if (!validation.valid) {
        showToast(validation.error, 'error');
        return;
      }
      
      if (!activeSections.includes(sectionName)) {
        showToast('Section not found', 'error');
        return;
      }
      
      if (activeSections.length <= 1) {
        showToast('Cannot delete the last section', 'error');
        return;
      }
      
      setActiveSections(activeSections.filter(section => section !== sectionName));
      
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = editorContent;
      
      const sectionToRemove = tempContainer.querySelector(`.resume-section[data-section-name="${sectionName}"]`);
      
      if (sectionToRemove) {
        sectionToRemove.remove();
        handleContentChange(tempContainer.innerHTML);
        showToast(`${sectionName} section removed`, 'success');
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      showToast('An error occurred while removing the section', 'error');
    }
  };

  const handleATSOptimization = async () => {
    if (!activeResume) {
      showToast('Please select a resume first', 'error');
      return;
    }
    
    try {
      setAiProcessing(true);
      showToast('Analyzing resume for ATS compatibility...', 'info');
      
      const analysis = await analyzeResumeATS(editorContent);
      setAtsAnalysis(analysis);
      
      // Update the resume's ATS score with the real analysis
      const updatedResumes = resumes.map(r => 
        r.id === activeResume.id 
          ? { ...r, atsScore: analysis.overallScore }
          : r
      );
      
      try {
        localStorage.setItem('smart_resume_studio_resumes', JSON.stringify(updatedResumes));
        setResumes(updatedResumes);
        setActiveResume({ ...activeResume, atsScore: analysis.overallScore });
        
        // Save to score history
        const newHistoryEntry = {
          date: new Date().toISOString(),
          score: analysis.overallScore,
          resumeId: activeResume.id
        };
        const updatedHistory = [...atsScoreHistory, newHistoryEntry].slice(-50); // Keep last 50 entries
        setAtsScoreHistory(updatedHistory);
        localStorage.setItem('atsScoreHistory', JSON.stringify(updatedHistory));
        
        showToast(`ATS Analysis complete! Score: ${analysis.overallScore}%`, 'success');
      } catch (storageError) {
        ErrorHandler.handleStorageError(storageError, 'update ATS score');
      }
    } catch (error) {
      console.error('Error during ATS optimization:', error);
      ErrorHandler.handleAPIError(error, 'analyze resume');
    } finally {
      setAiProcessing(false);
    }
  };

  const handleEnhanceText = async () => {
    if (!selectedText || selectedText.trim().length === 0) {
      showToast('Please select some text to enhance', 'error');
      return;
    }
    
    try {
      setAiProcessing(true);
      showToast('Enhancing text with AI...', 'info');
      
      const result = await enhanceResumeText(selectedText);
      setEnhancedTextResult(result);
      
      showToast('Text enhanced! Review and apply the changes.', 'success');
    } catch (error) {
      console.error('Error enhancing text:', error);
      ErrorHandler.handleAPIError(error, 'enhance text');
    } finally {
      setAiProcessing(false);
    }
  };

  const handleApplyEnhancedText = () => {
    if (!enhancedTextResult || !editorRef.current) return;
    
    try {
      // Replace selected text with enhanced version
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(enhancedTextResult.enhancedText));
        handleContentChange(editorRef.current.innerHTML);
        showToast('Enhanced text applied!', 'success');
      } else {
        // If no selection, append to current content
        const newContent = editorContent.replace(selectedText, enhancedTextResult.enhancedText);
        handleContentChange(newContent);
        showToast('Enhanced text applied!', 'success');
      }
      setEnhancedTextResult(null);
      setSelectedText('');
    } catch (error) {
      console.error('Error applying enhanced text:', error);
      showToast('Failed to apply enhanced text', 'error');
    }
  };

  const handleGapJustification = async () => {
    if (!activeResume) {
      showToast('Please select a resume first', 'error');
      return;
    }
    
    try {
      setAiProcessing(true);
      showToast('Analyzing career timeline for gaps...', 'info');
      
      const analysis = await analyzeCareerGaps(editorContent);
      setGapAnalysis(analysis);
      
      if (analysis.detectedGaps.length > 0) {
        showToast(`Found ${analysis.detectedGaps.length} career gap(s). Review suggestions.`, 'success');
      } else {
        showToast('No significant career gaps detected!', 'success');
      }
    } catch (error) {
      console.error('Error analyzing career gaps:', error);
      ErrorHandler.handleAPIError(error, 'analyze career gaps');
    } finally {
      setAiProcessing(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!activeResume) {
      showToast('Please select a resume first', 'error');
      return;
    }
    
    try {
      setAiProcessing(true);
      showToast('Generating professional summary...', 'info');
      
      const summary = await generateProfessionalSummary(editorContent);
      
      // Find the Profile/Summary section and update it
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = editorContent;
      
      const profileSection = tempContainer.querySelector('[data-section-name="Profile"]');
      if (profileSection) {
        // Update the content within the profile section
        const paragraphs = profileSection.querySelectorAll('p');
        if (paragraphs.length >= 2) {
          // Keep the heading, replace the content
          paragraphs[paragraphs.length - 1].textContent = summary;
        }
        handleContentChange(tempContainer.innerHTML);
        showToast('Professional summary generated and applied!', 'success');
      } else {
        // Add as new section at the beginning
        const newSection = `<div class="resume-section" data-section-name="Profile"><p><br></p><p><b>PROFESSIONAL SUMMARY</b></p><p>${summary}</p></div>`;
        handleContentChange(newSection + editorContent);
        showToast('Professional summary added to resume!', 'success');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      ErrorHandler.handleAPIError(error, 'generate summary');
    } finally {
      setAiProcessing(false);
    }
  };

  const handleClearAIResults = () => {
    setAtsAnalysis(null);
    setEnhancedTextResult(null);
    setGapAnalysis(null);
    setKeywordMatchResult(null);
  };

  // --- Keyword Match Handler ---
  const handleKeywordMatch = async (jobDescription: string) => {
    if (!activeResume || !jobDescription.trim()) return;
    
    setAiProcessing(true);
    try {
      const result = await extractAndMatchKeywords(editorContent, jobDescription);
      setKeywordMatchResult(result);
      showToast('Keyword analysis complete!', 'success');
    } catch (error) {
      console.error('Error matching keywords:', error);
      showToast('Failed to analyze keywords', 'error');
    } finally {
      setAiProcessing(false);
    }
  };

  // --- Version Control Functions ---
  
  const createVersion = (
    changeType: 'auto' | 'manual' | 'ai-enhanced' | 'import' | 'template-change',
    changeSummary: string,
    forceCreate: boolean = false
  ) => {
    if (!activeResume) return;
    
    // Don't create version if content hasn't changed significantly (unless forced)
    if (!forceCreate && lastVersionContent === editorContent) return;
    
    const newVersion = {
      id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      resumeId: activeResume.id,
      content: editorContent,
      timestamp: new Date().toISOString(),
      label: `Version ${versions.filter(v => v.resumeId === activeResume.id).length + 1}`,
      changeType,
      changeSummary,
      atsScore: atsAnalysis?.overallScore || activeResume.atsScore
    };
    
    const updatedVersions = [...versions, newVersion];
    
    // Keep only last 50 versions per resume to save space
    const resumeVersions = updatedVersions.filter(v => v.resumeId === activeResume.id);
    const otherVersions = updatedVersions.filter(v => v.resumeId !== activeResume.id);
    const trimmedResumeVersions = resumeVersions.slice(-50);
    const finalVersions = [...otherVersions, ...trimmedResumeVersions];
    
    setVersions(finalVersions);
    setLastVersionContent(editorContent);
    
    try {
      localStorage.setItem('resumeStudio_versions', JSON.stringify(finalVersions));
    } catch (error) {
      console.error('Error saving version:', error);
    }
    
    return newVersion;
  };

  const createManualVersion = (label?: string) => {
    if (!activeResume) {
      showToast('No resume selected', 'error');
      return;
    }
    
    const version = createVersion('manual', label || 'Manual snapshot', true);
    if (version) {
      showToast(`📸 Version saved: "${version.label}"`, 'success');
    }
  };

  const getVersionsForResume = () => {
    if (!activeResume) return [];
    return versions
      .filter(v => v.resumeId === activeResume.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const restoreVersion = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (!version || !activeResume) {
      showToast('Version not found', 'error');
      return;
    }
    
    // Create a version of current state before restoring
    createVersion('manual', 'Before restore point', true);
    
    // Restore the content
    setEditorContent(version.content);
    handleContentChange(version.content);
    
    showToast(`✅ Restored to "${version.label}"`, 'success');
    setShowVersionHistory(false);
    setShowVersionCompare(false);
  };

  const deleteVersion = (versionId: string) => {
    const updatedVersions = versions.filter(v => v.id !== versionId);
    setVersions(updatedVersions);
    
    try {
      localStorage.setItem('resumeStudio_versions', JSON.stringify(updatedVersions));
      showToast('Version deleted', 'success');
    } catch (error) {
      console.error('Error deleting version:', error);
    }
  };

  const renameVersion = (versionId: string, newLabel: string) => {
    const updatedVersions = versions.map(v => 
      v.id === versionId ? { ...v, label: newLabel } : v
    );
    setVersions(updatedVersions);
    
    try {
      localStorage.setItem('resumeStudio_versions', JSON.stringify(updatedVersions));
      showToast('Version renamed', 'success');
    } catch (error) {
      console.error('Error renaming version:', error);
    }
  };

  const getVersionDiff = (versionId: string): { additions: number; deletions: number; changes: string[] } => {
    const version = versions.find(v => v.id === versionId);
    if (!version) return { additions: 0, deletions: 0, changes: [] };
    
    // Simple word-based diff
    const oldWords = version.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean);
    const newWords = editorContent.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean);
    
    const oldSet = new Set(oldWords);
    const newSet = new Set(newWords);
    
    const additions = newWords.filter(w => !oldSet.has(w)).length;
    const deletions = oldWords.filter(w => !newSet.has(w)).length;
    
    const changes: string[] = [];
    if (additions > 0) changes.push(`+${additions} words added`);
    if (deletions > 0) changes.push(`-${deletions} words removed`);
    if (additions === 0 && deletions === 0) changes.push('No significant changes');
    
    return { additions, deletions, changes };
  };

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case 'auto': return '🔄';
      case 'manual': return '📸';
      case 'ai-enhanced': return '🤖';
      case 'import': return '📥';
      case 'template-change': return '🎨';
      default: return '📝';
    }
  };

  const formatVersionDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // --- Collaboration Functions ---

  const saveUserProfile = (name: string, email: string) => {
    setUserName(name);
    setUserEmail(email);
    localStorage.setItem('resumeStudio_userName', name);
    localStorage.setItem('resumeStudio_userEmail', email);
  };

  const getCommentsForResume = () => {
    if (!activeResume) return [];
    return comments
      .filter(c => c.resumeId === activeResume.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getUnresolvedCommentCount = () => {
    return getCommentsForResume().filter(c => !c.resolved).length;
  };

  const addComment = (content: string, section?: string) => {
    if (!activeResume || !content.trim()) return;
    
    const newCommentObj: ResumeComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      resumeId: activeResume.id,
      author: userName,
      authorEmail: userEmail,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      section,
      resolved: false,
      replies: []
    };
    
    const updatedComments = [...comments, newCommentObj];
    setComments(updatedComments);
    setNewComment('');
    
    try {
      localStorage.setItem('resumeStudio_comments', JSON.stringify(updatedComments));
      showToast('Comment added', 'success');
    } catch (error) {
      console.error('Error saving comment:', error);
    }
    
    return newCommentObj;
  };

  const resolveComment = (commentId: string) => {
    const updatedComments = comments.map(c => 
      c.id === commentId ? { ...c, resolved: true } : c
    );
    setComments(updatedComments);
    
    try {
      localStorage.setItem('resumeStudio_comments', JSON.stringify(updatedComments));
      showToast('Comment resolved', 'success');
    } catch (error) {
      console.error('Error resolving comment:', error);
    }
  };

  const deleteComment = (commentId: string) => {
    const updatedComments = comments.filter(c => c.id !== commentId);
    setComments(updatedComments);
    
    try {
      localStorage.setItem('resumeStudio_comments', JSON.stringify(updatedComments));
      showToast('Comment deleted', 'success');
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const addReply = (commentId: string, replyContent: string) => {
    if (!replyContent.trim()) return;
    
    const reply = {
      id: `reply_${Date.now()}`,
      author: userName,
      content: replyContent.trim(),
      timestamp: new Date().toISOString()
    };
    
    const updatedComments = comments.map(c => 
      c.id === commentId 
        ? { ...c, replies: [...c.replies, reply] }
        : c
    );
    setComments(updatedComments);
    
    try {
      localStorage.setItem('resumeStudio_comments', JSON.stringify(updatedComments));
      showToast('Reply added', 'success');
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const sendReviewRequest = () => {
    if (!activeResume || !newReviewEmail.trim() || !newReviewName.trim()) {
      showToast('Please fill in reviewer details', 'error');
      return;
    }
    
    const request: ReviewRequest = {
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      resumeId: activeResume.id,
      resumeTitle: activeResume.title,
      requesterName: userName,
      reviewerEmail: newReviewEmail.trim(),
      reviewerName: newReviewName.trim(),
      message: newReviewMessage.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    const updatedRequests = [...reviewRequests, request];
    setReviewRequests(updatedRequests);
    
    try {
      localStorage.setItem('resumeStudio_reviews', JSON.stringify(updatedRequests));
      
      // Clear form
      setNewReviewEmail('');
      setNewReviewName('');
      setNewReviewMessage('');
      setShowReviewModal(false);
      
      showToast(`Review request sent to ${request.reviewerName}`, 'success');
    } catch (error) {
      console.error('Error sending review request:', error);
      showToast('Failed to send review request', 'error');
    }
  };

  const getReviewsForResume = () => {
    if (!activeResume) return [];
    return reviewRequests
      .filter(r => r.resumeId === activeResume.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const updateReviewStatus = (reviewId: string, status: ReviewRequest['status'], feedback?: string) => {
    const updatedRequests = reviewRequests.map(r => 
      r.id === reviewId 
        ? { 
            ...r, 
            status, 
            feedback: feedback || r.feedback,
            completedAt: status === 'completed' ? new Date().toISOString() : r.completedAt 
          }
        : r
    );
    setReviewRequests(updatedRequests);
    
    try {
      localStorage.setItem('resumeStudio_reviews', JSON.stringify(updatedRequests));
      showToast('Review status updated', 'success');
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const deleteReviewRequest = (reviewId: string) => {
    const updatedRequests = reviewRequests.filter(r => r.id !== reviewId);
    setReviewRequests(updatedRequests);
    
    try {
      localStorage.setItem('resumeStudio_reviews', JSON.stringify(updatedRequests));
      showToast('Review request deleted', 'success');
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const getPendingReviewCount = () => {
    return getReviewsForResume().filter(r => r.status !== 'completed').length;
  };

  // --- Photo Upload Handler ---
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'error');
      return;
    }

    // Create object URL for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setProfilePhotoUrl(dataUrl);
      
      // Update active resume with photo
      if (activeResume) {
        const updatedResumes = resumes.map(r =>
          r.id === activeResume.id ? { ...r, photoUrl: dataUrl } : r
        );
        setResumes(updatedResumes);
        setActiveResume({ ...activeResume, photoUrl: dataUrl });
        
        try {
          localStorage.setItem('smart_resume_studio_resumes', JSON.stringify(updatedResumes));
        } catch (e) {
          console.error('Error saving photo:', e);
        }
      }
      
      showToast('Photo uploaded successfully', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfilePhotoUrl(null);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
    
    if (activeResume) {
      const updatedResumes = resumes.map(r =>
        r.id === activeResume.id ? { ...r, photoUrl: undefined } : r
      );
      setResumes(updatedResumes);
      setActiveResume({ ...activeResume, photoUrl: undefined });
      
      try {
        localStorage.setItem('smart_resume_studio_resumes', JSON.stringify(updatedResumes));
      } catch (e) {
        console.error('Error removing photo:', e);
      }
    }
    
    showToast('Photo removed', 'success');
  };

  // --- Template Application ---
  const handleApplyTemplate = (templateId: string) => {
    const template = getTemplateById(templateId);
    if (!template) {
      showToast('Template not found', 'error');
      return;
    }

    setSelectedTemplateId(templateId);
    
    // Update colors based on template
    setSelectedColors({
      primary: template.styles.accentColor,
      secondary: '#64748B',
      accent: template.styles.accentColor
    });

    // Update formatting based on template
    setFormattingSettings(prev => ({
      ...prev,
      fontStyle: template.styles.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
      textColor: template.styles.accentColor
    }));

    // Update active resume with template
    if (activeResume) {
      const updatedResumes = resumes.map(r =>
        r.id === activeResume.id ? { ...r, templateId } : r
      );
      setResumes(updatedResumes);
      setActiveResume({ ...activeResume, templateId });
      
      try {
        localStorage.setItem('smart_resume_studio_resumes', JSON.stringify(updatedResumes));
      } catch (e) {
        console.error('Error saving template:', e);
      }
    }

    setShowTemplatePreview(false);
    showToast(`Applied ${template.name} template`, 'success');
  };

  const handlePreviewTemplate = (templateId: string) => {
    setPreviewTemplateId(templateId);
    setShowTemplatePreview(true);
  };

  // --- Integration Handlers ---
  
  const handleLinkedInImport = () => {
    // Load mock LinkedIn profile (in production, this would use real LinkedIn API)
    const profile = FeatureIntegration.createMockLinkedInProfile();
    setLinkedInProfile(profile);
    setShowLinkedInImport(true);
  };

  const handleApplyLinkedInProfile = () => {
    if (!linkedInProfile) return;
    
    try {
      const content = FeatureIntegration.linkedInToResumeHTML(linkedInProfile);
      
      const newResume: Resume = {
        id: 'linkedin-' + Date.now(),
        title: `${linkedInProfile.name} - LinkedIn Import`,
        type: 'master',
        content,
        atsScore: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const updatedResumes = [...resumes, newResume];
      setResumes(updatedResumes);
      setActiveResumeId(newResume.id);
      setActiveResume(newResume);
      setEditorContent(content);
      setUndoHistory([content]);
      setHistoryPointer(0);
      setStep('studio');
      setShowLinkedInImport(false);
      
      try {
        localStorage.setItem('smart_resume_studio_resumes', JSON.stringify(updatedResumes));
      } catch (e) {
        console.error('Error saving resume:', e);
      }
      
      showToast('LinkedIn profile imported successfully!', 'success');
    } catch (error) {
      console.error('Error importing LinkedIn profile:', error);
      showToast('Failed to import LinkedIn profile', 'error');
    }
  };

  const handleOpenTailorForJob = () => {
    // Load tracked jobs
    const jobs = FeatureIntegration.getTrackedJobs();
    setTrackedJobs(jobs);
    setShowTailorForJob(true);
  };

  const handleSelectJobForTailoring = (job: JobDataForResume) => {
    setTargetJob(job);
  };

  const handleCreateTailoredResume = () => {
    if (!targetJob || !activeResume) {
      showToast('Please select a job and have an active resume', 'error');
      return;
    }
    
    try {
      // Create a copy of the current resume tailored for this job
      const newResume: Resume = {
        id: 'tailored-' + Date.now(),
        title: FeatureIntegration.createTailoredResumeTitle(targetJob),
        type: 'campaign',
        content: activeResume.content,
        atsScore: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateId: activeResume.templateId,
      };
      
      const updatedResumes = [...resumes, newResume];
      setResumes(updatedResumes);
      setActiveResumeId(newResume.id);
      setActiveResume(newResume);
      setShowTailorForJob(false);
      
      try {
        localStorage.setItem('smart_resume_studio_resumes', JSON.stringify(updatedResumes));
        // Store job data for potential AI optimization
        FeatureIntegration.storeJobForTailoring(targetJob);
      } catch (e) {
        console.error('Error saving resume:', e);
      }
      
      showToast(`Created tailored resume for ${targetJob.title}`, 'success');
      setTargetJob(null);
    } catch (error) {
      console.error('Error creating tailored resume:', error);
      showToast('Failed to create tailored resume', 'error');
    }
  };

  const handleGoToApplicationTailor = () => {
    if (!activeResume || !editorContent) {
      showToast('Please create a resume first', 'error');
      return;
    }
    
    FeatureIntegration.navigateToApplicationTailor(navigate, editorContent, targetJob || undefined);
  };

  // Process pending actions from other features
  const processPendingAction = (action: ResumeStudioAction) => {
    switch (action.type) {
      case 'import-linkedin':
        handleLinkedInImport();
        break;
      case 'tailor-for-job':
        if (action.data) {
          setTargetJob(action.data as JobDataForResume);
          setShowTailorForJob(true);
        }
        break;
      case 'from-application-tailor':
        // Handle return from Application Tailor
        break;
      case 'quick-create':
        handleStartFromScratch();
        break;
    }
  };

  const updateFormatting = (key: keyof FormattingSettings, inputValue: string | number) => {
    try {
      const validKeys = [
        'alignment', 'textColor', 'highlightColor', 'fontStyle', 'fontSize', 
        'headingSize', 'sectionSpacing', 'paragraphSpacing', 'lineSpacing', 
        'topBottomMargin', 'sideMargins', 'paragraphIndent'
      ];
      
      if (!validKeys.includes(key)) {
        console.warn('Invalid formatting key:', key);
        return;
      }
      
      let finalValue: string | number = inputValue;
      
      if (key === 'fontSize' || key === 'headingSize') {
        const numValue = Number(inputValue);
        if (isNaN(numValue) || numValue < 8 || numValue > 24) {
          showToast('Font size must be between 8 and 24', 'error');
          return;
        }
        finalValue = numValue;
      } else if (key === 'lineSpacing') {
        const numValue = Number(inputValue);
        if (isNaN(numValue) || numValue < 1 || numValue > 2) {
          showToast('Line spacing must be between 1 and 2', 'error');
          return;
        }
        finalValue = numValue;
      } else if (key === 'topBottomMargin' || key === 'sideMargins') {
        const numValue = Number(inputValue);
        if (isNaN(numValue) || numValue < 0 || numValue > 50) {
          showToast('Margins must be between 0 and 50mm', 'error');
          return;
        }
        finalValue = numValue;
      } else if (key === 'textColor' || key === 'highlightColor') {
        if (typeof inputValue !== 'string' || !/^#[0-9A-Fa-f]{6}$|transparent/.test(inputValue)) {
          showToast('Invalid color format', 'error');
          return;
        }
      } else if (key === 'fontStyle') {
        const validFonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Source Sans Pro', 'Century Gothic'];
        if (typeof inputValue !== 'string' || !validFonts.includes(inputValue)) {
          console.warn('Invalid font style:', inputValue);
          return;
        }
      }
      
      setFormattingSettings(prev => ({ ...prev, [key]: finalValue }));
    } catch (error) {
      console.error('Error updating formatting:', error);
      showToast('Failed to update formatting setting', 'error');
    }
  };

  // Load resumes from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('smart_resume_studio_resumes');
      if (!savedData) {
        return;
      }
      
      const savedResumes = JSON.parse(savedData);
      
      if (!Array.isArray(savedResumes)) {
        console.error('Invalid resume data structure in localStorage');
        showToast('Failed to load saved resumes. Data may be corrupted.', 'error');
        try {
          localStorage.removeItem('smart_resume_studio_resumes');
        } catch (e) {
          console.error('Failed to clear corrupted data:', e);
        }
        return;
      }
      
      const validResumes = savedResumes.filter((resume: Resume) => {
        const validation = ValidationUtils.validateResumeData(resume);
        if (!validation.valid) {
          console.warn('Invalid resume data found:', resume, validation.error);
          return false;
        }
        return true;
      });
      
      if (validResumes.length > 0) {
        setResumes(validResumes);
        if (validResumes.length === 1 && !activeResumeId) {
          const resume = validResumes[0];
          setActiveResumeId(resume.id);
          setActiveResume(resume);
          setEditorContent(resume.content || '');
          setUndoHistory([resume.content || '']);
          setHistoryPointer(0);
          setStep('studio');
        } else if (validResumes.length > 1 && !activeResumeId) {
          setStep('list');
        }
      }
    } catch (error) {
      console.error('Error loading resumes from localStorage:', error);
      ErrorHandler.handleStorageError(error, 'load resumes');
    }
  }, []);

  // Check for pending actions from other features
  useEffect(() => {
    const pendingAction = FeatureIntegration.getPendingAction();
    if (pendingAction) {
      // Process the action after a short delay to ensure component is ready
      setTimeout(() => {
        processPendingAction(pendingAction);
      }, 100);
    }
  }, []);

  // Save resumes to localStorage when they change
  useEffect(() => {
    if (resumes.length > 0) {
      try {
        const validResumes = resumes.filter(resume => {
          const validation = ValidationUtils.validateResumeData(resume);
          if (!validation.valid) {
            console.warn('Attempted to save invalid resume:', resume, validation.error);
            return false;
          }
          return true;
        });
        
        if (validResumes.length !== resumes.length) {
          console.warn(`Filtered out ${resumes.length - validResumes.length} invalid resumes before saving`);
          showToast('Some resumes were not saved due to validation errors', 'error');
        }
        
        localStorage.setItem('smart_resume_studio_resumes', JSON.stringify(validResumes));
      } catch (error) {
        ErrorHandler.handleStorageError(error, 'save resumes');
      }
    }
  }, [resumes]);

  // Track selected text for AI features
  useEffect(() => {
    if (editorRef.current) {
      const handleSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
          setSelectedText(selection.toString());
        }
      };
      editorRef.current.addEventListener('mouseup', handleSelection);
      editorRef.current.addEventListener('keyup', handleSelection);
      return () => {
        if (editorRef.current) {
          editorRef.current.removeEventListener('mouseup', handleSelection);
          editorRef.current.removeEventListener('keyup', handleSelection);
        }
      };
    }
  }, [activeResumeId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || (e.target.isContentEditable && e.target !== editorRef.current))) {
        return;
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (activeResume && step === 'studio' && handleSaveRef.current) {
          handleSaveRef.current();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        if (step === 'studio' && document.activeElement === editorRef.current && handleUndoRef.current) {
          e.preventDefault();
          handleUndoRef.current();
        }
      }
      if (e.key === 'Escape') {
        if (showCreateModal) setShowCreateModal(false);
        if (showExportModal) setShowExportModal(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeResume, step, showCreateModal, showExportModal]);

  // Cleanup auto-save timeout
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // --- RENDER ---

  if (step === 'list' || (step === 'studio' && resumes.length === 0 && !activeResumeId)) {
    return (
      <ResumeListViewer 
        resumes={resumes}
        onSelectResume={handleResumeSelect}
        onCreateNew={() => setShowCreateModal(true)}
        onImport={() => setStep('upload')}
      />
    );
  }

  if (step === 'selection') {
    return (
      <div className={`h-full flex items-center justify-center p-8 transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'
      }`}>
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className={`absolute top-4 right-4 p-3 rounded-xl transition-all ${
            isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white/70 hover:bg-white shadow-lg'
          }`}
          title={isDarkMode ? 'Light mode' : 'Dark mode'}
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        <div className="w-full max-w-5xl animate-slideUp">
          <div className="text-center mb-12">
            <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Smart Resume Studio
            </h1>
            <p className={`text-xl ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Create professional resumes with AI-powered editing
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <button
              onClick={handleChooseCV}
              className={`p-8 backdrop-blur-xl border-2 rounded-2xl hover:border-indigo-400 transition-all shadow-lg hover:shadow-xl text-left group animate-scaleIn ${
                isDarkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-white/70 border-white/30'
              }`}
              style={{ animationDelay: '0.1s' }}
            >
              <Upload className="w-12 h-12 text-indigo-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Import Your CV</h3>
              <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Upload your existing resume and start editing</p>
            </button>
            
            <button
              onClick={handleStartFromScratch}
              className={`p-8 backdrop-blur-xl border-2 rounded-2xl hover:border-purple-400 transition-all shadow-lg hover:shadow-xl text-left group animate-scaleIn ${
                isDarkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-white/70 border-white/30'
              }`}
              style={{ animationDelay: '0.2s' }}
            >
              <Plus className="w-12 h-12 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Start From Scratch</h3>
              <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Build a new resume with our templates</p>
            </button>

            <button
              onClick={handleLinkedInImport}
              className="p-8 bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-blue-500 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl text-left group animate-scaleIn"
              style={{ animationDelay: '0.3s' }}
            >
              <svg className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
              <h3 className="text-2xl font-bold text-white mb-2">Import from LinkedIn</h3>
              <p className="text-blue-100">Pull your profile data automatically</p>
            </button>
          </div>
          
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            {resumes.length > 0 && (
              <button
                onClick={() => setStep('list')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/70 backdrop-blur-xl border-2 border-white/30 text-slate-700 rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition-all font-medium"
              >
                <FileText className="w-5 h-5" />
                View Existing Resumes ({resumes.length})
              </button>
            )}
            
            {trackedJobs.length > 0 || FeatureIntegration.getTrackedJobs().length > 0 ? (
              <button
                onClick={handleOpenTailorForJob}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all font-medium shadow-lg"
              >
                <Target className="w-5 h-5" />
                Tailor for Tracked Job
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'upload') {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Import Your Resume</h2>
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-slate-600 mb-4">Select a file to import</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadedFile(file);
                    setUploadError('');
                  }
                }}
                accept=".pdf,.docx,.doc,.txt"
                className="hidden"
              />
            </div>
            
            {uploadedFile && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-indigo-600" />
                    <div>
                      <p className="font-medium text-slate-900">{uploadedFile.name}</p>
                      <p className="text-sm text-slate-600">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUploadedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{uploadError}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStep('selection')}
                className="flex-1 px-6 py-3 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Back
              </button>
              <button
                onClick={() => uploadedFile && processImportedFile(uploadedFile)}
                disabled={!uploadedFile || isProcessing}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Import Resume'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dark mode class names
  const darkBg = isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50';
  const darkCard = isDarkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white/50 border-white/30';
  const darkText = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const darkTextSecondary = isDarkMode ? 'text-slate-300' : 'text-slate-600';
  const darkBorder = isDarkMode ? 'border-slate-700' : 'border-gray-200';
  const darkHover = isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100';

  return (
    <ErrorBoundary>
    <div className={`flex flex-col min-h-screen transition-colors duration-300 ${darkBg}`}>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b ${darkBorder}">
        <button
          onClick={toggleMobileSidebar}
          className={`p-2 rounded-lg ${darkHover} transition-colors`}
        >
          <PanelLeft className={`w-5 h-5 ${darkTextSecondary}`} />
        </button>
        <h2 className={`text-sm font-semibold ${darkText} truncate max-w-[200px]`}>
          {activeResume ? activeResume.title : 'Resume Studio'}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg ${darkHover} transition-colors`}
            title={isDarkMode ? 'Light mode' : 'Dark mode'}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>
          <button
            onClick={toggleMobileRightPanel}
            className={`p-2 rounded-lg ${darkHover} transition-colors`}
          >
            <PanelRight className={`w-5 h-5 ${darkTextSecondary}`} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 animate-fadeIn" onClick={() => setIsMobileSidebarOpen(false)} />
      )}
      {isMobileRightPanelOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 animate-fadeIn" onClick={() => setIsMobileRightPanelOpen(false)} />
      )}

      {/* Main Content Area */}
      <div className="flex gap-4 lg:gap-6 flex-1 p-4 lg:p-0" style={{ minHeight: 'calc(100vh - 12rem)' }}>
        {/* Left Sidebar */}
        <div className={`
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed lg:relative z-50 lg:z-auto
          left-0 top-0 lg:top-auto h-full lg:h-auto
          w-80 ${darkCard} backdrop-blur-xl shadow-lg lg:rounded-2xl p-6 
          overflow-y-auto custom-scrollbar flex-shrink-0 
          transition-transform duration-300 ease-in-out
        `} style={{ maxHeight: 'calc(100vh - 12rem)' }}>
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Resume Header */}
          <div className={`mb-6 pb-4 border-b ${darkBorder}`}>
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setStep('list')}
                className={`p-1.5 ${darkHover} rounded-lg transition-colors`}
                title="Back to list"
              >
                <ArrowRight className={`w-4 h-4 ${darkTextSecondary} rotate-180`} />
              </button>
              <h2 className={`text-base font-semibold ${darkText} flex-1`}>
                {activeResume ? activeResume.title : 'New Resume'}
              </h2>
              {activeResume && (
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  activeResume.type === 'master' ? 'bg-amber-100 text-amber-700' : 'bg-cyan-100 text-cyan-700'
                }`}>
                  {activeResume.type.toUpperCase()}
                </span>
              )}
              {/* Desktop Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`hidden lg:block p-1.5 ${darkHover} rounded-lg transition-colors`}
                title={isDarkMode ? 'Light mode' : 'Dark mode'}
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleUndo}
                disabled={historyPointer <= 0}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Undo (Ctrl+Z)"
              >
                <RotateCcw className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => handleSave()}
                disabled={isLoading}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-xs flex items-center gap-1.5 disabled:opacity-50"
                title="Save (Ctrl+S)"
              >
                {isLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3" />
                    Save
                  </>
                )}
              </button>
              {autoSaveEnabled && (
                <span className="text-xs text-slate-500 px-1.5" title="Auto-save enabled">
                  Auto-save
                </span>
              )}
              <button
                onClick={() => setShowExportModal(true)}
                className="px-3 py-1.5 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs flex items-center gap-1.5"
                title="Export resume"
              >
                <Download className="w-3 h-3" />
                Export
              </button>
              <button
                onClick={() => setShowVersionHistory(true)}
                className="px-3 py-1.5 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs flex items-center gap-1.5"
                title="Version history"
              >
                <History className="w-3 h-3" />
                History
              </button>
              <button
                onClick={() => createManualVersion()}
                className="p-1.5 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors"
                title="Create snapshot"
              >
                <GitBranch className="w-3 h-3" />
              </button>
            </div>
            
            {/* Collaboration Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-200">
              <button
                onClick={() => setShowCommentsPanel(true)}
                className="relative px-3 py-1.5 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs flex items-center gap-1.5"
                title="Comments"
              >
                <MessageCircle className="w-3 h-3" />
                Comments
                {getUnresolvedCommentCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {getUnresolvedCommentCount()}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowReviewModal(true)}
                className="relative px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-colors font-medium text-xs flex items-center gap-1.5"
                title="Request review"
              >
                <Users className="w-3 h-3" />
                Get Feedback
                {getPendingReviewCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-yellow-900 text-[10px] rounded-full flex items-center justify-center">
                    {getPendingReviewCount()}
                  </span>
                )}
              </button>
            </div>
            
            {/* Integration Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-200">
              <button
                onClick={handleOpenTailorForJob}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-colors font-medium text-xs flex items-center gap-1.5"
                title="Tailor for a specific job"
              >
                <Target className="w-3 h-3" />
                Tailor for Job
              </button>
              <button
                onClick={handleGoToApplicationTailor}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-colors font-medium text-xs flex items-center gap-1.5"
                title="Optimize with Application Tailor"
              >
                <ExternalLink className="w-3 h-3" />
                Application Tailor
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setActiveTab('design')}
              className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'design' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Design
            </button>
            <button
              onClick={() => setActiveTab('formatting')}
              className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'formatting' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Formatting
            </button>
            <button
              onClick={() => setActiveTab('sections')}
              className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'sections' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sections
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'ai' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              AI Copilot
            </button>
          </div>

          {activeTab === 'design' && (
            <div className="space-y-6">
              {/* Current Template Info */}
              {currentTemplate && (
                <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-indigo-600 font-medium uppercase tracking-wide">Active Template</p>
                      <p className="text-sm font-semibold text-slate-800">{currentTemplate.name}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg ${currentTemplate.preview}`}></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{currentTemplate.description}</p>
                  {currentTemplate.supportsPhoto && (
                    <p className="text-xs text-indigo-500 mt-1">📷 Supports profile photo</p>
                  )}
                </div>
              )}

              {/* Photo Upload (for photo-supporting templates) */}
              {currentTemplate?.supportsPhoto && (
                <div className="p-4 border border-dashed border-gray-300 rounded-lg">
                  <h4 className="text-sm font-semibold text-slate-800 mb-3">Profile Photo</h4>
                  {profilePhotoUrl || activeResume?.photoUrl ? (
                    <div className="flex items-center gap-3">
                      <img 
                        src={profilePhotoUrl || activeResume?.photoUrl} 
                        alt="Profile" 
                        className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200"
                      />
                      <div className="flex-1">
                        <p className="text-xs text-green-600 font-medium">Photo uploaded</p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => photoInputRef.current?.click()}
                            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-xs hover:bg-indigo-200"
                          >
                            Change
                          </button>
                          <button
                            onClick={handleRemovePhoto}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <button
                        onClick={() => photoInputRef.current?.click()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs hover:bg-indigo-700 transition-colors"
                      >
                        Upload Photo
                      </button>
                      <p className="text-xs text-gray-400 mt-2">JPG, PNG up to 5MB</p>
                    </div>
                  )}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              )}

              {/* Template Selection */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Choose Template</h3>
                
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    onClick={() => setTemplateCategory('all')}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      templateCategory === 'all' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                    }`}
                  >
                    All ({templates.length})
                  </button>
                  {templateCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setTemplateCategory(cat.id)}
                      className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                        templateCategory === cat.id 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Template Grid */}
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                  {filteredTemplates.map(template => (
                    <div
                      key={template.id}
                      className={`relative p-2 border-2 rounded-lg transition-all cursor-pointer group ${
                        selectedTemplateId === template.id
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                      onClick={() => handleApplyTemplate(template.id)}
                    >
                      {/* Preview Thumbnail */}
                      <div className={`h-20 rounded mb-2 relative overflow-hidden ${template.preview}`}>
                        {template.previewGradient && (
                          <div className={`absolute inset-0 bg-gradient-to-br ${template.previewGradient}`}></div>
                        )}
                        {/* Layout indicator */}
                        <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[8px] px-1 rounded">
                          {template.layout === 'sidebar-left' || template.layout === 'sidebar-right' ? '2-col' : '1-col'}
                        </div>
                        {template.supportsPhoto && (
                          <div className="absolute top-1 left-1 bg-white/90 text-[8px] px-1 rounded flex items-center gap-0.5">
                            📷
                          </div>
                        )}
                      </div>
                      
                      {/* Template Info */}
                      <p className="text-xs font-medium text-slate-800 truncate">{template.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{template.category}</p>
                      
                      {/* Applied Badge */}
                      {selectedTemplateId === template.id && (
                        <div className="absolute top-1 right-1 bg-indigo-600 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                          ✓
                        </div>
                      )}

                      {/* Preview Button (hover) */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePreviewTemplate(template.id); }}
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        <span className="bg-white/90 text-slate-700 text-xs px-2 py-1 rounded shadow">
                          Preview
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Palette */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Color Palette</h3>
                <div className="grid grid-cols-5 gap-2">
                  {colorPalettes.map((palette, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColors(palette)}
                      className="p-2 border-2 rounded-lg hover:border-gray-400 transition-colors"
                      title={palette.name}
                    >
                      <div className="flex gap-1">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: palette.primary }}></div>
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: palette.secondary }}></div>
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: palette.accent }}></div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'formatting' && (
            <div className="space-y-6">
              {/* Quick Actions Bar */}
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                <button
                  onClick={toggleSpellCheck}
                  className={`p-2 rounded-lg transition-colors ${spellCheckEnabled ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}
                  title={spellCheckEnabled ? 'Spell check ON' : 'Spell check OFF'}
                >
                  <SpellCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleDragMode}
                  className={`p-2 rounded-lg transition-colors ${isDragModeActive ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}
                  title={isDragModeActive ? 'Drag mode ON' : 'Enable drag mode'}
                >
                  <Move className="w-4 h-4" />
                </button>
                <div className="flex-1" />
                <button
                  onClick={removeFormatting}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors text-slate-600 hover:text-red-600"
                  title="Remove formatting from selection"
                >
                  <RemoveFormat className="w-4 h-4" />
                </button>
              </div>

              {/* Text Styling */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Text Styling</h3>
                <div className="grid grid-cols-6 gap-1 p-2 bg-gray-50 rounded-lg">
                  <button onClick={() => applyFormat('bold')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Bold (Ctrl+B)">
                    <Bold className="w-4 h-4 text-slate-600" />
                  </button>
                  <button onClick={() => applyFormat('italic')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Italic (Ctrl+I)">
                    <Italic className="w-4 h-4 text-slate-600" />
                  </button>
                  <button onClick={() => applyFormat('underline')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Underline (Ctrl+U)">
                    <Underline className="w-4 h-4 text-slate-600" />
                  </button>
                  <button onClick={applyStrikethrough} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Strikethrough">
                    <Strikethrough className="w-4 h-4 text-slate-600" />
                  </button>
                  <button onClick={() => applyHeading(1)} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Heading 1">
                    <Heading1 className="w-4 h-4 text-slate-600" />
                  </button>
                  <button onClick={() => applyHeading(2)} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Heading 2">
                    <Heading2 className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1 p-2 bg-gray-50 rounded-lg mt-2">
                  <button onClick={() => applyFormat('subscript')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Subscript">
                    <Subscript className="w-4 h-4 text-slate-600" />
                  </button>
                  <button onClick={() => applyFormat('superscript')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Superscript">
                    <Superscript className="w-4 h-4 text-slate-600" />
                  </button>
                  <button onClick={clearAllFormatting} className="p-2 hover:bg-red-100 rounded transition-colors col-span-2 flex items-center justify-center gap-1" title="Clear All Formatting">
                    <RemoveFormat className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-red-500">Clear All</span>
                  </button>
                </div>
              </div>

              {/* Colors */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Colors</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-600 w-16">Text</label>
                    <input
                      type="color"
                      value={formattingSettings.textColor}
                      onChange={(e) => {
                        updateFormatting('textColor', e.target.value);
                        applyTextColor(e.target.value);
                      }}
                      className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <div className="flex gap-1">
                      {['#000000', '#334155', '#3B82F6', '#10B981', '#EF4444'].map(color => (
                        <button
                          key={color}
                          onClick={() => { updateFormatting('textColor', color); applyTextColor(color); }}
                          className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-600 w-16">Highlight</label>
                    <input
                      type="color"
                      value={highlightColor}
                      onChange={(e) => setHighlightColor(e.target.value)}
                      className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <button
                      onClick={() => applyHighlight(highlightColor)}
                      className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200"
                    >
                      <Highlighter className="w-3 h-3" />
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              {/* Alignment & Lists */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Layout</h3>
                <div className="grid grid-cols-7 gap-1 p-2 bg-gray-50 rounded-lg">
                  <button onClick={() => applyFormat('justifyLeft')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Align Left">
                    <AlignLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <button onClick={() => applyFormat('justifyCenter')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Align Center">
                    <AlignCenter className="w-4 h-4 text-slate-600" />
                  </button>
                  <button onClick={() => applyFormat('justifyRight')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Align Right">
                    <AlignRight className="w-4 h-4 text-slate-600" />
                  </button>
                  <div className="w-px bg-gray-300 mx-1" />
                  <button onClick={() => applyFormat('insertUnorderedList')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Bullet List">
                    <List className="w-4 h-4 text-slate-600" />
                  </button>
                  <button onClick={() => applyFormat('insertOrderedList')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Numbered List">
                    <ListOrdered className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1 p-2 bg-gray-50 rounded-lg mt-2">
                  <button onClick={decreaseIndent} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Decrease Indent">
                    <IndentDecrease className="w-4 h-4 text-slate-600" />
                  </button>
                  <button onClick={increaseIndent} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Increase Indent">
                    <IndentIncrease className="w-4 h-4 text-slate-600" />
                  </button>
                  <button onClick={insertHorizontalRule} className="p-2 hover:bg-gray-200 rounded transition-colors col-span-2" title="Insert Horizontal Line">
                    <span className="text-xs text-slate-600">─ Line</span>
                  </button>
                </div>
              </div>

              {/* Insert Elements */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Insert</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={insertLink}
                    className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">Link</span>
                  </button>
                  <button
                    onClick={() => setShowTableModal(true)}
                    className="flex items-center gap-2 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Table className="w-4 h-4" />
                    <span className="text-xs font-medium">Table</span>
                  </button>
                </div>
              </div>

              {/* Document Settings */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Document</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-600 mb-1 block">Font: {formattingSettings.fontStyle}</label>
                    <select
                      value={formattingSettings.fontStyle}
                      onChange={(e) => updateFormatting('fontStyle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {fontStyles.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 mb-1 block">Size: {formattingSettings.fontSize}pt</label>
                    <input
                      type="range"
                      min="8"
                      max="16"
                      value={formattingSettings.fontSize}
                      onChange={(e) => updateFormatting('fontSize', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 mb-1 block">Line Height: {formattingSettings.lineSpacing}</label>
                    <input
                      type="range"
                      min="1"
                      max="2"
                      step="0.1"
                      value={formattingSettings.lineSpacing}
                      onChange={(e) => updateFormatting('lineSpacing', parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sections' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-800">Active Sections</h3>
                  <span className="text-xs text-slate-500">Drag to reorder</span>
                </div>
                <div className="space-y-2">
                  {activeSections.map((sectionName, index) => (
                    <div 
                      key={sectionName} 
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', index.toString());
                        e.currentTarget.classList.add('opacity-50');
                      }}
                      onDragEnd={(e) => {
                        e.currentTarget.classList.remove('opacity-50');
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('ring-2', 'ring-indigo-400');
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('ring-2', 'ring-indigo-400');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('ring-2', 'ring-indigo-400');
                        const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
                        const dropIndex = index;
                        if (draggedIndex !== dropIndex) {
                          const newSections = [...activeSections];
                          const [removed] = newSections.splice(draggedIndex, 1);
                          newSections.splice(dropIndex, 0, removed);
                          setActiveSections(newSections);
                          showToast('Section order updated', 'success');
                        }
                      }}
                      className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-move transition-all group"
                    >
                      <div className="text-slate-400 group-hover:text-slate-600">
                        <Move className="w-4 h-4" />
                      </div>
                      <span className="flex-1 text-sm text-slate-700">{sectionName}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            if (index > 0) {
                              const newSections = [...activeSections];
                              [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
                              setActiveSections(newSections);
                            }
                          }}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ArrowRight className="w-3 h-3 text-slate-500 -rotate-90" />
                        </button>
                        <button
                          onClick={() => {
                            if (index < activeSections.length - 1) {
                              const newSections = [...activeSections];
                              [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
                              setActiveSections(newSections);
                            }
                          }}
                          disabled={index === activeSections.length - 1}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ArrowRight className="w-3 h-3 text-slate-500 rotate-90" />
                        </button>
                        <button
                          onClick={() => handleDeleteSection(sectionName)}
                          className="p-1 hover:bg-red-100 rounded text-red-600 hover:text-red-800"
                          title="Remove section"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Add Section</h3>
                <div className="space-y-2">
                  {availableSections.filter(s => !activeSections.includes(s)).map(sectionName => (
                    <button
                      key={sectionName}
                      onClick={() => handleAddSection(sectionName)}
                      className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-2 border border-transparent hover:border-indigo-200"
                    >
                      <Plus className="w-4 h-4 text-indigo-600" />
                      {sectionName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <AICopilot
              activeResume={activeResume}
              selectedText={selectedText}
              aiProcessing={aiProcessing}
              atsAnalysis={atsAnalysis}
              enhancedTextResult={enhancedTextResult}
              gapAnalysis={gapAnalysis}
              keywordMatchResult={keywordMatchResult}
              atsScoreHistory={atsScoreHistory}
              onATSOptimization={handleATSOptimization}
              onEnhanceText={handleEnhanceText}
              onGapJustification={handleGapJustification}
              onGenerateSummary={handleGenerateSummary}
              onApplyEnhancedText={handleApplyEnhancedText}
              onClearResults={handleClearAIResults}
              onKeywordMatch={handleKeywordMatch}
            />
          )}
        </div>

        {/* Center Editor */}
        <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
          <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
            {activeResume ? (
              <ResumePreview
                content={editorContent}
                colors={selectedColors}
                formatting={formattingSettings}
                template={currentTemplate}
                photoUrl={profilePhotoUrl || activeResume.photoUrl}
                onContentChange={handleContentChange}
                editorRef={editorRef}
              />
            ) : (
              <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-slate-600">No resume selected. Create or import a resume to get started.</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Create New Resume</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Resume Title
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={newResumeTitle}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length > 100) {
                      showToast('Title must be less than 100 characters', 'error');
                      return;
                    }
                    setNewResumeTitle(value);
                  }}
                  placeholder="e.g., Software Engineer Resume"
                  maxLength={100}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    newResumeTitle.length > 0 && !ValidationUtils.validateResumeTitle(newResumeTitle).valid
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                />
                {newResumeTitle.length > 0 && !ValidationUtils.validateResumeTitle(newResumeTitle).valid && (
                  <p className="mt-1 text-xs text-red-600">
                    {ValidationUtils.validateResumeTitle(newResumeTitle).error}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  {newResumeTitle.length}/100 characters
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Resume Type</label>
                <select
                  value={newResumeType}
                  onChange={(e) => setNewResumeType(e.target.value as 'master' | 'campaign')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="master">Master Resume</option>
                  <option value="campaign">Campaign Resume</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewResumeTitle('');
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={createNewResume}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Export & Share</h3>
                <p className="text-sm text-slate-500 mt-1">Download or share your resume</p>
              </div>
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setShareableLink(null);
                  setExportTab('download');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setExportTab('download')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  exportTab === 'download'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Download className="w-4 h-4 inline mr-2" />
                Download
              </button>
              <button
                onClick={() => {
                  setExportTab('share');
                  setSharedLinks(getAllShareableLinks());
                }}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  exportTab === 'share'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Link2 className="w-4 h-4 inline mr-2" />
                Share
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              {exportTab === 'download' && (
                <div className="space-y-3">
                  {/* PDF Export */}
                  <button
                    onClick={async () => {
                      if (!activeResume || !editorContent) {
                        showToast('No resume to export', 'error');
                        return;
                      }
                      setIsExporting(true);
                      try {
                        await exportToPDF({
                          title: activeResume.title,
                          content: editorContent,
                          fontFamily: formattingSettings.fontStyle,
                          fontSize: formattingSettings.fontSize,
                          lineSpacing: formattingSettings.lineSpacing,
                          margins: {
                            top: formattingSettings.topBottomMargin,
                            right: formattingSettings.sideMargins,
                            bottom: formattingSettings.topBottomMargin,
                            left: formattingSettings.sideMargins
                          },
                          accentColor: selectedColors.primary
                        });
                        showToast('PDF export opened - use Save as PDF in print dialog', 'success');
                      } catch {
                        showToast('Failed to export PDF. Allow popups and try again.', 'error');
                      } finally {
                        setIsExporting(false);
                      }
                    }}
                    disabled={isExporting}
                    className="w-full p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-4 disabled:opacity-50"
                  >
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">PDF Document</p>
                      <p className="text-xs text-red-100">Best for sharing and printing</p>
                    </div>
                  </button>

                  {/* HTML Export */}
                  <button
                    onClick={() => {
                      if (!activeResume || !editorContent) {
                        showToast('No resume to export', 'error');
                        return;
                      }
                      exportToHTML({
                        title: activeResume.title,
                        content: editorContent,
                        fontFamily: formattingSettings.fontStyle,
                        fontSize: formattingSettings.fontSize,
                        lineSpacing: formattingSettings.lineSpacing,
                        accentColor: selectedColors.primary
                      });
                      showToast('HTML file downloaded', 'success');
                    }}
                    className="w-full p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all flex items-center gap-4"
                  >
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">HTML File</p>
                      <p className="text-xs text-orange-100">Editable web page format</p>
                    </div>
                  </button>

                  {/* Word/RTF Export */}
                  <button
                    onClick={() => {
                      if (!activeResume || !editorContent) {
                        showToast('No resume to export', 'error');
                        return;
                      }
                      exportToRTF({
                        title: activeResume.title,
                        content: editorContent,
                        fontFamily: formattingSettings.fontStyle
                      });
                      showToast('RTF file downloaded (opens in Word)', 'success');
                    }}
                    className="w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-4"
                  >
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">Word Document (RTF)</p>
                      <p className="text-xs text-blue-100">Editable in Microsoft Word</p>
                    </div>
                  </button>

                  {/* Plain Text Export */}
                  <button
                    onClick={() => {
                      if (!activeResume || !editorContent) {
                        showToast('No resume to export', 'error');
                        return;
                      }
                      exportToTXT({
                        title: activeResume.title,
                        content: editorContent
                      });
                      showToast('Text file downloaded', 'success');
                    }}
                    className="w-full p-4 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-xl hover:from-slate-600 hover:to-slate-700 transition-all flex items-center gap-4"
                  >
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">Plain Text</p>
                      <p className="text-xs text-slate-200">ATS-friendly text only</p>
                    </div>
                  </button>

                  {/* JSON Backup */}
                  <button
                    onClick={() => {
                      if (!activeResume || !editorContent) {
                        showToast('No resume to export', 'error');
                        return;
                      }
                      exportToJSON({
                        title: activeResume.title,
                        content: editorContent,
                        templateId: activeResume.templateId,
                        atsScore: activeResume.atsScore,
                        photoUrl: activeResume.photoUrl
                      });
                      showToast('Backup file downloaded', 'success');
                    }}
                    className="w-full p-4 border-2 border-dashed border-gray-300 text-slate-600 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center gap-4"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileJson className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">JSON Backup</p>
                      <p className="text-xs text-slate-400">Full data backup for import later</p>
                    </div>
                  </button>
                </div>
              )}

              {exportTab === 'share' && (
                <div className="space-y-6">
                  {/* Create Shareable Link */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200">
                    <h4 className="text-sm font-semibold text-slate-800 mb-3">Create Shareable Link</h4>
                    
                    {shareableLink ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={shareableLink.url}
                            readOnly
                            className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-slate-600"
                          />
                          <button
                            onClick={async () => {
                              const success = await copyToClipboard(shareableLink.url);
                              if (success) {
                                setCopiedLink(true);
                                setTimeout(() => setCopiedLink(false), 2000);
                                showToast('Link copied to clipboard!', 'success');
                              }
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              copiedLink ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                          >
                            {copiedLink ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                          </button>
                        </div>
                        
                        {/* QR Code */}
                        <div className="flex items-center gap-4 p-3 bg-white rounded-lg">
                          <img
                            src={generateQRCodeUrl(shareableLink.url, 100)}
                            alt="QR Code"
                            className="w-20 h-20 rounded"
                          />
                          <div>
                            <p className="text-sm font-medium text-slate-700">Scan QR Code</p>
                            <p className="text-xs text-slate-500 mt-1">
                              Share this QR code for easy access on mobile devices
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-xs text-slate-500">
                          Link expires in 30 days
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (!activeResume || !editorContent) {
                            showToast('No resume to share', 'error');
                            return;
                          }
                          const link = createShareableLink({
                            title: activeResume.title,
                            content: editorContent,
                            templateId: activeResume.templateId
                          });
                          setShareableLink(link);
                          setSharedLinks(getAllShareableLinks());
                          showToast('Shareable link created!', 'success');
                        }}
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Link2 className="w-4 h-4" />
                        Generate Shareable Link
                      </button>
                    )}
                  </div>

                  {/* Existing Shared Links */}
                  {sharedLinks.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 mb-3">Your Shared Links</h4>
                      <div className="space-y-2">
                        {sharedLinks.map((link) => (
                          <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-700 truncate">{link.title}</p>
                              <p className="text-xs text-slate-400">
                                Created {new Date(link.createdAt).toLocaleDateString()}
                                {link.expiresAt && ` • Expires ${new Date(link.expiresAt).toLocaleDateString()}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              <button
                                onClick={async () => {
                                  const url = `${window.location.origin}/dashboard/resume-studio?share=${link.id}`;
                                  await copyToClipboard(url);
                                  showToast('Link copied!', 'success');
                                }}
                                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                                title="Copy link"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  deleteShareableLink(link.id);
                                  setSharedLinks(getAllShareableLinks());
                                  showToast('Link deleted', 'success');
                                }}
                                className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                title="Delete link"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setShareableLink(null);
                  setExportTab('download');
                }}
                className="px-6 py-2 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      {showTemplatePreview && previewTemplateId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {getTemplateById(previewTemplateId)?.name}
                </h3>
                <p className="text-sm text-slate-500">
                  {getTemplateById(previewTemplateId)?.description}
                </p>
              </div>
              <button
                onClick={() => setShowTemplatePreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            {/* Template Preview */}
            <div className="flex-1 overflow-auto p-6 bg-gray-100">
              <div className="bg-white shadow-xl mx-auto" style={{ width: '210mm', minHeight: '297mm', transform: 'scale(0.6)', transformOrigin: 'top center' }}>
                {(() => {
                  const template = getTemplateById(previewTemplateId);
                  if (!template) return null;
                  
                  const isTwoCol = isTwoColumnTemplate(template);
                  const sampleData = {
                    name: 'Alex Johnson',
                    title: 'Senior Software Engineer',
                    email: 'alex.johnson@email.com',
                    phone: '(555) 123-4567',
                    location: 'San Francisco, CA',
                  };
                  
                  return (
                    <div style={{ fontFamily: template.styles.fontFamily, fontSize: template.styles.fontSize }} className={isTwoCol ? 'flex min-h-full' : ''}>
                      {/* Sidebar for two-column templates */}
                      {isTwoCol && template.layout === 'sidebar-left' && (
                        <div className={template.styles.sidebar}>
                          {template.supportsPhoto && (
                            <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-300 border-2 border-white/30"></div>
                          )}
                          <div className={template.styles.header}>
                            <h1 className={template.styles.headerName}>{sampleData.name}</h1>
                            <p className={template.styles.headerTitle}>{sampleData.title}</p>
                            <div className={template.styles.headerContact}>
                              <span className="block">{sampleData.email}</span>
                              <span className="block">{sampleData.phone}</span>
                            </div>
                          </div>
                          <div className="mt-6">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 mb-2">Skills</h3>
                            <div className="space-y-2 text-xs text-white/90">
                              <span className="block">• React & TypeScript</span>
                              <span className="block">• Node.js</span>
                              <span className="block">• AWS</span>
                              <span className="block">• Python</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Main Content */}
                      <div className={isTwoCol ? template.styles.mainContent : 'p-8'}>
                        {/* Header for single-column templates */}
                        {!isTwoCol && (
                          <div className={template.styles.header}>
                            {template.supportsPhoto && (
                              <div className={template.styles.photo || 'w-24 h-24 rounded-full mx-auto mb-4 bg-gray-300'}></div>
                            )}
                            <h1 className={template.styles.headerName}>{sampleData.name}</h1>
                            <p className={template.styles.headerTitle}>{sampleData.title}</p>
                            <div className={template.styles.headerContact}>
                              <span>{sampleData.email}</span>
                              <span>{sampleData.phone}</span>
                              <span>{sampleData.location}</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Content Sections */}
                        <div>
                          <h3 className={template.styles.sectionTitle}>Professional Summary</h3>
                          <p className={template.styles.sectionContent}>
                            Results-driven software engineer with 8+ years of experience building scalable web applications.
                            Passionate about clean code, system design, and mentoring junior developers.
                          </p>
                        </div>
                        
                        <div>
                          <h3 className={template.styles.sectionTitle}>Experience</h3>
                          <div className={template.styles.sectionContent}>
                            <p className="font-medium">Senior Software Engineer</p>
                            <p className="text-xs opacity-70">TechCorp Inc. | 2021 - Present</p>
                            <ul className="mt-2 space-y-1 text-sm">
                              <li>• Led development of microservices architecture</li>
                              <li>• Reduced deployment time by 70%</li>
                            </ul>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className={template.styles.sectionTitle}>Education</h3>
                          <div className={template.styles.sectionContent}>
                            <p className="font-medium">B.S. Computer Science</p>
                            <p className="text-xs opacity-70">UC Berkeley | 2018</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right Sidebar */}
                      {isTwoCol && template.layout === 'sidebar-right' && (
                        <div className={template.styles.sidebar}>
                          {template.supportsPhoto && (
                            <div className="w-full aspect-square bg-gray-300 mb-4"></div>
                          )}
                          <div className="text-xs text-white/80 space-y-1">
                            <span className="block">{sampleData.email}</span>
                            <span className="block">{sampleData.phone}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-4 text-sm text-slate-600">
                {getTemplateById(previewTemplateId)?.supportsPhoto && (
                  <span className="flex items-center gap-1">📷 Photo supported</span>
                )}
                <span className="flex items-center gap-1">
                  📐 {getTemplateById(previewTemplateId)?.layout === 'single-column' ? 'Single column' : 'Two columns'}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTemplatePreview(false)}
                  className="px-4 py-2 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleApplyTemplate(previewTemplateId);
                    setShowTemplatePreview(false);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Apply Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LinkedIn Import Modal */}
      {showLinkedInImport && linkedInProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
                <div>
                  <h3 className="text-xl font-bold text-white">Import from LinkedIn</h3>
                  <p className="text-blue-100 text-sm">Review and import your profile data</p>
                </div>
              </div>
              <button
                onClick={() => setShowLinkedInImport(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              {/* Profile Preview */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">{linkedInProfile.name}</h4>
                    <p className="text-slate-600">{linkedInProfile.headline}</p>
                    {linkedInProfile.location && (
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {linkedInProfile.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Summary */}
                {linkedInProfile.summary && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="text-sm font-semibold text-slate-700 mb-2">Summary</h5>
                    <p className="text-sm text-slate-600">{linkedInProfile.summary}</p>
                  </div>
                )}

                {/* Experience */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="text-sm font-semibold text-slate-700 mb-2">
                    Experience ({linkedInProfile.experience.length})
                  </h5>
                  <div className="space-y-2">
                    {linkedInProfile.experience.slice(0, 3).map((exp, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Briefcase className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">{exp.title}</p>
                          <p className="text-xs text-slate-500">{exp.company} • {exp.startDate} - {exp.endDate || 'Present'}</p>
                        </div>
                      </div>
                    ))}
                    {linkedInProfile.experience.length > 3 && (
                      <p className="text-xs text-slate-400">+{linkedInProfile.experience.length - 3} more positions</p>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="text-sm font-semibold text-slate-700 mb-2">
                    Skills ({linkedInProfile.skills.length})
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {linkedInProfile.skills.slice(0, 8).map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                    {linkedInProfile.skills.length > 8 && (
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                        +{linkedInProfile.skills.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-slate-500">
                This will create a new master resume from your LinkedIn data
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLinkedInImport(false)}
                  className="px-4 py-2 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyLinkedInProfile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Import to Resume Studio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tailor for Job Modal */}
      {showTailorForJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-500 to-teal-500">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-white" />
                <div>
                  <h3 className="text-xl font-bold text-white">Tailor Resume for Job</h3>
                  <p className="text-emerald-100 text-sm">Select a job from your tracker</p>
                </div>
              </div>
              <button
                onClick={() => { setShowTailorForJob(false); setTargetJob(null); }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              {trackedJobs.length === 0 && FeatureIntegration.getTrackedJobs().length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-slate-600 mb-2">No Tracked Jobs</h4>
                  <p className="text-sm text-slate-500 mb-4">Add jobs to your tracker first</p>
                  <button
                    onClick={() => navigate('/dashboard/job-tracker')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Go to Job Tracker
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 mb-4">
                    Select a job to create a tailored resume version:
                  </p>
                  {(trackedJobs.length > 0 ? trackedJobs : FeatureIntegration.getTrackedJobs()).map((job) => (
                    <button
                      key={job.id}
                      onClick={() => handleSelectJobForTailoring(job)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        targetJob?.id === job.id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-slate-800">{job.title}</h4>
                          <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                            <Building className="w-3 h-3" />
                            {job.company}
                            {job.location && (
                              <>
                                <span className="text-slate-300">•</span>
                                <MapPin className="w-3 h-3" />
                                {job.location}
                              </>
                            )}
                          </p>
                        </div>
                        {targetJob?.id === job.id && (
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-slate-500">
                {activeResume ? (
                  <span>Using: <strong>{activeResume.title}</strong> as base</span>
                ) : (
                  <span className="text-amber-600">⚠️ Select a base resume first</span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowTailorForJob(false); setTargetJob(null); }}
                  className="px-4 py-2 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTailoredResume}
                  disabled={!targetJob || !activeResume}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Tailored Resume
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link Insert Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-500">
              <div className="flex items-center gap-3">
                <LinkIcon className="w-6 h-6 text-white" />
                <h3 className="text-lg font-bold text-white">Insert Link</h3>
              </div>
              <button onClick={() => { setShowLinkModal(false); setLinkUrl(''); setLinkText(''); }} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Link Text (optional)</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Display text for the link"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">Leave empty to use selected text</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="px-2 py-1 bg-gray-100 rounded">Tip:</span>
                <span>Use "mailto:" prefix for email links</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={removeLink}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
              >
                Remove Link
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowLinkModal(false); setLinkUrl(''); setLinkText(''); }}
                  className="px-4 py-2 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmInsertLink}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Insert Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table Insert Modal */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-pink-500">
              <div className="flex items-center gap-3">
                <Table className="w-6 h-6 text-white" />
                <h3 className="text-lg font-bold text-white">Insert Table</h3>
              </div>
              <button onClick={() => setShowTableModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-sm text-slate-600">
                Tables are great for skills matrices, comparing experiences, or organizing information clearly.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Rows</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={tableRows}
                    onChange={(e) => setTableRows(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Columns</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableCols}
                    onChange={(e) => setTableCols(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Preview Grid */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Preview</label>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex flex-col gap-1">
                    {Array.from({ length: Math.min(tableRows, 5) }).map((_, i) => (
                      <div key={i} className="flex gap-1">
                        {Array.from({ length: Math.min(tableCols, 6) }).map((_, j) => (
                          <div
                            key={j}
                            className={`w-8 h-6 rounded ${i === 0 ? 'bg-purple-200' : 'bg-purple-100'} border border-purple-300`}
                          />
                        ))}
                        {tableCols > 6 && <span className="text-xs text-slate-400 self-center">...</span>}
                      </div>
                    ))}
                    {tableRows > 5 && <span className="text-xs text-slate-400">...</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{tableRows} × {tableCols} table</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                <p className="text-xs text-yellow-700">
                  First row will be styled as a header row
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowTableModal(false)}
                className="px-4 py-2 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={insertTable}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Insert Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-scaleIn">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-500">
              <div className="flex items-center gap-3">
                <History className="w-6 h-6 text-white" />
                <div>
                  <h3 className="text-lg font-bold text-white">Version History</h3>
                  <p className="text-indigo-100 text-sm">{getVersionsForResume().length} versions saved</p>
                </div>
              </div>
              <button onClick={() => setShowVersionHistory(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {getVersionsForResume().length === 0 ? (
                <div className="text-center py-12">
                  <GitBranch className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h4 className="text-lg font-semibold text-slate-700 mb-2">No versions yet</h4>
                  <p className="text-sm text-slate-500 mb-4">Versions are created automatically when you save, or manually using the snapshot button.</p>
                  <button
                    onClick={() => { createManualVersion('Initial version'); setShowVersionHistory(false); }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Create First Snapshot
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Current Version Indicator */}
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-green-700">Current Version</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">Your live resume content</p>
                  </div>
                  
                  {/* Version Timeline */}
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                    
                    {getVersionsForResume().map((version) => {
                      const diff = getVersionDiff(version.id);
                      const isSelected = selectedVersionId === version.id;
                      
                      return (
                        <div key={version.id} className="relative pl-10 pb-4">
                          {/* Timeline dot */}
                          <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 ${
                            isSelected ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-gray-300'
                          }`} />
                          
                          <div 
                            className={`p-3 rounded-lg border transition-all cursor-pointer ${
                              isSelected 
                                ? 'border-indigo-300 bg-indigo-50' 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedVersionId(isSelected ? null : version.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getChangeTypeIcon(version.changeType)}</span>
                                <div>
                                  <p className="text-sm font-medium text-slate-800">{version.label}</p>
                                  <p className="text-xs text-slate-500">{formatVersionDate(version.timestamp)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {version.atsScore && (
                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                    version.atsScore >= 80 ? 'bg-green-100 text-green-700' :
                                    version.atsScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {version.atsScore}%
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-xs text-slate-600 mt-1">{version.changeSummary}</p>
                            
                            {/* Expanded Details */}
                            {isSelected && (
                              <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                                {/* Diff Summary */}
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-green-600">+{diff.additions}</span>
                                  <span className="text-red-600">-{diff.deletions}</span>
                                  <span className="text-slate-400">words changed</span>
                                </div>
                                
                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); restoreVersion(version.id); }}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors"
                                  >
                                    <RotateCw className="w-3 h-3" />
                                    Restore
                                  </button>
                                  <button
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      setCompareVersionId(version.id);
                                      setShowVersionCompare(true);
                                    }}
                                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-slate-700 text-xs rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    <Diff className="w-3 h-3" />
                                    Compare
                                  </button>
                                  <button
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      const newLabel = prompt('Enter new label:', version.label);
                                      if (newLabel && newLabel.trim()) {
                                        renameVersion(version.id, newLabel.trim());
                                      }
                                    }}
                                    className="flex items-center gap-1 px-2 py-1.5 text-slate-600 text-xs rounded-lg hover:bg-gray-100 transition-colors"
                                    title="Rename version"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); deleteVersion(version.id); }}
                                    className="flex items-center gap-1 px-2 py-1.5 text-red-600 text-xs rounded-lg hover:bg-red-50 transition-colors"
                                    title="Delete version"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Versions are auto-saved when you save your resume
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => createManualVersion()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <GitBranch className="w-4 h-4" />
                  Create Snapshot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Version Compare Modal */}
      {showVersionCompare && compareVersionId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-pink-500">
              <div className="flex items-center gap-3">
                <Diff className="w-6 h-6 text-white" />
                <div>
                  <h3 className="text-lg font-bold text-white">Compare Versions</h3>
                  <p className="text-orange-100 text-sm">See what changed between versions</p>
                </div>
              </div>
              <button onClick={() => { setShowVersionCompare(false); setCompareVersionId(null); }} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden flex">
              {/* Old Version */}
              <div className="flex-1 border-r border-gray-200 flex flex-col">
                <div className="p-3 bg-red-50 border-b border-red-100">
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-medium text-sm">
                      {versions.find(v => v.id === compareVersionId)?.label || 'Selected Version'}
                    </span>
                    <span className="text-xs text-red-400">
                      {formatVersionDate(versions.find(v => v.id === compareVersionId)?.timestamp || '')}
                    </span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div 
                    className="prose prose-sm max-w-none text-slate-600"
                    dangerouslySetInnerHTML={{ 
                      __html: versions.find(v => v.id === compareVersionId)?.content || '' 
                    }}
                  />
                </div>
              </div>
              
              {/* New Version (Current) */}
              <div className="flex-1 flex flex-col">
                <div className="p-3 bg-green-50 border-b border-green-100">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-medium text-sm">Current Version</span>
                    <span className="text-xs text-green-400">Now</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div 
                    className="prose prose-sm max-w-none text-slate-600"
                    dangerouslySetInnerHTML={{ __html: editorContent }}
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {(() => {
                  const diff = getVersionDiff(compareVersionId);
                  return (
                    <>
                      <span className="text-sm text-green-600 font-medium">+{diff.additions} added</span>
                      <span className="text-sm text-red-600 font-medium">-{diff.deletions} removed</span>
                    </>
                  );
                })()}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowVersionCompare(false); setCompareVersionId(null); }}
                  className="px-4 py-2 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => { restoreVersion(compareVersionId); setShowVersionCompare(false); setCompareVersionId(null); }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <RotateCw className="w-4 h-4" />
                  Restore This Version
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments Panel Modal */}
      {showCommentsPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col animate-scaleIn">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-cyan-500">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-white" />
                <div>
                  <h3 className="text-lg font-bold text-white">Comments & Feedback</h3>
                  <p className="text-blue-100 text-sm">{getCommentsForResume().length} comments</p>
                </div>
              </div>
              <button onClick={() => setShowCommentsPanel(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* User Profile Setup */}
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => saveUserProfile(e.target.value, userEmail)}
                  placeholder="Your name"
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => saveUserProfile(userName, e.target.value)}
                  placeholder="Email (optional)"
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Add Comment */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex gap-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment or feedback..."
                  rows={2}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => addComment(newComment)}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {getCommentsForResume().length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-slate-500">No comments yet</p>
                  <p className="text-xs text-slate-400">Add feedback or notes about your resume</p>
                </div>
              ) : (
                getCommentsForResume().map((comment) => (
                  <div 
                    key={comment.id} 
                    className={`p-3 rounded-lg border ${
                      comment.resolved ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                          {comment.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{comment.author}</p>
                          <p className="text-xs text-slate-400">{formatVersionDate(comment.timestamp)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!comment.resolved && (
                          <button
                            onClick={() => resolveComment(comment.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Mark resolved"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteComment(comment.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="mt-2 text-sm text-slate-600">{comment.content}</p>
                    
                    {comment.section && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded">
                        📍 {comment.section}
                      </span>
                    )}
                    
                    {comment.resolved && (
                      <span className="inline-block mt-2 ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                        ✓ Resolved
                      </span>
                    )}
                    
                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="text-sm">
                            <span className="font-medium text-slate-700">{reply.author}</span>
                            <span className="text-slate-400 text-xs ml-2">{formatVersionDate(reply.timestamp)}</span>
                            <p className="text-slate-600 mt-0.5">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Reply Input */}
                    {!comment.resolved && (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          placeholder="Reply..."
                          className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              addReply(comment.id, e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        <button className="text-xs text-blue-600 hover:text-blue-700">
                          <Reply className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Request Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col animate-scaleIn">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-pink-500">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-white" />
                <div>
                  <h3 className="text-lg font-bold text-white">Request Feedback</h3>
                  <p className="text-purple-100 text-sm">Get a professional review</p>
                </div>
              </div>
              <button onClick={() => setShowReviewModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Request Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reviewer Name</label>
                  <input
                    type="text"
                    value={newReviewName}
                    onChange={(e) => setNewReviewName(e.target.value)}
                    placeholder="e.g., John Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reviewer Email</label>
                  <input
                    type="email"
                    value={newReviewEmail}
                    onChange={(e) => setNewReviewEmail(e.target.value)}
                    placeholder="reviewer@email.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Message (Optional)</label>
                  <textarea
                    value={newReviewMessage}
                    onChange={(e) => setNewReviewMessage(e.target.value)}
                    placeholder="Any specific areas you'd like feedback on?"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={sendReviewRequest}
                  disabled={!newReviewName.trim() || !newReviewEmail.trim()}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Review Request
                </button>
              </div>
              
              {/* Existing Reviews */}
              {getReviewsForResume().length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Previous Requests</h4>
                  <div className="space-y-2">
                    {getReviewsForResume().map((review) => (
                      <div key={review.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                              {review.reviewerName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-700">{review.reviewerName}</p>
                              <p className="text-xs text-slate-400">{review.reviewerEmail}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-xs rounded ${
                              review.status === 'completed' ? 'bg-green-100 text-green-700' :
                              review.status === 'in-review' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-200 text-gray-600'
                            }`}>
                              {review.status === 'completed' ? '✓ Complete' :
                               review.status === 'in-review' ? '👀 In Review' :
                               '⏳ Pending'}
                            </span>
                            <button
                              onClick={() => deleteReviewRequest(review.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{formatVersionDate(review.createdAt)}</p>
                        {review.feedback && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                            <p className="font-medium text-xs text-green-600 mb-1">Feedback:</p>
                            {review.feedback}
                          </div>
                        )}
                        {review.status !== 'completed' && (
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => updateReviewStatus(review.id, 'in-review')}
                              className="text-xs text-yellow-600 hover:text-yellow-700"
                            >
                              Mark In Review
                            </button>
                            <button
                              onClick={() => {
                                const feedback = prompt('Enter feedback:');
                                if (feedback) {
                                  updateReviewStatus(review.id, 'completed', feedback);
                                }
                              }}
                              className="text-xs text-green-600 hover:text-green-700"
                            >
                              Add Feedback
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-lg shadow-xl transition-all transform ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : toast.type === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center gap-3">
            {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Word/Character Count Footer */}
      {activeResume && (
        <div className={`fixed bottom-0 left-0 right-0 px-4 py-2 text-xs flex items-center justify-center gap-4 z-30 ${
          isDarkMode ? 'bg-slate-800/90 text-slate-400' : 'bg-white/90 text-slate-500'
        } backdrop-blur-sm border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <span>{wordCount.toLocaleString()} words</span>
          <span>•</span>
          <span>{charCount.toLocaleString()} characters</span>
          <span>•</span>
          <span>ATS: {activeResume.atsScore}%</span>
          {autoSaveEnabled && (
            <>
              <span>•</span>
              <span className="text-green-500">Auto-save on</span>
            </>
          )}
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
}