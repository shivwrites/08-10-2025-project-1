/**
 * LinkedIn API Utility
 * Handles LinkedIn OAuth authentication and API calls
 */

import { getLinkedInClientId, getLinkedInAccessToken, setLinkedInAccessToken, removeLinkedInAccessToken } from './apiKey';

// LinkedIn API endpoints
const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';

// Required scopes for LinkedIn API
// Note: These may need to be approved by LinkedIn for your app
export const LINKEDIN_SCOPES = [
  'openid',
  'profile',
  'email',
  'w_member_social', // For posting and reading posts
].join(' ');

/**
 * Generate state parameter for OAuth security
 */
function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Get redirect URI for LinkedIn OAuth
 * This should match the redirect URI configured in your LinkedIn app
 */
function getRedirectUri(): string {
  // Use current origin + /linkedin-callback
  return `${window.location.origin}/linkedin-callback`;
}

/**
 * Initiate LinkedIn OAuth login
 * Redirects user to LinkedIn authorization page
 */
export function initiateLinkedInLogin(): void {
  const clientId = getLinkedInClientId();
  if (!clientId) {
    throw new Error('LinkedIn Client ID not configured. Please set VITE_LINKEDIN_CLIENT_ID in .env');
  }

  const state = generateState();
  localStorage.setItem('linkedin_oauth_state', state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    state: state,
    scope: LINKEDIN_SCOPES,
  });

  window.location.href = `${LINKEDIN_AUTH_URL}?${params.toString()}`;
}

/**
 * Handle LinkedIn OAuth callback
 * Exchanges authorization code for access token
 */
export async function handleLinkedInCallback(code: string, state: string): Promise<{ success: boolean; error?: string }> {
  const storedState = localStorage.getItem('linkedin_oauth_state');
  
  // Verify state to prevent CSRF attacks
  if (!storedState || storedState !== state) {
    return { success: false, error: 'Invalid state parameter. Authentication may have been tampered with.' };
  }

  // Clear state
  localStorage.removeItem('linkedin_oauth_state');

  try {
    // Exchange code for access token
    // Note: In production, this should be done server-side to protect client secret
    const clientId = getLinkedInClientId();
    const clientSecret = import.meta.env.VITE_LINKEDIN_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return { success: false, error: 'LinkedIn credentials not configured' };
    }

    const response = await fetch(LINKEDIN_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: getRedirectUri(),
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.error_description || 'Failed to exchange code for token' };
    }

    const data = await response.json();
    
    if (data.access_token) {
      setLinkedInAccessToken(data.access_token);
      
      // Store token expiry if provided
      if (data.expires_in) {
        const expiryTime = Date.now() + (data.expires_in * 1000);
        localStorage.setItem('linkedin_token_expiry', expiryTime.toString());
      }

      return { success: true };
    }

    return { success: false, error: 'No access token in response' };
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

/**
 * Check if user is authenticated with LinkedIn
 */
export function isLinkedInAuthenticated(): boolean {
  const token = getLinkedInAccessToken();
  if (!token) return false;

  // Check if token is expired
  const expiry = localStorage.getItem('linkedin_token_expiry');
  if (expiry && Date.now() > parseInt(expiry)) {
    removeLinkedInAccessToken();
    return false;
  }

  return true;
}

/**
 * Logout from LinkedIn
 */
export function linkedInLogout(): void {
  removeLinkedInAccessToken();
  localStorage.removeItem('linkedin_token_expiry');
  localStorage.removeItem('linkedin_profile');
}

/**
 * Make authenticated API call to LinkedIn
 */
async function linkedInAPI(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getLinkedInAccessToken();
  if (!token) {
    throw new Error('Not authenticated with LinkedIn. Please login first.');
  }

  const response = await fetch(`${LINKEDIN_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      removeLinkedInAccessToken();
      throw new Error('LinkedIn authentication expired. Please login again.');
    }
    
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `LinkedIn API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get LinkedIn user profile
 */
export async function getLinkedInProfile(): Promise<any> {
  try {
    // Get basic profile info
    const profile = await linkedInAPI('/me', {
      headers: {
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    // Get email if available
    let email = null;
    try {
      const emailResponse = await linkedInAPI('/emailAddress?q=members&projection=(elements*(handle~))');
      if (emailResponse?.elements?.[0]?.['handle~']?.emailAddress) {
        email = emailResponse.elements[0]['handle~'].emailAddress;
      }
    } catch (e) {
      console.warn('Could not fetch email:', e);
    }

    // Store profile in localStorage for quick access
    const profileData = {
      ...profile,
      email,
      fetchedAt: Date.now(),
    };
    localStorage.setItem('linkedin_profile', JSON.stringify(profileData));

    return profileData;
  } catch (error) {
    console.error('Error fetching LinkedIn profile:', error);
    throw error;
  }
}

/**
 * Get cached LinkedIn profile from localStorage
 */
export function getCachedLinkedInProfile(): any | null {
  const cached = localStorage.getItem('linkedin_profile');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Search for jobs on LinkedIn
 * Note: This requires specific LinkedIn API access
 */
export async function searchLinkedInJobs(query: string, options: {
  location?: string;
  limit?: number;
} = {}): Promise<any> {
  // LinkedIn Jobs API endpoint (may require additional permissions)
  const params = new URLSearchParams({
    keywords: query,
    ...(options.location && { location: options.location }),
    count: (options.limit || 10).toString(),
  });

  try {
    // Note: LinkedIn Jobs API may have different endpoints based on your app's permissions
    // This is a placeholder - adjust based on your LinkedIn API access level
    const response = await linkedInAPI(`/jobSearch?${params.toString()}`);
    return response;
  } catch (error) {
    console.error('Error searching LinkedIn jobs:', error);
    throw error;
  }
}

/**
 * Get user's LinkedIn connections (requires appropriate permissions)
 */
export async function getLinkedInConnections(): Promise<any> {
  try {
    const response = await linkedInAPI('/people/~/connections', {
      headers: {
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });
    return response;
  } catch (error) {
    console.error('Error fetching LinkedIn connections:', error);
    throw error;
  }
}

/**
 * Share a post on LinkedIn
 */
export async function shareLinkedInPost(text: string, options: {
  visibility?: 'PUBLIC' | 'CONNECTIONS';
} = {}): Promise<any> {
  try {
    const response = await linkedInAPI('/ugcPosts', {
      method: 'POST',
      body: JSON.stringify({
        author: `urn:li:person:${getCachedLinkedInProfile()?.id}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: text,
            },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': options.visibility || 'PUBLIC',
        },
      }),
    });
    return response;
  } catch (error) {
    console.error('Error sharing LinkedIn post:', error);
    throw error;
  }
}


