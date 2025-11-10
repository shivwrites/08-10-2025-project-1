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

  // Analyze SEO elements
  analyzeSEO(doc, url) {
    const seo = {
      score: 0,
      issues: [],
      strengths: [],
      details: {}
    };

    // Title tag
    const title = doc.querySelector('title')?.textContent?.trim() || null;
    if (title) {
      if (title.length >= 30 && title.length <= 60) {
        seo.score += 15;
        seo.strengths.push('Optimal title length (30-60 characters)');
      } else {
        seo.score += 10;
        seo.issues.push(`Title length should be 30-60 characters (current: ${title.length})`);
      }
      seo.details.title = title;
    } else {
      seo.issues.push('Missing title tag');
    }

    // Meta description
    const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || null;
    if (metaDesc) {
      if (metaDesc.length >= 120 && metaDesc.length <= 160) {
        seo.score += 15;
        seo.strengths.push('Optimal meta description length (120-160 characters)');
      } else {
        seo.score += 10;
        seo.issues.push(`Meta description should be 120-160 characters (current: ${metaDesc.length})`);
      }
      seo.details.metaDescription = metaDesc;
    } else {
      seo.issues.push('Missing meta description');
    }

    // Meta keywords (less important but still checked)
    const metaKeywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || null;
    if (metaKeywords) {
      seo.score += 5;
      seo.details.metaKeywords = metaKeywords;
    }

    // Open Graph tags (social media)
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || null;
    const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || null;
    const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || null;
    const ogUrl = doc.querySelector('meta[property="og:url"]')?.getAttribute('content') || null;
    
    if (ogTitle && ogDescription) {
      seo.score += 10;
      seo.strengths.push('Open Graph tags present for social sharing');
      seo.details.openGraph = { title: ogTitle, description: ogDescription, image: ogImage, url: ogUrl };
    } else {
      seo.issues.push('Missing Open Graph tags (affects social media sharing)');
    }

    // Twitter Card tags
    const twitterCard = doc.querySelector('meta[name="twitter:card"]')?.getAttribute('content') || null;
    const twitterTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || null;
    if (twitterCard || twitterTitle) {
      seo.score += 5;
      seo.strengths.push('Twitter Card tags present');
      seo.details.twitterCard = { card: twitterCard, title: twitterTitle };
    }

    // Structured data (JSON-LD)
    const jsonLd = doc.querySelectorAll('script[type="application/ld+json"]');
    if (jsonLd.length > 0) {
      seo.score += 10;
      seo.strengths.push(`Structured data found (${jsonLd.length} schema(s))`);
      seo.details.structuredData = jsonLd.length;
    } else {
      seo.issues.push('No structured data (JSON-LD) found');
    }

    // H1 tag
    const h1Tags = doc.querySelectorAll('h1');
    if (h1Tags.length === 1) {
      seo.score += 10;
      seo.strengths.push('Single H1 tag (SEO best practice)');
    } else if (h1Tags.length === 0) {
      seo.issues.push('Missing H1 tag');
    } else {
      seo.issues.push(`Multiple H1 tags found (${h1Tags.length}) - should have only one`);
    }

    // Alt text for images
    const images = doc.querySelectorAll('img');
    const imagesWithAlt = Array.from(images).filter(img => img.getAttribute('alt') !== null).length;
    const altTextPercentage = images.length > 0 ? (imagesWithAlt / images.length) * 100 : 100;
    if (altTextPercentage >= 90) {
      seo.score += 10;
      seo.strengths.push(`Good image alt text coverage (${Math.round(altTextPercentage)}%)`);
    } else if (images.length > 0) {
      seo.score += Math.round(altTextPercentage / 10);
      seo.issues.push(`Only ${Math.round(altTextPercentage)}% of images have alt text`);
    }
    seo.details.imageAltText = { total: images.length, withAlt: imagesWithAlt, percentage: Math.round(altTextPercentage) };

    // Canonical URL
    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || null;
    if (canonical) {
      seo.score += 5;
      seo.strengths.push('Canonical URL specified');
    }

    // HTTPS check
    if (url.startsWith('https://')) {
      seo.score += 10;
      seo.strengths.push('HTTPS enabled (secure connection)');
      seo.details.https = true;
    } else {
      seo.issues.push('Not using HTTPS (security and SEO concern)');
      seo.details.https = false;
    }

    // Robots meta tag
    const robots = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || null;
    if (robots && robots.includes('noindex')) {
      seo.issues.push('Site has noindex tag (will not appear in search results)');
    }

    seo.score = Math.min(seo.score, 100);
    return seo;
  },

  // Analyze accessibility
  analyzeAccessibility(doc) {
    const a11y = {
      score: 0,
      issues: [],
      strengths: [],
      details: {}
    };

    // Alt text for images
    const images = doc.querySelectorAll('img');
    const imagesWithAlt = Array.from(images).filter(img => {
      const alt = img.getAttribute('alt');
      return alt !== null && alt.trim() !== '';
    }).length;
    const altTextPercentage = images.length > 0 ? (imagesWithAlt / images.length) * 100 : 100;
    if (altTextPercentage >= 90) {
      a11y.score += 20;
      a11y.strengths.push(`Excellent image alt text coverage (${Math.round(altTextPercentage)}%)`);
    } else if (altTextPercentage >= 70) {
      a11y.score += 15;
      a11y.strengths.push(`Good image alt text coverage (${Math.round(altTextPercentage)}%)`);
    } else if (images.length > 0) {
      a11y.issues.push(`Only ${Math.round(altTextPercentage)}% of images have descriptive alt text`);
    }
    a11y.details.imageAltText = { total: images.length, withAlt: imagesWithAlt, percentage: Math.round(altTextPercentage) };

    // Heading hierarchy
    const headings = {
      h1: doc.querySelectorAll('h1').length,
      h2: doc.querySelectorAll('h2').length,
      h3: doc.querySelectorAll('h3').length,
      h4: doc.querySelectorAll('h4').length,
      h5: doc.querySelectorAll('h5').length,
      h6: doc.querySelectorAll('h6').length
    };
    if (headings.h1 === 1) {
      a11y.score += 10;
      a11y.strengths.push('Proper heading hierarchy (single H1)');
    } else if (headings.h1 === 0) {
      a11y.issues.push('Missing H1 heading');
    } else {
      a11y.issues.push(`Multiple H1 headings (${headings.h1}) - should have only one`);
    }
    a11y.details.headings = headings;

    // Form labels
    const inputs = doc.querySelectorAll('input, textarea, select');
    const inputsWithLabels = Array.from(inputs).filter(input => {
      const id = input.getAttribute('id');
      if (!id) return false;
      return doc.querySelector(`label[for="${id}"]`) !== null || input.closest('label') !== null;
    }).length;
    if (inputs.length > 0) {
      const labelPercentage = (inputsWithLabels / inputs.length) * 100;
      if (labelPercentage >= 90) {
        a11y.score += 10;
        a11y.strengths.push('All form inputs have labels');
      } else {
        a11y.issues.push(`Only ${Math.round(labelPercentage)}% of form inputs have labels`);
      }
      a11y.details.formLabels = { total: inputs.length, withLabels: inputsWithLabels, percentage: Math.round(labelPercentage) };
    }

    // ARIA labels
    const elementsWithAria = doc.querySelectorAll('[aria-label], [aria-labelledby]').length;
    if (elementsWithAria > 0) {
      a11y.score += 10;
      a11y.strengths.push(`ARIA labels used (${elementsWithAria} elements)`);
      a11y.details.ariaLabels = elementsWithAria;
    }

    // Color contrast (basic check - would need more sophisticated analysis)
    const links = doc.querySelectorAll('a');
    if (links.length > 0) {
      a11y.score += 5;
      a11y.details.links = links.length;
    }

    // Language attribute
    const lang = doc.documentElement.getAttribute('lang');
    if (lang) {
      a11y.score += 10;
      a11y.strengths.push(`Language attribute specified (${lang})`);
      a11y.details.language = lang;
    } else {
      a11y.issues.push('Missing language attribute on HTML element');
    }

    // Skip links
    const skipLinks = doc.querySelectorAll('a[href*="#main"], a[href*="#content"], a[href*="#skip"]').length;
    if (skipLinks > 0) {
      a11y.score += 5;
      a11y.strengths.push('Skip navigation links present');
      a11y.details.skipLinks = skipLinks;
    }

    // Keyboard navigation (check for focusable elements)
    const focusableElements = doc.querySelectorAll('a, button, input, textarea, select, [tabindex]').length;
    if (focusableElements > 0) {
      a11y.score += 5;
      a11y.details.focusableElements = focusableElements;
    }

    // Semantic HTML
    const semanticElements = doc.querySelectorAll('header, nav, main, article, section, aside, footer').length;
    if (semanticElements > 0) {
      a11y.score += 10;
      a11y.strengths.push(`Semantic HTML elements used (${semanticElements} elements)`);
      a11y.details.semanticElements = semanticElements;
    } else {
      a11y.issues.push('No semantic HTML elements found (header, nav, main, etc.)');
    }

    a11y.score = Math.min(a11y.score, 100);
    return a11y;
  },

  // Analyze performance (basic checks)
  analyzePerformance(url, response, html) {
    const perf = {
      score: 0,
      issues: [],
      strengths: [],
      details: {}
    };

    // Check response headers for performance hints
    const headers = response.headers;
    const contentType = headers.get('content-type') || '';
    const contentLength = headers.get('content-length');
    const cacheControl = headers.get('cache-control');
    const expires = headers.get('expires');
    const etag = headers.get('etag');
    const lastModified = headers.get('last-modified');

    // Content compression
    const contentEncoding = headers.get('content-encoding');
    if (contentEncoding && (contentEncoding.includes('gzip') || contentEncoding.includes('br'))) {
      perf.score += 15;
      perf.strengths.push('Content compression enabled');
      perf.details.compression = contentEncoding;
    } else {
      perf.issues.push('Content compression not detected (gzip/brotli)');
    }

    // Caching headers
    if (cacheControl || expires) {
      perf.score += 10;
      perf.strengths.push('Caching headers present');
      perf.details.caching = { cacheControl, expires };
    } else {
      perf.issues.push('No caching headers found');
    }

    // ETag/Last-Modified
    if (etag || lastModified) {
      perf.score += 5;
      perf.strengths.push('Cache validation headers present');
      perf.details.cacheValidation = { etag: !!etag, lastModified: !!lastModified };
    }

    // Content size
    if (contentLength) {
      const sizeKB = parseInt(contentLength) / 1024;
      perf.details.contentSizeKB = Math.round(sizeKB);
      if (sizeKB < 100) {
        perf.score += 10;
        perf.strengths.push(`Small page size (${Math.round(sizeKB)}KB)`);
      } else if (sizeKB < 500) {
        perf.score += 5;
      } else {
        perf.issues.push(`Large page size (${Math.round(sizeKB)}KB) - consider optimization`);
      }
    } else if (html) {
      // Fallback: estimate size from HTML length
      const sizeKB = html.length / 1024;
      perf.details.contentSizeKB = Math.round(sizeKB);
      if (sizeKB > 500) {
        perf.issues.push(`Large page size (estimated ${Math.round(sizeKB)}KB) - consider optimization`);
      }
    }

    // Image optimization check (count images)
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const images = doc.querySelectorAll('img');
    const imagesWithSrcset = Array.from(images).filter(img => img.hasAttribute('srcset')).length;
    const responsiveImagesPercentage = images.length > 0 ? (imagesWithSrcset / images.length) * 100 : 0;
    
    if (images.length > 0) {
      perf.details.images = { total: images.length, withSrcset: imagesWithSrcset };
      if (responsiveImagesPercentage >= 50) {
        perf.score += 10;
        perf.strengths.push(`Responsive images used (${Math.round(responsiveImagesPercentage)}%)`);
      } else if (images.length > 5) {
        perf.issues.push(`Only ${Math.round(responsiveImagesPercentage)}% of images use responsive srcset`);
      }
    }

    // Check for async/defer on scripts
    const scripts = doc.querySelectorAll('script');
    const asyncScripts = Array.from(scripts).filter(s => s.hasAttribute('async') || s.hasAttribute('defer')).length;
    if (scripts.length > 0) {
      perf.details.scripts = { total: scripts.length, async: asyncScripts };
      if (asyncScripts === scripts.length) {
        perf.score += 10;
        perf.strengths.push('All scripts use async/defer');
      } else if (scripts.length > 3) {
        perf.issues.push(`Only ${asyncScripts}/${scripts.length} scripts use async/defer`);
      }
    }

    // Check for inline styles (performance concern)
    const inlineStyles = doc.querySelectorAll('[style]').length;
    if (inlineStyles > 10) {
      perf.issues.push(`Many inline styles (${inlineStyles}) - consider external CSS`);
    }

    perf.score = Math.min(perf.score, 100);
    return perf;
  },

  // Analyze security
  analyzeSecurity(url, response) {
    const security = {
      score: 0,
      issues: [],
      strengths: [],
      details: {}
    };

    // HTTPS
    if (url.startsWith('https://')) {
      security.score += 30;
      security.strengths.push('HTTPS enabled (secure connection)');
      security.details.https = true;
    } else {
      security.score = 0;
      security.issues.push('Not using HTTPS - critical security issue');
      security.details.https = false;
      return security; // Return early if no HTTPS
    }

    // Security headers
    const headers = response.headers;
    const securityHeaders = {
      'strict-transport-security': headers.get('strict-transport-security'),
      'x-content-type-options': headers.get('x-content-type-options'),
      'x-frame-options': headers.get('x-frame-options'),
      'x-xss-protection': headers.get('x-xss-protection'),
      'content-security-policy': headers.get('content-security-policy'),
      'referrer-policy': headers.get('referrer-policy'),
      'permissions-policy': headers.get('permissions-policy')
    };

    let headersPresent = 0;
    if (securityHeaders['strict-transport-security']) {
      security.score += 15;
      security.strengths.push('HSTS header present');
      headersPresent++;
    } else {
      security.issues.push('Missing HSTS (Strict-Transport-Security) header');
    }

    if (securityHeaders['x-content-type-options'] === 'nosniff') {
      security.score += 10;
      security.strengths.push('X-Content-Type-Options: nosniff');
      headersPresent++;
    } else {
      security.issues.push('Missing X-Content-Type-Options header');
    }

    if (securityHeaders['x-frame-options']) {
      security.score += 10;
      security.strengths.push('X-Frame-Options header present (prevents clickjacking)');
      headersPresent++;
    } else {
      security.issues.push('Missing X-Frame-Options header');
    }

    if (securityHeaders['x-xss-protection']) {
      security.score += 5;
      headersPresent++;
    }

    if (securityHeaders['content-security-policy']) {
      security.score += 15;
      security.strengths.push('Content Security Policy (CSP) header present');
      headersPresent++;
    } else {
      security.issues.push('Missing Content Security Policy (CSP) header');
    }

    if (securityHeaders['referrer-policy']) {
      security.score += 5;
      headersPresent++;
    }

    security.details.headers = securityHeaders;
    security.details.headersPresent = headersPresent;
    security.details.totalHeaders = Object.keys(securityHeaders).length;

    security.score = Math.min(security.score, 100);
    return security;
  },

  // Analyze social media integration
  analyzeSocialMedia(doc) {
    const social = {
      score: 0,
      issues: [],
      strengths: [],
      details: {}
    };

    // Open Graph tags
    const ogTags = {
      title: doc.querySelector('meta[property="og:title"]')?.getAttribute('content'),
      description: doc.querySelector('meta[property="og:description"]')?.getAttribute('content'),
      image: doc.querySelector('meta[property="og:image"]')?.getAttribute('content'),
      url: doc.querySelector('meta[property="og:url"]')?.getAttribute('content'),
      type: doc.querySelector('meta[property="og:type"]')?.getAttribute('content')
    };

    const ogTagsPresent = Object.values(ogTags).filter(v => v !== null && v !== undefined).length;
    if (ogTagsPresent >= 4) {
      social.score += 30;
      social.strengths.push('Complete Open Graph tags for social sharing');
      social.details.openGraph = ogTags;
    } else if (ogTagsPresent >= 2) {
      social.score += 15;
      social.strengths.push('Partial Open Graph tags present');
      social.details.openGraph = ogTags;
      social.issues.push(`Only ${ogTagsPresent}/5 Open Graph tags present`);
    } else {
      social.issues.push('Missing Open Graph tags (affects social media sharing)');
    }

    // Twitter Card tags
    const twitterTags = {
      card: doc.querySelector('meta[name="twitter:card"]')?.getAttribute('content'),
      title: doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content'),
      description: doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content'),
      image: doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content')
    };

    const twitterTagsPresent = Object.values(twitterTags).filter(v => v !== null && v !== undefined).length;
    if (twitterTagsPresent >= 3) {
      social.score += 20;
      social.strengths.push('Twitter Card tags present');
      social.details.twitterCard = twitterTags;
    } else if (twitterTagsPresent > 0) {
      social.score += 10;
      social.issues.push(`Partial Twitter Card tags (${twitterTagsPresent}/4)`);
      social.details.twitterCard = twitterTags;
    }

    // Social media links
    const bodyText = (doc.body?.textContent || '').toLowerCase();
    const socialPlatforms = {
      linkedin: /linkedin\.com/i.test(bodyText) || doc.querySelector('a[href*="linkedin.com"]') !== null,
      twitter: /twitter\.com|x\.com/i.test(bodyText) || doc.querySelector('a[href*="twitter.com"], a[href*="x.com"]') !== null,
      github: /github\.com/i.test(bodyText) || doc.querySelector('a[href*="github.com"]') !== null,
      instagram: /instagram\.com/i.test(bodyText) || doc.querySelector('a[href*="instagram.com"]') !== null
    };

    const platformsFound = Object.values(socialPlatforms).filter(v => v === true).length;
    if (platformsFound >= 2) {
      social.score += 20;
      social.strengths.push(`Social media links present (${platformsFound} platforms)`);
      social.details.socialLinks = socialPlatforms;
    } else if (platformsFound === 1) {
      social.score += 10;
      social.details.socialLinks = socialPlatforms;
    }

    // Favicon
    const favicon = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    if (favicon) {
      social.score += 5;
      social.strengths.push('Favicon present');
      social.details.favicon = favicon.getAttribute('href');
    }

    // Apple touch icon
    const appleIcon = doc.querySelector('link[rel="apple-touch-icon"]');
    if (appleIcon) {
      social.score += 5;
      social.strengths.push('Apple touch icon present');
    }

    social.score = Math.min(social.score, 100);
    return social;
  },

  // Analyze visual design - color scheme
  analyzeColorScheme(doc, html) {
    const visual = {
      score: 0,
      issues: [],
      strengths: [],
      details: {
        colorScheme: {},
        typography: {},
        layout: {},
        images: {}
      }
    };

    // Extract colors from inline styles and style tags
    const inlineStyles = doc.querySelectorAll('[style]');
    const styleTags = doc.querySelectorAll('style');
    const linkTags = doc.querySelectorAll('link[rel="stylesheet"]');
    
    const colors = new Set();
    const colorPatterns = [
      /#[0-9a-fA-F]{3,6}/g, // Hex colors
      /rgb\([^)]+\)/g, // RGB colors
      /rgba\([^)]+\)/g, // RGBA colors
      /hsl\([^)]+\)/g, // HSL colors
      /hsla\([^)]+\)/g // HSLA colors
    ];

    // Extract from inline styles
    inlineStyles.forEach(el => {
      const style = el.getAttribute('style') || '';
      colorPatterns.forEach(pattern => {
        const matches = style.match(pattern);
        if (matches) matches.forEach(m => colors.add(m.toLowerCase()));
      });
    });

    // Extract from style tags
    styleTags.forEach(style => {
      const css = style.textContent || '';
      colorPatterns.forEach(pattern => {
        const matches = css.match(pattern);
        if (matches) matches.forEach(m => colors.add(m.toLowerCase()));
      });
    });

    // Analyze color palette
    const colorArray = Array.from(colors);
    const colorCount = colorArray.length;
    
    if (colorCount >= 3 && colorCount <= 8) {
      visual.score += 15;
      visual.strengths.push(`Well-balanced color palette (${colorCount} colors)`);
    } else if (colorCount > 8) {
      visual.score += 5;
      visual.issues.push(`Too many colors (${colorCount}) - consider simplifying palette`);
    } else if (colorCount < 3) {
      visual.issues.push(`Limited color palette (${colorCount} colors) - may appear monochromatic`);
    }

    visual.details.colorScheme = {
      totalColors: colorCount,
      colors: colorArray.slice(0, 10) // Limit to first 10 for display
    };

    // Check for dark mode support
    const prefersDarkMode = doc.querySelector('link[media*="prefers-color-scheme: dark"]') !== null ||
                            doc.querySelector('style[media*="prefers-color-scheme: dark"]') !== null ||
                            html.includes('prefers-color-scheme');
    if (prefersDarkMode) {
      visual.score += 10;
      visual.strengths.push('Dark mode support detected');
      visual.details.colorScheme.darkMode = true;
    } else {
      visual.issues.push('No dark mode support detected');
      visual.details.colorScheme.darkMode = false;
    }

    // Check for CSS variables (modern approach)
    const cssVariables = html.match(/--[a-zA-Z0-9-]+:\s*[^;]+/g);
    if (cssVariables && cssVariables.length > 0) {
      visual.score += 10;
      visual.strengths.push(`CSS custom properties used (${cssVariables.length} variables)`);
      visual.details.colorScheme.cssVariables = cssVariables.length;
    }

    return visual;
  },

  // Analyze typography
  analyzeTypography(doc, html) {
    const typography = {
      score: 0,
      issues: [],
      strengths: [],
      details: {}
    };

    // Extract font families
    const fontFamilies = new Set();
    const fontPattern = /font-family:\s*([^;]+)/gi;
    const matches = html.match(fontPattern);
    if (matches) {
      matches.forEach(match => {
        const fonts = match.replace(/font-family:\s*/i, '').split(',').map(f => f.trim().replace(/['"]/g, ''));
        fonts.forEach(f => {
          if (f && !f.includes('inherit') && !f.includes('initial')) {
            fontFamilies.add(f);
          }
        });
      });
    }

    const fontCount = fontFamilies.size;
    if (fontCount >= 1 && fontCount <= 3) {
      typography.score += 15;
      typography.strengths.push(`Good font variety (${fontCount} font family/families)`);
    } else if (fontCount > 3) {
      typography.score += 5;
      typography.issues.push(`Too many font families (${fontCount}) - may affect consistency`);
    } else {
      typography.issues.push('No custom fonts detected');
    }

    typography.details.fontFamilies = Array.from(fontFamilies).slice(0, 5);

    // Check for web fonts (Google Fonts, etc.)
    const googleFonts = doc.querySelector('link[href*="fonts.googleapis.com"]') !== null;
    const fontAwesome = doc.querySelector('link[href*="fontawesome"]') !== null ||
                       doc.querySelector('link[href*="font-awesome"]') !== null;
    const customFonts = doc.querySelectorAll('link[rel="preload"][as="font"]').length > 0;

    if (googleFonts || customFonts) {
      typography.score += 10;
      typography.strengths.push('Web fonts properly loaded');
      typography.details.webFonts = { googleFonts, customFonts, fontAwesome };
    } else {
      typography.issues.push('No web fonts detected - using system fonts only');
    }

    // Check heading hierarchy and sizes
    const headings = {
      h1: doc.querySelectorAll('h1'),
      h2: doc.querySelectorAll('h2'),
      h3: doc.querySelectorAll('h3'),
      h4: doc.querySelectorAll('h4'),
      h5: doc.querySelectorAll('h5'),
      h6: doc.querySelectorAll('h6')
    };

    const totalHeadings = Object.values(headings).reduce((sum, h) => sum + h.length, 0);
    if (totalHeadings >= 3) {
      typography.score += 10;
      typography.strengths.push(`Good heading structure (${totalHeadings} headings)`);
    } else if (totalHeadings === 0) {
      typography.issues.push('No headings found - poor content hierarchy');
    }

    typography.details.headings = {
      h1: headings.h1.length,
      h2: headings.h2.length,
      h3: headings.h3.length,
      h4: headings.h4.length,
      h5: headings.h5.length,
      h6: headings.h6.length,
      total: totalHeadings
    };

    // Check for font size definitions
    const fontSizePattern = /font-size:\s*([^;]+)/gi;
    const fontSizeMatches = html.match(fontSizePattern);
    if (fontSizeMatches && fontSizeMatches.length > 0) {
      typography.score += 5;
      typography.details.fontSizes = fontSizeMatches.length;
    }

    // Check for line-height (readability)
    const lineHeightPattern = /line-height:\s*([^;]+)/gi;
    const lineHeightMatches = html.match(lineHeightPattern);
    if (lineHeightMatches && lineHeightMatches.length > 0) {
      typography.score += 5;
      typography.strengths.push('Line-height defined (improves readability)');
      typography.details.lineHeight = true;
    } else {
      typography.issues.push('No line-height defined - may affect readability');
    }

    typography.score = Math.min(typography.score, 100);
    return typography;
  },

  // Analyze layout structure
  analyzeLayout(doc) {
    const layout = {
      score: 0,
      issues: [],
      strengths: [],
      details: {}
    };

    // Check for semantic HTML structure
    const semanticElements = {
      header: doc.querySelectorAll('header').length,
      nav: doc.querySelectorAll('nav').length,
      main: doc.querySelectorAll('main').length,
      article: doc.querySelectorAll('article').length,
      section: doc.querySelectorAll('section').length,
      aside: doc.querySelectorAll('aside').length,
      footer: doc.querySelectorAll('footer').length
    };

    const totalSemantic = Object.values(semanticElements).reduce((sum, val) => sum + val, 0);
    if (totalSemantic >= 3) {
      layout.score += 20;
      layout.strengths.push(`Good semantic HTML structure (${totalSemantic} semantic elements)`);
    } else if (totalSemantic > 0) {
      layout.score += 10;
      layout.strengths.push(`Some semantic HTML used (${totalSemantic} elements)`);
    } else {
      layout.issues.push('No semantic HTML elements found - poor structure');
    }

    layout.details.semanticElements = semanticElements;

    // Check for navigation
    const navElements = doc.querySelectorAll('nav, [role="navigation"]');
    if (navElements.length > 0) {
      layout.score += 10;
      layout.strengths.push('Navigation structure present');
      layout.details.hasNavigation = true;
    } else {
      layout.issues.push('No navigation element found');
      layout.details.hasNavigation = false;
    }

    // Check for grid/flexbox usage (modern layouts)
    const htmlContent = doc.documentElement.outerHTML;
    const hasGrid = htmlContent.includes('display: grid') || htmlContent.includes('display:grid') ||
                   htmlContent.includes('grid-template') || htmlContent.includes('grid-template-columns');
    const hasFlexbox = htmlContent.includes('display: flex') || htmlContent.includes('display:flex') ||
                      htmlContent.includes('flex-direction') || htmlContent.includes('justify-content');

    if (hasGrid || hasFlexbox) {
      layout.score += 10;
      layout.strengths.push('Modern layout techniques used (Grid/Flexbox)');
      layout.details.modernLayout = { grid: hasGrid, flexbox: hasFlexbox };
    } else {
      layout.issues.push('No modern layout techniques detected (Grid/Flexbox)');
      layout.details.modernLayout = { grid: false, flexbox: false };
    }

    // Check for container/wrapper elements
    const containers = doc.querySelectorAll('.container, .wrapper, .content, [class*="container"], [class*="wrapper"]');
    if (containers.length > 0) {
      layout.score += 5;
      layout.strengths.push('Container structure present');
      layout.details.hasContainers = true;
      layout.details.containerCount = containers.length;
    }

    // Check for responsive breakpoints
    const hasMediaQueries = htmlContent.includes('@media') || htmlContent.includes('media=');
    if (hasMediaQueries) {
      layout.score += 10;
      layout.strengths.push('Responsive design breakpoints detected');
      layout.details.responsive = true;
    } else {
      layout.issues.push('No media queries detected - may not be fully responsive');
      layout.details.responsive = false;
    }

    // Check for whitespace/breathing room
    const hasPadding = htmlContent.includes('padding') || htmlContent.includes('margin');
    if (hasPadding) {
      layout.score += 5;
      layout.details.hasSpacing = true;
    }

    layout.score = Math.min(layout.score, 100);
    return layout;
  },

  // Analyze images
  analyzeImages(doc, url) {
    const images = {
      score: 0,
      issues: [],
      strengths: [],
      details: {}
    };

    const imgElements = doc.querySelectorAll('img');
    const imageCount = imgElements.length;

    if (imageCount === 0) {
      images.issues.push('No images found - portfolio may lack visual appeal');
      images.details.total = 0;
      return images;
    }

    images.details.total = imageCount;

    // Analyze image attributes
    let imagesWithAlt = 0;
    let imagesWithSrcset = 0;
    let imagesWithLoading = 0;
    let imagesWithWidth = 0;
    let imagesWithHeight = 0;
    const imageFormats = new Set();
    const imageSizes = [];

    imgElements.forEach(img => {
      // Alt text
      if (img.getAttribute('alt') !== null && img.getAttribute('alt').trim() !== '') {
        imagesWithAlt++;
      }

      // Responsive images
      if (img.hasAttribute('srcset')) {
        imagesWithSrcset++;
      }

      // Lazy loading
      if (img.getAttribute('loading') === 'lazy') {
        imagesWithLoading++;
      }

      // Dimensions
      if (img.hasAttribute('width')) imagesWithWidth++;
      if (img.hasAttribute('height')) imagesWithHeight++;

      // Format detection
      const src = img.getAttribute('src') || '';
      if (src.includes('.jpg') || src.includes('.jpeg')) imageFormats.add('JPEG');
      else if (src.includes('.png')) imageFormats.add('PNG');
      else if (src.includes('.webp')) imageFormats.add('WebP');
      else if (src.includes('.svg')) imageFormats.add('SVG');
      else if (src.includes('.gif')) imageFormats.add('GIF');
    });

    // Alt text coverage
    const altTextPercentage = (imagesWithAlt / imageCount) * 100;
    if (altTextPercentage >= 90) {
      images.score += 20;
      images.strengths.push(`Excellent alt text coverage (${Math.round(altTextPercentage)}%)`);
    } else if (altTextPercentage >= 70) {
      images.score += 15;
      images.strengths.push(`Good alt text coverage (${Math.round(altTextPercentage)}%)`);
    } else {
      images.issues.push(`Only ${Math.round(altTextPercentage)}% of images have alt text`);
    }

    // Responsive images
    const srcsetPercentage = (imagesWithSrcset / imageCount) * 100;
    if (srcsetPercentage >= 50) {
      images.score += 15;
      images.strengths.push(`Responsive images used (${Math.round(srcsetPercentage)}%)`);
    } else if (imageCount > 3) {
      images.issues.push(`Only ${Math.round(srcsetPercentage)}% of images use responsive srcset`);
    }

    // Lazy loading
    const lazyLoadPercentage = (imagesWithLoading / imageCount) * 100;
    if (lazyLoadPercentage >= 50) {
      images.score += 10;
      images.strengths.push(`Lazy loading implemented (${Math.round(lazyLoadPercentage)}%)`);
    } else if (imageCount > 5) {
      images.issues.push(`Only ${Math.round(lazyLoadPercentage)}% of images use lazy loading`);
    }

    // Dimensions
    const dimensionsPercentage = ((imagesWithWidth + imagesWithHeight) / 2 / imageCount) * 100;
    if (dimensionsPercentage >= 80) {
      images.score += 10;
      images.strengths.push('Image dimensions specified (prevents layout shift)');
    } else if (imageCount > 3) {
      images.issues.push('Many images missing width/height attributes');
    }

    // Modern formats
    if (imageFormats.has('WebP') || imageFormats.has('SVG')) {
      images.score += 10;
      images.strengths.push('Modern image formats used (WebP/SVG)');
    } else if (imageFormats.size > 0) {
      images.score += 5;
    }

    images.details = {
      total: imageCount,
      withAlt: imagesWithAlt,
      withSrcset: imagesWithSrcset,
      withLazyLoading: imagesWithLoading,
      withDimensions: { width: imagesWithWidth, height: imagesWithHeight },
      formats: Array.from(imageFormats),
      altTextPercentage: Math.round(altTextPercentage),
      srcsetPercentage: Math.round(srcsetPercentage),
      lazyLoadPercentage: Math.round(lazyLoadPercentage)
    };

    images.score = Math.min(images.score, 100);
    return images;
  },

  // Combined visual analysis
  analyzeVisualDesign(doc, html, url) {
    const colorAnalysis = this.analyzeColorScheme(doc, html);
    const typographyAnalysis = this.analyzeTypography(doc, html);
    const layoutAnalysis = this.analyzeLayout(doc);
    const imagesAnalysis = this.analyzeImages(doc, url);

    // Combine scores (weighted)
    const visualScore = Math.round(
      colorAnalysis.score * 0.25 +
      typographyAnalysis.score * 0.25 +
      layoutAnalysis.score * 0.30 +
      imagesAnalysis.score * 0.20
    );

    // Combine issues and strengths
    const allIssues = [
      ...colorAnalysis.issues,
      ...typographyAnalysis.issues,
      ...layoutAnalysis.issues,
      ...imagesAnalysis.issues
    ];

    const allStrengths = [
      ...colorAnalysis.strengths,
      ...typographyAnalysis.strengths,
      ...layoutAnalysis.strengths,
      ...imagesAnalysis.strengths
    ];

    return {
      score: visualScore,
      issues: allIssues,
      strengths: allStrengths,
      details: {
        colorScheme: colorAnalysis.details,
        typography: typographyAnalysis.details,
        layout: {
          ...layoutAnalysis.details,
          score: layoutAnalysis.score
        },
        images: imagesAnalysis.details
      }
    };
  },

  // Analyze project showcase quality
  analyzeProjectShowcase(doc, bodyText, url) {
    const projects = {
      score: 0,
      issues: [],
      strengths: [],
      details: {}
    };

    // Find project-related sections
    const projectKeywords = ['project', 'portfolio', 'work', 'case study', 'showcase', 'gallery'];
    const projectSections = Array.from(doc.querySelectorAll('section, article, div')).filter(el => {
      const text = (el.textContent || '').toLowerCase();
      const className = (el.className || '').toLowerCase();
      const id = (el.id || '').toLowerCase();
      return projectKeywords.some(keyword => 
        text.includes(keyword) || className.includes(keyword) || id.includes(keyword)
      );
    });

    projects.details.sectionsFound = projectSections.length;

    if (projectSections.length === 0) {
      projects.issues.push('No project showcase section found');
      return projects;
    }

    projects.score += 15;
    projects.strengths.push(`Project showcase section(s) found (${projectSections.length})`);

    // Check for project links (GitHub, live demos, etc.)
    const links = doc.querySelectorAll('a[href]');
    const projectLinks = {
      github: 0,
      live: 0,
      demo: 0,
      external: 0
    };

    links.forEach(link => {
      const href = (link.getAttribute('href') || '').toLowerCase();
      const text = (link.textContent || '').toLowerCase();
      
      if (href.includes('github.com')) projectLinks.github++;
      if (href.includes('live') || href.includes('demo') || text.includes('live') || text.includes('demo')) {
        projectLinks.live++;
      }
      if (href.includes('http') && !href.includes(url.toLowerCase())) projectLinks.external++;
    });

    const totalProjectLinks = projectLinks.github + projectLinks.live + projectLinks.external;
    if (totalProjectLinks >= 3) {
      projects.score += 20;
      projects.strengths.push(`Multiple project links found (${totalProjectLinks} links)`);
    } else if (totalProjectLinks > 0) {
      projects.score += 10;
      projects.strengths.push(`Some project links found (${totalProjectLinks} links)`);
    } else {
      projects.issues.push('No project links found (GitHub, live demos, etc.)');
    }

    projects.details.links = projectLinks;

    // Check for technology mentions
    const techKeywords = [
      'javascript', 'react', 'vue', 'angular', 'node', 'python', 'java', 'typescript',
      'html', 'css', 'sass', 'less', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
      'mongodb', 'mysql', 'postgresql', 'firebase', 'aws', 'docker', 'kubernetes',
      'figma', 'sketch', 'adobe', 'photoshop', 'illustrator'
    ];

    const technologiesFound = techKeywords.filter(tech => 
      bodyText.includes(tech.toLowerCase())
    );

    if (technologiesFound.length >= 5) {
      projects.score += 15;
      projects.strengths.push(`Comprehensive technology stack mentioned (${technologiesFound.length} technologies)`);
    } else if (technologiesFound.length >= 2) {
      projects.score += 10;
      projects.strengths.push(`Technologies mentioned (${technologiesFound.length} technologies)`);
    } else {
      projects.issues.push('Few or no technologies mentioned in projects');
    }

    projects.details.technologies = technologiesFound.slice(0, 10);

    // Check for project descriptions
    const projectCards = doc.querySelectorAll('.project, .portfolio-item, [class*="project"], [class*="portfolio"]');
    if (projectCards.length > 0) {
      projects.score += 10;
      projects.strengths.push(`Project cards/items found (${projectCards.length} items)`);
      projects.details.projectCards = projectCards.length;
    }

    // Check for images in project sections
    const projectImages = projectSections.reduce((count, section) => {
      return count + section.querySelectorAll('img').length;
    }, 0);

    if (projectImages > 0) {
      projects.score += 10;
      projects.strengths.push(`Project images/screenshots present (${projectImages} images)`);
      projects.details.projectImages = projectImages;
    } else {
      projects.issues.push('No images in project sections');
    }

    projects.score = Math.min(projects.score, 100);
    return projects;
  },

  // Analyze case study depth
  analyzeCaseStudyDepth(doc, bodyText) {
    const caseStudy = {
      score: 0,
      issues: [],
      strengths: [],
      details: {}
    };

    // Check for case study keywords
    const caseStudyKeywords = ['case study', 'case-study', 'problem', 'solution', 'challenge', 'result', 'impact', 'outcome'];
    const hasCaseStudySection = caseStudyKeywords.some(keyword => 
      bodyText.includes(keyword.toLowerCase())
    );

    if (!hasCaseStudySection) {
      caseStudy.issues.push('No case study structure detected');
      return caseStudy;
    }

    caseStudy.score += 15;
    caseStudy.strengths.push('Case study structure detected');

    // Check for problem-solution-impact structure
    const problemKeywords = ['problem', 'challenge', 'issue', 'pain point', 'difficulty'];
    const solutionKeywords = ['solution', 'approach', 'method', 'strategy', 'process'];
    const impactKeywords = ['impact', 'result', 'outcome', 'achievement', 'improvement', 'metric', 'kpi'];

    const hasProblem = problemKeywords.some(keyword => bodyText.includes(keyword.toLowerCase()));
    const hasSolution = solutionKeywords.some(keyword => bodyText.includes(keyword.toLowerCase()));
    const hasImpact = impactKeywords.some(keyword => bodyText.includes(keyword.toLowerCase()));

    let structureScore = 0;
    if (hasProblem) {
      structureScore += 10;
      caseStudy.strengths.push('Problem/challenge section identified');
    } else {
      caseStudy.issues.push('No problem/challenge section found');
    }

    if (hasSolution) {
      structureScore += 10;
      caseStudy.strengths.push('Solution/approach section identified');
    } else {
      caseStudy.issues.push('No solution/approach section found');
    }

    if (hasImpact) {
      structureScore += 15;
      caseStudy.strengths.push('Impact/results section identified');
    } else {
      caseStudy.issues.push('No impact/results section found');
    }

    caseStudy.score += structureScore;
    caseStudy.details.structure = {
      hasProblem,
      hasSolution,
      hasImpact,
      completeness: (hasProblem && hasSolution && hasImpact) ? 'complete' : 'partial'
    };

    // Check for metrics/numbers (quantifiable results)
    const metricPattern = /\d+%|\$\d+|\d+\s*(users|visitors|clicks|conversions|revenue|growth|increase|decrease)/gi;
    const metrics = bodyText.match(metricPattern);
    if (metrics && metrics.length >= 2) {
      caseStudy.score += 15;
      caseStudy.strengths.push(`Quantifiable metrics included (${metrics.length} metrics found)`);
      caseStudy.details.metrics = metrics.slice(0, 5);
    } else {
      caseStudy.issues.push('Few or no quantifiable metrics in case studies');
    }

    // Check for before/after comparisons
    const beforeAfterKeywords = ['before', 'after', 'previous', 'improved', 'increased', 'decreased'];
    const hasBeforeAfter = beforeAfterKeywords.some(keyword => bodyText.includes(keyword.toLowerCase()));
    if (hasBeforeAfter) {
      caseStudy.score += 10;
      caseStudy.strengths.push('Before/after comparisons present');
      caseStudy.details.hasBeforeAfter = true;
    }

    caseStudy.score = Math.min(caseStudy.score, 100);
    return caseStudy;
  },

  // Analyze writing quality
  analyzeWritingQuality(doc, bodyText) {
    const writing = {
      score: 0,
      issues: [],
      strengths: [],
      details: {}
    };

    // Basic text analysis
    const wordCount = bodyText.split(/\s+/).filter(word => word.length > 0).length;
    const sentenceCount = bodyText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;

    writing.details.wordCount = wordCount;
    writing.details.sentenceCount = sentenceCount;
    writing.details.avgWordsPerSentence = Math.round(avgWordsPerSentence * 10) / 10;

    // Check content length
    if (wordCount >= 500) {
      writing.score += 15;
      writing.strengths.push(`Substantial content (${wordCount} words)`);
    } else if (wordCount >= 200) {
      writing.score += 10;
      writing.strengths.push(`Adequate content (${wordCount} words)`);
    } else {
      writing.issues.push(`Limited content (${wordCount} words) - consider adding more detail`);
    }

    // Check sentence length (readability)
    if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 20) {
      writing.score += 10;
      writing.strengths.push('Good sentence length for readability');
    } else if (avgWordsPerSentence > 25) {
      writing.issues.push('Sentences may be too long (affects readability)');
    } else if (avgWordsPerSentence < 8) {
      writing.issues.push('Sentences may be too short (may lack detail)');
    }

    // Check for professional language
    const professionalKeywords = ['experience', 'expertise', 'skills', 'achievement', 'accomplishment', 
                                  'professional', 'collaborate', 'implement', 'develop', 'design'];
    const professionalCount = professionalKeywords.filter(keyword => 
      bodyText.includes(keyword.toLowerCase())
    ).length;

    if (professionalCount >= 5) {
      writing.score += 10;
      writing.strengths.push('Professional language used');
    }

    // Check for spelling/grammar indicators (basic check)
    const commonMistakes = ['teh ', 'adn ', 'taht ', 'recieve', 'seperate', 'definately'];
    const mistakesFound = commonMistakes.filter(mistake => 
      bodyText.toLowerCase().includes(mistake)
    );

    if (mistakesFound.length === 0) {
      writing.score += 10;
      writing.strengths.push('No obvious spelling errors detected');
    } else {
      writing.issues.push(`Possible spelling errors detected (${mistakesFound.length})`);
    }

    // Check for active voice indicators
    const activeVoiceIndicators = ['developed', 'created', 'designed', 'built', 'implemented', 
                                   'achieved', 'improved', 'increased', 'reduced'];
    const activeVoiceCount = activeVoiceIndicators.filter(indicator => 
      bodyText.toLowerCase().includes(indicator)
    ).length;

    if (activeVoiceCount >= 3) {
      writing.score += 10;
      writing.strengths.push('Active voice used (engaging writing)');
      writing.details.activeVoice = true;
    }

    // Check for headings and structure
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length >= 3) {
      writing.score += 10;
      writing.strengths.push('Well-structured content with headings');
    }

    // Check for lists (improves readability)
    const lists = doc.querySelectorAll('ul, ol');
    if (lists.length > 0) {
      writing.score += 5;
      writing.strengths.push('Lists used for better readability');
      writing.details.hasLists = true;
    }

    writing.score = Math.min(writing.score, 100);
    return writing;
  },

  // Analyze call-to-action effectiveness
  analyzeCallToAction(doc, bodyText) {
    const cta = {
      score: 0,
      issues: [],
      strengths: [],
      details: {}
    };

    // Common CTA phrases
    const ctaPhrases = [
      'contact me', 'get in touch', 'hire me', 'let\'s work together', 'let\'s connect',
      'view my work', 'see my projects', 'download resume', 'view resume', 'download cv',
      'schedule a call', 'book a meeting', 'reach out', 'send a message', 'email me',
      'learn more', 'read more', 'view more', 'explore', 'check out'
    ];

    const ctaFound = ctaPhrases.filter(phrase => 
      bodyText.toLowerCase().includes(phrase.toLowerCase())
    );

    if (ctaFound.length === 0) {
      cta.issues.push('No clear call-to-action found');
      return cta;
    }

    cta.score += 20;
    cta.strengths.push(`Call-to-action(s) found (${ctaFound.length} CTAs)`);
    cta.details.ctaPhrases = ctaFound;

    // Check for CTA buttons/links
    const buttons = doc.querySelectorAll('button, a[class*="button"], a[class*="btn"], input[type="submit"]');
    const ctaButtons = Array.from(buttons).filter(btn => {
      const text = (btn.textContent || btn.value || '').toLowerCase();
      return ctaPhrases.some(phrase => text.includes(phrase.toLowerCase()));
    });

    if (ctaButtons.length > 0) {
      cta.score += 15;
      cta.strengths.push(`CTA buttons present (${ctaButtons.length} buttons)`);
      cta.details.ctaButtons = ctaButtons.length;
    } else {
      cta.issues.push('No CTA buttons found - consider adding clickable CTAs');
    }

    // Check for contact form
    const contactForm = doc.querySelector('form') !== null;
    if (contactForm) {
      cta.score += 15;
      cta.strengths.push('Contact form present');
      cta.details.hasContactForm = true;
    } else {
      cta.issues.push('No contact form found');
    }

    // Check for email links
    const emailLinks = doc.querySelectorAll('a[href^="mailto:"]');
    if (emailLinks.length > 0) {
      cta.score += 10;
      cta.strengths.push(`Email contact links present (${emailLinks.length} links)`);
      cta.details.emailLinks = emailLinks.length;
    }

    // Check for social media links (also CTAs)
    const socialLinks = doc.querySelectorAll('a[href*="linkedin"], a[href*="twitter"], a[href*="github"]');
    if (socialLinks.length >= 2) {
      cta.score += 10;
      cta.strengths.push(`Social media links for connection (${socialLinks.length} links)`);
      cta.details.socialLinks = socialLinks.length;
    }

    // Check CTA placement (in visible areas)
    const visibleCTAs = Array.from(buttons).filter(btn => {
      const text = (btn.textContent || '').toLowerCase();
      return ctaPhrases.some(phrase => text.includes(phrase.toLowerCase()));
    }).length;

    if (visibleCTAs >= 2) {
      cta.score += 10;
      cta.strengths.push('Multiple CTAs found (good for conversion)');
    }

    cta.score = Math.min(cta.score, 100);
    return cta;
  },

  // Analyze personal branding consistency
  analyzePersonalBranding(doc, bodyText, url) {
    const branding = {
      score: 0,
      issues: [],
      strengths: [],
      details: {}
    };

    // Check for consistent name usage
    const namePattern = /(?:my name is|i'm|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i;
    const nameMatch = bodyText.match(namePattern);
    if (nameMatch) {
      branding.score += 10;
      branding.strengths.push('Personal introduction present');
      branding.details.hasName = true;
    } else {
      branding.issues.push('No clear personal introduction found');
    }

    // Check for professional title/role
    const roleKeywords = ['developer', 'designer', 'engineer', 'consultant', 'freelancer', 
                         'specialist', 'expert', 'professional', 'architect', 'manager'];
    const roleFound = roleKeywords.filter(role => 
      bodyText.toLowerCase().includes(role.toLowerCase())
    );

    if (roleFound.length > 0) {
      branding.score += 10;
      branding.strengths.push(`Professional role clearly stated (${roleFound[0]})`);
      branding.details.role = roleFound[0];
    } else {
      branding.issues.push('Professional role not clearly stated');
    }

    // Check for consistent messaging
    const aboutSection = doc.querySelector('section[id*="about"], section[class*="about"], #about, .about');
    const hasAboutSection = aboutSection !== null;
    
    if (hasAboutSection) {
      branding.score += 15;
      branding.strengths.push('Dedicated about section present');
      branding.details.hasAboutSection = true;
    } else {
      branding.issues.push('No dedicated about section found');
    }

    // Check for personal story/narrative
    const storyKeywords = ['passion', 'journey', 'story', 'background', 'experience', 'love', 'enjoy'];
    const storyFound = storyKeywords.filter(keyword => 
      bodyText.toLowerCase().includes(keyword.toLowerCase())
    ).length;

    if (storyFound >= 3) {
      branding.score += 10;
      branding.strengths.push('Personal narrative/story present');
      branding.details.hasPersonalStory = true;
    }

    // Check for value proposition
    const valueKeywords = ['help', 'solve', 'create', 'build', 'deliver', 'provide', 'offer', 'specialize'];
    const valueFound = valueKeywords.filter(keyword => 
      bodyText.toLowerCase().includes(keyword.toLowerCase())
    ).length;

    if (valueFound >= 2) {
      branding.score += 10;
      branding.strengths.push('Value proposition clear');
      branding.details.hasValueProposition = true;
    } else {
      branding.issues.push('Value proposition not clearly stated');
    }

    // Check for consistent visual identity (favicon, title)
    const title = doc.querySelector('title')?.textContent || '';
    const favicon = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    
    if (title && title.length > 0) {
      branding.score += 5;
      branding.details.hasTitle = true;
    }

    if (favicon) {
      branding.score += 5;
      branding.details.hasFavicon = true;
    }

    // Check for testimonials/recommendations
    const testimonialKeywords = ['testimonial', 'recommendation', 'review', 'client', 'customer', 'said', 'quote'];
    const hasTestimonials = testimonialKeywords.some(keyword => 
      bodyText.toLowerCase().includes(keyword.toLowerCase())
    );

    if (hasTestimonials) {
      branding.score += 10;
      branding.strengths.push('Testimonials/recommendations present');
      branding.details.hasTestimonials = true;
    }

    // Check for consistent contact information
    const contactInfo = {
      email: /[\w.-]+@[\w.-]+\.\w+/i.test(bodyText) || doc.querySelector('a[href^="mailto:"]') !== null,
      phone: /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\(\d{3}\)\s?\d{3}[-.\s]?\d{4}/.test(bodyText),
      location: /(?:located in|based in|from|live in)\s+[A-Z][a-z]+/i.test(bodyText)
    };

    const contactCount = Object.values(contactInfo).filter(v => v === true).length;
    if (contactCount >= 2) {
      branding.score += 10;
      branding.strengths.push('Contact information present');
      branding.details.contactInfo = contactInfo;
    } else {
      branding.issues.push('Limited contact information');
    }

    branding.score = Math.min(branding.score, 100);
    return branding;
  },

  // Combined content analysis
  analyzeContent(doc, bodyText, url) {
    const projectAnalysis = this.analyzeProjectShowcase(doc, bodyText, url);
    const caseStudyAnalysis = this.analyzeCaseStudyDepth(doc, bodyText);
    const writingAnalysis = this.analyzeWritingQuality(doc, bodyText);
    const ctaAnalysis = this.analyzeCallToAction(doc, bodyText);
    const brandingAnalysis = this.analyzePersonalBranding(doc, bodyText, url);

    // Combine scores (weighted)
    const contentScore = Math.round(
      projectAnalysis.score * 0.25 +
      caseStudyAnalysis.score * 0.20 +
      writingAnalysis.score * 0.25 +
      ctaAnalysis.score * 0.15 +
      brandingAnalysis.score * 0.15
    );

    // Combine issues and strengths
    const allIssues = [
      ...projectAnalysis.issues,
      ...caseStudyAnalysis.issues,
      ...writingAnalysis.issues,
      ...ctaAnalysis.issues,
      ...brandingAnalysis.issues
    ];

    const allStrengths = [
      ...projectAnalysis.strengths,
      ...caseStudyAnalysis.strengths,
      ...writingAnalysis.strengths,
      ...ctaAnalysis.strengths,
      ...brandingAnalysis.strengths
    ];

    return {
      score: contentScore,
      issues: allIssues,
      strengths: allStrengths,
      details: {
        projects: projectAnalysis.details,
        caseStudy: caseStudyAnalysis.details,
        writing: writingAnalysis.details,
        callToAction: ctaAnalysis.details,
        branding: brandingAnalysis.details
      }
    };
  },

  // Detect industry/field from portfolio content
  detectIndustry(bodyText, doc) {
    const industries = {
      'Web Developer': {
        keywords: ['javascript', 'react', 'vue', 'angular', 'node.js', 'html', 'css', 'frontend', 'backend', 'full stack', 'web development', 'api', 'rest'],
        weight: 0
      },
      'Mobile Developer': {
        keywords: ['ios', 'android', 'swift', 'kotlin', 'react native', 'flutter', 'mobile app', 'app development', 'xcode', 'android studio'],
        weight: 0
      },
      'UI/UX Designer': {
        keywords: ['ui design', 'ux design', 'user experience', 'user interface', 'figma', 'sketch', 'adobe xd', 'prototype', 'wireframe', 'design system', 'interaction design'],
        weight: 0
      },
      'Data Scientist': {
        keywords: ['python', 'machine learning', 'data science', 'data analysis', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'jupyter', 'sql', 'data visualization'],
        weight: 0
      },
      'DevOps Engineer': {
        keywords: ['docker', 'kubernetes', 'ci/cd', 'aws', 'azure', 'gcp', 'terraform', 'ansible', 'jenkins', 'devops', 'infrastructure'],
        weight: 0
      },
      'Software Engineer': {
        keywords: ['java', 'c++', 'c#', '.net', 'software engineering', 'algorithm', 'data structure', 'system design'],
        weight: 0
      },
      'Graphic Designer': {
        keywords: ['photoshop', 'illustrator', 'indesign', 'graphic design', 'branding', 'logo design', 'print design', 'adobe creative suite'],
        weight: 0
      },
      'Content Creator': {
        keywords: ['content creation', 'blogging', 'writing', 'copywriting', 'content strategy', 'seo writing', 'social media content'],
        weight: 0
      }
    };

    const lowerBodyText = bodyText.toLowerCase();
    
    // Calculate weights for each industry
    Object.keys(industries).forEach(industry => {
      industries[industry].weight = industries[industry].keywords.filter(keyword =>
        lowerBodyText.includes(keyword.toLowerCase())
      ).length;
    });

    // Find the industry with highest weight
    const sortedIndustries = Object.entries(industries)
      .sort((a, b) => b[1].weight - a[1].weight);

    const primaryIndustry = sortedIndustries[0][1].weight > 0 
      ? sortedIndustries[0][0] 
      : 'General';

    return {
      primary: primaryIndustry,
      confidence: sortedIndustries[0][1].weight > 0 
        ? Math.min((sortedIndustries[0][1].weight / sortedIndustries[0][1].keywords.length) * 100, 100)
        : 0,
      allIndustries: sortedIndustries.map(([name, data]) => ({
        name,
        weight: data.weight,
        matchCount: data.weight
      }))
    };
  },

  // Get industry benchmarks
  getIndustryBenchmarks(industry, overallScore) {
    // Industry-specific benchmark scores (0-100)
    const benchmarks = {
      'Web Developer': {
        average: 68,
        top25Percent: 78,
        top10Percent: 88,
        excellent: 90,
        good: 75,
        needsImprovement: 60
      },
      'Mobile Developer': {
        average: 65,
        top25Percent: 75,
        top10Percent: 85,
        excellent: 88,
        good: 72,
        needsImprovement: 58
      },
      'UI/UX Designer': {
        average: 72,
        top25Percent: 82,
        top10Percent: 92,
        excellent: 90,
        good: 80,
        needsImprovement: 65
      },
      'Data Scientist': {
        average: 63,
        top25Percent: 73,
        top10Percent: 83,
        excellent: 85,
        good: 70,
        needsImprovement: 55
      },
      'DevOps Engineer': {
        average: 60,
        top25Percent: 70,
        top10Percent: 80,
        excellent: 82,
        good: 68,
        needsImprovement: 55
      },
      'Software Engineer': {
        average: 65,
        top25Percent: 75,
        top10Percent: 85,
        excellent: 87,
        good: 72,
        needsImprovement: 58
      },
      'Graphic Designer': {
        average: 70,
        top25Percent: 80,
        top10Percent: 90,
        excellent: 88,
        good: 78,
        needsImprovement: 63
      },
      'Content Creator': {
        average: 66,
        top25Percent: 76,
        top10Percent: 86,
        excellent: 88,
        good: 73,
        needsImprovement: 58
      },
      'General': {
        average: 65,
        top25Percent: 75,
        top10Percent: 85,
        excellent: 87,
        good: 72,
        needsImprovement: 58
      }
    };

    const benchmark = benchmarks[industry] || benchmarks['General'];
    
    // Determine percentile
    let percentile = 'below average';
    if (overallScore >= benchmark.top10Percent) {
      percentile = 'top 10%';
    } else if (overallScore >= benchmark.top25Percent) {
      percentile = 'top 25%';
    } else if (overallScore >= benchmark.average) {
      percentile = 'above average';
    } else {
      percentile = 'below average';
    }

    // Determine rating
    let rating = 'needs improvement';
    if (overallScore >= benchmark.excellent) {
      rating = 'excellent';
    } else if (overallScore >= benchmark.good) {
      rating = 'good';
    } else if (overallScore >= benchmark.needsImprovement) {
      rating = 'fair';
    }

    return {
      ...benchmark,
      percentile,
      rating,
      score: overallScore,
      gapToTop10: Math.max(0, benchmark.top10Percent - overallScore),
      gapToTop25: Math.max(0, benchmark.top25Percent - overallScore),
      gapToAverage: overallScore >= benchmark.average 
        ? 0 
        : benchmark.average - overallScore
    };
  },

  // Identify unique differentiators
  identifyDifferentiators(analysis, industry) {
    const differentiators = {
      strengths: [],
      uniqueFeatures: [],
      recommendations: []
    };

    // Check for unique strengths
    if (analysis.visual && analysis.visual.score >= 85) {
      differentiators.strengths.push({
        category: 'Visual Design',
        description: 'Exceptional visual design quality',
        impact: 'high',
        uniqueness: 'Above industry standard'
      });
    }

    if (analysis.content && analysis.content.details?.projects?.links?.github >= 5) {
      differentiators.strengths.push({
        category: 'Code Portfolio',
        description: 'Strong GitHub presence with multiple projects',
        impact: 'high',
        uniqueness: 'Demonstrates active development'
      });
    }

    if (analysis.content && analysis.content.details?.caseStudy?.structure?.completeness === 'complete') {
      differentiators.strengths.push({
        category: 'Case Studies',
        description: 'Well-structured case studies with problem-solution-impact',
        impact: 'high',
        uniqueness: 'Shows professional approach'
      });
    }

    if (analysis.performance && analysis.performance.loadTime < 1000) {
      differentiators.strengths.push({
        category: 'Performance',
        description: 'Fast loading times',
        impact: 'medium',
        uniqueness: 'Better than average'
      });
    }

    if (analysis.accessibility && analysis.accessibility.score >= 85) {
      differentiators.strengths.push({
        category: 'Accessibility',
        description: 'Excellent accessibility standards',
        impact: 'high',
        uniqueness: 'Inclusive design approach'
      });
    }

    // Industry-specific differentiators
    if (industry === 'UI/UX Designer') {
      if (analysis.visual && analysis.visual.details?.colorScheme?.totalColors >= 3) {
        differentiators.uniqueFeatures.push('Well-thought-out color palette');
      }
      if (analysis.content && analysis.content.details?.caseStudy?.hasBeforeAfter) {
        differentiators.uniqueFeatures.push('Before/after design comparisons');
      }
    }

    if (industry === 'Web Developer' || industry === 'Mobile Developer') {
      if (analysis.content && analysis.content.details?.projects?.technologies?.length >= 8) {
        differentiators.uniqueFeatures.push('Diverse technology stack');
      }
      if (analysis.performance && analysis.performance.details?.compression) {
        differentiators.uniqueFeatures.push('Optimized performance');
      }
    }

    if (industry === 'Data Scientist') {
      if (analysis.content && analysis.content.details?.caseStudy?.metrics?.length >= 3) {
        differentiators.uniqueFeatures.push('Data-driven case studies with metrics');
      }
    }

    // Identify gaps compared to top performers
    if (analysis.seo && analysis.seo.score < 70) {
      differentiators.recommendations.push({
        area: 'SEO',
        priority: 'high',
        description: 'Improve SEO to match top performers',
        potentialImpact: 'Better discoverability and search rankings'
      });
    }

    if (analysis.content && analysis.content.details?.callToAction?.ctaButtons < 2) {
      differentiators.recommendations.push({
        area: 'Call-to-Action',
        priority: 'medium',
        description: 'Add more CTA buttons for better conversion',
        potentialImpact: 'Increased engagement and inquiries'
      });
    }

    if (analysis.socialMedia && analysis.socialMedia.score < 60) {
      differentiators.recommendations.push({
        area: 'Social Media Integration',
        priority: 'medium',
        description: 'Enhance social media presence and sharing',
        potentialImpact: 'Better social sharing and visibility'
      });
    }

    return differentiators;
  },

  // Get industry-specific best practices
  getIndustryBestPractices(industry, analysis) {
    const practices = {
      'Web Developer': [
        {
          practice: 'Show live demos',
          description: 'Include working demos or links to deployed projects',
          currentStatus: analysis.content?.details?.projects?.links?.live > 0 ? 'implemented' : 'missing',
          priority: 'high'
        },
        {
          practice: 'Display code quality',
          description: 'Link to GitHub repositories with clean, documented code',
          currentStatus: analysis.content?.details?.projects?.links?.github > 0 ? 'implemented' : 'missing',
          priority: 'high'
        },
        {
          practice: 'Technology stack visibility',
          description: 'Clearly list technologies used in each project',
          currentStatus: analysis.content?.details?.projects?.technologies?.length >= 5 ? 'implemented' : 'partial',
          priority: 'medium'
        },
        {
          practice: 'Performance optimization',
          description: 'Demonstrate understanding of web performance best practices',
          currentStatus: analysis.performance?.score >= 75 ? 'implemented' : 'needs improvement',
          priority: 'medium'
        }
      ],
      'UI/UX Designer': [
        {
          practice: 'Design process documentation',
          description: 'Show your design thinking and process',
          currentStatus: analysis.content?.details?.caseStudy?.structure?.completeness === 'complete' ? 'implemented' : 'missing',
          priority: 'high'
        },
        {
          practice: 'Visual design quality',
          description: 'Ensure portfolio itself demonstrates excellent design',
          currentStatus: analysis.visual?.score >= 80 ? 'implemented' : 'needs improvement',
          priority: 'high'
        },
        {
          practice: 'Before/after comparisons',
          description: 'Show design improvements and iterations',
          currentStatus: analysis.content?.details?.caseStudy?.hasBeforeAfter ? 'implemented' : 'missing',
          priority: 'medium'
        },
        {
          practice: 'User research insights',
          description: 'Include user research and testing results',
          currentStatus: 'not checked',
          priority: 'low'
        }
      ],
      'Mobile Developer': [
        {
          practice: 'App store links',
          description: 'Link to published apps in App Store/Play Store',
          currentStatus: 'not checked',
          priority: 'high'
        },
        {
          practice: 'Platform coverage',
          description: 'Show both iOS and Android projects if applicable',
          currentStatus: 'not checked',
          priority: 'medium'
        },
        {
          practice: 'Performance metrics',
          description: 'Include app performance and user metrics',
          currentStatus: analysis.content?.details?.caseStudy?.metrics?.length >= 2 ? 'implemented' : 'missing',
          priority: 'medium'
        }
      ],
      'Data Scientist': [
        {
          practice: 'Data visualizations',
          description: 'Showcase data visualization skills',
          currentStatus: analysis.visual?.details?.images?.total > 0 ? 'implemented' : 'missing',
          priority: 'high'
        },
        {
          practice: 'Quantifiable results',
          description: 'Include metrics and measurable outcomes',
          currentStatus: analysis.content?.details?.caseStudy?.metrics?.length >= 3 ? 'implemented' : 'partial',
          priority: 'high'
        },
        {
          practice: 'Technical depth',
          description: 'Explain methodologies and algorithms used',
          currentStatus: analysis.content?.details?.writing?.wordCount >= 500 ? 'implemented' : 'needs improvement',
          priority: 'medium'
        }
      ],
      'General': [
        {
          practice: 'Clear value proposition',
          description: 'Clearly state what you offer and your unique value',
          currentStatus: analysis.content?.details?.branding?.hasValueProposition ? 'implemented' : 'missing',
          priority: 'high'
        },
        {
          practice: 'Professional presentation',
          description: 'Ensure portfolio reflects professionalism',
          currentStatus: analysis.overallScore >= 70 ? 'implemented' : 'needs improvement',
          priority: 'high'
        },
        {
          practice: 'Easy contact',
          description: 'Make it easy for potential clients/employers to reach you',
          currentStatus: analysis.content?.details?.callToAction?.hasContactForm || analysis.content?.details?.callToAction?.emailLinks > 0 ? 'implemented' : 'missing',
          priority: 'high'
        }
      ]
    };

    const industryPractices = practices[industry] || practices['General'];
    
    return {
      industry,
      practices: industryPractices,
      implementedCount: industryPractices.filter(p => p.currentStatus === 'implemented').length,
      totalCount: industryPractices.length,
      implementationRate: Math.round((industryPractices.filter(p => p.currentStatus === 'implemented').length / industryPractices.length) * 100)
    };
  },

  // Combined competitive benchmarking
  performCompetitiveBenchmarking(analysis, bodyText, doc) {
    const industry = this.detectIndustry(bodyText, doc);
    const benchmarks = this.getIndustryBenchmarks(industry.primary, analysis.overallScore);
    const differentiators = this.identifyDifferentiators(analysis, industry.primary);
    const bestPractices = this.getIndustryBestPractices(industry.primary, analysis);

    return {
      industry: industry.primary,
      industryConfidence: industry.confidence,
      benchmarks,
      differentiators,
      bestPractices,
      competitivePosition: {
        percentile: benchmarks.percentile,
        rating: benchmarks.rating,
        score: benchmarks.score,
        industryAverage: benchmarks.average,
        top25Threshold: benchmarks.top25Percent,
        top10Threshold: benchmarks.top10Percent
      }
    };
  },

  // Generate actionable recommendations
  generateActionableRecommendations(analysis, competitive) {
    const recommendations = {
      quickWins: [],
      longTerm: [],
      highPriority: [],
      mediumPriority: [],
      lowPriority: [],
      byCategory: {
        seo: [],
        accessibility: [],
        performance: [],
        security: [],
        design: [],
        content: [],
        social: []
      }
    };

    // SEO Recommendations
    if (analysis.seo) {
      if (!analysis.seo.details.title || analysis.seo.details.title.length < 30) {
        recommendations.quickWins.push({
          id: 'seo-title',
          category: 'SEO',
          title: 'Optimize Title Tag',
          description: 'Add a descriptive title tag between 30-60 characters',
          priority: 'high',
          impact: 'high',
          effort: 'low',
          estimatedTime: '5 minutes',
          codeExample: '<title>Your Name - Web Developer | Portfolio</title>',
          instructions: 'Update the <title> tag in your HTML head section with a descriptive title that includes your name and profession.',
          expectedImprovement: '+5-10 points on SEO score'
        });
        recommendations.byCategory.seo.push('seo-title');
      }

      if (!analysis.seo.details.metaDescription) {
        recommendations.quickWins.push({
          id: 'seo-meta-desc',
          category: 'SEO',
          title: 'Add Meta Description',
          description: 'Add a meta description tag (120-160 characters)',
          priority: 'high',
          impact: 'high',
          effort: 'low',
          estimatedTime: '5 minutes',
          codeExample: '<meta name="description" content="Professional web developer specializing in React and Node.js. View my portfolio of projects and case studies.">',
          instructions: 'Add a <meta name="description"> tag in your HTML head section describing your portfolio.',
          expectedImprovement: '+5-10 points on SEO score'
        });
        recommendations.byCategory.seo.push('seo-meta-desc');
      }

      if (!analysis.seo.details.openGraph) {
        recommendations.quickWins.push({
          id: 'seo-og-tags',
          category: 'SEO',
          title: 'Add Open Graph Tags',
          description: 'Add Open Graph meta tags for better social media sharing',
          priority: 'medium',
          impact: 'medium',
          effort: 'low',
          estimatedTime: '10 minutes',
          codeExample: `<meta property="og:title" content="Your Name - Portfolio">
<meta property="og:description" content="Professional web developer portfolio">
<meta property="og:image" content="https://yoursite.com/og-image.jpg">
<meta property="og:url" content="https://yoursite.com">`,
          instructions: 'Add Open Graph meta tags in your HTML head section for better social media previews.',
          expectedImprovement: '+5 points on SEO and Social Media scores'
        });
        recommendations.byCategory.seo.push('seo-og-tags');
      }

      if (analysis.seo.details.imageAltText && analysis.seo.details.imageAltText.percentage < 90) {
        recommendations.mediumPriority.push({
          id: 'seo-alt-text',
          category: 'SEO',
          title: 'Add Alt Text to Images',
          description: `Add descriptive alt text to ${100 - analysis.seo.details.imageAltText.percentage}% of images`,
          priority: 'medium',
          impact: 'medium',
          effort: 'medium',
          estimatedTime: '15-30 minutes',
          codeExample: '<img src="project.jpg" alt="E-commerce website homepage showing product catalog">',
          instructions: 'Add descriptive alt attributes to all <img> tags describing what the image shows.',
          expectedImprovement: '+5-10 points on SEO and Accessibility scores'
        });
        recommendations.byCategory.seo.push('seo-alt-text');
        recommendations.byCategory.accessibility.push('seo-alt-text');
      }
    }

    // Accessibility Recommendations
    if (analysis.accessibility) {
      if (!analysis.accessibility.details.language) {
        recommendations.quickWins.push({
          id: 'a11y-lang',
          category: 'Accessibility',
          title: 'Add Language Attribute',
          description: 'Add lang attribute to HTML element',
          priority: 'high',
          impact: 'medium',
          effort: 'low',
          estimatedTime: '1 minute',
          codeExample: '<html lang="en">',
          instructions: 'Add lang="en" (or your language code) to the <html> tag.',
          expectedImprovement: '+5 points on Accessibility score'
        });
        recommendations.byCategory.accessibility.push('a11y-lang');
      }

      if (analysis.accessibility.details.headings && analysis.accessibility.details.headings.h1 !== 1) {
        const issue = analysis.accessibility.details.headings.h1 === 0 
          ? 'Add a single H1 heading'
          : `Reduce H1 headings from ${analysis.accessibility.details.headings.h1} to 1`;
        recommendations.mediumPriority.push({
          id: 'a11y-h1',
          category: 'Accessibility',
          title: 'Fix H1 Heading Structure',
          description: issue,
          priority: 'medium',
          impact: 'medium',
          effort: 'low',
          estimatedTime: '5-10 minutes',
          codeExample: '<h1>Your Name - Professional Developer</h1>',
          instructions: 'Ensure you have exactly one H1 tag on your homepage, typically for your main heading.',
          expectedImprovement: '+5 points on Accessibility and SEO scores'
        });
        recommendations.byCategory.accessibility.push('a11y-h1');
      }
    }

    // Performance Recommendations
    if (analysis.performance) {
      if (!analysis.performance.details.compression) {
        recommendations.longTerm.push({
          id: 'perf-compression',
          category: 'Performance',
          title: 'Enable Content Compression',
          description: 'Enable gzip or brotli compression on your server',
          priority: 'high',
          impact: 'high',
          effort: 'medium',
          estimatedTime: '30-60 minutes',
          codeExample: '// For Apache: Add to .htaccess\n<IfModule mod_deflate.c>\n  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript\n</IfModule>',
          instructions: 'Configure your web server (Apache/Nginx) to enable gzip or brotli compression. This reduces file sizes significantly.',
          expectedImprovement: '+10-15 points on Performance score, faster load times'
        });
        recommendations.byCategory.performance.push('perf-compression');
      }

      if (analysis.performance.details.images && analysis.performance.details.images.total > 5 && 
          analysis.performance.details.images.withSrcset < analysis.performance.details.images.total * 0.5) {
        recommendations.mediumPriority.push({
          id: 'perf-responsive-images',
          category: 'Performance',
          title: 'Add Responsive Images',
          description: 'Add srcset attributes to images for responsive loading',
          priority: 'medium',
          impact: 'medium',
          effort: 'medium',
          estimatedTime: '1-2 hours',
          codeExample: '<img src="image.jpg" srcset="image-small.jpg 480w, image-medium.jpg 768w, image-large.jpg 1200w" sizes="(max-width: 768px) 100vw, 50vw" alt="Description">',
          instructions: 'Add srcset and sizes attributes to your images to serve appropriately sized images based on device.',
          expectedImprovement: '+5-10 points on Performance score, better mobile experience'
        });
        recommendations.byCategory.performance.push('perf-responsive-images');
      }

      if (analysis.performance.details.scripts && analysis.performance.details.scripts.async < analysis.performance.details.scripts.total) {
        recommendations.quickWins.push({
          id: 'perf-async-scripts',
          category: 'Performance',
          title: 'Add Async/Defer to Scripts',
          description: 'Add async or defer attributes to script tags',
          priority: 'medium',
          impact: 'medium',
          effort: 'low',
          estimatedTime: '10 minutes',
          codeExample: '<script src="script.js" defer></script>\n<script src="analytics.js" async></script>',
          instructions: 'Add defer attribute to scripts that need to run after DOM loads, and async to independent scripts.',
          expectedImprovement: '+5 points on Performance score, faster initial page load'
        });
        recommendations.byCategory.performance.push('perf-async-scripts');
      }
    }

    // Security Recommendations
    if (analysis.security) {
      if (!analysis.security.details.https) {
        recommendations.highPriority.push({
          id: 'sec-https',
          category: 'Security',
          title: 'Enable HTTPS',
          description: 'Switch from HTTP to HTTPS (critical security issue)',
          priority: 'critical',
          impact: 'critical',
          effort: 'medium',
          estimatedTime: '1-2 hours',
          codeExample: '// Get SSL certificate from Let\'s Encrypt, Cloudflare, or your hosting provider',
          instructions: 'Obtain an SSL certificate and configure your server to serve content over HTTPS. Many hosting providers offer free SSL certificates.',
          expectedImprovement: '+30 points on Security score, required for modern web'
        });
        recommendations.byCategory.security.push('sec-https');
      }

      if (!analysis.security.details.headers || !analysis.security.details.headers['content-security-policy']) {
        recommendations.longTerm.push({
          id: 'sec-csp',
          category: 'Security',
          title: 'Add Content Security Policy',
          description: 'Implement Content Security Policy header',
          priority: 'high',
          impact: 'high',
          effort: 'high',
          estimatedTime: '2-4 hours',
          codeExample: "Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
          instructions: 'Add CSP header to your server configuration to prevent XSS attacks. Start with a permissive policy and tighten gradually.',
          expectedImprovement: '+15 points on Security score, better protection against attacks'
        });
        recommendations.byCategory.security.push('sec-csp');
      }
    }

    // Design Recommendations
    if (analysis.visual) {
      if (analysis.visual.details.colorScheme && !analysis.visual.details.colorScheme.darkMode) {
        recommendations.mediumPriority.push({
          id: 'design-dark-mode',
          category: 'Design',
          title: 'Add Dark Mode Support',
          description: 'Implement dark mode for better user experience',
          priority: 'medium',
          impact: 'medium',
          effort: 'medium',
          estimatedTime: '2-4 hours',
          codeExample: '@media (prefers-color-scheme: dark) {\n  body { background: #1a1a1a; color: #fff; }\n}',
          instructions: 'Add CSS media queries for prefers-color-scheme: dark to support dark mode.',
          expectedImprovement: '+10 points on Visual Design score, better UX'
        });
        recommendations.byCategory.design.push('design-dark-mode');
      }

      if (analysis.visual.details.typography && !analysis.visual.details.typography.webFonts) {
        recommendations.quickWins.push({
          id: 'design-webfonts',
          category: 'Design',
          title: 'Add Web Fonts',
          description: 'Use web fonts (Google Fonts) for better typography',
          priority: 'low',
          impact: 'medium',
          effort: 'low',
          estimatedTime: '15 minutes',
          codeExample: '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">',
          instructions: 'Add Google Fonts or other web fonts to improve typography. Link in head and use in CSS.',
          expectedImprovement: '+5-10 points on Visual Design score'
        });
        recommendations.byCategory.design.push('design-webfonts');
      }
    }

    // Content Recommendations
    if (analysis.content) {
      if (!analysis.content.details.callToAction || analysis.content.details.callToAction.ctaButtons < 2) {
        recommendations.quickWins.push({
          id: 'content-cta',
          category: 'Content',
          title: 'Add More Call-to-Action Buttons',
          description: 'Add prominent CTA buttons for contact/engagement',
          priority: 'high',
          impact: 'high',
          effort: 'low',
          estimatedTime: '30 minutes',
          codeExample: '<a href="#contact" class="cta-button">Get In Touch</a>\n<a href="/projects" class="cta-button">View My Work</a>',
          instructions: 'Add clear, prominent call-to-action buttons throughout your portfolio, especially in the hero section and after project showcases.',
          expectedImprovement: '+10-15 points on Content score, better conversion'
        });
        recommendations.byCategory.content.push('content-cta');
      }

      if (!analysis.content.details.callToAction || !analysis.content.details.callToAction.hasContactForm) {
        recommendations.mediumPriority.push({
          id: 'content-contact-form',
          category: 'Content',
          title: 'Add Contact Form',
          description: 'Add a contact form for easy inquiries',
          priority: 'high',
          impact: 'high',
          effort: 'medium',
          estimatedTime: '1-2 hours',
          codeExample: '<form action="/contact" method="POST">\n  <input type="email" name="email" placeholder="Your Email" required>\n  <textarea name="message" placeholder="Your Message" required></textarea>\n  <button type="submit">Send Message</button>\n</form>',
          instructions: 'Create a contact form with email, name, and message fields. Use a service like Formspree, Netlify Forms, or build a backend endpoint.',
          expectedImprovement: '+15 points on Content score, easier for clients to reach you'
        });
        recommendations.byCategory.content.push('content-contact-form');
      }

      if (analysis.content.details.projects && analysis.content.details.projects.links && 
          analysis.content.details.projects.links.github === 0) {
        recommendations.highPriority.push({
          id: 'content-github',
          category: 'Content',
          title: 'Link to GitHub Repositories',
          description: 'Add links to your GitHub repositories',
          priority: 'high',
          impact: 'high',
          effort: 'low',
          estimatedTime: '15 minutes',
          codeExample: '<a href="https://github.com/yourusername" target="_blank" rel="noopener">View on GitHub</a>',
          instructions: 'Add links to your GitHub profile and individual project repositories to showcase your code quality.',
          expectedImprovement: '+10-15 points on Content score, demonstrates code skills'
        });
        recommendations.byCategory.content.push('content-github');
      }

      if (analysis.content.details.writing && analysis.content.details.writing.wordCount < 200) {
        recommendations.mediumPriority.push({
          id: 'content-more-text',
          category: 'Content',
          title: 'Add More Content',
          description: `Expand content from ${analysis.content.details.writing.wordCount} to 500+ words`,
          priority: 'medium',
          impact: 'medium',
          effort: 'medium',
          estimatedTime: '2-3 hours',
          codeExample: '// Add detailed project descriptions, about section, case studies',
          instructions: 'Expand your portfolio content with detailed project descriptions, a comprehensive about section, and case studies explaining your process.',
          expectedImprovement: '+10 points on Content score, better SEO, more engaging'
        });
        recommendations.byCategory.content.push('content-more-text');
      }
    }

    // Social Media Recommendations
    if (analysis.socialMedia && analysis.socialMedia.score < 60) {
      recommendations.quickWins.push({
        id: 'social-og-tags',
        category: 'Social Media',
        title: 'Improve Social Media Sharing',
        description: 'Add complete Open Graph and Twitter Card tags',
        priority: 'medium',
        impact: 'medium',
        effort: 'low',
        estimatedTime: '20 minutes',
        codeExample: `<meta property="og:title" content="Your Name - Portfolio">
<meta property="og:description" content="Description">
<meta property="og:image" content="https://yoursite.com/image.jpg">
<meta name="twitter:card" content="summary_large_image">`,
        instructions: 'Add complete Open Graph and Twitter Card meta tags for better social media previews when your portfolio is shared.',
        expectedImprovement: '+10-15 points on Social Media score'
      });
      recommendations.byCategory.social.push('social-og-tags');
    }

    // Categorize by priority
    recommendations.quickWins.forEach(rec => {
      if (rec.priority === 'high' || rec.priority === 'critical') {
        recommendations.highPriority.push(rec);
      }
    });

    recommendations.mediumPriority.forEach(rec => {
      if (rec.priority === 'high') {
        recommendations.highPriority.push(rec);
      }
    });

    // Remove duplicates from highPriority
    recommendations.highPriority = recommendations.highPriority.filter((rec, index, self) =>
      index === self.findIndex(r => r.id === rec.id)
    );

    // Sort by priority and impact
    const sortRecommendations = (recs) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const impactOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return recs.sort((a, b) => {
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return impactOrder[a.impact] - impactOrder[b.impact];
      });
    };

    recommendations.quickWins = sortRecommendations(recommendations.quickWins);
    recommendations.longTerm = sortRecommendations(recommendations.longTerm);
    recommendations.highPriority = sortRecommendations(recommendations.highPriority);
    recommendations.mediumPriority = sortRecommendations(recommendations.mediumPriority);

    // Calculate potential score improvement
    const quickWinsPotential = recommendations.quickWins.reduce((sum, rec) => {
      const match = rec.expectedImprovement?.match(/(\d+)/);
      return sum + (match ? parseInt(match[1]) : 0);
    }, 0);

    const longTermPotential = recommendations.longTerm.reduce((sum, rec) => {
      const match = rec.expectedImprovement?.match(/(\d+)/);
      return sum + (match ? parseInt(match[1]) : 0);
    }, 0);

    return {
      ...recommendations,
      summary: {
        totalRecommendations: recommendations.quickWins.length + recommendations.longTerm.length,
        quickWinsCount: recommendations.quickWins.length,
        longTermCount: recommendations.longTerm.length,
        highPriorityCount: recommendations.highPriority.length,
        quickWinsPotentialScore: quickWinsPotential,
        longTermPotentialScore: longTermPotential,
        totalPotentialScore: quickWinsPotential + longTermPotential
      }
    };
  },

  // Generate AI portfolio suggestions
  async generatePortfolioSuggestions(analysis, industry) {
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      return {
        suggestions: [],
        error: 'OpenAI API key not found'
      };
    }

    const suggestions = [];

    // Generate suggestions based on analysis gaps
    const gaps = [];
    if (analysis.seo && analysis.seo.score < 70) gaps.push('SEO optimization');
    if (analysis.content && analysis.content.details?.callToAction?.ctaButtons < 2) gaps.push('call-to-action buttons');
    if (analysis.content && !analysis.content.details?.callToAction?.hasContactForm) gaps.push('contact form');
    if (analysis.visual && analysis.visual.score < 75) gaps.push('visual design improvements');
    if (analysis.content && analysis.content.details?.projects?.links?.github === 0) gaps.push('GitHub repository links');

    try {
      const prompt = `Based on this portfolio analysis, generate 3-5 specific, actionable suggestions for improving the portfolio. 
      
Industry: ${industry}
Current Score: ${analysis.overallScore}/100
Key Gaps: ${gaps.join(', ') || 'None identified'}

Generate suggestions in this JSON format:
[
  {
    "title": "Suggestion title",
    "description": "Detailed description",
    "category": "SEO|Design|Content|Performance|Accessibility",
    "priority": "high|medium|low",
    "impact": "high|medium|low",
    "specificAction": "Specific action to take",
    "example": "Example implementation"
  }
]

Return ONLY valid JSON array, no additional text.`;

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
          max_tokens: 1000
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const aiSuggestions = JSON.parse(jsonMatch[0]);
          suggestions.push(...aiSuggestions.map((s, i) => ({
            id: `ai-suggestion-${i}`,
            ...s,
            source: 'AI Generated'
          })));
        }
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    }

    return { suggestions };
  },

  // Get template recommendations based on industry
  getTemplateRecommendations(industry, analysis) {
    const templates = {
      'Web Developer': [
        {
          name: 'Minimal Developer Portfolio',
          description: 'Clean, code-focused design perfect for showcasing projects',
          features: ['Project showcase', 'GitHub integration', 'Tech stack display', 'Code snippets'],
          bestFor: 'Frontend/Full-stack developers',
          difficulty: 'Easy',
          score: 85
        },
        {
          name: 'Interactive Developer Portfolio',
          description: 'Modern, interactive design with animations',
          features: ['Interactive elements', 'Smooth animations', 'Dark mode', 'Responsive design'],
          bestFor: 'Creative developers',
          difficulty: 'Medium',
          score: 90
        }
      ],
      'UI/UX Designer': [
        {
          name: 'Design Portfolio Showcase',
          description: 'Visual-first design perfect for showcasing design work',
          features: ['Large image galleries', 'Case study layouts', 'Before/after comparisons', 'Design process'],
          bestFor: 'UI/UX designers',
          difficulty: 'Easy',
          score: 88
        },
        {
          name: 'Creative Designer Portfolio',
          description: 'Bold, creative design that reflects your style',
          features: ['Unique layouts', 'Custom animations', 'Portfolio grid', 'Project details'],
          bestFor: 'Creative designers',
          difficulty: 'Medium',
          score: 92
        }
      ],
      'Mobile Developer': [
        {
          name: 'Mobile-First Portfolio',
          description: 'Optimized for mobile with app showcase',
          features: ['App screenshots', 'App store links', 'Platform badges', 'Download CTAs'],
          bestFor: 'iOS/Android developers',
          difficulty: 'Easy',
          score: 87
        }
      ],
      'Data Scientist': [
        {
          name: 'Data Portfolio Template',
          description: 'Perfect for showcasing data projects and visualizations',
          features: ['Data visualization showcase', 'Project metrics', 'Technical details', 'Research papers'],
          bestFor: 'Data scientists, analysts',
          difficulty: 'Medium',
          score: 85
        }
      ],
      'General': [
        {
          name: 'Professional Portfolio',
          description: 'Versatile template suitable for any profession',
          features: ['About section', 'Projects/work', 'Contact form', 'Responsive design'],
          bestFor: 'All professionals',
          difficulty: 'Easy',
          score: 80
        }
      ]
    };

    const industryTemplates = templates[industry] || templates['General'];
    
    // Score templates based on current portfolio needs
    const scoredTemplates = industryTemplates.map(template => {
      let matchScore = template.score;
      
      // Boost score if template addresses current gaps
      if (analysis.content && !analysis.content.details?.callToAction?.hasContactForm && 
          template.features.includes('Contact form')) {
        matchScore += 5;
      }
      
      if (analysis.content && analysis.content.details?.projects?.links?.github === 0 && 
          template.features.includes('GitHub integration')) {
        matchScore += 5;
      }
      
      if (analysis.visual && analysis.visual.score < 75 && 
          template.features.includes('Responsive design')) {
        matchScore += 5;
      }

      return {
        ...template,
        matchScore: Math.min(matchScore, 100),
        recommended: matchScore >= 90
      };
    });

    return scoredTemplates.sort((a, b) => b.matchScore - a.matchScore);
  },

  // Generate content for missing sections
  async generateContentForSection(sectionType, industry, existingContent) {
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      return {
        content: null,
        error: 'OpenAI API key not found'
      };
    }

    const sectionPrompts = {
      'about': `Write a professional "About Me" section for a ${industry} portfolio. Include:
- Brief introduction
- Professional background
- Key skills and expertise
- What makes you unique
- Your passion/mission

Keep it concise (150-200 words), professional, and engaging.`,
      
      'project-description': `Write a compelling project description for a ${industry} portfolio project. Include:
- Project overview
- Technologies used
- Key features
- Challenges solved
- Results/impact

Make it engaging and highlight technical skills.`,
      
      'case-study': `Write a case study structure for a ${industry} project. Include:
- Problem/Challenge
- Solution/Approach
- Process/Methodology
- Results/Impact
- Key Learnings

Format as a structured case study with clear sections.`,
      
      'contact-cta': `Write compelling call-to-action text for a ${industry} portfolio. Include:
- Engaging headline
- Value proposition
- Clear action statement
- Professional tone

Make it compelling and action-oriented.`
    };

    let prompt = sectionPrompts[sectionType] || sectionPrompts['about'];
    
    if (existingContent) {
      prompt += `\n\nExisting content to improve:\n${existingContent}`;
    }

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
          max_tokens: 500
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        return { content: content.trim() };
      }
    } catch (error) {
      console.error('Error generating content:', error);
      return { content: null, error: error.message };
    }

    return { content: null, error: 'Failed to generate content' };
  },

  // Generate design improvement suggestions
  generateDesignSuggestions(analysis, industry) {
    const suggestions = [];

    if (analysis.visual) {
      // Color scheme suggestions
      if (analysis.visual.details.colorScheme) {
        const colorCount = analysis.visual.details.colorScheme.totalColors || 0;
        if (colorCount < 3) {
          suggestions.push({
            category: 'Color Scheme',
            issue: 'Limited color palette',
            suggestion: `Add 2-3 more colors to create visual interest. Consider using a color palette generator like Coolors.co or Adobe Color.`,
            codeExample: `/* Add to your CSS */
:root {
  --primary: #6366f1;
  --secondary: #8b5cf6;
  --accent: #ec4899;
  --neutral: #64748b;
}`,
            priority: 'medium'
          });
        } else if (colorCount > 8) {
          suggestions.push({
            category: 'Color Scheme',
            issue: 'Too many colors',
            suggestion: 'Simplify your color palette to 3-5 main colors for better consistency and professional appearance.',
            priority: 'medium'
          });
        }
      }

      // Typography suggestions
      if (analysis.visual.details.typography) {
        if (!analysis.visual.details.typography.webFonts) {
          suggestions.push({
            category: 'Typography',
            issue: 'No web fonts',
            suggestion: 'Add Google Fonts to improve typography. Popular choices: Inter, Poppins, Roboto, or Montserrat.',
            codeExample: `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">

body {
  font-family: 'Inter', sans-serif;
}`,
            priority: 'low'
          });
        }

        if (!analysis.visual.details.typography.lineHeight) {
          suggestions.push({
            category: 'Typography',
            issue: 'No line-height defined',
            suggestion: 'Add line-height (1.5-1.8) to improve readability.',
            codeExample: `body {
  line-height: 1.6;
}`,
            priority: 'low'
          });
        }
      }

      // Layout suggestions
      if (analysis.visual.details.layout) {
        if (!analysis.visual.details.layout.modernLayout?.grid && 
            !analysis.visual.details.layout.modernLayout?.flexbox) {
          suggestions.push({
            category: 'Layout',
            issue: 'No modern layout techniques',
            suggestion: 'Use CSS Grid or Flexbox for better, more flexible layouts.',
            codeExample: `/* Flexbox example */
.container {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

/* Grid example */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}`,
            priority: 'medium'
          });
        }

        if (!analysis.visual.details.layout.responsive) {
          suggestions.push({
            category: 'Layout',
            issue: 'No responsive breakpoints',
            suggestion: 'Add media queries for responsive design on mobile, tablet, and desktop.',
            codeExample: `/* Mobile first approach */
.container {
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 3rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}`,
            priority: 'high'
          });
        }
      }

      // Dark mode suggestion
      if (!analysis.visual.details.colorScheme?.darkMode) {
        suggestions.push({
          category: 'Design',
          issue: 'No dark mode support',
          suggestion: 'Add dark mode support using CSS media queries for better user experience.',
          codeExample: `@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1a1a1a;
    --text: #ffffff;
    --accent: #6366f1;
  }
  
  body {
    background: var(--bg);
    color: var(--text);
  }
}`,
          priority: 'medium'
        });
      }
    }

    // Industry-specific design suggestions
    if (industry === 'UI/UX Designer') {
      suggestions.push({
        category: 'Design',
        issue: 'Designer portfolio expectations',
        suggestion: 'Consider adding: Design process section, before/after comparisons, interactive prototypes, and design system showcase.',
        priority: 'medium'
      });
    }

    if (industry === 'Web Developer' || industry === 'Mobile Developer') {
      suggestions.push({
        category: 'Design',
        issue: 'Developer portfolio expectations',
        suggestion: 'Consider adding: Code snippets, live demos, GitHub contribution graph, and technology badges.',
        priority: 'medium'
      });
    }

    return suggestions;
  },

  // Combined portfolio builder integration
  async getPortfolioBuilderSuggestions(analysis, industry) {
    const [aiSuggestions, templates, designSuggestions] = await Promise.all([
      this.generatePortfolioSuggestions(analysis, industry).catch(() => ({ suggestions: [] })),
      Promise.resolve(this.getTemplateRecommendations(industry, analysis)),
      Promise.resolve(this.generateDesignSuggestions(analysis, industry))
    ]);

    return {
      aiSuggestions: aiSuggestions.suggestions || [],
      templates: templates,
      designSuggestions: designSuggestions,
      contentGeneration: {
        available: true,
        sections: ['about', 'project-description', 'case-study', 'contact-cta']
      }
    };
  },

  // Progress Tracking System
  // Store portfolio analysis history
  saveAnalysisHistory(url, analysis) {
    try {
      const historyKey = `portfolio_analysis_history_${btoa(url).replace(/[+/=]/g, '')}`;
      const history = this.getAnalysisHistory(url) || [];
      
      const historyEntry = {
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        overallScore: analysis.overallScore,
        scores: {
          seo: analysis.seo?.score || 0,
          accessibility: analysis.accessibility?.score || 0,
          performance: analysis.performance?.score || 0,
          security: analysis.security?.score || 0,
          socialMedia: analysis.socialMedia?.score || 0,
          visual: analysis.visual?.score || 0,
          content: analysis.content?.score || 0,
          designQuality: analysis.designQuality || 0,
          contentQuality: analysis.contentQuality || 0,
          uxScore: analysis.uxScore || 0
        },
        issuesCount: analysis.issues?.length || 0,
        strengthsCount: analysis.strengths?.length || 0,
        summary: {
          totalIssues: analysis.issues?.length || 0,
          totalStrengths: analysis.strengths?.length || 0,
          industry: analysis.competitive?.industry || 'Unknown'
        }
      };
      
      history.push(historyEntry);
      
      // Keep only last 50 analyses
      const trimmedHistory = history.slice(-50);
      
      localStorage.setItem(historyKey, JSON.stringify(trimmedHistory));
      return true;
    } catch (error) {
      console.error('Error saving analysis history:', error);
      return false;
    }
  },

  // Get portfolio analysis history
  getAnalysisHistory(url) {
    try {
      const historyKey = `portfolio_analysis_history_${btoa(url).replace(/[+/=]/g, '')}`;
      const historyData = localStorage.getItem(historyKey);
      return historyData ? JSON.parse(historyData) : [];
    } catch (error) {
      console.error('Error getting analysis history:', error);
      return [];
    }
  },

  // Compare current analysis with previous
  compareWithPrevious(currentAnalysis, url) {
    const history = this.getAnalysisHistory(url);
    if (history.length === 0) {
      return {
        hasPrevious: false,
        message: 'This is your first analysis. Future analyses will show progress!'
      };
    }

    const previous = history[history.length - 1];
    const current = {
      overallScore: currentAnalysis.overallScore,
      scores: {
        seo: currentAnalysis.seo?.score || 0,
        accessibility: currentAnalysis.accessibility?.score || 0,
        performance: currentAnalysis.performance?.score || 0,
        security: currentAnalysis.security?.score || 0,
        socialMedia: currentAnalysis.socialMedia?.score || 0,
        visual: currentAnalysis.visual?.score || 0,
        content: currentAnalysis.content?.score || 0,
        designQuality: currentAnalysis.designQuality || 0,
        contentQuality: currentAnalysis.contentQuality || 0,
        uxScore: currentAnalysis.uxScore || 0
      },
      issuesCount: currentAnalysis.issues?.length || 0,
      strengthsCount: currentAnalysis.strengths?.length || 0
    };

    const comparison = {
      hasPrevious: true,
      previousDate: previous.date,
      currentDate: new Date().toLocaleDateString(),
      daysSinceLastAnalysis: Math.floor(
        (new Date() - new Date(previous.timestamp)) / (1000 * 60 * 60 * 24)
      ),
      overallScore: {
        current: current.overallScore,
        previous: previous.overallScore,
        change: current.overallScore - previous.overallScore,
        percentageChange: previous.overallScore > 0 
          ? ((current.overallScore - previous.overallScore) / previous.overallScore * 100).toFixed(1)
          : 0,
        trend: current.overallScore > previous.overallScore ? 'improved' : 
               current.overallScore < previous.overallScore ? 'declined' : 'unchanged'
      },
      categoryChanges: {},
      issues: {
        current: current.issuesCount,
        previous: previous.issuesCount,
        change: current.issuesCount - previous.issuesCount,
        trend: current.issuesCount < previous.issuesCount ? 'improved' : 
               current.issuesCount > previous.issuesCount ? 'worsened' : 'unchanged'
      },
      strengths: {
        current: current.strengthsCount,
        previous: previous.strengthsCount,
        change: current.strengthsCount - previous.strengthsCount,
        trend: current.strengthsCount > previous.strengthsCount ? 'improved' : 
               current.strengthsCount < previous.strengthsCount ? 'declined' : 'unchanged'
      }
    };

    // Compare category scores
    Object.keys(current.scores).forEach(category => {
      const currentScore = current.scores[category];
      const previousScore = previous.scores[category] || 0;
      comparison.categoryChanges[category] = {
        current: currentScore,
        previous: previousScore,
        change: currentScore - previousScore,
        percentageChange: previousScore > 0 
          ? ((currentScore - previousScore) / previousScore * 100).toFixed(1)
          : 0,
        trend: currentScore > previousScore ? 'improved' : 
               currentScore < previousScore ? 'declined' : 'unchanged'
      };
    });

    return comparison;
  },

  // Get score trends over time
  getScoreTrends(url, days = 30) {
    const history = this.getAnalysisHistory(url);
    if (history.length === 0) {
      return {
        hasData: false,
        message: 'No historical data available'
      };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentHistory = history.filter(entry => 
      new Date(entry.timestamp) >= cutoffDate
    );

    if (recentHistory.length === 0) {
      return {
        hasData: false,
        message: `No data in the last ${days} days`
      };
    }

    const trends = {
      hasData: true,
      period: `${days} days`,
      dataPoints: recentHistory.length,
      overallScore: {
        first: recentHistory[0].overallScore,
        last: recentHistory[recentHistory.length - 1].overallScore,
        average: Math.round(recentHistory.reduce((sum, h) => sum + h.overallScore, 0) / recentHistory.length),
        highest: Math.max(...recentHistory.map(h => h.overallScore)),
        lowest: Math.min(...recentHistory.map(h => h.overallScore)),
        trend: recentHistory[recentHistory.length - 1].overallScore > recentHistory[0].overallScore ? 'improving' : 
               recentHistory[recentHistory.length - 1].overallScore < recentHistory[0].overallScore ? 'declining' : 'stable',
        change: recentHistory[recentHistory.length - 1].overallScore - recentHistory[0].overallScore
      },
      categoryTrends: {},
      timeline: recentHistory.map(h => ({
        date: h.date,
        timestamp: h.timestamp,
        overallScore: h.overallScore,
        scores: h.scores
      }))
    };

    // Calculate trends for each category
    const categories = ['seo', 'accessibility', 'performance', 'security', 'socialMedia', 'visual', 'content'];
    categories.forEach(category => {
      const categoryScores = recentHistory.map(h => h.scores[category] || 0);
      trends.categoryTrends[category] = {
        first: categoryScores[0],
        last: categoryScores[categoryScores.length - 1],
        average: Math.round(categoryScores.reduce((sum, s) => sum + s, 0) / categoryScores.length),
        highest: Math.max(...categoryScores),
        lowest: Math.min(...categoryScores),
        trend: categoryScores[categoryScores.length - 1] > categoryScores[0] ? 'improving' : 
               categoryScores[categoryScores.length - 1] < categoryScores[0] ? 'declining' : 'stable',
        change: categoryScores[categoryScores.length - 1] - categoryScores[0]
      };
    });

    return trends;
  },

  // Goal setting and tracking
  setPortfolioGoal(url, goal) {
    try {
      const goalKey = `portfolio_goal_${btoa(url).replace(/[+/=]/g, '')}`;
      const goalData = {
        ...goal,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(goalKey, JSON.stringify(goalData));
      return true;
    } catch (error) {
      console.error('Error setting portfolio goal:', error);
      return false;
    }
  },

  getPortfolioGoal(url) {
    try {
      const goalKey = `portfolio_goal_${btoa(url).replace(/[+/=]/g, '')}`;
      const goalData = localStorage.getItem(goalKey);
      return goalData ? JSON.parse(goalData) : null;
    } catch (error) {
      console.error('Error getting portfolio goal:', error);
      return null;
    }
  },

  checkGoalProgress(currentAnalysis, url) {
    const goal = this.getPortfolioGoal(url);
    if (!goal) {
      return {
        hasGoal: false,
        message: 'No goal set for this portfolio'
      };
    }

    const currentScore = currentAnalysis.overallScore;
    const targetScore = goal.targetScore || 100;
    const progress = Math.min((currentScore / targetScore) * 100, 100);
    const remaining = Math.max(targetScore - currentScore, 0);
    const isAchieved = currentScore >= targetScore;

    // Check category goals
    const categoryProgress = {};
    if (goal.categoryGoals) {
      Object.keys(goal.categoryGoals).forEach(category => {
        const target = goal.categoryGoals[category];
        const current = currentAnalysis[category]?.score || 0;
        categoryProgress[category] = {
          current,
          target,
          progress: Math.min((current / target) * 100, 100),
          remaining: Math.max(target - current, 0),
          isAchieved: current >= target
        };
      });
    }

    return {
      hasGoal: true,
      goal: {
        targetScore,
        targetDate: goal.targetDate,
        description: goal.description
      },
      progress: {
        current: currentScore,
        target: targetScore,
        progress: Math.round(progress),
        remaining,
        isAchieved,
        percentageComplete: Math.round(progress)
      },
      categoryProgress,
      estimatedCompletion: remaining > 0 && goal.targetDate 
        ? this.estimateCompletionDate(currentScore, targetScore, goal.targetDate, url)
        : null
    };
  },

  estimateCompletionDate(currentScore, targetScore, targetDate, url) {
    const history = this.getAnalysisHistory(url);
    if (history.length < 2) {
      return null;
    }

    // Calculate average improvement rate
    const recentHistory = history.slice(-5); // Last 5 analyses
    let totalImprovement = 0;
    let totalDays = 0;

    for (let i = 1; i < recentHistory.length; i++) {
      const daysDiff = (new Date(recentHistory[i].timestamp) - new Date(recentHistory[i - 1].timestamp)) / (1000 * 60 * 60 * 24);
      const scoreDiff = recentHistory[i].overallScore - recentHistory[i - 1].overallScore;
      if (daysDiff > 0 && scoreDiff > 0) {
        totalImprovement += scoreDiff / daysDiff; // Points per day
        totalDays += daysDiff;
      }
    }

    if (totalDays === 0 || totalImprovement <= 0) {
      return null;
    }

    const avgImprovementPerDay = totalImprovement / (recentHistory.length - 1);
    const remainingPoints = targetScore - currentScore;
    const estimatedDays = remainingPoints / avgImprovementPerDay;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);

    return {
      estimatedDate: estimatedDate.toISOString(),
      estimatedDays: Math.ceil(estimatedDays),
      onTrack: targetDate ? estimatedDate <= new Date(targetDate) : null,
      improvementRate: avgImprovementPerDay.toFixed(2)
    };
  },

  // Get progress summary
  getProgressSummary(url, currentAnalysis) {
    const history = this.getAnalysisHistory(url);
    const comparison = this.compareWithPrevious(currentAnalysis, url);
    const trends = this.getScoreTrends(url, 30);
    const goalProgress = this.checkGoalProgress(currentAnalysis, url);

    return {
      history: {
        totalAnalyses: history.length,
        firstAnalysis: history.length > 0 ? history[0].date : null,
        lastAnalysis: history.length > 0 ? history[history.length - 1].date : null
      },
      comparison,
      trends,
      goalProgress,
      milestones: this.getMilestones(history, currentAnalysis.overallScore)
    };
  },

  // Get achievement milestones
  getMilestones(history, currentScore) {
    const milestones = [];
    
    if (history.length >= 1) {
      milestones.push({
        type: 'first_analysis',
        achieved: true,
        date: history[0].date,
        description: 'First portfolio analysis completed'
      });
    }

    if (history.length >= 5) {
      milestones.push({
        type: 'five_analyses',
        achieved: true,
        date: history[4].date,
        description: 'Completed 5 portfolio analyses'
      });
    }

    if (history.length >= 10) {
      milestones.push({
        type: 'ten_analyses',
        achieved: true,
        date: history[9].date,
        description: 'Completed 10 portfolio analyses'
      });
    }

    if (currentScore >= 70) {
      milestones.push({
        type: 'score_70',
        achieved: true,
        description: 'Achieved 70+ overall score'
      });
    }

    if (currentScore >= 80) {
      milestones.push({
        type: 'score_80',
        achieved: true,
        description: 'Achieved 80+ overall score'
      });
    }

    if (currentScore >= 90) {
      milestones.push({
        type: 'score_90',
        achieved: true,
        description: 'Achieved 90+ overall score - Excellent!'
      });
    }

    // Check for improvement milestones
    if (history.length >= 2) {
      const firstScore = history[0].overallScore;
      const improvement = currentScore - firstScore;
      
      if (improvement >= 10) {
        milestones.push({
          type: 'improvement_10',
          achieved: true,
          description: `Improved by ${improvement} points since first analysis`
        });
      }

      if (improvement >= 20) {
        milestones.push({
          type: 'improvement_20',
          achieved: true,
          description: `Improved by ${improvement} points - Great progress!`
        });
      }
    }

    return milestones;
  },

  // Analyze navigation structure
  analyzeNavigationStructure(doc, url) {
    const navigation = {
      score: 0,
      issues: [],
      strengths: [],
      details: {}
    };

    // Find navigation elements
    const navElements = doc.querySelectorAll('nav, [role="navigation"], header nav, .navbar, .navigation, [class*="nav"]');
    const hasNav = navElements.length > 0;

    if (hasNav) {
      navigation.score += 20;
      navigation.strengths.push(`Navigation structure found (${navElements.length} nav element(s))`);
      navigation.details.navElements = navElements.length;
    } else {
      navigation.issues.push('No navigation element found');
    }

    // Find all links
    const allLinks = doc.querySelectorAll('a[href]');
    const internalLinks = [];
    const externalLinks = [];
    const anchorLinks = [];
    const commonPages = {
      about: false,
      projects: false,
      portfolio: false,
      contact: false,
      blog: false,
      resume: false,
      services: false
    };

    const baseUrl = new URL(url);
    const baseDomain = baseUrl.hostname;

    allLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      const linkText = (link.textContent || '').toLowerCase().trim();

      // Check for common page links
      if (linkText.includes('about') || href.toLowerCase().includes('/about')) commonPages.about = true;
      if (linkText.includes('project') || href.toLowerCase().includes('/project')) commonPages.projects = true;
      if (linkText.includes('portfolio') || href.toLowerCase().includes('/portfolio')) commonPages.portfolio = true;
      if (linkText.includes('contact') || href.toLowerCase().includes('/contact')) commonPages.contact = true;
      if (linkText.includes('blog') || href.toLowerCase().includes('/blog')) commonPages.blog = true;
      if (linkText.includes('resume') || href.toLowerCase().includes('/resume')) commonPages.resume = true;
      if (linkText.includes('service') || href.toLowerCase().includes('/service')) commonPages.services = true;

      if (href.startsWith('#')) {
        anchorLinks.push(href);
      } else if (href.startsWith('http')) {
        try {
          const linkUrl = new URL(href);
          if (linkUrl.hostname === baseDomain || linkUrl.hostname === `www.${baseDomain}` || baseDomain === `www.${linkUrl.hostname}`) {
            internalLinks.push(href);
          } else {
            externalLinks.push(href);
          }
        } catch {
          // Invalid URL, skip
        }
      } else if (href.startsWith('/') || !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        internalLinks.push(href);
      }
    });

    navigation.details.links = {
      total: allLinks.length,
      internal: internalLinks.length,
      external: externalLinks.length,
      anchor: anchorLinks.length
    };

    // Evaluate navigation quality
    if (internalLinks.length >= 3) {
      navigation.score += 15;
      navigation.strengths.push(`Good internal linking (${internalLinks.length} internal links)`);
    } else if (internalLinks.length > 0) {
      navigation.score += 10;
      navigation.issues.push(`Limited internal links (${internalLinks.length}) - consider adding more pages`);
    } else {
      navigation.issues.push('No internal links found - single page portfolio?');
    }

    // Check for common portfolio pages
    const foundPages = Object.values(commonPages).filter(v => v === true).length;
    if (foundPages >= 4) {
      navigation.score += 20;
      navigation.strengths.push(`Comprehensive site structure (${foundPages} common pages found)`);
    } else if (foundPages >= 2) {
      navigation.score += 10;
      navigation.strengths.push(`Basic site structure (${foundPages} pages found)`);
    } else {
      navigation.issues.push('Limited page structure - consider adding About, Projects, Contact pages');
    }

    navigation.details.commonPages = commonPages;
    navigation.details.foundPages = foundPages;

    // Check for sitemap
    const sitemapLink = doc.querySelector('link[rel="sitemap"], a[href*="sitemap"]');
    if (sitemapLink) {
      navigation.score += 5;
      navigation.strengths.push('Sitemap found');
      navigation.details.hasSitemap = true;
    } else {
      navigation.issues.push('No sitemap found - consider adding one for SEO');
      navigation.details.hasSitemap = false;
    }

    // Check for breadcrumbs
    const breadcrumbs = doc.querySelector('[class*="breadcrumb"], nav[aria-label*="breadcrumb"], [role="navigation"][aria-label*="breadcrumb"]');
    if (breadcrumbs) {
      navigation.score += 5;
      navigation.strengths.push('Breadcrumb navigation found');
      navigation.details.hasBreadcrumbs = true;
    } else {
      navigation.details.hasBreadcrumbs = false;
    }

    // Check for mobile menu
    const mobileMenu = doc.querySelector('[class*="mobile"], [class*="hamburger"], [class*="menu-toggle"], button[aria-label*="menu"]');
    if (mobileMenu) {
      navigation.score += 5;
      navigation.strengths.push('Mobile menu detected');
      navigation.details.hasMobileMenu = true;
    } else {
      navigation.details.hasMobileMenu = false;
    }

    navigation.score = Math.min(navigation.score, 100);
    return navigation;
  },

  // Discover internal pages
  discoverInternalPages(doc, baseUrl) {
    const pages = {
      discovered: [],
      commonPages: {},
      recommendations: []
    };

    const allLinks = doc.querySelectorAll('a[href]');
    const baseDomain = new URL(baseUrl).hostname;
    const uniquePages = new Set();

    allLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      let pageUrl = null;

      if (href.startsWith('http')) {
        try {
          const linkUrl = new URL(href);
          if (linkUrl.hostname === baseDomain || linkUrl.hostname === `www.${baseDomain}`) {
            pageUrl = href;
          }
        } catch {
          // Invalid URL
        }
      } else if (href.startsWith('/')) {
        try {
          pageUrl = new URL(href, baseUrl).href;
        } catch {
          // Invalid URL
        }
      } else if (!href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        try {
          pageUrl = new URL(href, baseUrl).href;
        } catch {
          // Invalid URL
        }
      }

      if (pageUrl && !uniquePages.has(pageUrl)) {
        uniquePages.add(pageUrl);
        const urlPath = new URL(pageUrl).pathname.toLowerCase();
        
        pages.discovered.push({
          url: pageUrl,
          path: urlPath,
          linkText: (link.textContent || '').trim()
        });

        // Categorize common pages
        if (urlPath.includes('/about') || urlPath === '/about') {
          pages.commonPages.about = pageUrl;
        }
        if (urlPath.includes('/project') || urlPath.includes('/portfolio') || urlPath.includes('/work')) {
          pages.commonPages.projects = pageUrl;
        }
        if (urlPath.includes('/contact')) {
          pages.commonPages.contact = pageUrl;
        }
        if (urlPath.includes('/blog') || urlPath.includes('/articles')) {
          pages.commonPages.blog = pageUrl;
        }
        if (urlPath.includes('/resume') || urlPath.includes('/cv')) {
          pages.commonPages.resume = pageUrl;
        }
      }
    });

    // Generate recommendations for missing common pages
    if (!pages.commonPages.about) {
      pages.recommendations.push({
        page: 'About',
        description: 'Add an About page to tell your story and background',
        priority: 'high'
      });
    }

    if (!pages.commonPages.projects && !pages.commonPages.portfolio) {
      pages.recommendations.push({
        page: 'Projects/Portfolio',
        description: 'Add a Projects or Portfolio page to showcase your work',
        priority: 'high'
      });
    }

    if (!pages.commonPages.contact) {
      pages.recommendations.push({
        page: 'Contact',
        description: 'Add a Contact page for easy communication',
        priority: 'high'
      });
    }

    pages.totalPages = pages.discovered.length;
    return pages;
  },

  // Analyze site architecture
  analyzeSiteArchitecture(doc, url, discoveredPages) {
    const architecture = {
      score: 0,
      issues: [],
      strengths: [],
      details: {}
    };

    // Check page structure
    const hasHeader = doc.querySelector('header, [role="banner"]') !== null;
    const hasMain = doc.querySelector('main, [role="main"]') !== null;
    const hasFooter = doc.querySelector('footer, [role="contentinfo"]') !== null;

    let structureScore = 0;
    if (hasHeader) {
      structureScore += 10;
      architecture.strengths.push('Header section present');
    } else {
      architecture.issues.push('No header section found');
    }

    if (hasMain) {
      structureScore += 10;
      architecture.strengths.push('Main content area present');
    } else {
      architecture.issues.push('No main content area found');
    }

    if (hasFooter) {
      structureScore += 10;
      architecture.strengths.push('Footer section present');
    } else {
      architecture.issues.push('No footer section found');
    }

    architecture.score += structureScore;
    architecture.details.structure = {
      hasHeader,
      hasMain,
      hasFooter
    };

    // Check for consistent navigation
    const navElements = doc.querySelectorAll('nav, [role="navigation"]');
    if (navElements.length > 0) {
      architecture.score += 10;
      architecture.strengths.push('Navigation structure present');
    }

    // Evaluate page count
    const pageCount = discoveredPages.totalPages || 1;
    if (pageCount >= 5) {
      architecture.score += 15;
      architecture.strengths.push(`Comprehensive site structure (${pageCount} pages)`);
    } else if (pageCount >= 3) {
      architecture.score += 10;
      architecture.strengths.push(`Good site structure (${pageCount} pages)`);
    } else if (pageCount === 1) {
      architecture.issues.push('Single page portfolio - consider adding more pages for better organization');
    }

    architecture.details.pageCount = pageCount;

    // Check for consistent URL structure
    const urls = discoveredPages.discovered.map(p => p.path);
    const urlPatterns = {
      hasSlash: urls.filter(u => u.startsWith('/')).length,
      hasExtension: urls.filter(u => u.match(/\.[a-z]{2,4}$/)).length,
      hasTrailingSlash: urls.filter(u => u.endsWith('/')).length
    };

    const consistentStructure = urlPatterns.hasSlash === urls.length || 
                                urlPatterns.hasExtension === urls.length ||
                                urlPatterns.hasTrailingSlash === urls.length;

    if (consistentStructure && urls.length > 1) {
      architecture.score += 10;
      architecture.strengths.push('Consistent URL structure');
      architecture.details.urlStructure = 'consistent';
    } else if (urls.length > 1) {
      architecture.issues.push('Inconsistent URL structure - consider standardizing');
      architecture.details.urlStructure = 'inconsistent';
    }

    // Check for 404 page (can't really detect, but can recommend)
    architecture.details.has404Page = 'unknown';
    architecture.recommendations = [
      'Ensure all internal links work (no 404 errors)',
      'Create a custom 404 page for better UX',
      'Use consistent navigation across all pages',
      'Implement breadcrumbs for multi-page sites'
    ];

    architecture.score = Math.min(architecture.score, 100);
    return architecture;
  },

  // Attempt to analyze additional pages
  async analyzeAdditionalPages(baseUrl, discoveredPages) {
    const additionalAnalyses = [];
    const pagesToAnalyze = [
      discoveredPages.commonPages.about,
      discoveredPages.commonPages.projects,
      discoveredPages.commonPages.contact
    ].filter(Boolean).slice(0, 3); // Limit to 3 pages to avoid too many requests

    for (const pageUrl of pagesToAnalyze) {
      try {
        const response = await fetch(pageUrl, {
          method: 'GET',
          mode: 'cors',
          headers: { 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
        });

        if (response.ok) {
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          
          const title = doc.querySelector('title')?.textContent?.trim() || null;
          const hasContent = (doc.body?.textContent || '').trim().length > 100;
          const hasImages = doc.querySelectorAll('img').length > 0;
          const hasHeadings = doc.querySelectorAll('h1, h2, h3').length > 0;

          additionalAnalyses.push({
            url: pageUrl,
            accessible: true,
            title,
            hasContent,
            hasImages,
            hasHeadings,
            quality: (title ? 25 : 0) + (hasContent ? 40 : 0) + (hasImages ? 15 : 0) + (hasHeadings ? 20 : 0)
          });
        }
      } catch (error) {
        // Page not accessible (CORS or other error)
        additionalAnalyses.push({
          url: pageUrl,
          accessible: false,
          error: error.message
        });
      }
    }

    return additionalAnalyses;
  },

  // Combined multi-page analysis
  async performMultiPageAnalysis(doc, url, html) {
    const navigation = this.analyzeNavigationStructure(doc, url);
    const discoveredPages = this.discoverInternalPages(doc, url);
    const architecture = this.analyzeSiteArchitecture(doc, url, discoveredPages);
    
    // Attempt to analyze additional pages (may fail due to CORS)
    const additionalPages = await this.analyzeAdditionalPages(url, discoveredPages).catch(() => []);

    // Calculate overall multi-page score
    const multiPageScore = Math.round(
      navigation.score * 0.4 +
      architecture.score * 0.4 +
      (discoveredPages.totalPages >= 3 ? 20 : discoveredPages.totalPages * 7)
    );

    return {
      score: Math.min(multiPageScore, 100),
      navigation,
      discoveredPages,
      architecture,
      additionalPages,
      summary: {
        totalPages: discoveredPages.totalPages,
        analyzedPages: 1 + additionalPages.filter(p => p.accessible).length,
        commonPagesFound: Object.keys(discoveredPages.commonPages).length,
        navigationQuality: navigation.score,
        architectureQuality: architecture.score
      }
    };
  },

  // Get field-specific recommendations
  getFieldSpecificRecommendations(industry, analysis) {
    const recommendations = {
      mustHave: [],
      shouldHave: [],
      niceToHave: [],
      industrySpecific: []
    };

    switch (industry) {
      case 'Web Developer':
        recommendations.mustHave = [
          'Live project demos or deployed applications',
          'GitHub repository links with clean, documented code',
          'Technology stack clearly displayed for each project',
          'Responsive design demonstration'
        ];
        recommendations.shouldHave = [
          'Code snippets or technical explanations',
          'Performance metrics (load times, optimization)',
          'API integrations or backend work examples',
          'Testing and quality assurance practices'
        ];
        recommendations.niceToHave = [
          'Open source contributions',
          'Technical blog posts or articles',
          'Contributions to developer communities',
          'Certifications or courses completed'
        ];
        recommendations.industrySpecific = [
          'Show understanding of modern frameworks (React, Vue, Angular)',
          'Demonstrate knowledge of version control (Git)',
          'Include both frontend and backend projects if full-stack',
          'Show responsive design across different devices'
        ];
        break;

      case 'UI/UX Designer':
        recommendations.mustHave = [
          'High-quality design portfolio with case studies',
          'Design process documentation (research, wireframes, iterations)',
          'Before/after design comparisons',
          'User-centered design approach demonstration'
        ];
        recommendations.shouldHave = [
          'Interactive prototypes or design mockups',
          'User research and testing results',
          'Design system or style guide',
          'Accessibility considerations in designs'
        ];
        recommendations.niceToHave = [
          'Design tools proficiency (Figma, Sketch, Adobe XD)',
          'Animation or micro-interaction examples',
          'Brand identity work',
          'Design thinking methodology'
        ];
        recommendations.industrySpecific = [
          'Portfolio itself should demonstrate excellent design',
          'Show understanding of user psychology and behavior',
          'Include mobile and desktop design examples',
          'Demonstrate collaboration with developers'
        ];
        break;

      case 'Mobile Developer':
        recommendations.mustHave = [
          'App Store or Play Store links to published apps',
          'Screenshots and app demos',
          'Platform-specific projects (iOS, Android, or both)',
          'Performance and optimization metrics'
        ];
        recommendations.shouldHave = [
          'Native vs. cross-platform framework experience',
          'Push notifications and backend integration',
          'App analytics and user metrics',
          'Mobile-specific design considerations'
        ];
        recommendations.niceToHave = [
          'App store optimization (ASO) knowledge',
          'In-app purchase or monetization examples',
          'Offline functionality demonstrations',
          'Mobile security best practices'
        ];
        recommendations.industrySpecific = [
          'Show both iOS and Android projects if applicable',
          'Demonstrate understanding of platform guidelines',
          'Include app performance metrics',
          'Show responsive design for different screen sizes'
        ];
        break;

      case 'Data Scientist':
        recommendations.mustHave = [
          'Data visualization examples and dashboards',
          'Quantifiable results and metrics',
          'Technical methodology explanations',
          'Project outcomes with measurable impact'
        ];
        recommendations.shouldHave = [
          'Jupyter notebooks or code examples',
          'Machine learning model demonstrations',
          'Statistical analysis examples',
          'Data cleaning and preprocessing work'
        ];
        recommendations.niceToHave = [
          'Research papers or publications',
          'Kaggle competitions or achievements',
          'Data storytelling examples',
          'Big data technologies experience'
        ];
        recommendations.industrySpecific = [
          'Show data-driven decision making',
          'Include metrics and KPIs in case studies',
          'Demonstrate statistical and analytical skills',
          'Show ability to communicate insights clearly'
        ];
        break;

      case 'DevOps Engineer':
        recommendations.mustHave = [
          'CI/CD pipeline examples',
          'Infrastructure as Code (IaC) demonstrations',
          'Cloud platform experience (AWS, Azure, GCP)',
          'Containerization and orchestration examples'
        ];
        recommendations.shouldHave = [
          'Monitoring and logging solutions',
          'Security and compliance implementations',
          'Automation scripts and tools',
          'Performance optimization examples'
        ];
        recommendations.niceToHave = [
          'Open source contributions to DevOps tools',
          'Certifications (AWS, Kubernetes, etc.)',
          'Infrastructure diagrams and documentation',
          'Disaster recovery and backup strategies'
        ];
        recommendations.industrySpecific = [
          'Show understanding of scalable infrastructure',
          'Demonstrate automation and efficiency improvements',
          'Include metrics on uptime, performance, cost savings',
          'Show collaboration with development teams'
        ];
        break;

      default:
        recommendations.mustHave = [
          'Clear value proposition',
          'Professional presentation',
          'Contact information',
          'Relevant work examples'
        ];
    }

    return recommendations;
  },

  // Analyze role-specific requirements
  analyzeRoleSpecificRequirements(industry, analysis) {
    const requirements = {
      met: [],
      missing: [],
      score: 0,
      details: {}
    };

    const roleRequirements = {
      'Web Developer': {
        'Live Demos': analysis.content?.details?.projects?.links?.live > 0,
        'GitHub Links': analysis.content?.details?.projects?.links?.github > 0,
        'Tech Stack': analysis.content?.details?.projects?.technologies?.length >= 5,
        'Responsive Design': analysis.visual?.details?.layout?.responsive === true,
        'Performance': analysis.performance?.score >= 70
      },
      'UI/UX Designer': {
        'Case Studies': analysis.content?.details?.caseStudy?.structure?.completeness === 'complete',
        'Visual Quality': analysis.visual?.score >= 80,
        'Design Process': analysis.content?.details?.caseStudy?.hasBeforeAfter === true,
        'Portfolio Design': analysis.designQuality >= 75,
        'Accessibility': analysis.accessibility?.score >= 70
      },
      'Mobile Developer': {
        'App Links': false, // Would need to check for app store links
        'Platform Coverage': false, // Would need to detect iOS/Android
        'Performance Metrics': analysis.content?.details?.caseStudy?.metrics?.length >= 2,
        'Mobile Responsive': analysis.mobileResponsive === true,
        'Performance': analysis.performance?.score >= 70
      },
      'Data Scientist': {
        'Data Visualizations': analysis.visual?.details?.images?.total > 0,
        'Quantifiable Results': analysis.content?.details?.caseStudy?.metrics?.length >= 3,
        'Technical Depth': analysis.content?.details?.writing?.wordCount >= 500,
        'Methodology': analysis.content?.details?.caseStudy?.structure?.hasSolution === true,
        'Impact Metrics': analysis.content?.details?.caseStudy?.structure?.hasImpact === true
      },
      'DevOps Engineer': {
        'CI/CD Examples': false, // Would need content analysis
        'Cloud Experience': false, // Would need keyword detection
        'Automation': false, // Would need content analysis
        'Documentation': analysis.content?.details?.writing?.wordCount >= 300,
        'Security': analysis.security?.score >= 70
      }
    };

    const industryRequirements = roleRequirements[industry] || roleRequirements['Web Developer'];
    let metCount = 0;
    const totalRequirements = Object.keys(industryRequirements).length;

    Object.entries(industryRequirements).forEach(([requirement, met]) => {
      if (met) {
        requirements.met.push(requirement);
        metCount++;
      } else {
        requirements.missing.push(requirement);
      }
    });

    requirements.score = Math.round((metCount / totalRequirements) * 100);
    requirements.details = {
      metCount,
      totalRequirements,
      requirements: industryRequirements
    };

    return requirements;
  },

  // Analyze ATS-friendly optimization
  analyzeATSOptimization(doc, bodyText, analysis) {
    const ats = {
      score: 0,
      issues: [],
      strengths: [],
      details: {}
    };

    // Check for keyword optimization
    const commonKeywords = [
      'skills', 'experience', 'education', 'certification', 'project',
      'achievement', 'technology', 'proficiency', 'expertise', 'qualification'
    ];
    const keywordsFound = commonKeywords.filter(keyword => 
      bodyText.toLowerCase().includes(keyword.toLowerCase())
    ).length;

    if (keywordsFound >= 7) {
      ats.score += 15;
      ats.strengths.push(`Good keyword usage (${keywordsFound}/10 common keywords)`);
    } else if (keywordsFound >= 4) {
      ats.score += 10;
      ats.issues.push(`Limited keyword usage (${keywordsFound}/10) - consider adding more relevant terms`);
    } else {
      ats.issues.push('Very limited keyword usage - may affect ATS parsing');
    }

    ats.details.keywordsFound = keywordsFound;
    ats.details.totalKeywords = commonKeywords.length;

    // Check for structured content
    const hasHeadings = doc.querySelectorAll('h1, h2, h3').length >= 3;
    const hasLists = doc.querySelectorAll('ul, ol').length > 0;
    const hasSections = doc.querySelectorAll('section, article').length > 0;

    if (hasHeadings && hasLists && hasSections) {
      ats.score += 20;
      ats.strengths.push('Well-structured content (headings, lists, sections)');
    } else {
      if (!hasHeadings) ats.issues.push('Limited heading structure - use H1, H2, H3 for better organization');
      if (!hasLists) ats.issues.push('No lists found - use bullet points for skills/achievements');
      if (!hasSections) ats.issues.push('No semantic sections - use <section> or <article> tags');
    }

    ats.details.structure = {
      hasHeadings,
      hasLists,
      hasSections
    };

    // Check for skills section
    const hasSkillsSection = bodyText.toLowerCase().includes('skill') || 
                            doc.querySelector('[id*="skill"], [class*="skill"]') !== null;
    if (hasSkillsSection) {
      ats.score += 15;
      ats.strengths.push('Skills section found');
    } else {
      ats.issues.push('No skills section found - important for ATS parsing');
    }

    ats.details.hasSkillsSection = hasSkillsSection;

    // Check for experience/work history
    const hasExperience = bodyText.toLowerCase().includes('experience') || 
                         bodyText.toLowerCase().includes('work') ||
                         bodyText.toLowerCase().includes('employment');
    if (hasExperience) {
      ats.score += 15;
      ats.strengths.push('Experience/work history section found');
    } else {
      ats.issues.push('No experience section found - important for recruiters');
    }

    ats.details.hasExperience = hasExperience;

    // Check for education section
    const hasEducation = bodyText.toLowerCase().includes('education') || 
                        bodyText.toLowerCase().includes('degree') ||
                        bodyText.toLowerCase().includes('university');
    if (hasEducation) {
      ats.score += 10;
      ats.strengths.push('Education section found');
    } else {
      ats.issues.push('No education section found');
    }

    ats.details.hasEducation = hasEducation;

    // Check for contact information
    const hasContact = analysis.hasContactInfo || 
                      doc.querySelector('a[href^="mailto:"]') !== null ||
                      /[\w.-]+@[\w.-]+\.\w+/.test(bodyText);
    if (hasContact) {
      ats.score += 10;
      ats.strengths.push('Contact information present');
    } else {
      ats.issues.push('No contact information found');
    }

    ats.details.hasContact = hasContact;

    // Check for dates (important for ATS)
    const hasDates = /\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}|(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i.test(bodyText);
    if (hasDates) {
      ats.score += 10;
      ats.strengths.push('Dates found in content (important for timeline)');
    } else {
      ats.issues.push('No dates found - consider adding dates to experience/education');
    }

    ats.details.hasDates = hasDates;

    // Check for certifications
    const hasCertifications = bodyText.toLowerCase().includes('certification') || 
                             bodyText.toLowerCase().includes('certificate') ||
                             bodyText.toLowerCase().includes('certified');
    if (hasCertifications) {
      ats.score += 5;
      ats.strengths.push('Certifications mentioned');
    }

    ats.details.hasCertifications = hasCertifications;

    ats.score = Math.min(ats.score, 100);
    return ats;
  },

  // Analyze from recruiter perspective
  analyzeRecruiterPerspective(analysis, industry) {
    const recruiter = {
      score: 0,
      issues: [],
      strengths: [],
      details: {},
      timeToEvaluate: 0 // Estimated seconds
    };

    // First impression (load time, visual appeal)
    const loadTime = analysis.performance?.loadTime || 0;
    if (loadTime < 2000) {
      recruiter.score += 15;
      recruiter.strengths.push('Fast loading time - good first impression');
      recruiter.timeToEvaluate += 5;
    } else if (loadTime < 5000) {
      recruiter.score += 10;
      recruiter.timeToEvaluate += 10;
    } else {
      recruiter.issues.push('Slow loading time - may lose recruiter attention');
      recruiter.timeToEvaluate += 20;
    }

    recruiter.details.loadTime = loadTime;

    // Clarity and organization
    const hasClearStructure = analysis.visual?.details?.layout?.semanticElements >= 3;
    const hasNavigation = analysis.multiPage?.navigation?.score >= 60;
    const hasHeadings = analysis.content?.details?.writing?.wordCount > 0;

    if (hasClearStructure && hasNavigation) {
      recruiter.score += 20;
      recruiter.strengths.push('Clear site structure - easy to navigate');
      recruiter.timeToEvaluate += 10;
    } else {
      recruiter.issues.push('Unclear structure - may confuse recruiters');
      recruiter.timeToEvaluate += 30;
    }

    // Key information visibility
    const hasAbout = analysis.hasAboutSection || analysis.multiPage?.discoveredPages?.commonPages?.about;
    const hasProjects = analysis.hasProjects || analysis.multiPage?.discoveredPages?.commonPages?.projects;
    const hasContact = analysis.hasContactInfo || analysis.multiPage?.discoveredPages?.commonPages?.contact;

    let keyInfoScore = 0;
    if (hasAbout) {
      keyInfoScore += 10;
      recruiter.strengths.push('About section easily accessible');
    } else {
      recruiter.issues.push('About section not easily found');
    }

    if (hasProjects) {
      keyInfoScore += 15;
      recruiter.strengths.push('Projects/work easily accessible');
    } else {
      recruiter.issues.push('Projects/work not easily found - critical for recruiters');
    }

    if (hasContact) {
      keyInfoScore += 10;
      recruiter.strengths.push('Contact information easily accessible');
    } else {
      recruiter.issues.push('Contact information not easily found');
    }

    recruiter.score += keyInfoScore;
    recruiter.details.keyInformation = {
      hasAbout,
      hasProjects,
      hasContact
    };

    // Professional presentation
    const designQuality = analysis.designQuality || 0;
    if (designQuality >= 80) {
      recruiter.score += 15;
      recruiter.strengths.push('Professional design quality');
      recruiter.timeToEvaluate += 5;
    } else if (designQuality >= 60) {
      recruiter.score += 10;
      recruiter.timeToEvaluate += 10;
    } else {
      recruiter.issues.push('Design quality could be improved for professional impression');
      recruiter.timeToEvaluate += 15;
    }

    // Content quality
    const contentQuality = analysis.contentQuality || 0;
    if (contentQuality >= 75) {
      recruiter.score += 15;
      recruiter.strengths.push('High-quality, engaging content');
      recruiter.timeToEvaluate += 20;
    } else if (contentQuality >= 50) {
      recruiter.score += 10;
      recruiter.timeToEvaluate += 15;
    } else {
      recruiter.issues.push('Content quality could be improved');
      recruiter.timeToEvaluate += 10;
    }

    // Mobile accessibility (recruiters often browse on mobile)
    if (analysis.mobileResponsive) {
      recruiter.score += 10;
      recruiter.strengths.push('Mobile responsive - accessible on all devices');
    } else {
      recruiter.issues.push('Not mobile responsive - may lose mobile recruiters');
    }

    // Call-to-action clarity
    const hasCTAs = analysis.content?.details?.callToAction?.ctaButtons >= 2;
    if (hasCTAs) {
      recruiter.score += 10;
      recruiter.strengths.push('Clear call-to-action buttons');
    } else {
      recruiter.issues.push('Limited call-to-action - make it easy for recruiters to contact you');
    }

    // Industry-specific recruiter expectations
    if (industry === 'Web Developer' || industry === 'Mobile Developer') {
      const hasCodeLinks = analysis.content?.details?.projects?.links?.github > 0;
      if (hasCodeLinks) {
        recruiter.score += 5;
        recruiter.strengths.push('Code repositories accessible - shows technical skills');
      } else {
        recruiter.issues.push('No code repositories linked - important for developer roles');
      }
    }

    if (industry === 'UI/UX Designer') {
      const hasCaseStudies = analysis.content?.details?.caseStudy?.structure?.completeness === 'complete';
      if (hasCaseStudies) {
        recruiter.score += 5;
        recruiter.strengths.push('Case studies present - shows design thinking');
      } else {
        recruiter.issues.push('No case studies - important for design roles');
      }
    }

    recruiter.details.estimatedEvaluationTime = recruiter.timeToEvaluate;
    recruiter.score = Math.min(recruiter.score, 100);

    return recruiter;
  },

  // Combined industry-specific insights
  getIndustrySpecificInsights(analysis, industry) {
    const fieldRecommendations = this.getFieldSpecificRecommendations(industry, analysis);
    const roleRequirements = this.analyzeRoleSpecificRequirements(industry, analysis);
    const atsOptimization = this.analyzeATSOptimization(
      analysis.doc || null,
      analysis.bodyText || '',
      analysis
    );
    const recruiterPerspective = this.analyzeRecruiterPerspective(analysis, industry);

    return {
      industry,
      fieldRecommendations,
      roleRequirements,
      atsOptimization,
      recruiterPerspective,
      summary: {
        roleRequirementsMet: `${roleRequirements.met.length}/${roleRequirements.details.totalRequirements}`,
        atsScore: atsOptimization.score,
        recruiterScore: recruiterPerspective.score,
        estimatedRecruiterEvaluationTime: `${recruiterPerspective.details.estimatedEvaluationTime} seconds`
      }
    };
  },

  // Export and Sharing Functions
  // Generate text report
  generateTextReport(analysis) {
    let report = `PORTFOLIO ANALYSIS REPORT\n`;
    report += `========================\n\n`;
    report += `URL: ${analysis.url}\n`;
    report += `Analysis Date: ${new Date().toLocaleDateString()}\n`;
    report += `Overall Score: ${analysis.overallScore}/100\n\n`;

    report += `SCORE BREAKDOWN\n`;
    report += `---------------\n`;
    report += `Design Quality: ${analysis.designQuality}/100\n`;
    report += `Content Quality: ${analysis.contentQuality}/100\n`;
    report += `UX Score: ${analysis.uxScore}/100\n`;
    report += `Mobile Responsive: ${analysis.mobileResponsive ? 'Yes' : 'No'}\n\n`;

    if (analysis.seo) {
      report += `SEO Score: ${analysis.seo.score}/100\n`;
    }
    if (analysis.accessibility) {
      report += `Accessibility Score: ${analysis.accessibility.score}/100\n`;
    }
    if (analysis.performance) {
      report += `Performance Score: ${analysis.performance.score}/100\n`;
    }
    if (analysis.security) {
      report += `Security Score: ${analysis.security.score}/100\n`;
    }
    if (analysis.visual) {
      report += `Visual Design Score: ${analysis.visual.score}/100\n`;
    }
    if (analysis.content) {
      report += `Content Score: ${analysis.content.score}/100\n`;
    }
    report += `\n`;

    if (analysis.competitive) {
      report += `COMPETITIVE ANALYSIS\n`;
      report += `-------------------\n`;
      report += `Industry: ${analysis.competitive.industry}\n`;
      report += `Percentile: ${analysis.competitive.benchmarks.percentile}\n`;
      report += `Rating: ${analysis.competitive.benchmarks.rating}\n`;
      report += `Industry Average: ${analysis.competitive.benchmarks.average}/100\n`;
      report += `Top 25% Threshold: ${analysis.competitive.benchmarks.top25Percent}/100\n`;
      report += `Top 10% Threshold: ${analysis.competitive.benchmarks.top10Percent}/100\n\n`;
    }

    if (analysis.strengths && analysis.strengths.length > 0) {
      report += `STRENGTHS (${analysis.strengths.length})\n`;
      report += `----------\n`;
      analysis.strengths.forEach((strength, i) => {
        report += `${i + 1}. ${strength}\n`;
      });
      report += `\n`;
    }

    if (analysis.issues && analysis.issues.length > 0) {
      report += `ISSUES TO ADDRESS (${analysis.issues.length})\n`;
      report += `-------------------\n`;
      analysis.issues.forEach((issue, i) => {
        report += `${i + 1}. ${issue}\n`;
      });
      report += `\n`;
    }

    if (analysis.recommendations) {
      report += `RECOMMENDATIONS\n`;
      report += `---------------\n`;
      report += `Quick Wins: ${analysis.recommendations.summary.quickWinsCount}\n`;
      report += `Long-term: ${analysis.recommendations.summary.longTermCount}\n`;
      report += `High Priority: ${analysis.recommendations.summary.highPriorityCount}\n`;
      report += `Potential Score Improvement: +${analysis.recommendations.summary.totalPotentialScore} points\n\n`;
    }

    if (analysis.industryInsights) {
      report += `INDUSTRY INSIGHTS\n`;
      report += `----------------\n`;
      report += `Role Requirements Met: ${analysis.industryInsights.summary.roleRequirementsMet}\n`;
      report += `ATS Score: ${analysis.industryInsights.summary.atsScore}/100\n`;
      report += `Recruiter Score: ${analysis.industryInsights.summary.recruiterScore}/100\n`;
      report += `Estimated Recruiter Evaluation Time: ${analysis.industryInsights.summary.estimatedRecruiterEvaluationTime}\n\n`;
    }

    if (analysis.progress && analysis.progress.comparison && analysis.progress.comparison.hasPrevious) {
      report += `PROGRESS COMPARISON\n`;
      report += `------------------\n`;
      report += `Previous Score: ${analysis.progress.comparison.overallScore.previous}/100\n`;
      report += `Current Score: ${analysis.progress.comparison.overallScore.current}/100\n`;
      report += `Change: ${analysis.progress.comparison.overallScore.change > 0 ? '+' : ''}${analysis.progress.comparison.overallScore.change} points\n`;
      report += `Trend: ${analysis.progress.comparison.overallScore.trend}\n\n`;
    }

    return report;
  },

  // Generate HTML report (for PDF conversion)
  generateHTMLReport(analysis) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Portfolio Analysis Report - ${analysis.url}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
    h1 { color: #4f46e5; border-bottom: 3px solid #4f46e5; padding-bottom: 10px; }
    h2 { color: #6366f1; margin-top: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
    h3 { color: #818cf8; margin-top: 20px; }
    .score { font-size: 2em; font-weight: bold; color: #4f46e5; }
    .score-good { color: #10b981; }
    .score-fair { color: #f59e0b; }
    .score-poor { color: #ef4444; }
    .strength { color: #10b981; margin: 5px 0; }
    .issue { color: #ef4444; margin: 5px 0; }
    .section { margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #4f46e5; color: white; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.85em; }
    .badge-success { background: #d1fae5; color: #065f46; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
    @media print { body { margin: 20px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <h1>Portfolio Analysis Report</h1>
  <p><strong>URL:</strong> ${analysis.url}</p>
  <p><strong>Analysis Date:</strong> ${new Date().toLocaleDateString()}</p>
  
  <div class="section">
    <h2>Overall Score</h2>
    <div class="score ${analysis.overallScore >= 80 ? 'score-good' : analysis.overallScore >= 60 ? 'score-fair' : 'score-poor'}">
      ${analysis.overallScore}/100
    </div>
  </div>

  <div class="section">
    <h2>Score Breakdown</h2>
    <table>
      <tr><th>Category</th><th>Score</th></tr>
      <tr><td>Design Quality</td><td>${analysis.designQuality}/100</td></tr>
      <tr><td>Content Quality</td><td>${analysis.contentQuality}/100</td></tr>
      <tr><td>UX Score</td><td>${analysis.uxScore}/100</td></tr>
      ${analysis.seo ? `<tr><td>SEO</td><td>${analysis.seo.score}/100</td></tr>` : ''}
      ${analysis.accessibility ? `<tr><td>Accessibility</td><td>${analysis.accessibility.score}/100</td></tr>` : ''}
      ${analysis.performance ? `<tr><td>Performance</td><td>${analysis.performance.score}/100</td></tr>` : ''}
      ${analysis.security ? `<tr><td>Security</td><td>${analysis.security.score}/100</td></tr>` : ''}
      ${analysis.visual ? `<tr><td>Visual Design</td><td>${analysis.visual.score}/100</td></tr>` : ''}
      ${analysis.content ? `<tr><td>Content</td><td>${analysis.content.score}/100</td></tr>` : ''}
    </table>
  </div>

  ${analysis.competitive ? `
  <div class="section">
    <h2>Competitive Analysis</h2>
    <p><strong>Industry:</strong> ${analysis.competitive.industry}</p>
    <p><strong>Percentile:</strong> ${analysis.competitive.benchmarks.percentile}</p>
    <p><strong>Rating:</strong> ${analysis.competitive.benchmarks.rating}</p>
    <p><strong>Industry Average:</strong> ${analysis.competitive.benchmarks.average}/100</p>
  </div>
  ` : ''}

  ${analysis.strengths && analysis.strengths.length > 0 ? `
  <div class="section">
    <h2>Strengths (${analysis.strengths.length})</h2>
    <ul>
      ${analysis.strengths.map(s => `<li class="strength">✓ ${s}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  ${analysis.issues && analysis.issues.length > 0 ? `
  <div class="section">
    <h2>Issues to Address (${analysis.issues.length})</h2>
    <ul>
      ${analysis.issues.map(i => `<li class="issue">✗ ${i}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  ${analysis.recommendations ? `
  <div class="section">
    <h2>Recommendations</h2>
    <p><strong>Quick Wins:</strong> ${analysis.recommendations.summary.quickWinsCount}</p>
    <p><strong>Long-term Improvements:</strong> ${analysis.recommendations.summary.longTermCount}</p>
    <p><strong>High Priority:</strong> ${analysis.recommendations.summary.highPriorityCount}</p>
    <p><strong>Potential Score Improvement:</strong> +${analysis.recommendations.summary.totalPotentialScore} points</p>
  </div>
  ` : ''}

  ${analysis.progress && analysis.progress.comparison && analysis.progress.comparison.hasPrevious ? `
  <div class="section">
    <h2>Progress Comparison</h2>
    <p><strong>Previous Score:</strong> ${analysis.progress.comparison.overallScore.previous}/100</p>
    <p><strong>Current Score:</strong> ${analysis.progress.comparison.overallScore.current}/100</p>
    <p><strong>Change:</strong> ${analysis.progress.comparison.overallScore.change > 0 ? '+' : ''}${analysis.progress.comparison.overallScore.change} points</p>
    <p><strong>Trend:</strong> ${analysis.progress.comparison.overallScore.trend}</p>
  </div>
  ` : ''}
</body>
</html>`;
    return html;
  },

  // Export to JSON
  exportToJSON(analysis) {
    return JSON.stringify(analysis, null, 2);
  },

  // Export to CSV
  exportToCSV(analysis) {
    let csv = 'Category,Score,Status\n';
    csv += `Overall Score,${analysis.overallScore},${analysis.overallScore >= 80 ? 'Good' : analysis.overallScore >= 60 ? 'Fair' : 'Poor'}\n`;
    csv += `Design Quality,${analysis.designQuality},${analysis.designQuality >= 80 ? 'Good' : analysis.designQuality >= 60 ? 'Fair' : 'Poor'}\n`;
    csv += `Content Quality,${analysis.contentQuality},${analysis.contentQuality >= 80 ? 'Good' : analysis.contentQuality >= 60 ? 'Fair' : 'Poor'}\n`;
    csv += `UX Score,${analysis.uxScore},${analysis.uxScore >= 80 ? 'Good' : analysis.uxScore >= 60 ? 'Fair' : 'Poor'}\n`;
    
    if (analysis.seo) csv += `SEO,${analysis.seo.score},${analysis.seo.score >= 70 ? 'Good' : 'Needs Improvement'}\n`;
    if (analysis.accessibility) csv += `Accessibility,${analysis.accessibility.score},${analysis.accessibility.score >= 70 ? 'Good' : 'Needs Improvement'}\n`;
    if (analysis.performance) csv += `Performance,${analysis.performance.score},${analysis.performance.score >= 70 ? 'Good' : 'Needs Improvement'}\n`;
    if (analysis.security) csv += `Security,${analysis.security.score},${analysis.security.score >= 70 ? 'Good' : 'Needs Improvement'}\n`;
    if (analysis.visual) csv += `Visual Design,${analysis.visual.score},${analysis.visual.score >= 80 ? 'Good' : 'Needs Improvement'}\n`;
    if (analysis.content) csv += `Content,${analysis.content.score},${analysis.content.score >= 75 ? 'Good' : 'Needs Improvement'}\n`;

    csv += '\n';
    csv += 'Issue,Category,Priority\n';
    if (analysis.issues && analysis.issues.length > 0) {
      analysis.issues.forEach(issue => {
        // Try to categorize issue
        let category = 'General';
        if (issue.toLowerCase().includes('seo')) category = 'SEO';
        else if (issue.toLowerCase().includes('accessibility') || issue.toLowerCase().includes('a11y')) category = 'Accessibility';
        else if (issue.toLowerCase().includes('performance') || issue.toLowerCase().includes('speed')) category = 'Performance';
        else if (issue.toLowerCase().includes('security') || issue.toLowerCase().includes('https')) category = 'Security';
        else if (issue.toLowerCase().includes('design') || issue.toLowerCase().includes('visual')) category = 'Design';
        else if (issue.toLowerCase().includes('content')) category = 'Content';
        
        csv += `"${issue.replace(/"/g, '""')}",${category},Medium\n`;
      });
    }

    return csv;
  },

  // Generate improvement checklist
  generateChecklist(analysis) {
    const checklist = {
      completed: [],
      pending: [],
      byCategory: {
        seo: [],
        accessibility: [],
        performance: [],
        security: [],
        design: [],
        content: []
      }
    };

    // Convert recommendations to checklist items
    if (analysis.recommendations) {
      [...analysis.recommendations.quickWins, ...analysis.recommendations.longTerm].forEach(rec => {
        const item = {
          id: rec.id,
          title: rec.title,
          description: rec.description,
          category: rec.category,
          priority: rec.priority,
          estimatedTime: rec.estimatedTime,
          expectedImprovement: rec.expectedImprovement,
          completed: false
        };
        
        checklist.pending.push(item);
        
        // Categorize
        const category = rec.category.toLowerCase();
        if (checklist.byCategory[category]) {
          checklist.byCategory[category].push(item);
        }
      });
    }

    return checklist;
  },

  // Export checklist to various formats
  exportChecklist(analysis, format = 'json') {
    const checklist = this.generateChecklist(analysis);

    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(checklist, null, 2);
      
      case 'csv':
        let csv = 'ID,Title,Category,Priority,Estimated Time,Expected Improvement,Status\n';
        checklist.pending.forEach(item => {
          csv += `${item.id},"${item.title.replace(/"/g, '""')}",${item.category},${item.priority},"${item.estimatedTime}","${item.expectedImprovement}",Pending\n`;
        });
        return csv;
      
      case 'text':
        let text = 'PORTFOLIO IMPROVEMENT CHECKLIST\n';
        text += '==================================\n\n';
        text += `Total Items: ${checklist.pending.length}\n\n`;
        
        Object.keys(checklist.byCategory).forEach(category => {
          if (checklist.byCategory[category].length > 0) {
            text += `${category.toUpperCase()}\n`;
            text += '-'.repeat(category.length) + '\n';
            checklist.byCategory[category].forEach((item, i) => {
              text += `[ ] ${i + 1}. ${item.title}\n`;
              text += `    Description: ${item.description}\n`;
              text += `    Priority: ${item.priority} | Time: ${item.estimatedTime}\n`;
              text += `    Expected: ${item.expectedImprovement}\n\n`;
            });
          }
        });
        return text;
      
      default:
        return JSON.stringify(checklist, null, 2);
    }
  },

  // Generate comparison report
  generateComparisonReport(currentAnalysis, previousAnalysis, url) {
    if (!previousAnalysis) {
      return {
        hasComparison: false,
        message: 'No previous analysis available for comparison'
      };
    }

    const comparison = {
      hasComparison: true,
      url: url,
      currentDate: new Date().toLocaleDateString(),
      previousDate: previousAnalysis.date || 'Unknown',
      overallScore: {
        current: currentAnalysis.overallScore,
        previous: previousAnalysis.overallScore,
        change: currentAnalysis.overallScore - previousAnalysis.overallScore,
        percentageChange: previousAnalysis.overallScore > 0 
          ? ((currentAnalysis.overallScore - previousAnalysis.overallScore) / previousAnalysis.overallScore * 100).toFixed(1)
          : 0
      },
      categoryChanges: {},
      improvements: [],
      regressions: [],
      summary: {
        totalImprovements: 0,
        totalRegressions: 0,
        netChange: 0
      }
    };

    // Compare category scores
    const categories = ['seo', 'accessibility', 'performance', 'security', 'socialMedia', 'visual', 'content'];
    categories.forEach(category => {
      const currentScore = currentAnalysis[category]?.score || 0;
      const previousScore = previousAnalysis.scores?.[category] || 0;
      const change = currentScore - previousScore;

      comparison.categoryChanges[category] = {
        current: currentScore,
        previous: previousScore,
        change: change,
        percentageChange: previousScore > 0 
          ? ((change / previousScore) * 100).toFixed(1)
          : 0,
        trend: change > 0 ? 'improved' : change < 0 ? 'declined' : 'unchanged'
      };

      if (change > 0) {
        comparison.improvements.push({
          category: category,
          improvement: change,
          message: `${category} improved by ${change} points`
        });
        comparison.summary.totalImprovements++;
      } else if (change < 0) {
        comparison.regressions.push({
          category: category,
          decline: Math.abs(change),
          message: `${category} declined by ${Math.abs(change)} points`
        });
        comparison.summary.totalRegressions++;
      }
    });

    comparison.summary.netChange = comparison.overallScore.change;

    return comparison;
  },

  // Generate shareable link data
  generateShareableData(analysis) {
    // Create a shareable data object (could be stored and shared via URL)
    const shareableData = {
      url: analysis.url,
      date: new Date().toISOString(),
      overallScore: analysis.overallScore,
      scores: {
        designQuality: analysis.designQuality,
        contentQuality: analysis.contentQuality,
        uxScore: analysis.uxScore
      },
      summary: {
        strengthsCount: analysis.strengths?.length || 0,
        issuesCount: analysis.issues?.length || 0,
        industry: analysis.competitive?.industry || 'Unknown',
        percentile: analysis.competitive?.benchmarks?.percentile || 'Unknown'
      }
    };

    // Encode to base64 for URL sharing (if needed)
    const encoded = btoa(JSON.stringify(shareableData));
    
    return {
      data: shareableData,
      encoded: encoded,
      shareableUrl: `${window.location.origin}${window.location.pathname}?share=${encoded}`,
      text: this.generateTextReport(analysis)
    };
  },

  // Export full analysis report
  exportAnalysisReport(analysis, format = 'json') {
    switch (format.toLowerCase()) {
      case 'json':
        return {
          format: 'json',
          data: this.exportToJSON(analysis),
          filename: `portfolio-analysis-${new Date().toISOString().split('T')[0]}.json`,
          mimeType: 'application/json'
        };
      
      case 'csv':
        return {
          format: 'csv',
          data: this.exportToCSV(analysis),
          filename: `portfolio-analysis-${new Date().toISOString().split('T')[0]}.csv`,
          mimeType: 'text/csv'
        };
      
      case 'text':
        return {
          format: 'text',
          data: this.generateTextReport(analysis),
          filename: `portfolio-analysis-${new Date().toISOString().split('T')[0]}.txt`,
          mimeType: 'text/plain'
        };
      
      case 'html':
        return {
          format: 'html',
          data: this.generateHTMLReport(analysis),
          filename: `portfolio-analysis-${new Date().toISOString().split('T')[0]}.html`,
          mimeType: 'text/html'
        };
      
      case 'checklist-json':
        return {
          format: 'json',
          data: this.exportChecklist(analysis, 'json'),
          filename: `portfolio-checklist-${new Date().toISOString().split('T')[0]}.json`,
          mimeType: 'application/json'
        };
      
      case 'checklist-csv':
        return {
          format: 'csv',
          data: this.exportChecklist(analysis, 'csv'),
          filename: `portfolio-checklist-${new Date().toISOString().split('T')[0]}.csv`,
          mimeType: 'text/csv'
        };
      
      case 'checklist-text':
        return {
          format: 'text',
          data: this.exportChecklist(analysis, 'text'),
          filename: `portfolio-checklist-${new Date().toISOString().split('T')[0]}.txt`,
          mimeType: 'text/plain'
        };
      
      default:
        return {
          format: 'json',
          data: this.exportToJSON(analysis),
          filename: `portfolio-analysis-${new Date().toISOString().split('T')[0]}.json`,
          mimeType: 'application/json'
        };
    }
  },

  // Real-time Monitoring & Automated Re-analysis Functions
  // Set up monitoring for a portfolio
  setupMonitoring(url, options = {}) {
    const monitoringConfig = {
      url: url,
      enabled: true,
      frequency: options.frequency || 'weekly', // 'daily', 'weekly', 'monthly'
      notifyOnChange: options.notifyOnChange !== false, // Default true
      notifyOnScoreChange: options.notifyOnScoreChange || 5, // Notify if score changes by X points
      notifyOnIssues: options.notifyOnIssues !== false, // Default true
      lastCheck: null,
      nextCheck: null,
      checkCount: 0,
      createdAt: new Date().toISOString(),
      alerts: []
    };

    // Calculate next check time
    monitoringConfig.nextCheck = this.calculateNextCheckTime(monitoringConfig.frequency);

    // Save to localStorage
    const monitoringKey = `portfolio_monitoring_${this.hashUrl(url)}`;
    localStorage.setItem(monitoringKey, JSON.stringify(monitoringConfig));

    return monitoringConfig;
  },

  // Calculate next check time based on frequency
  calculateNextCheckTime(frequency) {
    const now = new Date();
    const next = new Date(now);

    switch (frequency.toLowerCase()) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        next.setHours(9, 0, 0, 0); // 9 AM
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        next.setHours(9, 0, 0, 0);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        next.setDate(1);
        next.setHours(9, 0, 0, 0);
        break;
      default:
        next.setDate(next.getDate() + 7);
    }

    return next.toISOString();
  },

  // Get monitoring configuration
  getMonitoringConfig(url) {
    const monitoringKey = `portfolio_monitoring_${this.hashUrl(url)}`;
    const stored = localStorage.getItem(monitoringKey);
    return stored ? JSON.parse(stored) : null;
  },

  // Update monitoring configuration
  updateMonitoringConfig(url, updates) {
    const config = this.getMonitoringConfig(url);
    if (!config) {
      return null;
    }

    const updated = { ...config, ...updates };
    if (updates.frequency && updates.frequency !== config.frequency) {
      updated.nextCheck = this.calculateNextCheckTime(updates.frequency);
    }

    const monitoringKey = `portfolio_monitoring_${this.hashUrl(url)}`;
    localStorage.setItem(monitoringKey, JSON.stringify(updated));
    return updated;
  },

  // Disable monitoring
  disableMonitoring(url) {
    return this.updateMonitoringConfig(url, { enabled: false });
  },

  // Enable monitoring
  enableMonitoring(url) {
    return this.updateMonitoringConfig(url, { enabled: true });
  },

  // Remove monitoring
  removeMonitoring(url) {
    const monitoringKey = `portfolio_monitoring_${this.hashUrl(url)}`;
    localStorage.removeItem(monitoringKey);
    return true;
  },

  // Get all monitored portfolios
  getAllMonitoredPortfolios() {
    const monitored = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('portfolio_monitoring_')) {
        try {
          const config = JSON.parse(localStorage.getItem(key));
          if (config && config.enabled) {
            monitored.push(config);
          }
        } catch (e) {
          // Skip invalid entries
        }
      }
    });

    return monitored;
  },

  // Check if portfolio needs re-analysis
  shouldReanalyze(url) {
    const config = this.getMonitoringConfig(url);
    if (!config || !config.enabled) {
      return false;
    }

    const now = new Date();
    const nextCheck = new Date(config.nextCheck);
    return now >= nextCheck;
  },

  // Perform automated re-analysis
  async performAutomatedReanalysis(url) {
    const config = this.getMonitoringConfig(url);
    if (!config || !config.enabled) {
      return { success: false, message: 'Monitoring not enabled for this portfolio' };
    }

    try {
      // Get previous analysis
      const history = this.getAnalysisHistory(url);
      const previousAnalysis = history && history.length > 0 ? history[0] : null;

      // Perform new analysis
      const currentAnalysis = await this.analyzePortfolio(url);

      // Detect changes
      const changes = this.detectChanges(previousAnalysis, currentAnalysis, config);

      // Update monitoring config
      const updatedConfig = this.updateMonitoringConfig(url, {
        lastCheck: new Date().toISOString(),
        nextCheck: this.calculateNextCheckTime(config.frequency),
        checkCount: config.checkCount + 1
      });

      // Store alert if significant changes detected
      if (changes.hasSignificantChanges) {
        const alert = {
          id: `alert_${Date.now()}`,
          url: url,
          timestamp: new Date().toISOString(),
          type: 'change_detected',
          message: changes.summary,
          details: changes,
          read: false
        };

        this.addAlert(alert);
      }

      return {
        success: true,
        analysis: currentAnalysis,
        changes: changes,
        config: updatedConfig
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Detect changes between analyses
  detectChanges(previousAnalysis, currentAnalysis, monitoringConfig) {
    if (!previousAnalysis) {
      return {
        hasChanges: false,
        hasSignificantChanges: false,
        message: 'No previous analysis to compare',
        summary: 'First analysis completed'
      };
    }

    const changes = {
      hasChanges: false,
      hasSignificantChanges: false,
      scoreChange: 0,
      scoreChangePercentage: 0,
      categoryChanges: {},
      newIssues: [],
      resolvedIssues: [],
      newStrengths: [],
      lostStrengths: [],
      summary: ''
    };

    // Compare overall scores
    const previousScore = previousAnalysis.overallScore || 0;
    const currentScore = currentAnalysis.overallScore || 0;
    changes.scoreChange = currentScore - previousScore;
    changes.scoreChangePercentage = previousScore > 0 
      ? ((changes.scoreChange / previousScore) * 100).toFixed(1)
      : 0;

    if (Math.abs(changes.scoreChange) >= (monitoringConfig.notifyOnScoreChange || 5)) {
      changes.hasSignificantChanges = true;
    }

    // Compare category scores
    const categories = ['seo', 'accessibility', 'performance', 'security', 'socialMedia', 'visual', 'content'];
    categories.forEach(category => {
      const prevScore = previousAnalysis[category]?.score || previousAnalysis.scores?.[category] || 0;
      const currScore = currentAnalysis[category]?.score || 0;
      const change = currScore - prevScore;

      if (change !== 0) {
        changes.hasChanges = true;
        changes.categoryChanges[category] = {
          previous: prevScore,
          current: currScore,
          change: change,
          percentageChange: prevScore > 0 ? ((change / prevScore) * 100).toFixed(1) : 0
        };
      }
    });

    // Compare issues
    const previousIssues = previousAnalysis.issues || [];
    const currentIssues = currentAnalysis.issues || [];
    
    // Find new issues
    changes.newIssues = currentIssues.filter(issue => 
      !previousIssues.some(prevIssue => prevIssue.toLowerCase() === issue.toLowerCase())
    );
    
    // Find resolved issues
    changes.resolvedIssues = previousIssues.filter(prevIssue => 
      !currentIssues.some(issue => issue.toLowerCase() === prevIssue.toLowerCase())
    );

    if (changes.newIssues.length > 0 || changes.resolvedIssues.length > 0) {
      changes.hasChanges = true;
      if (monitoringConfig.notifyOnIssues) {
        changes.hasSignificantChanges = true;
      }
    }

    // Compare strengths
    const previousStrengths = previousAnalysis.strengths || [];
    const currentStrengths = currentAnalysis.strengths || [];
    
    changes.newStrengths = currentStrengths.filter(strength => 
      !previousStrengths.some(prevStrength => prevStrength.toLowerCase() === strength.toLowerCase())
    );
    
    changes.lostStrengths = previousStrengths.filter(prevStrength => 
      !currentStrengths.some(strength => strength.toLowerCase() === prevStrength.toLowerCase())
    );

    if (changes.newStrengths.length > 0 || changes.lostStrengths.length > 0) {
      changes.hasChanges = true;
    }

    // Generate summary
    const summaryParts = [];
    if (Math.abs(changes.scoreChange) > 0) {
      summaryParts.push(`Score ${changes.scoreChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(changes.scoreChange)} points`);
    }
    if (changes.newIssues.length > 0) {
      summaryParts.push(`${changes.newIssues.length} new issue(s) detected`);
    }
    if (changes.resolvedIssues.length > 0) {
      summaryParts.push(`${changes.resolvedIssues.length} issue(s) resolved`);
    }
    if (changes.newStrengths.length > 0) {
      summaryParts.push(`${changes.newStrengths.length} new strength(s) added`);
    }

    changes.summary = summaryParts.length > 0 
      ? summaryParts.join(', ')
      : 'No significant changes detected';

    return changes;
  },

  // Alert management
  addAlert(alert) {
    const alertsKey = 'portfolio_monitoring_alerts';
    let alerts = [];
    
    try {
      const stored = localStorage.getItem(alertsKey);
      alerts = stored ? JSON.parse(stored) : [];
    } catch (e) {
      alerts = [];
    }

    alerts.unshift(alert); // Add to beginning
    alerts = alerts.slice(0, 100); // Keep only last 100 alerts

    localStorage.setItem(alertsKey, JSON.stringify(alerts));
    return alert;
  },

  getAlerts(url = null, unreadOnly = false) {
    const alertsKey = 'portfolio_monitoring_alerts';
    let alerts = [];
    
    try {
      const stored = localStorage.getItem(alertsKey);
      alerts = stored ? JSON.parse(stored) : [];
    } catch (e) {
      alerts = [];
    }

    // Filter by URL if provided
    if (url) {
      alerts = alerts.filter(alert => alert.url === url);
    }

    // Filter unread only if requested
    if (unreadOnly) {
      alerts = alerts.filter(alert => !alert.read);
    }

    return alerts;
  },

  markAlertAsRead(alertId) {
    const alertsKey = 'portfolio_monitoring_alerts';
    let alerts = [];
    
    try {
      const stored = localStorage.getItem(alertsKey);
      alerts = stored ? JSON.parse(stored) : [];
    } catch (e) {
      return false;
    }

    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      alert.read = true;
      localStorage.setItem(alertsKey, JSON.stringify(alerts));
      return true;
    }

    return false;
  },

  markAllAlertsAsRead(url = null) {
    const alertsKey = 'portfolio_monitoring_alerts';
    let alerts = [];
    
    try {
      const stored = localStorage.getItem(alertsKey);
      alerts = stored ? JSON.parse(stored) : [];
    } catch (e) {
      return 0;
    }

    let marked = 0;
    alerts.forEach(alert => {
      if ((!url || alert.url === url) && !alert.read) {
        alert.read = true;
        marked++;
      }
    });

    if (marked > 0) {
      localStorage.setItem(alertsKey, JSON.stringify(alerts));
    }

    return marked;
  },

  deleteAlert(alertId) {
    const alertsKey = 'portfolio_monitoring_alerts';
    let alerts = [];
    
    try {
      const stored = localStorage.getItem(alertsKey);
      alerts = stored ? JSON.parse(stored) : [];
    } catch (e) {
      return false;
    }

    const initialLength = alerts.length;
    alerts = alerts.filter(a => a.id !== alertId);
    
    if (alerts.length < initialLength) {
      localStorage.setItem(alertsKey, JSON.stringify(alerts));
      return true;
    }

    return false;
  },

  clearAllAlerts(url = null) {
    const alertsKey = 'portfolio_monitoring_alerts';
    
    if (url) {
      let alerts = [];
      try {
        const stored = localStorage.getItem(alertsKey);
        alerts = stored ? JSON.parse(stored) : [];
      } catch (e) {
        return 0;
      }

      const initialLength = alerts.length;
      alerts = alerts.filter(a => a.url !== url);
      const removed = initialLength - alerts.length;
      
      if (removed > 0) {
        localStorage.setItem(alertsKey, JSON.stringify(alerts));
      }
      
      return removed;
    } else {
      localStorage.removeItem(alertsKey);
      return true;
    }
  },

  // Get monitoring status for all portfolios
  getMonitoringStatus() {
    const monitored = this.getAllMonitoredPortfolios();
    const status = {
      totalMonitored: monitored.length,
      dueForCheck: [],
      nextChecks: [],
      recentChecks: [],
      alerts: this.getAlerts(null, true), // Unread alerts
      summary: {
        daily: 0,
        weekly: 0,
        monthly: 0
      }
    };

    const now = new Date();

    monitored.forEach(config => {
      // Count by frequency
      if (config.frequency === 'daily') status.summary.daily++;
      else if (config.frequency === 'weekly') status.summary.weekly++;
      else if (config.frequency === 'monthly') status.summary.monthly++;

      // Check if due for re-analysis
      if (config.nextCheck) {
        const nextCheck = new Date(config.nextCheck);
        if (now >= nextCheck) {
          status.dueForCheck.push(config);
        } else {
          status.nextChecks.push({
            url: config.url,
            nextCheck: config.nextCheck,
            daysUntil: Math.ceil((nextCheck - now) / (1000 * 60 * 60 * 24))
          });
        }
      }

      // Recent checks (last 7 days)
      if (config.lastCheck) {
        const lastCheck = new Date(config.lastCheck);
        const daysSince = (now - lastCheck) / (1000 * 60 * 60 * 24);
        if (daysSince <= 7) {
          status.recentChecks.push({
            url: config.url,
            lastCheck: config.lastCheck,
            daysAgo: Math.floor(daysSince),
            checkCount: config.checkCount || 0
          });
        }
      }
    });

    // Sort next checks by date
    status.nextChecks.sort((a, b) => new Date(a.nextCheck) - new Date(b.nextCheck));

    return status;
  },

  // Hash URL for storage key
  hashUrl(url) {
    // Simple hash function for URL
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  },

  // Check all monitored portfolios (should be called periodically)
  async checkAllMonitoredPortfolios() {
    const monitored = this.getAllMonitoredPortfolios();
    const results = [];

    for (const config of monitored) {
      if (this.shouldReanalyze(config.url)) {
        try {
          const result = await this.performAutomatedReanalysis(config.url);
          results.push({
            url: config.url,
            success: result.success,
            changes: result.changes,
            error: result.error
          });
        } catch (error) {
          results.push({
            url: config.url,
            success: false,
            error: error.message
          });
        }
      }
    }

    return results;
  },

  // Advanced Analytics & Predictive Insights Functions
  // Calculate trend and forecast future scores
  calculateTrendForecast(url, daysAhead = 30) {
    const history = this.getAnalysisHistory(url);
    if (!history || history.length < 2) {
      return {
        hasEnoughData: false,
        message: 'Insufficient historical data for forecasting (need at least 2 analyses)'
      };
    }

    // Sort by date (oldest first)
    const sortedHistory = [...history].sort((a, b) => {
      const dateA = new Date(a.date || a.timestamp || 0);
      const dateB = new Date(b.date || b.timestamp || 0);
      return dateA - dateB;
    });

    const scores = sortedHistory.map(h => h.overallScore || 0);
    const dates = sortedHistory.map(h => new Date(h.date || h.timestamp || Date.now()));

    // Calculate linear regression for trend
    const n = scores.length;
    const sumX = dates.reduce((sum, date, i) => sum + i, 0);
    const sumY = scores.reduce((sum, score) => sum + score, 0);
    const sumXY = dates.reduce((sum, date, i) => sum + i * scores[i], 0);
    const sumX2 = dates.reduce((sum, date, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate current trend
    const currentScore = scores[scores.length - 1];
    const previousScore = scores.length > 1 ? scores[scores.length - 2] : currentScore;
    const trend = currentScore - previousScore;
    const trendDirection = trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable';
    const averageTrend = (currentScore - scores[0]) / (n - 1);

    // Forecast future score
    const futureIndex = n + Math.floor(daysAhead / 7); // Assuming weekly checks
    const forecastedScore = Math.max(0, Math.min(100, slope * futureIndex + intercept));

    // Calculate confidence based on data consistency
    const variance = scores.reduce((sum, score) => {
      const mean = sumY / n;
      return sum + Math.pow(score - mean, 2);
    }, 0) / n;
    const stdDev = Math.sqrt(variance);
    const confidence = Math.max(0, Math.min(100, 100 - (stdDev * 2)));

    // Calculate rate of improvement
    const improvementRate = averageTrend; // Points per analysis period
    const daysToTarget = (targetScore) => {
      if (improvementRate <= 0) return null;
      const pointsNeeded = targetScore - currentScore;
      return Math.ceil((pointsNeeded / improvementRate) * 7); // Convert to days
    };

    return {
      hasEnoughData: true,
      currentScore: currentScore,
      previousScore: previousScore,
      trend: trend,
      trendDirection: trendDirection,
      averageTrend: averageTrend,
      improvementRate: improvementRate,
      forecastedScore: Math.round(forecastedScore),
      forecastedDate: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString(),
      confidence: Math.round(confidence),
      dataPoints: n,
      variance: variance,
      standardDeviation: stdDev,
      daysToTarget: daysToTarget,
      historicalScores: scores,
      historicalDates: dates.map(d => d.toISOString())
    };
  },

  // Predict future score based on recommendations implementation
  predictScoreWithRecommendations(currentAnalysis, recommendationsToImplement = []) {
    if (!currentAnalysis || !currentAnalysis.recommendations) {
      return {
        currentScore: currentAnalysis?.overallScore || 0,
        predictedScore: currentAnalysis?.overallScore || 0,
        potentialImprovement: 0,
        message: 'No recommendations available for prediction'
      };
    }

    const currentScore = currentAnalysis.overallScore || 0;
    let potentialImprovement = 0;
    const implementedRecommendations = [];

    // If specific recommendations provided, use those
    if (recommendationsToImplement.length > 0) {
      recommendationsToImplement.forEach(recId => {
        const allRecs = [
          ...(currentAnalysis.recommendations.quickWins || []),
          ...(currentAnalysis.recommendations.longTerm || [])
        ];
        const rec = allRecs.find(r => r.id === recId);
        if (rec && rec.expectedImprovement) {
          potentialImprovement += rec.expectedImprovement;
          implementedRecommendations.push(rec);
        }
      });
    } else {
      // Predict based on all quick wins
      const quickWins = currentAnalysis.recommendations.quickWins || [];
      quickWins.forEach(rec => {
        if (rec.expectedImprovement) {
          potentialImprovement += rec.expectedImprovement;
          implementedRecommendations.push(rec);
        }
      });
    }

    // Cap improvement at reasonable maximum (can't exceed 100)
    const predictedScore = Math.min(100, currentScore + potentialImprovement);
    const actualImprovement = predictedScore - currentScore;

    return {
      currentScore: currentScore,
      predictedScore: Math.round(predictedScore),
      potentialImprovement: Math.round(actualImprovement),
      recommendationsCount: implementedRecommendations.length,
      recommendations: implementedRecommendations.map(r => ({
        id: r.id,
        title: r.title,
        expectedImprovement: r.expectedImprovement
      })),
      confidence: implementedRecommendations.length > 0 ? 75 : 0
    };
  },

  // Analyze patterns in historical data
  analyzeHistoricalPatterns(url) {
    const history = this.getAnalysisHistory(url);
    if (!history || history.length < 3) {
      return {
        hasEnoughData: false,
        message: 'Insufficient data for pattern analysis (need at least 3 analyses)'
      };
    }

    const sortedHistory = [...history].sort((a, b) => {
      const dateA = new Date(a.date || a.timestamp || 0);
      const dateB = new Date(b.date || b.timestamp || 0);
      return dateA - dateB;
    });

    const patterns = {
      scoreProgression: [],
      categoryTrends: {},
      improvementVelocity: [],
      consistency: {},
      bestPerformingCategories: [],
      worstPerformingCategories: [],
      insights: []
    };

    // Analyze score progression
    sortedHistory.forEach((analysis, index) => {
      if (index > 0) {
        const previous = sortedHistory[index - 1];
        const change = (analysis.overallScore || 0) - (previous.overallScore || 0);
        patterns.scoreProgression.push({
          date: analysis.date || analysis.timestamp,
          score: analysis.overallScore || 0,
          change: change,
          changePercentage: previous.overallScore > 0 
            ? ((change / previous.overallScore) * 100).toFixed(1)
            : 0
        });
      }
    });

    // Analyze category trends
    const categories = ['seo', 'accessibility', 'performance', 'security', 'socialMedia', 'visual', 'content'];
    categories.forEach(category => {
      const categoryScores = sortedHistory
        .map(h => h[category]?.score || h.scores?.[category] || 0)
        .filter(score => score > 0);

      if (categoryScores.length > 0) {
        const firstScore = categoryScores[0];
        const lastScore = categoryScores[categoryScores.length - 1];
        const change = lastScore - firstScore;
        const average = categoryScores.reduce((sum, s) => sum + s, 0) / categoryScores.length;

        patterns.categoryTrends[category] = {
          firstScore: firstScore,
          lastScore: lastScore,
          change: change,
          average: Math.round(average),
          trend: change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable',
          dataPoints: categoryScores.length
        };
      }
    });

    // Calculate improvement velocity (rate of change)
    if (patterns.scoreProgression.length > 0) {
      const changes = patterns.scoreProgression.map(p => p.change);
      const averageChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;
      patterns.improvementVelocity = {
        average: Math.round(averageChange * 10) / 10,
        trend: averageChange > 0 ? 'positive' : averageChange < 0 ? 'negative' : 'neutral',
        consistency: this.calculateConsistency(changes)
      };
    }

    // Identify best and worst performing categories
    const categoryAverages = Object.entries(patterns.categoryTrends)
      .map(([cat, data]) => ({ category: cat, average: data.average }))
      .sort((a, b) => b.average - a.average);

    patterns.bestPerformingCategories = categoryAverages.slice(0, 3);
    patterns.worstPerformingCategories = categoryAverages.slice(-3).reverse();

    // Calculate consistency
    const allScores = sortedHistory.map(h => h.overallScore || 0);
    patterns.consistency = {
      variance: this.calculateVariance(allScores),
      standardDeviation: Math.sqrt(this.calculateVariance(allScores)),
      coefficientOfVariation: (Math.sqrt(this.calculateVariance(allScores)) / (allScores.reduce((a, b) => a + b, 0) / allScores.length)) * 100,
      isConsistent: Math.sqrt(this.calculateVariance(allScores)) < 5 // Low variance = consistent
    };

    // Generate insights
    if (patterns.improvementVelocity.trend === 'positive') {
      patterns.insights.push(`Portfolio is improving at an average rate of ${Math.abs(patterns.improvementVelocity.average)} points per analysis`);
    } else if (patterns.improvementVelocity.trend === 'negative') {
      patterns.insights.push(`Portfolio score is declining. Consider reviewing recent changes.`);
    }

    if (patterns.consistency.isConsistent) {
      patterns.insights.push('Portfolio performance is consistent across analyses');
    } else {
      patterns.insights.push('Portfolio performance shows variability - consider focusing on stability');
    }

    const bestCategory = patterns.bestPerformingCategories[0];
    const worstCategory = patterns.worstPerformingCategories[0];
    if (bestCategory && worstCategory) {
      patterns.insights.push(`Best performing category: ${bestCategory.category} (${bestCategory.average}/100)`);
      patterns.insights.push(`Category needing most improvement: ${worstCategory.category} (${worstCategory.average}/100)`);
    }

    return patterns;
  },

  // Calculate variance
  calculateVariance(values) {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  },

  // Calculate consistency score
  calculateConsistency(changes) {
    if (changes.length === 0) return 'unknown';
    const variance = this.calculateVariance(changes);
    const stdDev = Math.sqrt(variance);
    
    if (stdDev < 2) return 'very_consistent';
    if (stdDev < 5) return 'consistent';
    if (stdDev < 10) return 'moderate';
    return 'inconsistent';
  },

  // Predict goal achievement timeline
  predictGoalAchievement(url, targetScore) {
    const history = this.getAnalysisHistory(url);
    const currentAnalysis = history && history.length > 0 ? history[0] : null;
    const forecast = this.calculateTrendForecast(url, 90);

    if (!currentAnalysis || !forecast.hasEnoughData) {
      return {
        canPredict: false,
        message: 'Insufficient data for goal prediction'
      };
    }

    const currentScore = currentAnalysis.overallScore || 0;
    const pointsNeeded = targetScore - currentScore;

    if (pointsNeeded <= 0) {
      return {
        canPredict: true,
        goalAchieved: true,
        currentScore: currentScore,
        targetScore: targetScore,
        message: 'Goal already achieved!'
      };
    }

    // Use improvement rate from forecast
    const improvementRate = forecast.improvementRate || 0;

    if (improvementRate <= 0) {
      return {
        canPredict: true,
        goalAchieved: false,
        currentScore: currentScore,
        targetScore: targetScore,
        pointsNeeded: pointsNeeded,
        estimatedDays: null,
        estimatedDate: null,
        message: 'Current trend suggests goal may not be achievable without changes',
        recommendation: 'Consider implementing recommended improvements to accelerate progress'
      };
    }

    // Calculate estimated timeline
    const analysesNeeded = Math.ceil(pointsNeeded / improvementRate);
    const estimatedDays = analysesNeeded * 7; // Assuming weekly checks
    const estimatedDate = new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000);

    // Calculate confidence based on forecast confidence and data consistency
    const confidence = Math.min(forecast.confidence || 50, 85);

    return {
      canPredict: true,
      goalAchieved: false,
      currentScore: currentScore,
      targetScore: targetScore,
      pointsNeeded: pointsNeeded,
      improvementRate: improvementRate,
      estimatedDays: estimatedDays,
      estimatedDate: estimatedDate.toISOString(),
      estimatedWeeks: Math.ceil(estimatedDays / 7),
      confidence: confidence,
      message: `Based on current trend, goal should be achievable in approximately ${Math.ceil(estimatedDays / 7)} weeks`,
      recommendation: forecast.improvementRate < 2 
        ? 'Consider implementing quick wins to accelerate progress'
        : 'Continue current improvement trajectory'
    };
  },

  // Generate comprehensive analytics report
  generateAnalyticsReport(url) {
    const history = this.getAnalysisHistory(url);
    const currentAnalysis = history && history.length > 0 ? history[0] : null;
    const forecast = this.calculateTrendForecast(url, 30);
    const patterns = this.analyzeHistoricalPatterns(url);
    const goal = this.getPortfolioGoal(url);
    const goalPrediction = goal ? this.predictGoalAchievement(url, goal.targetScore) : null;

    const report = {
      url: url,
      generatedAt: new Date().toISOString(),
      currentAnalysis: currentAnalysis ? {
        score: currentAnalysis.overallScore,
        date: currentAnalysis.date || currentAnalysis.timestamp
      } : null,
      forecast: forecast,
      patterns: patterns,
      goalPrediction: goalPrediction,
      summary: {
        totalAnalyses: history ? history.length : 0,
        hasForecast: forecast.hasEnoughData,
        hasPatterns: patterns.hasEnoughData,
        hasGoal: goal !== null,
        trendDirection: forecast.trendDirection || 'unknown',
        improvementRate: forecast.improvementRate || 0
      },
      recommendations: []
    };

    // Generate recommendations based on analytics
    if (forecast.hasEnoughData) {
      if (forecast.trendDirection === 'declining') {
        report.recommendations.push({
          type: 'urgent',
          title: 'Address Declining Trend',
          message: 'Portfolio score is declining. Review recent changes and implement recommended improvements.',
          priority: 'high'
        });
      }

      if (forecast.confidence < 50) {
        report.recommendations.push({
          type: 'data',
          title: 'Increase Analysis Frequency',
          message: 'Low forecast confidence due to limited data. Perform more frequent analyses for better predictions.',
          priority: 'medium'
        });
      }
    }

    if (patterns.hasEnoughData && patterns.worstPerformingCategories.length > 0) {
      const worstCat = patterns.worstPerformingCategories[0];
      report.recommendations.push({
        type: 'improvement',
        title: `Focus on ${worstCat.category}`,
        message: `${worstCat.category} is the lowest performing category. Prioritize improvements in this area.`,
        priority: 'high'
      });
    }

    if (goalPrediction && goalPrediction.canPredict && !goalPrediction.goalAchieved) {
      if (goalPrediction.estimatedDays > 90) {
        report.recommendations.push({
          type: 'goal',
          title: 'Accelerate Goal Achievement',
          message: `Goal achievement is estimated at ${Math.ceil(goalPrediction.estimatedDays / 7)} weeks. Consider implementing quick wins to speed up progress.`,
          priority: 'medium'
        });
      }
    }

    return report;
  },

  async analyzePortfolio(url) {
    if (!this.validateUrl(url)) {
      throw new Error('Invalid portfolio URL');
    }

    try {
      const startTime = performance.now();
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: { 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const loadTime = performance.now() - startTime;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const title = doc.querySelector('title')?.textContent?.trim() || null;
      const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || null;
      const bodyText = (doc.body?.textContent || '').toLowerCase();
      
      const hasContactInfo = ['contact', 'email', 'mail', 'reach', 'get in touch'].some(k => bodyText.includes(k));
      const hasProjects = ['project', 'portfolio', 'work', 'case study', 'showcase'].some(k => bodyText.includes(k));
      const hasAbout = ['about', 'bio', 'biography', 'who am i', 'introduction'].some(k => bodyText.includes(k));
      const mobileResponsive = doc.querySelector('meta[name="viewport"]') !== null;

      // Enhanced analysis
      const seoAnalysis = this.analyzeSEO(doc, url);
      const accessibilityAnalysis = this.analyzeAccessibility(doc);
      const performanceAnalysis = this.analyzePerformance(url, response, html);
      const securityAnalysis = this.analyzeSecurity(url, response);
      const socialMediaAnalysis = this.analyzeSocialMedia(doc);
      const visualAnalysis = this.analyzeVisualDesign(doc, html, url);
      const contentAnalysis = this.analyzeContent(doc, bodyText, url);
      const multiPageAnalysis = await this.performMultiPageAnalysis(doc, url, html);
      
      // Prepare analysis object for benchmarking
      const analysisForBenchmarking = {
        overallScore: 0, // Will be calculated below
        seo: seoAnalysis,
        accessibility: accessibilityAnalysis,
        performance: performanceAnalysis,
        security: securityAnalysis,
        socialMedia: socialMediaAnalysis,
        visual: visualAnalysis,
        content: contentAnalysis
      };

      // Enhanced scoring
      let score = 50;
      if (title) score += 5;
      if (metaDesc) score += 5;
      if (hasContactInfo) score += 5;
      if (hasProjects) score += 5;
      if (hasAbout) score += 5;
      if (mobileResponsive) score += 5;

      // Add scores from enhanced analysis (weighted)
      const enhancedScore = Math.round(
        seoAnalysis.score * 0.12 +
        accessibilityAnalysis.score * 0.10 +
        performanceAnalysis.score * 0.10 +
        securityAnalysis.score * 0.18 +
        socialMediaAnalysis.score * 0.10 +
        visualAnalysis.score * 0.15 +
        contentAnalysis.score * 0.15 +
        (mobileResponsive ? 10 : 0)
      );

      // Combine basic and enhanced scores
      const overallScore = Math.min(Math.round((score + enhancedScore) / 2), 100);
      
      // Update analysis object with overall score for benchmarking
      analysisForBenchmarking.overallScore = overallScore;
      
      // Perform competitive benchmarking
      const competitiveAnalysis = this.performCompetitiveBenchmarking(analysisForBenchmarking, bodyText, doc);
      
      // Generate actionable recommendations
      const recommendations = this.generateActionableRecommendations(analysisForBenchmarking, competitiveAnalysis);
      
      // Get portfolio builder suggestions
      const portfolioBuilder = await this.getPortfolioBuilderSuggestions(analysisForBenchmarking, competitiveAnalysis.industry);

      // Combine all issues and strengths
      const allIssues = [
        ...seoAnalysis.issues,
        ...accessibilityAnalysis.issues,
        ...performanceAnalysis.issues,
        ...securityAnalysis.issues,
        ...socialMediaAnalysis.issues,
        ...visualAnalysis.issues,
        ...contentAnalysis.issues
      ];

      const allStrengths = [
        ...seoAnalysis.strengths,
        ...accessibilityAnalysis.strengths,
        ...performanceAnalysis.strengths,
        ...securityAnalysis.strengths,
        ...socialMediaAnalysis.strengths,
        ...visualAnalysis.strengths,
        ...contentAnalysis.strengths
      ];
      
      // Save analysis to history
      this.saveAnalysisHistory(url, {
        ...analysisForBenchmarking,
        overallScore,
        issues: allIssues,
        strengths: allStrengths,
        competitive: competitiveAnalysis
      });
      
      // Get progress tracking data
      const progress = this.getProgressSummary(url, {
        ...analysisForBenchmarking,
        overallScore,
        issues: allIssues,
        strengths: allStrengths,
        competitive: competitiveAnalysis
      });
      
      // Get industry-specific insights
      const industryInsights = this.getIndustrySpecificInsights({
        ...analysisForBenchmarking,
        overallScore,
        issues: allIssues,
        strengths: allStrengths,
        competitive: competitiveAnalysis,
        multiPage: multiPageAnalysis,
        doc: doc,
        bodyText: bodyText,
        designQuality: visualAnalysis.score,
        contentQuality: contentAnalysis.score,
        hasAboutSection: hasAbout,
        hasProjects: hasProjects,
        hasContactInfo: hasContactInfo,
        mobileResponsive: mobileResponsive
      }, competitiveAnalysis.industry);

      // Prepare final analysis object for export
      const finalAnalysis = {
        url,
        isAccessible: true,
        title,
        description: metaDesc,
        hasContactInfo,
        hasProjects,
        hasAboutSection: hasAbout,
        designQuality: visualAnalysis.score,
        contentQuality: contentAnalysis.score,
        uxScore: Math.round((accessibilityAnalysis.score + (visualAnalysis.details.layout?.score || 0)) / 2),
        mobileResponsive,
        overallScore,
        issues: allIssues,
        strengths: allStrengths,
        seo: seoAnalysis,
        accessibility: accessibilityAnalysis,
        performance: {
          ...performanceAnalysis,
          loadTime: Math.round(loadTime)
        },
        security: securityAnalysis,
        socialMedia: socialMediaAnalysis,
        visual: visualAnalysis,
        content: contentAnalysis,
        competitive: competitiveAnalysis,
        recommendations: recommendations,
        portfolioBuilder: portfolioBuilder,
        progress: progress,
        multiPage: multiPageAnalysis,
        industryInsights: industryInsights
      };

      // Generate shareable data
      const shareableData = this.generateShareableData(finalAnalysis);

      return {
        ...finalAnalysis,
        export: {
          available: true,
          formats: ['json', 'csv', 'text', 'html', 'checklist-json', 'checklist-csv', 'checklist-text'],
          shareable: shareableData
        }
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
          seo: null,
          accessibility: null,
          performance: null,
          security: null,
          socialMedia: null,
          visual: null,
          content: null,
          competitive: null,
          recommendations: null,
          portfolioBuilder: null,
          progress: null,
          multiPage: null,
          industryInsights: null,
          export: null
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


