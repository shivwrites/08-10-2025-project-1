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

      return {
        url,
        isAccessible: true,
        title,
        description: metaDesc,
        hasContactInfo,
        hasProjects,
        hasAboutSection: hasAbout,
        designQuality: visualAnalysis.score, // Now using visual analysis score
        contentQuality: contentAnalysis.score, // Now using content analysis score
        uxScore: Math.round((accessibilityAnalysis.score + (visualAnalysis.details.layout?.score || 0)) / 2), // Combined accessibility and layout
        mobileResponsive,
        overallScore,
        issues: allIssues,
        strengths: allStrengths,
        // Enhanced analysis details
        seo: seoAnalysis,
        accessibility: accessibilityAnalysis,
        performance: {
          ...performanceAnalysis,
          loadTime: Math.round(loadTime)
        },
        security: securityAnalysis,
        socialMedia: socialMediaAnalysis,
        visual: visualAnalysis,
        content: contentAnalysis
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
          content: null
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


