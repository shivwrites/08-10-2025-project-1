import { useState, useEffect } from 'react';

// --- Types ---
interface MatchScores {
  overall: number;
  keywordAlignment: number;
  skillMatching: number;
  experienceRelevance: number;
  atsCompatibility: number;
}

interface Optimization {
  category: string;
  description: string;
}

// --- Icon Components ---
interface IconProps {
  className?: string;
}

const CreateIcon = ({ svgContent, className }: { svgContent: string; className?: string }) => (
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

const UploadIcon = (props: IconProps) => (
  <CreateIcon {...props} svgContent={`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />`} />
);

const BuildingIcon = (props: IconProps) => (
  <CreateIcon {...props} svgContent={`<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>`} />
);

const FileTextIcon = (props: IconProps) => (
  <CreateIcon {...props} svgContent={`<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />`} />
);

const SparklesIcon = (props: IconProps) => (
  <CreateIcon {...props} svgContent={`<path d="m12 3-1.9 1.9-3.2.9 1 3.1-.9 3.2 3.1 1 1.9 1.9 1.9-1.9 3.1-1-.9-3.2 1-3.1-3.2-.9z" /><path d="M5 22s1.5-2 4-2" /><path d="m19 22-4-2" /><path d="M22 5s-2-1.5-2-4" /><path d="m2 5 2-4" />`} />
);

const DownloadIcon = (props: IconProps) => (
  <CreateIcon {...props} svgContent={`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />`} />
);

const EyeIcon = (props: IconProps) => (
  <CreateIcon {...props} svgContent={`<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`} />
);

const AlertCircleIcon = (props: IconProps) => (
  <CreateIcon {...props} svgContent={`<circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />`} />
);

const CheckCircleIcon = (props: IconProps) => (
  <CreateIcon {...props} svgContent={`<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />`} />
);

const LoaderIcon = (props: IconProps) => (
  <CreateIcon {...props} svgContent={`<line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />`} />
);

const SearchIcon = (props: IconProps) => (
  <CreateIcon {...props} svgContent={`<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`} />
);

// --- Main Component ---
const ApplicationTailor = () => {
  const [step, setStep] = useState<'upload' | 'job-input' | 'analysis' | 'results'>('upload');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeContent, setResumeContent] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [analysisError, setAnalysisError] = useState('');
  const [tailoredResume, setTailoredResume] = useState('');
  const [matchScores, setMatchScores] = useState<MatchScores>({
    overall: 94,
    keywordAlignment: 92,
    skillMatching: 88,
    experienceRelevance: 95,
    atsCompatibility: 98,
  });
  const [optimizations, setOptimizations] = useState<Optimization[]>([]);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);

  // Check for pre-loaded job data from Job Finder
  useEffect(() => {
    const storedJob = localStorage.getItem('tailor_target_job');
    if (storedJob) {
      try {
        const jobData = JSON.parse(storedJob);
        if (jobData.jobDescription) {
          setJobDescription(jobData.jobDescription);
        }
        if (jobData.companyUrl) {
          setCompanyUrl(jobData.companyUrl);
        }
        // Clear the stored data after loading
        localStorage.removeItem('tailor_target_job');
      } catch (error) {
        console.error('Error loading stored job data:', error);
      }
    }
  }, []);

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
        setUploadError('Please select a valid file type (PDF, DOCX, or TXT)');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB');
        return;
      }

      setResumeFile(file);
      setUploadError('');

      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        setResumeContent(e.target?.result as string);
      };
      reader.readAsText(file);

      setStep('job-input');
    }
  };

  const handleAnalysis = async () => {
    if (!jobDescription.trim()) return;

    setIsProcessing(true);
    setAnalysisError('');
    setStep('analysis');

    try {
      // Get API key
      const apiKey = localStorage.getItem('openai_api_key');
      if (!apiKey) {
        throw new Error('OpenAI API key not found. Please set it in Settings.');
      }

      // Call OpenAI to analyze and tailor the resume
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
                'You are an expert resume writer and career coach. You help job seekers tailor their resumes to specific job postings by analyzing requirements, identifying matching skills and experiences, and optimizing content for ATS (Applicant Tracking Systems).',
            },
            {
              role: 'user',
              content: `Analyze this resume and tailor it to match the following job description.

RESUME CONTENT:
${resumeContent}

JOB DESCRIPTION:
${jobDescription}

TASK:
1. Analyze the job requirements and identify key keywords, skills, and qualifications needed
2. Review the resume to identify matching and missing elements
3. Create a tailored version of the resume that:
   - Naturally integrates relevant keywords from the job description
   - Emphasizes matching skills and experiences
   - Reorders/prioritizes relevant work experience
   - Optimizes for ATS compatibility
   - Maintains authenticity and avoids keyword stuffing

4. Calculate match scores in these categories (as percentages):
   - Overall Job Match Score
   - Keyword Alignment
   - Skill Matching
   - Experience Relevance
   - ATS Compatibility

5. List key optimizations made

Return your response in the following JSON format:
{
  "tailoredResume": "The optimized resume content...",
  "matchScores": {
    "overall": 94,
    "keywordAlignment": 92,
    "skillMatching": 88,
    "experienceRelevance": 95,
    "atsCompatibility": 98
  },
  "optimizations": [
    {
      "category": "Keywords Added",
      "description": "12 relevant keywords integrated naturally"
    },
    {
      "category": "Skills Emphasized",
      "description": "Highlighted matching technical skills"
    }
  ]
}`,
            },
          ],
          temperature: 0.5,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to analyze resume');
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

      const result = JSON.parse(jsonMatch[0]);

      setTailoredResume(result.tailoredResume || '');
      setMatchScores(result.matchScores || matchScores);
      setOptimizations(result.optimizations || []);

      // Save to localStorage for later use
      const analysisResult = {
        tailoredResume: result.tailoredResume,
        matchScores: result.matchScores,
        optimizations: result.optimizations,
        jobDescription: jobDescription,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('last_resume_analysis', JSON.stringify(analysisResult));

      // Dispatch event for Work History integration
      if (typeof window !== 'undefined' && (window as any).dispatchApplicationTailorComplete) {
        (window as any).dispatchApplicationTailorComplete(result.tailoredResume, '', '');
      }

      setStep('results');
    } catch (error) {
      console.error('Error during analysis:', error);
      setAnalysisError((error as Error).message || 'Failed to analyze resume. Please try again.');
      setStep('job-input');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!tailoredResume) return;

    const blob = new Blob([tailoredResume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tailored-resume-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = () => {
    if (!tailoredResume) return;
    navigator.clipboard.writeText(tailoredResume);
    alert('Tailored resume copied to clipboard!');
  };

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-slate-800">Progress</span>
          <span className="text-sm text-slate-600">
            Step {step === 'upload' ? 1 : step === 'job-input' ? 2 : step === 'analysis' ? 3 : 4} of 4
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-lg"
            style={{
              width:
                step === 'upload'
                  ? '25%'
                  : step === 'job-input'
                  ? '50%'
                  : step === 'analysis'
                  ? '75%'
                  : '100%',
            }}
          ></div>
        </div>
      </div>

      {/* Step 1: Resume Upload */}
      {step === 'upload' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">Upload Your Resume</h3>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-indigo-500/50 transition-colors">
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-upload"
              />

              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <UploadIcon className="w-10 h-10 text-white" />
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-slate-800 mb-3">
                    {resumeFile ? resumeFile.name : 'Choose your resume file'}
                  </h4>
                  <p className="text-slate-600">
                    {resumeFile
                      ? `${(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Ready to proceed`
                      : 'PDF, DOCX, or TXT format (Max 10MB)'}
                  </p>
                </div>

                <label
                  htmlFor="resume-upload"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 hover:from-indigo-600 hover:to-purple-700 hover:transform hover:scale-105"
                >
                  {resumeFile ? 'Change File' : 'Select File'}
                </label>
              </div>
            </div>

            {uploadError && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <AlertCircleIcon className="w-5 h-5 text-red-600" />
                  <p className="text-red-700 font-medium">{uploadError}</p>
                </div>
              </div>
            )}

            {resumeFile && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setStep('job-input')}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:from-indigo-600 hover:to-purple-700 hover:transform hover:scale-105"
                >
                  Continue to Job Details
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Job Input */}
      {step === 'job-input' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <BuildingIcon className="w-6 h-6 text-indigo-500" />
                Company Information
              </h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Company Website or Job Posting URL (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={companyUrl}
                    onChange={(e) => setCompanyUrl(e.target.value)}
                    placeholder="https://company.com or job posting URL"
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-300"
                  />
                  <button
                    onClick={handleFetchJobDescription}
                    disabled={!companyUrl.trim() || isFetchingUrl}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                      companyUrl.trim() && !isFetchingUrl
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isFetchingUrl ? (
                      <>
                        <LoaderIcon className="w-4 h-4 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <SearchIcon className="w-4 h-4" />
                        Fetch Job
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {isFetchingUrl
                    ? 'Fetching job description from URL...'
                    : 'Paste URL and click "Fetch Job" to automatically extract job description'}
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <FileTextIcon className="w-6 h-6 text-purple-500" />
                Job Description
              </h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Complete Job Posting</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the complete job description here..."
                  rows={12}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none resize-none transition-all duration-300"
                />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-600">
                    Include job title, requirements, responsibilities, and company information
                  </p>
                  <span className="text-xs text-gray-600">{jobDescription.length} characters</span>
                </div>
              </div>

              <button
                onClick={handleAnalysis}
                disabled={!jobDescription.trim() || isProcessing}
                className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:from-indigo-600 hover:to-purple-700 hover:transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <>
                    <LoaderIcon className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Analyze & Tailor Resume
                  </>
                )}
              </button>

              {analysisError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircleIcon className="w-5 h-5 text-red-600" />
                    <p className="text-red-700 font-medium">{analysisError}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Resume Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="text-gray-900 text-sm">Resume uploaded successfully</span>
                </div>
                <div className="text-sm text-gray-600">
                  <strong className="text-gray-900">File:</strong> {resumeFile?.name}
                </div>
                <div className="text-sm text-gray-600">
                  <strong className="text-gray-900">Size:</strong>{' '}
                  {resumeFile ? (resumeFile.size / 1024 / 1024).toFixed(2) : '0'} MB
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Tips for Best Results</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600">Include the complete job posting for better analysis</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600">Company URL helps personalize the application</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600">More details = better customization</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Analysis */}
      {step === 'analysis' && (
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white border border-gray-200 rounded-2xl p-12">
            <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <SparklesIcon className="w-12 h-12 text-white animate-pulse" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Analyzing Job Requirements</h3>
            <p className="text-lg text-gray-600 mb-8">
              Our AI is analyzing the job posting and tailoring your resume...
            </p>

            <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full transition-all duration-1000 shadow-lg animate-pulse"
                style={{ width: '75%' }}
              ></div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Processing Steps</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>Extracting job requirements</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>Analyzing skill matches</span>
                </div>
                <div className="flex items-center gap-2">
                  <LoaderIcon className="w-4 h-4 text-indigo-500 animate-spin" />
                  <span>Optimizing content alignment</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                  <span>Generating tailored resume</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 'results' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <SparklesIcon className="w-6 h-6 text-indigo-500" />
                  Your Tailored Resume
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={handleCopyToClipboard}
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                    Copy
                  </button>
                  <button
                    onClick={handleDownload}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:from-indigo-600 hover:to-purple-700 transition-colors"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                {tailoredResume ? (
                  <div className="space-y-6">
                    <div className="bg-white text-gray-900 p-8 rounded-xl whitespace-pre-wrap font-mono text-sm max-h-[600px] overflow-y-auto">
                      {tailoredResume}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <FileTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Tailored Resume Ready</h4>
                    <p className="text-gray-600">
                      Your resume has been optimized for this specific job posting
                    </p>
                  </div>
                )}
              </div>

              {analysisError && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircleIcon className="w-5 h-5 text-red-600" />
                    <p className="text-red-700 font-medium">{analysisError}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Tailoring Results</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-500 mb-2">{matchScores.overall}%</div>
                  <div className="text-sm text-gray-600">Job Match Score</div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-900">Keyword Alignment</span>
                    <span className="text-green-500 font-semibold">{matchScores.keywordAlignment}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-900">Skill Matching</span>
                    <span className="text-green-500 font-semibold">{matchScores.skillMatching}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-900">Experience Relevance</span>
                    <span className="text-green-500 font-semibold">{matchScores.experienceRelevance}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-900">ATS Compatibility</span>
                    <span className="text-green-500 font-semibold">{matchScores.atsCompatibility}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Key Optimizations</h3>
              <div className="space-y-3">
                {optimizations.length > 0 ? (
                  optimizations.map((opt, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                      <h4 className="text-green-500 text-sm font-semibold mb-1">{opt.category}</h4>
                      <p className="text-gray-600 text-sm">{opt.description}</p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                      <h4 className="text-green-500 text-sm font-semibold mb-1">Keywords Added</h4>
                      <p className="text-gray-600 text-sm">12 relevant keywords integrated naturally</p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                      <h4 className="text-blue-500 text-sm font-semibold mb-1">Skills Emphasized</h4>
                      <p className="text-gray-600 text-sm">Highlighted matching technical skills</p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                      <h4 className="text-purple-500 text-sm font-semibold mb-1">Experience Reordered</h4>
                      <p className="text-gray-600 text-sm">Most relevant experience prioritized</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setStep('job-input')}
                  className="w-full text-left p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Edit job description
                </button>
                <button
                  onClick={() => setStep('upload')}
                  className="w-full text-left p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Use different resume
                </button>
                <button className="w-full text-left p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                  Generate cover letter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationTailor;







