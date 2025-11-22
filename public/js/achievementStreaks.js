/**
 * Achievement Streaks
 * Tracks consecutive days of unlocking achievements
 */

/**
 * Calculate achievement streaks from user achievements
 */
export function calculateStreaks(userAchievements) {
    if (!userAchievements || userAchievements.length === 0) {
        return {
            currentStreak: 0,
            longestStreak: 0,
            totalDaysActive: 0,
            streakHistory: [],
            milestones: []
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
    const achievementsByDate = {};
    sorted.forEach(achievement => {
        const date = new Date(achievement.unlocked_at || achievement.created_at);
        const dateKey = date.toISOString().split('T')[0];
        
        if (!achievementsByDate[dateKey]) {
            achievementsByDate[dateKey] = [];
        }
        achievementsByDate[dateKey].push(achievement);
    });

    // Get unique dates sorted
    const dates = Object.keys(achievementsByDate).sort();
    
    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const streakHistory = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check current streak (from today backwards)
    let checkDate = new Date(today);
    while (dates.includes(checkDate.toISOString().split('T')[0])) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
    }
    
    // Calculate longest streak
    for (let i = 0; i < dates.length; i++) {
        const currentDate = new Date(dates[i]);
        const prevDate = i > 0 ? new Date(dates[i - 1]) : null;
        
        if (prevDate) {
            const daysDiff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
            if (daysDiff === 1) {
                tempStreak++;
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
            }
        } else {
            tempStreak = 1;
        }
        
        streakHistory.push({
            date: currentDate,
            dateKey: dates[i],
            count: achievementsByDate[dates[i]].length,
            streakLength: tempStreak
        });
    }
    
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
    
    // Identify streak milestones
    const milestones = identifyStreakMilestones(streakHistory, currentStreak, longestStreak);
    
    return {
        currentStreak,
        longestStreak,
        totalDaysActive: dates.length,
        streakHistory,
        milestones,
        lastActiveDate: dates.length > 0 ? new Date(dates[dates.length - 1]) : null
    };
}

/**
 * Identify streak milestones
 */
function identifyStreakMilestones(streakHistory, currentStreak, longestStreak) {
    const milestones = [];
    
    // Current streak milestones
    if (currentStreak >= 3) {
        milestones.push({
            type: 'current',
            days: currentStreak,
            label: `${currentStreak}-Day Streak`,
            icon: '🔥',
            color: 'from-orange-500 to-red-500'
        });
    }
    
    // Longest streak milestones
    if (longestStreak >= 7) {
        milestones.push({
            type: 'longest',
            days: longestStreak,
            label: `Longest: ${longestStreak} Days`,
            icon: '⭐',
            color: 'from-yellow-400 to-orange-500'
        });
    }
    
    // Historical milestones from streak history
    streakHistory.forEach(entry => {
        if (entry.streakLength === 7) {
            milestones.push({
                type: 'week',
                days: 7,
                label: 'Week Streak',
                icon: '📅',
                color: 'from-blue-500 to-indigo-500',
                date: entry.date
            });
        } else if (entry.streakLength === 14) {
            milestones.push({
                type: 'fortnight',
                days: 14,
                label: '2-Week Streak',
                icon: '🌟',
                color: 'from-purple-500 to-pink-500',
                date: entry.date
            });
        } else if (entry.streakLength === 30) {
            milestones.push({
                type: 'month',
                days: 30,
                label: 'Month Streak',
                icon: '👑',
                color: 'from-yellow-400 to-orange-500',
                date: entry.date
            });
        }
    });
    
    return milestones;
}

/**
 * Get streak status message
 */
export function getStreakStatus(streaks) {
    if (streaks.currentStreak === 0) {
        return {
            message: 'Start your streak today!',
            color: 'text-slate-500',
            icon: '💪'
        };
    }
    
    if (streaks.currentStreak >= 30) {
        return {
            message: 'Incredible! Keep it going!',
            color: 'text-yellow-600',
            icon: '👑'
        };
    } else if (streaks.currentStreak >= 14) {
        return {
            message: 'Amazing streak!',
            color: 'text-purple-600',
            icon: '🌟'
        };
    } else if (streaks.currentStreak >= 7) {
        return {
            message: 'Great progress!',
            color: 'text-blue-600',
            icon: '🔥'
        };
    } else {
        return {
            message: 'Keep it up!',
            color: 'text-green-600',
            icon: '⚡'
        };
    }
}

/**
 * Get streak badge based on streak length
 */
export function getStreakBadge(streakLength) {
    if (streakLength >= 100) {
        return { name: 'Centurion', icon: '🏛️', rarity: 'legendary' };
    } else if (streakLength >= 60) {
        return { name: 'Dedicated', icon: '💎', rarity: 'epic' };
    } else if (streakLength >= 30) {
        return { name: 'Month Master', icon: '👑', rarity: 'epic' };
    } else if (streakLength >= 14) {
        return { name: 'Fortnight Fighter', icon: '🌟', rarity: 'rare' };
    } else if (streakLength >= 7) {
        return { name: 'Week Warrior', icon: '🔥', rarity: 'rare' };
    } else if (streakLength >= 3) {
        return { name: 'Streak Starter', icon: '⚡', rarity: 'common' };
    }
    return null;
}

/**
 * Check if streak is at risk (no activity today)
 */
export function isStreakAtRisk(streaks) {
    if (streaks.currentStreak === 0) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastActive = streaks.lastActiveDate;
    if (!lastActive) return true;
    
    lastActive.setHours(0, 0, 0, 0);
    const daysSince = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
    
    return daysSince >= 1;
}

/**
 * Get streak motivation message
 */
export function getStreakMotivation(streaks) {
    if (streaks.currentStreak === 0) {
        return "Start your achievement streak today! Unlock an achievement to begin.";
    }
    
    if (isStreakAtRisk(streaks)) {
        return "⚠️ Your streak is at risk! Unlock an achievement today to keep it alive.";
    }
    
    const nextMilestone = getNextStreakMilestone(streaks.currentStreak);
    if (nextMilestone) {
        return `Keep going! ${nextMilestone.days - streaks.currentStreak} more days until ${nextMilestone.label}!`;
    }
    
    return `You're on a ${streaks.currentStreak}-day streak! Keep it up!`;
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
    
    return {
        days: next,
        label: labels[next] || `${next}-Day Streak`
    };
}

// Make functions available globally
window.AchievementStreaks = {
    calculateStreaks,
    getStreakStatus,
    getStreakBadge,
    isStreakAtRisk,
    getStreakMotivation
};


