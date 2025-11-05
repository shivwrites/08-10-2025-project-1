/**
 * GitHub API Utility
 * Fetches and analyzes GitHub profile data using public GitHub API
 */

export interface GitHubProfile {
  username: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  location: string | null;
  company: string | null;
  blog: string | null;
  hireable: boolean | null;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  has_readme: boolean;
  has_wiki: boolean;
  archived: boolean;
  private: boolean;
}

export interface GitHubAnalysis {
  profile: GitHubProfile;
  repos: GitHubRepo[];
  totalStars: number;
  totalForks: number;
  languages: Record<string, number>;
  readmeQuality: number; // 0-100
  documentationScore: number; // 0-100
  activityScore: number; // 0-100
  overallScore: number; // 0-100
}

/**
 * Extract username from GitHub URL
 */
export function extractGitHubUsername(url: string): string | null {
  if (!url) return null;
  
  try {
    // Handle various GitHub URL formats
    const patterns = [
      /github\.com\/([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})/i,
      /^([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})$/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting GitHub username:', error);
    return null;
  }
}

/**
 * Validate GitHub URL format
 */
export function validateGitHubUrl(url: string): boolean {
  if (!url) return false;
  const username = extractGitHubUsername(url);
  return username !== null;
}

/**
 * Fetch GitHub user profile
 */
export async function getGitHubProfile(username: string): Promise<GitHubProfile> {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`GitHub user "${username}" not found`);
      }
      if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      username: data.login,
      name: data.name,
      bio: data.bio,
      avatar_url: data.avatar_url,
      public_repos: data.public_repos,
      followers: data.followers,
      following: data.following,
      created_at: data.created_at,
      location: data.location,
      company: data.company,
      blog: data.blog,
      hireable: data.hireable,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch GitHub profile');
  }
}

/**
 * Fetch user's repositories
 */
export async function getGitHubRepos(username: string, maxRepos: number = 30): Promise<GitHubRepo[]> {
  try {
    const repos: GitHubRepo[] = [];
    let page = 1;
    const perPage = 100;

    while (repos.length < maxRepos) {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please try again later.');
        }
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data: any[] = await response.json();
      
      if (data.length === 0) break;

      for (const repo of data) {
        if (repos.length >= maxRepos) break;
        
        // Check if repo has README
        const hasReadme = await checkRepoHasReadme(username, repo.name);
        
        repos.push({
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          html_url: repo.html_url,
          language: repo.language,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          open_issues_count: repo.open_issues_count,
          created_at: repo.created_at,
          updated_at: repo.updated_at,
          pushed_at: repo.pushed_at,
          has_readme: hasReadme,
          has_wiki: repo.has_wiki,
          archived: repo.archived,
          private: repo.private,
        });
      }

      if (data.length < perPage) break;
      page++;
    }

    return repos;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch GitHub repositories');
  }
}

/**
 * Check if repository has README
 */
async function checkRepoHasReadme(owner: string, repo: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Analyze GitHub profile comprehensively
 */
export async function analyzeGitHubProfile(username: string): Promise<GitHubAnalysis> {
  try {
    const profile = await getGitHubProfile(username);
    const repos = await getGitHubRepos(username);

    // Calculate metrics
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
    
    // Count languages
    const languages: Record<string, number> = {};
    repos.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });

    // Calculate README quality score (0-100)
    const reposWithReadme = repos.filter(r => r.has_readme && !r.archived).length;
    const totalPublicRepos = repos.filter(r => !r.private && !r.archived).length;
    const readmeQuality = totalPublicRepos > 0 
      ? Math.round((reposWithReadme / totalPublicRepos) * 100)
      : 0;

    // Documentation score based on README, wiki, and descriptions
    const reposWithDocs = repos.filter(r => 
      (r.has_readme || r.has_wiki) && r.description && !r.archived
    ).length;
    const documentationScore = totalPublicRepos > 0
      ? Math.round((reposWithDocs / totalPublicRepos) * 100)
      : 0;

    // Activity score based on recent updates
    const now = Date.now();
    const recentRepos = repos.filter(r => {
      const updated = new Date(r.pushed_at).getTime();
      const daysSinceUpdate = (now - updated) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate < 90; // Active if updated in last 90 days
    }).length;
    const activityScore = repos.length > 0
      ? Math.round((recentRepos / repos.length) * 100)
      : 0;

    // Overall score calculation (weighted)
    const overallScore = Math.round(
      readmeQuality * 0.3 +
      documentationScore * 0.3 +
      activityScore * 0.2 +
      (profile.bio ? 10 : 0) +
      (profile.location ? 5 : 0) +
      (profile.company ? 5 : 0) +
      Math.min(totalStars / 10, 15) + // Cap at 15 points
      Math.min(profile.followers / 10, 10) // Cap at 10 points
    );

    return {
      profile,
      repos,
      totalStars,
      totalForks,
      languages,
      readmeQuality,
      documentationScore,
      activityScore,
      overallScore: Math.min(overallScore, 100),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to analyze GitHub profile');
  }
}


