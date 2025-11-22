/**
 * Achievement Comparison
 * Compare user achievements with industry benchmarks and averages
 */

/**
 * Industry benchmark data (mock data - in production, this would come from analytics)
 */
const INDUSTRY_BENCHMARKS = {
    averageUnlocked: 8, // Average achievements unlocked per user
    topPercentile: 20, // Top 10% users have this many
    medianUnlocked: 6,
    averageCompletion: 25, // Average completion percentage
    categoryAverages: {
        'brand_score': { average: 2, topPercentile: 4 },
        'engagement': { average: 2, topPercentile: 4 },
        'profile_completion': { average: 1, topPercentile: 2 },
        'consistency': { average: 0.5, topPercentile: 2 },
        'content_creation': { average: 1, topPercentile: 3 },
        'networking': { average: 1, topPercentile: 3 },
        'learning': { average: 0.5, topPercentile: 2 },
        'thought_leadership': { average: 0.5, topPercentile: 2 }
    },
    rarityDistribution: {
        'common': { average: 5, topPercentile: 10 },
        'rare': { average: 2, topPercentile: 5 },
        'epic': { average: 0.5, topPercentile: 2 },
        'legendary': { average: 0.1, topPercentile: 1 }
    }
};

/**
 * Calculate user percentile
 */
export function calculateUserPercentile(userStats, benchmarks) {
    const totalUnlocked = userStats.totalUnlocked || 0;
    const average = benchmarks.averageUnlocked || 0;
    const topPercentile = benchmarks.topPercentile || 0;
    
    if (totalUnlocked >= topPercentile) {
        return { percentile: 90, label: 'Top 10%', color: 'text-yellow-600', icon: '👑' };
    } else if (totalUnlocked >= average * 1.5) {
        return { percentile: 75, label: 'Top 25%', color: 'text-purple-600', icon: '⭐' };
    } else if (totalUnlocked >= average) {
        return { percentile: 50, label: 'Above Average', color: 'text-blue-600', icon: '📈' };
    } else if (totalUnlocked >= average * 0.5) {
        return { percentile: 25, label: 'Below Average', color: 'text-orange-600', icon: '📊' };
    } else {
        return { percentile: 10, label: 'Getting Started', color: 'text-slate-600', icon: '🌱' };
    }
}

/**
 * Compare user achievements with benchmarks
 */
export function compareWithBenchmarks(userStats, unlockedCodes, allDefinitions) {
    const unlocked = new Set(unlockedCodes);
    const totalUnlocked = unlocked.size;
    const totalAchievements = allDefinitions.length;
    const completion = totalAchievements > 0 ? (totalUnlocked / totalAchievements) * 100 : 0;
    
    // Category comparison
    const categoryComparison = {};
    Object.keys(INDUSTRY_BENCHMARKS.categoryAverages).forEach(category => {
        const categoryAchievements = allDefinitions.filter(a => a.category === category);
        const unlockedInCategory = categoryAchievements.filter(a => unlocked.has(a.code)).length;
        const benchmark = INDUSTRY_BENCHMARKS.categoryAverages[category];
        
        categoryComparison[category] = {
            user: unlockedInCategory,
            average: benchmark.average,
            topPercentile: benchmark.topPercentile,
            difference: unlockedInCategory - benchmark.average,
            percentage: benchmark.average > 0 ? ((unlockedInCategory / benchmark.average) * 100) : 0
        };
    });
    
    // Rarity comparison
    const rarityComparison = {};
    Object.keys(INDUSTRY_BENCHMARKS.rarityDistribution).forEach(rarity => {
        const rarityAchievements = allDefinitions.filter(a => a.rarity === rarity);
        const unlockedInRarity = rarityAchievements.filter(a => unlocked.has(a.code)).length;
        const benchmark = INDUSTRY_BENCHMARKS.rarityDistribution[rarity];
        
        rarityComparison[rarity] = {
            user: unlockedInRarity,
            average: benchmark.average,
            topPercentile: benchmark.topPercentile,
            difference: unlockedInRarity - benchmark.average,
            percentage: benchmark.average > 0 ? ((unlockedInRarity / benchmark.average) * 100) : 0
        };
    });
    
    // Overall comparison
    const overallComparison = {
        totalUnlocked: {
            user: totalUnlocked,
            average: INDUSTRY_BENCHMARKS.averageUnlocked,
            median: INDUSTRY_BENCHMARKS.medianUnlocked,
            topPercentile: INDUSTRY_BENCHMARKS.topPercentile,
            difference: totalUnlocked - INDUSTRY_BENCHMARKS.averageUnlocked,
            percentage: INDUSTRY_BENCHMARKS.averageUnlocked > 0 ? ((totalUnlocked / INDUSTRY_BENCHMARKS.averageUnlocked) * 100) : 0
        },
        completion: {
            user: completion,
            average: INDUSTRY_BENCHMARKS.averageCompletion,
            difference: completion - INDUSTRY_BENCHMARKS.averageCompletion,
            percentage: INDUSTRY_BENCHMARKS.averageCompletion > 0 ? ((completion / INDUSTRY_BENCHMARKS.averageCompletion) * 100) : 0
        }
    };
    
    // Calculate percentile
    const percentile = calculateUserPercentile(
        { totalUnlocked, completion },
        INDUSTRY_BENCHMARKS
    );
    
    return {
        overall: overallComparison,
        category: categoryComparison,
        rarity: rarityComparison,
        percentile
    };
}

/**
 * Get comparison insights
 */
export function getComparisonInsights(comparison) {
    const insights = [];
    
    // Overall insights
    if (comparison.overall.totalUnlocked.difference > 0) {
        insights.push({
            type: 'positive',
            message: `You've unlocked ${Math.round(comparison.overall.totalUnlocked.difference)} more achievements than average!`,
            icon: '🎉'
        });
    } else if (comparison.overall.totalUnlocked.difference < 0) {
        insights.push({
            type: 'motivational',
            message: `You're ${Math.abs(Math.round(comparison.overall.totalUnlocked.difference))} achievements away from the average. Keep going!`,
            icon: '💪'
        });
    }
    
    // Category insights
    const strongCategories = Object.entries(comparison.category)
        .filter(([_, data]) => data.difference > 1)
        .map(([category, _]) => category);
    
    if (strongCategories.length > 0) {
        insights.push({
            type: 'positive',
            message: `You excel in ${strongCategories.length} category${strongCategories.length > 1 ? 'ies' : ''}!`,
            icon: '⭐'
        });
    }
    
    // Rarity insights
    const epicUnlocked = comparison.rarity.epic?.user || 0;
    const legendaryUnlocked = comparison.rarity.legendary?.user || 0;
    
    if (legendaryUnlocked > 0) {
        insights.push({
            type: 'exceptional',
            message: `You have ${legendaryUnlocked} legendary achievement${legendaryUnlocked > 1 ? 's' : ''}! Only top performers achieve this.`,
            icon: '👑'
        });
    } else if (epicUnlocked > 0) {
        insights.push({
            type: 'positive',
            message: `You have ${epicUnlocked} epic achievement${epicUnlocked > 1 ? 's' : ''}! Great work!`,
            icon: '💎'
        });
    }
    
    return insights;
}

/**
 * Render comparison view
 */
export function renderComparisonView(comparison, insights, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const categoryNames = {
        'brand_score': 'Brand Score',
        'engagement': 'Engagement',
        'profile_completion': 'Profile',
        'consistency': 'Consistency',
        'content_creation': 'Content',
        'networking': 'Networking',
        'learning': 'Learning',
        'thought_leadership': 'Thought Leadership'
    };
    
    container.innerHTML = `
        <div class="space-y-6">
            <!-- Percentile Badge -->
            <div class="bg-gradient-to-r ${comparison.percentile.percentile >= 75 ? 'from-yellow-400 to-orange-500' : comparison.percentile.percentile >= 50 ? 'from-blue-400 to-purple-500' : 'from-slate-400 to-slate-600'} rounded-xl p-6 text-white text-center">
                <div class="text-4xl mb-2">${comparison.percentile.icon}</div>
                <h3 class="text-2xl font-bold mb-1">${comparison.percentile.label}</h3>
                <p class="text-white/90">You're in the ${comparison.percentile.percentile}th percentile</p>
            </div>
            
            <!-- Insights -->
            ${insights.length > 0 ? `
                <div class="space-y-2">
                    ${insights.map(insight => `
                        <div class="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                            <div class="flex items-center gap-3">
                                <span class="text-2xl">${insight.icon}</span>
                                <p class="text-sm text-slate-700 dark:text-slate-300">${insight.message}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <!-- Overall Comparison -->
            <div class="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Overall Comparison</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <div class="text-sm text-slate-600 dark:text-slate-400 mb-2">Total Achievements</div>
                        <div class="flex items-center gap-4">
                            <div class="flex-1">
                                <div class="flex items-center justify-between mb-1">
                                    <span class="text-2xl font-bold text-slate-800 dark:text-slate-200">${comparison.overall.totalUnlocked.user}</span>
                                    <span class="text-sm ${comparison.overall.totalUnlocked.difference >= 0 ? 'text-green-600' : 'text-red-600'}">
                                        ${comparison.overall.totalUnlocked.difference >= 0 ? '+' : ''}${Math.round(comparison.overall.totalUnlocked.difference)}
                                    </span>
                                </div>
                                <div class="text-xs text-slate-500 dark:text-slate-400">vs. ${comparison.overall.totalUnlocked.average} average</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div class="text-sm text-slate-600 dark:text-slate-400 mb-2">Completion Rate</div>
                        <div class="flex items-center gap-4">
                            <div class="flex-1">
                                <div class="flex items-center justify-between mb-1">
                                    <span class="text-2xl font-bold text-slate-800 dark:text-slate-200">${Math.round(comparison.overall.completion.user)}%</span>
                                    <span class="text-sm ${comparison.overall.completion.difference >= 0 ? 'text-green-600' : 'text-red-600'}">
                                        ${comparison.overall.completion.difference >= 0 ? '+' : ''}${Math.round(comparison.overall.completion.difference)}%
                                    </span>
                                </div>
                                <div class="text-xs text-slate-500 dark:text-slate-400">vs. ${Math.round(comparison.overall.completion.average)}% average</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Category Comparison -->
            <div class="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Category Comparison</h3>
                <div class="space-y-3">
                    ${Object.entries(comparison.category).map(([category, data]) => `
                        <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <div class="flex-1">
                                <div class="font-medium text-slate-800 dark:text-slate-200 text-sm mb-1">${categoryNames[category] || category}</div>
                                <div class="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                    <span>You: ${data.user}</span>
                                    <span>Avg: ${data.average.toFixed(1)}</span>
                                    <span>Top 10%: ${data.topPercentile}</span>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-lg font-bold ${data.difference >= 0 ? 'text-green-600' : 'text-red-600'}">
                                    ${data.difference >= 0 ? '+' : ''}${Math.round(data.difference)}
                                </div>
                                <div class="text-xs text-slate-500 dark:text-slate-400">
                                    ${Math.round(data.percentage)}% of avg
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Rarity Comparison -->
            <div class="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Rarity Comparison</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${Object.entries(comparison.rarity).map(([rarity, data]) => `
                        <div class="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <div class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 capitalize">${rarity}</div>
                            <div class="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-1">${data.user}</div>
                            <div class="text-xs text-slate-500 dark:text-slate-400">vs. ${data.average.toFixed(1)} avg</div>
                            <div class="text-xs ${data.difference >= 0 ? 'text-green-600' : 'text-red-600'} mt-1">
                                ${data.difference >= 0 ? '+' : ''}${Math.round(data.difference)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Make functions available globally
window.AchievementComparison = {
    compareWithBenchmarks,
    getComparisonInsights,
    renderComparisonView,
    calculateUserPercentile
};


