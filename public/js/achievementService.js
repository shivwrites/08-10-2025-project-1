/**
 * Achievement Service
 * Handles Supabase integration for achievements
 */

// Import Supabase client (assuming it's loaded globally via supabase.js)
let supabaseClient = null;

// Initialize Supabase client
function initSupabaseClient() {
    if (typeof supabase !== 'undefined' && !supabaseClient) {
        supabaseClient = supabase.createClient(
            'https://bialelscmftlquykreij.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpYWxlbHNjbWZ0bHF1eWtyZWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NzgxMTgsImV4cCI6MjA3NTQ1NDExOH0.wUywvxuTxDlgwVi6y8KaT9E64D4iVRKFFoqUx8wAalI'
        );
    }
    return supabaseClient;
}

// Initialize on load
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSupabaseClient);
    } else {
        initSupabaseClient();
    }
}

/**
 * Get current user ID
 */
async function getCurrentUserId() {
    const client = initSupabaseClient();
    if (!client) {
        console.error('Supabase client not initialized');
        return null;
    }
    
    try {
        const { data: { user }, error } = await client.auth.getUser();
        if (error) {
            console.error('Error getting user:', error);
            return null;
        }
        return user?.id || null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

/**
 * Fetch all achievements for the current user
 */
export async function fetchUserAchievements(userId = null) {
    const client = initSupabaseClient();
    if (!client) {
        console.warn('Supabase client not available, using localStorage fallback');
        return getLocalAchievements();
    }
    
    try {
        const currentUserId = userId || await getCurrentUserId();
        if (!currentUserId) {
            console.warn('No user ID, using localStorage fallback');
            return getLocalAchievements();
        }
        
        const { data, error } = await client
            .from('user_achievements')
            .select(`
                *,
                achievement_definitions (
                    code,
                    name,
                    description,
                    category,
                    icon,
                    rarity
                )
            `)
            .eq('user_id', currentUserId)
            .order('unlocked_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching achievements:', error);
            return getLocalAchievements();
        }
        
        // Save to localStorage as backup
        if (data) {
            localStorage.setItem('user_achievements', JSON.stringify(data));
        }
        
        return data || [];
    } catch (error) {
        console.error('Error in fetchUserAchievements:', error);
        return getLocalAchievements();
    }
}

/**
 * Get recent achievements (for sidebar)
 */
export async function getRecentAchievements(limit = 5, userId = null) {
    const achievements = await fetchUserAchievements(userId);
    return achievements.slice(0, limit);
}

/**
 * Save a newly unlocked achievement
 */
export async function saveAchievement(achievementCode, metadata = {}) {
    const client = initSupabaseClient();
    if (!client) {
        console.warn('Supabase client not available, saving to localStorage');
        return saveLocalAchievement(achievementCode, metadata);
    }
    
    try {
        const currentUserId = await getCurrentUserId();
        if (!currentUserId) {
            console.warn('No user ID, saving to localStorage');
            return saveLocalAchievement(achievementCode, metadata);
        }
        
        const { data, error } = await client
            .from('user_achievements')
            .insert({
                user_id: currentUserId,
                achievement_code: achievementCode,
                metadata: metadata,
                unlocked_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) {
            // If achievement already exists, that's okay
            if (error.code === '23505') { // Unique constraint violation
                console.log('Achievement already unlocked:', achievementCode);
                return { success: true, alreadyExists: true };
            }
            console.error('Error saving achievement:', error);
            return { success: false, error };
        }
        
        // Also save to localStorage as backup
        saveLocalAchievement(achievementCode, metadata);
        
        return { success: true, data };
    } catch (error) {
        console.error('Error in saveAchievement:', error);
        return saveLocalAchievement(achievementCode, metadata);
    }
}

/**
 * Check and unlock achievements based on brand metrics
 */
export async function checkAndUnlockAchievements(brandMetrics, achievementDefinitions) {
    const unlockedAchievements = [];
    
    for (const achievement of achievementDefinitions) {
        // Check if user already has this achievement
        const existing = await fetchUserAchievements();
        const alreadyUnlocked = existing.some(
            ua => ua.achievement_code === achievement.code || ua.achievement_definitions?.code === achievement.code
        );
        
        if (alreadyUnlocked) {
            continue;
        }
        
        // Check eligibility
        const achievementsModule = await import('./achievements.js');
        if (achievementsModule.checkAchievementEligibility(achievement, brandMetrics)) {
            const result = await saveAchievement(achievement.code, {
                unlockedWith: brandMetrics,
                timestamp: new Date().toISOString()
            });
            
            if (result.success) {
                unlockedAchievements.push(achievement);
            }
        }
    }
    
    return unlockedAchievements;
}

/**
 * Get achievements by category
 */
export async function getAchievementsByCategory(category) {
    const achievements = await fetchUserAchievements();
    return achievements.filter(ua => {
        const def = ua.achievement_definitions;
        return def && def.category === category;
    });
}

/**
 * Get all unlocked achievement codes
 */
export async function getUnlockedAchievementCodes() {
    const achievements = await fetchUserAchievements();
    return achievements.map(ua => ua.achievement_code || ua.achievement_definitions?.code).filter(Boolean);
}

// LocalStorage fallback functions
function getLocalAchievements() {
    try {
        const stored = localStorage.getItem('user_achievements');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return [];
    }
}

function saveLocalAchievement(achievementCode, metadata) {
    try {
        const achievements = getLocalAchievements();
        const newAchievement = {
            achievement_code: achievementCode,
            unlocked_at: new Date().toISOString(),
            metadata: metadata
        };
        achievements.unshift(newAchievement);
        localStorage.setItem('user_achievements', JSON.stringify(achievements));
        return { success: true, data: newAchievement };
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return { success: false, error };
    }
}

// Make functions available globally
window.AchievementService = {
    fetchUserAchievements,
    getRecentAchievements,
    saveAchievement,
    checkAndUnlockAchievements,
    getAchievementsByCategory,
    getUnlockedAchievementCodes
};

