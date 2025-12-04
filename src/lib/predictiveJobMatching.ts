/**
 * Predictive Job Matching Service
 * ML-based job recommendation, salary prediction, and success probability scoring
 */

import { getOpenAIKey } from './apiKey';

// --- Types ---
export interface ResumeProfile {
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    field: string;
    institution: string;
  }>;
  location?: string;
  yearsOfExperience: number;
  industry?: string;
  currentSalary?: number;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salaryRange?: string;
  postedDate: string;
  source: string;
  industry?: string;
  experienceLevel?: string;
}

export interface JobRecommendation {
  job: JobListing;
  matchScore: number;
  confidence: number;
  reasons: string[];
  salaryPrediction: SalaryPrediction;
  successProbability: SuccessProbability;
  recommendedActions: string[];
}

export interface SalaryPrediction {
  predictedMin: number;
  predictedMax: number;
  predictedMedian: number;
  confidence: number;
  factors: string[];
  marketComparison: {
    percentile: number;
    industryAverage: number;
    locationAdjustment: number;
  };
}

export interface SuccessProbability {
  overallProbability: number; // 0-100
  breakdown: {
    qualifications: number;
    experience: number;
    skills: number;
    location: number;
    timing: number;
  };
  riskFactors: string[];
  improvementSuggestions: string[];
}

export interface JobAlert {
  id: string;
  criteria: {
    keywords: string[];
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    industry?: string;
    experienceLevel?: string;
  };
  frequency: 'daily' | 'weekly' | 'realtime';
  lastChecked: string;
  active: boolean;
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
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return JSON.parse(text);
}

// --- Main Functions ---

/**
 * Get ML-based job recommendations based on resume profile
 */
export async function getJobRecommendations(
  profile: ResumeProfile,
  jobListings: JobListing[],
  limit: number = 10
): Promise<JobRecommendation[]> {
  const systemPrompt = `You are an expert job matching AI with deep knowledge of career paths, skill requirements, and job market trends. You analyze resumes and job listings to provide intelligent, personalized recommendations.`;

  const profileSummary = `
RESUME PROFILE:
- Skills: ${profile.skills.join(', ')}
- Years of Experience: ${profile.yearsOfExperience}
- Industry: ${profile.industry || 'Not specified'}
- Location: ${profile.location || 'Not specified'}
- Experience: ${profile.experience.map(e => `${e.title} at ${e.company}`).join(', ')}
- Education: ${profile.education.map(e => `${e.degree} in ${e.field}`).join(', ')}
`;

  const jobsSummary = jobListings.slice(0, 20).map((job, idx) => `
JOB ${idx + 1}:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Description: ${job.description.substring(0, 300)}...
Requirements: ${job.requirements.substring(0, 200)}...
`).join('\n');

  const prompt = `Analyze this resume profile and rank these job listings by how well they match.

${profileSummary}

AVAILABLE JOBS:
${jobsSummary}

For each job, provide:
1. Match score (0-100) based on skills, experience, qualifications, and career fit
2. Confidence level (0-100) in the recommendation
3. Specific reasons why this job matches (or doesn't)
4. Salary prediction based on profile and job requirements
5. Application success probability
6. Recommended actions to improve match

Return a JSON array with this exact structure:
[
  {
    "jobId": "<job id>",
    "matchScore": <number 0-100>,
    "confidence": <number 0-100>,
    "reasons": ["<reason 1>", "<reason 2>", "<reason 3>"],
    "salaryPrediction": {
      "predictedMin": <number in thousands>,
      "predictedMax": <number in thousands>,
      "predictedMedian": <number in thousands>,
      "confidence": <number 0-100>,
      "factors": ["<factor 1>", "<factor 2>"],
      "marketComparison": {
        "percentile": <number 0-100>,
        "industryAverage": <number in thousands>,
        "locationAdjustment": <number percentage>
      }
    },
    "successProbability": {
      "overallProbability": <number 0-100>,
      "breakdown": {
        "qualifications": <number 0-100>,
        "experience": <number 0-100>,
        "skills": <number 0-100>,
        "location": <number 0-100>,
        "timing": <number 0-100>
      },
      "riskFactors": ["<risk 1>", "<risk 2>"],
      "improvementSuggestions": ["<suggestion 1>", "<suggestion 2>"]
    },
    "recommendedActions": ["<action 1>", "<action 2>"]
  }
]

Rank jobs from highest to lowest match score. Return ONLY valid JSON, no additional text.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    const recommendations = extractJSON<Array<{
      jobId: string;
      matchScore: number;
      confidence: number;
      reasons: string[];
      salaryPrediction: SalaryPrediction;
      successProbability: SuccessProbability;
      recommendedActions: string[];
    }>>(response);

    // Merge recommendations with job listings
    return recommendations
      .map(rec => {
        const job = jobListings.find(j => j.id === rec.jobId);
        if (!job) return null;
        return {
          job,
          matchScore: rec.matchScore,
          confidence: rec.confidence,
          reasons: rec.reasons,
          salaryPrediction: rec.salaryPrediction,
          successProbability: rec.successProbability,
          recommendedActions: rec.recommendedActions
        } as JobRecommendation;
      })
      .filter((rec): rec is JobRecommendation => rec !== null)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting job recommendations:', error);
    throw error;
  }
}

/**
 * Predict salary range for a job based on resume profile
 */
export async function predictSalary(
  profile: ResumeProfile,
  jobListing: JobListing
): Promise<SalaryPrediction> {
  const systemPrompt = `You are a compensation analyst with access to salary data across industries, locations, and experience levels. You provide accurate salary predictions based on market data.`;

  const prompt = `Predict the salary range for this job based on the candidate's profile and job requirements.

CANDIDATE PROFILE:
- Skills: ${profile.skills.join(', ')}
- Years of Experience: ${profile.yearsOfExperience}
- Current Salary: ${profile.currentSalary ? `$${profile.currentSalary}k` : 'Not provided'}
- Location: ${profile.location || 'Not specified'}
- Industry: ${profile.industry || 'Not specified'}

JOB LISTING:
Title: ${jobListing.title}
Company: ${jobListing.company}
Location: ${jobListing.location}
Description: ${jobListing.description.substring(0, 500)}
Requirements: ${jobListing.requirements.substring(0, 300)}
${jobListing.salaryRange ? `Posted Salary Range: ${jobListing.salaryRange}` : ''}

Provide a salary prediction considering:
1. Market rates for this role and location
2. Candidate's experience level
3. Industry standards
4. Company size and type (if inferable)
5. Required skills and qualifications

Return a JSON object with this exact structure:
{
  "predictedMin": <number in thousands, e.g., 80 for $80k>,
  "predictedMax": <number in thousands, e.g., 120 for $120k>,
  "predictedMedian": <number in thousands>,
  "confidence": <number 0-100>,
  "factors": ["<factor 1>", "<factor 2>", "<factor 3>"],
  "marketComparison": {
    "percentile": <number 0-100 representing where this salary falls in the market>,
    "industryAverage": <number in thousands>,
    "locationAdjustment": <number percentage, e.g., 15 for 15% above/below average>
  }
}

Return ONLY valid JSON, no additional text.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    return extractJSON<SalaryPrediction>(response);
  } catch (error) {
    console.error('Error predicting salary:', error);
    throw error;
  }
}

/**
 * Calculate application success probability
 */
export async function calculateSuccessProbability(
  profile: ResumeProfile,
  jobListing: JobListing
): Promise<SuccessProbability> {
  const systemPrompt = `You are an expert recruiter and career advisor with deep knowledge of hiring processes, candidate evaluation, and what makes applications successful.`;

  const prompt = `Calculate the probability of success for this candidate applying to this job.

CANDIDATE PROFILE:
- Skills: ${profile.skills.join(', ')}
- Years of Experience: ${profile.yearsOfExperience}
- Experience: ${profile.experience.map(e => `${e.title} at ${e.company} - ${e.description.substring(0, 100)}`).join('\n')}
- Education: ${profile.education.map(e => `${e.degree} in ${e.field} from ${e.institution}`).join(', ')}
- Location: ${profile.location || 'Not specified'}

JOB LISTING:
Title: ${jobListing.title}
Company: ${jobListing.company}
Location: ${jobListing.location}
Description: ${jobListing.description}
Requirements: ${jobListing.requirements}
Experience Level: ${jobListing.experienceLevel || 'Not specified'}

Analyze:
1. How well qualifications match requirements
2. Experience relevance and level
3. Skills alignment
4. Location compatibility (remote/onsite)
5. Timing factors (job posting age, market conditions)

Return a JSON object with this exact structure:
{
  "overallProbability": <number 0-100>,
  "breakdown": {
    "qualifications": <number 0-100>,
    "experience": <number 0-100>,
    "skills": <number 0-100>,
    "location": <number 0-100>,
    "timing": <number 0-100>
  },
  "riskFactors": ["<risk factor 1>", "<risk factor 2>", "<risk factor 3>"],
  "improvementSuggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"]
}

Be realistic and specific. Return ONLY valid JSON, no additional text.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    return extractJSON<SuccessProbability>(response);
  } catch (error) {
    console.error('Error calculating success probability:', error);
    throw error;
  }
}

/**
 * Generate job alerts based on profile changes
 */
export async function generateJobAlerts(
  profile: ResumeProfile,
  previousProfile?: ResumeProfile
): Promise<JobAlert[]> {
  const systemPrompt = `You are an intelligent job alert system that creates personalized job search criteria based on candidate profiles and career goals.`;

  const profileChanges = previousProfile ? `
PROFILE CHANGES DETECTED:
${profile.skills.filter(s => !previousProfile.skills.includes(s)).length > 0 
  ? `- New skills: ${profile.skills.filter(s => !previousProfile.skills.includes(s)).join(', ')}` 
  : ''}
${profile.yearsOfExperience > (previousProfile.yearsOfExperience || 0)
  ? `- Experience increased from ${previousProfile.yearsOfExperience} to ${profile.yearsOfExperience} years`
  : ''}
${profile.experience.length > (previousProfile.experience.length || 0)
  ? `- New experience added`
  : ''}
` : 'This is a new profile.';

  const prompt = `Generate intelligent job alert criteria based on this candidate profile.

CURRENT PROFILE:
- Skills: ${profile.skills.join(', ')}
- Years of Experience: ${profile.yearsOfExperience}
- Industry: ${profile.industry || 'Not specified'}
- Location: ${profile.location || 'Not specified'}
- Current Role: ${profile.experience[0]?.title || 'Not specified'}

${profileChanges}

Create 2-3 job alert configurations that would help this candidate find relevant opportunities. Consider:
1. Current skills and experience level
2. Natural career progression paths
3. Related roles that leverage their background
4. Industry trends and growth areas

Return a JSON array with this exact structure:
[
  {
    "criteria": {
      "keywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>"],
      "location": "<location or 'Remote' or 'Any'>",
      "salaryMin": <number in thousands or null>,
      "salaryMax": <number in thousands or null>,
      "industry": "<industry or null>",
      "experienceLevel": "<entry|mid|senior|executive or null>"
    },
    "frequency": "daily|weekly|realtime",
    "description": "<brief description of what this alert finds>"
  }
]

Return ONLY valid JSON, no additional text.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    const alerts = extractJSON<Array<{
      criteria: JobAlert['criteria'];
      frequency: JobAlert['frequency'];
      description: string;
    }>>(response);

    return alerts.map((alert, idx) => ({
      id: `alert-${Date.now()}-${idx}`,
      criteria: alert.criteria,
      frequency: alert.frequency,
      lastChecked: new Date().toISOString(),
      active: true
    }));
  } catch (error) {
    console.error('Error generating job alerts:', error);
    throw error;
  }
}

/**
 * Quick match score calculation (lightweight, for real-time use)
 */
export function calculateQuickMatchScore(
  profile: ResumeProfile,
  jobListing: JobListing
): number {
  let score = 0;

  // Skills matching (40 points)
  const jobText = `${jobListing.title} ${jobListing.description} ${jobListing.requirements}`.toLowerCase();
  const matchedSkills = profile.skills.filter(skill => 
    jobText.includes(skill.toLowerCase())
  );
  score += (matchedSkills.length / Math.max(profile.skills.length, 1)) * 40;

  // Experience level (20 points)
  const experienceMatch = jobListing.experienceLevel 
    ? (profile.yearsOfExperience >= 3 && jobListing.experienceLevel.includes('senior') ? 20 :
       profile.yearsOfExperience >= 1 && jobListing.experienceLevel.includes('mid') ? 15 :
       profile.yearsOfExperience < 2 && jobListing.experienceLevel.includes('entry') ? 20 : 10)
    : 10;
  score += experienceMatch;

  // Location (20 points)
  if (jobListing.location.toLowerCase().includes('remote')) {
    score += 20;
  } else if (profile.location && jobListing.location.toLowerCase().includes(profile.location.toLowerCase())) {
    score += 20;
  } else {
    score += 5; // Partial match
  }

  // Title/role matching (20 points)
  const profileTitles = profile.experience.map(e => e.title.toLowerCase());
  const titleMatch = profileTitles.some(title => 
    jobListing.title.toLowerCase().includes(title) || 
    title.includes(jobListing.title.toLowerCase())
  );
  score += titleMatch ? 20 : 5;

  return Math.min(100, Math.round(score));
}



