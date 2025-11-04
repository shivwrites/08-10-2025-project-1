/**
 * API Key Initialization Script
 * This script initializes the OpenAI API key from environment variable
 * or ensures it's available in localStorage for HTML pages
 * 
 * Note: This script is loaded by HTML pages that need the API key.
 * The React app (main.tsx) also initializes the key on startup.
 */

(function() {
  'use strict';
  
  // This will be populated at build time by Vite
  // For now, we rely on localStorage which is set by the React app
  // or manually by the user in Settings
  
  // Check if API key exists in localStorage
  // If not, it will be set when the user visits the React app,
  // or they can set it manually in Settings > Integrations
  const API_KEY_STORAGE_KEY = 'openai_api_key';
  
  // Function to check if API key is available
  window.checkOpenAIKey = function() {
    return localStorage.getItem(API_KEY_STORAGE_KEY) !== null;
  };
  
  // Function to get API key (for use in HTML pages)
  window.getOpenAIKey = function() {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  };
  
  // Log initialization (helpful for debugging)
  if (window.checkOpenAIKey()) {
    console.log('OpenAI API key found in localStorage');
  } else {
    console.log('OpenAI API key not found. It will be initialized when you visit the main app, or you can set it in Settings > Integrations.');
  }
})();

