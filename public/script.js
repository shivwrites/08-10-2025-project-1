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

    mentorTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');

            // Update button styles
            mentorTabs.forEach(t => {
                t.classList.remove('active');
            });
            tab.classList.add('active');
            
            // Show content
            mentorTabContents.forEach(content => {
                if (content.id === `${tabId}-tab-content`) {
                    content.classList.remove('hidden');
                } else {
                    content.classList.add('hidden');
                }
            });

            // Initialize Settings tab if it's the Settings tab
            if (tabId === 'settings') {
                initializeBrandAuditSettings();
            } else if (tabId === 'goals') {
                // Render Goals component
                setTimeout(() => {
                    if (typeof window.renderBrandAuditGoals === 'function') {
                        window.renderBrandAuditGoals();
                    }
                }, 100);
            } else if (tabId === 'dashboard') {
                // Load goals for dashboard
                loadDashboardGoals();
            } else if (tabId !== 'dashboard') {
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