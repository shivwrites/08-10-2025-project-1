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
export async function enhanceResumeText(selectedText: string, context?: string): Promise<EnhancedTextResult> {
  const systemPrompt = `You are an expert resume writer and career coach. Your specialty is transforming ordinary resume content into powerful, achievement-focused statements that capture attention and demonstrate value.`;
  
  const prompt = `Enhance this resume text to be more impactful, professional, and achievement-oriented.

ORIGINAL TEXT:
${selectedText}

${context ? `CONTEXT (surrounding content):\n${context}\n` : ''}

Guidelines:
1. Use strong action verbs at the beginning
2. Include quantifiable metrics where possible (numbers, percentages, dollar amounts)
3. Focus on achievements and impact, not just responsibilities
4. Keep it concise but powerful
5. Use industry-appropriate language
6. Ensure ATS compatibility (avoid graphics, tables in text)

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

