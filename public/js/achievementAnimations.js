/**
 * Achievement Animation Utilities
 * Provides confetti, particle effects, and celebration animations for achievement unlocks
 */

/**
 * Create confetti particles
 */
export function createConfetti(container = document.body, options = {}) {
    const {
        particleCount = 50,
        colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
        duration = 3000,
        spread = 360,
        gravity = 0.5,
        speed = 5
    } = options;

    // Create confetti container
    const confettiContainer = document.createElement('div');
    confettiContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        overflow: hidden;
    `;
    container.appendChild(confettiContainer);

    const particles = [];
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = (Math.random() * spread - spread / 2) * (Math.PI / 180);
        const velocity = speed + Math.random() * 3;
        const size = 8 + Math.random() * 8;
        const rotation = Math.random() * 360;
        const rotationSpeed = (Math.random() - 0.5) * 10;

        particle.style.cssText = `
            position: absolute;
            left: ${startX}px;
            top: ${startY}px;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            transform: rotate(${rotation}deg);
            pointer-events: none;
            box-shadow: 0 0 4px ${color};
        `;

        confettiContainer.appendChild(particle);

        particles.push({
            element: particle,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity - 2,
            rotation: rotation,
            rotationSpeed: rotationSpeed,
            gravity: gravity + Math.random() * 0.3
        });
    }

    // Animate particles
    const startTime = Date.now();
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress >= 1) {
            confettiContainer.remove();
            return;
        }

        particles.forEach(particle => {
            particle.vy += particle.gravity;
            particle.rotation += particle.rotationSpeed;

            const x = startX + particle.vx * elapsed * 0.1;
            const y = startY + particle.vy * elapsed * 0.1 + 0.5 * particle.gravity * elapsed * elapsed * 0.0001;

            particle.element.style.left = `${x}px`;
            particle.element.style.top = `${y}px`;
            particle.element.style.transform = `rotate(${particle.rotation}deg)`;
            particle.element.style.opacity = 1 - progress;
        });

        requestAnimationFrame(animate);
    };

    animate();
}

/**
 * Create sparkle effect
 */
export function createSparkles(container = document.body, count = 20) {
    const sparkleContainer = document.createElement('div');
    sparkleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9998;
        overflow: hidden;
    `;
    container.appendChild(sparkleContainer);

    for (let i = 0; i < count; i++) {
        const sparkle = document.createElement('div');
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const size = 4 + Math.random() * 6;
        const delay = Math.random() * 1000;
        const duration = 1000 + Math.random() * 1000;

        sparkle.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, #fff 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            animation: sparkle ${duration}ms ease-in-out ${delay}ms infinite;
        `;

        sparkleContainer.appendChild(sparkle);
    }

    // Add sparkle animation
    if (!document.getElementById('sparkle-animation-style')) {
        const style = document.createElement('style');
        style.id = 'sparkle-animation-style';
        style.textContent = `
            @keyframes sparkle {
                0%, 100% {
                    opacity: 0;
                    transform: scale(0) rotate(0deg);
                }
                50% {
                    opacity: 1;
                    transform: scale(1) rotate(180deg);
                }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => {
        sparkleContainer.remove();
    }, 3000);
}

/**
 * Create ripple effect
 */
export function createRipple(x, y, container = document.body) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        border: 3px solid rgba(59, 130, 246, 0.5);
        pointer-events: none;
        z-index: 9997;
        transform: translate(-50%, -50%);
        animation: ripple 1s ease-out forwards;
    `;
    container.appendChild(ripple);

    // Add ripple animation if not exists
    if (!document.getElementById('ripple-animation-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-animation-style';
        style.textContent = `
            @keyframes ripple {
                to {
                    width: 500px;
                    height: 500px;
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => ripple.remove(), 1000);
}

/**
 * Show achievement celebration modal with animations
 */
export function showAchievementCelebration(achievement, options = {}) {
    const {
        showConfetti = true,
        showSparkles = true,
        autoClose = true,
        closeDelay = 5000
    } = options;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'achievement-celebration-overlay';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease-out;
    `;

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'achievement-celebration-modal';
    modal.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 24px;
        padding: 48px;
        text-align: center;
        color: white;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
        overflow: hidden;
    `;

    // Add glow effect
    const glow = document.createElement('div');
    glow.style.cssText = `
        position: absolute;
        inset: -50%;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
        animation: pulse 2s ease-in-out infinite;
        pointer-events: none;
    `;
    modal.appendChild(glow);

    // Achievement icon
    const iconContainer = document.createElement('div');
    iconContainer.style.cssText = `
        font-size: 80px;
        margin-bottom: 24px;
        animation: bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
    `;
    iconContainer.textContent = achievement.icon || '🏆';

    // Title
    const title = document.createElement('h2');
    title.style.cssText = `
        font-size: 32px;
        font-weight: bold;
        margin-bottom: 12px;
        animation: slideUp 0.5s ease-out 0.3s both;
    `;
    title.textContent = 'Achievement Unlocked!';

    // Achievement name
    const name = document.createElement('h3');
    name.style.cssText = `
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 8px;
        animation: slideUp 0.5s ease-out 0.4s both;
    `;
    name.textContent = achievement.name;

    // Description
    const description = document.createElement('p');
    description.style.cssText = `
        font-size: 16px;
        opacity: 0.9;
        margin-bottom: 24px;
        animation: slideUp 0.5s ease-out 0.5s both;
    `;
    description.textContent = achievement.description;

    // Rarity badge
    const rarity = document.createElement('div');
    rarity.style.cssText = `
        display: inline-block;
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        font-size: 14px;
        font-weight: 600;
        text-transform: capitalize;
        margin-bottom: 24px;
        animation: slideUp 0.5s ease-out 0.6s both;
    `;
    rarity.textContent = achievement.rarity || 'common';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = `
        background: rgba(255, 255, 255, 0.2);
        border: 2px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 12px 32px;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        animation: slideUp 0.5s ease-out 0.7s both;
    `;
    closeBtn.textContent = 'Awesome!';
    closeBtn.onmouseenter = () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
        closeBtn.style.transform = 'scale(1.05)';
    };
    closeBtn.onmouseleave = () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        closeBtn.style.transform = 'scale(1)';
    };
    closeBtn.onclick = () => {
        closeCelebration(overlay);
    };

    // Assemble modal
    modal.appendChild(iconContainer);
    modal.appendChild(title);
    modal.appendChild(name);
    modal.appendChild(description);
    modal.appendChild(rarity);
    modal.appendChild(closeBtn);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Add animations
    if (showConfetti) {
        setTimeout(() => createConfetti(overlay, { particleCount: 100 }), 300);
    }
    if (showSparkles) {
        setTimeout(() => createSparkles(overlay, 30), 400);
    }

    // Add click outside to close
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            closeCelebration(overlay);
        }
    };

    // Auto close
    if (autoClose) {
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                closeCelebration(overlay);
            }
        }, closeDelay);
    }

    // Add CSS animations if not exists
    if (!document.getElementById('celebration-animations-style')) {
        const style = document.createElement('style');
        style.id = 'celebration-animations-style';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes scaleIn {
                from {
                    transform: scale(0.5);
                    opacity: 0;
                }
                to {
                    transform: scale(1);
                    opacity: 1;
                }
            }
            @keyframes bounceIn {
                0% {
                    transform: scale(0);
                    opacity: 0;
                }
                50% {
                    transform: scale(1.2);
                }
                100% {
                    transform: scale(1);
                    opacity: 1;
                }
            }
            @keyframes slideUp {
                from {
                    transform: translateY(20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                    opacity: 0.3;
                }
                50% {
                    transform: scale(1.1);
                    opacity: 0.5;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Close celebration modal
 */
function closeCelebration(overlay) {
    overlay.style.animation = 'fadeOut 0.3s ease-out forwards';
    
    if (!document.getElementById('fadeOut-animation-style')) {
        const style = document.createElement('style');
        style.id = 'fadeOut-animation-style';
        style.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.remove();
        }
    }, 300);
}

/**
 * Animate achievement card unlock
 */
export function animateAchievementCard(cardElement) {
    if (!cardElement) return;

    // Add unlock animation class
    cardElement.style.animation = 'achievementUnlock 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
    
    // Add animation if not exists
    if (!document.getElementById('achievement-card-animation-style')) {
        const style = document.createElement('style');
        style.id = 'achievement-card-animation-style';
        style.textContent = `
            @keyframes achievementUnlock {
                0% {
                    transform: scale(0.8);
                    opacity: 0.5;
                }
                50% {
                    transform: scale(1.1);
                }
                100% {
                    transform: scale(1);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Add glow effect
    cardElement.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)';
    setTimeout(() => {
        cardElement.style.boxShadow = '';
        cardElement.style.animation = '';
    }, 600);
}

// Make functions available globally
window.AchievementAnimations = {
    createConfetti,
    createSparkles,
    createRipple,
    showAchievementCelebration,
    animateAchievementCard
};



