/**
 * Achievement Rewards & Incentives
 * Provides rewards and incentives for unlocking achievements
 */

/**
 * Define rewards for achievements
 */
export function getAchievementRewards() {
    return {
        // Individual achievement rewards
        'BRAND_SCORE_60': {
            type: 'feature',
            name: 'Brand Analytics Access',
            description: 'Unlock advanced brand analytics dashboard',
            icon: '📊',
            value: 'analytics_access'
        },
        'BRAND_SCORE_70': {
            type: 'badge',
            name: 'Brand Builder Badge',
            description: 'Display on your profile',
            icon: '🏅',
            value: 'brand_builder_badge'
        },
        'BRAND_SCORE_80': {
            type: 'feature',
            name: 'Premium Insights',
            description: 'Access to premium brand insights',
            icon: '💎',
            value: 'premium_insights'
        },
        'BRAND_SCORE_90': {
            type: 'discount',
            name: '20% Premium Discount',
            description: 'Get 20% off premium features',
            icon: '🎁',
            value: 'premium_discount_20'
        },
        'BRAND_SCORE_95': {
            type: 'feature',
            name: 'VIP Status',
            description: 'Unlock VIP features and priority support',
            icon: '👑',
            value: 'vip_status'
        },
        'ENGAGEMENT_75': {
            type: 'feature',
            name: 'Engagement Analytics',
            description: 'Advanced engagement tracking',
            icon: '📈',
            value: 'engagement_analytics'
        },
        'ENGAGEMENT_90': {
            type: 'badge',
            name: 'Engagement Master Badge',
            description: 'Showcase your engagement expertise',
            icon: '🔥',
            value: 'engagement_master_badge'
        },
        'PROFILE_100': {
            type: 'feature',
            name: 'Profile Optimization Tools',
            description: 'Access to advanced profile optimization',
            icon: '✨',
            value: 'profile_optimization'
        },
        'CONSISTENCY_30': {
            type: 'feature',
            name: 'Consistency Tracker',
            description: 'Advanced activity tracking features',
            icon: '📅',
            value: 'consistency_tracker'
        },
        'CONTENT_100': {
            type: 'feature',
            name: 'Content Studio Pro',
            description: 'Access to premium content creation tools',
            icon: '✍️',
            value: 'content_studio_pro'
        },
        'NETWORK_500': {
            type: 'badge',
            name: 'Network Master Badge',
            description: 'Show your networking expertise',
            icon: '🌐',
            value: 'network_master_badge'
        },
        'THOUGHT_INFLUENCE': {
            type: 'feature',
            name: 'Thought Leadership Hub',
            description: 'Access to exclusive thought leadership tools',
            icon: '🌟',
            value: 'thought_leadership_hub'
        },
        // Collection rewards
        'brand-master': {
            type: 'badge',
            name: 'Brand Master Collection Badge',
            description: 'Exclusive badge for completing Brand Master collection',
            icon: '👑',
            value: 'brand_master_collection_badge',
            isCollection: true
        },
        'complete-master': {
            type: 'feature',
            name: 'Lifetime Premium Access',
            description: 'Unlock all premium features forever',
            icon: '💎',
            value: 'lifetime_premium',
            isCollection: true
        }
    };
}

/**
 * Get rewards for unlocked achievements
 */
export function getUserRewards(unlockedCodes, collections) {
    const rewards = getAchievementRewards();
    const userRewards = [];
    const claimedRewards = getClaimedRewards();
    
    // Check individual achievement rewards
    unlockedCodes.forEach(code => {
        if (rewards[code] && !claimedRewards.has(rewards[code].value)) {
            userRewards.push({
                ...rewards[code],
                source: 'achievement',
                sourceCode: code,
                claimed: false
            });
        }
    });
    
    // Check collection rewards
    if (collections) {
        collections.forEach(collection => {
            if (collection.progress.completed && rewards[collection.id]) {
                const reward = rewards[collection.id];
                if (!claimedRewards.has(reward.value)) {
                    userRewards.push({
                        ...reward,
                        source: 'collection',
                        sourceId: collection.id,
                        claimed: false
                    });
                }
            }
        });
    }
    
    return userRewards;
}

/**
 * Get claimed rewards from storage
 */
function getClaimedRewards() {
    try {
        const stored = localStorage.getItem('claimed_achievement_rewards');
        return new Set(stored ? JSON.parse(stored) : []);
    } catch (error) {
        console.error('Error reading claimed rewards:', error);
        return new Set();
    }
}

/**
 * Claim a reward
 */
export function claimReward(rewardValue) {
    try {
        const claimed = getClaimedRewards();
        claimed.add(rewardValue);
        localStorage.setItem('claimed_achievement_rewards', JSON.stringify(Array.from(claimed)));
        return { success: true };
    } catch (error) {
        console.error('Error claiming reward:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Check if reward is claimed
 */
export function isRewardClaimed(rewardValue) {
    const claimed = getClaimedRewards();
    return claimed.has(rewardValue);
}

/**
 * Get reward type color
 */
export function getRewardTypeColor(type) {
    const colors = {
        'feature': 'from-blue-500 to-indigo-600',
        'badge': 'from-purple-500 to-pink-600',
        'discount': 'from-green-500 to-emerald-600',
        'vip': 'from-yellow-400 to-orange-500'
    };
    return colors[type] || colors['feature'];
}

/**
 * Get reward type icon
 */
export function getRewardTypeIcon(type) {
    const icons = {
        'feature': '🔓',
        'badge': '🏅',
        'discount': '🎁',
        'vip': '👑'
    };
    return icons[type] || icons['feature'];
}

/**
 * Apply reward (in a real app, this would trigger actual feature unlocks)
 */
export function applyReward(reward) {
    // In production, this would:
    // - Unlock features in the app
    // - Apply discounts to user account
    // - Add badges to profile
    // - Grant VIP status
    
    console.log('Applying reward:', reward);
    
    // For now, just show a success message
    return {
        success: true,
        message: `Reward "${reward.name}" has been applied!`
    };
}

// Make functions available globally
window.AchievementRewards = {
    getAchievementRewards,
    getUserRewards,
    claimReward,
    isRewardClaimed,
    getRewardTypeColor,
    getRewardTypeIcon,
    applyReward
};


