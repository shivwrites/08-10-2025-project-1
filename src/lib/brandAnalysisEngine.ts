/**
 * Brand Analysis Engine
 * Core analysis logic using OpenAI for comprehensive brand scoring and recommendations
 */

import { getOpenAIKey } from './apiKey';
import type { ResumeData } from './resumeParser';
import type { GitHubAnalysis } from './github';
import type { PortfolioAnalysis } from './portfolioAnalyzer';
import type { LinkedInProfileData } from './linkedinProfileFetcher';

export interface BrandScore {
  overall: number;
  linkedin: number;
  resume: number;
  portfolio: number;
  github: number;
}

export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: 'LinkedIn' | 'Resume' | 'Portfolio' | 'GitHub' | 'General';
  title: string;
  description: string;
  impact: string;
  difficulty: 'easy' | 'medium' | 'hard';
  example: string;
  actionableSteps?: string[];
}

export interface BrandArchetype {
  name: string;
  description: string;
  traits: string[];
}

export interface IndustryBenchmark {
  average: number;
  top10Percent: number;
  top25Percent: number;
}

export interface BrandAnalysisResult {
  brandScore: BrandScore;
  recommendations: Recommendation[];
  brandArchetype: BrandArchetype;
  industryBenchmark: IndustryBenchmark;
  analysisDetails: {
    resumeAnalysis: any;
    linkedinAnalysis: any;
    githubAnalysis: any;
    portfolioAnalysis: any;
  };
}

/**
 * Analyze resume data
 */
export async function analyzeResume(resumeData: ResumeData | null): Promise<{
  score: number;
  strengths: string[];
  weaknesses: string[];
  details: any;
}> {
  if (!resumeData) {
    return {
      score: 0,
      strengths: [],
      weaknesses: ['No resume data provided'],
      details: null,
    };
  }

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  let score = 50; // Base score

  // Check personal info completeness
  if (resumeData.personalInfo?.name) score += 5;
  if (resumeData.personalInfo?.email) score += 5;
  if (resumeData.personalInfo?.phone) score += 3;
  if (resumeData.personalInfo?.location) score += 2;

  // Check summary
  if (resumeData.summary && resumeData.summary.length > 100) {
    strengths.push('Strong professional summary');
    score += 10;
  } else if (!resumeData.summary) {
    weaknesses.push('Missing professional summary');
    score -= 10;
  }

  // Check skills
  const totalSkills = (resumeData.skills?.technical?.length || 0) +
    (resumeData.skills?.soft?.length || 0);
  if (totalSkills > 10) {
    strengths.push(`Comprehensive skill set (${totalSkills} skills)`);
    score += 10;
  } else if (totalSkills < 5) {
    weaknesses.push('Limited skills listed');
    score -= 8;
  }

  // Check experience
  const experienceCount = resumeData.experience?.length || 0;
  if (experienceCount > 0) {
    strengths.push(`${experienceCount} experience entries`);
    score += Math.min(experienceCount * 5, 20);
    
    // Check for quantifiable achievements
    const hasAchievements = resumeData.experience.some(exp => 
      exp.achievements && exp.achievements.length > 0
    );
    if (hasAchievements) {
      strengths.push('Experience includes quantifiable achievements');
      score += 10;
    } else {
      weaknesses.push('Experience lacks quantifiable achievements');
      score -= 8;
    }
  } else {
    weaknesses.push('No work experience listed');
    score -= 15;
  }

  // Check education
  if (resumeData.education && resumeData.education.length > 0) {
    score += 5;
  } else {
    weaknesses.push('Missing education information');
    score -= 5;
  }

  // Check projects
  if (resumeData.projects && resumeData.projects.length > 0) {
    strengths.push(`${resumeData.projects.length} projects listed`);
    score += Math.min(resumeData.projects.length * 3, 10);
  }

  return {
    score: Math.min(Math.max(score, 0), 100),
    strengths,
    weaknesses,
    details: resumeData,
  };
}

/**
 * Analyze LinkedIn profile
 */
export async function analyzeLinkedIn(linkedInData: LinkedInProfileData | null): Promise<{
  score: number;
  strengths: string[];
  weaknesses: string[];
  details: any;
}> {
  if (!linkedInData) {
    return {
      score: 0,
      strengths: [],
      weaknesses: ['No LinkedIn data provided'],
      details: null,
    };
  }

  const analysis = {
    score: linkedInData.profileCompleteness,
    strengths: [] as string[],
    weaknesses: [] as string[],
    details: linkedInData,
  };

  // Add analysis based on profile completeness
  if (linkedInData.headline) {
    analysis.strengths.push('Headline present');
  } else {
    analysis.weaknesses.push('Missing headline');
  }

  if (linkedInData.summary) {
    analysis.strengths.push('Summary/about section present');
  } else {
    analysis.weaknesses.push('Missing summary/about section');
  }

  if (linkedInData.experienceCount > 0) {
    analysis.strengths.push(`${linkedInData.experienceCount} experience entries`);
  } else {
    analysis.weaknesses.push('No experience entries');
  }

  if (linkedInData.skills.length > 0) {
    analysis.strengths.push(`${linkedInData.skills.length} skills listed`);
  } else {
    analysis.weaknesses.push('No skills listed');
  }

  return analysis;
}

/**
 * Analyze GitHub profile
 */
export async function analyzeGitHub(githubData: GitHubAnalysis | null): Promise<{
  score: number;
  strengths: string[];
  weaknesses: string[];
  details: any;
}> {
  if (!githubData) {
    return {
      score: 0,
      strengths: [],
      weaknesses: ['No GitHub data provided'],
      details: null,
    };
  }

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  let score = githubData.overallScore;

  // Analyze repository count
  if (githubData.repos.length > 5) {
    strengths.push(`Active GitHub presence (${githubData.repos.length} repositories)`);
  } else if (githubData.repos.length === 0) {
    weaknesses.push('No public repositories');
    score -= 20;
  }

  // Analyze README quality
  if (githubData.readmeQuality > 70) {
    strengths.push('Good README documentation');
  } else if (githubData.readmeQuality < 50) {
    weaknesses.push('Many repositories lack README files');
  }

  // Analyze documentation
  if (githubData.documentationScore > 70) {
    strengths.push('Strong documentation across repositories');
  } else {
    weaknesses.push('Documentation could be improved');
  }

  // Analyze activity
  if (githubData.activityScore > 60) {
    strengths.push('Active recent contributions');
  } else {
    weaknesses.push('Low recent activity');
  }

  // Analyze stars and forks
  if (githubData.totalStars > 10) {
    strengths.push(`Repository has ${githubData.totalStars} stars`);
  }

  return {
    score: Math.min(Math.max(score, 0), 100),
    strengths,
    weaknesses,
    details: githubData,
  };
}

/**
 * Analyze portfolio
 */
export async function analyzePortfolio(portfolioData: PortfolioAnalysis | null): Promise<{
  score: number;
  strengths: string[];
  weaknesses: string[];
  details: any;
}> {
  if (!portfolioData) {
    return {
      score: 0,
      strengths: [],
      weaknesses: ['No portfolio data provided'],
      details: null,
    };
  }

  if (!portfolioData.isAccessible) {
    return {
      score: 0,
      strengths: [],
      weaknesses: ['Portfolio website is not accessible'],
      details: portfolioData,
    };
  }

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  let score = portfolioData.overallScore;

  // Add strengths from analysis
  portfolioData.strengths.forEach(strength => {
    strengths.push(strength);
  });

  // Add weaknesses from analysis
  portfolioData.issues.forEach(issue => {
    weaknesses.push(issue);
  });

  // Check for essential sections
  if (portfolioData.hasContactInfo) {
    strengths.push('Contact information available');
  } else {
    weaknesses.push('Missing contact information');
    score -= 10;
  }

  if (portfolioData.hasProjects) {
    strengths.push('Projects/portfolio section present');
  } else {
    weaknesses.push('Missing projects showcase');
    score -= 10;
  }

  if (portfolioData.hasAboutSection) {
    strengths.push('About section present');
  } else {
    weaknesses.push('Missing about section');
    score -= 5;
  }

  // Check mobile responsiveness
  if (portfolioData.mobileResponsive === true) {
    strengths.push('Mobile responsive design');
  } else if (portfolioData.mobileResponsive === false) {
    weaknesses.push('Not mobile responsive');
    score -= 10;
  }

  return {
    score: Math.min(Math.max(score, 0), 100),
    strengths,
    weaknesses,
    details: portfolioData,
  };
}

/**
 * Generate brand score from all analyses
 */
export function generateBrandScore(analyses: {
  resume: { score: number };
  linkedin: { score: number };
  github: { score: number };
  portfolio: { score: number };
}): BrandScore {
  const scores = {
    resume: analyses.resume.score,
    linkedin: analyses.linkedin.score,
    github: analyses.github.score,
    portfolio: analyses.portfolio.score,
  };

  // Calculate overall score (weighted average)
  const weights = {
    resume: 0.3,
    linkedin: 0.3,
    github: 0.2,
    portfolio: 0.2,
  };

  const overall = Math.round(
    scores.resume * weights.resume +
    scores.linkedin * weights.linkedin +
    scores.github * weights.github +
    scores.portfolio * weights.portfolio
  );

  return {
    overall: Math.min(Math.max(overall, 0), 100),
    linkedin: scores.linkedin,
    resume: scores.resume,
    portfolio: scores.portfolio,
    github: scores.github,
  };
}

/**
 * Generate recommendations using OpenAI
 */
export async function generateRecommendations(
  analyses: {
    resume: { score: number; strengths: string[]; weaknesses: string[] };
    linkedin: { score: number; strengths: string[]; weaknesses: string[] };
    github: { score: number; strengths: string[]; weaknesses: string[] };
    portfolio: { score: number; strengths: string[]; weaknesses: string[] };
  },
  details: any
): Promise<Recommendation[]> {
  const apiKey = getOpenAIKey();
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please set it in Settings.');
  }

  const prompt = `Based on the following brand analysis, generate personalized recommendations. Return ONLY valid JSON array with this exact structure:
[
  {
    "id": "<unique-id>",
    "priority": "<high|medium|low>",
    "category": "<LinkedIn|Resume|Portfolio|GitHub|General>",
    "title": "<short recommendation title>",
    "description": "<detailed description of the recommendation>",
    "impact": "<High impact|Medium impact|Low impact>",
    "difficulty": "<easy|medium|hard>",
    "example": "<specific example or before/after>",
    "actionableSteps": ["<step 1>", "<step 2>", ...]
  },
  ...
]

Analysis Results:
- Resume Score: ${analyses.resume.score}/100
  Strengths: ${analyses.resume.strengths.join(', ') || 'None'}
  Weaknesses: ${analyses.resume.weaknesses.join(', ') || 'None'}

- LinkedIn Score: ${analyses.linkedin.score}/100
  Strengths: ${analyses.linkedin.strengths.join(', ') || 'None'}
  Weaknesses: ${analyses.linkedin.weaknesses.join(', ') || 'None'}

- GitHub Score: ${analyses.github.score}/100
  Strengths: ${analyses.github.strengths.join(', ') || 'None'}
  Weaknesses: ${analyses.github.weaknesses.join(', ') || 'None'}

- Portfolio Score: ${analyses.portfolio.score}/100
  Strengths: ${analyses.portfolio.strengths.join(', ') || 'None'}
  Weaknesses: ${analyses.portfolio.weaknesses.join(', ') || 'None'}

Generate 5-8 specific, actionable recommendations prioritized by impact and addressing the weaknesses. Focus on high-impact, achievable improvements.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to generate recommendations');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from OpenAI');
    }

    const recommendations = JSON.parse(jsonMatch[0]);
    
    // Validate and ensure all required fields
    return recommendations.map((rec: any, index: number) => ({
      id: rec.id || `rec-${Date.now()}-${index}`,
      priority: rec.priority || 'medium',
      category: rec.category || 'General',
      title: rec.title || 'Improvement opportunity',
      description: rec.description || '',
      impact: rec.impact || 'Medium impact',
      difficulty: rec.difficulty || 'medium',
      example: rec.example || '',
      actionableSteps: rec.actionableSteps || [],
    }));
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
}

/**
 * Determine brand archetype using OpenAI
 */
export async function determineBrandArchetype(
  brandScore: BrandScore,
  analyses: any
): Promise<BrandArchetype> {
  const apiKey = getOpenAIKey();
  
  if (!apiKey) {
    // Return default archetype if no API key
    return {
      name: 'The Professional',
      description: 'A well-rounded professional with a balanced online presence.',
      traits: ['Professional', 'Balanced', 'Versatile'],
    };
  }

  const prompt = `Based on the following brand analysis, determine the brand archetype. Return ONLY valid JSON with this exact structure:
{
  "name": "<archetype name like 'The Innovator', 'The Leader', 'The Specialist', etc.>",
  "description": "<2-3 sentence description of this archetype>",
  "traits": ["<trait1>", "<trait2>", "<trait3>"]
}

Brand Scores:
- Overall: ${brandScore.overall}/100
- LinkedIn: ${brandScore.linkedin}/100
- Resume: ${brandScore.resume}/100
- GitHub: ${brandScore.github}/100
- Portfolio: ${brandScore.portfolio}/100

Generate an appropriate brand archetype that reflects this professional's positioning.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to determine brand archetype');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error determining brand archetype:', error);
    // Return default archetype on error
    return {
      name: 'The Professional',
      description: 'A well-rounded professional with a balanced online presence.',
      traits: ['Professional', 'Balanced', 'Versatile'],
    };
  }
}

/**
 * Calculate industry benchmarks
 */
export function calculateIndustryBenchmark(overallScore: number): IndustryBenchmark {
  // These are relative benchmarks based on typical distribution
  // In production, these would come from actual industry data
  const average = 65;
  const top25Percent = 75;
  const top10Percent = 85;

  return {
    average,
    top10Percent,
    top25Percent,
  };
}

/**
 * Perform complete brand analysis
 */
export async function performBrandAnalysis(data: {
  resumeData: ResumeData | null;
  linkedInData: LinkedInProfileData | null;
  githubData: GitHubAnalysis | null;
  portfolioData: PortfolioAnalysis | null;
}): Promise<BrandAnalysisResult> {
  // Analyze each component
  const resumeAnalysis = await analyzeResume(data.resumeData);
  const linkedinAnalysis = await analyzeLinkedIn(data.linkedInData);
  const githubAnalysis = await analyzeGitHub(data.githubData);
  const portfolioAnalysis = await analyzePortfolio(data.portfolioData);

  // Generate brand score
  const brandScore = generateBrandScore({
    resume: resumeAnalysis,
    linkedin: linkedinAnalysis,
    github: githubAnalysis,
    portfolio: portfolioAnalysis,
  });

  // Generate recommendations
  const recommendations = await generateRecommendations(
    {
      resume: resumeAnalysis,
      linkedin: linkedinAnalysis,
      github: githubAnalysis,
      portfolio: portfolioAnalysis,
    },
    {
      resume: data.resumeData,
      linkedin: data.linkedInData,
      github: data.githubData,
      portfolio: data.portfolioData,
    }
  );

  // Determine brand archetype
  const brandArchetype = await determineBrandArchetype(brandScore, {
    resume: resumeAnalysis,
    linkedin: linkedinAnalysis,
    github: githubAnalysis,
    portfolio: portfolioAnalysis,
  });

  // Calculate industry benchmark
  const industryBenchmark = calculateIndustryBenchmark(brandScore.overall);

  return {
    brandScore,
    recommendations,
    brandArchetype,
    industryBenchmark,
    analysisDetails: {
      resumeAnalysis,
      linkedinAnalysis,
      githubAnalysis,
      portfolioAnalysis,
    },
  };
}


