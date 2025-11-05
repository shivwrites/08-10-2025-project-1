/**
 * LinkedIn Profile Fetcher Utility
 * Fetches LinkedIn profile data using OAuth or URL-based extraction
 */

import { getLinkedInAccessToken, isLinkedInAuthenticated, getLinkedInProfile } from './linkedin';

export interface LinkedInProfileData {
  headline: string | null;
  summary: string | null;
  experienceCount: number;
  educationCount: number;
  skills: string[];
  connectionsIndicator: string | null;
  location: string | null;
  industry: string | null;
  profileCompleteness: number; // 0-100
}

/**
 * Extract LinkedIn username from URL
 */
export function extractLinkedInUsername(url: string): string | null {
  if (!url) return null;
  
  try {
    // Handle various LinkedIn URL formats
    const patterns = [
      /linkedin\.com\/in\/([a-zA-Z0-9-]+)/i,
      /linkedin\.com\/pub\/([a-zA-Z0-9-]+)/i,
      /^([a-zA-Z0-9-]+)$/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting LinkedIn username:', error);
    return null;
  }
}

/**
 * Validate LinkedIn URL format
 */
export function validateLinkedInUrl(url: string): boolean {
  if (!url) return false;
  const username = extractLinkedInUsername(url);
  return username !== null;
}

/**
 * Fetch LinkedIn profile using OAuth (if authenticated)
 */
export async function fetchLinkedInProfileOAuth(): Promise<LinkedInProfileData | null> {
  try {
    if (!isLinkedInAuthenticated()) {
      return null;
    }

    const profile = await getLinkedInProfile();
    
    // Extract data from LinkedIn API response
    const headline = profile.headline || profile.localizedHeadline || null;
    const summary = profile.summary || profile.localizedSummary || null;
    
    // Note: LinkedIn API v2 may have different field names
    // This is a simplified extraction
    return {
      headline,
      summary,
      experienceCount: 0, // Would need additional API call to get experience
      educationCount: 0, // Would need additional API call to get education
      skills: [], // Would need additional API call to get skills
      connectionsIndicator: null, // Not available in basic profile
      location: profile.location?.name || null,
      industry: profile.industry || null,
      profileCompleteness: calculateProfileCompleteness({
        headline,
        summary,
        location: profile.location?.name,
        industry: profile.industry,
      }),
    };
  } catch (error) {
    console.error('Error fetching LinkedIn profile via OAuth:', error);
    return null;
  }
}

/**
 * Calculate profile completeness score
 */
function calculateProfileCompleteness(profile: {
  headline: string | null;
  summary: string | null;
  location: string | null;
  industry: string | null;
}): number {
  let score = 0;
  
  if (profile.headline) score += 25;
  if (profile.summary && profile.summary.length > 100) score += 30;
  if (profile.location) score += 15;
  if (profile.industry) score += 15;
  
  // Additional checks would add points for experience, education, etc.
  // For now, we'll use a simplified version
  
  return Math.min(score, 100);
}

/**
 * Fetch LinkedIn profile from public URL (limited - requires scraping or alternative method)
 * Note: LinkedIn doesn't allow public scraping without authentication.
 * This function provides a fallback that validates the URL and provides basic structure.
 */
export async function fetchLinkedInProfilePublic(url: string): Promise<LinkedInProfileData> {
  // Since LinkedIn doesn't allow public profile scraping without authentication,
  // we'll return a basic structure that can be filled by user input or OAuth
  const username = extractLinkedInUsername(url);
  
  if (!username) {
    throw new Error('Invalid LinkedIn URL format');
  }

  // Try OAuth first if available
  const oauthProfile = await fetchLinkedInProfileOAuth();
  if (oauthProfile) {
    return oauthProfile;
  }

  // Fallback: Return basic structure with low completeness
  // In a real implementation, you might use a scraping service or proxy
  return {
    headline: null,
    summary: null,
    experienceCount: 0,
    educationCount: 0,
    skills: [],
    connectionsIndicator: null,
    location: null,
    industry: null,
    profileCompleteness: 0,
  };
}

/**
 * Analyze LinkedIn profile data
 */
export function analyzeLinkedInProfile(profile: LinkedInProfileData): {
  score: number;
  strengths: string[];
  weaknesses: string[];
} {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  let score = profile.profileCompleteness;

  // Analyze headline
  if (profile.headline) {
    if (profile.headline.length > 50 && profile.headline.length < 120) {
      strengths.push('Headline length is optimal');
      score += 5;
    } else if (profile.headline.length < 50) {
      weaknesses.push('Headline is too short - add more details');
      score -= 5;
    } else {
      weaknesses.push('Headline is too long - consider shortening');
      score -= 3;
    }
  } else {
    weaknesses.push('Missing headline');
    score -= 10;
  }

  // Analyze summary
  if (profile.summary) {
    if (profile.summary.length > 200) {
      strengths.push('Summary provides good detail');
      score += 10;
    } else if (profile.summary.length < 100) {
      weaknesses.push('Summary is too brief - expand with achievements');
      score -= 8;
    }
  } else {
    weaknesses.push('Missing summary/about section');
    score -= 15;
  }

  // Analyze experience
  if (profile.experienceCount > 0) {
    strengths.push(`${profile.experienceCount} experience entries`);
    score += Math.min(profile.experienceCount * 2, 15);
  } else {
    weaknesses.push('No experience entries found');
    score -= 10;
  }

  // Analyze skills
  if (profile.skills.length > 0) {
    strengths.push(`${profile.skills.length} skills listed`);
    score += Math.min(profile.skills.length, 10);
  } else {
    weaknesses.push('No skills listed');
    score -= 8;
  }

  // Analyze location and industry
  if (profile.location) {
    score += 5;
  }
  if (profile.industry) {
    score += 5;
  }

  return {
    score: Math.min(Math.max(score, 0), 100),
    strengths,
    weaknesses,
  };
}

