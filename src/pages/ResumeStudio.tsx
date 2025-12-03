import React, { useState, useRef } from 'react';

// --- Mock Lucide Icons ---
const createIcon = (svgContent: string) => ({ className }: { className?: string }) => (
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

const icons = {
    FileText: createIcon(`<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />`),
    Upload: createIcon(`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />`),
    Plus: createIcon(`<line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />`),
    AlertCircle: createIcon(`<circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />`),
    CheckCircle: createIcon(`<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />`),
    RefreshCw: createIcon(`<polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L20.49 9" /><path d="M20.49 15a9 9 0 0 1-14.85 3.36L3.51 15" />`),
    ArrowRight: createIcon(`<line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />`),
    Star: createIcon(`<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />`),
    Target: createIcon(`<circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />`),
    Brain: createIcon(`<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v1.2a1 1 0 0 0 1 1h.3a1 1 0 0 0 .9-.6 2.5 2.5 0 0 1 2.4-1.9 2.5 2.5 0 0 1 2.5 2.5v1.3a1 1 0 0 0 1 1h.1a1 1 0 0 0 1-1V10a2.5 2.5 0 0 1 2.5-2.5 2.5 2.5 0 0 1 0 5A2.5 2.5 0 0 1 20 15v.2a1 1 0 0 0 1 1h.1a1 1 0 0 0 1-1V14a2.5 2.5 0 0 1 2.5-2.5 2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 1-2.5-2.5v-1.3a1 1 0 0 0-1-1h-.3a1 1 0 0 0-.9.6 2.5 2.5 0 0 1-2.4 1.9A2.5 2.5 0 0 1 12 15.5v-1.2a1 1 0 0 0-1-1h-.1a1 1 0 0 0-1 1V16a2.5 2.5 0 0 1-2.5 2.5 2.5 2.5 0 0 1 0-5A2.5 2.5 0 0 1 8 11v-.2a1 1 0 0 0-1-1h-.1a1 1 0 0 0-1 1V12a2.5 2.5 0 0 1-2.5 2.5 2.5 2.5 0 0 1 0-5A2.5 2.5 0 0 1 4 7V5.7a1 1 0 0 0-1-1h-.3a1 1 0 0 0-.9.6 2.5 2.5 0 0 1-2.4 1.9A2.5 2.5 0 0 1 0 4.5 2.5 2.5 0 0 1 2.5 2h.1A2.5 2.5 0 0 1 5 4.5v1.2a1 1 0 0 0 1 1h.3a1 1 0 0 0 .9-.6A2.5 2.5 0 0 1 9.5 4.2V2.5A2.5 2.5 0 0 1 9.5 2z" /><path d="M12 13a2.5 2.5 0 0 0-2.5 2.5v.2a1 1 0 0 1-1 1h-.1a1 1 0 0 1-1-1V16a2.5 2.5 0 0 0-5 0v.2a1 1 0 0 1-1 1h-.1a1 1 0 0 1-1-1V16a2.5 2.5 0 0 0-5 0v.2a1 1 0 0 1-1 1h-.1a1 1 0 0 1-1-1V16a2.5 2.5 0 0 0-2.5-2.5 2.5 2.5 0 0 0 0 5 2.5 2.5 0 0 0 2.5-2.5v-.2a1 1 0 0 1 1-1h.1a1 1 0 0 1 1 1V18a2.5 2.5 0 0 0 5 0v-.2a1 1 0 0 1 1-1h.1a1 1 0 0 1 1 1V18a2.5 2.5 0 0 0 5 0v-.2a1 1 0 0 1 1-1h.1a1 1 0 0 1 1 1V18a2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 0-2.5 2.5v.2a1 1 0 0 1-1 1h-.1a1 1 0 0 1-1-1V16a2.5 2.5 0 0 0-2.5-2.5z" />`),
    Shield: createIcon(`<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />`),
    TrendingUp: createIcon(`<polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />`),
    Clock: createIcon(`<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />`),
    Sparkles: createIcon(`<path d="m12 3-1.9 1.9-3.2.9 1 3.1-.9 3.2 3.1 1 1.9 1.9 1.9-1.9 3.1-1-.9-3.2 1-3.1-3.2-.9z" /><path d="M5 22s1.5-2 4-2" /><path d="m19 22-4-2" /><path d="M22 5s-2-1.5-2-4" /><path d="m2 5 2-4" />`),
    Zap: createIcon(`<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />`),
    Download: createIcon(`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />`),
    Save: createIcon(`<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />`),
    Eye: createIcon(`<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />`),
    RotateCcw: createIcon(`<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />`),
    X: createIcon(`<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />`),
    List: createIcon(`<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>`),
    ListOrdered: createIcon(`<line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>`),
    Indent: createIcon(`<polyline points="21 12 15 6 21 18 15 12"/><line x1="3" x2="15" y1="6" y2="6"/><line x1="3" x2="15" y1="18" y2="18"/><line x1="3" x2="21" y1="12" y2="12"/>`),
    Outdent: createIcon(`<polyline points="3 12 9 6 3 18 9 12"/><line x1="21" x2="9" y1="6" y2="6"/><line x1="21" x2="9" y1="18" y2="18"/><line x1="21" x2="3" y1="12" y2="12"/>`),
    AlignCenter: createIcon(`<line x1="18" x2="6" y1="10" y2="10"/><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="14" y2="14"/><line x1="18" x2="6" y1="18" y2="18"/>`),
    AlignLeft: createIcon(`<line x1="17" x2="3" y1="10" y2="10"/><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="14" y2="14"/><line x1="17" x2="3" y1="18" y2="18"/>`),
    AlignRight: createIcon(`<line x1="21" x2="7" y1="10" y2="10"/><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="14" y2="14"/><line x1="21" x2="7" y1="18" y2="18"/>`),
    Bold: createIcon(`<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>`),
    Italic: createIcon(`<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>`),
    Underline: createIcon(`<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>`),
    Link: createIcon(`<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/>`),
    Phone: createIcon(`<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>`),
    Mail: createIcon(`<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>`),
    MapPin: createIcon(`<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`),
    Minus: createIcon(`<line x1="5" y1="12" x2="19" y2="12"/>`),
    Calendar: createIcon(`<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" y2="6"/><line x1="8" y1="2" y2="6"/><line x1="3" y1="10" y2="10"/>`),
};

const { FileText, Upload, Plus, AlertCircle, CheckCircle, ArrowRight, Target, Brain, Shield, TrendingUp, Clock, Sparkles, Download, Save, Eye, RotateCcw, X, List, ListOrdered, Indent, Outdent, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Link, Phone, Minus, Calendar } = icons;

// --- Mock Custom Hook ---
const useTheme = () => {
    // In a real app, this would have logic to switch themes.
    // For this preview, we'll stick to a dark theme as the UI is designed for it.
    return { theme: 'dark' };
};

// --- Type Definitions ---
interface Resume {
    id: string;
    title: string;
    type: 'master' | 'campaign';
    content: string;
    atsScore: number;
    createdAt: string;
    updatedAt: string;
}

interface FormattingSettings {
    alignment: string;
    fontWeight: string;
    isItalic: boolean;
    isUnderline: boolean;
    bulletStyle: string;
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

interface ColorPalette {
    primary: string;
    secondary: string;
    accent: string;
}

// --- Mock Child Components ---

// Mock for AICopilot.js
interface AICopilotProps {
    activeResume: Resume | null;
    selectedText: string;
    aiProcessing: boolean;
    onATSOptimization: () => void;
    onEnhanceText: () => void;
    onGapJustification: () => void;
}

const AICopilot: React.FC<AICopilotProps> = ({ activeResume, selectedText, aiProcessing, onATSOptimization, onEnhanceText, onGapJustification }) => {
    return (
        <div className="space-y-4">
            <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-3">AI Copilot</h4>
                {activeResume ? (
                    <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600">
                        <p><span className="font-semibold text-slate-800">ATS Score:</span> {activeResume.atsScore}%</p>
                        <p className="mt-1">AI suggestions will appear here based on your resume content.</p>
                    </div>
                ) : (
                    <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500">
                        Select a resume to activate AI Copilot.
                    </div>
                )}
            </div>
            
            <div className="space-y-2">
                <button
                    onClick={onATSOptimization}
                    disabled={!activeResume || aiProcessing}
                    className="w-full flex items-center gap-3 p-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Shield className="w-5 h-5 text-blue-500" />
                    <div>
                        <p className="text-sm font-medium text-slate-800 text-left">ATS Optimization</p>
                        <p className="text-xs text-slate-500 text-left">Improve your score against tracking systems.</p>
                    </div>
                </button>
                <button
                    onClick={onEnhanceText}
                    disabled={!selectedText || aiProcessing}
                    className="w-full flex items-center gap-3 p-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    <div>
                        <p className="text-sm font-medium text-slate-800 text-left">Enhance Selected Text</p>
                        <p className="text-xs text-slate-500 text-left">Rewrite text for more impact. Select text to enable.</p>
                    </div>
                </button>
                <button
                    onClick={onGapJustification}
                    disabled={!activeResume || aiProcessing}
                    className="w-full flex items-center gap-3 p-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Clock className="w-5 h-5 text-orange-500" />
                    <div>
                        <p className="text-sm font-medium text-slate-800 text-left">Gap Justification</p>
                        <p className="text-xs text-slate-500 text-left">Get help explaining career gaps.</p>
                    </div>
                </button>
                {aiProcessing && <p className="text-sm text-center text-indigo-600 animate-pulse">AI is working...</p>}
            </div>
        </div>
    );
};

// Mock for ResumePreview.js
interface ResumePreviewProps {
    content: string;
    templateId: string;
    colors: ColorPalette;
    formatting: FormattingSettings;
    activeSections: string[];
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ content, colors, formatting }) => {
    const previewRef = useRef<HTMLDivElement>(null);

    // Simple parser to style the resume content
    const renderContent = (text: string) => {
        if (!text) return null;
        const lines = text.split('\n');
        return lines.map((line, index) => {
            const isHeading = /^[A-Z\s]+$/.test(line.trim()) && line.trim().length > 3 && line.trim().length < 30;
            const isListItem = line.trim().startsWith('•');

            const style: React.CSSProperties = {};
            if (isHeading) {
                style.fontSize = `${formatting.headingSize}pt`;
                style.fontWeight = 'bold';
                style.color = colors.primary;
                style.marginTop = `${formatting.sectionSpacing}px`;
                style.marginBottom = `${formatting.paragraphSpacing / 2}px`;
            } else if (isListItem) {
                style.marginLeft = `${formatting.paragraphIndent}px`;
            }

            return <div key={index} style={style}>{line}</div>;
        });
    };

    const pageStyle: React.CSSProperties = {
        fontFamily: formatting.fontStyle,
        fontSize: `${formatting.fontSize}pt`,
        lineHeight: formatting.lineSpacing,
        padding: `${formatting.topBottomMargin}mm ${formatting.sideMargins}mm`,
        color: '#333',
    };
    
    return (
        <div className="w-full h-full bg-transparent p-8 overflow-y-auto">
            <div 
                ref={previewRef}
                className="w-[210mm] min-h-[297mm] bg-white shadow-2xl mx-auto resume-content-view"
                style={pageStyle}
            >
                {renderContent(content)}
            </div>
        </div>
    );
};

// Mock for ResumeListViewer.js
interface ResumeListViewerProps {
    resumes: Resume[];
    onSelectResume: (id: string) => void;
}

const ResumeListViewer: React.FC<ResumeListViewerProps> = ({ resumes, onSelectResume }) => {
    return (
        <div className="p-8 text-slate-800 h-full overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Resume Library</h2>
            {resumes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resumes.map(resume => (
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
                <div className="text-center py-16">
                    <FileText className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700">No Resumes Yet</h3>
                    <p className="text-slate-500 mt-2">Create or import a resume to get started.</p>
                </div>
            )}
        </div>
    );
};

// --- Main ResumeStudio Component ---
export default function ResumeStudio() {
    useTheme(); // Even though it's mocked, we call it to maintain structure
    const [step, setStep] = useState<'selection' | 'upload' | 'studio'>('selection');
    const [, setUploadError] = useState('');
    const [, setIsProcessing] = useState(false);
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [, setActiveResumeId] = useState<string | null>(null);
    const [activeResume, setActiveResume] = useState<Resume | null>(null);
    const [editorContent, setEditorContent] = useState('');
    const [viewMode, setViewMode] = useState<'edit' | 'manage'>('edit');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState('classic-1');
    const [selectedColors, setSelectedColors] = useState<ColorPalette>({
        primary: '#3B82F6',
        secondary: '#64748B',
        accent: '#8B5CF6'
    });
    const [formattingSettings, setFormattingSettings] = useState<FormattingSettings>({
        alignment: 'left',
        fontWeight: 'regular',
        isItalic: false,
        isUnderline: false,
        bulletStyle: 'disc', // disc, circle, square
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
        'Heading',
        'Profile',
        'Core Skills',
        'Experience',
        'Education'
    ]);
    const [undoHistory, setUndoHistory] = useState<string[]>([]);
    const [historyPointer, setHistoryPointer] = useState(-1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [newResumeTitle, setNewResumeTitle] = useState('');
    const [newResumeType] = useState<'master' | 'campaign'>('campaign');
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importStatus, setImportStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
    const [importError, setImportError] = useState('');
    const [activeTab, setActiveTab] = useState('design');
    const [templateCategory, setTemplateCategory] = useState('all');
    const [selectedText] = useState('');
    const [aiProcessing, setAiProcessing] = useState(false);

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
• Integrated third-party APIs and payment processing systems
• Participated in agile development cycles and sprint planning


EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2016-2020


CERTIFICATIONS
• AWS Certified Solutions Architect
• Certified Scrum Master (CSM)`;

    const handleStartFromScratch = () => {
        const emptyResume: Resume = {
            id: 'new-cv-' + Date.now(),
            title: 'New Resume',
            type: 'master',
            content: `[YOUR NAME]\n[Your Title/Position]\n[Your Email] | [Your Phone] | [Your LinkedIn]\n\nPROFESSIONAL SUMMARY\n[Write a compelling summary of your professional background and key achievements]\n\nCORE SKILLS\n• [Skill 1]\n• [Skill 2]\n• [Skill 3]\n\nEXPERIENCE\n[Job Title] | [Company Name] | [Start Date - End Date]\n• [Achievement or responsibility]\n• [Achievement or responsibility]\n• [Achievement or responsibility]\n\nEDUCATION\n[Degree] in [Field of Study]\n[University Name] | [Graduation Year]`,
            atsScore: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        setResumes([emptyResume]);
        setActiveResumeId(emptyResume.id);
        setActiveResume(emptyResume);
        setEditorContent(emptyResume.content);
        setUndoHistory([emptyResume.content]);
        setHistoryPointer(0);
        setStep('studio');
    };
    
    const processImportedFile = async (file: File | null) => {
        if (!file) {
            setImportError('No file selected for processing.');
            setImportStatus('error');
            return;
        }
        setIsProcessing(true);
        setImportStatus('processing');
        try {
            // Simulate file processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const newResume: Resume = {
                id: Date.now().toString(),
                title: file.name.replace(/\.[^/.]+$/, ''),
                type: 'master',
                content: mockUserCV,
                atsScore: 75,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            setResumes(prev => [...prev, newResume]);
            setActiveResumeId(newResume.id);
            setActiveResume(newResume);
            setEditorContent(newResume.content);
            setUndoHistory([newResume.content]);
            setHistoryPointer(0);
            setStep('studio');
            setShowImportModal(false);
            setImportFile(null);
            setImportStatus('idle');
        } catch {
            setUploadError('Failed to process the uploaded file');
            setImportError('Failed to process the uploaded file');
            setImportStatus('error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleResumeSelect = (resumeId: string) => {
        const resume = resumes.find(r => r.id === resumeId);
        if (resume) {
            setActiveResumeId(resumeId);
            setActiveResume(resume);
            setEditorContent(resume.content);
            setUndoHistory([resume.content]);
            setHistoryPointer(0);
            setViewMode('edit');
        }
    };

    // Reserved for future use when text editing is implemented
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _handleContentChange = (newContent: string) => {
        if (newContent !== editorContent) {
            const newHistory = undoHistory.slice(0, historyPointer + 1);
            newHistory.push(newContent);
            setUndoHistory(newHistory);
            setHistoryPointer(newHistory.length - 1);
            setEditorContent(newContent);
        }
    };

    const handleUndo = () => {
        if (historyPointer > 0) {
            const newPointer = historyPointer - 1;
            setHistoryPointer(newPointer);
            setEditorContent(undoHistory[newPointer]);
        }
    };

    const handleSave = async () => {
        if (activeResume) {
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const updatedResumes = resumes.map(r => 
                r.id === activeResume.id 
                    ? { ...r, content: editorContent, updatedAt: new Date().toISOString() }
                    : r
            );
            setResumes(updatedResumes);
            setActiveResume({ ...activeResume, content: editorContent, updatedAt: new Date().toISOString() });
            setIsLoading(false);
        }
    };

    const createNewResume = async () => {
        if (!newResumeTitle.trim()) return;
        
        const newResume: Resume = {
            id: Date.now().toString(),
            title: newResumeTitle,
            type: newResumeType,
            content: newResumeType === 'master' ? 'Start your master resume here.' : (resumes.find(r => r.type === 'master')?.content || 'Start your campaign resume here.'),
            atsScore: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        setResumes([...resumes, newResume]);
        setActiveResumeId(newResume.id);
        setActiveResume(newResume);
        setEditorContent(newResume.content);
        setUndoHistory([newResume.content]);
        setHistoryPointer(0);
        setShowCreateModal(false);
        setNewResumeTitle('');
        setViewMode('edit');
        setStep('studio');
    };

    const handleFileSelectForImportModal = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const allowedTypes = [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/msword',
                'text/plain'
            ];
            
            if (!allowedTypes.includes(file.type)) {
                setImportError('Please select a valid file type (PDF, DOCX, DOC, or TXT)');
                return;
            }
            
            if (file.size > 10 * 1024 * 1024) { // 10MB
                setImportError('File size must be less than 10MB');
                return;
            }
            
            setImportFile(file);
            setImportError('');
        }
    };

    const handleAddSection = (sectionName: string) => {
        if (!activeSections.includes(sectionName)) {
            setActiveSections([...activeSections, sectionName]);
        }
    };

    const handleDeleteSection = (sectionName: string) => {
        setActiveSections(activeSections.filter(section => section !== sectionName));
    };

    const handleATSOptimization = async () => {
        setAiProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (activeResume) {
            const newScore = Math.min(100, activeResume.atsScore + 10);
            const updatedResumes = resumes.map(r => 
                r.id === activeResume.id 
                    ? { ...r, atsScore: newScore }
                    : r
            );
            setResumes(updatedResumes);
            setActiveResume({ ...activeResume, atsScore: newScore });
        }
        setAiProcessing(false);
    };

    const handleEnhanceText = async () => {
        setAiProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        // In a real app, you would call an API and replace the selected text.
        setAiProcessing(false);
    };

    const handleGapJustification = async () => {
        setAiProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        // In a real app, this would open a modal or add text to the editor.
        setAiProcessing(false);
    };
    
    // Reserved for future use in import status display
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _getStatusIcon = () => {
        switch (importStatus) {
            case 'uploading': return <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
            case 'processing': return <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />;
            case 'success': return <CheckCircle className="w-6 h-6 text-green-500" />;
            case 'error': return <AlertCircle className="w-6 h-6 text-red-500" />;
            default: return <FileText className="w-6 h-6 text-blue-500" />;
        }
    };

    // Reserved for future use in import status display
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _getStatusText = () => {
        switch (importStatus) {
            case 'uploading': return 'Uploading file...';
            case 'processing': return 'Processing resume content...';
            case 'success': return 'Resume imported successfully!';
            case 'error': return 'Import failed';
            default: return 'Select a file to import';
        }
    };

    const colorPalettes = [
        { name: 'Blue', primary: '#3B82F6', secondary: '#64748B', accent: '#8B5CF6' },
        { name: 'Green', primary: '#10B981', secondary: '#64748B', accent: '#F59E0B' },
        { name: 'Purple', primary: '#8B5CF6', secondary: '#64748B', accent: '#EF4444' },
        { name: 'Orange', primary: '#F97316', secondary: '#64748B', accent: '#06B6D4' },
        { name: 'Red', primary: '#EF4444', secondary: '#64748B', accent: '#10B981' },
        { name: 'Teal', primary: '#14B8A6', secondary: '#64748B', accent: '#F59E0B' },
        { name: 'Indigo', primary: '#6366F1', secondary: '#64748B', accent: '#EC4899' },
        { name: 'Gray', primary: '#6B7280', secondary: '#9CA3AF', accent: '#3B82F6' }
    ];

    const templates = [
        { id: 'classic-1', name: 'Professional Classic', category: 'classic', preview: 'bg-white border-2 border-gray-300', description: 'Traditional professional layout' },
        { id: 'modern-1', name: 'Tech Modern', category: 'modern', preview: 'bg-gradient-to-br from-indigo-500 to-purple-600', description: 'Technology industry modern' },
        { id: 'photo-1', name: 'Professional Photo', category: 'photo', preview: 'bg-gradient-to-r from-blue-100 to-blue-200 border-2 border-blue-300', description: 'Photo-centric professional' },
        { id: 'classic-2', name: 'Executive Classic', category: 'classic', preview: 'bg-gray-50 border-2 border-gray-400', description: 'Executive-level traditional' },
        { id: 'modern-2', name: 'Creative Modern', category: 'modern', preview: 'bg-gradient-to-br from-pink-500 to-rose-600', description: 'Creative and bold design' },
        { id: 'photo-2', name: 'Creative Photo', category: 'photo', preview: 'bg-gradient-to-r from-purple-100 to-pink-200 border-2 border-purple-300', description: 'Creative industries focused' },
    ];

    const availableSections = ['Heading', 'Profile', 'Core Skills', 'Experience', 'Education', 'Projects', 'Certifications', 'Languages', 'References', 'Custom Section'];
    const fontStyles = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Source Sans Pro', 'Century Gothic'];
    const filteredTemplates = templateCategory === 'all' ? templates : templates.filter(t => t.category === templateCategory);

    const updateFormatting = (key: keyof FormattingSettings, value: string | number | boolean) => {
        setFormattingSettings(prev => ({ ...prev, [key]: value }));
    };

    if (step === 'selection') {
        return (
            <div className={`p-6 lg:p-8 w-full h-screen mx-auto bg-[#dee5fb] text-slate-800 overflow-y-auto`}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <div className="rounded-2xl p-8 border text-center hover:transform hover:scale-105 transition-all duration-300 cursor-pointer bg-white/50 backdrop-blur-xl border-white/30 hover:border-indigo-300" onClick={() => setShowImportModal(true)}>
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Upload className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4 text-slate-900">Choose your CV/Resume</h2>
                        <p className="text-lg mb-6 text-slate-600">Load your existing CV and format it with our professional templates and AI optimization</p>
                        <div className="space-y-3 text-sm text-slate-500">
                            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /><span>Upload PDF, DOCX, DOC, or TXT</span></div>
                            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /><span>AI content extraction and formatting</span></div>
                            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /><span>Professional template application</span></div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setShowImportModal(true); }} className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center gap-2 mx-auto">Select Files <ArrowRight className="w-5 h-5" /></button>
                    </div>
                    <div className="rounded-2xl p-8 border text-center hover:transform hover:scale-105 transition-all duration-300 cursor-pointer bg-white/50 backdrop-blur-xl border-white/30 hover:border-green-300" onClick={handleStartFromScratch}>
                        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Plus className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4 text-slate-900">Start from Scratch</h2>
                        <p className="text-lg mb-6 text-slate-600">Create a new resume from scratch with AI guidance and professional templates</p>
                        <div className="space-y-3 text-sm text-slate-500">
                            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /><span>AI-powered content suggestions</span></div>
                            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /><span>Step-by-step guidance</span></div>
                            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /><span>Professional formatting</span></div>
                        </div>
                        <button className="mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 flex items-center gap-2 mx-auto">Create New CV<ArrowRight className="w-5 h-5" /></button>
                    </div>
                </div>
                {/* Features Overview */}
                <div className="mt-16 max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-8 text-slate-900">
                        What You'll Get with Smart Resume Studio
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-6 rounded-xl border bg-white/50 backdrop-blur-xl border-white/30">
                            <Shield className="w-8 h-8 text-blue-500 mb-4" />
                            <h4 className="font-semibold mb-2 text-slate-800">ATS Optimization</h4>
                            <p className="text-sm text-slate-600">Beat applicant tracking systems with AI-powered formatting</p>
                        </div>
                        <div className="p-6 rounded-xl border bg-white/50 backdrop-blur-xl border-white/30">
                            <TrendingUp className="w-8 h-8 text-green-500 mb-4" />
                            <h4 className="font-semibold mb-2 text-slate-800">Impact Enhancement</h4>
                            <p className="text-sm text-slate-600">Transform job duties into quantifiable achievements</p>
                        </div>
                        <div className="p-6 rounded-xl border bg-white/50 backdrop-blur-xl border-white/30">
                            <Target className="w-8 h-8 text-purple-500 mb-4" />
                            <h4 className="font-semibold mb-2 text-slate-800">Job Targeting</h4>
                            <p className="text-sm text-slate-600">Create tailored resumes for specific opportunities</p>
                        </div>
                        <div className="p-6 rounded-xl border bg-white/50 backdrop-blur-xl border-white/30">
                            <Brain className="w-8 h-8 text-orange-500 mb-4" />
                            <h4 className="font-semibold mb-2 text-slate-800">AI Copilot</h4>
                            <p className="text-sm text-slate-600">Get intelligent suggestions and gap justification</p>
                        </div>
                    </div>
                </div>
                {/* Import Modal */}
                {showImportModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                        <div className="w-full max-w-2xl rounded-2xl border bg-slate-800 border-slate-700">
                            <div className="flex items-center justify-between p-6 border-b border-slate-700">
                                <h3 className="text-xl font-semibold text-white">Import Resume</h3>
                                <button onClick={() => setShowImportModal(false)} className="p-2 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-700"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="p-6">
                                {(importStatus === 'idle' || importStatus === 'error') && (
                                    <div>
                                        <div className="border-2 border-dashed rounded-xl p-8 text-center transition-colors border-slate-600 hover:border-slate-500">
                                            <input type="file" accept=".pdf,.docx,.doc,.txt" onChange={handleFileSelectForImportModal} className="hidden" id="resume-file-input" />
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                                                    <Upload className="w-8 h-8 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-medium mb-2 text-white">{importFile ? importFile.name : 'Choose your resume file'}</h4>
                                                    <p className="text-sm text-slate-400">PDF, DOCX, DOC, or TXT (Max 10MB)</p>
                                                </div>
                                                <label htmlFor="resume-file-input" className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 cursor-pointer">Select File</label>
                                            </div>
                                        </div>
                                        {importError && (
                                            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                                    <p className="text-red-400 text-sm">{importError}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setShowImportModal(false)} className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:border-slate-500 transition-colors">Cancel</button>
                                    <button onClick={() => processImportedFile(importFile)} disabled={!importFile} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">Import Resume</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (step === 'studio') {
        return (
            <div className="flex h-full bg-[#dee5fb] rounded-2xl overflow-hidden">
                <div className="w-96 bg-[#eff2fd] flex-shrink-0">
                    <div className="flex flex-col h-full">
                        <div className="p-4">
                            <div className="grid grid-cols-2 gap-1 bg-slate-200 rounded-lg p-1 mt-4">
                                <button onClick={() => setActiveTab('design')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'design' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-300'}`}>Design</button>
                                <button onClick={() => setActiveTab('formatting')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'formatting' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-300'}`}>Formatting</button>
                            </div>
                            <div className="grid grid-cols-2 gap-1 bg-slate-200 rounded-lg p-1 mt-2">
                                <button onClick={() => setActiveTab('sections')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'sections' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-300'}`}>Sections</button>
                                <button onClick={() => setActiveTab('ai')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'ai' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-300'}`}>AI Copilot</button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {activeTab === 'design' && (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-800 mb-3">Colors</h4>
                                        <div className="grid grid-cols-5 gap-2">
                                            {colorPalettes.map((palette) => (
                                                <button key={palette.name} onClick={() => setSelectedColors(palette)} className={`w-12 h-12 rounded-lg border-2 transition-all ${selectedColors.primary === palette.primary ? 'border-indigo-600 scale-110' : 'border-slate-300 hover:border-slate-400'}`} style={{ backgroundColor: palette.primary }} title={palette.name}></button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-800 mb-3">Templates</h4>
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {['all', 'classic', 'photo', 'modern'].map(cat => (
                                                <button key={cat} onClick={() => setTemplateCategory(cat)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${templateCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>{cat}</button>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {filteredTemplates.map((template) => (
                                                <button key={template.id} onClick={() => setSelectedTemplateId(template.id)} className={`p-2 rounded-lg border transition-all ${selectedTemplateId === template.id ? 'border-indigo-500 bg-indigo-100' : 'border-slate-300 hover:border-slate-400'}`}>
                                                    <div className={`w-full h-20 rounded mb-2 ${template.preview}`}></div>
                                                    <h5 className="text-xs font-medium text-slate-800">{template.name}</h5>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'formatting' && (
                                <div className="space-y-6">
                                    {/* --- NEW/REORGANIZED SECTIONS --- */}
                                    <div>
                                      <h4 className="text-sm font-semibold text-slate-800 mb-3">Lists & Structure</h4>
                                        <div className="grid grid-cols-4 gap-2">
                                          <button className="flex flex-col items-center p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"><List className="w-5 h-5 text-slate-600" /><span className="text-xs mt-1">Bullets</span></button>
                                          <button className="flex flex-col items-center p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"><ListOrdered className="w-5 h-5 text-slate-600" /><span className="text-xs mt-1">Number</span></button>
                                          <button className="flex flex-col items-center p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"><Outdent className="w-5 h-5 text-slate-600" /><span className="text-xs mt-1">Outdent</span></button>
                                          <button className="flex flex-col items-center p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"><Indent className="w-5 h-5 text-slate-600" /><span className="text-xs mt-1">Indent</span></button>
                                        </div>
                                        <div className="mt-3">
                                            <label className="block text-xs font-medium text-slate-600 mb-2">Bullet Style</label>
                                            <select value={formattingSettings.bulletStyle} onChange={(e) => updateFormatting('bulletStyle', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none">
                                                <option value="disc">● Solid Circle</option>
                                                <option value="circle">○ Open Circle</option>
                                                <option value="square">■ Square</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-800 mb-3">Alignment & Layout</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-2">Text Alignment</label>
                                                <div className="flex bg-slate-100 rounded-lg p-1">
                                                    <button onClick={() => updateFormatting('alignment', 'left')} className={`p-2 w-full rounded-md transition-colors ${formattingSettings.alignment === 'left' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 text-slate-600'}`}><AlignLeft className="w-5 h-5 mx-auto"/></button>
                                                    <button onClick={() => updateFormatting('alignment', 'center')} className={`p-2 w-full rounded-md transition-colors ${formattingSettings.alignment === 'center' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 text-slate-600'}`}><AlignCenter className="w-5 h-5 mx-auto"/></button>
                                                    <button onClick={() => updateFormatting('alignment', 'right')} className={`p-2 w-full rounded-md transition-colors ${formattingSettings.alignment === 'right' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 text-slate-600'}`}><AlignRight className="w-5 h-5 mx-auto"/></button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-2">Line Spacing: {formattingSettings.lineSpacing}</label>
                                                <input type="range" min="1" max="2" step="0.1" value={formattingSettings.lineSpacing} onChange={(e) => updateFormatting('lineSpacing', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"/>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-2">Side Margins</label>
                                                <div className="flex items-center gap-2">
                                                    <input type="range" min="10" max="40" value={formattingSettings.sideMargins} onChange={(e) => updateFormatting('sideMargins', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider" />
                                                    <div className="relative">
                                                        <input type="number" value={formattingSettings.sideMargins} onChange={(e) => updateFormatting('sideMargins', Number(e.target.value))} className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-md text-center text-sm" />
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-800 mb-3">Text Styling</h4>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="flex bg-slate-100 rounded-lg p-1">
                                                <button onClick={() => updateFormatting('fontWeight', formattingSettings.fontWeight === 'bold' ? 'regular' : 'bold')} className={`p-2 rounded-md transition-colors ${formattingSettings.fontWeight === 'bold' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 text-slate-600'}`}><Bold className="w-5 h-5"/></button>
                                                <button onClick={() => updateFormatting('isItalic', !formattingSettings.isItalic)} className={`p-2 rounded-md transition-colors ${formattingSettings.isItalic ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 text-slate-600'}`}><Italic className="w-5 h-5"/></button>
                                                <button onClick={() => updateFormatting('isUnderline', !formattingSettings.isUnderline)} className={`p-2 rounded-md transition-colors ${formattingSettings.isUnderline ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 text-slate-600'}`}><Underline className="w-5 h-5"/></button>
                                            </div>
                                            <select value={formattingSettings.fontWeight} onChange={(e) => updateFormatting('fontWeight', e.target.value)} className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none">
                                                <option value="light">Light</option>
                                                <option value="regular">Regular</option>
                                                <option value="bold">Bold</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <label className="text-xs font-medium text-slate-600">Color:</label>
                                            {['#334155', '#475569', '#0f172a', '#3b82f6', '#6d28d9'].map(color => (
                                                <button key={color} onClick={() => updateFormatting('textColor', color)} className={`w-6 h-6 rounded-full border-2 ${formattingSettings.textColor === color ? 'border-indigo-500' : 'border-transparent'}`} style={{backgroundColor: color}}></button>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs font-medium text-slate-600">Highlight:</label>
                                            {['transparent', '#fef9c3', '#dbeafe', '#e0e7ff'].map(color => (
                                                <button key={color} onClick={() => updateFormatting('highlightColor', color)} className={`w-6 h-6 rounded-full border-2 ${formattingSettings.highlightColor === color ? 'border-indigo-500' : 'border-slate-300'} ${color === 'transparent' ? 'bg-white' : ''}`} style={{backgroundColor: color}}></button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-800 mb-3">Extra CV Tools</h4>
                                        <div className="grid grid-cols-4 gap-2">
                                            <button className="flex flex-col items-center p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"><Link className="w-5 h-5 text-slate-600" /><span className="text-xs mt-1">Link</span></button>
                                            <button className="flex flex-col items-center p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"><Phone className="w-5 h-5 text-slate-600" /><span className="text-xs mt-1">Icons</span></button>
                                            <button className="flex flex-col items-center p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"><Minus className="w-5 h-5 text-slate-600" /><span className="text-xs mt-1">Divider</span></button>
                                            <button className="flex flex-col items-center p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"><Calendar className="w-5 h-5 text-slate-600" /><span className="text-xs mt-1">Date</span></button>
                                        </div>
                                    </div>

                                    {/* --- EXISTING SECTIONS (RESTORED) --- */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-800 mb-3">Font Formatting</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-2">Font Style</label>
                                                <select value={formattingSettings.fontStyle} onChange={(e) => updateFormatting('fontStyle', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none">
                                                    {fontStyles.map((font) => (<option key={font} value={font}>{font}</option>))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-2">Font Size: {formattingSettings.fontSize}pt</label>
                                                <input type="range" min="8" max="16" value={formattingSettings.fontSize} onChange={(e) => updateFormatting('fontSize', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-2">Heading Size: {formattingSettings.headingSize}pt</label>
                                                <input type="range" min="12" max="20" value={formattingSettings.headingSize} onChange={(e) => updateFormatting('headingSize', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-800 mb-3">Document Formatting</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-2">Section Spacing: {formattingSettings.sectionSpacing}px</label>
                                                <input type="range" min="8" max="32" value={formattingSettings.sectionSpacing} onChange={(e) => updateFormatting('sectionSpacing', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'sections' && (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-slate-800 mb-3">Resume Sections</h4>
                                    <div className="space-y-2">
                                        {availableSections.map((section) => {
                                            const isActive = activeSections.includes(section);
                                            return (
                                                <div key={section} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${isActive ? 'border-green-500 bg-green-100' : 'border-slate-300 bg-slate-100'}`}>
                                                    <span className={`text-sm ${isActive ? 'text-green-700' : 'text-slate-700'}`}>{section}</span>
                                                    <button onClick={() => isActive ? handleDeleteSection(section) : handleAddSection(section)} className={`${isActive ? 'text-red-500 hover:text-red-600' : 'text-blue-500 hover:text-blue-600'} transition-colors`}>
                                                        {isActive ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            {activeTab === 'ai' && <AICopilot activeResume={activeResume} selectedText={selectedText} aiProcessing={aiProcessing} onATSOptimization={handleATSOptimization} onEnhanceText={handleEnhanceText} onGapJustification={handleGapJustification} />}
                        </div>
                    </div>
                </div>
                <div className="flex-1 bg-transparent flex flex-col">
                    <div className="bg-white/50 backdrop-blur-xl p-4 mb-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-slate-900">{activeResume?.title || 'Select a Resume'}</h3>
                                {activeResume && (<div className="px-2 py-1 rounded-full text-xs font-medium text-blue-700 bg-blue-100">ATS: {activeResume.atsScore}%</div>)}
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setViewMode(viewMode === 'edit' ? 'manage' : 'edit')} className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm"><Eye className="w-4 h-4" />{viewMode === 'edit' ? 'Manage CVs' : 'Back to Editor'}</button>
                                <button onClick={handleUndo} disabled={historyPointer <= 0} className="flex items-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"><RotateCcw className="w-4 h-4" />Undo</button>
                                <button onClick={handleSave} disabled={isLoading || viewMode === 'manage'} className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 text-sm"><Save className="w-4 h-4" />{isLoading ? 'Saving...' : 'Save'}</button>
                                <button onClick={() => setShowExportModal(true)} disabled={!activeResume || viewMode === 'manage'} className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 text-sm"><Download className="w-4 h-4" />Export</button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        {viewMode === 'edit' ? (<ResumePreview content={editorContent} templateId={selectedTemplateId} colors={selectedColors} formatting={formattingSettings} activeSections={activeSections} />) : (<ResumeListViewer resumes={resumes} onSelectResume={handleResumeSelect} />)}
                    </div>
                </div>

                {/* Modals */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                        <div className="bg-slate-800 rounded-lg p-6 w-96">
                            <h3 className="text-lg font-semibold text-white mb-4">Create New Resume</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Resume Title</label>
                                    <input type="text" value={newResumeTitle} onChange={(e) => setNewResumeTitle(e.target.value)} placeholder="e.g., Software Engineer - Google" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                                </div>
                                {/* Resume Type Selection */}
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:border-slate-500 transition-colors">Cancel</button>
                                <button onClick={createNewResume} disabled={!newResumeTitle.trim()} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">Create Resume</button>
                            </div>
                        </div>
                    </div>
                )}
                {showExportModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                        <div className="bg-slate-800 rounded-lg p-6 w-96">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">Export Resume</h3>
                                <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-4">
                                <p className="text-slate-300">Choose your preferred export format:</p>
                                <div className="space-y-3">
                                    <button onClick={() => {setShowExportModal(false);}} className="w-full flex items-center gap-3 p-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                                        <FileText className="w-5 h-5" />
                                        <div className="text-left"><div className="font-medium">Download as PDF</div><div className="text-sm opacity-80">Best for online applications</div></div>
                                    </button>
                                    <button onClick={() => {setShowExportModal(false);}} className="w-full flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                        <FileText className="w-5 h-5" />
                                        <div className="text-left"><div className="font-medium">Download as Word</div><div className="text-sm opacity-80">Editable document format</div></div>
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setShowExportModal(false)} className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:border-slate-500 transition-colors">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
    return null; // Should not be reached
}
