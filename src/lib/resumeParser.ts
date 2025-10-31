/**
 * Resume Parser Utility
 * Extracts structured data from resume files using OpenAI
 */

export interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedIn: string;
    portfolio: string;
  };
  summary: string;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
  };
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
}

/**
 * Extract text from a file
 */
export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading file'));
    
    if (file.type === 'application/pdf') {
      // For PDF, read as array buffer and extract text
      reader.readAsArrayBuffer(file);
    } else {
      // For text-based files
      reader.readAsText(file);
    }
  });
}

/**
 * Parse resume using OpenAI
 */
export async function parseResumeWithAI(resumeText: string): Promise<ResumeData> {
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
${resumeText}

Return only valid JSON, no additional text:`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to parse resume');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // If no JSON found, try parsing the whole content
    return JSON.parse(content);
  } catch (error) {
    console.error('Error parsing resume with AI:', error);
    throw error;
  }
}

/**
 * Parse resume from uploaded file
 */
export async function parseResume(file: File): Promise<ResumeData> {
  try {
    // Extract text from file
    const resumeText = await extractTextFromFile(file);
    
    // Parse with AI
    const parsedData = await parseResumeWithAI(resumeText);
    
    // Save to localStorage
    const savedResumes = getSavedResumes();
    savedResumes[file.name] = parsedData;
    localStorage.setItem('parsed_resumes', JSON.stringify(savedResumes));
    
    return parsedData;
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
}

/**
 * Get saved resumes from localStorage
 */
export function getSavedResumes(): Record<string, ResumeData> {
  const saved = localStorage.getItem('parsed_resumes');
  return saved ? JSON.parse(saved) : {};
}

/**
 * Save resume data to localStorage
 */
export function saveResume(resumeName: string, data: ResumeData): void {
  const savedResumes = getSavedResumes();
  savedResumes[resumeName] = data;
  localStorage.setItem('parsed_resumes', JSON.stringify(savedResumes));
}

/**
 * Get a specific resume by name
 */
export function getResume(resumeName: string): ResumeData | null {
  const savedResumes = getSavedResumes();
  return savedResumes[resumeName] || null;
}

/**
 * Get the most recent resume
 */
export function getLatestResume(): ResumeData | null {
  const savedResumes = getSavedResumes();
  const resumeNames = Object.keys(savedResumes);
  
  if (resumeNames.length === 0) {
    return null;
  }
  
  // Return the most recently added resume
  return savedResumes[resumeNames[resumeNames.length - 1]];
}

/**
 * Clear all saved resumes
 */
export function clearAllResumes(): void {
  localStorage.removeItem('parsed_resumes');
}

