/**
 * AI-Powered Achievement Recommendations
 * Provides intelligent suggestions for next achievements based on user progress
 */

/**
 * Analyze user metrics and recommend next achievements
 */
export function getRecommendedAchievements(userMetrics, unlockedCodes, allDefinitions) {
    const unlocked = new Set(unlockedCodes);
    const recommendations = [];

    // Filter out already unlocked achievements
    const availableAchievements = allDefinitions.filter(a => !unlocked.has(a.code));

    // Calculate progress for each achievement
    const achievementsWithProgress = availableAchievements.map(achievement => {
        const progress = calculateAchievementProgress(achievement, userMetrics);
        const difficulty = estimateAchievementDifficulty(achievement, userMetrics);
        const priority = calculatePriority(achievement, userMetrics, progress, difficulty);
        
        return {
            achievement,
            progress,
            difficulty,
            priority,
            estimatedTime: estimateTimeToUnlock(achievement, userMetrics, progress)
        };
    });

    // Sort by priority (highest first)
    achievementsWithProgress.sort((a, b) => b.priority - a.priority);

    // Get top recommendations
    const topRecommendations = achievementsWithProgress.slice(0, 5).map(item => ({
        achievement: item.achievement,
        progress: item.progress,
        difficulty: item.difficulty,
        estimatedTime: item.estimatedTime,
        reason: getRecommendationReason(item.achievement, item.progress, item.difficulty, userMetrics),
        tips: getPersonalizedTips(item.achievement, userMetrics, item.progress)
    }));

    return topRecommendations;
}

/**
 * Calculate achievement progress percentage
 */
function calculateAchievementProgress(achievement, metrics) {
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
            // For consistency, estimate based on activity
            return 0; // Would need actual activity tracking
            
        default:
            return 0;
    }
}

/**
 * Estimate achievement difficulty based on current metrics
 */
function estimateAchievementDifficulty(achievement, metrics) {
    const progress = calculateAchievementProgress(achievement, metrics);
    const gap = 100 - progress;
    
    if (gap <= 5) return 'very_easy';
    if (gap <= 15) return 'easy';
    if (gap <= 30) return 'medium';
    if (gap <= 50) return 'hard';
    return 'very_hard';
}

/**
 * Calculate priority score for recommendation
 */
function calculatePriority(achievement, metrics, progress, difficulty) {
    let priority = 0;
    
    // Higher progress = higher priority (closer to unlocking)
    priority += progress * 0.4;
    
    // Easier achievements get priority boost
    const difficultyScores = {
        'very_easy': 50,
        'easy': 40,
        'medium': 25,
        'hard': 10,
        'very_hard': 5
    };
    priority += difficultyScores[difficulty] || 0;
    
    // Rarer achievements get slight boost
    const rarityScores = {
        'common': 5,
        'rare': 10,
        'epic': 15,
        'legendary': 20
    };
    priority += rarityScores[achievement.rarity] || 0;
    
    // Category-based priority (focus on areas user is already strong in)
    const category = achievement.category;
    if (category === 'brand_score' && (metrics.overallScore || 0) >= 70) {
        priority += 15;
    }
    if (category === 'engagement' && (metrics.engagement || 0) >= 70) {
        priority += 15;
    }
    if (category === 'profile_completion' && (metrics.profileCompleteness || 0) >= 70) {
        priority += 15;
    }
    
    // Boost for achievements that complete a path
    // (This would integrate with paths system)
    
    return priority;
}

/**
 * Estimate time to unlock achievement
 */
function estimateTimeToUnlock(achievement, metrics, progress) {
    const gap = 100 - progress;
    
    if (gap <= 5) return 'Almost there!';
    if (gap <= 15) return '1-2 weeks';
    if (gap <= 30) return '2-4 weeks';
    if (gap <= 50) return '1-2 months';
    return '2+ months';
}

/**
 * Get recommendation reason
 */
function getRecommendationReason(achievement, progress, difficulty, metrics) {
    if (progress >= 90) {
        return 'You\'re almost there! Just a little more effort.';
    }
    if (progress >= 70) {
        return 'Great progress! This achievement is within reach.';
    }
    if (difficulty === 'easy' || difficulty === 'very_easy') {
        return 'Quick win! This should be easy to unlock.';
    }
    if (achievement.category === 'brand_score' && (metrics.overallScore || 0) >= 60) {
        return 'Build on your brand strength to unlock this.';
    }
    if (achievement.category === 'engagement' && (metrics.engagement || 0) >= 60) {
        return 'Leverage your engagement momentum.';
    }
    return 'Focus area for your brand development.';
}

/**
 * Get personalized tips for unlocking achievement
 */
export function getPersonalizedTips(achievement, metrics, progress) {
    const tips = [];
    const { criteriaType, criteriaValue, category } = achievement;
    
    // General tips based on category
    if (category === 'brand_score') {
        const currentScore = metrics.overallScore || metrics.overall || 0;
        const target = criteriaValue.threshold;
        const gap = target - currentScore;
        
        if (gap > 0) {
            tips.push(`Your brand score is ${currentScore}. You need ${gap} more points to unlock this.`);
            tips.push('Focus on improving your LinkedIn profile completeness.');
            tips.push('Engage more with your network - like, comment, and share posts.');
            tips.push('Post regular content that showcases your expertise.');
        }
    }
    
    if (category === 'engagement') {
        const currentEngagement = metrics.engagement || 0;
        const target = criteriaValue.threshold;
        const gap = target - currentEngagement;
        
        if (gap > 0) {
            tips.push(`Your engagement score is ${currentEngagement}. Aim for ${target}.`);
            tips.push('Respond to comments on your posts within 24 hours.');
            tips.push('Engage with 5-10 posts from your network daily.');
            tips.push('Ask questions in your posts to encourage comments.');
        }
    }
    
    if (category === 'profile_completion') {
        const currentCompleteness = metrics.profileCompleteness || 0;
        const target = criteriaValue.threshold;
        const gap = target - currentCompleteness;
        
        if (gap > 0) {
            tips.push(`Your profile is ${currentCompleteness}% complete. Target: ${target}%.`);
            tips.push('Add a professional headline that includes keywords.');
            tips.push('Write a compelling summary that tells your story.');
            tips.push('Add all work experience with detailed descriptions.');
            tips.push('Include skills, education, and certifications.');
            if (target === 100) {
                tips.push('Add optional sections: projects, publications, volunteer experience.');
            }
        }
    }
    
    if (category === 'consistency') {
        tips.push('Post or engage on LinkedIn every day.');
        tips.push('Set a daily reminder to check your LinkedIn feed.');
        tips.push('Create a content calendar to plan your posts.');
        tips.push('Engage with others\' content even on days you don\'t post.');
    }
    
    // Progress-specific tips
    if (progress >= 80) {
        tips.unshift('🎯 You\'re so close! Keep up the momentum.');
    } else if (progress >= 50) {
        tips.unshift('💪 You\'re halfway there! Stay consistent.');
    } else if (progress > 0) {
        tips.unshift('🚀 Good start! Focus on the areas below to accelerate progress.');
    } else {
        tips.unshift('✨ New opportunity! Follow these steps to get started.');
    }
    
    return tips;
}

/**
 * Get close-to-unlock achievements (for notifications)
 */
export function getCloseToUnlockAchievements(userMetrics, unlockedCodes, allDefinitions, threshold = 85) {
    const unlocked = new Set(unlockedCodes);
    const availableAchievements = allDefinitions.filter(a => !unlocked.has(a.code));
    
    const closeAchievements = availableAchievements
        .map(achievement => ({
            achievement,
            progress: calculateAchievementProgress(achievement, userMetrics)
        }))
        .filter(item => item.progress >= threshold)
        .sort((a, b) => b.progress - a.progress);
    
    return closeAchievements.map(item => ({
        achievement: item.achievement,
        progress: item.progress,
        tips: getPersonalizedTips(item.achievement, userMetrics, item.progress)
    }));
}

/**
 * Get category-specific recommendations
 */
export function getCategoryRecommendations(category, userMetrics, unlockedCodes, allDefinitions) {
    const unlocked = new Set(unlockedCodes);
    const categoryAchievements = allDefinitions
        .filter(a => a.category === category && !unlocked.has(a.code))
        .map(achievement => ({
            achievement,
            progress: calculateAchievementProgress(achievement, userMetrics),
            difficulty: estimateAchievementDifficulty(achievement, userMetrics)
        }))
        .sort((a, b) => {
            // Sort by progress (highest first), then by difficulty (easiest first)
            if (b.progress !== a.progress) {
                return b.progress - a.progress;
            }
            const difficultyOrder = { 'very_easy': 1, 'easy': 2, 'medium': 3, 'hard': 4, 'very_hard': 5 };
            return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        });
    
    return categoryAchievements.slice(0, 3).map(item => ({
        achievement: item.achievement,
        progress: item.progress,
        difficulty: item.difficulty,
        tips: getPersonalizedTips(item.achievement, userMetrics, item.progress)
    }));
}

// Make functions available globally
window.AchievementRecommendations = {
    getRecommendedAchievements,
    getPersonalizedTips,
    getCloseToUnlockAchievements,
    getCategoryRecommendations
};



