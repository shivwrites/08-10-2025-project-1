/**
 * Achievement Paths and Roadmaps
 * Defines achievement sequences and provides path recommendations
 */

/**
 * Define achievement paths/roadmaps
 */
export function getAchievementPaths() {
    return [
        {
            id: 'brand-builder',
            name: 'Brand Builder Path',
            description: 'Build your personal brand from the ground up',
            icon: '🏗️',
            color: 'from-blue-500 to-indigo-600',
            achievements: [
                'BRAND_SCORE_60',
                'PROFILE_80',
                'VISIBILITY_80',
                'BRAND_SCORE_70',
                'ENGAGEMENT_75',
                'BRAND_SCORE_80'
            ],
            category: 'brand_score',
            difficulty: 'beginner'
        },
        {
            id: 'engagement-master',
            name: 'Engagement Master Path',
            description: 'Master engagement and build a strong network',
            icon: '🔥',
            color: 'from-pink-500 to-rose-600',
            achievements: [
                'ENGAGEMENT_75',
                'VISIBILITY_80',
                'PRESENCE_85',
                'ENGAGEMENT_90',
                'VISIBILITY_90',
                'PRESENCE_95'
            ],
            category: 'engagement',
            difficulty: 'intermediate'
        },
        {
            id: 'profile-perfectionist',
            name: 'Profile Perfectionist Path',
            description: 'Complete and optimize your professional profile',
            icon: '💯',
            color: 'from-green-500 to-emerald-600',
            achievements: [
                'PROFILE_80',
                'PRESENCE_85',
                'PROFILE_100',
                'PRESENCE_95'
            ],
            category: 'profile_completion',
            difficulty: 'beginner'
        },
        {
            id: 'consistency-champion',
            name: 'Consistency Champion Path',
            description: 'Build consistent daily habits for professional growth',
            icon: '📅',
            color: 'from-orange-500 to-amber-600',
            achievements: [
                'CONSISTENCY_7',
                'CONSISTENCY_14',
                'CONSISTENCY_30'
            ],
            category: 'consistency',
            difficulty: 'intermediate'
        },
        {
            id: 'brand-legend',
            name: 'Brand Legend Path',
            description: 'Achieve legendary status in personal branding',
            icon: '👑',
            color: 'from-yellow-500 to-orange-600',
            achievements: [
                'BRAND_SCORE_80',
                'BRAND_SCORE_90',
                'ENGAGEMENT_90',
                'VISIBILITY_90',
                'PRESENCE_95',
                'BRAND_SCORE_95'
            ],
            category: 'brand_score',
            difficulty: 'advanced'
        },
        {
            id: 'complete-master',
            name: 'Complete Master Path',
            description: 'Unlock all achievements and become a complete master',
            icon: '🌟',
            color: 'from-purple-500 to-pink-600',
            achievements: [
                'BRAND_SCORE_60',
                'BRAND_SCORE_70',
                'BRAND_SCORE_80',
                'BRAND_SCORE_90',
                'BRAND_SCORE_95',
                'ENGAGEMENT_75',
                'ENGAGEMENT_90',
                'PROFILE_80',
                'PROFILE_100',
                'VISIBILITY_80',
                'VISIBILITY_90',
                'PRESENCE_85',
                'PRESENCE_95',
                'CONSISTENCY_7',
                'CONSISTENCY_14',
                'CONSISTENCY_30'
            ],
            category: 'all',
            difficulty: 'expert'
        }
    ];
}

/**
 * Calculate path progress
 */
export function calculatePathProgress(path, unlockedAchievementCodes) {
    const unlocked = path.achievements.filter(code => 
        unlockedAchievementCodes.has(code)
    );
    
    const progress = (unlocked.length / path.achievements.length) * 100;
    const nextAchievement = path.achievements.find(code => 
        !unlockedAchievementCodes.has(code)
    );
    
    return {
        unlocked: unlocked.length,
        total: path.achievements.length,
        progress: Math.round(progress),
        nextAchievement,
        completed: unlocked.length === path.achievements.length,
        unlockedCodes: new Set(unlocked)
    };
}

/**
 * Get recommended paths based on user progress
 */
export function getRecommendedPaths(unlockedAchievementCodes, allDefinitions) {
    const paths = getAchievementPaths();
    const unlockedCodes = new Set(unlockedAchievementCodes);
    
    // Calculate progress for all paths
    const pathsWithProgress = paths.map(path => ({
        ...path,
        progress: calculatePathProgress(path, unlockedCodes)
    }));
    
    // Sort by:
    // 1. Not completed paths first
    // 2. Highest progress (closest to completion)
    // 3. Beginner difficulty first
    const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
    
    pathsWithProgress.sort((a, b) => {
        // Completed paths go to the end
        if (a.progress.completed && !b.progress.completed) return 1;
        if (!a.progress.completed && b.progress.completed) return -1;
        
        // Among incomplete, sort by progress (descending)
        if (!a.progress.completed && !b.progress.completed) {
            if (b.progress.progress !== a.progress.progress) {
                return b.progress.progress - a.progress.progress;
            }
        }
        
        // Then by difficulty
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });
    
    return pathsWithProgress;
}

/**
 * Get next recommended achievement based on paths
 */
export function getNextRecommendedAchievement(unlockedAchievementCodes, allDefinitions) {
    const paths = getRecommendedPaths(unlockedAchievementCodes, allDefinitions);
    
    // Find the first incomplete path with a next achievement
    for (const path of paths) {
        if (!path.progress.completed && path.progress.nextAchievement) {
            const achievement = allDefinitions.find(a => a.code === path.progress.nextAchievement);
            if (achievement) {
                return {
                    achievement,
                    path: path,
                    reason: `Next step in "${path.name}" path`
                };
            }
        }
    }
    
    return null;
}

/**
 * Get achievement path that contains a specific achievement
 */
export function getPathsForAchievement(achievementCode) {
    const paths = getAchievementPaths();
    return paths.filter(path => path.achievements.includes(achievementCode));
}

/**
 * Get path by ID
 */
export function getPathById(pathId) {
    const paths = getAchievementPaths();
    return paths.find(path => path.id === pathId);
}

/**
 * Get difficulty badge color
 */
export function getDifficultyColor(difficulty) {
    const colors = {
        'beginner': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        'intermediate': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        'advanced': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
        'expert': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
    };
    return colors[difficulty] || colors['beginner'];
}

// Make functions available globally
window.AchievementPaths = {
    getAchievementPaths,
    calculatePathProgress,
    getRecommendedPaths,
    getNextRecommendedAchievement,
    getPathsForAchievement,
    getPathById,
    getDifficultyColor
};

