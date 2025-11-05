/**
 * Achievement Definitions and Checking Logic
 * Defines all achievements and provides functions to check eligibility
 */

export const AchievementCategories = {
    BRAND_SCORE: 'brand_score',
    ENGAGEMENT: 'engagement',
    PROFILE_COMPLETION: 'profile_completion',
    CONSISTENCY: 'consistency'
};

export const AchievementRarity = {
    COMMON: 'common',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary'
};

/**
 * Get all achievement definitions
 */
export function getAchievementDefinitions() {
    return [
        // Brand Score Achievements
        {
            code: 'BRAND_SCORE_60',
            name: 'Brand Builder',
            description: 'Achieve an overall brand score of 60 or higher',
            category: AchievementCategories.BRAND_SCORE,
            icon: '🏗️',
            criteriaType: 'score_threshold',
            criteriaValue: { threshold: 60, metric: 'overall' },
            rarity: AchievementRarity.COMMON
        },
        {
            code: 'BRAND_SCORE_70',
            name: 'Brand Rising',
            description: 'Achieve an overall brand score of 70 or higher',
            category: AchievementCategories.BRAND_SCORE,
            icon: '📈',
            criteriaType: 'score_threshold',
            criteriaValue: { threshold: 70, metric: 'overall' },
            rarity: AchievementRarity.COMMON
        },
        {
            code: 'BRAND_SCORE_80',
            name: 'Brand Excellence',
            description: 'Achieve an overall brand score of 80 or higher',
            category: AchievementCategories.BRAND_SCORE,
            icon: '⭐',
            criteriaType: 'score_threshold',
            criteriaValue: { threshold: 80, metric: 'overall' },
            rarity: AchievementRarity.RARE
        },
        {
            code: 'BRAND_SCORE_90',
            name: 'Brand Master',
            description: 'Achieve an overall brand score of 90 or higher',
            category: AchievementCategories.BRAND_SCORE,
            icon: '💎',
            criteriaType: 'score_threshold',
            criteriaValue: { threshold: 90, metric: 'overall' },
            rarity: AchievementRarity.EPIC
        },
        {
            code: 'BRAND_SCORE_95',
            name: 'Brand Legend',
            description: 'Achieve an overall brand score of 95 or higher',
            category: AchievementCategories.BRAND_SCORE,
            icon: '👑',
            criteriaType: 'score_threshold',
            criteriaValue: { threshold: 95, metric: 'overall' },
            rarity: AchievementRarity.LEGENDARY
        },
        // Engagement Achievements
        {
            code: 'ENGAGEMENT_75',
            name: 'High Engagement',
            description: 'Achieve an engagement score of 75 or higher',
            category: AchievementCategories.ENGAGEMENT,
            icon: '🔥',
            criteriaType: 'metric_threshold',
            criteriaValue: { threshold: 75, metric: 'engagement' },
            rarity: AchievementRarity.COMMON
        },
        {
            code: 'ENGAGEMENT_90',
            name: 'Engagement Master',
            description: 'Achieve an engagement score of 90 or higher',
            category: AchievementCategories.ENGAGEMENT,
            icon: '🎯',
            criteriaType: 'metric_threshold',
            criteriaValue: { threshold: 90, metric: 'engagement' },
            rarity: AchievementRarity.RARE
        },
        // Profile Completion Achievements
        {
            code: 'PROFILE_80',
            name: 'Complete Profile',
            description: 'Achieve 80% or more profile completeness',
            category: AchievementCategories.PROFILE_COMPLETION,
            icon: '✅',
            criteriaType: 'completeness',
            criteriaValue: { threshold: 80 },
            rarity: AchievementRarity.COMMON
        },
        {
            code: 'PROFILE_100',
            name: 'Profile Perfectionist',
            description: 'Achieve 100% profile completeness',
            category: AchievementCategories.PROFILE_COMPLETION,
            icon: '💯',
            criteriaType: 'completeness',
            criteriaValue: { threshold: 100 },
            rarity: AchievementRarity.RARE
        },
        // Consistency Achievements
        {
            code: 'CONSISTENCY_7',
            name: 'Consistent Creator',
            description: 'Maintain activity for 7 consecutive days',
            category: AchievementCategories.CONSISTENCY,
            icon: '📅',
            criteriaType: 'consistency',
            criteriaValue: { days: 7 },
            rarity: AchievementRarity.COMMON
        },
        {
            code: 'CONSISTENCY_14',
            name: 'Week Warrior',
            description: 'Maintain activity for 14 consecutive days',
            category: AchievementCategories.CONSISTENCY,
            icon: '🏆',
            criteriaType: 'consistency',
            criteriaValue: { days: 14 },
            rarity: AchievementRarity.RARE
        },
        {
            code: 'CONSISTENCY_30',
            name: 'Month Master',
            description: 'Maintain activity for 30 consecutive days',
            category: AchievementCategories.CONSISTENCY,
            icon: '🌟',
            criteriaType: 'consistency',
            criteriaValue: { days: 30 },
            rarity: AchievementRarity.EPIC
        },
        // Visibility Achievements
        {
            code: 'VISIBILITY_80',
            name: 'Visibility Star',
            description: 'Achieve a visibility score of 80 or higher',
            category: AchievementCategories.ENGAGEMENT,
            icon: '✨',
            criteriaType: 'metric_threshold',
            criteriaValue: { threshold: 80, metric: 'visibility' },
            rarity: AchievementRarity.COMMON
        },
        {
            code: 'VISIBILITY_90',
            name: 'Visibility Champion',
            description: 'Achieve a visibility score of 90 or higher',
            category: AchievementCategories.ENGAGEMENT,
            icon: '🌟',
            criteriaType: 'metric_threshold',
            criteriaValue: { threshold: 90, metric: 'visibility' },
            rarity: AchievementRarity.RARE
        },
        // Professional Presence Achievements
        {
            code: 'PRESENCE_85',
            name: 'Professional Presence',
            description: 'Achieve a professional presence score of 85 or higher',
            category: AchievementCategories.ENGAGEMENT,
            icon: '💼',
            criteriaType: 'metric_threshold',
            criteriaValue: { threshold: 85, metric: 'professional_presence' },
            rarity: AchievementRarity.COMMON
        },
        {
            code: 'PRESENCE_95',
            name: 'Presence Excellence',
            description: 'Achieve a professional presence score of 95 or higher',
            category: AchievementCategories.ENGAGEMENT,
            icon: '🎖️',
            criteriaType: 'metric_threshold',
            criteriaValue: { threshold: 95, metric: 'professional_presence' },
            rarity: AchievementRarity.RARE
        }
    ];
}

/**
 * Check if user is eligible for an achievement based on metrics
 */
export function checkAchievementEligibility(achievement, metrics) {
    const { criteriaType, criteriaValue } = achievement;
    
    switch (criteriaType) {
        case 'score_threshold':
            const overallScore = metrics.overallScore || metrics.overall || 0;
            return overallScore >= criteriaValue.threshold;
            
        case 'metric_threshold':
            const metricValue = metrics[criteriaValue.metric] || 0;
            return metricValue >= criteriaValue.threshold;
            
        case 'completeness':
            const completeness = metrics.profileCompleteness || metrics.completeness || 0;
            return completeness >= criteriaValue.threshold;
            
        case 'consistency':
            // For consistency, we'd need to track daily activity
            // For now, we'll use a placeholder that checks if user has been active
            // This would need to be implemented with actual activity tracking
            const lastActiveDate = metrics.lastActiveDate ? new Date(metrics.lastActiveDate) : new Date();
            const daysSinceActive = Math.floor((Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
            // Simplified: if user has been active today, consider them consistent
            // In production, this should track consecutive days
            return daysSinceActive <= 1; // Placeholder logic
            
        default:
            return false;
    }
}

/**
 * Calculate progress percentage for an achievement
 */
export function calculateAchievementProgress(achievement, metrics) {
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
            
        case 'consistency':
            // Placeholder for consistency progress
            return 0;
            
        default:
            return 0;
    }
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category) {
    return getAchievementDefinitions().filter(achievement => achievement.category === category);
}

/**
 * Get achievement by code
 */
export function getAchievementByCode(code) {
    return getAchievementDefinitions().find(achievement => achievement.code === code);
}

/**
 * Get rarity color
 */
export function getRarityColor(rarity) {
    switch (rarity) {
        case AchievementRarity.COMMON:
            return 'text-slate-500';
        case AchievementRarity.RARE:
            return 'text-blue-500';
        case AchievementRarity.EPIC:
            return 'text-purple-500';
        case AchievementRarity.LEGENDARY:
            return 'text-yellow-500';
        default:
            return 'text-slate-500';
    }
}

/**
 * Get rarity badge color
 */
export function getRarityBadgeColor(rarity) {
    switch (rarity) {
        case AchievementRarity.COMMON:
            return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
        case AchievementRarity.RARE:
            return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
        case AchievementRarity.EPIC:
            return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
        case AchievementRarity.LEGENDARY:
            return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
        default:
            return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
}


