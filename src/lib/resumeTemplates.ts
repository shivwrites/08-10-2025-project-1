/**
 * Resume Templates System
 * Provides different professional resume layouts and styles
 */

// --- Types ---
export interface ResumeTemplate {
  id: string;
  name: string;
  category: 'classic' | 'modern' | 'creative' | 'minimal' | 'executive' | 'photo';
  description: string;
  preview: string; // Tailwind classes for preview thumbnail
  previewGradient?: string;
  supportsPhoto: boolean;
  layout: 'single-column' | 'two-column' | 'sidebar-left' | 'sidebar-right';
  accentPosition: 'top' | 'left' | 'none';
  styles: TemplateStyles;
}

export interface TemplateStyles {
  container: string;
  header: string;
  headerName: string;
  headerTitle: string;
  headerContact: string;
  photo?: string;
  sidebar?: string;
  mainContent: string;
  sectionTitle: string;
  sectionContent: string;
  skillsLayout: 'list' | 'grid' | 'tags' | 'bars';
  accentColor: string;
  fontFamily: string;
  fontSize: string;
}

// --- Template Definitions ---
export const resumeTemplates: ResumeTemplate[] = [
  // ===== CLASSIC TEMPLATES =====
  {
    id: 'classic-professional',
    name: 'Professional Classic',
    category: 'classic',
    description: 'Traditional single-column layout, perfect for corporate roles',
    preview: 'bg-white border-2 border-gray-300',
    supportsPhoto: false,
    layout: 'single-column',
    accentPosition: 'none',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white p-8',
      header: 'text-center border-b-2 border-gray-300 pb-4 mb-6',
      headerName: 'text-2xl font-bold text-gray-900 uppercase tracking-wide',
      headerTitle: 'text-lg text-gray-600 mt-1',
      headerContact: 'text-sm text-gray-500 mt-2 flex justify-center gap-4 flex-wrap',
      mainContent: '',
      sectionTitle: 'text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-3 mt-6',
      sectionContent: 'text-sm text-gray-700 leading-relaxed',
      skillsLayout: 'list',
      accentColor: '#374151',
      fontFamily: 'Georgia, serif',
      fontSize: '11pt',
    }
  },
  {
    id: 'classic-elegant',
    name: 'Elegant Traditional',
    category: 'classic',
    description: 'Refined design with subtle accents for executive positions',
    preview: 'bg-slate-50 border-l-4 border-slate-700',
    supportsPhoto: false,
    layout: 'single-column',
    accentPosition: 'left',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white p-8 border-l-4 border-slate-700',
      header: 'mb-6',
      headerName: 'text-3xl font-light text-slate-800 tracking-tight',
      headerTitle: 'text-lg text-slate-600 font-light mt-1',
      headerContact: 'text-xs text-slate-500 mt-3 flex gap-4',
      mainContent: '',
      sectionTitle: 'text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 mb-3 mt-8',
      sectionContent: 'text-sm text-slate-600 leading-relaxed',
      skillsLayout: 'tags',
      accentColor: '#334155',
      fontFamily: '"Cormorant Garamond", Georgia, serif',
      fontSize: '11pt',
    }
  },

  // ===== MODERN TEMPLATES =====
  {
    id: 'modern-tech',
    name: 'Tech Modern',
    category: 'modern',
    description: 'Clean, tech-focused design popular in Silicon Valley',
    preview: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    previewGradient: 'from-indigo-500 to-purple-600',
    supportsPhoto: false,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 -mx-8 -mt-8 mb-6',
      headerName: 'text-3xl font-bold tracking-tight',
      headerTitle: 'text-lg opacity-90 mt-1',
      headerContact: 'text-sm opacity-80 mt-3 flex gap-4 flex-wrap',
      mainContent: 'px-8',
      sectionTitle: 'text-sm font-bold uppercase tracking-wider text-indigo-600 border-b-2 border-indigo-200 pb-1 mb-3 mt-6',
      sectionContent: 'text-sm text-gray-700',
      skillsLayout: 'tags',
      accentColor: '#4F46E5',
      fontFamily: '"Inter", system-ui, sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'modern-minimalist',
    name: 'Clean Minimalist',
    category: 'minimal',
    description: 'Ultra-clean design with maximum white space',
    preview: 'bg-white border border-gray-200',
    supportsPhoto: false,
    layout: 'single-column',
    accentPosition: 'none',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white p-10',
      header: 'mb-10',
      headerName: 'text-4xl font-extralight text-gray-900 tracking-tight',
      headerTitle: 'text-base text-gray-400 mt-2 font-light',
      headerContact: 'text-xs text-gray-400 mt-4 flex gap-6',
      mainContent: '',
      sectionTitle: 'text-[10px] font-medium uppercase tracking-[0.3em] text-gray-400 mb-4 mt-10',
      sectionContent: 'text-sm text-gray-600 font-light leading-loose',
      skillsLayout: 'grid',
      accentColor: '#9CA3AF',
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
      fontSize: '10pt',
    }
  },

  // ===== TWO-COLUMN TEMPLATES =====
  {
    id: 'two-column-modern',
    name: 'Two Column Modern',
    category: 'modern',
    description: 'Efficient two-column layout for experienced professionals',
    preview: 'bg-gradient-to-r from-slate-800 via-slate-800 to-white',
    supportsPhoto: true,
    layout: 'sidebar-left',
    accentPosition: 'left',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white flex min-h-[297mm]',
      sidebar: 'w-1/3 bg-slate-800 text-white p-6',
      header: 'mb-6',
      headerName: 'text-xl font-bold tracking-tight',
      headerTitle: 'text-sm opacity-80 mt-1',
      headerContact: 'text-xs opacity-70 mt-3 space-y-1',
      photo: 'w-24 h-24 rounded-full mx-auto mb-4 border-2 border-white/30 object-cover',
      mainContent: 'flex-1 p-6',
      sectionTitle: 'text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 mt-6',
      sectionContent: 'text-sm',
      skillsLayout: 'bars',
      accentColor: '#1E293B',
      fontFamily: '"Poppins", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'sidebar-accent',
    name: 'Accent Sidebar',
    category: 'modern',
    description: 'Bold sidebar with accent color for creative fields',
    preview: 'bg-gradient-to-r from-emerald-600 via-emerald-600 to-white',
    supportsPhoto: true,
    layout: 'sidebar-left',
    accentPosition: 'left',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white flex min-h-[297mm]',
      sidebar: 'w-1/3 bg-gradient-to-b from-emerald-600 to-teal-700 text-white p-6',
      header: 'mb-6',
      headerName: 'text-xl font-bold',
      headerTitle: 'text-sm opacity-90 mt-1',
      headerContact: 'text-xs opacity-80 mt-3 space-y-1',
      photo: 'w-28 h-28 rounded-lg mx-auto mb-4 border-4 border-white/20 object-cover shadow-lg',
      mainContent: 'flex-1 p-6',
      sectionTitle: 'text-xs font-bold uppercase tracking-wider text-emerald-600 border-b border-emerald-200 pb-1 mb-2 mt-6',
      sectionContent: 'text-sm text-gray-700',
      skillsLayout: 'tags',
      accentColor: '#059669',
      fontFamily: '"Montserrat", sans-serif',
      fontSize: '10pt',
    }
  },

  // ===== CREATIVE TEMPLATES =====
  {
    id: 'creative-bold',
    name: 'Bold Creative',
    category: 'creative',
    description: 'Eye-catching design for designers and creatives',
    preview: 'bg-gradient-to-br from-rose-500 to-orange-400',
    previewGradient: 'from-rose-500 to-orange-400',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gradient-to-r from-rose-500 to-orange-400 text-white p-10 -mx-8 -mt-8 mb-8 relative',
      headerName: 'text-4xl font-black tracking-tight',
      headerTitle: 'text-xl font-light mt-2 opacity-90',
      headerContact: 'text-sm mt-4 flex gap-4 opacity-80',
      photo: 'absolute right-8 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-4 border-white object-cover shadow-xl',
      mainContent: 'px-8',
      sectionTitle: 'text-lg font-black uppercase text-rose-500 mb-3 mt-8',
      sectionContent: 'text-sm text-gray-600',
      skillsLayout: 'tags',
      accentColor: '#F43F5E',
      fontFamily: '"Outfit", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'creative-artistic',
    name: 'Artistic Flow',
    category: 'creative',
    description: 'Flowing design with artistic elements',
    preview: 'bg-gradient-to-br from-violet-500 to-fuchsia-500',
    previewGradient: 'from-violet-500 to-fuchsia-500',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-gradient-to-b from-violet-50 to-white p-8',
      header: 'text-center py-8 relative',
      headerName: 'text-4xl font-light bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent',
      headerTitle: 'text-lg text-violet-400 mt-2 font-light',
      headerContact: 'text-xs text-violet-300 mt-4 flex justify-center gap-6',
      photo: 'w-32 h-32 rounded-full mx-auto mb-4 border-4 border-violet-200 object-cover shadow-lg',
      mainContent: '',
      sectionTitle: 'text-sm font-medium text-violet-600 mb-3 mt-8 flex items-center gap-2 before:content-[""] before:flex-1 before:h-px before:bg-violet-200 after:content-[""] after:flex-1 after:h-px after:bg-violet-200',
      sectionContent: 'text-sm text-gray-600 text-center',
      skillsLayout: 'tags',
      accentColor: '#8B5CF6',
      fontFamily: '"Quicksand", sans-serif',
      fontSize: '10pt',
    }
  },

  // ===== EXECUTIVE TEMPLATES =====
  {
    id: 'executive-formal',
    name: 'Executive Formal',
    category: 'executive',
    description: 'Premium design for senior leadership positions',
    preview: 'bg-slate-900 border-t-4 border-amber-500',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white border-t-4 border-amber-500',
      header: 'bg-slate-900 text-white p-8 -mx-8 -mt-8 mb-8',
      headerName: 'text-3xl font-semibold tracking-wide',
      headerTitle: 'text-amber-400 mt-2 text-lg',
      headerContact: 'text-sm text-slate-300 mt-4 flex gap-6',
      photo: 'float-right w-28 h-28 rounded ml-4 border-2 border-amber-500 object-cover',
      mainContent: 'px-8',
      sectionTitle: 'text-sm font-semibold uppercase tracking-wider text-slate-800 border-b-2 border-amber-500 pb-1 mb-3 mt-8',
      sectionContent: 'text-sm text-slate-700 leading-relaxed',
      skillsLayout: 'grid',
      accentColor: '#F59E0B',
      fontFamily: '"Playfair Display", Georgia, serif',
      fontSize: '11pt',
    }
  },
  {
    id: 'executive-distinguished',
    name: 'Distinguished',
    category: 'executive',
    description: 'Sophisticated design for C-suite executives',
    preview: 'bg-gradient-to-b from-slate-800 to-slate-900',
    supportsPhoto: true,
    layout: 'sidebar-right',
    accentPosition: 'none',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white flex min-h-[297mm]',
      mainContent: 'flex-1 p-8',
      sidebar: 'w-1/4 bg-gradient-to-b from-slate-800 to-slate-900 text-white p-6',
      header: 'border-b border-slate-200 pb-6 mb-6',
      headerName: 'text-3xl font-light text-slate-800',
      headerTitle: 'text-slate-500 mt-2',
      headerContact: 'text-xs text-slate-400 mt-3 space-y-1',
      photo: 'w-full aspect-square object-cover mb-6 grayscale',
      sectionTitle: 'text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3 mt-8',
      sectionContent: 'text-sm text-slate-600 leading-relaxed',
      skillsLayout: 'list',
      accentColor: '#475569',
      fontFamily: '"Libre Baskerville", Georgia, serif',
      fontSize: '10pt',
    }
  },

  // ===== PHOTO TEMPLATES =====
  {
    id: 'photo-professional',
    name: 'Photo Professional',
    category: 'photo',
    description: 'Professional layout with prominent photo placement',
    preview: 'bg-gradient-to-r from-blue-100 to-blue-200 border-2 border-blue-300',
    supportsPhoto: true,
    layout: 'sidebar-left',
    accentPosition: 'left',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white flex min-h-[297mm]',
      sidebar: 'w-2/5 bg-gradient-to-b from-blue-50 to-slate-50 p-6 border-r border-blue-100',
      header: 'text-center mb-6',
      headerName: 'text-xl font-bold text-slate-800 mt-4',
      headerTitle: 'text-sm text-blue-600 mt-1',
      headerContact: 'text-xs text-slate-500 mt-4 space-y-2',
      photo: 'w-36 h-36 rounded-full mx-auto border-4 border-white shadow-xl object-cover',
      mainContent: 'flex-1 p-6',
      sectionTitle: 'text-sm font-bold uppercase text-blue-600 border-b border-blue-200 pb-1 mb-3 mt-6',
      sectionContent: 'text-sm text-slate-700',
      skillsLayout: 'bars',
      accentColor: '#2563EB',
      fontFamily: '"Source Sans Pro", sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'photo-modern',
    name: 'Photo Modern',
    category: 'photo',
    description: 'Contemporary design with circular photo accent',
    preview: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    previewGradient: 'from-cyan-500 to-blue-600',
    supportsPhoto: true,
    layout: 'single-column',
    accentPosition: 'top',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white',
      header: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-8 -mx-8 -mt-8 mb-8 flex items-center gap-6',
      headerName: 'text-2xl font-bold',
      headerTitle: 'text-cyan-100 mt-1',
      headerContact: 'text-xs text-cyan-100 mt-2 flex flex-wrap gap-3',
      photo: 'w-24 h-24 rounded-full border-4 border-white/30 object-cover shadow-lg flex-shrink-0',
      mainContent: 'px-8',
      sectionTitle: 'text-sm font-bold uppercase tracking-wide text-cyan-600 mb-3 mt-6',
      sectionContent: 'text-sm text-gray-700',
      skillsLayout: 'tags',
      accentColor: '#0891B2',
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '10pt',
    }
  },

  // ===== MINIMAL TEMPLATES =====
  {
    id: 'minimal-clean',
    name: 'Ultra Clean',
    category: 'minimal',
    description: 'Maximum simplicity, ATS-optimized design',
    preview: 'bg-white border border-gray-100',
    supportsPhoto: false,
    layout: 'single-column',
    accentPosition: 'none',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white p-8',
      header: 'border-b border-gray-100 pb-4 mb-6',
      headerName: 'text-2xl font-medium text-gray-800',
      headerTitle: 'text-gray-500 mt-1',
      headerContact: 'text-xs text-gray-400 mt-2 flex gap-4',
      mainContent: '',
      sectionTitle: 'text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2 mt-6',
      sectionContent: 'text-sm text-gray-600',
      skillsLayout: 'list',
      accentColor: '#6B7280',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '10pt',
    }
  },
  {
    id: 'minimal-swiss',
    name: 'Swiss Design',
    category: 'minimal',
    description: 'Helvetica-inspired clean typography',
    preview: 'bg-white border-l-8 border-black',
    supportsPhoto: false,
    layout: 'single-column',
    accentPosition: 'left',
    styles: {
      container: 'max-w-[210mm] mx-auto bg-white p-8 border-l-8 border-black',
      header: 'mb-8',
      headerName: 'text-5xl font-bold text-black tracking-tighter',
      headerTitle: 'text-xl text-gray-600 mt-2',
      headerContact: 'text-xs text-gray-500 mt-4 flex gap-6',
      mainContent: '',
      sectionTitle: 'text-xs font-bold uppercase tracking-widest text-black mb-4 mt-10',
      sectionContent: 'text-sm text-gray-700',
      skillsLayout: 'grid',
      accentColor: '#000000',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      fontSize: '10pt',
    }
  },
];

// --- Template Helper Functions ---

/**
 * Get all available templates
 */
export function getAllTemplates(): ResumeTemplate[] {
  return resumeTemplates;
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: ResumeTemplate['category']): ResumeTemplate[] {
  return resumeTemplates.filter(t => t.category === category);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): ResumeTemplate | undefined {
  return resumeTemplates.find(t => t.id === id);
}

/**
 * Get all template categories
 */
export function getTemplateCategories(): { id: ResumeTemplate['category']; label: string }[] {
  return [
    { id: 'classic', label: 'Classic' },
    { id: 'modern', label: 'Modern' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'creative', label: 'Creative' },
    { id: 'executive', label: 'Executive' },
    { id: 'photo', label: 'Photo' },
  ];
}

/**
 * Generate CSS variables for a template's colors
 */
export function getTemplateCSSVariables(template: ResumeTemplate): Record<string, string> {
  return {
    '--resume-accent': template.styles.accentColor,
    '--resume-font': template.styles.fontFamily,
    '--resume-font-size': template.styles.fontSize,
  };
}

/**
 * Generate inline styles for the resume container
 */
export function getTemplateContainerStyles(template: ResumeTemplate): React.CSSProperties {
  return {
    fontFamily: template.styles.fontFamily,
    fontSize: template.styles.fontSize,
  };
}

/**
 * Check if a template supports two-column layout
 */
export function isTwoColumnTemplate(template: ResumeTemplate): boolean {
  return template.layout === 'sidebar-left' || template.layout === 'sidebar-right' || template.layout === 'two-column';
}

/**
 * Sample resume data for previews
 */
export const sampleResumeData = {
  name: 'Alex Johnson',
  title: 'Senior Software Engineer',
  email: 'alex.johnson@email.com',
  phone: '(555) 123-4567',
  location: 'San Francisco, CA',
  linkedin: 'linkedin.com/in/alexjohnson',
  summary: 'Results-driven software engineer with 8+ years of experience building scalable web applications. Passionate about clean code, system design, and mentoring junior developers.',
  skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Python', 'PostgreSQL', 'Docker', 'Kubernetes'],
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'TechCorp Inc.',
      dates: '2021 - Present',
      achievements: [
        'Led development of microservices architecture serving 2M+ daily users',
        'Reduced deployment time by 70% through CI/CD pipeline optimization',
        'Mentored team of 5 junior developers',
      ]
    },
    {
      title: 'Software Engineer',
      company: 'StartupXYZ',
      dates: '2018 - 2021',
      achievements: [
        'Built core product features using React and Node.js',
        'Improved application performance by 45%',
      ]
    }
  ],
  education: {
    degree: 'B.S. Computer Science',
    school: 'University of California, Berkeley',
    year: '2018'
  }
};

/**
 * Generate preview HTML for a template
 */
export function generateTemplatePreviewHTML(template: ResumeTemplate, photoUrl?: string): string {
  const data = sampleResumeData;
  const isTwoColumn = isTwoColumnTemplate(template);
  
  const photoHtml = template.supportsPhoto && template.styles.photo
    ? `<img src="${photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'}" alt="Profile" class="${template.styles.photo}" />`
    : '';

  const headerHtml = `
    <div class="${template.styles.header}">
      ${template.layout === 'single-column' && template.supportsPhoto ? photoHtml : ''}
      <h1 class="${template.styles.headerName}">${data.name}</h1>
      <p class="${template.styles.headerTitle}">${data.title}</p>
      <div class="${template.styles.headerContact}">
        <span>${data.email}</span>
        <span>${data.phone}</span>
        <span>${data.location}</span>
      </div>
    </div>
  `;

  const skillsHtml = template.styles.skillsLayout === 'tags'
    ? `<div class="flex flex-wrap gap-2">${data.skills.map(s => `<span class="px-2 py-1 bg-gray-100 rounded text-xs">${s}</span>`).join('')}</div>`
    : template.styles.skillsLayout === 'bars'
    ? `<div class="space-y-2">${data.skills.slice(0, 5).map(s => `<div><span class="text-xs">${s}</span><div class="h-1 bg-white/30 rounded mt-1"><div class="h-full bg-white/80 rounded" style="width: ${70 + Math.random() * 30}%"></div></div></div>`).join('')}</div>`
    : template.styles.skillsLayout === 'grid'
    ? `<div class="grid grid-cols-2 gap-1">${data.skills.map(s => `<span class="text-xs">• ${s}</span>`).join('')}</div>`
    : `<ul class="space-y-1">${data.skills.map(s => `<li class="text-xs">• ${s}</li>`).join('')}</ul>`;

  const sidebarContent = isTwoColumn ? `
    <div class="${template.styles.sidebar}">
      ${photoHtml}
      ${headerHtml}
      <div class="mt-6">
        <h3 class="${template.styles.sectionTitle}" style="color: white; border-color: rgba(255,255,255,0.3);">Skills</h3>
        <div class="${template.styles.sectionContent}" style="color: rgba(255,255,255,0.9);">
          ${skillsHtml}
        </div>
      </div>
    </div>
  ` : '';

  const mainContent = `
    <div class="${template.styles.mainContent}">
      ${!isTwoColumn ? headerHtml : ''}
      
      <div>
        <h3 class="${template.styles.sectionTitle}">Professional Summary</h3>
        <p class="${template.styles.sectionContent}">${data.summary}</p>
      </div>

      ${!isTwoColumn ? `
      <div>
        <h3 class="${template.styles.sectionTitle}">Skills</h3>
        <div class="${template.styles.sectionContent}">
          ${skillsHtml}
        </div>
      </div>
      ` : ''}

      <div>
        <h3 class="${template.styles.sectionTitle}">Experience</h3>
        <div class="${template.styles.sectionContent}">
          ${data.experience.map(exp => `
            <div class="mb-4">
              <p class="font-medium">${exp.title}</p>
              <p class="text-xs opacity-70">${exp.company} | ${exp.dates}</p>
              <ul class="mt-2 space-y-1">
                ${exp.achievements.map(a => `<li>• ${a}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>

      <div>
        <h3 class="${template.styles.sectionTitle}">Education</h3>
        <div class="${template.styles.sectionContent}">
          <p class="font-medium">${data.education.degree}</p>
          <p class="text-xs opacity-70">${data.education.school} | ${data.education.year}</p>
        </div>
      </div>
    </div>
  `;

  return `
    <div class="${template.styles.container}" style="font-family: ${template.styles.fontFamily}; font-size: ${template.styles.fontSize};">
      ${template.layout === 'sidebar-right' ? mainContent + sidebarContent : sidebarContent + mainContent}
    </div>
  `;
}


