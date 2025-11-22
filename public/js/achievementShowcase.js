/**
 * Achievement Showcase Mode
 * Beautiful gallery view for showcasing achievements
 */

/**
 * Render showcase view
 */
export function renderShowcaseView(achievements, unlockedCodes, allDefinitions, options = {}) {
    const {
        filter = 'all',
        sort = 'recent',
        layout = 'grid',
        showLocked = false
    } = options;

    // Filter achievements
    let filtered = allDefinitions;
    
    if (filter === 'unlocked') {
        filtered = filtered.filter(a => unlockedCodes.has(a.code));
    } else if (filter === 'locked') {
        filtered = filtered.filter(a => !unlockedCodes.has(a.code));
    } else if (filter !== 'all') {
        filtered = filtered.filter(a => a.category === filter);
    }

    // Sort achievements
    if (sort === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'rarity') {
        const rarityOrder = { 'legendary': 4, 'epic': 3, 'rare': 2, 'common': 1 };
        filtered.sort((a, b) => (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0));
    } else if (sort === 'recent') {
        // Unlocked first, then by code
        filtered.sort((a, b) => {
            const aUnlocked = unlockedCodes.has(a.code);
            const bUnlocked = unlockedCodes.has(b.code);
            if (aUnlocked && !bUnlocked) return -1;
            if (!aUnlocked && bUnlocked) return 1;
            return a.code.localeCompare(b.code);
        });
    }

    // Filter out locked if not showing them
    if (!showLocked) {
        filtered = filtered.filter(a => unlockedCodes.has(a.code));
    }

    if (filtered.length === 0) {
        return `
            <div class="text-center py-16 text-slate-500 dark:text-slate-400">
                <div class="text-6xl mb-4">🎨</div>
                <p class="text-xl mb-2">No achievements to showcase</p>
                <p class="text-sm">${showLocked ? 'Try adjusting your filters.' : 'Unlock some achievements to see them here!'}</p>
            </div>
        `;
    }

    if (layout === 'masonry') {
        return renderMasonryLayout(filtered, unlockedCodes);
    } else if (layout === 'compact') {
        return renderCompactLayout(filtered, unlockedCodes);
    } else {
        return renderGridLayout(filtered, unlockedCodes);
    }
}

/**
 * Render grid layout
 */
function renderGridLayout(achievements, unlockedCodes) {
    return `
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            ${achievements.map(achievement => {
                const isUnlocked = unlockedCodes.has(achievement.code);
                const rarityColors = {
                    'common': 'from-slate-400 to-slate-600',
                    'rare': 'from-blue-400 to-blue-600',
                    'epic': 'from-purple-400 to-purple-600',
                    'legendary': 'from-yellow-400 to-orange-500'
                };
                
                return `
                    <div class="group relative aspect-square bg-gradient-to-br ${isUnlocked ? rarityColors[achievement.rarity] : 'from-slate-300 to-slate-500'} rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${isUnlocked ? '' : 'opacity-50 grayscale'}" onclick="showAchievementModal('${achievement.code}')">
                        <div class="text-5xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                            ${achievement.icon}
                        </div>
                        <div class="text-center">
                            <h3 class="text-sm font-bold text-white mb-1 line-clamp-2">${achievement.name}</h3>
                            ${isUnlocked ? `
                                <div class="absolute top-2 right-2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                            ` : `
                                <div class="absolute top-2 right-2 w-6 h-6 bg-black/20 rounded-full flex items-center justify-center">
                                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                    </svg>
                                </div>
                            `}
                        </div>
                        <div class="absolute bottom-2 left-2 right-2">
                            <div class="text-xs text-white/80 text-center line-clamp-1">${achievement.rarity}</div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

/**
 * Render masonry layout
 */
function renderMasonryLayout(achievements, unlockedCodes) {
    // Group by rarity for better visual flow
    const byRarity = {
        'legendary': [],
        'epic': [],
        'rare': [],
        'common': []
    };
    
    achievements.forEach(achievement => {
        if (byRarity[achievement.rarity]) {
            byRarity[achievement.rarity].push(achievement);
        }
    });

    return `
        <div class="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            ${Object.values(byRarity).flat().map(achievement => {
                const isUnlocked = unlockedCodes.has(achievement.code);
                const rarityColors = {
                    'common': 'from-slate-400 to-slate-600',
                    'rare': 'from-blue-400 to-blue-600',
                    'epic': 'from-purple-400 to-purple-600',
                    'legendary': 'from-yellow-400 to-orange-500'
                };
                
                return `
                    <div class="break-inside-avoid mb-4 bg-gradient-to-br ${isUnlocked ? rarityColors[achievement.rarity] : 'from-slate-300 to-slate-500'} rounded-xl p-4 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${isUnlocked ? '' : 'opacity-50 grayscale'}" onclick="showAchievementModal('${achievement.code}')">
                        <div class="text-center">
                            <div class="text-4xl mb-2">${achievement.icon}</div>
                            <h3 class="text-sm font-bold text-white mb-1">${achievement.name}</h3>
                            <p class="text-xs text-white/80 mb-2 line-clamp-2">${achievement.description}</p>
                            <div class="flex items-center justify-center gap-2">
                                ${isUnlocked ? `
                                    <span class="text-xs bg-white/20 px-2 py-1 rounded-full text-white">✓ Unlocked</span>
                                ` : `
                                    <span class="text-xs bg-black/20 px-2 py-1 rounded-full text-white">🔒 Locked</span>
                                `}
                                <span class="text-xs text-white/60">${achievement.rarity}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

/**
 * Render compact layout
 */
function renderCompactLayout(achievements, unlockedCodes) {
    return `
        <div class="space-y-2">
            ${achievements.map(achievement => {
                const isUnlocked = unlockedCodes.has(achievement.code);
                const rarityColors = {
                    'common': 'border-slate-300',
                    'rare': 'border-blue-400',
                    'epic': 'border-purple-400',
                    'legendary': 'border-yellow-400'
                };
                
                return `
                    <div class="flex items-center gap-4 p-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border-l-4 ${isUnlocked ? rarityColors[achievement.rarity] : 'border-slate-300'} rounded-lg cursor-pointer hover:shadow-md transition-all ${isUnlocked ? '' : 'opacity-50'}" onclick="showAchievementModal('${achievement.code}')">
                        <div class="text-3xl">${achievement.icon}</div>
                        <div class="flex-1 min-w-0">
                            <h3 class="font-semibold text-slate-800 dark:text-slate-200 truncate">${achievement.name}</h3>
                            <p class="text-xs text-slate-600 dark:text-slate-400 truncate">${achievement.description}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            ${isUnlocked ? `
                                <span class="text-green-600 dark:text-green-400 text-sm">✓</span>
                            ` : `
                                <span class="text-slate-400 text-sm">🔒</span>
                            `}
                            <span class="px-2 py-1 rounded text-xs font-medium ${getRarityBadgeClass(achievement.rarity)}">
                                ${achievement.rarity}
                            </span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
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

/**
 * Get showcase statistics
 */
export function getShowcaseStats(achievements, unlockedCodes) {
    const unlocked = achievements.filter(a => unlockedCodes.has(a.code));
    const byRarity = {
        'common': 0,
        'rare': 0,
        'epic': 0,
        'legendary': 0
    };
    
    unlocked.forEach(achievement => {
        if (byRarity[achievement.rarity]) {
            byRarity[achievement.rarity]++;
        }
    });
    
    return {
        total: achievements.length,
        unlocked: unlocked.length,
        locked: achievements.length - unlocked.length,
        byRarity,
        completion: achievements.length > 0 ? Math.round((unlocked.length / achievements.length) * 100) : 0
    };
}

// Make functions available globally
window.AchievementShowcase = {
    renderShowcaseView,
    getShowcaseStats
};


