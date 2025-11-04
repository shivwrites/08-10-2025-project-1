// Serper.dev Google Search API for HTML pages
// API Key is loaded from localStorage (initialized by the React app from .env file)

const SERPER_BASE_URL = 'https://google.serper.dev';

/**
 * Get Serper API key from localStorage or use default
 */
function getSerperAPIKey() {
  // Try to get from localStorage (set by React app initialization)
  const storedKey = localStorage.getItem('serper_api_key');
  if (storedKey) {
    return storedKey;
  }
  
  // Fallback to default key if not found (for backward compatibility)
  // This will be replaced once the app initializes from .env
  return 'a23d832961803015283a15c490e2d650d97dc135';
}

const SerperSearch = {
  /**
   * Perform a Google search using Serper.dev API
   * @param {string} query - Search query
   * @param {Object} options - Additional search options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.num - Number of results (default: 10)
   * @param {string} options.gl - Geo-location country code (default: 'us')
   * @param {string} options.hl - Language code (default: 'en')
   * @returns {Promise<Object>} Search results
   */
  async search(query, options = {}) {
    try {
      const apiKey = getSerperAPIKey();
      if (!apiKey) {
        throw new Error('Serper API key not found. Please set it in Settings or ensure it is loaded from environment variables.');
      }
      
      const response = await fetch(`${SERPER_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          page: options.page || 1,
          num: options.num || 10,
          gl: options.gl || 'us',
          hl: options.hl || 'en',
        }),
      });

      if (!response.ok) {
        throw new Error(`Serper API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling Serper API:', error);
      throw error;
    }
  },

  /**
   * Search for jobs
   * @param {string} jobTitle - Job title
   * @param {string} location - Job location (optional)
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Job search results
   */
  async searchJobs(jobTitle, location = '', options = {}) {
    const searchQuery = location 
      ? `${jobTitle} jobs in ${location}` 
      : `${jobTitle} jobs`;
    
    return await this.search(searchQuery, { 
      num: 20,
      ...options 
    });
  },

  /**
   * Search for company information
   * @param {string} companyName - Company name
   * @returns {Promise<Object>} Company search results
   */
  async searchCompany(companyName) {
    return await this.search(`${companyName} company information`, { num: 10 });
  },

  /**
   * Search for career information
   * @param {string} query - Career-related query
   * @returns {Promise<Object>} Career search results
   */
  async searchCareerInfo(query) {
    return await this.search(`${query} career guide tips`, { num: 15 });
  },

  /**
   * Format search results for display
   * @param {Object} searchData - Raw search data from API
   * @returns {Object} Formatted results
   */
  formatResults(searchData) {
    return {
      query: searchData.searchParameters?.q || '',
      organic: searchData.organic || [],
      peopleAlsoAsk: searchData.peopleAlsoAsk || [],
      relatedSearches: searchData.relatedSearches || [],
      answerBox: searchData.answerBox || null,
      knowledgeGraph: searchData.knowledgeGraph || null,
    };
  },

  /**
   * Render search results in HTML
   * @param {Object} results - Formatted search results
   * @param {HTMLElement} container - Container element to render into
   */
  renderResults(results, container) {
    container.innerHTML = '';

    // Answer box (if available)
    if (results.answerBox) {
      const answerBoxHTML = `
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <h3 class="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Quick Answer</h3>
          <p class="text-blue-900 dark:text-blue-100">${results.answerBox.answer || results.answerBox.snippet}</p>
          ${results.answerBox.link ? `<a href="${results.answerBox.link}" target="_blank" class="text-blue-600 dark:text-blue-400 text-sm hover:underline">Learn more →</a>` : ''}
        </div>
      `;
      container.insertAdjacentHTML('beforeend', answerBoxHTML);
    }

    // Organic results
    if (results.organic.length > 0) {
      const organicHTML = `
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Search Results</h3>
          <div class="space-y-4">
            ${results.organic.map(result => `
              <div class="bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <a href="${result.link}" target="_blank" class="block">
                  <h4 class="text-lg text-indigo-600 dark:text-indigo-400 hover:underline mb-1">${result.title}</h4>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mb-2">${result.link}</p>
                  <p class="text-sm text-slate-700 dark:text-slate-300">${result.snippet}</p>
                </a>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', organicHTML);
    }

    // People also ask
    if (results.peopleAlsoAsk.length > 0) {
      const peopleAlsoAskHTML = `
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">People Also Ask</h3>
          <div class="space-y-2">
            ${results.peopleAlsoAsk.slice(0, 3).map(question => `
              <div class="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                <p class="text-sm text-slate-700 dark:text-slate-300">${question.question}</p>
                ${question.snippet ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${question.snippet}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', peopleAlsoAskHTML);
    }

    // Related searches
    if (results.relatedSearches.length > 0) {
      const relatedSearchesHTML = `
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Related Searches</h3>
          <div class="flex flex-wrap gap-2">
            ${results.relatedSearches.slice(0, 6).map(search => `
              <span class="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm">
                ${search}
              </span>
            `).join('')}
          </div>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', relatedSearchesHTML);
    }
  }
};

// Make SerperSearch available globally
window.SerperSearch = SerperSearch;


