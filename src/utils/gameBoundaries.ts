/**
 * Game Boundaries Utility
 * Calculates safe play areas that exclude HUD elements (score, timer, controls, messages)
 * Ensures game objects don't spawn behind or collide with UI elements
 *
 * Supports: iPhone SE, iPhone 12 Pro, iPad Air, Desktop
 */

export interface GameBoundaries {
    top: number;       // Safe area starts this many pixels from top
    bottom: number;    // Safe area ends this many pixels from bottom
    left: number;      // Safe area starts this many pixels from left
    right: number;     // Safe area ends this many pixels from right
    width: number;     // Safe area width
    height: number;    // Safe area height
}

/**
 * Calculate safe game boundaries based on viewport size
 * Excludes HUD areas: score display (top-right), timer display (top-left), bottom messages
 */
export function getGameBoundaries(): GameBoundaries {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate HUD zone sizes based on viewport
    // These values match the CSS media queries in index.css

    let topPadding: number;
    let bottomPadding: number;
    let leftPadding: number;
    let rightPadding: number;

    // iPhone SE and smaller (375px and below)
    // Timer: top 0.5rem + font 1rem + padding 0.8rem + controls (36px) + gaps ≈ 90px
    // Bottom: message at 80px + padding ≈ 140px
    if (viewportWidth <= 375) {
        topPadding = 95;       // HUD: 0.5rem top + timer + controls in column layout
        bottomPadding = 140;   // Bottom message area + safety margin
        leftPadding = 10;      // Minimal side padding
        rightPadding = 10;     // Minimal side padding
    }
    // iPhone 12/13/14 (376px-428px)
    // Similar to iPhone SE but slightly more generous
    else if (viewportWidth <= 428) {
        topPadding = 100;      // Slightly larger HUD spacing
        bottomPadding = 150;   // Bottom message at ~80px + safety
        leftPadding = 10;
        rightPadding = 10;
    }
    // Landscape mode (short screens)
    // HUD is more compact in landscape, controls are in row
    else if (viewportHeight <= 480) {
        topPadding = 65;       // Compact HUD in landscape (controls in row)
        bottomPadding = 100;   // Less vertical space needed
        leftPadding = 10;
        rightPadding = 10;
    }
    // Tablet (iPad Air) and medium screens
    // HUD still stacked on smaller tablets
    else if (viewportWidth <= 768) {
        topPadding = 105;      // Standard mobile HUD with more space
        bottomPadding = 170;   // Bottom message area
        leftPadding = 10;
        rightPadding = 10;
    }
    // Desktop and large screens
    // Timer and Score side-by-side, controls inline
    else {
        topPadding = 85;       // Desktop HUD: 1rem top + 1.5rem font + 1rem padding ≈ 56px + safety
        bottomPadding = 180;   // More space for messages
        leftPadding = 15;      // Timer display (left side) with controls
        rightPadding = 15;     // Score display (right side)
    }

    return {
        top: topPadding,
        bottom: viewportHeight - bottomPadding,
        left: leftPadding,
        right: viewportWidth - rightPadding,
        width: viewportWidth - leftPadding - rightPadding,
        height: viewportHeight - topPadding - bottomPadding
    };
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Get safe spawn position for objects within game boundaries
 * @param objectSize Size of the object (width/height for square objects)
 * @param boundaries Game boundaries
 * @returns { x, y } coordinates within safe area
 */
export function getSafeSpawnPosition(objectSize: number, boundaries: GameBoundaries): { x: number; y: number } {
    const padding = 20; // Extra padding from boundaries

    const minX = boundaries.left + padding;
    const maxX = boundaries.right - objectSize - padding;
    const minY = boundaries.top + padding;
    const maxY = boundaries.bottom - objectSize - padding;

    return {
        x: minX + Math.random() * (maxX - minX),
        y: minY + Math.random() * (maxY - minY)
    };
}

/**
 * Check if a position is within safe game boundaries
 */
export function isInSafeBoundaries(x: number, y: number, objectSize: number, boundaries: GameBoundaries): boolean {
    return (
        x >= boundaries.left &&
        x + objectSize <= boundaries.right &&
        y >= boundaries.top &&
        y + objectSize <= boundaries.bottom
    );
}

/**
 * Clamp position to safe game boundaries
 */
export function clampToSafeBoundaries(x: number, y: number, objectSize: number, boundaries: GameBoundaries): { x: number; y: number } {
    return {
        x: clamp(x, boundaries.left, boundaries.right - objectSize),
        y: clamp(y, boundaries.top, boundaries.bottom - objectSize)
    };
}
