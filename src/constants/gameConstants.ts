// Game expiration deadline - January 1, 2026 00:00 CET (Europe/Berlin)
export const GAME_DEADLINE = new Date('2026-01-01T00:00:00+01:00')

// Check if games are still playable
export const isGamePlayable = (): boolean => {
    return new Date().getTime() < GAME_DEADLINE.getTime()
}
