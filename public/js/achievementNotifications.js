/**
 * Achievement Reminders & Notifications
 * Smart notifications for achievements and streak maintenance
 */

/**
 * Get achievement notifications
 */
export function getAchievementNotifications(userMetrics, unlockedCodes, allDefinitions, userAchievements) {
    const notifications = [];
    const unlocked = new Set(unlockedCodes);
    
    // Check for close-to-unlock achievements
    const closeAchievements = allDefinitions
        .filter(a => !unlocked.has(a.code))
        .map(achievement => {
            const progress = calculateProgress(achievement, userMetrics);
            return { achievement, progress };
        })
        .filter(item => item.progress >= 80)
        .sort((a, b) => b.progress - a.progress)
        .slice(0, 3);
    
    closeAchievements.forEach(item => {
        notifications.push({
            type: 'close_to_unlock',
            priority: 'high',
            title: 'Almost There!',
            message: `You're ${100 - item.progress}% away from unlocking "${item.achievement.name}"`,
            achievement: item.achievement,
            progress: item.progress,
            action: `Focus on ${getActionForAchievement(item.achievement)}`,
            icon: '🎯',
            timestamp: new Date()
        });
    });
    
    // Check streak status
    if (window.AchievementStreaks) {
        const { calculateStreaks, isStreakAtRisk, getStreakMotivation } = window.AchievementStreaks;
        const streaks = calculateStreaks(userAchievements);
        
        if (streaks.currentStreak > 0) {
            if (isStreakAtRisk(streaks)) {
                notifications.push({
                    type: 'streak_at_risk',
                    priority: 'urgent',
                    title: 'Streak at Risk!',
                    message: `Your ${streaks.currentStreak}-day streak is about to break!`,
                    action: 'Unlock an achievement today to keep it alive',
                    icon: '⚠️',
                    timestamp: new Date()
                });
            } else if (streaks.currentStreak >= 3) {
                const nextMilestone = getNextStreakMilestone(streaks.currentStreak);
                if (nextMilestone) {
                    const daysLeft = nextMilestone.days - streaks.currentStreak;
                    if (daysLeft <= 3) {
                        notifications.push({
                            type: 'streak_milestone',
                            priority: 'medium',
                            title: 'Streak Milestone Coming!',
                            message: `Just ${daysLeft} more day${daysLeft > 1 ? 's' : ''} until ${nextMilestone.label}!`,
                            action: 'Keep your streak going',
                            icon: '🔥',
                            timestamp: new Date()
                        });
                    }
                }
            }
        }
    }
    
    // Check for new recommendations
    if (window.AchievementRecommendations) {
        const { getRecommendedAchievements } = window.AchievementRecommendations;
        const recommendations = getRecommendedAchievements(userMetrics, Array.from(unlockedCodes), allDefinitions);
        
        if (recommendations.length > 0) {
            const topRec = recommendations[0];
            if (topRec.progress >= 50) {
                notifications.push({
                    type: 'recommendation',
                    priority: 'medium',
                    title: 'Recommended Achievement',
                    message: `"${topRec.achievement.name}" is ${topRec.progress}% complete`,
                    achievement: topRec.achievement,
                    progress: topRec.progress,
                    action: topRec.reason,
                    icon: '💡',
                    timestamp: new Date()
                });
            }
        }
    }
    
    // Check collection progress
    if (window.AchievementCollections) {
        const { getCollectionsWithProgress } = window.AchievementCollections;
        const collections = getCollectionsWithProgress(Array.from(unlockedCodes), allDefinitions);
        
        const nearComplete = collections
            .filter(c => !c.progress.completed && c.progress.progress >= 80)
            .slice(0, 1);
        
        nearComplete.forEach(collection => {
            const remaining = collection.progress.total - collection.progress.unlocked;
            notifications.push({
                type: 'collection_progress',
                priority: 'medium',
                title: 'Collection Almost Complete!',
                message: `"${collection.name}" needs just ${remaining} more achievement${remaining > 1 ? 's' : ''}`,
                collection: collection,
                progress: collection.progress.progress,
                action: `Complete the ${collection.name} collection`,
                icon: '🏆',
                timestamp: new Date()
            });
        });
    }
    
    // Sort by priority
    const priorityOrder = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 };
    notifications.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    return notifications;
}

/**
 * Calculate progress for an achievement
 */
function calculateProgress(achievement, metrics) {
    const { criteriaType, criteriaValue } = achievement;
    
    switch (criteriaType) {
        case 'score_threshold':
            const overallScore = metrics.overallScore || metrics.overall || 0;
            return Math.min(100, Math.round((overallScore / criteriaValue.threshold) * 100));
        case 'metric_threshold':
            const metricValue = metrics[criteriaValue.metric] || 0;
            return Math.min(100, Math.round((metricValue / criteriaValue.threshold) * 100));
        case 'completeness':
            const completeness = metrics.profileCompleteness || metrics.completeness || 0;
            return Math.min(100, Math.round((completeness / criteriaValue.threshold) * 100));
        default:
            return 0;
    }
}

/**
 * Get action suggestion for achievement
 */
function getActionForAchievement(achievement) {
    const category = achievement.category;
    const actions = {
        'brand_score': 'improving your overall brand score',
        'engagement': 'increasing engagement with your network',
        'profile_completion': 'completing your profile sections',
        'content_creation': 'creating more content',
        'networking': 'building your professional network',
        'learning': 'completing courses or adding skills',
        'thought_leadership': 'publishing articles and sharing insights'
    };
    return actions[category] || 'working on your brand';
}

/**
 * Get next streak milestone
 */
function getNextStreakMilestone(currentStreak) {
    const milestones = [3, 7, 14, 30, 60, 100];
    const next = milestones.find(m => m > currentStreak);
    if (!next) return null;
    
    const labels = {
        3: '3-Day Streak',
        7: 'Week Streak',
        14: '2-Week Streak',
        30: 'Month Streak',
        60: '2-Month Streak',
        100: 'Centurion Streak'
    };
    
    return { days: next, label: labels[next] || `${next}-Day Streak` };
}

/**
 * Show notification toast
 */
export function showNotificationToast(notification) {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 max-w-md w-full transform transition-all duration-300 translate-x-full`;
    
    const priorityColors = {
        'urgent': 'bg-red-500 border-red-600',
        'high': 'bg-orange-500 border-orange-600',
        'medium': 'bg-blue-500 border-blue-600',
        'low': 'bg-slate-500 border-slate-600'
    };
    
    toast.innerHTML = `
        <div class="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border-l-4 ${priorityColors[notification.priority] || priorityColors['medium']} p-4">
            <div class="flex items-start gap-3">
                <div class="text-2xl">${notification.icon}</div>
                <div class="flex-1">
                    <h4 class="font-semibold text-slate-800 dark:text-slate-200 mb-1">${notification.title}</h4>
                    <p class="text-sm text-slate-600 dark:text-slate-400 mb-2">${notification.message}</p>
                    ${notification.action ? `
                        <p class="text-xs text-slate-500 dark:text-slate-500">💡 ${notification.action}</p>
                    ` : ''}
                    ${notification.achievement ? `
                        <button onclick="showAchievementModal('${notification.achievement.code}'); this.closest('.fixed').remove();" class="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                            View Achievement →
                        </button>
                    ` : ''}
                </div>
                <button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove after delay
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, notification.priority === 'urgent' ? 8000 : 5000);
}

/**
 * Render notifications panel
 */
export function renderNotificationsPanel(notifications, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-slate-500 dark:text-slate-400">
                <div class="text-3xl mb-2">🔔</div>
                <p class="text-sm">No notifications at the moment</p>
                <p class="text-xs mt-1">Keep working on your achievements!</p>
            </div>
        `;
        return;
    }
    
    const priorityColors = {
        'urgent': 'border-red-500 bg-red-50 dark:bg-red-900/20',
        'high': 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
        'medium': 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
        'low': 'border-slate-500 bg-slate-50 dark:bg-slate-900/20'
    };
    
    container.innerHTML = `
        <div class="space-y-3">
            ${notifications.map((notification, index) => `
                <div class="border-l-4 ${priorityColors[notification.priority] || priorityColors['medium']} rounded-lg p-4 cursor-pointer hover:shadow-md transition-all" onclick="${notification.achievement ? `showAchievementModal('${notification.achievement.code}')` : ''}">
                    <div class="flex items-start gap-3">
                        <div class="text-2xl">${notification.icon}</div>
                        <div class="flex-1">
                            <div class="flex items-center justify-between mb-1">
                                <h4 class="font-semibold text-slate-800 dark:text-slate-200 text-sm">${notification.title}</h4>
                                <span class="px-2 py-0.5 rounded text-xs font-medium ${getPriorityBadgeClass(notification.priority)}">
                                    ${notification.priority}
                                </span>
                            </div>
                            <p class="text-sm text-slate-600 dark:text-slate-400 mb-1">${notification.message}</p>
                            ${notification.action ? `
                                <p class="text-xs text-slate-500 dark:text-slate-400">💡 ${notification.action}</p>
                            ` : ''}
                            ${notification.progress !== undefined ? `
                                <div class="mt-2">
                                    <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                        <div class="bg-indigo-500 h-1.5 rounded-full" style="width: ${notification.progress}%"></div>
                                    </div>
                                    <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">${notification.progress}% complete</div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Get priority badge class
 */
function getPriorityBadgeClass(priority) {
    const classes = {
        'urgent': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        'high': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
        'medium': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        'low': 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300'
    };
    return classes[priority] || classes['medium'];
}

/**
 * Check and show browser notifications (if permission granted)
 */
export async function checkBrowserNotifications(notifications) {
    if (!('Notification' in window)) {
        return; // Browser doesn't support notifications
    }
    
    if (Notification.permission === 'granted') {
        const urgentNotifications = notifications.filter(n => n.priority === 'urgent');
        urgentNotifications.forEach(notification => {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
                badge: '/favicon.ico'
            });
        });
    } else if (Notification.permission !== 'denied') {
        // Request permission
        Notification.requestPermission();
    }
}

// Make functions available globally
window.AchievementNotifications = {
    getAchievementNotifications,
    showNotificationToast,
    renderNotificationsPanel,
    checkBrowserNotifications
};


