/**
 * Achievement Collections and Badges
 * Groups related achievements into collections and tracks completion
 */

/**
 * Define achievement collections
 */
export function getAchievementCollections() {
    return [
        {
            id: 'brand-master',
            name: 'Brand Master Collection',
            description: 'Master all aspects of personal branding',
            icon: '👑',
            color: 'from-yellow-400 to-orange-500',
            achievements: [
                'BRAND_SCORE_60',
                'BRAND_SCORE_70',
                'BRAND_SCORE_80',
                'BRAND_SCORE_90',
                'BRAND_SCORE_95'
            ],
            reward: '🏆 Brand Master Badge',
            rarity: 'legendary'
        },
        {
            id: 'engagement-expert',
            name: 'Engagement Expert Collection',
            description: 'Excel in audience engagement',
            icon: '🔥',
            color: 'from-pink-500 to-rose-600',
            achievements: [
                'ENGAGEMENT_75',
                'ENGAGEMENT_90',
                'VISIBILITY_80',
                'VISIBILITY_90',
                'PRESENCE_85',
                'PRESENCE_95'
            ],
            reward: '💬 Engagement Expert Badge',
            rarity: 'epic'
        },
        {
            id: 'content-creator',
            name: 'Content Creator Collection',
            description: 'Build your content creation skills',
            icon: '✍️',
            color: 'from-blue-500 to-cyan-500',
            achievements: [
                'CONTENT_5',
                'CONTENT_25',
                'CONTENT_100',
                'CONTENT_VIRAL'
            ],
            reward: '📝 Content Creator Badge',
            rarity: 'rare'
        },
        {
            id: 'network-builder',
            name: 'Network Builder Collection',
            description: 'Build and nurture your professional network',
            icon: '🤝',
            color: 'from-green-500 to-emerald-600',
            achievements: [
                'NETWORK_50',
                'NETWORK_200',
                'NETWORK_500',
                'NETWORK_ENGAGEMENT'
            ],
            reward: '🌐 Network Builder Badge',
            rarity: 'rare'
        },
        {
            id: 'lifelong-learner',
            name: 'Lifelong Learner Collection',
            description: 'Commit to continuous learning and growth',
            icon: '📚',
            color: 'from-purple-500 to-indigo-600',
            achievements: [
                'LEARNING_COURSE',
                'LEARNING_5',
                'LEARNING_SKILL',
                'LEARNING_EXPERT'
            ],
            reward: '🎓 Lifelong Learner Badge',
            rarity: 'rare'
        },
        {
            id: 'thought-leader',
            name: 'Thought Leader Collection',
            description: 'Establish yourself as an industry thought leader',
            icon: '🌟',
            color: 'from-indigo-500 to-purple-600',
            achievements: [
                'THOUGHT_ARTICLE',
                'THOUGHT_10',
                'THOUGHT_MENTION',
                'THOUGHT_INFLUENCE'
            ],
            reward: '🗣️ Thought Leader Badge',
            rarity: 'epic'
        },
        {
            id: 'consistency-champion',
            name: 'Consistency Champion Collection',
            description: 'Maintain consistent professional activity',
            icon: '📅',
            color: 'from-orange-500 to-red-500',
            achievements: [
                'CONSISTENCY_7',
                'CONSISTENCY_14',
                'CONSISTENCY_30'
            ],
            reward: '⚡ Consistency Champion Badge',
            rarity: 'rare'
        },
        {
            id: 'profile-perfectionist',
            name: 'Profile Perfectionist Collection',
            description: 'Create the perfect professional profile',
            icon: '💯',
            color: 'from-teal-500 to-cyan-500',
            achievements: [
                'PROFILE_80',
                'PROFILE_100',
                'PRESENCE_85',
                'PRESENCE_95'
            ],
            reward: '✨ Profile Perfectionist Badge',
            rarity: 'epic'
        },
        {
            id: 'complete-master',
            name: 'Complete Master Collection',
            description: 'Unlock all achievements - the ultimate collection',
            icon: '🏆',
            color: 'from-yellow-400 via-orange-500 to-pink-500',
            achievements: [], // Will be populated with all achievements
            reward: '👑 Complete Master Badge',
            rarity: 'legendary',
            isComplete: true // Includes all achievements
        }
    ];
}

/**
 * Calculate collection progress
 */
export function calculateCollectionProgress(collection, unlockedCodes, allDefinitions) {
    const unlocked = new Set(unlockedCodes);
    
    // For complete master, check all achievements
    let targetAchievements = collection.achievements;
    if (collection.isComplete && allDefinitions) {
        targetAchievements = allDefinitions.map(a => a.code);
    }
    
    const unlockedInCollection = targetAchievements.filter(code => 
        unlocked.has(code)
    );
    
    const progress = targetAchievements.length > 0 
        ? (unlockedInCollection.length / targetAchievements.length) * 100 
        : 0;
    
    const remaining = targetAchievements.filter(code => 
        !unlocked.has(code)
    );
    
    return {
        unlocked: unlockedInCollection.length,
        total: targetAchievements.length,
        progress: Math.round(progress),
        completed: unlockedInCollection.length === targetAchievements.length && targetAchievements.length > 0,
        remaining: remaining,
        unlockedCodes: new Set(unlockedInCollection)
    };
}

/**
 * Get all collections with progress
 */
export function getCollectionsWithProgress(unlockedCodes, allDefinitions) {
    const collections = getAchievementCollections();
    const unlocked = new Set(unlockedCodes);
    
    return collections.map(collection => ({
        ...collection,
        progress: calculateCollectionProgress(collection, Array.from(unlocked), allDefinitions)
    })).sort((a, b) => {
        // Sort by: completed first, then by progress (highest first)
        if (a.progress.completed && !b.progress.completed) return -1;
        if (!a.progress.completed && b.progress.completed) return 1;
        return b.progress.progress - a.progress.progress;
    });
}

/**
 * Get collection by ID
 */
export function getCollectionById(collectionId) {
    const collections = getAchievementCollections();
    return collections.find(c => c.id === collectionId);
}

/**
 * Get collections for an achievement
 */
export function getCollectionsForAchievement(achievementCode) {
    const collections = getAchievementCollections();
    return collections.filter(collection => {
        if (collection.isComplete) return true; // Complete master includes all
        return collection.achievements.includes(achievementCode);
    });
}

/**
 * Get rarity badge color for collections
 */
export function getCollectionRarityColor(rarity) {
    const colors = {
        'common': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
        'rare': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        'epic': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
        'legendary': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
    };
    return colors[rarity] || colors['common'];
}

/**
 * Get collection border color based on completion
 */
export function getCollectionBorderColor(completed, rarity) {
    if (completed) {
        return 'border-yellow-400 dark:border-yellow-600';
    }
    const colors = {
        'common': 'border-slate-300 dark:border-slate-600',
        'rare': 'border-blue-300 dark:border-blue-600',
        'epic': 'border-purple-300 dark:border-purple-600',
        'legendary': 'border-yellow-300 dark:border-yellow-600'
    };
    return colors[rarity] || colors['common'];
}

// Make functions available globally
window.AchievementCollections = {
    getAchievementCollections,
    calculateCollectionProgress,
    getCollectionsWithProgress,
    getCollectionById,
    getCollectionsForAchievement,
    getCollectionRarityColor,
    getCollectionBorderColor
};


