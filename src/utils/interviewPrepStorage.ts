// Interview Prep Kit Storage Utilities

export interface InterviewQuestion {
  id: number;
  question: string;
  category: 'General' | 'Technical' | 'Behavioral' | 'Role-Specific';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  sampleAnswer?: string;
}

export interface JobData {
  jobId?: string;
  jobTitle?: string;
  title?: string;
  company: string;
  location?: string;
  jobDescription?: string;
  matchScore?: number;
  applicationDate?: string;
  interviewDate?: string;
  source?: string;
  salary?: string;
}

export interface PrepData {
  userAnswers?: Record<string, { answer: string; savedAt: string; version: number }>;
  questionProgress?: Record<string, { reviewed?: boolean }>;
  customQuestions?: InterviewQuestion[];
  lastUpdated?: string;
  questionsReviewed?: number;
  totalQuestions?: number;
  practiceSessions?: number;
}

export interface PracticeSession {
  id?: string;
  jobId?: string;
  jobTitle?: string;
  company?: string;
  date: string;
  answers: { question: string; answer: string }[];
  duration: number;
}

export interface StoryItem {
  id: string;
  title: string;
  source: 'resume' | 'manual';
  category: string;
  company?: string;
  position?: string;
  date?: string;
  achievement?: string;
  description?: string;
  technologies?: string[];
  starFormat?: {
    Situation: string;
    Task: string;
    Action: string;
    Result: string;
  };
}

export interface AnswerFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
  feedback: string;
}

export interface CompanyResearch {
  culture: string;
  values: string[];
  tips: string[];
}

export const InterviewPrepStorage = {
  getStorageKey(jobId?: string) {
    return `interview_prep_${jobId || 'default'}`;
  },

  savePrepData(jobId: string | undefined, data: PrepData) {
    try {
      const key = this.getStorageKey(jobId);
      localStorage.setItem(key, JSON.stringify({
        ...data,
        lastUpdated: new Date().toISOString()
      }));
      return true;
    } catch (e) {
      console.error('Error saving prep data:', e);
      return false;
    }
  },

  loadPrepData(jobId: string | undefined): PrepData | null {
    try {
      const key = this.getStorageKey(jobId);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error loading prep data:', e);
      return null;
    }
  },

  saveSession(session: PracticeSession) {
    try {
      const sessions = this.getAllSessions();
      sessions.push({ ...session, id: Date.now().toString() });
      localStorage.setItem('interview_prep_sessions', JSON.stringify(sessions));
      return true;
    } catch (e) {
      console.error('Error saving session:', e);
      return false;
    }
  },

  getAllSessions(): PracticeSession[] {
    try {
      const data = localStorage.getItem('interview_prep_sessions');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  getResumeData() {
    try {
      const parsedResume = localStorage.getItem('parsed_resume_data');
      return parsedResume ? JSON.parse(parsedResume) : null;
    } catch (e) {
      return null;
    }
  },

  saveAnxietyData(jobId: string | undefined, data: { level: number; fears: string[]; assessmentAnswers: Record<string, number>; date: string }) {
    try {
      const key = `interview_prep_anxiety_${jobId || 'default'}`;
      localStorage.setItem(key, JSON.stringify({
        ...data,
        lastUpdated: new Date().toISOString()
      }));
      return true;
    } catch (e) {
      console.error('Error saving anxiety data:', e);
      return false;
    }
  },

  loadAnxietyData(jobId: string | undefined) {
    try {
      const key = `interview_prep_anxiety_${jobId || 'default'}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error loading anxiety data:', e);
      return null;
    }
  },

  saveStoryBank(jobId: string | undefined, stories: StoryItem[]) {
    try {
      const key = `interview_prep_stories_${jobId || 'default'}`;
      localStorage.setItem(key, JSON.stringify({
        stories: stories || [],
        lastUpdated: new Date().toISOString()
      }));
      return true;
    } catch (e) {
      console.error('Error saving story bank:', e);
      return false;
    }
  },

  loadStoryBank(jobId: string | undefined): StoryItem[] {
    try {
      const key = `interview_prep_stories_${jobId || 'default'}`;
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.stories || [];
      }
      return [];
    } catch (e) {
      console.error('Error loading story bank:', e);
      return [];
    }
  },

  saveConfidenceScore(jobId: string | undefined, score: number, metadata: Record<string, unknown> = {}) {
    try {
      const key = `interview_prep_confidence_${jobId || 'default'}`;
      const existing = this.loadConfidenceHistory(jobId);
      const history = existing.history || [];
      history.push({
        score,
        date: new Date().toISOString(),
        ...metadata
      });
      localStorage.setItem(key, JSON.stringify({
        currentScore: score,
        history: history.slice(-30),
        lastUpdated: new Date().toISOString()
      }));
      return true;
    } catch (e) {
      console.error('Error saving confidence score:', e);
      return false;
    }
  },

  loadConfidenceHistory(jobId: string | undefined): { currentScore: number; history: unknown[] } {
    try {
      const key = `interview_prep_confidence_${jobId || 'default'}`;
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          currentScore: parsed.currentScore || 50,
          history: parsed.history || []
        };
      }
      return { currentScore: 50, history: [] };
    } catch (e) {
      console.error('Error loading confidence history:', e);
      return { currentScore: 50, history: [] };
    }
  },

  buildStoryBankFromResume(): StoryItem[] {
    try {
      const resumeData = this.getResumeData();
      if (!resumeData) {
        return [];
      }

      const stories: StoryItem[] = [];
      let storyId = 1;

      // Extract stories from work experience
      if (resumeData.experience && Array.isArray(resumeData.experience)) {
        resumeData.experience.forEach((exp: { company?: string; position?: string; achievements?: string[]; description?: string; startDate?: string; endDate?: string }) => {
          if (exp.achievements && Array.isArray(exp.achievements)) {
            exp.achievements.forEach((achievement: string) => {
              stories.push({
                id: `story_${storyId++}`,
                title: `${achievement} at ${exp.company || 'Previous Role'}`,
                source: 'resume',
                category: 'work_experience',
                company: exp.company || '',
                position: exp.position || '',
                date: exp.endDate || exp.startDate || '',
                achievement: achievement,
                description: exp.description || '',
                starFormat: {
                  Situation: `While working as ${exp.position || 'an employee'} at ${exp.company || 'my previous company'}`,
                  Task: achievement,
                  Action: exp.description || 'Took initiative and executed effectively',
                  Result: achievement
                }
              });
            });
          }

          if (exp.description || exp.position) {
            stories.push({
              id: `story_${storyId++}`,
              title: `${exp.position || 'Role'} at ${exp.company || 'Previous Company'}`,
              source: 'resume',
              category: 'work_experience',
              company: exp.company || '',
              position: exp.position || '',
              date: `${exp.startDate || ''} - ${exp.endDate || 'Present'}`,
              achievement: exp.achievements?.[0] || exp.description || '',
              description: exp.description || '',
              starFormat: {
                Situation: `In my role as ${exp.position || 'an employee'} at ${exp.company || 'my previous company'}`,
                Task: `My responsibilities included ${exp.description || 'various duties'}`,
                Action: exp.achievements?.[0] || 'I executed my responsibilities effectively',
                Result: exp.achievements?.[0] || 'Achieved positive results'
              }
            });
          }
        });
      }

      // Extract stories from projects
      if (resumeData.projects && Array.isArray(resumeData.projects)) {
        resumeData.projects.forEach((project: { name?: string; description?: string; technologies?: string[] }) => {
          stories.push({
            id: `story_${storyId++}`,
            title: project.name || 'Project',
            source: 'resume',
            category: 'project',
            company: '',
            position: '',
            date: '',
            achievement: project.description || '',
            description: project.description || '',
            technologies: project.technologies || [],
            starFormat: {
              Situation: `While working on the ${project.name || 'project'}`,
              Task: `The goal was to ${project.description || 'deliver a successful project'}`,
              Action: `I utilized ${(project.technologies || []).join(', ') || 'various technologies'} to build the solution`,
              Result: project.description || 'Successfully completed the project'
            }
          });
        });
      }

      return stories;
    } catch (e) {
      console.error('Error building story bank from resume:', e);
      return [];
    }
  }
};

// Generate questions based on role
export const generateQuestionsForRole = (jobTitle: string, company: string): InterviewQuestion[] => {
  const commonQuestions: InterviewQuestion[] = [
    { question: "Tell me about yourself.", category: "General", difficulty: "Easy", id: 1 },
    { question: `Why do you want to work at ${company}?`, category: "General", difficulty: "Medium", id: 2 },
    { question: `Why are you interested in this ${jobTitle} role?`, category: "General", difficulty: "Medium", id: 3 },
    { question: "What are your greatest strengths?", category: "General", difficulty: "Easy", id: 4 },
    { question: "What is your greatest weakness?", category: "General", difficulty: "Medium", id: 5 },
    { question: "Where do you see yourself in 5 years?", category: "General", difficulty: "Medium", id: 6 },
    { question: "Why should we hire you?", category: "General", difficulty: "Medium", id: 7 },
    { question: "How do you handle stress and pressure?", category: "Behavioral", difficulty: "Medium", id: 8 },
    { question: "Tell me about a challenging project you worked on.", category: "Behavioral", difficulty: "Hard", id: 9 },
    { question: "What questions do you have for us?", category: "General", difficulty: "Easy", id: 10 }
  ];

  const roleSpecific: InterviewQuestion[] = [];
  const titleLower = jobTitle.toLowerCase();

  if (titleLower.includes('engineer') || titleLower.includes('developer') || titleLower.includes('programmer')) {
    roleSpecific.push(
      { question: "Walk me through your technical background.", category: "Technical", difficulty: "Medium", id: 11 },
      { question: "Describe a complex technical problem you solved.", category: "Technical", difficulty: "Hard", id: 12 },
      { question: "How do you stay updated with new technologies?", category: "Technical", difficulty: "Easy", id: 13 },
      { question: "Explain a time when you had to learn a new technology quickly.", category: "Technical", difficulty: "Hard", id: 14 }
    );
  } else if (titleLower.includes('manager') || titleLower.includes('lead')) {
    roleSpecific.push(
      { question: "Describe your management style.", category: "Role-Specific", difficulty: "Medium", id: 11 },
      { question: "How do you handle conflict within your team?", category: "Role-Specific", difficulty: "Hard", id: 12 },
      { question: "Tell me about a time you had to make a difficult decision.", category: "Behavioral", difficulty: "Hard", id: 13 },
      { question: "How do you motivate your team members?", category: "Role-Specific", difficulty: "Medium", id: 14 }
    );
  } else if (titleLower.includes('designer')) {
    roleSpecific.push(
      { question: "Walk me through your design process.", category: "Technical", difficulty: "Medium", id: 11 },
      { question: "How do you approach user research?", category: "Technical", difficulty: "Medium", id: 12 },
      { question: "Tell me about a design challenge you overcame.", category: "Behavioral", difficulty: "Hard", id: 13 },
      { question: "What design tools do you prefer and why?", category: "Technical", difficulty: "Easy", id: 14 }
    );
  } else if (titleLower.includes('analyst') || titleLower.includes('data')) {
    roleSpecific.push(
      { question: "How do you approach data analysis?", category: "Technical", difficulty: "Medium", id: 11 },
      { question: "Describe a time when your analysis led to a significant insight.", category: "Behavioral", difficulty: "Hard", id: 12 },
      { question: "What data visualization tools are you familiar with?", category: "Technical", difficulty: "Easy", id: 13 },
      { question: "How do you ensure data accuracy in your work?", category: "Technical", difficulty: "Medium", id: 14 }
    );
  } else {
    roleSpecific.push(
      { question: `What skills make you a good fit for this ${jobTitle} role?`, category: "Role-Specific", difficulty: "Medium", id: 11 },
      { question: `Describe a relevant project or experience for this ${jobTitle} position.`, category: "Role-Specific", difficulty: "Hard", id: 12 },
      { question: "How do you approach learning new skills required for a role?", category: "Behavioral", difficulty: "Medium", id: 13 },
      { question: `What interests you most about working as a ${jobTitle}?`, category: "Role-Specific", difficulty: "Easy", id: 14 }
    );
  }

  return [...commonQuestions, ...roleSpecific];
};

// Prioritize questions based on context
export const prioritizeQuestions = (
  questions: InterviewQuestion[],
  job: JobData | null,
  interviewDate?: string
): Record<number, 'Critical' | 'High' | 'Medium' | 'Low'> => {
  if (!questions || !Array.isArray(questions)) return {};

  const priorities: Record<number, 'Critical' | 'High' | 'Medium' | 'Low'> = {};
  const now = new Date();
  const interview = interviewDate ? new Date(interviewDate) : null;
  const daysUntilInterview = interview ? Math.ceil((interview.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

  questions.forEach((q) => {
    let priority: 'Critical' | 'High' | 'Medium' | 'Low' = 'Medium';
    const questionLower = q.question.toLowerCase();

    if (questionLower.includes('tell me about yourself') || questionLower === 'tell me about yourself.') {
      priority = 'Critical';
    } else if (q.category === 'Behavioral' ||
               questionLower.includes('tell me about a time') ||
               questionLower.includes('describe a time') ||
               questionLower.includes('give me an example')) {
      priority = 'High';
    } else if ((questionLower.includes((job?.company || '').toLowerCase()) ||
               questionLower.includes('why do you want to work')) &&
               daysUntilInterview !== null && daysUntilInterview <= 7) {
      priority = 'High';
    } else if (questionLower.includes('weakness') || questionLower.includes('greatest weakness')) {
      priority = 'High';
    } else if (q.category === 'Role-Specific' || q.category === 'Technical') {
      priority = job?.matchScore && job.matchScore >= 80 ? 'High' : 'Medium';
    } else if (q.difficulty === 'Easy' && q.category === 'General') {
      priority = 'Low';
    }

    priorities[q.id] = priority;
  });

  return priorities;
};

