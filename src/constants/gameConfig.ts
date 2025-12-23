export interface GameSettings {
    TIMER: number;
    POINTS: {
        REGULAR: number;
        BONUS: number;
        COAL: number;
    };
    PHYSICS: {
        GRAVITY: number;
        THROW_VELOCITY: number;
        PROJECTILE_SPEED: number;
    };
    SNOWBALL_HUNT: {
        FREEZE_DURATION: number;
        SPAWN_RATE_BASE: number;
        SPAWN_RATE_MIN: number;
        TARGET_MAX_AGE_BASE: number;
        TARGET_MAX_AGE_MIN: number;
    };
    GIFT_TOSS: {
        COOLDOWN: number;
        GIFT_SIZE: number;
        CHIMNEY_HEIGHT: number;
        SPAWN_RATE_CHIMNEY: number;
        SPAWN_RATE_OBSTACLE: number;
    };
}

export const GAME_CONFIG: GameSettings = {
    TIMER: 60,
    POINTS: {
        REGULAR: 100,
        BONUS: 250,
        COAL: -50,
    },
    PHYSICS: {
        GRAVITY: 0.4,
        THROW_VELOCITY: 4,
        PROJECTILE_SPEED: 0.08,
    },
    SNOWBALL_HUNT: {
        FREEZE_DURATION: 3000,
        SPAWN_RATE_BASE: 700,
        SPAWN_RATE_MIN: 400,
        TARGET_MAX_AGE_BASE: 3000,
        TARGET_MAX_AGE_MIN: 1500,
    },
    GIFT_TOSS: {
        COOLDOWN: 400,
        GIFT_SIZE: 40,
        CHIMNEY_HEIGHT: 80,
        SPAWN_RATE_CHIMNEY: 4000,
        SPAWN_RATE_OBSTACLE: 3500,
    }
};
