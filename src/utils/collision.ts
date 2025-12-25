/**
 * Shared collision detection utilities
 */

export interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * AABB (Axis-Aligned Bounding Box) collision detection
 * Returns true if two boxes overlap
 */
export function checkAABBCollision(box1: Box, box2: Box): boolean {
    return (
        box1.x < box2.x + box2.width &&
        box1.x + box1.width > box2.x &&
        box1.y < box2.y + box2.height &&
        box1.y + box1.height > box2.y
    );
}

/**
 * Check if a point is inside a box
 */
export function pointInBox(px: number, py: number, box: Box): boolean {
    return (
        px >= box.x &&
        px <= box.x + box.width &&
        py >= box.y &&
        py <= box.y + box.height
    );
}

/**
 * Check if a point is inside a circle
 */
export function pointInCircle(px: number, py: number, cx: number, cy: number, radius: number): boolean {
    const dx = px - cx;
    const dy = py - cy;
    return (dx * dx + dy * dy) <= (radius * radius);
}
