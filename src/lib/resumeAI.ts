/**
 * Resume AI Service
 * AI-powered resume enhancement features using OpenAI
 */

import { getOpenAIKey } from './apiKey';

// --- Types ---
export interface ATSAnalysisResult {
  overallScore: number;
  breakdown: {
    keywordOptimization: { score: number; feedback: string; suggestions: string[] };
    formatting: { score: number; feedback: string; issues: string[] };
    sectionCompleteness: { score: number; feedback: string; missingSections: string[] };
    actionVerbs: { score: number; feedback: string; weakVerbs: string[]; strongAlternatives: string[] };
    quantifiableAchievements: { score: number; feedback: string; suggestions: string[] };
    readability: { score: number; feedback: string; issues: string[] };
  };
  topImprovements: string[];
  industryKeywords: string[];
}

export interface EnhancedTextResult {
  enhancedText: string;
  changes: string[];
  beforeAfterComparison: { before: string; after: string }[];
}

export interface GapJustificationResult {
  detectedGaps: { startDate: string; endDate: string; duration: string }[];
  suggestions: { gap: string; justifications: string[] }[];
  generalAdvice: string;
}

export interface KeywordExtractionResult {
  keywords: { keyword: string; importance: 'critical' | 'important' | 'nice-to-have'; found: boolean }[];
  matchPercentage: number;
  missingCritical: string[];
  recommendations: string[];
}

export interface IndustryKeywordsResult {
  industry: string;
  keywords: { keyword: string; category: string; importance: 'critical' | 'important' | 'nice-to-have'; examples: string[] }[];
  recommendations: string[];
}

export interface CompetitorAnalysisResult {
  yourScore: number;
  industryAverage: number;
  topPerformersAverage: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  percentileRank: number;
}

export interface SectionReorderingResult {
  recommendedOrder: string[];
  reasoning: string[];
  impactScore: number;
}

export type ToneType = 'professional' | 'creative' | 'technical' | 'executive' | 'academic';

export interface ContextAwareSuggestion {
  suggestion: string;
  type: 'enhancement' | 'keyword' | 'metric' | 'action-verb' | 'formatting';
  confidence: number;
  explanation: string;
}

export interface ContextAwareSuggestionsResult {
  suggestions: ContextAwareSuggestion[];
  contextAnalysis: string;
  recommendedActions: string[];
}

export interface AutoCompleteResult {
  completions: string[];
  context: string;
  confidence: number;
}

export interface BulletPointGenerationResult {
  bulletPoints: string[];
  source: 'job-description' | 'achievement-extraction' | 'auto-fill';
  confidence: number;
  suggestions: string[];
}

export interface AchievementExtractionResult {
  achievements: Array<{
    achievement: string;
    impact: string;
    metrics: string[];
    category: 'quantitative' | 'qualitative' | 'leadership' | 'innovation';
    confidence: number;
  }>;
  summary: string;
}

export interface ExperienceVariation {
  variation: string;
  style: 'achievement-focused' | 'responsibility-focused' | 'impact-focused' | 'technical' | 'leadership';
  targetAudience: 'ats' | 'recruiter' | 'technical-manager' | 'executive';
  wordCount: number;
}

export interface ExperienceVariationsResult {
  original: string;
  variations: ExperienceVariation[];
  recommendations: string[];
}

// --- Helper Functions ---
async function callOpenAI(prompt: string, systemPrompt: string = ''): Promise<string> {
  const apiKey = getOpenAIKey();
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please set it in Settings.');
  }

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to get AI response');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

function extractJSON<T>(text: string): T {
  // Try to extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  // If no JSON found, try parsing the whole content
  return JSON.parse(text);
}

function stripHTML(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

// --- Main AI Functions ---

/**
 * Analyze resume for ATS (Applicant Tracking System) compatibility
 */
export async function analyzeResumeATS(resumeHTML: string, targetJobDescription?: string): Promise<ATSAnalysisResult> {
  const resumeText = stripHTML(resumeHTML);
  
  const systemPrompt = `You are an expert ATS (Applicant Tracking System) analyzer and resume consultant with 15+ years of experience in HR and recruitment technology. Analyze resumes for ATS compatibility and provide detailed, actionable feedback.`;
  
  const prompt = `Analyze this resume for ATS compatibility and provide a comprehensive analysis.

RESUME TEXT:
${resumeText}

${targetJobDescription ? `TARGET JOB DESCRIPTION:\n${targetJobDescription}\n` : ''}

Return a JSON object with this exact structure:
{
  "overallScore": <number 0-100>,
  "breakdown": {
    "keywordOptimization": {
      "score": <number 0-100>,
      "feedback": "<brief feedback>",
      "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"]
    },
    "formatting": {
      "score": <number 0-100>,
      "feedback": "<brief feedback>",
      "issues": ["<issue 1>", "<issue 2>"]
    },
    "sectionCompleteness": {
      "score": <number 0-100>,
      "feedback": "<brief feedback>",
      "missingSections": ["<section 1>", "<section 2>"]
    },
    "actionVerbs": {
      "score": <number 0-100>,
      "feedback": "<brief feedback>",
      "weakVerbs": ["<verb 1>", "<verb 2>"],
      "strongAlternatives": ["<alternative 1>", "<alternative 2>"]
    },
    "quantifiableAchievements": {
      "score": <number 0-100>,
      "feedback": "<brief feedback>",
      "suggestions": ["<suggestion 1>", "<suggestion 2>"]
    },
    "readability": {
      "score": <number 0-100>,
      "feedback": "<brief feedback>",
      "issues": ["<issue 1>", "<issue 2>"]
    }
  },
  "topImprovements": ["<most important improvement 1>", "<improvement 2>", "<improvement 3>"],
  "industryKeywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>"]
}

Be specific and actionable in your feedback. Return ONLY valid JSON, no additional text.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    return extractJSON<ATSAnalysisResult>(response);
  } catch (error) {
    console.error('Error analyzing resume for ATS:', error);
    throw error;
  }
}

/**
 * Enhance selected text to be more impactful
 */
export async function enhanceResumeText(
  selectedText: string, 
  context?: string,
  tone: ToneType = 'professional',
  targetLanguage?: string
): Promise<EnhancedTextResult> {
  const systemPrompt = `You are an expert resume writer and career coach. Your specialty is transforming ordinary resume content into powerful, achievement-focused statements that capture attention and demonstrate value.`;
  
  const toneGuidelines = {
    professional: 'Use formal, polished language suitable for corporate environments. Maintain a confident but humble tone.',
    creative: 'Allow for more personality and creative expression while remaining professional. Use dynamic language that shows innovation.',
    technical: 'Use precise technical terminology. Focus on specific technologies, methodologies, and quantifiable technical achievements.',
    executive: 'Use strategic, leadership-focused language. Emphasize vision, impact, and high-level decision-making.',
    academic: 'Use scholarly language appropriate for research and academic positions. Emphasize publications, research, and intellectual contributions.'
  };

  const languageNote = targetLanguage && targetLanguage !== 'en' 
    ? `\nIMPORTANT: Translate and adapt the enhanced text to ${targetLanguage} while maintaining professional resume conventions for that language and culture.`
    : '';

  const prompt = `Enhance this resume text to be more impactful, professional, and achievement-oriented.

ORIGINAL TEXT:
${selectedText}

${context ? `CONTEXT (surrounding content):\n${context}\n` : ''}

TONE STYLE: ${tone}
${toneGuidelines[tone]}

${languageNote}

Guidelines:
1. Use strong action verbs at the beginning
2. Include quantifiable metrics where possible (numbers, percentages, dollar amounts)
3. Focus on achievements and impact, not just responsibilities
4. Keep it concise but powerful
5. Use industry-appropriate language
6. Ensure ATS compatibility (avoid graphics, tables in text)
7. Match the ${tone} tone style specified above

Return a JSON object with this exact structure:
{
  "enhancedText": "<the improved version of the text>",
  "changes": ["<description of change 1>", "<description of change 2>", "<description of change 3>"],
  "beforeAfterComparison": [
    {"before": "<original phrase>", "after": "<improved phrase>"},
    {"before": "<original phrase 2>", "after": "<improved phrase 2>"}
  ]
}

Return ONLY valid JSON, no additional text.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    return extractJSON<EnhancedTextResult>(response);
  } catch (error) {
    console.error('Error enhancing text:', error);
    throw error;
  }
}

/**
 * Get context-aware suggestions based on selected text and surrounding content
 */
export async function getContextAwareSuggestions(
  selectedText: string,
  fullResumeText: string,
  sectionName?: string
): Promise<ContextAwareSuggestionsResult> {
  const systemPrompt = `You are an expert resume consultant with deep knowledge of ATS systems and recruiter preferences. You analyze resume content in context and provide specific, actionable suggestions.`;
  
  const prompt = `Analyze this selected resume text and provide context-aware suggestions for improvement.

SELECTED TEXT:
${selectedText}

FULL RESUME CONTEXT:
${fullResumeText.substring(0, 2000)} ${fullResumeText.length > 2000 ? '...' : ''}

${sectionName ? `SECTION: ${sectionName}` : ''}

Provide intelligent, context-aware suggestions that consider:
1. The specific content selected
2. How it fits with the rest of the resume
3. Industry best practices for this type of content
4. ATS optimization opportunities
5. Ways to make it more impactful

Return a JSON object with this exact structure:
{
  "suggestions": [
    {
      "suggestion": "<specific suggestion text>",
      "type": "enhancement|keyword|metric|action-verb|formatting",
      "confidence": <number 0-100>,
      "explanation": "<brief explanation of why this suggestion helps>"
    }
  ],
  "contextAnalysis": "<brief analysis of how this text fits in the overall resume context>",
  "recommendedActions": [
    "<action 1>",
    "<action 2>",
    "<action 3>"
  ]
}

Return 3-5 high-quality suggestions. Return ONLY valid JSON, no additional text.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    return extractJSON<ContextAwareSuggestionsResult>(response);
  } catch (error) {
    console.error('Error getting context-aware suggestions:', error);
    throw error;
  }
}

/**
 * Get auto-complete suggestions for common resume phrases
 */
export async function getAutoCompleteSuggestions(
  partialText: string,
  context: string,
  sectionType?: string
): Promise<AutoCompleteResult> {
  const systemPrompt = `You are an expert resume writer who knows common, effective resume phrases and bullet points. You help users complete their resume text with professional, impactful language.`;
  
  const prompt = `Provide auto-complete suggestions for this partial resume text.

PARTIAL TEXT:
${partialText}

CONTEXT (surrounding text):
${context.substring(0, 500)} ${context.length > 500 ? '...' : ''}

${sectionType ? `SECTION TYPE: ${sectionType}` : ''}

Based on the partial text and context, suggest 3-5 natural completions that:
1. Complete the thought professionally
2. Use strong action verbs and quantifiable metrics where appropriate
3. Match the tone and style of the existing text
4. Are commonly used, effective resume phrases
5. Are ATS-friendly

Return a JSON object with this exact structure:
{
  "completions": [
    "<completion option 1>",
    "<completion option 2>",
    "<completion option 3>"
  ],
  "context": "<brief explanation of the context>",
  "confidence": <number 0-100 representing confidence in suggestions>
}

Return ONLY valid JSON, no additional text.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    return extractJSON<AutoCompleteResult>(response);
  } catch (error) {
    console.error('Error getting auto-complete suggestions:', error);
    throw error;
  }
}

/**
 * Translate resume content to another language while maintaining professional conventions
 */
export async function translateResumeContent(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'en',
  context?: string
): Promise<string> {
  const systemPrompt = `You are an expert translator specializing in professional documents, particularly resumes and CVs. You understand cultural nuances and professional conventions in different languages.`;
  
  const languageNotes: Record<string, string> = {
    'es': 'Use formal Spanish (usted form). Maintain professional tone. Common resume sections: "Experiencia Profesional", "Formación Académica", "Habilidades".',
    'fr': 'Use formal French. Maintain professional tone. Common resume sections: "Expérience Professionnelle", "Formation", "Compétences".',
    'de': 'Use formal German. Maintain professional tone. Common resume sections: "Berufserfahrung", "Ausbildung", "Fähigkeiten".',
    'pt': 'Use formal Portuguese (Brazilian or European based on context). Common resume sections: "Experiência Profissional", "Formação Acadêmica", "Habilidades".',
    'zh': 'Use simplified or traditional Chinese as appropriate. Maintain professional tone. Common resume sections: "工作经历", "教育背景", "技能".',
    'ja': 'Use formal Japanese (keigo). Maintain professional tone. Common resume sections: "職務経歴", "学歴", "スキル".'
  };

  const prompt = `Translate this resume content from ${sourceLanguage} to ${targetLanguage}.

ORIGINAL TEXT:
${text}

${context ? `CONTEXT:\n${context}\n` : ''}

${languageNotes[targetLanguage] ? `LANGUAGE-SPECIFIC NOTES:\n${languageNotes[targetLanguage]}\n` : ''}

Guidelines:
1. Maintain professional resume conventions for ${targetLanguage}
2. Keep the same meaning and impact
3. Adapt cultural references appropriately
4. Maintain ATS-friendly formatting
5. Use appropriate professional terminology for ${targetLanguage}
6. Keep quantifiable metrics (numbers, percentages) unchanged

Return ONLY the translated text, no JSON or explanation.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    return response.trim();
  } catch (error) {
    console.error('Error translating resume content:', error);
    throw error;
  }
}

/**
 * Detect and provide justifications for career gaps
 */
export async function analyzeCareerGaps(resumeHTML: string): Promise<GapJustificationResult> {
  const resumeText = stripHTML(resumeHTML);
  
  const systemPrompt = `You are a career coach specializing in helping professionals address career gaps. You provide supportive, practical advice that helps candidates present their backgrounds positively without being deceptive.`;
  
  const prompt = `Analyze this resume for career gaps and provide helpful justifications.

RESUME TEXT:
${resumeText}

Tasks:
1. Identify any gaps in employment (periods of 3+ months without listed work)
2. For each gap, provide 3-4 positive and honest ways to explain it
3. Provide general advice for addressing gaps professionally

Return a JSON object with this exact structure:
{
  "detectedGaps": [
    {"startDate": "YYYY-MM", "endDate": "YYYY-MM", "duration": "X months/years"}
  ],
  "suggestions": [
    {
      "gap": "<description of the gap period>",
      "justifications": [
        "<justification option 1 - e.g., professional development>",
        "<justification option 2 - e.g., family responsibilities>",
        "<justification option 3 - e.g., freelance/consulting>",
        "<justification option 4 - e.g., health/personal growth>"
      ]
    }
  ],
  "generalAdvice": "<overall advice for presenting career history>"
}

If no significant gaps are detected, return an empty detectedGaps array with encouraging generalAdvice.
Return ONLY valid JSON, no additional text.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    return extractJSON<GapJustificationResult>(response);
  } catch (error) {
    console.error('Error analyzing career gaps:', error);
    throw error;
  }
}

/**
 * Extract and match keywords from a job description against resume
 */
export async function extractAndMatchKeywords(resumeHTML: string, jobDescription: string): Promise<KeywordExtractionResult> {
  const resumeText = stripHTML(resumeHTML);
  
  const systemPrompt = `You are an expert ATS specialist and keyword analyst. You understand how applicant tracking systems parse and rank resumes based on keyword matching.`;
  
  const prompt = `Extract keywords from this job description and check which ones appear in the resume.

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}

Tasks:
1. Extract important keywords/skills/requirements from the job description
2. Categorize each by importance (critical, important, nice-to-have)
3. Check if each keyword is found (or closely matched) in the resume
4. Provide recommendations for improving keyword match

Return a JSON object with this exact structure:
{
  "keywords": [
    {"keyword": "<keyword>", "importance": "critical|important|nice-to-have", "found": true|false},
    ...
  ],
  "matchPercentage": <number 0-100>,
  "missingCritical": ["<missing critical keyword 1>", "<missing critical keyword 2>"],
  "recommendations": [
    "<recommendation 1 for improving keyword match>",
    "<recommendation 2>",
    "<recommendation 3>"
  ]
}

Return ONLY valid JSON, no additional text.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    return extractJSON<KeywordExtractionResult>(response);
  } catch (error) {
    console.error('Error extracting keywords:', error);
    throw error;
  }
}

/**
 * Generate bullet points for a given job role
 */
export async function generateBulletPoints(
  jobTitle: string, 
  company: string, 
  responsibilities: string,
  industry?: string
): Promise<string[]> {
  const systemPrompt = `You are an expert resume writer who specializes in crafting powerful, achievement-focused bullet points that pass ATS scans and impress recruiters.`;
  
  const prompt = `Generate 4-5 powerful resume bullet points for this role:

Job Title: ${jobTitle}
Company: ${company}
${industry ? `Industry: ${industry}` : ''}
Responsibilities/Context: ${responsibilities}

Guidelines:
1. Start each bullet with a strong action verb
2. Include specific metrics and numbers where appropriate
3. Focus on achievements and impact, not just tasks
4. Use industry-relevant keywords
5. Keep each bullet to 1-2 lines maximum
6. Make them ATS-friendly (no special characters or formatting)

Return a JSON array of strings:
["<bullet point 1>", "<bullet point 2>", "<bullet point 3>", "<bullet point 4>", "<bullet point 5>"]

Return ONLY the JSON array, no additional text.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    return extractJSON<string[]>(response);
  } catch (error) {
    console.error('Error generating bullet points:', error);
    throw error;
  }
}

/**
 * Rewrite entire resume section
 */
export async function rewriteSection(
  sectionName: string,
  sectionContent: string,
  targetRole?: string
): Promise<string> {
  const systemPrompt = `You are an expert resume writer with experience in executive-level resume transformations. You create compelling, achievement-focused content that passes ATS systems and impresses hiring managers.`;
  
  const prompt = `Rewrite this resume section to be more impactful and professional.

SECTION: ${sectionName}
CONTENT:
${sectionContent}

${targetRole ? `TARGET ROLE: ${targetRole}` : ''}

Guidelines:
1. Maintain the same general structure and information
2. Enhance language to be more powerful and achievement-focused
3. Add metrics and quantifiable results where appropriate
4. Use strong action verbs
5. Ensure ATS compatibility
6. Keep formatting simple (use bullet points with • character)

Return ONLY the rewritten section content as plain text with basic formatting. Do not include any JSON or explanation.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    return response.trim();
  } catch (error) {
    console.error('Error rewriting section:', error);
    throw error;
  }
}

/**
 * Generate a professional summary based on resume content
 */
export async function generateProfessionalSummary(
  resumeHTML: string,
  targetRole?: string,
  yearsOfExperience?: number
): Promise<string> {
  const resumeText = stripHTML(resumeHTML);
  
  const systemPrompt = `You are an expert resume writer specializing in crafting compelling professional summaries that immediately capture a recruiter's attention.`;
  
  const prompt = `Generate a powerful professional summary based on this resume:

RESUME:
${resumeText}

${targetRole ? `TARGET ROLE: ${targetRole}` : ''}
${yearsOfExperience ? `YEARS OF EXPERIENCE: ${yearsOfExperience}` : ''}

Guidelines:
1. Keep it to 3-4 sentences (50-75 words)
2. Lead with years of experience and core expertise
3. Highlight 2-3 key achievements or differentiators
4. Include relevant industry keywords
5. End with value proposition or career objective
6. Avoid first-person pronouns (I, my, me)

Return ONLY the professional summary text, no JSON or explanation.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    return response.trim();
  } catch (error) {
    console.error('Error generating professional summary:', error);
    throw error;
  }
}

/**
 * Quick ATS score calculation (lightweight for real-time updates)
 * This is a faster, simplified version for real-time scoring
 */
export async function calculateQuickATSScore(resumeText: string, jobDescription?: string): Promise<number> {
  // First, do a quick local calculation
  let score = 0;
  
  // Basic checks (40 points)
  if (resumeText.length > 200) score += 10; // Has content
  if (resumeText.match(/@/)) score += 5; // Has email
  if (resumeText.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)) score += 5; // Has phone
  if (resumeText.match(/\b(experience|work|employment)\b/i)) score += 10; // Has experience section
  if (resumeText.match(/\b(education|degree|university|college)\b/i)) score += 10; // Has education
  
  // If job description provided, do keyword matching (60 points)
  if (jobDescription) {
    const jobKeywords = extractKeywordsFromText(jobDescription);
    const resumeKeywords = extractKeywordsFromText(resumeText);
    const matchCount = jobKeywords.filter(kw => 
      resumeKeywords.some(rk => rk.toLowerCase().includes(kw.toLowerCase()) || kw.toLowerCase().includes(rk.toLowerCase()))
    ).length;
    score += Math.min(60, (matchCount / jobKeywords.length) * 60);
  } else {
    // Without job description, give points for common resume elements
    if (resumeText.match(/\b(skills?|technical|proficient|expert)\b/i)) score += 15;
    if (resumeText.match(/\b(achieved|improved|increased|reduced|managed|led)\b/i)) score += 15;
    if (resumeText.match(/\d+%|\$\d+|\d+\s*(years?|months?)/i)) score += 15; // Has metrics
    score += 15; // Base score
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Extract keywords from text (simple implementation)
 */
function extractKeywordsFromText(text: string): string[] {
  // Remove common stop words and extract meaningful terms
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can']);
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));
  
  // Return unique keywords
  return Array.from(new Set(words)).slice(0, 50);
}

/**
 * Get industry-specific keyword suggestions
 */
export async function getIndustryKeywords(industry: string, jobTitle?: string): Promise<IndustryKeywordsResult> {
  const systemPrompt = `You are an expert career advisor and ATS specialist with deep knowledge of industry-specific keywords and terminology used in applicant tracking systems.`;
  
  const prompt = `Provide industry-specific keywords for the ${industry} industry${jobTitle ? `, specifically for ${jobTitle} roles` : ''}.

Return a JSON object with this exact structure:
{
  "industry": "${industry}",
  "keywords": [
    {
      "keyword": "<keyword or phrase>",
      "category": "<technical skills|soft skills|tools|certifications|methodologies>",
      "importance": "critical|important|nice-to-have",
      "examples": ["<example usage 1>", "<example usage 2>"]
    }
  ],
  "recommendations": [
    "<recommendation 1 for optimizing resume with these keywords>",
    "<recommendation 2>",
    "<recommendation 3>"
  ]
}

Include 15-20 keywords covering:
- Technical skills specific to this industry
- Tools and technologies commonly used
- Certifications that matter
- Methodologies and frameworks
- Industry-specific terminology

Return ONLY valid JSON, no additional text.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    return extractJSON<IndustryKeywordsResult>(response);
  } catch (error) {
    console.error('Error getting industry keywords:', error);
    throw error;
  }
}

/**
 * Compare resume against successful resumes in the field (competitor analysis)
 */
export async function analyzeCompetitorResumes(
  resumeHTML: string,
  industry: string,
  jobTitle: string
): Promise<CompetitorAnalysisResult> {
  const resumeText = stripHTML(resumeHTML);
  
  const systemPrompt = `You are an expert resume analyst with access to data on thousands of successful resumes. You understand what makes resumes stand out in different industries and roles.`;
  
  const prompt = `Analyze this resume and compare it against successful resumes in the ${industry} industry for ${jobTitle} roles.

RESUME:
${resumeText.substring(0, 3000)} ${resumeText.length > 3000 ? '...' : ''}

Based on your knowledge of successful resumes in this field, provide a comparative analysis.

Return a JSON object with this exact structure:
{
  "yourScore": <number 0-100 representing overall resume quality>,
  "industryAverage": <number 0-100 representing average resume score in this field>,
  "topPerformersAverage": <number 0-100 representing top 10% resume scores>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1 compared to successful resumes>", "<weakness 2>", "<weakness 3>"],
  "recommendations": [
    "<specific recommendation 1 based on what successful resumes in this field do>",
    "<recommendation 2>",
    "<recommendation 3>"
  ],
  "percentileRank": <number 0-100 representing where this resume ranks (0 = bottom, 100 = top)>
}

Be specific about what successful resumes in ${industry} for ${jobTitle} roles typically include that this resume might be missing.

Return ONLY valid JSON, no additional text.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    return extractJSON<CompetitorAnalysisResult>(response);
  } catch (error) {
    console.error('Error analyzing competitor resumes:', error);
    throw error;
  }
}

/**
 * Recommend optimal section ordering based on job description
 */
export async function recommendSectionOrder(
  resumeHTML: string,
  jobDescription: string,
  currentSections: string[]
): Promise<SectionReorderingResult> {
  const resumeText = stripHTML(resumeHTML);
  
  const systemPrompt = `You are an expert resume strategist who understands how to optimize resume structure for maximum ATS compatibility and recruiter impact based on job requirements.`;
  
  const prompt = `Analyze this resume and job description to recommend the optimal section ordering.

RESUME SECTIONS (current order):
${currentSections.map((s, i) => `${i + 1}. ${s}`).join('\n')}

RESUME CONTENT:
${resumeText.substring(0, 2000)} ${resumeText.length > 2000 ? '...' : ''}

JOB DESCRIPTION:
${jobDescription.substring(0, 2000)} ${jobDescription.length > 2000 ? '...' : ''}

Based on ATS best practices and what recruiters look for in this specific role, recommend the optimal section order.

Return a JSON object with this exact structure:
{
  "recommendedOrder": ["<section 1>", "<section 2>", "<section 3>", ...],
  "reasoning": [
    "<explanation 1 for why this order is optimal>",
    "<explanation 2>",
    "<explanation 3>"
  ],
  "impactScore": <number 0-100 representing how much this reordering would improve ATS score>
}

Consider:
1. Which sections are most relevant to the job description
2. ATS parsing preferences (contact info first, then most relevant content)
3. Recruiter scanning patterns (they read top-to-bottom)
4. Industry standards for this type of role

Return ONLY valid JSON, no additional text.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    return extractJSON<SectionReorderingResult>(response);
  } catch (error) {
    console.error('Error recommending section order:', error);
    throw error;
  }
}

/**
 * Generate bullet points from job description
 */
export async function generateBulletPointsFromJobDescription(
  jobDescription: string,
  jobTitle: string,
  company?: string,
  existingExperience?: string
): Promise<BulletPointGenerationResult> {
  const systemPrompt = `You are an expert resume writer who creates powerful, achievement-focused bullet points. You analyze job descriptions to identify key responsibilities and transform them into impactful resume statements.`;

  const prompt = `Generate 4-6 powerful resume bullet points based on this job description.

JOB TITLE: ${jobTitle}
${company ? `COMPANY: ${company}` : ''}

JOB DESCRIPTION:
${jobDescription}

${existingExperience ? `EXISTING EXPERIENCE (for context):\n${existingExperience}\n` : ''}

Transform the job description into resume bullet points that:
1. Use strong action verbs (Led, Developed, Implemented, etc.)
2. Include quantifiable metrics where possible
3. Focus on achievements and impact, not just responsibilities
4. Are ATS-friendly (no special characters)
5. Are concise (1-2 lines each)
6. Match the style and tone of professional resumes

Return a JSON object with this exact structure:
{
  "bulletPoints": [
    "<bullet point 1>",
    "<bullet point 2>",
    "<bullet point 3>",
    "<bullet point 4>",
    "<bullet point 5>",
    "<bullet point 6>"
  ],
  "source": "job-description",
  "confidence": <number 0-100>,
  "suggestions": [
    "<suggestion 1 for customizing these bullets>",
    "<suggestion 2>"
  ]
}

Return ONLY valid JSON, no additional text.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    return extractJSON<BulletPointGenerationResult>(response);
  } catch (error) {
    console.error('Error generating bullet points from job description:', error);
    throw error;
  }
}

/**
 * Extract achievements from LinkedIn/work history
 */
export async function extractAchievementsFromWorkHistory(
  workHistoryText: string,
  jobTitle?: string,
  company?: string
): Promise<AchievementExtractionResult> {
  const systemPrompt = `You are an expert at identifying and extracting quantifiable achievements from work history. You recognize patterns, metrics, and impact statements that make resumes stand out.`;

  const prompt = `Extract achievements from this work history text.

WORK HISTORY:
${workHistoryText}

${jobTitle ? `JOB TITLE: ${jobTitle}` : ''}
${company ? `COMPANY: ${company}` : ''}

Identify and extract:
1. Quantifiable achievements (with numbers, percentages, dollar amounts)
2. Qualitative achievements (leadership, innovation, process improvements)
3. Impact statements (results, outcomes, improvements)
4. Metrics and KPIs mentioned

Return a JSON object with this exact structure:
{
  "achievements": [
    {
      "achievement": "<the achievement statement>",
      "impact": "<the impact or result>",
      "metrics": ["<metric 1>", "<metric 2>"],
      "category": "quantitative|qualitative|leadership|innovation",
      "confidence": <number 0-100>
    }
  ],
  "summary": "<brief summary of the achievements found>"
}

Focus on achievements that:
- Show measurable impact
- Demonstrate value to the organization
- Highlight leadership or innovation
- Can be quantified or have clear outcomes

Return ONLY valid JSON, no additional text.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    return extractJSON<AchievementExtractionResult>(response);
  } catch (error) {
    console.error('Error extracting achievements:', error);
    throw error;
  }
}

/**
 * Auto-fill resume sections from uploaded documents
 */
export async function autoFillResumeSection(
  documentText: string,
  sectionName: string,
  existingContent?: string
): Promise<string> {
  const systemPrompt = `You are an expert resume parser and content organizer. You extract relevant information from documents and format it appropriately for resume sections.`;

  const sectionGuidelines: Record<string, string> = {
    'Experience': 'Extract job titles, companies, dates, responsibilities, and achievements. Format as: Job Title | Company | Date Range, followed by bullet points.',
    'Education': 'Extract degrees, institutions, graduation dates, fields of study, and honors. Format as: Degree in Field | Institution | Year.',
    'Skills': 'Extract technical skills, soft skills, tools, technologies, and certifications. Format as a comma-separated list or categorized list.',
    'Summary': 'Create a professional summary (2-3 sentences) highlighting key qualifications, experience, and value proposition.',
    'Certifications': 'Extract certification names, issuing organizations, dates, and expiration dates if applicable.',
    'Projects': 'Extract project names, descriptions, technologies used, and outcomes. Format with project name, description, and technologies.'
  };

  const prompt = `Extract and format information for the "${sectionName}" section from this document.

DOCUMENT TEXT:
${documentText.substring(0, 3000)} ${documentText.length > 3000 ? '...' : ''}

${existingContent ? `EXISTING CONTENT (to merge with):\n${existingContent}\n` : ''}

SECTION: ${sectionName}
${sectionGuidelines[sectionName] || 'Format appropriately for a professional resume section.'}

Guidelines:
1. Extract only relevant information for this section
2. Format according to resume conventions
3. Use professional language
4. Maintain ATS compatibility
5. ${existingContent ? 'Merge with existing content, avoiding duplicates' : 'Create complete section content'}
6. Keep it concise and impactful

Return ONLY the formatted section content, no JSON or explanation.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    return response.trim();
  } catch (error) {
    console.error('Error auto-filling resume section:', error);
    throw error;
  }
}

/**
 * Generate multiple variations of the same experience
 */
export async function generateExperienceVariations(
  experienceText: string,
  jobTitle: string,
  targetAudience?: 'ats' | 'recruiter' | 'technical-manager' | 'executive',
  style?: 'achievement-focused' | 'responsibility-focused' | 'impact-focused' | 'technical' | 'leadership'
): Promise<ExperienceVariationsResult> {
  const systemPrompt = `You are an expert resume writer who creates multiple variations of experience descriptions optimized for different audiences and purposes.`;

  const styleGuidelines: Record<string, string> = {
    'achievement-focused': 'Emphasize quantifiable achievements, metrics, and results. Use numbers, percentages, and dollar amounts.',
    'responsibility-focused': 'Emphasize duties, responsibilities, and scope of work. Show breadth of experience.',
    'impact-focused': 'Emphasize business impact, outcomes, and value delivered. Show how work affected the organization.',
    'technical': 'Emphasize technologies, tools, methodologies, and technical skills. Use technical terminology.',
    'leadership': 'Emphasize team leadership, mentoring, collaboration, and people management. Show influence and guidance.'
  };

  const audienceGuidelines: Record<string, string> = {
    'ats': 'Optimize for keyword matching. Use industry-standard terminology. Focus on ATS-friendly formatting.',
    'recruiter': 'Make it easy to scan. Use clear, compelling language. Highlight standout achievements.',
    'technical-manager': 'Include technical depth. Show problem-solving and technical expertise.',
    'executive': 'Emphasize strategic impact, business outcomes, and leadership. Use high-level language.'
  };

  const prompt = `Generate 5 variations of this experience description.

ORIGINAL EXPERIENCE:
${experienceText}

JOB TITLE: ${jobTitle}

${style ? `STYLE FOCUS: ${style}\n${styleGuidelines[style]}\n` : ''}
${targetAudience ? `TARGET AUDIENCE: ${targetAudience}\n${audienceGuidelines[targetAudience]}\n` : ''}

Create 5 different variations, each optimized for:
1. Achievement-focused (emphasize metrics and results)
2. Responsibility-focused (emphasize duties and scope)
3. Impact-focused (emphasize business value)
4. Technical (emphasize technologies and skills)
5. Leadership (emphasize team and influence)

Return a JSON object with this exact structure:
{
  "original": "${experienceText}",
  "variations": [
    {
      "variation": "<variation 1 text>",
      "style": "achievement-focused",
      "targetAudience": "ats",
      "wordCount": <number>
    },
    {
      "variation": "<variation 2 text>",
      "style": "responsibility-focused",
      "targetAudience": "recruiter",
      "wordCount": <number>
    },
    {
      "variation": "<variation 3 text>",
      "style": "impact-focused",
      "targetAudience": "technical-manager",
      "wordCount": <number>
    },
    {
      "variation": "<variation 4 text>",
      "style": "technical",
      "targetAudience": "ats",
      "wordCount": <number>
    },
    {
      "variation": "<variation 5 text>",
      "style": "leadership",
      "targetAudience": "executive",
      "wordCount": <number>
    }
  ],
  "recommendations": [
    "<recommendation 1 for when to use each variation>",
    "<recommendation 2>",
    "<recommendation 3>"
  ]
}

Each variation should:
- Maintain the same core information
- Be optimized for its specific style and audience
- Be ATS-friendly
- Be concise (50-100 words typically)
- Use strong action verbs

Return ONLY valid JSON, no additional text.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    return extractJSON<ExperienceVariationsResult>(response);
  } catch (error) {
    console.error('Error generating experience variations:', error);
    throw error;
  }
}


