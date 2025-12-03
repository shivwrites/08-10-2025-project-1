/**
 * Resume Export Utilities
 * Provides multiple export formats: PDF, DOCX, HTML, TXT, and shareable links
 */

// --- Types ---
export interface ExportOptions {
  title: string;
  content: string;
  fontFamily?: string;
  fontSize?: number;
  lineSpacing?: number;
  margins?: { top: number; right: number; bottom: number; left: number };
  accentColor?: string;
}

export interface ShareableLinkData {
  id: string;
  title: string;
  content: string;
  templateId?: string;
  createdAt: string;
  expiresAt?: string;
}

// --- Storage Keys ---
const STORAGE_KEYS = {
  SHARED_RESUMES: 'shared_resumes',
};

// --- Helper Functions ---

/**
 * Strip HTML tags and convert to plain text
 */
function htmlToPlainText(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  
  // Replace <br> and block elements with newlines
  const text = div.innerHTML
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<[^>]+>/g, '');
  
  // Clean up extra whitespace
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

/**
 * Generate a unique ID for shareable links
 */
function generateShareId(): string {
  return `resume_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Compress string using base64 (for URL-safe sharing)
 */
function compressForUrl(text: string): string {
  try {
    return btoa(encodeURIComponent(text));
  } catch (e) {
    console.error('Error compressing text:', e);
    return '';
  }
}

/**
 * Decompress string from URL format
 */
export function decompressFromUrl(compressed: string): string {
  try {
    return decodeURIComponent(atob(compressed));
  } catch (e) {
    console.error('Error decompressing text:', e);
    return '';
  }
}

// --- Export Functions ---

/**
 * Export resume as PDF using browser print
 */
export async function exportToPDF(options: ExportOptions): Promise<boolean> {
  const {
    title,
    content,
    fontFamily = 'Inter, system-ui, sans-serif',
    fontSize = 11,
    lineSpacing = 1.4,
    margins = { top: 20, right: 20, bottom: 20, left: 20 },
    accentColor = '#3B82F6'
  } = options;

  try {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      throw new Error('Please allow popups to generate PDF');
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          @page {
            size: A4;
            margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
          }
          
          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: ${fontFamily};
            font-size: ${fontSize}pt;
            line-height: ${lineSpacing};
            color: #1f2937;
            background: white;
          }
          
          .resume-content {
            max-width: 100%;
          }
          
          p {
            margin-bottom: 0.5em;
          }
          
          b, strong {
            color: ${accentColor};
            font-weight: 600;
          }
          
          .resume-section {
            margin-bottom: 1em;
          }
          
          ul, ol {
            margin-left: 1.5em;
            margin-bottom: 0.5em;
          }
          
          li {
            margin-bottom: 0.25em;
          }
        </style>
      </head>
      <body>
        <div class="resume-content">
          ${content}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * Export resume as HTML file
 */
export function exportToHTML(options: ExportOptions): void {
  const {
    title,
    content,
    fontFamily = 'Inter, system-ui, sans-serif',
    fontSize = 11,
    lineSpacing = 1.4,
    accentColor = '#3B82F6'
  } = options;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: ${fontFamily};
      font-size: ${fontSize}pt;
      line-height: ${lineSpacing};
      color: #1f2937;
      background: #f8fafc;
      padding: 40px;
    }
    .resume-container {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      padding: 40px;
    }
    p { margin-bottom: 0.5em; }
    b, strong { color: ${accentColor}; font-weight: 600; }
    .resume-section { margin-bottom: 1em; }
    ul, ol { margin-left: 1.5em; margin-bottom: 0.5em; }
    li { margin-bottom: 0.25em; }
    @media print {
      body { background: white; padding: 0; }
      .resume-container { box-shadow: none; padding: 20mm; }
    }
  </style>
</head>
<body>
  <div class="resume-container">
    ${content}
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(title)}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export resume as plain text file
 */
export function exportToTXT(options: ExportOptions): void {
  const { title, content } = options;
  
  const plainText = htmlToPlainText(content);
  
  const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(title)}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export resume as DOCX-compatible RTF file
 * Note: This creates an RTF file that can be opened in Word
 */
export function exportToRTF(options: ExportOptions): void {
  const { title, content, fontFamily = 'Arial' } = options;
  
  // Convert HTML to plain text with basic formatting
  const plainText = htmlToPlainText(content);
  
  // Create simple RTF content
  const rtfContent = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 ${fontFamily};}}
{\\colortbl;\\red0\\green0\\blue0;\\red59\\green130\\blue246;}
\\viewkind4\\uc1\\pard\\f0\\fs22
${plainText
  .split('\n')
  .map(line => {
    // Make lines that look like headings bold
    if (line.match(/^[A-Z\s]+$/) && line.length > 2) {
      return `\\b ${line}\\b0\\par`;
    }
    return `${line}\\par`;
  })
  .join('\n')}
}`;

  const blob = new Blob([rtfContent], { type: 'application/rtf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(title)}.rtf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export resume as JSON (for backup/import)
 */
export function exportToJSON(resume: {
  title: string;
  content: string;
  templateId?: string;
  atsScore?: number;
  photoUrl?: string;
}): void {
  const exportData = {
    ...resume,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(resume.title)}_backup.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// --- Shareable Links ---

/**
 * Create a shareable link for a resume
 */
export function createShareableLink(resume: {
  title: string;
  content: string;
  templateId?: string;
}): { id: string; url: string } {
  const id = generateShareId();
  
  const shareData: ShareableLinkData = {
    id,
    title: resume.title,
    content: resume.content,
    templateId: resume.templateId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
  };

  // Store in localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SHARED_RESUMES);
    const sharedResumes: ShareableLinkData[] = stored ? JSON.parse(stored) : [];
    sharedResumes.push(shareData);
    localStorage.setItem(STORAGE_KEYS.SHARED_RESUMES, JSON.stringify(sharedResumes));
  } catch (e) {
    console.error('Error storing shareable link:', e);
  }

  // Generate URL with compressed data as fallback
  const compressedData = compressForUrl(JSON.stringify({
    t: resume.title,
    c: resume.content.substring(0, 5000), // Limit size for URL
  }));

  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/dashboard/resume-studio?share=${id}`;
  
  return { id, url: shareUrl };
}

/**
 * Get a shared resume by ID
 */
export function getSharedResume(id: string): ShareableLinkData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SHARED_RESUMES);
    if (!stored) return null;
    
    const sharedResumes: ShareableLinkData[] = JSON.parse(stored);
    const resume = sharedResumes.find(r => r.id === id);
    
    if (resume && resume.expiresAt) {
      // Check if expired
      if (new Date(resume.expiresAt) < new Date()) {
        // Remove expired link
        const filtered = sharedResumes.filter(r => r.id !== id);
        localStorage.setItem(STORAGE_KEYS.SHARED_RESUMES, JSON.stringify(filtered));
        return null;
      }
    }
    
    return resume || null;
  } catch (e) {
    console.error('Error getting shared resume:', e);
    return null;
  }
}

/**
 * Delete a shared resume link
 */
export function deleteShareableLink(id: string): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SHARED_RESUMES);
    if (!stored) return false;
    
    const sharedResumes: ShareableLinkData[] = JSON.parse(stored);
    const filtered = sharedResumes.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.SHARED_RESUMES, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Error deleting shareable link:', e);
    return false;
  }
}

/**
 * Get all shareable links for current user
 */
export function getAllShareableLinks(): ShareableLinkData[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SHARED_RESUMES);
    if (!stored) return [];
    
    const sharedResumes: ShareableLinkData[] = JSON.parse(stored);
    const now = new Date();
    
    // Filter out expired links
    return sharedResumes.filter(r => {
      if (r.expiresAt && new Date(r.expiresAt) < now) {
        return false;
      }
      return true;
    });
  } catch (e) {
    console.error('Error getting shareable links:', e);
    return [];
  }
}

// --- QR Code ---

/**
 * Generate QR code URL using public API
 */
export function generateQRCodeUrl(text: string, size: number = 200): string {
  const encodedText = encodeURIComponent(text);
  // Using QR Server API (free, no API key required)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}&format=svg`;
}

/**
 * Generate QR code as base64 data URL
 */
export async function generateQRCodeDataUrl(text: string, size: number = 200): Promise<string> {
  try {
    const response = await fetch(generateQRCodeUrl(text, size));
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('Error generating QR code:', e);
    throw e;
  }
}

// --- Utility Functions ---

/**
 * Sanitize filename for safe download
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9\s\-_.]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (fallbackError) {
      console.error('Error copying to clipboard:', fallbackError);
      return false;
    }
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}


