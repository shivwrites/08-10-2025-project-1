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

            // For now, other tabs show a placeholder
            if (tabId !== 'dashboard') {
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