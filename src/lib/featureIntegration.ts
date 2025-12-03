/**
 * Feature Integration Service
 * Handles cross-feature communication between Resume Studio, Job Tracker, 
 * Application Tailor, and LinkedIn
 */

// --- Types ---

export interface LinkedInProfileData {
  name: string;
  headline: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
    location?: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field?: string;
    startYear?: string;
    endYear?: string;
  }>;
  skills: string[];
  certifications?: Array<{
    name: string;
    issuer: string;
    date?: string;
  }>;
  languages?: Array<{
    language: string;
    proficiency: string;
  }>;
}

export interface JobDataForResume {
  id: number | string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  requirements?: string[];
  salary?: string;
  source?: string;
  url?: string;
}

export interface ResumeStudioAction {
  type: 'import-linkedin' | 'tailor-for-job' | 'from-application-tailor' | 'quick-create';
  data?: LinkedInProfileData | JobDataForResume | string;
  returnTo?: string;
}

// --- Storage Keys ---
const STORAGE_KEYS = {
  PENDING_ACTION: 'resume_studio_pending_action',
  LINKEDIN_PROFILE: 'linkedin_profile_data',
  TAILOR_JOB_DATA: 'resume_tailor_job_data',
  LAST_RESUME_ID: 'resume_studio_last_active',
};

// --- Integration Service ---

export const FeatureIntegration = {
  /**
   * Queue an action for Resume Studio to process when it loads
   */
  queueAction(action: ResumeStudioAction): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PENDING_ACTION, JSON.stringify(action));
    } catch (e) {
      console.error('Error queuing action:', e);
    }
  },

  /**
   * Get and clear any pending action for Resume Studio
   */
  getPendingAction(): ResumeStudioAction | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PENDING_ACTION);
      if (stored) {
        localStorage.removeItem(STORAGE_KEYS.PENDING_ACTION);
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error getting pending action:', e);
    }
    return null;
  },

  /**
   * Store LinkedIn profile data for import
   */
  storeLinkedInProfile(profile: LinkedInProfileData): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LINKEDIN_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Error storing LinkedIn profile:', e);
    }
  },

  /**
   * Get stored LinkedIn profile data
   */
  getLinkedInProfile(): LinkedInProfileData | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LINKEDIN_PROFILE);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Error getting LinkedIn profile:', e);
      return null;
    }
  },

  /**
   * Store job data for resume tailoring
   */
  storeJobForTailoring(job: JobDataForResume): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TAILOR_JOB_DATA, JSON.stringify(job));
    } catch (e) {
      console.error('Error storing job data:', e);
    }
  },

  /**
   * Get stored job data for tailoring
   */
  getJobForTailoring(): JobDataForResume | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TAILOR_JOB_DATA);
      if (stored) {
        localStorage.removeItem(STORAGE_KEYS.TAILOR_JOB_DATA);
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error getting job data:', e);
    }
    return null;
  },

  /**
   * Store the last active resume ID
   */
  setLastResumeId(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_RESUME_ID, id);
    } catch (e) {
      console.error('Error storing last resume ID:', e);
    }
  },

  /**
   * Get the last active resume ID
   */
  getLastResumeId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_RESUME_ID);
    } catch (e) {
      console.error('Error getting last resume ID:', e);
      return null;
    }
  },

  /**
   * Navigate to Resume Studio with a specific action
   */
  navigateToResumeStudio(navigate: (path: string) => void, action: ResumeStudioAction): void {
    this.queueAction(action);
    navigate('/dashboard/resume-studio');
  },

  /**
   * Navigate to Application Tailor with resume data
   */
  navigateToApplicationTailor(navigate: (path: string) => void, resumeContent: string, jobData?: JobDataForResume): void {
    try {
      // Store resume content for Application Tailor
      localStorage.setItem('application_tailor_resume', resumeContent);
      if (jobData) {
        localStorage.setItem('application_tailor_job', JSON.stringify(jobData));
      }
      navigate('/dashboard/application-tailor');
    } catch (e) {
      console.error('Error navigating to Application Tailor:', e);
    }
  },

  /**
   * Convert LinkedIn profile to resume HTML content
   */
  linkedInToResumeHTML(profile: LinkedInProfileData): string {
    const sections: string[] = [];

    // Heading
    sections.push(`
      <div class="resume-section" data-section-name="Heading">
        <p><b>${profile.name}</b></p>
        <p>${profile.headline}</p>
        <p>${[profile.email, profile.phone, profile.location].filter(Boolean).join(' | ')}</p>
      </div>
    `);

    // Summary
    if (profile.summary) {
      sections.push(`
        <div class="resume-section" data-section-name="Profile">
          <p><br></p>
          <p><b>PROFESSIONAL SUMMARY</b></p>
          <p>${profile.summary}</p>
        </div>
      `);
    }

    // Skills
    if (profile.skills && profile.skills.length > 0) {
      sections.push(`
        <div class="resume-section" data-section-name="Core Skills">
          <p><br></p>
          <p><b>CORE SKILLS</b></p>
          ${profile.skills.map(skill => `<p>• ${skill}</p>`).join('')}
        </div>
      `);
    }

    // Experience
    if (profile.experience && profile.experience.length > 0) {
      const expItems = profile.experience.map(exp => `
        <p>${exp.title} | ${exp.company} | ${exp.startDate} - ${exp.endDate || 'Present'}</p>
        ${exp.description ? `<p>• ${exp.description}</p>` : ''}
      `).join('<p><br></p>');

      sections.push(`
        <div class="resume-section" data-section-name="Experience">
          <p><br></p>
          <p><b>EXPERIENCE</b></p>
          ${expItems}
        </div>
      `);
    }

    // Education
    if (profile.education && profile.education.length > 0) {
      const eduItems = profile.education.map(edu => `
        <p>${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</p>
        <p>${edu.school}${edu.endYear ? ` | ${edu.endYear}` : ''}</p>
      `).join('<p><br></p>');

      sections.push(`
        <div class="resume-section" data-section-name="Education">
          <p><br></p>
          <p><b>EDUCATION</b></p>
          ${eduItems}
        </div>
      `);
    }

    // Certifications
    if (profile.certifications && profile.certifications.length > 0) {
      sections.push(`
        <div class="resume-section" data-section-name="Certifications">
          <p><br></p>
          <p><b>CERTIFICATIONS</b></p>
          ${profile.certifications.map(cert => `<p>• ${cert.name} - ${cert.issuer}${cert.date ? ` (${cert.date})` : ''}</p>`).join('')}
        </div>
      `);
    }

    // Languages
    if (profile.languages && profile.languages.length > 0) {
      sections.push(`
        <div class="resume-section" data-section-name="Languages">
          <p><br></p>
          <p><b>LANGUAGES</b></p>
          ${profile.languages.map(lang => `<p>• ${lang.language} (${lang.proficiency})</p>`).join('')}
        </div>
      `);
    }

    return sections.join('');
  },

  /**
   * Create a tailored resume title based on job
   */
  createTailoredResumeTitle(job: JobDataForResume): string {
    return `${job.title} at ${job.company}`.substring(0, 50);
  },

  /**
   * Get tracked jobs from Job Tracker storage
   */
  getTrackedJobs(): JobDataForResume[] {
    try {
      const stored = localStorage.getItem('tracked_jobs');
      if (stored) {
        const jobs = JSON.parse(stored);
        return jobs.map((job: any) => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description,
          salary: job.salary,
          source: job.source,
          url: job.url,
        }));
      }
    } catch (e) {
      console.error('Error getting tracked jobs:', e);
    }
    return [];
  },

  /**
   * Get resumes from Resume Studio storage
   */
  getResumes(): Array<{ id: string; title: string; type: string; atsScore: number }> {
    try {
      const stored = localStorage.getItem('smart_resume_studio_resumes');
      if (stored) {
        const resumes = JSON.parse(stored);
        return resumes.map((r: any) => ({
          id: r.id,
          title: r.title,
          type: r.type,
          atsScore: r.atsScore,
        }));
      }
    } catch (e) {
      console.error('Error getting resumes:', e);
    }
    return [];
  },

  /**
   * Create a mock LinkedIn profile for testing (since real LinkedIn API requires approval)
   */
  createMockLinkedInProfile(): LinkedInProfileData {
    return {
      name: 'Sarah Chen',
      headline: 'Senior Product Manager | B2B SaaS | Growth Strategy',
      email: 'sarah.chen@email.com',
      phone: '(555) 987-6543',
      location: 'New York, NY',
      summary: 'Strategic product leader with 7+ years driving B2B SaaS growth from $0 to $50M ARR. Expert in data-driven decision making, cross-functional leadership, and agile methodologies. Passionate about building products that solve real customer problems.',
      experience: [
        {
          title: 'Senior Product Manager',
          company: 'TechScale Inc.',
          startDate: '2021',
          endDate: 'Present',
          description: 'Lead product strategy for enterprise platform serving 500+ B2B customers. Drove 40% increase in user engagement through data-driven feature prioritization.',
          location: 'New York, NY',
        },
        {
          title: 'Product Manager',
          company: 'GrowthLabs',
          startDate: '2018',
          endDate: '2021',
          description: 'Managed end-to-end product lifecycle for analytics dashboard. Launched MVP that achieved 10K users in first quarter.',
          location: 'San Francisco, CA',
        },
        {
          title: 'Associate Product Manager',
          company: 'StartupXYZ',
          startDate: '2016',
          endDate: '2018',
          description: 'Supported product roadmap development and conducted user research for mobile app features.',
          location: 'Boston, MA',
        },
      ],
      education: [
        {
          school: 'Stanford University',
          degree: 'MBA',
          field: 'Business Administration',
          startYear: '2014',
          endYear: '2016',
        },
        {
          school: 'MIT',
          degree: 'B.S.',
          field: 'Computer Science',
          startYear: '2010',
          endYear: '2014',
        },
      ],
      skills: [
        'Product Strategy',
        'Agile/Scrum',
        'Data Analysis',
        'SQL',
        'User Research',
        'A/B Testing',
        'Roadmap Planning',
        'Stakeholder Management',
        'JIRA',
        'Figma',
      ],
      certifications: [
        { name: 'Certified Scrum Product Owner (CSPO)', issuer: 'Scrum Alliance', date: '2020' },
        { name: 'Google Analytics Certification', issuer: 'Google', date: '2019' },
      ],
      languages: [
        { language: 'English', proficiency: 'Native' },
        { language: 'Mandarin', proficiency: 'Fluent' },
        { language: 'Spanish', proficiency: 'Conversational' },
      ],
    };
  },
};

export default FeatureIntegration;


