/**
 * Brand Analysis Utilities - Browser Compatible
 * Simplified versions of the TypeScript utilities for use in dashboard.html
 */

// GitHub API Utilities
const GitHubUtils = {
  extractUsername(url) {
    if (!url) return null;
    const patterns = [
      /github\.com\/([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})/i,
      /^([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})$/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  },

  validateUrl(url) {
    return this.extractUsername(url) !== null;
  },

  async getProfile(username) {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    });
    if (!response.ok) {
      if (response.status === 404) throw new Error(`GitHub user "${username}" not found`);
      if (response.status === 403) throw new Error('GitHub API rate limit exceeded');
      throw new Error(`GitHub API error: ${response.status}`);
    }
    return await response.json();
  },

  async getRepos(username, maxRepos = 30) {
    const repos = [];
    let page = 1;
    while (repos.length < maxRepos) {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&page=${page}&sort=updated`,
        { headers: { 'Accept': 'application/vnd.github.v3+json' } }
      );
      if (!response.ok) {
        if (response.status === 403) throw new Error('GitHub API rate limit exceeded');
        throw new Error(`GitHub API error: ${response.status}`);
      }
      const data = await response.json();
      if (data.length === 0) break;
      repos.push(...data.slice(0, maxRepos - repos.length));
      if (data.length < 100) break;
      page++;
    }
    return repos;
  },

  async analyzeProfile(username) {
    try {
      const [profile, repos] = await Promise.all([
        this.getProfile(username),
        this.getRepos(username)
      ]);

      const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
      const totalForks = repos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
      
      const languages = {};
      repos.forEach(repo => {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
      });

      const publicRepos = repos.filter(r => !r.private && !r.archived);
      const reposWithReadme = publicRepos.filter(r => r.has_wiki || r.description).length;
      const readmeQuality = publicRepos.length > 0 
        ? Math.round((reposWithReadme / publicRepos.length) * 100)
        : 0;

      const now = Date.now();
      const recentRepos = repos.filter(r => {
        const updated = new Date(r.pushed_at || r.updated_at).getTime();
        return (now - updated) / (1000 * 60 * 60 * 24) < 90;
      }).length;
      const activityScore = repos.length > 0
        ? Math.round((recentRepos / repos.length) * 100)
        : 0;

      const overallScore = Math.min(Math.round(
        readmeQuality * 0.3 +
        readmeQuality * 0.3 +
        activityScore * 0.2 +
        (profile.bio ? 10 : 0) +
        (profile.location ? 5 : 0) +
        (profile.company ? 5 : 0) +
        Math.min(totalStars / 10, 15) +
        Math.min(profile.followers / 10, 10)
      ), 100);

      return {
        profile,
        repos,
        totalStars,
        totalForks,
        languages,
        readmeQuality,
        documentationScore: readmeQuality,
        activityScore,
        overallScore
      };
    } catch (error) {
      throw error;
    }
  }
};

// LinkedIn Utilities
const LinkedInUtils = {
  extractUsername(url) {
    if (!url) return null;
    const patterns = [
      /linkedin\.com\/in\/([a-zA-Z0-9-]+)/i,
      /linkedin\.com\/pub\/([a-zA-Z0-9-]+)/i,
      /^([a-zA-Z0-9-]+)$/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  },

  validateUrl(url) {
    return this.extractUsername(url) !== null;
  },

  async fetchProfile(url) {
    const username = this.extractUsername(url);
    if (!username) throw new Error('Invalid LinkedIn URL');
    
    // LinkedIn doesn't allow public scraping, so we return basic structure
    // In production, this would use OAuth or a scraping service
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
};

// Portfolio Utilities
const PortfolioUtils = {
  validateUrl(url) {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  },

  async analyzePortfolio(url) {
    if (!this.validateUrl(url)) {
      throw new Error('Invalid portfolio URL');
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: { 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const title = doc.querySelector('title')?.textContent?.trim() || null;
      const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || null;
      const bodyText = (doc.body?.textContent || '').toLowerCase();
      
      const hasContactInfo = ['contact', 'email', 'mail'].some(k => bodyText.includes(k));
      const hasProjects = ['project', 'portfolio', 'work'].some(k => bodyText.includes(k));
      const hasAbout = ['about', 'bio'].some(k => bodyText.includes(k));
      const mobileResponsive = doc.querySelector('meta[name="viewport"]') !== null;

      // Basic scoring
      let score = 50;
      if (title) score += 10;
      if (metaDesc) score += 10;
      if (hasContactInfo) score += 10;
      if (hasProjects) score += 10;
      if (hasAbout) score += 10;
      if (mobileResponsive) score += 10;

      return {
        url,
        isAccessible: true,
        title,
        description: metaDesc,
        hasContactInfo,
        hasProjects,
        hasAboutSection: hasAbout,
        designQuality: 60,
        contentQuality: score,
        uxScore: 60,
        mobileResponsive,
        overallScore: Math.min(score, 100),
        issues: [],
        strengths: [],
      };
    } catch (error) {
      if (error.message.includes('CORS')) {
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
          issues: ['Website is not accessible due to CORS restrictions'],
          strengths: [],
        };
      }
      throw error;
    }
  }
};

// Resume Parser Utilities (simplified for browser)
const ResumeParserUtils = {
  async extractTextFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      
      if (file.type === 'application/pdf') {
        // For PDF, we'd need a PDF parser library
        // For now, return a placeholder
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  },

  async parseResumeWithAI(resumeText) {
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please set it in Settings.');
    }

    const prompt = `Extract structured data from this resume text and return valid JSON only. The JSON should include:
{
  "personalInfo": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "+1234567890",
    "location": "City, State",
    "linkedIn": "linkedin.com/in/username",
    "portfolio": "website.com"
  },
  "summary": "Professional summary",
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["communication", "leadership"],
    "languages": ["English", "Spanish"]
  },
  "experience": [{
    "company": "Company Name",
    "position": "Job Title",
    "startDate": "YYYY-MM",
    "endDate": "YYYY-MM or Present",
    "description": "Job description",
    "achievements": ["achievement1", "achievement2"]
  }],
  "education": [{
    "institution": "University Name",
    "degree": "Degree Type",
    "field": "Field of Study",
    "graduationDate": "YYYY-MM"
  }],
  "certifications": [{
    "name": "Certification Name",
    "issuer": "Issuing Organization",
    "date": "YYYY-MM",
    "expiryDate": "YYYY-MM or null"
  }],
  "projects": [{
    "name": "Project Name",
    "description": "Project description",
    "technologies": ["tech1", "tech2"],
    "link": "project-url.com"
  }]
}

Resume text:
${resumeText.substring(0, 4000)}

Return only valid JSON, no additional text:`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to parse resume');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(content);
  }
};

// Brand Analysis Engine (simplified for browser)
const BrandAnalysisEngine = {
  async analyzeResume(resumeData) {
    if (!resumeData) {
      return { score: 0, strengths: [], weaknesses: ['No resume data'], details: null };
    }

    let score = 50;
    const strengths = [];
    const weaknesses = [];

    if (resumeData.personalInfo?.name) score += 5;
    if (resumeData.personalInfo?.email) score += 5;
    if (resumeData.summary && resumeData.summary.length > 100) {
      strengths.push('Strong professional summary');
      score += 10;
    } else if (!resumeData.summary) {
      weaknesses.push('Missing professional summary');
      score -= 10;
    }

    const totalSkills = (resumeData.skills?.technical?.length || 0) +
      (resumeData.skills?.soft?.length || 0);
    if (totalSkills > 10) {
      strengths.push(`Comprehensive skill set (${totalSkills} skills)`);
      score += 10;
    }

    const expCount = resumeData.experience?.length || 0;
    if (expCount > 0) {
      strengths.push(`${expCount} experience entries`);
      score += Math.min(expCount * 5, 20);
    } else {
      weaknesses.push('No work experience listed');
      score -= 15;
    }

    return {
      score: Math.min(Math.max(score, 0), 100),
      strengths,
      weaknesses,
      details: resumeData
    };
  },

  async analyzeLinkedIn(linkedInData) {
    if (!linkedInData) {
      return { score: 0, strengths: [], weaknesses: ['No LinkedIn data'], details: null };
    }
    return {
      score: linkedInData.profileCompleteness || 0,
      strengths: [],
      weaknesses: [],
      details: linkedInData
    };
  },

  async analyzeGitHub(githubData) {
    if (!githubData) {
      return { score: 0, strengths: [], weaknesses: ['No GitHub data'], details: null };
    }
    const strengths = [];
    const weaknesses = [];
    let score = githubData.overallScore || 0;

    if (githubData.repos?.length > 5) {
      strengths.push(`Active GitHub presence (${githubData.repos.length} repositories)`);
    } else if (githubData.repos?.length === 0) {
      weaknesses.push('No public repositories');
      score -= 20;
    }

    return {
      score: Math.min(Math.max(score, 0), 100),
      strengths,
      weaknesses,
      details: githubData
    };
  },

  async analyzePortfolio(portfolioData) {
    if (!portfolioData || !portfolioData.isAccessible) {
      return {
        score: 0,
        strengths: [],
        weaknesses: ['Portfolio not accessible'],
        details: portfolioData
      };
    }

    const strengths = [];
    const weaknesses = [];
    let score = portfolioData.overallScore || 0;

    if (portfolioData.hasContactInfo) strengths.push('Contact information available');
    else weaknesses.push('Missing contact information');

    if (portfolioData.hasProjects) strengths.push('Projects section present');
    else weaknesses.push('Missing projects showcase');

    return {
      score: Math.min(Math.max(score, 0), 100),
      strengths,
      weaknesses,
      details: portfolioData
    };
  },

  generateBrandScore(analyses) {
    const weights = { resume: 0.3, linkedin: 0.3, github: 0.2, portfolio: 0.2 };
    const overall = Math.round(
      analyses.resume.score * weights.resume +
      analyses.linkedin.score * weights.linkedin +
      analyses.github.score * weights.github +
      analyses.portfolio.score * weights.portfolio
    );
    return {
      overall: Math.min(Math.max(overall, 0), 100),
      linkedin: analyses.linkedin.score,
      resume: analyses.resume.score,
      portfolio: analyses.portfolio.score,
      github: analyses.github.score
    };
  },

  async generateRecommendations(analyses, details) {
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      throw new Error('OpenAI API key not found');
    }

    const prompt = `Based on the following brand analysis, generate personalized recommendations. Return ONLY valid JSON array:
[
  {
    "id": "<unique-id>",
    "priority": "<high|medium|low>",
    "category": "<LinkedIn|Resume|Portfolio|GitHub|General>",
    "title": "<short recommendation title>",
    "description": "<detailed description>",
    "impact": "<High impact|Medium impact|Low impact>",
    "difficulty": "<easy|medium|hard>",
    "example": "<specific example>",
    "actionableSteps": ["<step 1>", "<step 2>"]
  }
]

Analysis:
- Resume: ${analyses.resume.score}/100 (Weaknesses: ${analyses.resume.weaknesses.join(', ') || 'None'})
- LinkedIn: ${analyses.linkedin.score}/100 (Weaknesses: ${analyses.linkedin.weaknesses.join(', ') || 'None'})
- GitHub: ${analyses.github.score}/100 (Weaknesses: ${analyses.github.weaknesses.join(', ') || 'None'})
- Portfolio: ${analyses.portfolio.score}/100 (Weaknesses: ${analyses.portfolio.weaknesses.join(', ') || 'None'})

Generate 5-8 specific, actionable recommendations.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) throw new Error('Failed to generate recommendations');
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Invalid response format');
    
    const recommendations = JSON.parse(jsonMatch[0]);
    return recommendations.map((rec, index) => ({
      id: rec.id || `rec-${Date.now()}-${index}`,
      priority: rec.priority || 'medium',
      category: rec.category || 'General',
      title: rec.title || 'Improvement opportunity',
      description: rec.description || '',
      impact: rec.impact || 'Medium impact',
      difficulty: rec.difficulty || 'medium',
      example: rec.example || '',
      actionableSteps: rec.actionableSteps || []
    }));
  },

  async determineBrandArchetype(brandScore) {
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      return {
        name: 'The Professional',
        description: 'A well-rounded professional with a balanced online presence.',
        traits: ['Professional', 'Balanced', 'Versatile']
      };
    }

    const prompt = `Determine brand archetype. Return ONLY valid JSON:
{
  "name": "<archetype name>",
  "description": "<2-3 sentence description>",
  "traits": ["<trait1>", "<trait2>", "<trait3>"]
}

Brand Scores: Overall ${brandScore.overall}/100, LinkedIn ${brandScore.linkedin}/100, Resume ${brandScore.resume}/100, GitHub ${brandScore.github}/100, Portfolio ${brandScore.portfolio}/100`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 300
        })
      });

      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error determining archetype:', error);
    }

    return {
      name: 'The Professional',
      description: 'A well-rounded professional with a balanced online presence.',
      traits: ['Professional', 'Balanced', 'Versatile']
    };
  },

  calculateIndustryBenchmark(overallScore) {
    return {
      average: 65,
      top10Percent: 85,
      top25Percent: 75
    };
  }
};

// Make utilities available globally
window.BrandAnalysisUtils = {
  GitHub: GitHubUtils,
  LinkedIn: LinkedInUtils,
  Portfolio: PortfolioUtils,
  ResumeParser: ResumeParserUtils,
  Engine: BrandAnalysisEngine
};


