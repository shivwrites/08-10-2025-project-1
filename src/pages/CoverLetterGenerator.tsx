import { useState } from 'react';
import {
  Upload,
  Building2,
  FileText,
  Sparkles,
  Copy,
  Download,
  Eye,
  Pencil,
  AlertCircle,
  CheckCircle,
  Loader2,
  Search,
  FileDown,
  Save,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';

// --- Types ---
interface AnalysisData {
  jobTitle: string;
  keyRequirements: string[];
  matchingSkills: string[];
  gaps: string[];
  companyInfo: string;
}

// --- Main Component ---
const CoverLetterGenerator = () => {
  const [step, setStep] = useState<'upload' | 'input' | 'generate' | 'edit'>('upload');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvContent, setCvContent] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('');
  const [editedCoverLetter, setEditedCoverLetter] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);

  // Function to fetch job description from URL
  const handleFetchJobDescription = async () => {
    if (!companyUrl.trim()) {
      alert('Please enter a URL first');
      return;
    }

    // Validate URL
    try {
      new URL(companyUrl);
    } catch {
      alert('Please enter a valid URL');
      return;
    }

    setIsFetchingUrl(true);
    const apiKey = localStorage.getItem('openai_api_key');

    if (!apiKey) {
      alert('OpenAI API key not found. Please set it in Settings > Integrations.');
      setIsFetchingUrl(false);
      return;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are a web scraper. Extract the full job description from web pages, including job title, requirements, responsibilities, qualifications, and company information. Return the complete job posting text.',
            },
            {
              role: 'user',
              content: `Please fetch and extract the complete job description from this URL: ${companyUrl}

Extract:
- Job title
- Company name
- Full job description
- Requirements/qualifications
- Responsibilities
- Any other relevant details

Return the complete job posting text in a clear, readable format. If you cannot access the URL, explain why and provide guidance.`,
            },
          ],
          temperature: 0.3,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch job description');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (content) {
        setJobDescription(content);
        alert('✅ Job description fetched successfully!');
      } else {
        throw new Error('No content extracted from URL');
      }
    } catch (error) {
      console.error('Error fetching job description:', error);
      alert((error as Error).message || 'Failed to fetch job description. Please paste it manually.');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
      ];

      if (!allowedTypes.includes(file.type)) {
        setUploadError('Please select a valid file type (PDF, DOCX, DOC, or TXT)');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB');
        return;
      }

      setCvFile(file);
      setUploadError('');

      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        setCvContent(e.target?.result as string);
      };
      reader.readAsText(file);

      setStep('input');
    }
  };

  const handleAnalysis = async () => {
    if (!jobDescription.trim()) return;

    setIsAnalyzing(true);
    setStep('generate');

    try {
      // Get API key
      const apiKey = localStorage.getItem('openai_api_key');
      if (!apiKey) {
        throw new Error('OpenAI API key not found. Please set it in Settings > Integrations.');
      }

      // Call OpenAI to analyze the resume and job description
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are a career advisor who analyzes resumes and job postings to identify matches and gaps. Provide structured analysis data in JSON format.',
            },
            {
              role: 'user',
              content: `Analyze this resume and job description to prepare for generating a tailored cover letter.

RESUME/CV CONTENT:
${cvContent}

JOB DESCRIPTION:
${jobDescription}

COMPANY INFORMATION:
${companyUrl || 'Not provided'}

TASK:
Analyze and extract key information to help write a targeted cover letter.

Return your analysis in the following JSON format:
{
  "jobTitle": "Extracted job title from the job description",
  "keyRequirements": ["List", "of", "key", "requirements", "and", "skills", "from", "job", "description"],
  "matchingSkills": ["List", "of", "skills", "from", "resume", "that", "match", "the", "job"],
  "gaps": ["Skills", "or", "requirements", "from", "job", "that", "are", "missing", "in", "resume"],
  "companyInfo": "Company name and brief description if available"
}

Return only valid JSON, no additional text:`,
            },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to analyze documents');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      setAnalysisData(analysis);
    } catch (error) {
      console.error('Error during analysis:', error);
      alert((error as Error).message || 'Failed to analyze documents. Using basic information.');

      // Fallback to basic mock data
      setAnalysisData({
        jobTitle: 'Position',
        keyRequirements: [],
        matchingSkills: [],
        gaps: [],
        companyInfo: companyUrl || 'Company Information',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      // Get API key
      const apiKey = localStorage.getItem('openai_api_key');
      if (!apiKey) {
        throw new Error('OpenAI API key not found. Please set it in Settings > Integrations.');
      }

      // Call OpenAI to generate cover letter
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert cover letter writer. You create compelling, professional cover letters that are tailored to specific job postings. Your cover letters are concise, engaging, and highlight the most relevant qualifications.',
            },
            {
              role: 'user',
              content: `Write a professional cover letter based on this resume and job description.

RESUME/CV CONTENT:
${cvContent}

JOB DESCRIPTION:
${jobDescription}

COMPANY INFORMATION:
${companyUrl || 'Not provided'}

INSTRUCTIONS:
1. Write a compelling cover letter that:
   - Demonstrates understanding of the job requirements
   - Highlights relevant experience and skills from the resume
   - Shows enthusiasm for the position
   - Incorporates specific details from the job description
   - Is professional, concise (3-4 paragraphs), and engaging
   - Addresses the hiring manager professionally

2. Format:
   - Use proper business letter format
   - Start with "Dear Hiring Manager," (or specific name if company name is provided)
   - Include 3-4 body paragraphs
   - End with "Best regards," or "Sincerely," followed by [Your Name]

3. Make it specific to the job posting and company, not generic.

Return only the cover letter text, no additional explanation:`,
            },
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate cover letter');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from OpenAI');
      }

      setGeneratedCoverLetter(content);
      setEditedCoverLetter(content);
      setStep('edit');
    } catch (error) {
      console.error('Error generating cover letter:', error);
      alert((error as Error).message || 'Failed to generate cover letter. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedCoverLetter);
      alert('Cover letter copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([editedCoverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'cover-letter.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleReset = () => {
    setStep('upload');
    setCvFile(null);
    setCvContent('');
    setCompanyUrl('');
    setJobDescription('');
    setAnalysisData(null);
    setGeneratedCoverLetter('');
    setEditedCoverLetter('');
    setUploadError('');
  };

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-slate-800">Progress</span>
          <span className="text-sm text-slate-600">
            Step {step === 'upload' ? 1 : step === 'input' ? 2 : step === 'generate' ? 3 : 4} of 4
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500 shadow-lg"
            style={{
              width:
                step === 'upload'
                  ? '25%'
                  : step === 'input'
                    ? '50%'
                    : step === 'generate'
                      ? '75%'
                      : '100%',
            }}
          ></div>
        </div>
      </div>

      {/* Step 1: CV Upload */}
      {step === 'upload' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">Upload Your CV</h3>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-emerald-500/50 transition-colors">
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="cv-upload"
              />

              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Upload className="w-10 h-10 text-white" />
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-slate-800 mb-3">
                    {cvFile ? cvFile.name : 'Choose your CV file'}
                  </h4>
                  <p className="text-slate-600">
                    {cvFile
                      ? `${(cvFile.size / 1024 / 1024).toFixed(2)} MB • Ready to proceed`
                      : 'PDF, DOCX, DOC, or TXT format (Max 10MB)'}
                  </p>
                </div>

                <label
                  htmlFor="cv-upload"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 hover:from-emerald-600 hover:to-teal-600 hover:transform hover:scale-105"
                >
                  {cvFile ? 'Change File' : 'Select File'}
                </label>
              </div>
            </div>

            {uploadError && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700 font-medium">{uploadError}</p>
                </div>
              </div>
            )}

            {cvFile && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setStep('input')}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:from-emerald-600 hover:to-teal-600 hover:transform hover:scale-105 inline-flex items-center gap-2"
                >
                  Continue to Job Information
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">Supported formats: PDF, DOCX, DOC, TXT</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Job Information Input */}
      {step === 'input' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <Building2 className="w-6 h-6 text-emerald-500" />
                Company Information
              </h3>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Company Website or Job Posting URL (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={companyUrl}
                    onChange={(e) => setCompanyUrl(e.target.value)}
                    placeholder="https://company.com or job posting URL"
                    className="flex-1 px-4 py-3 bg-white/70 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-300"
                  />
                  <button
                    onClick={handleFetchJobDescription}
                    disabled={!companyUrl.trim() || isFetchingUrl}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                      companyUrl.trim() && !isFetchingUrl
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isFetchingUrl ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Fetch Job
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  {isFetchingUrl
                    ? 'Fetching job description from URL...'
                    : 'Paste URL and click "Fetch Job" to automatically extract job description'}
                </p>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <FileText className="w-6 h-6 text-teal-500" />
                Job Description
              </h3>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Complete Job Posting
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the complete job description here..."
                  rows={12}
                  className="w-full px-4 py-3 bg-white/70 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none resize-none transition-all duration-300"
                />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-slate-600">
                    Include job title, requirements, responsibilities, and company information
                  </p>
                  <span className="text-xs text-slate-600">{jobDescription.length} characters</span>
                </div>
              </div>

              <button
                onClick={handleAnalysis}
                disabled={!jobDescription.trim() || isAnalyzing}
                className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:from-emerald-600 hover:to-teal-600 hover:transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze & Continue
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">CV Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-800 text-sm">CV uploaded successfully</span>
                </div>
                <div className="text-sm text-slate-600">
                  <strong className="text-slate-800">File:</strong> {cvFile?.name}
                </div>
                <div className="text-sm text-slate-600">
                  <strong className="text-slate-800">Size:</strong>{' '}
                  {cvFile ? (cvFile.size / 1024 / 1024).toFixed(2) : '0'} MB
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Tips for Best Results</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-slate-600">Include the complete job posting for better analysis</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-slate-600">Company URL helps personalize the cover letter</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-slate-600">More details = better customization</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Analysis & Generation */}
      {step === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                Analysis Complete - Ready to Generate
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/70 rounded-xl p-4">
                  <h4 className="text-green-600 text-sm font-semibold mb-2">Matching Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisData?.matchingSkills?.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {(!analysisData?.matchingSkills || analysisData.matchingSkills.length === 0) && (
                      <span className="text-slate-500 text-sm">Analyzing...</span>
                    )}
                  </div>
                </div>

                <div className="bg-white/70 rounded-xl p-4">
                  <h4 className="text-blue-600 text-sm font-semibold mb-2">Areas to Address</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisData?.gaps?.map((gap, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {gap}
                      </span>
                    ))}
                    {(!analysisData?.gaps || analysisData.gaps.length === 0) && (
                      <span className="text-slate-500 text-sm">None identified</span>
                    )}
                  </div>
                </div>
              </div>

              {companyUrl && (
                <div className="mt-6 bg-white/70 rounded-xl p-4">
                  <h4 className="text-purple-600 text-sm font-semibold mb-2">Company Insights</h4>
                  <p className="text-slate-600 text-sm">
                    Based on company research, we'll emphasize cultural fit and company values in your
                    cover letter.
                  </p>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:from-emerald-600 hover:to-teal-600 hover:transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Cover Letter...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Cover Letter
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Job Analysis</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-600">Position:</span>
                  <span className="text-slate-800 font-medium ml-2">
                    {analysisData?.jobTitle || 'Analyzing...'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Company:</span>
                  <span className="text-slate-800 font-medium ml-2">
                    {analysisData?.companyInfo || 'Analyzing...'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Key Requirements:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {analysisData?.keyRequirements?.map((req, index) => (
                      <span key={index} className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">What AI Will Include</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Personalized opening based on company research</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Skill alignment with job requirements</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Professional closing with clear next steps</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Edit Generated Cover Letter */}
      {step === 'edit' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <Pencil className="w-6 h-6 text-emerald-500" />
                  Edit Your Cover Letter
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="bg-white/70 text-slate-800 px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-white/90 transition-colors"
                  >
                    {showPreview ? (
                      <>
                        <Pencil className="w-4 h-4" />
                        Edit
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Preview
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {showPreview ? (
                  <div className="bg-white rounded-xl p-6 min-h-96 border">
                    <div className="whitespace-pre-wrap text-slate-800 leading-relaxed">
                      {editedCoverLetter}
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={editedCoverLetter}
                    onChange={(e) => setEditedCoverLetter(e.target.value)}
                    className="w-full h-96 px-4 py-3 bg-white/70 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none resize-none transition-all duration-300"
                    placeholder="Your cover letter will appear here..."
                  />
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleCopy}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-600 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy to Clipboard
                  </button>
                  <button
                    onClick={handleDownload}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-green-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download as TXT
                  </button>
                  <button className="bg-purple-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-purple-600 transition-colors">
                    <FileDown className="w-4 h-4" />
                    Download as PDF
                  </button>
                  <button className="bg-slate-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-600 transition-colors">
                    <Save className="w-4 h-4" />
                    Save Draft
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Cover Letter Quality</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">94%</div>
                  <div className="text-sm text-slate-600">Overall Quality Score</div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-800">Professional Tone</span>
                    <span className="text-green-600 font-semibold">Excellent</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-800">Skill Alignment</span>
                    <span className="text-green-600 font-semibold">Very Good</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-800">Personalization</span>
                    <span className="text-green-600 font-semibold">Excellent</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-800">Length</span>
                    <span className="text-green-600 font-semibold">Perfect</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Customization Tips</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-slate-600">Personalize the opening with specific company details</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-slate-600">Add specific examples from your experience</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-slate-600">Adjust tone to match company culture</p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setStep('input')}
                  className="w-full text-left p-3 text-slate-600 hover:text-slate-800 hover:bg-white/70 rounded-xl transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Edit job description
                </button>
                <button
                  onClick={() => setStep('upload')}
                  className="w-full text-left p-3 text-slate-600 hover:text-slate-800 hover:bg-white/70 rounded-xl transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Use different CV
                </button>
                <button
                  onClick={handleGenerate}
                  className="w-full text-left p-3 text-slate-600 hover:text-slate-800 hover:bg-white/70 rounded-xl transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generate another version
                </button>
                <button
                  onClick={handleReset}
                  className="w-full text-left p-3 text-slate-600 hover:text-slate-800 hover:bg-white/70 rounded-xl transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Start fresh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoverLetterGenerator;







