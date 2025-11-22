/**
 * Achievement Timeline
 * Provides visual timeline view of achievement unlocks over time
 */

/**
 * Process achievements for timeline display
 */
export function processTimelineData(userAchievements, allDefinitions) {
    if (!userAchievements || userAchievements.length === 0) {
        return {
            timeline: [],
            milestones: [],
            totalUnlocked: 0,
            firstUnlock: null,
            lastUnlock: null
        };
    }

    // Sort achievements by unlock date
    const sorted = [...userAchievements]
        .filter(ua => ua.unlocked_at || ua.created_at)
        .sort((a, b) => {
            const dateA = new Date(a.unlocked_at || a.created_at);
            const dateB = new Date(b.unlocked_at || b.created_at);
            return dateA - dateB;
        });

    // Group by date
    const groupedByDate = {};
    sorted.forEach(achievement => {
        const date = new Date(achievement.unlocked_at || achievement.created_at);
        const dateKey = date.toISOString().split('T')[0];
        
        if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = [];
        }
        
        const achievementDef = allDefinitions.find(def => 
            def.code === achievement.achievement_code || 
            achievement.achievement_definitions?.code === def.code
        );
        
        if (achievementDef) {
            groupedByDate[dateKey].push({
                ...achievement,
                definition: achievementDef,
                unlockDate: date
            });
        }
    });

    // Create timeline entries
    const timeline = Object.keys(groupedByDate)
        .sort()
        .map(dateKey => {
            const achievements = groupedByDate[dateKey];
            const date = new Date(dateKey);
            
            return {
                date: date,
                dateKey: dateKey,
                achievements: achievements,
                count: achievements.length,
                displayDate: formatTimelineDate(date)
            };
        });

    // Identify milestones
    const milestones = identifyMilestones(timeline);

    return {
        timeline: timeline,
        milestones: milestones,
        totalUnlocked: sorted.length,
        firstUnlock: timeline.length > 0 ? timeline[0].date : null,
        lastUnlock: timeline.length > 0 ? timeline[timeline.length - 1].date : null,
        groupedByDate: groupedByDate
    };
}

/**
 * Format date for timeline display
 */
function formatTimelineDate(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (dateOnly.getTime() === today.getTime()) {
        return 'Today';
    } else if (dateOnly.getTime() === yesterday.getTime()) {
        return 'Yesterday';
    } else {
        const daysDiff = Math.floor((today - dateOnly) / (1000 * 60 * 60 * 24));
        if (daysDiff < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'long' });
        } else if (daysDiff < 30) {
            return `${Math.floor(daysDiff / 7)} week${Math.floor(daysDiff / 7) > 1 ? 's' : ''} ago`;
        } else if (daysDiff < 365) {
            return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    }
}

/**
 * Identify milestones in timeline
 */
function identifyMilestones(timeline) {
    const milestones = [];
    let cumulativeCount = 0;

    timeline.forEach(entry => {
        cumulativeCount += entry.count;
        
        // Milestone markers
        if (cumulativeCount === 1) {
            milestones.push({
                date: entry.date,
                type: 'first',
                label: 'First Achievement',
                icon: '🎉',
                count: cumulativeCount
            });
        } else if (cumulativeCount === 5) {
            milestones.push({
                date: entry.date,
                type: 'milestone',
                label: '5 Achievements',
                icon: '⭐',
                count: cumulativeCount
            });
        } else if (cumulativeCount === 10) {
            milestones.push({
                date: entry.date,
                type: 'milestone',
                label: '10 Achievements',
                icon: '🌟',
                count: cumulativeCount
            });
        } else if (cumulativeCount % 5 === 0 && cumulativeCount > 10) {
            milestones.push({
                date: entry.date,
                type: 'milestone',
                label: `${cumulativeCount} Achievements`,
                icon: '🏆',
                count: cumulativeCount
            });
        }

        // Streak detection (multiple achievements in one day)
        if (entry.count >= 3) {
            milestones.push({
                date: entry.date,
                type: 'streak',
                label: `${entry.count} Achievements Unlocked!`,
                icon: '🔥',
                count: entry.count
            });
        }
    });

    return milestones;
}

/**
 * Get timeline statistics
 */
export function getTimelineStats(timelineData) {
    if (!timelineData || timelineData.timeline.length === 0) {
        return null;
    }

    const { timeline, firstUnlock, lastUnlock, totalUnlocked } = timelineData;
    
    // Calculate time span
    const timeSpan = lastUnlock - firstUnlock;
    const daysSpan = Math.ceil(timeSpan / (1000 * 60 * 60 * 24));
    
    // Calculate average per day
    const avgPerDay = daysSpan > 0 ? (totalUnlocked / daysSpan).toFixed(2) : totalUnlocked;
    
    // Find most productive day
    const mostProductive = timeline.reduce((max, entry) => 
        entry.count > max.count ? entry : max, timeline[0]
    );
    
    // Calculate current streak (consecutive days with unlocks)
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = timeline.length - 1; i >= 0; i--) {
        const entryDate = new Date(timeline[i].date);
        entryDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === currentStreak) {
            currentStreak++;
        } else {
            break;
        }
    }

    return {
        totalUnlocked,
        daysSpan: daysSpan || 1,
        avgPerDay: parseFloat(avgPerDay),
        mostProductive: {
            date: mostProductive.date,
            count: mostProductive.count,
            displayDate: mostProductive.displayDate
        },
        currentStreak,
        firstUnlock,
        lastUnlock
    };
}

/**
 * Render timeline view
 */
export function renderTimelineView(timelineData, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Container not found: ${containerId}`);
        return;
    }

    if (!timelineData || timelineData.timeline.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-slate-500 dark:text-slate-400">
                <div class="text-4xl mb-4">📅</div>
                <p class="text-lg mb-2">No Timeline Yet</p>
                <p class="text-sm">Unlock your first achievement to see your timeline!</p>
            </div>
        `;
        return;
    }

    const stats = getTimelineStats(timelineData);
    const { timeline, milestones } = timelineData;

    // Combine timeline and milestones, sort by date
    const allEvents = [
        ...timeline.map(entry => ({ ...entry, type: 'achievement' })),
        ...milestones.map(milestone => ({ ...milestone, type: 'milestone' }))
    ].sort((a, b) => {
        const dateA = a.date || a.unlockDate;
        const dateB = b.date || b.unlockDate;
        return new Date(dateA) - new Date(dateB);
    });

    let html = `
        <div class="space-y-6">
            <!-- Timeline Stats -->
            ${stats ? `
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div class="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                        <div class="text-2xl mb-2">📅</div>
                        <div class="text-2xl font-bold text-slate-800 dark:text-slate-200">${stats.daysSpan}</div>
                        <div class="text-xs text-slate-500 dark:text-slate-400">Days Active</div>
                    </div>
                    <div class="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                        <div class="text-2xl mb-2">⚡</div>
                        <div class="text-2xl font-bold text-slate-800 dark:text-slate-200">${stats.avgPerDay}</div>
                        <div class="text-xs text-slate-500 dark:text-slate-400">Avg per Day</div>
                    </div>
                    <div class="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                        <div class="text-2xl mb-2">🔥</div>
                        <div class="text-2xl font-bold text-slate-800 dark:text-slate-200">${stats.currentStreak}</div>
                        <div class="text-xs text-slate-500 dark:text-slate-400">Day Streak</div>
                    </div>
                    <div class="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                        <div class="text-2xl mb-2">🎯</div>
                        <div class="text-2xl font-bold text-slate-800 dark:text-slate-200">${stats.mostProductive.count}</div>
                        <div class="text-xs text-slate-500 dark:text-slate-400">Best Day</div>
                    </div>
                </div>
            ` : ''}

            <!-- Timeline -->
            <div class="relative">
                <!-- Timeline Line -->
                <div class="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500"></div>
                
                <!-- Timeline Events -->
                <div class="space-y-8">
                    ${allEvents.map((event, index) => {
                        if (event.type === 'milestone') {
                            return `
                                <div class="relative flex items-start gap-4">
                                    <div class="relative z-10 flex-shrink-0 w-16 h-16 bg-gradient-to-br ${getMilestoneColor(event.type)} rounded-full flex items-center justify-center text-2xl shadow-lg border-4 border-white dark:border-slate-800">
                                        ${event.icon}
                                    </div>
                                    <div class="flex-1 pt-2">
                                        <div class="bg-gradient-to-r ${getMilestoneColor(event.type)} rounded-lg p-4 text-white shadow-md">
                                            <div class="font-semibold text-lg mb-1">${event.label}</div>
                                            <div class="text-sm text-white/90">${formatTimelineDate(event.date)}</div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        } else {
                            return `
                                <div class="relative flex items-start gap-4">
                                    <div class="relative z-10 flex-shrink-0 w-16 h-16 bg-white dark:bg-slate-800 border-4 border-indigo-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
                                        ${event.achievements[0]?.definition?.icon || '🏆'}
                                    </div>
                                    <div class="flex-1 pt-2">
                                        <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">${event.displayDate}</div>
                                        <div class="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-md">
                                            ${event.count > 1 ? `
                                                <div class="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                                    ${event.count} achievements unlocked
                                                </div>
                                            ` : ''}
                                            <div class="space-y-2">
                                                ${event.achievements.map(ach => `
                                                    <div class="flex items-center gap-3">
                                                        <span class="text-2xl">${ach.definition.icon}</span>
                                                        <div class="flex-1">
                                                            <div class="font-semibold text-slate-800 dark:text-slate-200">${ach.definition.name}</div>
                                                            <div class="text-xs text-slate-500 dark:text-slate-400">${ach.definition.description}</div>
                                                        </div>
                                                        <span class="px-2 py-1 rounded text-xs font-medium ${getRarityBadgeClass(ach.definition.rarity)}">
                                                            ${ach.definition.rarity}
                                                        </span>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }
                    }).join('')}
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Get milestone color gradient
 */
function getMilestoneColor(type) {
    const colors = {
        'first': 'from-yellow-400 to-orange-500',
        'milestone': 'from-purple-400 to-pink-500',
        'streak': 'from-red-400 to-orange-500'
    };
    return colors[type] || 'from-indigo-400 to-purple-500';
}

/**
 * Get rarity badge class
 */
function getRarityBadgeClass(rarity) {
    const classes = {
        'common': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
        'rare': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        'epic': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
        'legendary': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
    };
    return classes[rarity] || classes['common'];
}

// Make functions available globally
window.AchievementTimeline = {
    processTimelineData,
    getTimelineStats,
    renderTimelineView
};



