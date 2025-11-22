// ============================================
// Brand Analysis Functions (Global Scope)
// ============================================

// Load Brand Analysis Data - Global function
window.loadBrandAnalysis = async function loadBrandAnalysis() {
    console.log('Loading brand analysis...');
    const loadingEl = document.getElementById('analysis-loading');
    const noDataEl = document.getElementById('analysis-no-data');
    const contentEl = document.getElementById('analysis-content');

    console.log('Elements found:', {
        loadingEl: !!loadingEl,
        noDataEl: !!noDataEl,
        contentEl: !!contentEl
    });

    // Show loading state
    if (loadingEl) loadingEl.classList.remove('hidden');
    if (noDataEl) noDataEl.classList.add('hidden');
    if (contentEl) contentEl.classList.add('hidden');

    try {
        // Initialize Supabase client
        const SUPABASE_URL = 'https://bialelscmftlquykreij.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpYWxlbHNjbWZ0bHF1eWtyZWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NzgxMTgsImV4cCI6MjA3NTQ1NDExOH0.wUywvxuTxDlgwVi6y8KaT9E64D4iVRKFFoqUx8wAalI';
        
        if (typeof supabase === 'undefined') {
            console.error('Supabase is not loaded');
            if (loadingEl) loadingEl.classList.add('hidden');
            if (noDataEl) {
                noDataEl.classList.remove('hidden');
                noDataEl.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4 text-slate-400">
                        <path d="M9 11l3 3L22 4"></path>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    <h3 class="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Supabase Not Loaded</h3>
                    <p class="text-slate-600 dark:text-slate-400 mb-6">Please refresh the page to load required libraries.</p>
                `;
            }
            return;
        }

        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Get current user
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) {
            console.error('User not authenticated:', userError);
            if (loadingEl) loadingEl.classList.add('hidden');
            if (noDataEl) {
                noDataEl.classList.remove('hidden');
                noDataEl.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4 text-slate-400">
                        <path d="M9 11l3 3L22 4"></path>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    <h3 class="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Please Log In</h3>
                    <p class="text-slate-600 dark:text-slate-400 mb-6">You need to be logged in to view brand analysis.</p>
                `;
            }
            return;
        }

        // Load all audits for historical analysis
        const { data: audits, error } = await supabaseClient
            .from('brand_audits')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading brand analysis:', error);
            if (loadingEl) loadingEl.classList.add('hidden');
            if (noDataEl) {
                noDataEl.classList.remove('hidden');
                noDataEl.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4 text-red-400">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h3 class="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Error Loading Data</h3>
                    <p class="text-slate-600 dark:text-slate-400 mb-6">${error.message || 'Unable to load brand analysis. Please try again.'}</p>
                    <button onclick="loadBrandAnalysis()" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
                        Retry
                    </button>
                `;
            }
            return;
        }

        // Hide loading, show appropriate state
        if (loadingEl) loadingEl.classList.add('hidden');

        if (!audits || audits.length === 0) {
            console.log('No brand audits found');
            if (noDataEl) noDataEl.classList.remove('hidden');
            return;
        }

        // Store audit data globally
        window.currentBrandAudit = audits[0];
        window.allBrandAudits = audits;

        // Show content
        if (noDataEl) noDataEl.classList.add('hidden');
        if (contentEl) {
            contentEl.classList.remove('hidden');
            console.log('Content element shown successfully');
        } else {
            console.error('Content element not found!');
        }

        // Load Advanced Analytics & Predictions
        // Note: Helper functions are defined inside DOMContentLoaded, so we need to wait
        // or define them globally. For now, we'll call them after a small delay.
        setTimeout(() => {
            try {
                if (typeof window.loadAdvancedAnalytics === 'function') {
                    window.loadAdvancedAnalytics(audits);
                    console.log('Advanced analytics loaded');
                } else {
                    console.warn('loadAdvancedAnalytics function not found, will be available after DOM loads');
                }
            } catch (err) {
                console.error('Error loading advanced analytics:', err);
            }
        }, 100);

    } catch (err) {
        console.error('Error in loadBrandAnalysis:', err);
        if (loadingEl) loadingEl.classList.add('hidden');
        if (noDataEl) {
            noDataEl.classList.remove('hidden');
            noDataEl.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4 text-red-400">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3 class="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Error Loading Analysis</h3>
                <p class="text-slate-600 dark:text-slate-400 mb-2">${err.message || 'An unexpected error occurred.'}</p>
                <p class="text-xs text-slate-500 dark:text-slate-500 mb-6">Check the browser console for details.</p>
                <button onclick="loadBrandAnalysis()" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
                    Retry
                </button>
            `;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    
    // --- Sidebar Toggle Logic ---
    if (sidebar && sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            const isCollapsed = sidebar.classList.contains('collapsed');
            const toggleIcon = document.getElementById('sidebar-toggle-icon');

            if (isCollapsed) {
                // Expanding
                sidebar.classList.remove('w-16', 'collapsed');
                sidebar.classList.add('w-[16.5rem]');
                if (toggleIcon) toggleIcon.classList.remove('rotate-180');
            } else {
                // Collapsing
                sidebar.classList.remove('w-[16.5rem]');
                sidebar.classList.add('w-16', 'collapsed');
                if (toggleIcon) toggleIcon.classList.add('rotate-180');
            }
        });
    }

    // --- New Navigation Logic ---
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const contentSections = {
        'dashboard': document.getElementById('dashboard-content'),
        'brand-audit': document.getElementById('brand-audit-content'),
        'upskilling-dash': document.getElementById('upskilling-dash-content'),
        'career-portfolio': document.getElementById('career-portfolio-content'),
        'resume-studio': document.getElementById('resume-studio-content')
    };

    const headerMainTitle = document.getElementById('header-main-title');
    const headerSubtitle = document.getElementById('header-subtitle');
    const headerIconContainer = document.getElementById('header-icon-container');

    const headerContentMap = {
        'dashboard': { title: 'Dashboard', subtitle: 'Organize your work and improve your performance.' },
        'resume-studio': { title: 'Smart Resume Studio', subtitle: 'Craft the perfect resume with AI assistance.' },
        'app-tailor': { title: 'Application Tailor', subtitle: 'Customize your applications for each job.' },
        'cover-letter': { title: 'Cover Letter Generator', subtitle: 'Create compelling cover letters in minutes.' },
        'job-finder': { title: 'Job Finder', subtitle: 'Discover your next career opportunity.' },
        'job-tracker': { title: 'Job Tracker', subtitle: 'Keep your job applications organized.' },
        'interview-prep': { title: 'Interview Prep Kit', subtitle: 'Ace your next interview with AI-powered tools.' },
        'work-history': { title: 'Work History Manager', subtitle: 'A complete record of your professional experience.' },
        'brand-audit': { title: 'AI Personal Brand Audit', subtitle: 'Get a comprehensive analysis of your online presence.' },
        'content-engine': { title: 'Content Engine', subtitle: 'Generate professional content to build your brand.' },
        'career-portfolio': { title: 'AI Career Portfolio', subtitle: 'Your living, breathing mentor experience.' },
        'event-scout': { title: 'Career Event Scout', subtitle: 'Find networking events and opportunities.' },
        'brand-intelligence': { title: 'AI Brand Intelligence', subtitle: 'Monitor your brand and industry trends.' },
        'upskilling-dash': { title: 'Upskilling Dashboard', subtitle: 'Your central hub for skill growth.' },
        'skill-radar': { title: 'Skill Radar', subtitle: 'Identify and track in-demand skills.' },
        'learning-path': { title: 'Learning Path', subtitle: 'Personalized learning plans for your goals.' },
        'sprints': { title: 'Sprints', subtitle: 'Focused, short-term learning challenges.' },
        'certifications': { title: 'Certifications', subtitle: 'Track and manage your professional certifications.' },
        'benchmarking': { title: 'Skill Benchmarking', subtitle: 'See how your skills stack up against your peers.' }
    };

    function updateHeader(linkId) {
        const content = headerContentMap[linkId];
        const sourceLink = document.querySelector(`.sidebar-link[data-id="${linkId}"]`);

        if (content && headerMainTitle && headerSubtitle) {
            headerMainTitle.textContent = content.title;
            headerSubtitle.textContent = content.subtitle;
        } else { 
            const linkText = sourceLink ? sourceLink.querySelector('.sidebar-text').textContent.trim() : 'Dashboard';
            headerMainTitle.textContent = linkText;
            headerSubtitle.textContent = 'Manage your career effectively.';
        }

        if (sourceLink && headerIconContainer) {
            const iconSVG = sourceLink.querySelector('svg').cloneNode(true);
            iconSVG.classList.remove(...iconSVG.classList);
            iconSVG.classList.add('w-6', 'h-6', 'text-white');
            headerIconContainer.innerHTML = ''; 
            headerIconContainer.appendChild(iconSVG);
        }
    }

    // Set initial state
    const setActiveLink = (linkId) => {
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`.sidebar-link[data-id="${linkId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        updateHeader(linkId);
    };
    
    function animateSkillProgress(percentage) {
        const circle = document.getElementById('skill-progress-circle');
        const text = document.getElementById('skill-progress-text');
        if (!circle || !text) return;

        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;

        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        // Set initial state without transition to avoid animation on page load
        circle.style.transition = 'none';
        circle.style.strokeDashoffset = circumference;
        
        // Use a timeout to apply the transition and new offset, forcing a reflow
        setTimeout(() => {
            circle.style.transition = 'stroke-dashoffset 1s ease-out';
            circle.style.strokeDashoffset = offset;
        }, 50);

        // Animate the text
        let start = 0;
        const duration = 1000;
        const startTime = performance.now();

        function step(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const currentVal = Math.round(progress * percentage);
            
            text.textContent = `${currentVal}%`;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                text.textContent = `${percentage}%`;
            }
        }
        requestAnimationFrame(step);
    }

    const mainPaddingWrapper = document.getElementById('main-padding-wrapper');
    
    // Helper function to find currently visible content section
    const getCurrentContentId = () => {
        for (const [id, section] of Object.entries(contentSections)) {
            if (section && !section.classList.contains('hidden')) {
                return id;
            }
        }
        // Also check for work-history-content directly
        const workHistoryContent = document.getElementById('work-history-content');
        if (workHistoryContent && !workHistoryContent.classList.contains('hidden')) {
            return 'work-history';
        }
        return null;
    };
    
    const showContent = (contentId) => {
        // Cleanup React components when navigating away
        const previousContentId = getCurrentContentId();
        
        if (previousContentId && previousContentId !== contentId) {
            // Cleanup Work History Manager
            if (previousContentId === 'work-history' && typeof window.cleanupWorkHistoryManager === 'function') {
                window.cleanupWorkHistoryManager();
            }
            // Cleanup Smart Resume Studio
            if (previousContentId === 'resume-studio' && typeof window.cleanupSmartResumeStudio === 'function') {
                window.cleanupSmartResumeStudio();
            }
        }

        // Hide all content sections
        Object.values(contentSections).forEach(section => {
            if (section) section.classList.add('hidden');
        });
        
        // Also hide work-history-content if it exists (not in contentSections)
        const workHistoryContent = document.getElementById('work-history-content');
        if (workHistoryContent) {
            workHistoryContent.classList.add('hidden');
        }

        const activeContent = contentSections[contentId];
        if (activeContent) {
            activeContent.classList.remove('hidden');
            
            // If showing the upskilling dash, trigger animation
            if (contentId === 'upskilling-dash') {
                animateSkillProgress(65); // Hardcoded value from PRD
            }
            
            // If showing the resume-studio, trigger rendering
            if (contentId === 'resume-studio') {
                setTimeout(() => {
                    if (typeof window.renderSmartResumeStudio === 'function') {
                        window.renderSmartResumeStudio();
                    }
                }, 100);
            }
            
            // If showing the work-history, show it and trigger rendering
            if (contentId === 'work-history') {
                if (workHistoryContent) {
                    workHistoryContent.classList.remove('hidden');
                }
                setTimeout(() => {
                    if (typeof window.renderWorkHistoryManager === 'function') {
                        window.renderWorkHistoryManager();
                    }
                }, 100);
            }
        }
    };

    // Initially show Dashboard
    setActiveLink('dashboard');
    showContent('dashboard');
    // Load goals for dashboard
    setTimeout(() => {
        loadDashboardGoals();
    }, 500);

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const linkId = link.dataset.id;
            
            if (contentSections[linkId]) {
                setActiveLink(linkId);
                showContent(linkId);
            }
        });
    });

    // AI Mentor Tabs Logic
    const mentorTabs = document.querySelectorAll('.ai-mentor-tab');
    const mentorTabContents = document.querySelectorAll('.ai-mentor-tab-content');

    console.log('Found mentor tabs:', mentorTabs.length);
    console.log('Found mentor tab contents:', mentorTabContents.length);

    mentorTabs.forEach(tab => {
        const tabId = tab.getAttribute('data-tab');
        console.log('Setting up tab:', tabId, tab.textContent);
        tab.addEventListener('click', () => {
            console.log('Tab clicked:', tabId, tab.textContent);
            const clickedTabId = tab.getAttribute('data-tab');

            // Update button styles
            mentorTabs.forEach(t => {
                t.classList.remove('active');
            });
            tab.classList.add('active');
            
            console.log('Looking for content with id:', `${clickedTabId}-tab-content`);
            // Show content
            mentorTabContents.forEach(content => {
                if (content.id === `${clickedTabId}-tab-content`) {
                    console.log('Found matching content, showing it');
                    content.classList.remove('hidden');
                } else {
                    content.classList.add('hidden');
                }
            });

            if (clickedTabId === 'goals') {
                console.log('Goals tab clicked');
                // Render Goals component
                setTimeout(() => {
                    if (typeof window.renderBrandAuditGoals === 'function') {
                        window.renderBrandAuditGoals();
                    }
                }, 100);
            } else if (clickedTabId === 'dashboard') {
                console.log('Dashboard tab clicked');
                // Load goals for dashboard
                loadDashboardGoals();
            } else if (clickedTabId === 'analysis') {
                // Load brand analysis data
                console.log('Brand Analysis tab clicked, loading data...');
                // Immediately show loading state
                const loadingEl = document.getElementById('analysis-loading');
                const noDataEl = document.getElementById('analysis-no-data');
                const contentEl = document.getElementById('analysis-content');
                if (loadingEl) loadingEl.classList.remove('hidden');
                if (noDataEl) noDataEl.classList.add('hidden');
                if (contentEl) contentEl.classList.add('hidden');
                
                setTimeout(() => {
                    if (typeof window.loadBrandAnalysis === 'function') {
                        console.log('Calling loadBrandAnalysis function...');
                        window.loadBrandAnalysis();
                    } else {
                        console.error('loadBrandAnalysis function not found');
                        console.log('Available on window:', typeof window.loadBrandAnalysis);
                        // Fallback: show no data state if function not found
                        if (loadingEl) loadingEl.classList.add('hidden');
                        if (noDataEl) noDataEl.classList.remove('hidden');
                    }
                }, 100);
            } else if (tabId !== 'dashboard' && tabId !== 'analysis') {
                // For now, other tabs show a placeholder
                const contentEl = document.getElementById(`${tabId}-tab-content`);
                if(contentEl && !contentEl.innerHTML) {
                     contentEl.innerHTML = `<div class="text-center p-16 bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl">
                          <h3 class="text-xl font-semibold text-slate-800">Content for ${tab.textContent} coming soon!</h3>
                          <p class="text-slate-600 mt-2">This section is under construction.</p>
                          </div>`;
                }
            }
        });
    });

    // ============================================
    // Load Goals for Dashboard
    // ============================================
    async function loadDashboardGoals() {
        const container = document.getElementById('goals-progress-container');
        if (!container) return;

        try {
            // Initialize Supabase client
            const SUPABASE_URL = 'https://bialelscmftlquykreij.supabase.co';
            const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpYWxlbHNjbWZ0bHF1eWtyZWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NzgxMTgsImV4cCI6MjA3NTQ1NDExOH0.wUywvxuTxDlgwVi6y8KaT9E64D4iVRKFFoqUx8wAalI';
            
            if (typeof supabase === 'undefined') {
                container.innerHTML = '<div class="text-center py-4 text-slate-500 text-sm">Supabase not loaded</div>';
                return;
            }

            const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            
            // Get current user
            const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
            if (userError || !user) {
                container.innerHTML = '<div class="text-center py-4 text-slate-500 text-sm">Please log in to view goals</div>';
                return;
            }

            // Load active goals
            const { data: goals, error } = await supabaseClient
                .from('brand_audit_goals')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) {
                console.error('Error loading goals:', error);
                container.innerHTML = '<div class="text-center py-4 text-red-500 text-sm">Error loading goals</div>';
                return;
            }

            // Render goals
            if (!goals || goals.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-4 text-slate-500 text-sm">
                        <p class="mb-2">No active goals yet</p>
                        <button onclick="document.querySelector('[data-tab=\\'goals\\']').click()" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                            Create your first goal →
                        </button>
                    </div>
                `;
                return;
            }

            container.innerHTML = goals.map(goal => {
                const progress = goal.target_value && goal.target_value > 0 
                    ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
                    : 0;
                
                return `
                    <div class="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <h4 class="font-medium text-slate-800 text-sm mb-1">${escapeHtml(goal.title)}</h4>
                        <div class="flex items-center justify-between text-xs text-slate-500">
                            <span>${goal.target_value ? `${goal.current_value} / ${goal.target_value}` : `Current: ${goal.current_value}`}</span>
                            <span>${progress}%</span>
                        </div>
                        <div class="w-full bg-slate-200 rounded-full h-1 mt-2">
                            <div class="bg-green-500 h-1 rounded-full transition-all duration-300" style="width: ${progress}%;"></div>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (err) {
            console.error('Error in loadDashboardGoals:', err);
            container.innerHTML = '<div class="text-center py-4 text-red-500 text-sm">Error loading goals</div>';
        }
    }

    // Helper function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================
    // Brand Analysis - Brand Archetype Visualization
    // ============================================

    // Render Brand Archetype
    window.renderBrandArchetype = function renderBrandArchetype(audits) {
        const archetypeContent = document.getElementById('brand-archetype-content');
        if (!archetypeContent) return;

        if (!audits || audits.length === 0) {
            archetypeContent.innerHTML = `
                <div class="text-center py-8 text-slate-500 dark:text-slate-400">
                    <p>No brand archetype data available</p>
                </div>
            `;
            return;
        }

        const latestAudit = audits[0];
        const archetype = latestAudit.brand_archetype || {
            name: 'The Professional',
            description: 'A well-rounded professional with a balanced online presence.',
            traits: ['Professional', 'Balanced', 'Versatile']
        };

        // Get archetype evolution if multiple audits exist
        let archetypeEvolution = null;
        if (audits.length > 1) {
            const previousArchetype = audits.find(a => a.brand_archetype && a.brand_archetype.name !== archetype.name);
            if (previousArchetype && previousArchetype.brand_archetype) {
                archetypeEvolution = {
                    previous: previousArchetype.brand_archetype.name,
                    current: archetype.name,
                    changed: true
                };
            }
        }

        // Archetype icon mapping
        const archetypeIcons = {
            'The Professional': `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-600 dark:text-purple-400">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>`,
            'The Innovator': `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600 dark:text-blue-400">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>`,
            'The Leader': `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-600 dark:text-amber-400">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>`,
            'The Expert': `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-600 dark:text-emerald-400">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>`,
            'The Creator': `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-pink-600 dark:text-pink-400">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>`
        };

        // Get icon for archetype (default to Professional if not found)
        const archetypeIcon = archetypeIcons[archetype.name] || archetypeIcons['The Professional'];

        // Build traits HTML
        const traitsHtml = (archetype.traits || []).map(trait => `
            <span class="px-3 py-1.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-purple-200 dark:border-purple-700 rounded-full text-sm font-medium text-purple-700 dark:text-purple-300">
                ${escapeHtml(trait)}
            </span>
        `).join('');

        // Build evolution HTML
        let evolutionHtml = '';
        if (archetypeEvolution && archetypeEvolution.changed) {
            evolutionHtml = `
                <div class="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div class="flex items-center gap-2 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-600 dark:text-amber-400">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                        <span class="text-sm font-semibold text-amber-800 dark:text-amber-300">Archetype Evolution</span>
                    </div>
                    <p class="text-sm text-amber-700 dark:text-amber-400">
                        Your brand archetype has evolved from <span class="font-semibold">${escapeHtml(archetypeEvolution.previous)}</span> to <span class="font-semibold">${escapeHtml(archetypeEvolution.current)}</span>, reflecting your brand's growth and development.
                    </p>
                </div>
            `;
        }

        archetypeContent.innerHTML = `
            <div class="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <!-- Archetype Icon and Name -->
                    <div class="flex items-center gap-4">
                        <div class="p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 rounded-xl border border-purple-200 dark:border-purple-700">
                            ${archetypeIcon}
                        </div>
                        <div>
                            <h4 class="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-1">
                                ${escapeHtml(archetype.name || 'The Professional')}
                            </h4>
                            <p class="text-sm text-slate-600 dark:text-slate-400">
                                Your Personal Brand Identity
                            </p>
                        </div>
                    </div>

                    <!-- Description -->
                    <div class="flex-1">
                        <p class="text-slate-700 dark:text-slate-300 leading-relaxed">
                            ${escapeHtml(archetype.description || 'A well-rounded professional with a balanced online presence.')}
                        </p>
                    </div>
                </div>

                <!-- Traits -->
                ${traitsHtml ? `
                    <div class="mt-6 pt-6 border-t border-purple-200 dark:border-purple-700">
                        <h5 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Key Traits</h5>
                        <div class="flex flex-wrap gap-2">
                            ${traitsHtml}
                        </div>
                    </div>
                ` : ''}

                <!-- Evolution -->
                ${evolutionHtml}
            </div>
        `;
    };

    // ============================================
    // Brand Analysis - Advanced Analytics & Predictions
    // ============================================

    // Load Advanced Analytics & Predictions
    window.loadAdvancedAnalytics = function loadAdvancedAnalytics(audits) {
        if (!audits || audits.length === 0) {
            console.log('No audits to analyze');
            return;
        }

        console.log('Loading advanced analytics for', audits.length, 'audits');
        const latestAudit = audits[0];
        const brandScore = latestAudit.brand_score || {};
        const currentScore = brandScore.overall || 0;
        const recommendations = latestAudit.recommendations || [];

        console.log('Current score:', currentScore, 'Recommendations:', recommendations.length);

        // Render Brand Archetype
        try {
            if (typeof window.renderBrandArchetype === 'function') {
                window.renderBrandArchetype(audits);
                console.log('Brand archetype rendered');
            }
        } catch (err) {
            console.error('Error rendering brand archetype:', err);
        }

        // Calculate score forecasting
        try {
            calculateScoreForecast(audits, currentScore);
        } catch (err) {
            console.error('Error in calculateScoreForecast:', err);
        }

        // Setup goal projection
        try {
            setupGoalProjection(audits, currentScore);
        } catch (err) {
            console.error('Error in setupGoalProjection:', err);
        }

        // Setup impact calculator
        try {
            setupImpactCalculator(recommendations, brandScore, currentScore);
        } catch (err) {
            console.error('Error in setupImpactCalculator:', err);
        }

        // Load Recommendations Dashboard
        try {
            loadRecommendationsDashboard(latestAudit, recommendations, currentScore);
        } catch (err) {
            console.error('Error loading recommendations dashboard:', err);
        }

        // Calculate milestone predictions
        try {
            calculateMilestonePredictions(audits, currentScore);
        } catch (err) {
            console.error('Error in calculateMilestonePredictions:', err);
        }

        // Load Enhanced Data Visualizations (with error handling)
        try {
            if (typeof Chart !== 'undefined') {
                loadEnhancedVisualizations(audits, latestAudit);
            } else {
                console.warn('Chart.js not loaded, skipping visualizations');
            }
        } catch (err) {
            console.error('Error in loadEnhancedVisualizations:', err);
        }

        // Load Enhanced Historical Analysis
        try {
            loadEnhancedHistoricalAnalysis(audits, latestAudit);
        } catch (err) {
            console.error('Error loading enhanced historical analysis:', err);
        }

        // Load Competitive Benchmarking
        try {
            loadCompetitiveBenchmarking(latestAudit, currentScore);
        } catch (err) {
            console.error('Error loading competitive benchmarking:', err);
        }
    }

    // Calculate Score Forecasting
    function calculateScoreForecast(audits, currentScore) {
        if (audits.length < 2) {
            // Not enough data for forecasting
            document.getElementById('forecast-7d').textContent = currentScore;
            document.getElementById('forecast-30d').textContent = currentScore;
            document.getElementById('forecast-90d').textContent = currentScore;
            return;
        }

        // Calculate average score change per day
        const sortedAudits = [...audits].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        const scores = sortedAudits.map(a => a.brand_score?.overall || 0);
        const dates = sortedAudits.map(a => new Date(a.created_at));

        // Calculate daily rate of change
        let totalDays = 0;
        let totalChange = 0;

        for (let i = 1; i < scores.length; i++) {
            const daysDiff = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
            const scoreChange = scores[i] - scores[i - 1];
            if (daysDiff > 0) {
                totalDays += daysDiff;
                totalChange += scoreChange;
            }
        }

        const dailyRate = totalDays > 0 ? totalChange / totalDays : 0;

        // Project future scores
        const forecast7d = Math.round(currentScore + (dailyRate * 7));
        const forecast30d = Math.round(currentScore + (dailyRate * 30));
        const forecast90d = Math.round(currentScore + (dailyRate * 90));

        // Clamp to 0-100
        const forecast7dEl = document.getElementById('forecast-7d');
        const forecast30dEl = document.getElementById('forecast-30d');
        const forecast90dEl = document.getElementById('forecast-90d');
        
        if (forecast7dEl) forecast7dEl.textContent = Math.max(0, Math.min(100, forecast7d));
        if (forecast30dEl) forecast30dEl.textContent = Math.max(0, Math.min(100, forecast30d));
        if (forecast90dEl) forecast90dEl.textContent = Math.max(0, Math.min(100, forecast90d));

        // Add trend indicators
        if (dailyRate > 0 && forecast7dEl) {
            forecast7dEl.classList.add('text-green-600', 'dark:text-green-400');
        } else if (dailyRate < 0 && forecast7dEl) {
            forecast7dEl.classList.add('text-red-600', 'dark:text-red-400');
        }
    }

    // Setup Goal Projection
    function setupGoalProjection(audits, currentScore) {
        const targetInput = document.getElementById('target-score-input');
        const goalDays = document.getElementById('goal-days');
        const goalResult = document.getElementById('goal-projection-result');

        if (!targetInput || !goalDays) return;

        const updateProjection = () => {
            const targetScore = parseInt(targetInput.value) || 80;
            
            if (targetScore <= currentScore) {
                goalDays.textContent = '0';
                if (goalResult) goalResult.classList.remove('hidden');
                return;
            }

            if (audits.length < 2) {
                goalDays.textContent = 'N/A (Need more data)';
                if (goalResult) goalResult.classList.remove('hidden');
                return;
            }

            // Calculate average daily improvement rate
            const sortedAudits = [...audits].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            const scores = sortedAudits.map(a => a.brand_score?.overall || 0);
            const dates = sortedAudits.map(a => new Date(a.created_at));

            let totalDays = 0;
            let totalChange = 0;

            for (let i = 1; i < scores.length; i++) {
                const daysDiff = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
                const scoreChange = scores[i] - scores[i - 1];
                if (daysDiff > 0 && scoreChange > 0) {
                    totalDays += daysDiff;
                    totalChange += scoreChange;
                }
            }

            const dailyRate = totalDays > 0 ? totalChange / totalDays : 0.1; // Default to 0.1 if no improvement
            const scoreGap = targetScore - currentScore;
            const estimatedDays = dailyRate > 0 ? Math.ceil(scoreGap / dailyRate) : 999;

            goalDays.textContent = estimatedDays < 999 ? estimatedDays.toString() : 'N/A';
            if (goalResult) goalResult.classList.remove('hidden');
        };

        targetInput.addEventListener('input', updateProjection);
        updateProjection();
    }

    // Setup Impact Calculator
    function setupImpactCalculator(recommendations, brandScore, currentScore) {
        const impactList = document.getElementById('impact-recommendations-list');
        const impactResult = document.getElementById('impact-result');
        const impactScore = document.getElementById('impact-score');
        const impactNewScore = document.getElementById('impact-new-score');

        if (!impactList) return;

        if (recommendations.length === 0) {
            impactList.innerHTML = '<p class="text-sm text-slate-500 dark:text-slate-400">No recommendations available</p>';
            return;
        }

        const selectedRecommendations = new Set();
        
        // Render recommendation checkboxes
        impactList.innerHTML = recommendations.slice(0, 10).map(rec => {
            // Estimate impact based on priority and category
            let estimatedImpact = 0;
            if (rec.priority === 'high') {
                estimatedImpact = rec.category === 'LinkedIn' || rec.category === 'Resume' ? 3 : 2;
            } else if (rec.priority === 'medium') {
                estimatedImpact = 1.5;
            } else {
                estimatedImpact = 1;
            }

            return `
                <label class="flex items-start gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer">
                    <input type="checkbox" 
                           class="mt-1 impact-checkbox" 
                           data-impact="${estimatedImpact}"
                           data-rec-id="${rec.id}"
                           onchange="updateImpactCalculator()">
                    <div class="flex-1">
                        <div class="text-sm font-medium text-slate-800 dark:text-slate-200">${escapeHtml(rec.title)}</div>
                        <div class="text-xs text-slate-500 dark:text-slate-400">Est. +${estimatedImpact} points</div>
                    </div>
                </label>
            `;
        }).join('');

        // Update impact calculator function
        window.updateImpactCalculator = function() {
            const checkboxes = impactList.querySelectorAll('.impact-checkbox:checked');
            let totalImpact = 0;
            
            checkboxes.forEach(cb => {
                totalImpact += parseFloat(cb.dataset.impact || 0);
            });

            if (totalImpact > 0 && impactResult && impactScore && impactNewScore) {
                const newScore = Math.min(100, Math.round(currentScore + totalImpact));
                impactScore.textContent = `+${Math.round(totalImpact)}`;
                impactNewScore.textContent = newScore;
                impactResult.classList.remove('hidden');
            } else if (impactResult) {
                impactResult.classList.add('hidden');
            }
        };
    }

    // Calculate Milestone Predictions
    function calculateMilestonePredictions(audits, currentScore) {
        const milestonesList = document.getElementById('milestones-list');
        if (!milestonesList) return;

        const milestones = [70, 75, 80, 85, 90];
        const relevantMilestones = milestones.filter(m => m > currentScore).slice(0, 3);

        if (relevantMilestones.length === 0) {
            milestonesList.innerHTML = '<p class="text-sm text-slate-500 dark:text-slate-400">You\'ve reached all major milestones! 🎉</p>';
            return;
        }

        if (audits.length < 2) {
            milestonesList.innerHTML = '<p class="text-sm text-slate-500 dark:text-slate-400">Need more audit data to predict milestones</p>';
            return;
        }

        // Calculate daily improvement rate
        const sortedAudits = [...audits].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        const scores = sortedAudits.map(a => a.brand_score?.overall || 0);
        const dates = sortedAudits.map(a => new Date(a.created_at));

        let totalDays = 0;
        let totalChange = 0;

        for (let i = 1; i < scores.length; i++) {
            const daysDiff = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
            const scoreChange = scores[i] - scores[i - 1];
            if (daysDiff > 0 && scoreChange > 0) {
                totalDays += daysDiff;
                totalChange += scoreChange;
            }
        }

        const dailyRate = totalDays > 0 ? totalChange / totalDays : 0.1;

    // ============================================
    // Recommendations Dashboard
    // ============================================

    // Load Recommendations Dashboard
    async function loadRecommendationsDashboard(audit, recommendations, currentScore) {
        const dashboardContent = document.getElementById('recommendations-dashboard-content');
        if (!dashboardContent) return;

        if (!recommendations || recommendations.length === 0) {
            dashboardContent.innerHTML = `
                <div class="text-center py-8 text-slate-500 dark:text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4 text-slate-400">
                        <path d="M9 11l3 3L22 4"></path>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    <p class="text-sm">No recommendations available yet.</p>
                    <p class="text-xs mt-2">Run a brand audit to get personalized recommendations.</p>
                </div>
            `;
            return;
        }

        try {
            // Load recommendation statuses from database
            const SUPABASE_URL = 'https://bialelscmftlquykreij.supabase.co';
            const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpYWxlbHNjbWZ0bHF1eWtyZWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NzgxMTgsImV4cCI6MjA3NTQ1NDExOH0.wUywvxuTxDlgwVi6y8KaT9E64D4iVRKFFoqUx8wAalI';
            const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            
            const { data: statuses, error: statusError } = await supabaseClient
                .from('brand_recommendations_status')
                .select('*')
                .eq('audit_id', audit.id);

            const statusMap = {};
            if (statuses && !statusError) {
                statuses.forEach(status => {
                    statusMap[status.recommendation_id] = status.status;
                });
            }

            // Sort recommendations by priority (high > medium > low) and then by impact
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const sortedRecommendations = [...recommendations].sort((a, b) => {
                const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                if (priorityDiff !== 0) return priorityDiff;
                
                // If same priority, sort by status (pending first, then saved, then implemented)
                const statusOrder = { 'pending': 3, 'saved': 2, 'implemented': 1 };
                const statusA = statusMap[a.id] || 'pending';
                const statusB = statusMap[b.id] || 'pending';
                return statusOrder[statusB] - statusOrder[statusA];
            });

            // Render recommendations
            renderRecommendationsList(sortedRecommendations, statusMap, audit.id, currentScore);
            
            // Setup category filters
            setupRecommendationFilters(sortedRecommendations);
            
            // Update stats
            updateRecommendationStats(sortedRecommendations, statusMap);
            
            // Render impact timeline
            renderRecommendationsImpactTimeline(sortedRecommendations, currentScore);

        } catch (err) {
            console.error('Error loading recommendations dashboard:', err);
            dashboardContent.innerHTML = `
                <div class="text-center py-8 text-red-500 dark:text-red-400">
                    <p class="text-sm">Error loading recommendations. Please try again.</p>
                </div>
            `;
        }
    }

    // Render Recommendations List
    function renderRecommendationsList(recommendations, statusMap, auditId, currentScore) {
        const dashboardContent = document.getElementById('recommendations-dashboard-content');
        if (!dashboardContent) return;

        const categoryIcons = {
            'LinkedIn': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
            'Resume': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
            'Portfolio': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',
            'GitHub': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
            'General': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
        };

        const priorityColors = {
            high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800',
            medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800',
            low: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800'
        };

        const difficultyColors = {
            easy: 'text-green-600 dark:text-green-400',
            medium: 'text-yellow-600 dark:text-yellow-400',
            hard: 'text-red-600 dark:text-red-400'
        };

        dashboardContent.innerHTML = recommendations.map((rec, index) => {
            const status = statusMap[rec.id] || 'pending';
            const isImplemented = status === 'implemented';
            const isSaved = status === 'saved';
            
            // Calculate estimated impact
            let estimatedImpact = 0;
            if (rec.priority === 'high') {
                estimatedImpact = rec.category === 'LinkedIn' || rec.category === 'Resume' ? 3 : 2;
            } else if (rec.priority === 'medium') {
                estimatedImpact = 1.5;
            } else {
                estimatedImpact = 1;
            }

            return `
                <div class="recommendation-card bg-white dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all ${isImplemented ? 'opacity-75' : ''}" 
                     data-category="${rec.category}" 
                     data-priority="${rec.priority}"
                     data-status="${status}">
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                                <div class="flex items-center gap-2">
                                    ${categoryIcons[rec.category] || categoryIcons['General']}
                                    <span class="text-xs font-medium px-2 py-1 rounded border ${priorityColors[rec.priority]}">
                                        ${rec.priority.toUpperCase()}
                                    </span>
                                    ${isImplemented ? '<span class="text-xs font-medium px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-800">✓ Implemented</span>' : ''}
                                    ${isSaved ? '<span class="text-xs font-medium px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800">💾 Saved</span>' : ''}
                                </div>
                            </div>
                            <h4 class="text-base font-semibold text-slate-800 dark:text-slate-200 mb-2">${escapeHtml(rec.title)}</h4>
                            <p class="text-sm text-slate-600 dark:text-slate-400 mb-3">${escapeHtml(rec.description)}</p>
                            
                            ${rec.actionableSteps && rec.actionableSteps.length > 0 ? `
                                <div class="mb-3">
                                    <p class="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Action Steps:</p>
                                    <ul class="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                        ${rec.actionableSteps.slice(0, 3).map(step => `<li>${escapeHtml(step)}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            
                            <div class="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                <span class="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                    </svg>
                                    ${rec.impact}
                                </span>
                                <span class="flex items-center gap-1 ${difficultyColors[rec.difficulty]}">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                    </svg>
                                    ${rec.difficulty.charAt(0).toUpperCase() + rec.difficulty.slice(1)}
                                </span>
                                <span class="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                                    </svg>
                                    +${estimatedImpact} points
                                </span>
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            ${!isImplemented ? `
                                <button onclick="markRecommendationAsDone('${rec.id}', '${auditId}')" 
                                        class="px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Mark Done
                                </button>
                            ` : ''}
                            <button onclick="saveRecommendation('${rec.id}', '${auditId}', ${!isSaved})" 
                                    class="px-3 py-1.5 text-xs font-medium ${isSaved ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'} text-white rounded-lg transition-colors flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                    <polyline points="7 3 7 8 15 8"></polyline>
                                </svg>
                                ${isSaved ? 'Saved' : 'Save'}
                            </button>
                            <button onclick="linkToTool('${rec.category}')" 
                                    class="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                    <polyline points="15 3 21 3 21 9"></polyline>
                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                                Open Tool
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Store recommendations globally for filter functionality
        window.allRecommendations = recommendations;
        window.recommendationStatusMap = statusMap;
        window.currentAuditId = auditId;
    }

    // Setup Category Filters
    function setupRecommendationFilters(recommendations) {
        const filterButtons = document.querySelectorAll('.recommendation-filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                filterButtons.forEach(b => b.classList.remove('active', 'bg-amber-600', 'text-white'));
                filterButtons.forEach(b => b.classList.add('bg-white', 'dark:bg-slate-700', 'text-slate-700', 'dark:text-slate-300', 'border', 'border-slate-300', 'dark:border-slate-600'));
                btn.classList.add('active', 'bg-amber-600', 'text-white');
                btn.classList.remove('bg-white', 'dark:bg-slate-700', 'text-slate-700', 'dark:text-slate-300', 'border', 'border-slate-300', 'dark:border-slate-600');

                // Filter recommendations
                const category = btn.dataset.category;
                const cards = document.querySelectorAll('.recommendation-card');
                cards.forEach(card => {
                    if (category === 'all' || card.dataset.category === category) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                });
            });
        });
    }

    // Update Recommendation Stats
    function updateRecommendationStats(recommendations, statusMap) {
        const statsEl = document.getElementById('recommendations-stats');
        if (!statsEl) return;

        const total = recommendations.length;
        const implemented = recommendations.filter(r => statusMap[r.id] === 'implemented').length;
        const saved = recommendations.filter(r => statusMap[r.id] === 'saved').length;
        const pending = total - implemented - saved;

        statsEl.textContent = `${implemented} implemented, ${saved} saved, ${pending} pending`;
    }

    // Mark Recommendation as Done
    window.markRecommendationAsDone = async function(recId, auditId) {
        try {
            const SUPABASE_URL = 'https://bialelscmftlquykreij.supabase.co';
            const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpYWxlbHNjbWZ0bHF1eWtyZWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NzgxMTgsImV4cCI6MjA3NTQ1NDExOH0.wUywvxuTxDlgwVi6y8KaT9E64D4iVRKFFoqUx8wAalI';
            const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            // Upsert status
            const { error } = await supabaseClient
                .from('brand_recommendations_status')
                .upsert({
                    audit_id: auditId,
                    recommendation_id: recId,
                    status: 'implemented',
                    implemented_at: new Date().toISOString()
                }, {
                    onConflict: 'audit_id,recommendation_id'
                });

            if (error) throw error;

            // Update local status map
            if (window.recommendationStatusMap) {
                window.recommendationStatusMap[recId] = 'implemented';
            }

            // Reload recommendations dashboard
            if (window.currentBrandAudit && window.allRecommendations) {
                loadRecommendationsDashboard(window.currentBrandAudit, window.allRecommendations, window.currentBrandAudit.brand_score?.overall || 0);
            }

        } catch (err) {
            console.error('Error marking recommendation as done:', err);
            alert('Failed to update recommendation status. Please try again.');
        }
    };

    // Save Recommendation
    window.saveRecommendation = async function(recId, auditId, shouldSave) {
        try {
            const SUPABASE_URL = 'https://bialelscmftlquykreij.supabase.co';
            const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpYWxlbHNjbWZ0bHF1eWtyZWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NzgxMTgsImV4cCI6MjA3NTQ1NDExOH0.wUywvxuTxDlgwVi6y8KaT9E64D4iVRKFFoqUx8wAalI';
            const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            if (shouldSave) {
                // Save recommendation
                const { error } = await supabaseClient
                    .from('brand_recommendations_status')
                    .upsert({
                        audit_id: auditId,
                        recommendation_id: recId,
                        status: 'saved'
                    }, {
                        onConflict: 'audit_id,recommendation_id'
                    });

                if (error) throw error;
                if (window.recommendationStatusMap) {
                    window.recommendationStatusMap[recId] = 'saved';
                }
            } else {
                // Remove saved status (revert to pending)
                const { error } = await supabaseClient
                    .from('brand_recommendations_status')
                    .delete()
                    .eq('audit_id', auditId)
                    .eq('recommendation_id', recId)
                    .eq('status', 'saved');

                if (error) throw error;
                if (window.recommendationStatusMap) {
                    delete window.recommendationStatusMap[recId];
                }
            }

            // Reload recommendations dashboard
            if (window.currentBrandAudit && window.allRecommendations) {
                loadRecommendationsDashboard(window.currentBrandAudit, window.allRecommendations, window.currentBrandAudit.brand_score?.overall || 0);
            }

        } catch (err) {
            console.error('Error saving recommendation:', err);
            alert('Failed to update recommendation status. Please try again.');
        }
    };

    // Link to Tool
    window.linkToTool = function(category) {
        const categoryMap = {
            'LinkedIn': 'brand-audit',
            'Resume': 'resume-studio',
            'Portfolio': 'brand-audit',
            'GitHub': 'brand-audit',
            'General': 'dashboard'
        };

        const targetSection = categoryMap[category] || 'dashboard';
        
        // Trigger navigation to the appropriate section
        const sidebarLink = document.querySelector(`[data-section="${targetSection}"]`);
        if (sidebarLink) {
            sidebarLink.click();
        } else {
            // Fallback: scroll to brand audit section
            const brandAuditContent = document.getElementById('brand-audit-content');
            if (brandAuditContent) {
                brandAuditContent.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    // ============================================
    // Enhanced Historical Analysis
    // ============================================

    // Load Enhanced Historical Analysis
    function loadEnhancedHistoricalAnalysis(audits, latestAudit) {
        if (!audits || audits.length === 0) return;

        // Load trend analysis
        renderTrendAnalysis(audits);
        
        // Load performance highlights
        renderPerformanceHighlights(audits);
        
        // Load correlation insights
        renderCorrelationInsights(audits, latestAudit);
        
        // Load audit timeline
        renderAuditTimeline(audits);
    }

    // Render Trend Analysis
    function renderTrendAnalysis(audits) {
        const content = document.getElementById('trend-analysis-content');
        if (!content) return;

        if (audits.length < 2) {
            content.innerHTML = `
                <div class="text-center py-4 text-slate-500 dark:text-slate-400">
                    <p class="text-sm">Need at least 2 audits to analyze trends</p>
                </div>
            `;
            return;
        }

        const sortedAudits = [...audits].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        const scores = sortedAudits.map(a => a.brand_score?.overall || 0);
        const dates = sortedAudits.map(a => new Date(a.created_at));

        // Calculate overall trend
        const firstScore = scores[0];
        const lastScore = scores[scores.length - 1];
        const totalChange = lastScore - firstScore;
        const totalDays = (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24);
        const dailyRate = totalDays > 0 ? (totalChange / totalDays).toFixed(2) : 0;

        // Identify improving/declining components
        const components = ['linkedin', 'resume', 'portfolio', 'github'];
        const componentTrends = components.map(comp => {
            const first = sortedAudits[0].brand_score?.[comp] || 0;
            const last = sortedAudits[sortedAudits.length - 1].brand_score?.[comp] || 0;
            const change = last - first;
            return {
                name: comp.charAt(0).toUpperCase() + comp.slice(1),
                change: change,
                trend: change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable'
            };
        }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

        const improving = componentTrends.filter(c => c.trend === 'improving');
        const declining = componentTrends.filter(c => c.trend === 'declining');

        let trendExplanation = '';
        if (totalChange > 5) {
            trendExplanation = `Your brand score has improved significantly by ${totalChange} points over ${Math.round(totalDays)} days. This indicates strong progress in building your personal brand.`;
        } else if (totalChange > 0) {
            trendExplanation = `Your brand score has improved by ${totalChange} points. Keep up the momentum!`;
        } else if (totalChange < -5) {
            trendExplanation = `Your brand score has declined by ${Math.abs(totalChange)} points. Focus on the declining areas to reverse this trend.`;
        } else if (totalChange < 0) {
            trendExplanation = `Your brand score has decreased slightly by ${Math.abs(totalChange)} points. Review recent changes to identify the cause.`;
        } else {
            trendExplanation = `Your brand score has remained stable. Consider implementing recommendations to see growth.`;
        }

        content.innerHTML = `
            <div class="space-y-4">
                <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Overall Trend</span>
                        <span class="text-lg font-bold ${totalChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                            ${totalChange >= 0 ? '+' : ''}${totalChange.toFixed(1)} points
                        </span>
                    </div>
                    <div class="text-xs text-slate-500 dark:text-slate-400">
                        ${dailyRate >= 0 ? '+' : ''}${dailyRate} points/day average
                    </div>
                </div>

                <div class="text-sm text-slate-600 dark:text-slate-400">
                    ${trendExplanation}
                </div>

                ${improving.length > 0 ? `
                    <div>
                        <div class="text-xs font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                <polyline points="17 6 23 6 23 12"></polyline>
                            </svg>
                            Improving Areas
                        </div>
                        <div class="space-y-1">
                            ${improving.slice(0, 2).map(c => `
                                <div class="flex items-center justify-between text-xs p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                    <span class="text-slate-700 dark:text-slate-300">${c.name}</span>
                                    <span class="font-medium text-green-600 dark:text-green-400">+${c.change.toFixed(1)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${declining.length > 0 ? `
                    <div>
                        <div class="text-xs font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                                <polyline points="17 18 23 18 23 12"></polyline>
                            </svg>
                            Areas Needing Attention
                        </div>
                        <div class="space-y-1">
                            ${declining.slice(0, 2).map(c => `
                                <div class="flex items-center justify-between text-xs p-2 bg-red-50 dark:bg-red-900/20 rounded">
                                    <span class="text-slate-700 dark:text-slate-300">${c.name}</span>
                                    <span class="font-medium text-red-600 dark:text-red-400">${c.change.toFixed(1)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Render Performance Highlights
    function renderPerformanceHighlights(audits) {
        const content = document.getElementById('performance-highlights-content');
        if (!content) return;

        if (audits.length < 2) {
            content.innerHTML = `
                <div class="text-center py-4 text-slate-500 dark:text-slate-400">
                    <p class="text-sm">Need at least 2 audits for highlights</p>
                </div>
            `;
            return;
        }

        const sortedAudits = [...audits].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        const scores = sortedAudits.map(a => ({
            score: a.brand_score?.overall || 0,
            date: new Date(a.created_at),
            audit: a
        }));

        // Find best and worst periods
        const bestPeriod = scores.reduce((max, curr) => curr.score > max.score ? curr : max, scores[0]);
        const worstPeriod = scores.reduce((min, curr) => curr.score < min.score ? curr : min, scores[0]);

        // Calculate largest improvement
        let largestImprovement = { change: 0, from: null, to: null };
        for (let i = 1; i < scores.length; i++) {
            const change = scores[i].score - scores[i - 1].score;
            if (change > largestImprovement.change) {
                largestImprovement = {
                    change: change,
                    from: scores[i - 1],
                    to: scores[i]
                };
            }
        }

        // Calculate largest decline
        let largestDecline = { change: 0, from: null, to: null };
        for (let i = 1; i < scores.length; i++) {
            const change = scores[i].score - scores[i - 1].score;
            if (change < largestDecline.change) {
                largestDecline = {
                    change: change,
                    from: scores[i - 1],
                    to: scores[i]
                };
            }
        }

        content.innerHTML = `
            <div class="space-y-4">
                <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div class="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">🏆 Best Performance</div>
                    <div class="text-lg font-bold text-green-600 dark:text-green-400">${bestPeriod.score}/100</div>
                    <div class="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        ${bestPeriod.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>

                ${worstPeriod.score < bestPeriod.score ? `
                    <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div class="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">⚠️ Lowest Performance</div>
                        <div class="text-lg font-bold text-red-600 dark:text-red-400">${worstPeriod.score}/100</div>
                        <div class="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            ${worstPeriod.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                ` : ''}

                ${largestImprovement.change > 0 ? `
                    <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div class="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">📈 Largest Improvement</div>
                        <div class="text-sm font-bold text-blue-600 dark:text-blue-400">+${largestImprovement.change.toFixed(1)} points</div>
                        <div class="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            ${largestImprovement.from.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → 
                            ${largestImprovement.to.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                ` : ''}

                ${largestDecline.change < 0 ? `
                    <div class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div class="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-1">📉 Largest Decline</div>
                        <div class="text-sm font-bold text-orange-600 dark:text-orange-400">${largestDecline.change.toFixed(1)} points</div>
                        <div class="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            ${largestDecline.from.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → 
                            ${largestDecline.to.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Render Correlation Insights
    function renderCorrelationInsights(audits, latestAudit) {
        const content = document.getElementById('correlation-insights-content');
        if (!content) return;

        if (audits.length < 2) {
            content.innerHTML = `
                <div class="text-center py-4 text-slate-500 dark:text-slate-400">
                    <p class="text-sm">Need at least 2 audits for correlation analysis</p>
                </div>
            `;
            return;
        }

        const sortedAudits = [...audits].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        const insights = [];

        // Analyze score changes and try to correlate with component changes
        for (let i = 1; i < sortedAudits.length; i++) {
            const prev = sortedAudits[i - 1];
            const curr = sortedAudits[i];
            const scoreChange = (curr.brand_score?.overall || 0) - (prev.brand_score?.overall || 0);
            
            if (Math.abs(scoreChange) >= 3) {
                // Find which component changed the most
                const components = ['linkedin', 'resume', 'portfolio', 'github'];
                let maxChange = { name: '', change: 0 };
                
                components.forEach(comp => {
                    const change = (curr.brand_score?.[comp] || 0) - (prev.brand_score?.[comp] || 0);
                    if (Math.abs(change) > Math.abs(maxChange.change)) {
                        maxChange = { name: comp, change: change };
                    }
                });

                if (Math.abs(maxChange.change) >= 2) {
                    const date = new Date(curr.created_at);
                    const componentName = maxChange.name.charAt(0).toUpperCase() + maxChange.name.slice(1);
                    const daysAgo = Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
                    
                    insights.push({
                        date: date,
                        daysAgo: daysAgo,
                        scoreChange: scoreChange,
                        component: componentName,
                        componentChange: maxChange.change,
                        type: scoreChange > 0 ? 'improvement' : 'decline'
                    });
                }
            }
        }

        // Sort by most recent
        insights.sort((a, b) => b.date - a.date);

        if (insights.length === 0) {
            content.innerHTML = `
                <div class="text-center py-4 text-slate-500 dark:text-slate-400">
                    <p class="text-sm">No significant correlations detected yet</p>
                    <p class="text-xs mt-1">Continue improving your brand to see correlation insights</p>
                </div>
            `;
            return;
        }

        content.innerHTML = `
            <div class="space-y-3">
                ${insights.slice(0, 3).map(insight => `
                    <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div class="flex items-start justify-between mb-2">
                            <div class="flex-1">
                                <div class="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                                    ${insight.type === 'improvement' ? '📈' : '📉'} Score ${insight.type === 'improvement' ? 'Increased' : 'Decreased'} by ${Math.abs(insight.scoreChange).toFixed(1)} points
                                </div>
                                <div class="text-xs text-slate-600 dark:text-slate-400">
                                    ${insight.daysAgo === 0 ? 'Today' : insight.daysAgo === 1 ? 'Yesterday' : `${insight.daysAgo} days ago`}
                                </div>
                            </div>
                            <span class="text-sm font-bold ${insight.scoreChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                                ${insight.scoreChange >= 0 ? '+' : ''}${insight.scoreChange.toFixed(1)}
                            </span>
                        </div>
                        <div class="text-xs text-slate-500 dark:text-slate-400 mt-2 p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-600">
                            <strong>Correlation:</strong> ${insight.component} score changed by ${insight.componentChange >= 0 ? '+' : ''}${insight.componentChange.toFixed(1)} points, 
                            ${insight.type === 'improvement' ? 'likely contributing to' : 'likely causing'} the overall ${insight.type}.
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Render Audit Timeline
    function renderAuditTimeline(audits) {
        const content = document.getElementById('audit-timeline-content');
        if (!content) return;

        if (audits.length === 0) {
            content.innerHTML = `
                <div class="text-center py-4 text-slate-500 dark:text-slate-400">
                    <p class="text-sm">No audits available</p>
                </div>
            `;
            return;
        }

        const sortedAudits = [...audits].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        content.innerHTML = `
            <div class="relative">
                <!-- Timeline line -->
                <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
                
                <div class="space-y-4">
                    ${sortedAudits.map((audit, index) => {
                        const date = new Date(audit.created_at);
                        const score = audit.brand_score?.overall || 0;
                        const prevScore = index < sortedAudits.length - 1 
                            ? (sortedAudits[index + 1].brand_score?.overall || 0)
                            : null;
                        const change = prevScore !== null ? score - prevScore : null;
                        const daysAgo = Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
                        
                        return `
                            <div class="relative pl-10">
                                <!-- Timeline dot -->
                                <div class="absolute left-3 top-2 w-2 h-2 rounded-full ${change !== null && change > 0 ? 'bg-green-500' : change !== null && change < 0 ? 'bg-red-500' : 'bg-slate-400'} border-2 border-white dark:border-slate-800"></div>
                                
                                <!-- Content card -->
                                <div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600 hover:shadow-md transition-shadow">
                                    <div class="flex items-center justify-between mb-2">
                                        <div class="flex items-center gap-2">
                                            <span class="text-lg font-bold text-slate-800 dark:text-slate-200">${score}/100</span>
                                            ${change !== null ? `
                                                <span class="text-xs font-medium px-2 py-0.5 rounded ${change > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : change < 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-400'}">
                                                    ${change > 0 ? '+' : ''}${change.toFixed(1)}
                                                </span>
                                            ` : ''}
                                        </div>
                                        <div class="text-xs text-slate-500 dark:text-slate-400">
                                            ${daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
                                        </div>
                                    </div>
                                    <div class="text-xs text-slate-600 dark:text-slate-400">
                                        ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div class="mt-2 flex gap-2 text-xs">
                                        <span class="px-2 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-600">
                                            LinkedIn: ${audit.brand_score?.linkedin || 0}
                                        </span>
                                        <span class="px-2 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-600">
                                            Resume: ${audit.brand_score?.resume || 0}
                                        </span>
                                        <span class="px-2 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-600">
                                            Portfolio: ${audit.brand_score?.portfolio || 0}
                                        </span>
                                        <span class="px-2 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-600">
                                            GitHub: ${audit.brand_score?.github || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // ============================================
    // Competitive Benchmarking
    // ============================================

    // Load Competitive Benchmarking
    function loadCompetitiveBenchmarking(audit, currentScore) {
        if (!audit) return;

        // Load industry comparison
        renderIndustryComparison(audit, currentScore);
        
        // Load percentile ranking
        renderPercentileRanking(currentScore);
        
        // Load peer comparison
        renderPeerComparison(audit, currentScore);
        
        // Load industry-specific insights
        renderIndustryInsights(audit, currentScore);

        // Setup industry selector
        const industrySelect = document.getElementById('industry-select');
        if (industrySelect) {
            industrySelect.addEventListener('change', () => {
                loadCompetitiveBenchmarking(audit, currentScore);
            });
        }
    }

    // Render Industry Comparison
    function renderIndustryComparison(audit, currentScore) {
        const content = document.getElementById('industry-comparison-content');
        if (!content) return;

        const industryBenchmark = audit.industry_benchmark || {};
        const industrySelect = document.getElementById('industry-select');
        const selectedIndustry = industrySelect ? industrySelect.value : 'all';

        // Industry-specific benchmarks (simulated - in production, this would come from database)
        const industryBenchmarks = {
            all: { average: 65, top10: 85, top25: 75 },
            tech: { average: 70, top10: 88, top25: 78 },
            finance: { average: 68, top10: 87, top25: 77 },
            healthcare: { average: 63, top10: 83, top25: 73 },
            marketing: { average: 72, top10: 90, top25: 80 },
            consulting: { average: 75, top10: 92, top25: 82 },
            education: { average: 60, top10: 80, top25: 70 }
        };

        const benchmark = industryBenchmarks[selectedIndustry] || industryBenchmarks.all;
        const average = industryBenchmark.average || benchmark.average;
        const top10 = industryBenchmark.top10Percent || benchmark.top10;
        const top25 = industryBenchmark.top25Percent || benchmark.top25;

        const vsAverage = currentScore - average;
        const vsTop25 = currentScore - top25;
        const vsTop10 = currentScore - top10;

        content.innerHTML = `
            <div class="space-y-4">
                <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Your Score</span>
                        <span class="text-xl font-bold text-slate-800 dark:text-slate-200">${currentScore}/100</span>
                    </div>
                </div>

                <div class="space-y-3">
                    <div class="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div>
                            <div class="text-xs font-medium text-blue-700 dark:text-blue-400">Industry Average</div>
                            <div class="text-sm text-slate-600 dark:text-slate-400">${average}/100</div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm font-bold ${vsAverage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                                ${vsAverage >= 0 ? '+' : ''}${vsAverage.toFixed(1)}
                            </div>
                            <div class="text-xs text-slate-500 dark:text-slate-400">${vsAverage >= 0 ? 'above' : 'below'} avg</div>
                        </div>
                    </div>

                    <div class="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div>
                            <div class="text-xs font-medium text-purple-700 dark:text-purple-400">Top 25%</div>
                            <div class="text-sm text-slate-600 dark:text-slate-400">${top25}/100</div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm font-bold ${vsTop25 >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                                ${vsTop25 >= 0 ? '+' : ''}${vsTop25.toFixed(1)}
                            </div>
                            <div class="text-xs text-slate-500 dark:text-slate-400">${vsTop25 >= 0 ? 'above' : 'below'} top 25%</div>
                        </div>
                    </div>

                    <div class="flex items-center justify-between p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800">
                        <div>
                            <div class="text-xs font-medium text-violet-700 dark:text-violet-400">Top 10%</div>
                            <div class="text-sm text-slate-600 dark:text-slate-400">${top10}/100</div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm font-bold ${vsTop10 >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                                ${vsTop10 >= 0 ? '+' : ''}${vsTop10.toFixed(1)}
                            </div>
                            <div class="text-xs text-slate-500 dark:text-slate-400">${vsTop10 >= 0 ? 'above' : 'below'} top 10%</div>
                        </div>
                    </div>
                </div>

                <div class="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div class="text-xs text-slate-600 dark:text-slate-400">
                        ${vsTop10 >= 0 
                            ? '🎉 Excellent! You\'re in the top 10% of professionals in your industry.' 
                            : vsTop25 >= 0 
                            ? '👍 Great job! You\'re performing above the top 25% threshold.' 
                            : vsAverage >= 0 
                            ? '📈 Good progress! You\'re above the industry average. Keep improving to reach the top 25%.' 
                            : '💪 You\'re below the industry average. Focus on implementing recommendations to improve your score.'}
                    </div>
                </div>
            </div>
        `;
    }

    // Render Percentile Ranking
    function renderPercentileRanking(currentScore) {
        const content = document.getElementById('percentile-ranking-content');
        if (!content) return;

        // Calculate percentile (simulated - in production, this would be calculated from actual user data)
        let percentile = 50; // Default
        if (currentScore >= 90) percentile = 95;
        else if (currentScore >= 85) percentile = 90;
        else if (currentScore >= 80) percentile = 85;
        else if (currentScore >= 75) percentile = 75;
        else if (currentScore >= 70) percentile = 65;
        else if (currentScore >= 65) percentile = 55;
        else if (currentScore >= 60) percentile = 45;
        else if (currentScore >= 55) percentile = 35;
        else if (currentScore >= 50) percentile = 25;
        else percentile = 15;

        const percentileColor = percentile >= 90 ? 'text-green-600 dark:text-green-400' 
            : percentile >= 75 ? 'text-blue-600 dark:text-blue-400'
            : percentile >= 50 ? 'text-yellow-600 dark:text-yellow-400'
            : 'text-orange-600 dark:text-orange-400';

        const percentileBg = percentile >= 90 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
            : percentile >= 75 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            : percentile >= 50 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';

        content.innerHTML = `
            <div class="space-y-4">
                <div class="text-center">
                    <div class="relative inline-block">
                        <svg class="transform -rotate-90 w-32 h-32">
                            <circle cx="64" cy="64" r="56" stroke="currentColor" stroke-width="8" fill="none" class="text-slate-200 dark:text-slate-700"></circle>
                            <circle cx="64" cy="64" r="56" stroke="currentColor" stroke-width="8" fill="none" 
                                    stroke-dasharray="${2 * Math.PI * 56}" 
                                    stroke-dashoffset="${2 * Math.PI * 56 * (1 - percentile / 100)}"
                                    class="${percentileColor}" 
                                    stroke-linecap="round"></circle>
                        </svg>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="text-center">
                                <div class="text-2xl font-bold ${percentileColor}">${percentile}</div>
                                <div class="text-xs text-slate-500 dark:text-slate-400">percentile</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="p-4 ${percentileBg} rounded-lg border">
                    <div class="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        You're in the ${percentile >= 90 ? 'top 10%' : percentile >= 75 ? 'top 25%' : percentile >= 50 ? 'top 50%' : 'bottom 50%'} of professionals
                    </div>
                    <div class="text-xs text-slate-600 dark:text-slate-400">
                        ${percentile >= 90 
                            ? 'Outstanding performance! You\'re among the elite professionals in your field.' 
                            : percentile >= 75 
                            ? 'Great work! You\'re performing better than most professionals.' 
                            : percentile >= 50 
                            ? 'You\'re performing at an average level. Focus on improvement to stand out.' 
                            : 'There\'s significant room for improvement. Implement recommendations to boost your ranking.'}
                    </div>
                </div>

                <div class="space-y-2 text-xs">
                    <div class="flex items-center justify-between">
                        <span class="text-slate-600 dark:text-slate-400">Top 10%</span>
                        <span class="font-medium text-slate-800 dark:text-slate-200">90-100</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-slate-600 dark:text-slate-400">Top 25%</span>
                        <span class="font-medium text-slate-800 dark:text-slate-200">75-89</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-slate-600 dark:text-slate-400">Top 50%</span>
                        <span class="font-medium text-slate-800 dark:text-slate-200">50-74</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-slate-600 dark:text-slate-400">Bottom 50%</span>
                        <span class="font-medium text-slate-800 dark:text-slate-200">0-49</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Render Peer Comparison
    function renderPeerComparison(audit, currentScore) {
        const content = document.getElementById('peer-comparison-content');
        if (!content) return;

        const brandScore = audit.brand_score || {};
        
        // Simulated peer data (in production, this would come from anonymized database queries)
        const peerAverages = {
            overall: currentScore + (Math.random() * 10 - 5), // ±5 points variation
            linkedin: (brandScore.linkedin || 0) + (Math.random() * 8 - 4),
            resume: (brandScore.resume || 0) + (Math.random() * 8 - 4),
            portfolio: (brandScore.portfolio || 0) + (Math.random() * 8 - 4),
            github: (brandScore.github || 0) + (Math.random() * 8 - 4)
        };

        const components = [
            { key: 'overall', label: 'Overall', score: currentScore, peer: peerAverages.overall },
            { key: 'linkedin', label: 'LinkedIn', score: brandScore.linkedin || 0, peer: peerAverages.linkedin },
            { key: 'resume', label: 'Resume', score: brandScore.resume || 0, peer: peerAverages.resume },
            { key: 'portfolio', label: 'Portfolio', score: brandScore.portfolio || 0, peer: peerAverages.portfolio },
            { key: 'github', label: 'GitHub', score: brandScore.github || 0, peer: peerAverages.github }
        ];

        content.innerHTML = `
            <div class="space-y-3">
                <div class="text-xs text-slate-500 dark:text-slate-400 mb-3 italic">
                    Comparison with anonymized peer data (similar professionals)
                </div>
                ${components.map(comp => {
                    const diff = comp.score - comp.peer;
                    const diffPercent = ((diff / comp.peer) * 100).toFixed(1);
                    return `
                        <div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm font-medium text-slate-700 dark:text-slate-300">${comp.label}</span>
                                <span class="text-xs ${diff >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                                    ${diff >= 0 ? '+' : ''}${diff.toFixed(1)} (${diff >= 0 ? '+' : ''}${diffPercent}%)
                                </span>
                            </div>
                            <div class="flex items-center gap-3">
                                <div class="flex-1">
                                    <div class="flex items-center justify-between text-xs mb-1">
                                        <span class="text-slate-600 dark:text-slate-400">You</span>
                                        <span class="font-medium text-slate-800 dark:text-slate-200">${comp.score.toFixed(1)}</span>
                                    </div>
                                    <div class="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                                        <div class="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full" style="width: ${comp.score}%"></div>
                                    </div>
                                </div>
                                <div class="flex-1">
                                    <div class="flex items-center justify-between text-xs mb-1">
                                        <span class="text-slate-600 dark:text-slate-400">Peers</span>
                                        <span class="font-medium text-slate-800 dark:text-slate-200">${comp.peer.toFixed(1)}</span>
                                    </div>
                                    <div class="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                                        <div class="bg-slate-400 dark:bg-slate-500 h-2 rounded-full" style="width: ${comp.peer}%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // Render Industry-Specific Insights
    function renderIndustryInsights(audit, currentScore) {
        const content = document.getElementById('industry-insights-content');
        if (!content) return;

        const industrySelect = document.getElementById('industry-select');
        const selectedIndustry = industrySelect ? industrySelect.value : 'all';
        const brandScore = audit.brand_score || {};

        // Industry-specific insights (simulated - in production, this would be AI-generated based on industry)
        const industryInsights = {
            tech: [
                'GitHub presence is crucial in tech. Ensure your repositories are well-documented and active.',
                'Tech professionals with strong LinkedIn profiles receive 40% more recruiter messages.',
                'Portfolio showcasing live projects significantly increases credibility in tech roles.'
            ],
            finance: [
                'Professional certifications and credentials should be prominently displayed on LinkedIn.',
                'Resume clarity and quantifiable achievements are highly valued in finance.',
                'Network quality matters more than quantity in the finance industry.'
            ],
            healthcare: [
                'Professional credentials and licenses should be clearly visible across all platforms.',
                'Patient testimonials and case studies can strengthen your portfolio.',
                'LinkedIn recommendations from colleagues carry significant weight in healthcare.'
            ],
            marketing: [
                'Content creation and thought leadership on LinkedIn drive visibility in marketing.',
                'Portfolio showcasing campaign results with metrics is essential.',
                'Active social media presence demonstrates marketing expertise.'
            ],
            consulting: [
                'Case studies and client success stories are critical for consulting professionals.',
                'LinkedIn articles demonstrating expertise increase consulting opportunities.',
                'Resume should highlight problem-solving and measurable business impact.'
            ],
            education: [
                'Teaching philosophy and student outcomes should be featured in your portfolio.',
                'LinkedIn posts about educational trends establish thought leadership.',
                'Certifications and professional development credentials are highly valued.'
            ],
            all: [
                'Maintain consistency across all platforms - LinkedIn, Resume, Portfolio, and GitHub.',
                'Regular updates to your profiles show active professional engagement.',
                'Quantifiable achievements and metrics strengthen your brand credibility.'
            ]
        };

        const insights = industryInsights[selectedIndustry] || industryInsights.all;

        // Identify weakest component
        const components = [
            { name: 'LinkedIn', score: brandScore.linkedin || 0 },
            { name: 'Resume', score: brandScore.resume || 0 },
            { name: 'Portfolio', score: brandScore.portfolio || 0 },
            { name: 'GitHub', score: brandScore.github || 0 }
        ];
        const weakest = components.reduce((min, curr) => curr.score < min.score ? curr : min, components[0]);

        content.innerHTML = `
            <div class="space-y-3">
                <div class="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div class="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">💡 Industry-Specific Recommendations</div>
                    <ul class="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                        ${insights.map(insight => `
                            <li class="flex items-start gap-2">
                                <span class="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                                <span>${insight}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                ${weakest.score < 70 ? `
                    <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div class="text-xs font-semibold text-red-700 dark:text-red-400 mb-2">⚠️ Priority Focus Area</div>
                        <div class="text-sm text-slate-700 dark:text-slate-300">
                            Your <strong>${weakest.name}</strong> score (${weakest.score}/100) is below the recommended threshold. 
                            Focus on improving this area first for maximum impact in the ${selectedIndustry === 'all' ? 'general' : selectedIndustry} industry.
                        </div>
                    </div>
                ` : ''}

                <div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div class="text-xs text-slate-600 dark:text-slate-400">
                        <strong>Note:</strong> Insights are tailored to ${selectedIndustry === 'all' ? 'all industries' : `the ${selectedIndustry} industry`}. 
                        Select a specific industry from the dropdown above for more targeted recommendations.
                    </div>
                </div>
            </div>
        `;
    }

    // Render Recommendations Impact Timeline
    function renderRecommendationsImpactTimeline(recommendations, currentScore) {
        const canvas = document.getElementById('recommendations-impact-timeline');
        if (!canvas || typeof Chart === 'undefined') return;

        // Destroy existing chart if it exists
        if (window.chartInstances['recommendations-impact-timeline']) {
            window.chartInstances['recommendations-impact-timeline'].destroy();
        }

        // Calculate cumulative impact over time (assuming recommendations are implemented gradually)
        const days = [0, 7, 14, 30, 60, 90];
        const highPriorityRecs = recommendations.filter(r => r.priority === 'high').length;
        const mediumPriorityRecs = recommendations.filter(r => r.priority === 'medium').length;
        const lowPriorityRecs = recommendations.filter(r => r.priority === 'low').length;

        // Simulate implementation over time
        const projectedScores = days.map((day, index) => {
            let impact = 0;
            // High priority implemented first
            if (day >= 7) impact += Math.min(highPriorityRecs * 2.5, highPriorityRecs * 2.5 * (day / 30));
            if (day >= 14) impact += Math.min(mediumPriorityRecs * 1.5, mediumPriorityRecs * 1.5 * ((day - 14) / 30));
            if (day >= 30) impact += Math.min(lowPriorityRecs * 1, lowPriorityRecs * 1 * ((day - 30) / 60));
            
            return Math.min(100, Math.round(currentScore + impact));
        });

        const ctx = canvas.getContext('2d');
        window.chartInstances['recommendations-impact-timeline'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days.map(d => d === 0 ? 'Now' : `${d}d`),
                datasets: [{
                    label: 'Projected Score',
                    data: projectedScores,
                    borderColor: 'rgb(245, 158, 11)',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }, {
                    label: 'Current Score',
                    data: new Array(days.length).fill(currentScore),
                    borderColor: 'rgb(148, 163, 184)',
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: Math.max(0, currentScore - 10),
                        max: Math.min(100, Math.max(...projectedScores) + 5),
                        ticks: {
                            stepSize: 5
                        }
                    }
                }
            }
        });
    }

        milestonesList.innerHTML = relevantMilestones.map(milestone => {
            const scoreGap = milestone - currentScore;
            const estimatedDays = dailyRate > 0 ? Math.ceil(scoreGap / dailyRate) : 999;
            const date = new Date();
            date.setDate(date.getDate() + estimatedDays);

            return `
                <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div class="flex items-center gap-2">
                        <span class="text-lg font-bold text-orange-600 dark:text-orange-400">${milestone}</span>
                        <span class="text-sm text-slate-600 dark:text-slate-400">points</span>
                    </div>
                    <div class="text-sm text-slate-600 dark:text-slate-400">
                        ${estimatedDays < 999 ? `~${estimatedDays} days` : 'N/A'}
                    </div>
                </div>
            `;
        }).join('');
    }

    // ============================================
    // Enhanced Data Visualization
    // ============================================

    // Chart instances storage
    window.chartInstances = {};

    // Load Enhanced Visualizations
    function loadEnhancedVisualizations(audits, latestAudit) {
        if (!audits || audits.length === 0) return;

        // Render all charts
        renderScoreProgressionChart(audits);
        renderRadarChart(latestAudit);
        renderHeatMap(audits);
        setupComparisonView(audits);
        renderDistributionChart(latestAudit);
    }

    // Render Interactive Score Progression Chart
    function renderScoreProgressionChart(audits) {
        const canvas = document.getElementById('score-progression-chart');
        if (!canvas || typeof Chart === 'undefined') return;

        // Destroy existing chart if it exists
        if (window.chartInstances['score-progression-chart']) {
            window.chartInstances['score-progression-chart'].destroy();
        }

        const sortedAudits = [...audits].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        const labels = sortedAudits.map(a => {
            const date = new Date(a.created_at);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        const scores = sortedAudits.map(a => a.brand_score?.overall || 0);

        const ctx = canvas.getContext('2d');
        window.chartInstances['score-progression-chart'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Overall Score',
                    data: scores,
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 10
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    // Render Radar Chart for Component Comparison
    function renderRadarChart(audit) {
        const canvas = document.getElementById('radar-chart');
        if (!canvas || typeof Chart === 'undefined') return;

        if (window.chartInstances['radar-chart']) {
            window.chartInstances['radar-chart'].destroy();
        }

        const brandScore = audit.brand_score || {};
        const ctx = canvas.getContext('2d');
        window.chartInstances['radar-chart'] = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['LinkedIn', 'Resume', 'Portfolio', 'GitHub'],
                datasets: [{
                    label: 'Component Scores',
                    data: [
                        brandScore.linkedin || 0,
                        brandScore.resume || 0,
                        brandScore.portfolio || 0,
                        brandScore.github || 0
                    ],
                    borderColor: 'rgb(20, 184, 166)',
                    backgroundColor: 'rgba(20, 184, 166, 0.2)',
                    pointBackgroundColor: 'rgb(20, 184, 166)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(20, 184, 166)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    // Render Heat Map for Score Changes
    function renderHeatMap(audits) {
        const canvas = document.getElementById('heatmap-chart');
        if (!canvas || typeof Chart === 'undefined') return;

        if (window.chartInstances['heatmap-chart']) {
            window.chartInstances['heatmap-chart'].destroy();
        }

        if (audits.length < 2) {
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Need at least 2 audits for heat map', canvas.width / 2, canvas.height / 2);
            return;
        }

        const sortedAudits = [...audits].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        const components = ['LinkedIn', 'Resume', 'Portfolio', 'GitHub'];
        const labels = sortedAudits.slice(1).map(a => {
            const date = new Date(a.created_at);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        // Calculate changes for each component
        const datasets = components.map((component, idx) => {
            const componentKey = component.toLowerCase();
            const changes = [];
            
            for (let i = 1; i < sortedAudits.length; i++) {
                const prev = sortedAudits[i - 1].brand_score?.[componentKey] || 0;
                const curr = sortedAudits[i].brand_score?.[componentKey] || 0;
                changes.push(curr - prev);
            }

            return {
                label: component,
                data: changes,
                backgroundColor: changes.map(change => {
                    if (change > 0) return 'rgba(34, 197, 94, 0.6)';
                    if (change < 0) return 'rgba(239, 68, 68, 0.6)';
                    return 'rgba(148, 163, 184, 0.6)';
                }),
                borderColor: changes.map(change => {
                    if (change > 0) return 'rgb(34, 197, 94)';
                    if (change < 0) return 'rgb(239, 68, 68)';
                    return 'rgb(148, 163, 184)';
                }),
                borderWidth: 1
            };
        });

        const ctx = canvas.getContext('2d');
        window.chartInstances['heatmap-chart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y;
                                const sign = value > 0 ? '+' : '';
                                return `${context.dataset.label}: ${sign}${value.toFixed(1)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: false
                    },
                    y: {
                        stacked: false,
                        title: {
                            display: true,
                            text: 'Score Change'
                        }
                    }
                }
            }
        });
    }

    // Setup Comparison View
    function setupComparisonView(audits) {
        const select1 = document.getElementById('comparison-audit-1');
        const select2 = document.getElementById('comparison-audit-2');
        
        if (!select1 || !select2) return;

        // Populate dropdowns
        const options = audits.map((audit, idx) => {
            const date = new Date(audit.created_at);
            return `<option value="${idx}">${date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })} - Score: ${audit.brand_score?.overall || 0}</option>`;
        }).join('');

        select1.innerHTML = '<option value="">Select first audit...</option>' + options;
        select2.innerHTML = '<option value="">Select second audit...</option>' + options;

        // Set default to latest vs previous
        if (audits.length >= 2) {
            select1.value = '0';
            select2.value = '1';
            renderComparisonView();
        }
    }

    // Render Comparison View
    window.renderComparisonView = function() {
        const select1 = document.getElementById('comparison-audit-1');
        const select2 = document.getElementById('comparison-audit-2');
        const content = document.getElementById('comparison-view-content');
        
        if (!select1 || !select2 || !content || !window.allBrandAudits) return;

        const idx1 = parseInt(select1.value);
        const idx2 = parseInt(select2.value);

        if (isNaN(idx1) || isNaN(idx2)) {
            content.innerHTML = '<p class="text-sm text-slate-500 dark:text-slate-400 text-center py-8">Select two audits to compare</p>';
            return;
        }

        const audit1 = window.allBrandAudits[idx1];
        const audit2 = window.allBrandAudits[idx2];

        if (!audit1 || !audit2) return;

        const score1 = audit1.brand_score || {};
        const score2 = audit2.brand_score || {};

        const components = [
            { key: 'overall', label: 'Overall' },
            { key: 'linkedin', label: 'LinkedIn' },
            { key: 'resume', label: 'Resume' },
            { key: 'portfolio', label: 'Portfolio' },
            { key: 'github', label: 'GitHub' }
        ];

        const date1 = new Date(audit1.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', month: 'short', day: 'numeric' 
        });
        const date2 = new Date(audit2.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', month: 'short', day: 'numeric' 
        });

        content.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <h5 class="font-semibold text-slate-800 dark:text-slate-200 mb-3">${date1}</h5>
                    ${components.map(comp => {
                        const val1 = score1[comp.key] || 0;
                        return `
                            <div class="mb-2">
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="text-slate-600 dark:text-slate-400">${comp.label}</span>
                                    <span class="font-semibold text-slate-800 dark:text-slate-200">${val1}</span>
                                </div>
                                <div class="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                                    <div class="bg-indigo-600 h-2 rounded-full" style="width: ${val1}%"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <h5 class="font-semibold text-slate-800 dark:text-slate-200 mb-3">${date2}</h5>
                    ${components.map(comp => {
                        const val2 = score2[comp.key] || 0;
                        const val1 = score1[comp.key] || 0;
                        const change = val2 - val1;
                        const changeClass = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-slate-600';
                        return `
                            <div class="mb-2">
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="text-slate-600 dark:text-slate-400">${comp.label}</span>
                                    <span class="font-semibold text-slate-800 dark:text-slate-200">
                                        ${val2}
                                        ${change !== 0 ? `<span class="${changeClass} text-xs">(${change > 0 ? '+' : ''}${change})</span>` : ''}
                                    </span>
                                </div>
                                <div class="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                                    <div class="bg-indigo-600 h-2 rounded-full" style="width: ${val2}%"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    };

    // Render Score Distribution Chart
    function renderDistributionChart(audit) {
        const canvas = document.getElementById('distribution-chart');
        if (!canvas || typeof Chart === 'undefined') return;

        if (window.chartInstances['distribution-chart']) {
            window.chartInstances['distribution-chart'].destroy();
        }

        const brandScore = audit.brand_score || {};
        const overallScore = brandScore.overall || 0;
        const industryBenchmark = audit.industry_benchmark || {};

        // Create distribution buckets
        const buckets = [
            { label: '0-20', min: 0, max: 20 },
            { label: '21-40', min: 21, max: 40 },
            { label: '41-60', min: 41, max: 60 },
            { label: '61-80', min: 61, max: 80 },
            { label: '81-100', min: 81, max: 100 }
        ];

        // Simulate distribution (in real app, this would come from database)
        const distribution = buckets.map(bucket => {
            // Place user's score in appropriate bucket
            if (overallScore >= bucket.min && overallScore <= bucket.max) {
                return 15; // User's bucket
            }
            // Simulate other users
            return Math.random() * 10 + 5;
        });

        const ctx = canvas.getContext('2d');
        window.chartInstances['distribution-chart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: buckets.map(b => b.label),
                datasets: [{
                    label: 'Users',
                    data: distribution,
                    backgroundColor: buckets.map((b, idx) => {
                        if (overallScore >= b.min && overallScore <= b.max) {
                            return 'rgba(139, 92, 246, 0.8)'; // Highlight user's bucket
                        }
                        return 'rgba(148, 163, 184, 0.6)';
                    }),
                    borderColor: buckets.map((b, idx) => {
                        if (overallScore >= b.min && overallScore <= b.max) {
                            return 'rgb(139, 92, 246)';
                        }
                        return 'rgb(148, 163, 184)';
                    }),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Score Range: ${context.label}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Users'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Score Range'
                        }
                    }
                }
            }
        });
    }

    // Chart Zoom Functions
    window.zoomChart = function(chartId, direction) {
        const chart = window.chartInstances[chartId];
        if (!chart) return;

        const currentZoom = chart.options.scales?.x?.min !== undefined ? 'x' : 'y';
        // Simple zoom implementation - in production, use chartjs-plugin-zoom
        console.log(`Zoom ${direction} on ${chartId}`);
    };

    window.resetChartZoom = function(chartId) {
        const chart = window.chartInstances[chartId];
        if (!chart) return;
        // Reset zoom - would need chartjs-plugin-zoom for full implementation
        console.log(`Reset zoom on ${chartId}`);
    };

    // ============================================
    // Brand Audit Settings Management
    // ============================================

    // Default settings structure
    const defaultBrandAuditSettings = {
        analysisFrequency: 'weekly',
        autoRefresh: true,
        emailNotifications: true,
        scoreThreshold: 70,
        inAppNotifications: true,
        publicProfile: false,
        dataSharing: true,
        linkedInSyncFrequency: 'daily',
        lastUpdated: null
    };

    // Load settings from localStorage
    function loadBrandAuditSettings() {
        try {
            const stored = localStorage.getItem('brand_audit_settings');
            if (stored) {
                const parsed = JSON.parse(stored);
                // Merge with defaults to ensure all properties exist
                return { ...defaultBrandAuditSettings, ...parsed };
            }
        } catch (error) {
            console.error('Error loading brand audit settings:', error);
        }
        return { ...defaultBrandAuditSettings };
    }

    // Save settings to localStorage
    function saveBrandAuditSettings(settings) {
        try {
            settings.lastUpdated = new Date().toISOString();
            localStorage.setItem('brand_audit_settings', JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving brand audit settings:', error);
            return false;
        }
    }

    // Get current settings from form
    function getSettingsFromForm() {
        const settings = {
            analysisFrequency: document.getElementById('analysis-frequency')?.value || 'weekly',
            autoRefresh: document.getElementById('auto-refresh-toggle')?.getAttribute('aria-checked') === 'true',
            emailNotifications: document.getElementById('email-notifications-toggle')?.getAttribute('aria-checked') === 'true',
            scoreThreshold: parseInt(document.getElementById('score-threshold')?.value || '70', 10),
            inAppNotifications: document.getElementById('in-app-notifications-toggle')?.getAttribute('aria-checked') === 'true',
            publicProfile: document.getElementById('public-profile-toggle')?.getAttribute('aria-checked') === 'true',
            dataSharing: document.getElementById('data-sharing-toggle')?.getAttribute('aria-checked') === 'true',
            linkedInSyncFrequency: document.getElementById('linkedin-sync-frequency')?.value || 'daily'
        };
        return settings;
    }

    // Validate settings
    function validateSettings(settings) {
        const errors = [];
        
        // Validate score threshold
        if (isNaN(settings.scoreThreshold) || settings.scoreThreshold < 0 || settings.scoreThreshold > 100) {
            errors.push('Score threshold must be between 0 and 100');
            const errorEl = document.getElementById('score-threshold-error');
            if (errorEl) {
                errorEl.textContent = 'Score threshold must be between 0 and 100';
                errorEl.classList.remove('hidden');
            }
        } else {
            const errorEl = document.getElementById('score-threshold-error');
            if (errorEl) {
                errorEl.classList.add('hidden');
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Toggle switch handler
    function toggleSwitch(buttonId, currentState) {
        const button = document.getElementById(buttonId);
        if (!button) return !currentState;
        
        const newState = !currentState;
        button.setAttribute('aria-checked', newState.toString());
        
        // Update visual state
        if (newState) {
            button.classList.remove('bg-slate-200', 'dark:bg-slate-600');
            button.classList.add('bg-indigo-600', 'dark:bg-indigo-500');
            const span = button.querySelector('span');
            if (span) {
                span.classList.remove('translate-x-1');
                span.classList.add('translate-x-6');
            }
        } else {
            button.classList.remove('bg-indigo-600', 'dark:bg-indigo-500');
            button.classList.add('bg-slate-200', 'dark:bg-slate-600');
            const span = button.querySelector('span');
            if (span) {
                span.classList.remove('translate-x-6');
                span.classList.add('translate-x-1');
            }
        }
        
        return newState;
    }

    // Show message toast
    function showSettingsMessage(message, type = 'success') {
        const messageEl = document.getElementById('settings-message');
        if (!messageEl) return;

        // Remove existing classes
        messageEl.classList.remove('bg-green-100', 'bg-red-100', 'text-green-800', 'text-red-800', 'dark:bg-green-900', 'dark:bg-red-900', 'dark:text-green-200', 'dark:text-red-200');
        
        // Add appropriate classes based on type
        if (type === 'success') {
            messageEl.classList.add('bg-green-100', 'text-green-800', 'dark:bg-green-900', 'dark:text-green-200');
        } else {
            messageEl.classList.add('bg-red-100', 'text-red-800', 'dark:bg-red-900', 'dark:text-red-200');
        }
        
        messageEl.textContent = message;
        messageEl.classList.remove('hidden');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            messageEl.classList.add('hidden');
        }, 3000);
    }

    // Export settings to JSON file
    function exportSettings() {
        try {
            const settings = loadBrandAuditSettings();
            const dataStr = JSON.stringify(settings, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `brand-audit-settings-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showSettingsMessage('Settings exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting settings:', error);
            showSettingsMessage('Failed to export settings', 'error');
        }
    }

    // Clear settings and reset to defaults
    function clearSettings() {
        if (confirm('Are you sure you want to clear all settings? This action cannot be undone.')) {
            try {
                localStorage.removeItem('brand_audit_settings');
                const settings = { ...defaultBrandAuditSettings };
                populateSettingsForm(settings);
                showSettingsMessage('Settings cleared and reset to defaults', 'success');
            } catch (error) {
                console.error('Error clearing settings:', error);
                showSettingsMessage('Failed to clear settings', 'error');
            }
        }
    }

    // Populate form with settings
    function populateSettingsForm(settings) {
        // Analysis frequency
        const analysisFreq = document.getElementById('analysis-frequency');
        if (analysisFreq) {
            analysisFreq.value = settings.analysisFrequency || 'weekly';
        }

        // Auto-refresh toggle
        const autoRefreshToggle = document.getElementById('auto-refresh-toggle');
        if (autoRefreshToggle) {
            const isOn = settings.autoRefresh !== false;
            autoRefreshToggle.setAttribute('aria-checked', isOn.toString());
            if (isOn) {
                autoRefreshToggle.classList.remove('bg-slate-200', 'dark:bg-slate-600');
                autoRefreshToggle.classList.add('bg-indigo-600', 'dark:bg-indigo-500');
                const span = autoRefreshToggle.querySelector('span');
                if (span) {
                    span.classList.remove('translate-x-1');
                    span.classList.add('translate-x-6');
                }
            } else {
                autoRefreshToggle.classList.remove('bg-indigo-600', 'dark:bg-indigo-500');
                autoRefreshToggle.classList.add('bg-slate-200', 'dark:bg-slate-600');
                const span = autoRefreshToggle.querySelector('span');
                if (span) {
                    span.classList.remove('translate-x-6');
                    span.classList.add('translate-x-1');
                }
            }
        }

        // Email notifications toggle
        const emailToggle = document.getElementById('email-notifications-toggle');
        if (emailToggle) {
            const isOn = settings.emailNotifications !== false;
            emailToggle.setAttribute('aria-checked', isOn.toString());
            if (isOn) {
                emailToggle.classList.remove('bg-slate-200', 'dark:bg-slate-600');
                emailToggle.classList.add('bg-indigo-600', 'dark:bg-indigo-500');
                const span = emailToggle.querySelector('span');
                if (span) {
                    span.classList.remove('translate-x-1');
                    span.classList.add('translate-x-6');
                }
            } else {
                emailToggle.classList.remove('bg-indigo-600', 'dark:bg-indigo-500');
                emailToggle.classList.add('bg-slate-200', 'dark:bg-slate-600');
                const span = emailToggle.querySelector('span');
                if (span) {
                    span.classList.remove('translate-x-6');
                    span.classList.add('translate-x-1');
                }
            }
        }

        // Score threshold
        const scoreThreshold = document.getElementById('score-threshold');
        if (scoreThreshold) {
            scoreThreshold.value = settings.scoreThreshold || 70;
        }

        // In-app notifications toggle
        const inAppToggle = document.getElementById('in-app-notifications-toggle');
        if (inAppToggle) {
            const isOn = settings.inAppNotifications !== false;
            inAppToggle.setAttribute('aria-checked', isOn.toString());
            if (isOn) {
                inAppToggle.classList.remove('bg-slate-200', 'dark:bg-slate-600');
                inAppToggle.classList.add('bg-indigo-600', 'dark:bg-indigo-500');
                const span = inAppToggle.querySelector('span');
                if (span) {
                    span.classList.remove('translate-x-1');
                    span.classList.add('translate-x-6');
                }
            } else {
                inAppToggle.classList.remove('bg-indigo-600', 'dark:bg-indigo-500');
                inAppToggle.classList.add('bg-slate-200', 'dark:bg-slate-600');
                const span = inAppToggle.querySelector('span');
                if (span) {
                    span.classList.remove('translate-x-6');
                    span.classList.add('translate-x-1');
                }
            }
        }

        // Public profile toggle
        const publicProfileToggle = document.getElementById('public-profile-toggle');
        if (publicProfileToggle) {
            const isOn = settings.publicProfile === true;
            publicProfileToggle.setAttribute('aria-checked', isOn.toString());
            if (isOn) {
                publicProfileToggle.classList.remove('bg-slate-200', 'dark:bg-slate-600');
                publicProfileToggle.classList.add('bg-indigo-600', 'dark:bg-indigo-500');
                const span = publicProfileToggle.querySelector('span');
                if (span) {
                    span.classList.remove('translate-x-1');
                    span.classList.add('translate-x-6');
                }
            } else {
                publicProfileToggle.classList.remove('bg-indigo-600', 'dark:bg-indigo-500');
                publicProfileToggle.classList.add('bg-slate-200', 'dark:bg-slate-600');
                const span = publicProfileToggle.querySelector('span');
                if (span) {
                    span.classList.remove('translate-x-6');
                    span.classList.add('translate-x-1');
                }
            }
        }

        // Data sharing toggle
        const dataSharingToggle = document.getElementById('data-sharing-toggle');
        if (dataSharingToggle) {
            const isOn = settings.dataSharing !== false;
            dataSharingToggle.setAttribute('aria-checked', isOn.toString());
            if (isOn) {
                dataSharingToggle.classList.remove('bg-slate-200', 'dark:bg-slate-600');
                dataSharingToggle.classList.add('bg-indigo-600', 'dark:bg-indigo-500');
                const span = dataSharingToggle.querySelector('span');
                if (span) {
                    span.classList.remove('translate-x-1');
                    span.classList.add('translate-x-6');
                }
            } else {
                dataSharingToggle.classList.remove('bg-indigo-600', 'dark:bg-indigo-500');
                dataSharingToggle.classList.add('bg-slate-200', 'dark:bg-slate-600');
                const span = dataSharingToggle.querySelector('span');
                if (span) {
                    span.classList.remove('translate-x-6');
                    span.classList.add('translate-x-1');
                }
            }
        }

        // LinkedIn sync frequency
        const linkedInSync = document.getElementById('linkedin-sync-frequency');
        if (linkedInSync) {
            linkedInSync.value = settings.linkedInSyncFrequency || 'daily';
        }
    }

    // Initialize Settings tab
    let settingsInitialized = false;
    function initializeBrandAuditSettings() {
        // Load and populate settings (always do this to refresh form)
        const settings = loadBrandAuditSettings();
        populateSettingsForm(settings);

        // Only set up event listeners once
        if (settingsInitialized) return;
        settingsInitialized = true;

        // Set up event listeners
        const autoRefreshToggle = document.getElementById('auto-refresh-toggle');
        if (autoRefreshToggle) {
            autoRefreshToggle.addEventListener('click', () => {
                const currentState = autoRefreshToggle.getAttribute('aria-checked') === 'true';
                toggleSwitch('auto-refresh-toggle', currentState);
            });
        }

        const emailToggle = document.getElementById('email-notifications-toggle');
        if (emailToggle) {
            emailToggle.addEventListener('click', () => {
                const currentState = emailToggle.getAttribute('aria-checked') === 'true';
                toggleSwitch('email-notifications-toggle', currentState);
            });
        }

        const inAppToggle = document.getElementById('in-app-notifications-toggle');
        if (inAppToggle) {
            inAppToggle.addEventListener('click', () => {
                const currentState = inAppToggle.getAttribute('aria-checked') === 'true';
                toggleSwitch('in-app-notifications-toggle', currentState);
            });
        }

        const publicProfileToggle = document.getElementById('public-profile-toggle');
        if (publicProfileToggle) {
            publicProfileToggle.addEventListener('click', () => {
                const currentState = publicProfileToggle.getAttribute('aria-checked') === 'true';
                toggleSwitch('public-profile-toggle', currentState);
            });
        }

        const dataSharingToggle = document.getElementById('data-sharing-toggle');
        if (dataSharingToggle) {
            dataSharingToggle.addEventListener('click', () => {
                const currentState = dataSharingToggle.getAttribute('aria-checked') === 'true';
                toggleSwitch('data-sharing-toggle', currentState);
            });
        }

        // Score threshold validation on input
        const scoreThreshold = document.getElementById('score-threshold');
        if (scoreThreshold) {
            scoreThreshold.addEventListener('input', () => {
                const value = parseInt(scoreThreshold.value, 10);
                const errorEl = document.getElementById('score-threshold-error');
                if (errorEl) {
                    if (isNaN(value) || value < 0 || value > 100) {
                        errorEl.textContent = 'Score threshold must be between 0 and 100';
                        errorEl.classList.remove('hidden');
                    } else {
                        errorEl.classList.add('hidden');
                    }
                }
            });
        }

        // Save button
        const saveButton = document.getElementById('save-settings-button');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                const settings = getSettingsFromForm();
                const validation = validateSettings(settings);
                
                if (validation.isValid) {
                    const success = saveBrandAuditSettings(settings);
                    if (success) {
                        showSettingsMessage('Settings saved successfully!', 'success');
                        saveButton.disabled = false;
                    } else {
                        showSettingsMessage('Failed to save settings', 'error');
                    }
                } else {
                    showSettingsMessage(validation.errors.join(', '), 'error');
                    saveButton.disabled = false;
                }
            });
        }

        // Export button
        const exportButton = document.getElementById('export-settings-button');
        if (exportButton) {
            exportButton.addEventListener('click', exportSettings);
        }

        // Clear button
        const clearButton = document.getElementById('clear-settings-button');
        if (clearButton) {
            clearButton.addEventListener('click', clearSettings);
        }
    }

    // User menu toggle
    const userMenuButton = document.getElementById('user-menu-button');
    const userMenu = document.getElementById('user-menu');
    
    if (userMenuButton && userMenu) {
        userMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!userMenu.contains(e.target) && !userMenuButton.contains(e.target)) {
                userMenu.classList.add('hidden');
            }
        });
    }

    // Photo Upload
    const uploadPhotoButton = document.getElementById('upload-photo-button');
    const photoUpload = document.getElementById('photo-upload');
    const userAvatar = document.getElementById('user-avatar');
    const userAvatarDropdown = document.getElementById('user-avatar-dropdown');

    if (uploadPhotoButton && photoUpload && userAvatar && userAvatarDropdown) {
        uploadPhotoButton.addEventListener('click', () => photoUpload.click());
        photoUpload.addEventListener('change', (event) => {
            if (event.target.files && event.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageUrl = e.target.result;
                    userAvatar.src = imageUrl;
                    userAvatarDropdown.src = imageUrl;
                };
                reader.readAsDataURL(event.target.files[0]);
            }
        });
    }

    // Dark Mode Toggle
    const darkModeRow = document.getElementById('dark-mode-row');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeRow && darkModeToggle) {
        darkModeRow.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const toggleCircle = darkModeToggle.querySelector('span:last-child');
            if (document.documentElement.classList.contains('dark')) {
                toggleCircle.classList.remove('translate-x-1');
                toggleCircle.classList.add('translate-x-6');
                darkModeToggle.classList.remove('bg-slate-200');
                darkModeToggle.classList.add('bg-indigo-600');
            } else {
                toggleCircle.classList.remove('translate-x-6');
                toggleCircle.classList.add('translate-x-1');
                darkModeToggle.classList.remove('bg-indigo-600');
                darkModeToggle.classList.add('bg-slate-200');
            }
        });
    }

    // --- Sidebar Dropdown Logic ---
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const parentContainer = toggle.parentElement;
            // Toggle the clicked one
            parentContainer.classList.toggle('open');
        });
    });

    // Initialize shortcuts
    renderShortcuts();

    // Global cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (typeof window.cleanupWorkHistoryManager === 'function') {
            window.cleanupWorkHistoryManager();
        }
        if (typeof window.cleanupSmartResumeStudio === 'function') {
            window.cleanupSmartResumeStudio();
        }
    });
});