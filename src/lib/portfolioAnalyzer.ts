/**
 * Portfolio Analyzer Utility
 * Analyzes portfolio websites for brand presence quality
 */

import { getOpenAIKey } from './apiKey';

export interface PortfolioAnalysis {
  url: string;
  isAccessible: boolean;
  title: string | null;
  description: string | null;
  hasContactInfo: boolean;
  hasProjects: boolean;
  hasAboutSection: boolean;
  designQuality: number; // 0-100
  contentQuality: number; // 0-100
  uxScore: number; // 0-100
  mobileResponsive: boolean | null;
  overallScore: number; // 0-100
  issues: string[];
  strengths: string[];
}

/**
 * Validate portfolio URL format
 */
export function validatePortfolioUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Fetch portfolio content (HTML)
 * Note: CORS may prevent direct fetching. This is a basic implementation.
 */
export async function fetchPortfolioContent(url: string): Promise<string> {
  try {
    // First, try direct fetch
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    return html;
  } catch (error) {
    // If CORS fails, we can't fetch directly
    // In production, this would need a proxy server
    if (error instanceof TypeError && error.message.includes('CORS')) {
      throw new Error('Cannot fetch portfolio due to CORS restrictions. Please ensure the website allows cross-origin requests.');
    }
    throw error;
  }
}

/**
 * Extract basic information from HTML
 */
function extractBasicInfo(html: string): {
  title: string | null;
  description: string | null;
  hasContactInfo: boolean;
  hasProjects: boolean;
  hasAboutSection: boolean;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Extract title
  const title = doc.querySelector('title')?.textContent?.trim() || null;

  // Extract meta description
  const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
    doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || null;

  // Check for contact information
  const contactKeywords = ['contact', 'email', 'mail', 'reach', 'get in touch'];
  const bodyText = doc.body?.textContent?.toLowerCase() || '';
  const hasContactInfo = contactKeywords.some(keyword => bodyText.includes(keyword));

  // Check for projects section
  const projectKeywords = ['project', 'portfolio', 'work', 'case study', 'showcase'];
  const hasProjects = projectKeywords.some(keyword => bodyText.includes(keyword));

  // Check for about section
  const aboutKeywords = ['about', 'bio', 'biography', 'who am i', 'introduction'];
  const hasAboutSection = aboutKeywords.some(keyword => bodyText.includes(keyword));

  return {
    title,
    description: metaDescription,
    hasContactInfo,
    hasProjects,
    hasAboutSection,
  };
}

/**
 * Analyze portfolio with AI using OpenAI
 */
export async function analyzePortfolioWithAI(
  html: string,
  url: string
): Promise<{
  designQuality: number;
  contentQuality: number;
  uxScore: number;
  mobileResponsive: boolean | null;
  issues: string[];
  strengths: string[];
}> {
  const apiKey = getOpenAIKey();
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please set it in Settings.');
  }

  // Extract text content (remove scripts, styles, etc.)
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Remove script and style elements
  const scripts = doc.querySelectorAll('script, style, noscript');
  scripts.forEach(el => el.remove());
  
  const textContent = doc.body?.textContent || '';
  const title = doc.querySelector('title')?.textContent || '';
  const headings = Array.from(doc.querySelectorAll('h1, h2, h3')).map(h => h.textContent).join('\n');
  
  // Check for mobile responsive indicators
  const viewport = doc.querySelector('meta[name="viewport"]');
  const mobileResponsive = viewport !== null;

  // Limit content size for API
  const contentToAnalyze = `
URL: ${url}
Title: ${title}
Headings: ${headings.substring(0, 500)}
Content Preview: ${textContent.substring(0, 2000)}
`.trim();

  const prompt = `Analyze this portfolio website and provide a detailed assessment. Return ONLY valid JSON with this exact structure:
{
  "designQuality": <number 0-100>,
  "contentQuality": <number 0-100>,
  "uxScore": <number 0-100>,
  "issues": [<array of strings describing problems>],
  "strengths": [<array of strings describing strengths>]
}

Consider:
- Design: visual appeal, modern design, professional appearance
- Content: clarity, completeness, relevance, professionalism
- UX: navigation, structure, user-friendliness
- Issues: missing information, poor design choices, accessibility problems
- Strengths: what works well, standout features

Website content:
${contentToAnalyze}`;

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
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to analyze portfolio');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from OpenAI');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    
    return {
      designQuality: Math.min(Math.max(analysis.designQuality || 50, 0), 100),
      contentQuality: Math.min(Math.max(analysis.contentQuality || 50, 0), 100),
      uxScore: Math.min(Math.max(analysis.uxScore || 50, 0), 100),
      mobileResponsive,
      issues: Array.isArray(analysis.issues) ? analysis.issues : [],
      strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
    };
  } catch (error) {
    console.error('Error analyzing portfolio with AI:', error);
    throw error;
  }
}

/**
 * Analyze portfolio comprehensively
 */
export async function analyzePortfolio(url: string): Promise<PortfolioAnalysis> {
  try {
    // Validate URL
    if (!validatePortfolioUrl(url)) {
      throw new Error('Invalid portfolio URL format');
    }

    // Try to fetch content
    let html: string;
    let isAccessible = true;
    
    try {
      html = await fetchPortfolioContent(url);
    } catch (error) {
      isAccessible = false;
      // Return basic analysis if we can't fetch
      return {
        url,
        isAccessible: false,
        title: null,
        description: null,
        hasContactInfo: false,
        hasProjects: false,
        hasAboutSection: false,
        designQuality: 0,
        contentQuality: 0,
        uxScore: 0,
        mobileResponsive: null,
        overallScore: 0,
        issues: ['Website is not accessible or blocked by CORS'],
        strengths: [],
      };
    }

    // Extract basic info
    const basicInfo = extractBasicInfo(html);

    // Analyze with AI
    let aiAnalysis;
    try {
      aiAnalysis = await analyzePortfolioWithAI(html, url);
    } catch (error) {
      // Fallback if AI analysis fails
      console.warn('AI analysis failed, using basic analysis:', error);
      aiAnalysis = {
        designQuality: 50,
        contentQuality: basicInfo.hasProjects && basicInfo.hasAboutSection ? 60 : 40,
        uxScore: 50,
        mobileResponsive: null,
        issues: ['Unable to perform detailed analysis'],
        strengths: [],
      };
    }

    // Calculate overall score
    const overallScore = Math.round(
      aiAnalysis.designQuality * 0.3 +
      aiAnalysis.contentQuality * 0.3 +
      aiAnalysis.uxScore * 0.2 +
      (basicInfo.hasContactInfo ? 10 : 0) +
      (basicInfo.hasProjects ? 10 : 0) +
      (basicInfo.hasAboutSection ? 10 : 0)
    );

    return {
      url,
      isAccessible: true,
      title: basicInfo.title,
      description: basicInfo.description,
      hasContactInfo: basicInfo.hasContactInfo,
      hasProjects: basicInfo.hasProjects,
      hasAboutSection: basicInfo.hasAboutSection,
      designQuality: aiAnalysis.designQuality,
      contentQuality: aiAnalysis.contentQuality,
      uxScore: aiAnalysis.uxScore,
      mobileResponsive: aiAnalysis.mobileResponsive,
      overallScore: Math.min(overallScore, 100),
      issues: aiAnalysis.issues,
      strengths: aiAnalysis.strengths,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to analyze portfolio');
  }
}


