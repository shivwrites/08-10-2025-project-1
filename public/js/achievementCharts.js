/**
 * Achievement Progress Charts
 * Provides chart visualizations for achievement progress over time
 */

/**
 * Process achievement data for time-series charts
 */
export function processAchievementTimeSeries(userAchievements) {
    if (!userAchievements || userAchievements.length === 0) {
        return {
            dates: [],
            cumulative: [],
            daily: [],
            byCategory: {},
            byRarity: {}
        };
    }

    // Sort by date
    const sorted = [...userAchievements].sort((a, b) => {
        const dateA = new Date(a.unlocked_at || a.created_at || Date.now());
        const dateB = new Date(b.unlocked_at || b.created_at || Date.now());
        return dateA - dateB;
    });

    // Group by date
    const dailyData = {};
    const categoryData = {};
    const rarityData = {};
    let cumulative = 0;

    sorted.forEach(achievement => {
        const date = new Date(achievement.unlocked_at || achievement.created_at || Date.now());
        const dateKey = date.toISOString().split('T')[0];
        
        // Daily count
        dailyData[dateKey] = (dailyData[dateKey] || 0) + 1;
        cumulative++;

        // Category tracking
        const category = achievement.achievement_definitions?.category || achievement.category || 'unknown';
        if (!categoryData[category]) {
            categoryData[category] = {};
        }
        categoryData[category][dateKey] = (categoryData[category][dateKey] || 0) + 1;

        // Rarity tracking
        const rarity = achievement.achievement_definitions?.rarity || achievement.rarity || 'common';
        if (!rarityData[rarity]) {
            rarityData[rarity] = {};
        }
        rarityData[rarity][dateKey] = (rarityData[rarity][dateKey] || 0) + 1;
    });

    // Get date range
    const dates = Object.keys(dailyData).sort();
    const startDate = dates.length > 0 ? new Date(dates[0]) : new Date();
    const endDate = new Date();
    
    // Fill in missing dates
    const allDates = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0];
        allDates.push(dateKey);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Build cumulative data
    const cumulativeData = [];
    let runningTotal = 0;
    allDates.forEach(date => {
        runningTotal += (dailyData[date] || 0);
        cumulativeData.push(runningTotal);
    });

    // Build daily data
    const dailyCounts = allDates.map(date => dailyData[date] || 0);

    // Build category time series
    const categoryTimeSeries = {};
    Object.keys(categoryData).forEach(category => {
        categoryTimeSeries[category] = allDates.map(date => categoryData[category][date] || 0);
    });

    // Build rarity time series
    const rarityTimeSeries = {};
    Object.keys(rarityData).forEach(rarity => {
        rarityTimeSeries[rarity] = allDates.map(date => rarityData[rarity][date] || 0);
    });

    return {
        dates: allDates.map(d => {
            const date = new Date(d);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        cumulative: cumulativeData,
        daily: dailyCounts,
        byCategory: categoryTimeSeries,
        byRarity: rarityTimeSeries,
        totalUnlocked: cumulative
    };
}

/**
 * Calculate achievement velocity (unlocks per period)
 */
export function calculateAchievementVelocity(userAchievements, period = 'week') {
    if (!userAchievements || userAchievements.length === 0) {
        return {
            current: 0,
            average: 0,
            trend: 'stable'
        };
    }

    const now = new Date();
    const periodMs = period === 'week' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
    const periodStart = new Date(now.getTime() - periodMs);
    const previousPeriodStart = new Date(periodStart.getTime() - periodMs);

    const currentPeriod = userAchievements.filter(a => {
        const date = new Date(a.unlocked_at || a.created_at || Date.now());
        return date >= periodStart;
    }).length;

    const previousPeriod = userAchievements.filter(a => {
        const date = new Date(a.unlocked_at || a.created_at || Date.now());
        return date >= previousPeriodStart && date < periodStart;
    }).length;

    const average = userAchievements.length / Math.ceil((now - new Date(userAchievements[0]?.unlocked_at || now)) / periodMs);

    let trend = 'stable';
    if (currentPeriod > previousPeriod * 1.1) trend = 'increasing';
    else if (currentPeriod < previousPeriod * 0.9) trend = 'decreasing';

    return {
        current: currentPeriod,
        previous: previousPeriod,
        average: Math.round(average * 10) / 10,
        trend
    };
}

/**
 * Render achievement unlocks over time chart
 */
export function renderUnlocksOverTimeChart(canvasId, userAchievements) {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded');
        return null;
    }

    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.warn(`Canvas element not found: ${canvasId}`);
        return null;
    }

    const ctx = canvas.getContext('2d');
    const data = processAchievementTimeSeries(userAchievements);

    // Destroy existing chart if it exists
    if (window.achievementCharts && window.achievementCharts[canvasId]) {
        window.achievementCharts[canvasId].destroy();
    }

    if (!window.achievementCharts) {
        window.achievementCharts = {};
    }

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.dates,
            datasets: [
                {
                    label: 'Cumulative Achievements',
                    data: data.cumulative,
                    borderColor: 'rgb(99, 102, 241)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: 'rgb(99, 102, 241)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Daily Unlocks',
                    data: data.daily,
                    borderColor: 'rgb(139, 92, 246)',
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 12
                    },
                    borderColor: 'rgba(99, 102, 241, 0.5)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        font: {
                            size: 10
                        }
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Cumulative Achievements',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Daily Unlocks',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });

    window.achievementCharts[canvasId] = chart;
    return chart;
}

/**
 * Render category breakdown over time chart
 */
export function renderCategoryBreakdownChart(canvasId, userAchievements) {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded');
        return null;
    }

    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.warn(`Canvas element not found: ${canvasId}`);
        return null;
    }

    const ctx = canvas.getContext('2d');
    const data = processAchievementTimeSeries(userAchievements);

    // Destroy existing chart if it exists
    if (window.achievementCharts && window.achievementCharts[canvasId]) {
        window.achievementCharts[canvasId].destroy();
    }

    if (!window.achievementCharts) {
        window.achievementCharts = {};
    }

    const categoryColors = {
        'brand_score': 'rgba(99, 102, 241, 0.8)',
        'engagement': 'rgba(236, 72, 153, 0.8)',
        'profile_completion': 'rgba(10, 185, 129, 0.8)',
        'consistency': 'rgba(245, 158, 11, 0.8)',
        'unknown': 'rgba(148, 163, 184, 0.8)'
    };

    const categoryNames = {
        'brand_score': 'Brand Score',
        'engagement': 'Engagement',
        'profile_completion': 'Profile Completion',
        'consistency': 'Consistency',
        'unknown': 'Other'
    };

    const datasets = Object.keys(data.byCategory).map((category, index) => ({
        label: categoryNames[category] || category,
        data: data.byCategory[category],
        backgroundColor: categoryColors[category] || `rgba(${100 + index * 50}, ${150 + index * 30}, ${200 + index * 20}, 0.8)`,
        borderColor: categoryColors[category]?.replace('0.8', '1') || `rgba(${100 + index * 50}, ${150 + index * 30}, ${200 + index * 20}, 1)`,
        borderWidth: 2
    }));

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.dates,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        font: {
                            size: 10
                        }
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Achievements Unlocked',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });

    window.achievementCharts[canvasId] = chart;
    return chart;
}

/**
 * Render rarity distribution pie chart
 */
export function renderRarityDistributionChart(canvasId, userAchievements, allDefinitions) {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded');
        return null;
    }

    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.warn(`Canvas element not found: ${canvasId}`);
        return null;
    }

    const ctx = canvas.getContext('2d');

    // Count achievements by rarity
    const rarityCounts = {
        common: 0,
        rare: 0,
        epic: 0,
        legendary: 0
    };

    userAchievements.forEach(achievement => {
        const rarity = achievement.achievement_definitions?.rarity || achievement.rarity || 'common';
        if (rarityCounts.hasOwnProperty(rarity)) {
            rarityCounts[rarity]++;
        }
    });

    const rarityColors = {
        common: 'rgba(148, 163, 184, 0.8)',
        rare: 'rgba(59, 130, 246, 0.8)',
        epic: 'rgba(139, 92, 246, 0.8)',
        legendary: 'rgba(245, 158, 11, 0.8)'
    };

    const rarityLabels = {
        common: 'Common',
        rare: 'Rare',
        epic: 'Epic',
        legendary: 'Legendary'
    };

    const labels = [];
    const data = [];
    const colors = [];
    const borderColors = [];

    Object.keys(rarityCounts).forEach(rarity => {
        if (rarityCounts[rarity] > 0) {
            labels.push(rarityLabels[rarity]);
            data.push(rarityCounts[rarity]);
            colors.push(rarityColors[rarity]);
            borderColors.push(rarityColors[rarity].replace('0.8', '1'));
        }
    });

    // Destroy existing chart if it exists
    if (window.achievementCharts && window.achievementCharts[canvasId]) {
        window.achievementCharts[canvasId].destroy();
    }

    if (!window.achievementCharts) {
        window.achievementCharts = {};
    }

    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    window.achievementCharts[canvasId] = chart;
    return chart;
}

// Make functions available globally
window.AchievementCharts = {
    processAchievementTimeSeries,
    calculateAchievementVelocity,
    renderUnlocksOverTimeChart,
    renderCategoryBreakdownChart,
    renderRarityDistributionChart
};



