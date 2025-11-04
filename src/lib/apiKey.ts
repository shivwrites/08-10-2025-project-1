/**
 * API Key Utility
 * Manages API keys from environment variables or localStorage
 */

/**
 * Get OpenAI API key from environment variable or localStorage
 */
export function getOpenAIKey(): string | null {
  // First, try to get from environment variable (Vite exposes VITE_* variables)
  const envKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (envKey) {
    // Store in localStorage for backward compatibility with existing code
    if (!localStorage.getItem('openai_api_key')) {
      localStorage.setItem('openai_api_key', envKey);
    }
    return envKey;
  }
  
  // Fall back to localStorage
  return localStorage.getItem('openai_api_key');
}

/**
 * Set OpenAI API key in localStorage
 */
export function setOpenAIKey(key: string): void {
  localStorage.setItem('openai_api_key', key);
}

/**
 * Get Serper API key from environment variable or localStorage
 */
export function getSerperKey(): string | null {
  // First, try to get from environment variable
  const envKey = import.meta.env.VITE_SERPER_API_KEY;
  
  if (envKey) {
    // Store in localStorage for backward compatibility with existing code
    if (!localStorage.getItem('serper_api_key')) {
      localStorage.setItem('serper_api_key', envKey);
    }
    return envKey;
  }
  
  // Fall back to localStorage
  return localStorage.getItem('serper_api_key');
}

/**
 * Set Serper API key in localStorage
 */
export function setSerperKey(key: string): void {
  localStorage.setItem('serper_api_key', key);
}

/**
 * Get LinkedIn Client ID from environment variable
 */
export function getLinkedInClientId(): string | null {
  return import.meta.env.VITE_LINKEDIN_CLIENT_ID || null;
}

/**
 * Get LinkedIn Client Secret from environment variable
 * Note: In production, this should be kept server-side only
 */
export function getLinkedInClientSecret(): string | null {
  return import.meta.env.VITE_LINKEDIN_CLIENT_SECRET || null;
}

/**
 * Set LinkedIn access token in localStorage
 */
export function setLinkedInAccessToken(token: string): void {
  localStorage.setItem('linkedin_access_token', token);
}

/**
 * Get LinkedIn access token from localStorage
 */
export function getLinkedInAccessToken(): string | null {
  return localStorage.getItem('linkedin_access_token');
}

/**
 * Remove LinkedIn access token from localStorage
 */
export function removeLinkedInAccessToken(): void {
  localStorage.removeItem('linkedin_access_token');
}

/**
 * Initialize API keys from environment variables on app start
 */
export function initializeAPIKey(): void {
  // Initialize OpenAI key
  const openAIKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (openAIKey && !localStorage.getItem('openai_api_key')) {
    localStorage.setItem('openai_api_key', openAIKey);
  }
  
  // Initialize Serper key
  const serperKey = import.meta.env.VITE_SERPER_API_KEY;
  if (serperKey && !localStorage.getItem('serper_api_key')) {
    localStorage.setItem('serper_api_key', serperKey);
  }
  
  // Initialize LinkedIn Client ID and Secret (store for reference)
  // Note: In production, client secret should be kept server-side only
  const linkedInClientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
  const linkedInClientSecret = import.meta.env.VITE_LINKEDIN_CLIENT_SECRET;
  
  if (linkedInClientId && !localStorage.getItem('linkedin_client_id')) {
    localStorage.setItem('linkedin_client_id', linkedInClientId);
  }
  
  if (linkedInClientSecret && !localStorage.getItem('linkedin_client_secret')) {
    localStorage.setItem('linkedin_client_secret', linkedInClientSecret);
  }
}

