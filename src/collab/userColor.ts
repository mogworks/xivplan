/**
 * Simple hash function for strings (djb2 algorithm).
 */
function hashString(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return hash >>> 0; // Ensure positive 32-bit integer
}

/**
 * Generate a consistent color from a user ID (string).
 * Uses golden angle distribution for well-separated hues.
 */
export function colorFromUserId(userId: string): string {
    const hash = hashString(userId);
    const hue = (hash * 137.508) % 360; // golden angle
    return `hsl(${hue} 85% 60%)`;
}
