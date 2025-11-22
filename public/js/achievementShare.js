/**
 * Achievement Share and Export Utilities
 * Provides social media sharing and export functionality for achievements
 */

/**
 * Share achievement to social media
 */
export async function shareAchievement(achievement, platform) {
    const shareText = `🏆 Achievement Unlocked: ${achievement.name}!\n\n${achievement.description}\n\n#PersonalBrand #Achievement`;
    const shareUrl = window.location.origin + window.location.pathname;
    
    const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
        email: `mailto:?subject=${encodeURIComponent('Achievement Unlocked: ' + achievement.name)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`
    };

    if (shareUrls[platform]) {
        if (platform === 'email') {
            window.location.href = shareUrls[platform];
        } else {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    } else if (navigator.share && platform === 'native') {
        // Use Web Share API if available
        try {
            await navigator.share({
                title: `Achievement Unlocked: ${achievement.name}`,
                text: shareText,
                url: shareUrl
            });
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
            }
        }
    }
}

/**
 * Copy achievement to clipboard
 */
export async function copyAchievementToClipboard(achievement) {
    const text = `🏆 Achievement Unlocked: ${achievement.name}!\n\n${achievement.description}\n\n${window.location.href}`;
    
    try {
        await navigator.clipboard.writeText(text);
        return { success: true, message: 'Achievement copied to clipboard!' };
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return { success: true, message: 'Achievement copied to clipboard!' };
        } catch (err) {
            document.body.removeChild(textArea);
            return { success: false, message: 'Failed to copy to clipboard' };
        }
    }
}

/**
 * Export achievement card as image
 */
export async function exportAchievementAsImage(achievement, options = {}) {
    // Check if html2canvas is available
    if (typeof html2canvas === 'undefined') {
        // Load html2canvas dynamically
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    }

    try {
        // Find or create achievement card element
        let cardElement = document.querySelector(`[data-achievement-code="${achievement.code}"]`);
        
        if (!cardElement) {
            // Create temporary card for export
            cardElement = createAchievementCardElement(achievement, true);
            document.body.appendChild(cardElement);
            cardElement.style.position = 'absolute';
            cardElement.style.left = '-9999px';
        }

        // Capture the card
        const canvas = await html2canvas(cardElement, {
            backgroundColor: options.backgroundColor || '#ffffff',
            scale: options.scale || 2,
            logging: false,
            useCORS: true
        });

        // Convert to blob and download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `achievement-${achievement.code}-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Remove temporary element if created
            if (cardElement.parentNode && cardElement.style.position === 'absolute') {
                document.body.removeChild(cardElement);
            }
        }, 'image/png');

        return { success: true };
    } catch (error) {
        console.error('Error exporting achievement as image:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Export all achievements as PDF
 */
export async function exportAllAchievementsAsPDF(achievements, unlockedAchievements, options = {}) {
    // Check if jsPDF is available
    if (typeof jsPDF === 'undefined') {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    }

    try {
        const { jsPDF } = window.jspdf || window;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Add title
        doc.setFontSize(20);
        doc.setTextColor(99, 102, 241);
        doc.text('My Achievements', 105, 20, { align: 'center' });

        // Add date
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' });

        let yPosition = 40;
        const unlockedCodes = new Set(unlockedAchievements.map(ua => 
            ua.achievement_code || ua.achievement_definitions?.code
        ).filter(Boolean));

        // Group by category
        const categoryNames = {
            'brand_score': 'Brand Score',
            'engagement': 'Engagement',
            'profile_completion': 'Profile Completion',
            'consistency': 'Consistency'
        };

        const byCategory = {};
        achievements.forEach(achievement => {
            const category = achievement.category || 'other';
            if (!byCategory[category]) {
                byCategory[category] = [];
            }
            byCategory[category].push(achievement);
        });

        // Render achievements by category
        Object.keys(byCategory).forEach(category => {
            // Category header
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFontSize(14);
            doc.setTextColor(99, 102, 241);
            doc.text(categoryNames[category] || category, 20, yPosition);
            yPosition += 10;

            // Achievement items
            byCategory[category].forEach(achievement => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }

                const isUnlocked = unlockedCodes.has(achievement.code);
                
                // Achievement icon and name
                doc.setFontSize(12);
                doc.setTextColor(isUnlocked ? 0 : 150);
                doc.text(`${achievement.icon || '🏆'} ${achievement.name}`, 25, yPosition);
                
                // Status
                doc.setFontSize(10);
                doc.setTextColor(isUnlocked ? 34, 197, 94 : 150);
                doc.text(isUnlocked ? '✓ Unlocked' : '○ Locked', 180, yPosition);
                
                // Description
                yPosition += 6;
                doc.setFontSize(9);
                doc.setTextColor(100);
                const descriptionLines = doc.splitTextToSize(achievement.description, 150);
                doc.text(descriptionLines, 25, yPosition);
                yPosition += descriptionLines.length * 5 + 5;
            });

            yPosition += 5;
        });

        // Save PDF
        doc.save(`achievements-${Date.now()}.pdf`);
        return { success: true };
    } catch (error) {
        console.error('Error exporting achievements as PDF:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Export achievement summary as image
 */
export async function exportAchievementSummaryAsImage(containerId, options = {}) {
    if (typeof html2canvas === 'undefined') {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    }

    try {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error('Container not found');
        }

        const canvas = await html2canvas(container, {
            backgroundColor: options.backgroundColor || '#ffffff',
            scale: options.scale || 2,
            logging: false,
            useCORS: true,
            height: container.scrollHeight,
            width: container.scrollWidth
        });

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `achievements-summary-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 'image/png');

        return { success: true };
    } catch (error) {
        console.error('Error exporting summary:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Create temporary achievement card element for export
 */
function createAchievementCardElement(achievement, isUnlocked) {
    const card = document.createElement('div');
    card.className = 'bg-white border-2 border-indigo-300 rounded-xl p-6 shadow-lg';
    card.style.width = '400px';
    card.style.padding = '24px';
    
    const rarityColors = {
        common: '#94a3b8',
        rare: '#3b82f6',
        epic: '#8b5cf6',
        legendary: '#f59e0b'
    };

    card.innerHTML = `
        <div class="flex items-start gap-4">
            <div class="text-5xl">${achievement.icon || '🏆'}</div>
            <div class="flex-1">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-semibold text-slate-800">${achievement.name}</h3>
                    <span class="px-2 py-1 rounded-full text-xs font-medium" style="background: ${rarityColors[achievement.rarity] || '#94a3b8'}; color: white;">
                        ${achievement.rarity || 'common'}
                    </span>
                </div>
                <p class="text-slate-600 mb-3 text-sm">${achievement.description}</p>
                ${isUnlocked ? `
                    <div class="flex items-center gap-2 text-sm text-green-600 font-medium">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Achievement Unlocked!</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    return card;
}

/**
 * Load external script dynamically
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Make functions available globally
window.AchievementShare = {
    shareAchievement,
    copyAchievementToClipboard,
    exportAchievementAsImage,
    exportAllAchievementsAsPDF,
    exportAchievementSummaryAsImage
};



