/**
 * LinkedIn API Utility for HTML pages
 * Provides LinkedIn OAuth and API functionality
 */

// LinkedIn API endpoints
const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';

// Required scopes
const LINKEDIN_SCOPES = [
  'openid',
  'profile',
  'email',
  'w_member_social',
].join(' ');

/**
 * Generate state parameter for OAuth security
 */
function generateState() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Get redirect URI for LinkedIn OAuth
 */
function getRedirectUri() {
  return `${window.location.origin}/linkedin-callback.html`;
}

/**
 * LinkedIn OAuth Service
 */
const LinkedInService = {
  /**
   * Initiate LinkedIn OAuth login
   */
  initiateLogin() {
    const clientId = localStorage.getItem('linkedin_client_id');
    if (!clientId) {
      // Try to get from environment (if available)
      console.warn('LinkedIn Client ID not found. Please ensure it is set in .env and app is initialized.');
      alert('LinkedIn authentication is not configured. Please contact support.');
      return;
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
  },

  /**
   * Handle LinkedIn OAuth callback
   */
  async handleCallback(code, state) {
    const storedState = localStorage.getItem('linkedin_oauth_state');
    
    if (!storedState || storedState !== state) {
      return { success: false, error: 'Invalid state parameter' };
    }

    localStorage.removeItem('linkedin_oauth_state');

    try {
      // Get credentials from localStorage (set by React app)
      const clientId = localStorage.getItem('linkedin_client_id');
      const clientSecret = localStorage.getItem('linkedin_client_secret'); // Note: In production, this should be server-side

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
        localStorage.setItem('linkedin_access_token', data.access_token);
        
        if (data.expires_in) {
          const expiryTime = Date.now() + (data.expires_in * 1000);
          localStorage.setItem('linkedin_token_expiry', expiryTime.toString());
        }

        return { success: true };
      }

      return { success: false, error: 'No access token in response' };
    } catch (error) {
      console.error('LinkedIn callback error:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = localStorage.getItem('linkedin_access_token');
    if (!token) return false;

    const expiry = localStorage.getItem('linkedin_token_expiry');
    if (expiry && Date.now() > parseInt(expiry)) {
      this.logout();
      return false;
    }

    return true;
  },

  /**
   * Logout from LinkedIn
   */
  logout() {
    localStorage.removeItem('linkedin_access_token');
    localStorage.removeItem('linkedin_token_expiry');
    localStorage.removeItem('linkedin_profile');
  },

  /**
   * Make authenticated API call
   */
  async apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('linkedin_access_token');
    if (!token) {
      throw new Error('Not authenticated with LinkedIn');
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
        this.logout();
        throw new Error('LinkedIn authentication expired');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `LinkedIn API error: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Get LinkedIn user profile
   */
  async getProfile() {
    try {
      const profile = await this.apiCall('/me', {
        headers: {
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });

      let email = null;
      try {
        const emailResponse = await this.apiCall('/emailAddress?q=members&projection=(elements*(handle~))');
        if (emailResponse?.elements?.[0]?.['handle~']?.emailAddress) {
          email = emailResponse.elements[0]['handle~'].emailAddress;
        }
      } catch (e) {
        console.warn('Could not fetch email:', e);
      }

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
  },

  /**
   * Get cached profile
   */
  getCachedProfile() {
    const cached = localStorage.getItem('linkedin_profile');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Share a post on LinkedIn
   */
  async sharePost(text, options = {}) {
    try {
      const profile = this.getCachedProfile();
      if (!profile || !profile.id) {
        throw new Error('Profile not loaded. Please fetch profile first.');
      }

      const response = await this.apiCall('/ugcPosts', {
        method: 'POST',
        body: JSON.stringify({
          author: `urn:li:person:${profile.id}`,
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
  },
};

// Make LinkedInService available globally
window.LinkedInService = LinkedInService;

