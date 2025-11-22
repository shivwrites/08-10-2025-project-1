/**
 * Achievement History Export
 * Export achievement data in various formats (CSV, JSON, etc.)
 */

/**
 * Export achievements as CSV
 */
export function exportAchievementsCSV(userAchievements, allDefinitions) {
    if (!userAchievements || userAchievements.length === 0) {
        alert('No achievements to export');
        return;
    }

    const unlocked = new Set();
    userAchievements.forEach(ua => {
        const code = ua.achievement_code || ua.achievement_definitions?.code;
        if (code) unlocked.add(code);
    });

    // Create CSV header
    const headers = [
        'Achievement Code',
        'Achievement Name',
        'Description',
        'Category',
        'Rarity',
        'Icon',
        'Unlocked Date',
        'Days Since Unlock'
    ];

    // Create CSV rows
    const rows = [];
    const today = new Date();
    
    userAchievements.forEach(achievement => {
        const code = achievement.achievement_code || achievement.achievement_definitions?.code;
        const def = allDefinitions.find(d => d.code === code) || achievement.achievement_definitions;
        
        if (def) {
            const unlockDate = new Date(achievement.unlocked_at || achievement.created_at || Date.now());
            const daysSince = Math.floor((today - unlockDate) / (1000 * 60 * 60 * 24));
            
            rows.push([
                code || '',
                def.name || '',
                (def.description || '').replace(/"/g, '""'), // Escape quotes
                def.category || '',
                def.rarity || '',
                def.icon || '',
                unlockDate.toISOString().split('T')[0],
                daysSince.toString()
            ]);
        }
    });

    // Sort by unlock date (newest first)
    rows.sort((a, b) => {
        const dateA = new Date(a[6]);
        const dateB = new Date(b[6]);
        return dateB - dateA;
    });

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `achievements-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export achievements as JSON
 */
export function exportAchievementsJSON(userAchievements, allDefinitions, includeMetadata = true) {
    if (!userAchievements || userAchievements.length === 0) {
        alert('No achievements to export');
        return;
    }

    const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        summary: {
            totalUnlocked: userAchievements.length,
            exportTimestamp: Date.now()
        },
        achievements: []
    };

    userAchievements.forEach(achievement => {
        const code = achievement.achievement_code || achievement.achievement_definitions?.code;
        const def = allDefinitions.find(d => d.code === code) || achievement.achievement_definitions;
        
        if (def) {
            const achievementData = {
                code: code,
                name: def.name,
                description: def.description,
                category: def.category,
                rarity: def.rarity,
                icon: def.icon,
                unlockedAt: achievement.unlocked_at || achievement.created_at,
                unlockedDate: new Date(achievement.unlocked_at || achievement.created_at).toISOString()
            };

            if (includeMetadata) {
                achievementData.metadata = achievement.metadata || {};
                achievementData.criteria = {
                    type: def.criteriaType,
                    value: def.criteriaValue
                };
            }

            exportData.achievements.push(achievementData);
        }
    });

    // Sort by unlock date (newest first)
    exportData.achievements.sort((a, b) => {
        const dateA = new Date(a.unlockedAt);
        const dateB = new Date(b.unlockedAt);
        return dateB - dateA;
    });

    // Create and download file
    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `achievements-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export achievement progress report
 */
export function exportProgressReport(userAchievements, allDefinitions, userMetrics, stats) {
    const report = {
        generatedAt: new Date().toISOString(),
        summary: {
            totalAchievements: allDefinitions.length,
            unlocked: userAchievements.length,
            locked: allDefinitions.length - userAchievements.length,
            completionPercentage: stats.completion || 0
        },
        metrics: {
            brandScore: userMetrics.overallScore || userMetrics.overall || 0,
            engagement: userMetrics.engagement || 0,
            visibility: userMetrics.visibility || 0,
            profileCompleteness: userMetrics.profileCompleteness || 0
        },
        categoryBreakdown: {},
        rarityBreakdown: {},
        achievements: []
    };

    // Category breakdown
    Object.keys(stats.byCategory || {}).forEach(category => {
        report.categoryBreakdown[category] = {
            unlocked: stats.byCategory[category].unlocked,
            total: stats.byCategory[category].total,
            percentage: Math.round((stats.byCategory[category].unlocked / stats.byCategory[category].total) * 100)
        };
    });

    // Rarity breakdown
    Object.keys(stats.byRarity || {}).forEach(rarity => {
        report.rarityBreakdown[rarity] = {
            unlocked: stats.byRarity[rarity].unlocked,
            total: stats.byRarity[rarity].total,
            percentage: Math.round((stats.byRarity[rarity].unlocked / stats.byRarity[rarity].total) * 100)
        };
    });

    // Achievement details
    const unlocked = new Set();
    userAchievements.forEach(ua => {
        const code = ua.achievement_code || ua.achievement_definitions?.code;
        if (code) unlocked.add(code);
    });

    allDefinitions.forEach(def => {
        const isUnlocked = unlocked.has(def.code);
        const userAchievement = userAchievements.find(ua => 
            (ua.achievement_code || ua.achievement_definitions?.code) === def.code
        );

        report.achievements.push({
            code: def.code,
            name: def.name,
            description: def.description,
            category: def.category,
            rarity: def.rarity,
            icon: def.icon,
            unlocked: isUnlocked,
            unlockedAt: userAchievement ? (userAchievement.unlocked_at || userAchievement.created_at) : null,
            progress: calculateProgress(def, userMetrics)
        });
    });

    // Create and download file
    const jsonContent = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `achievement-progress-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
 * Export achievement timeline as CSV
 */
export function exportTimelineCSV(userAchievements, allDefinitions) {
    if (!userAchievements || userAchievements.length === 0) {
        alert('No achievements to export');
        return;
    }

    // Sort by date
    const sorted = [...userAchievements]
        .filter(ua => ua.unlocked_at || ua.created_at)
        .sort((a, b) => {
            const dateA = new Date(a.unlocked_at || a.created_at);
            const dateB = new Date(b.unlocked_at || b.created_at);
            return dateA - dateB;
        });

    const headers = [
        'Date',
        'Achievement Code',
        'Achievement Name',
        'Category',
        'Rarity',
        'Cumulative Count'
    ];

    const rows = [];
    let cumulative = 0;

    sorted.forEach(achievement => {
        cumulative++;
        const code = achievement.achievement_code || achievement.achievement_definitions?.code;
        const def = allDefinitions.find(d => d.code === code) || achievement.achievement_definitions;
        const date = new Date(achievement.unlocked_at || achievement.created_at);

        if (def) {
            rows.push([
                date.toISOString().split('T')[0],
                code || '',
                def.name || '',
                def.category || '',
                def.rarity || '',
                cumulative.toString()
            ]);
        }
    });

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `achievement-timeline-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Make functions available globally
window.AchievementExport = {
    exportAchievementsCSV,
    exportAchievementsJSON,
    exportProgressReport,
    exportTimelineCSV
};

