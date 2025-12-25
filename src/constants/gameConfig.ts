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
    REINDEER_RUN: {
        GROUND_SPEED: number;
        JUMP_FORCE: number;
        DUCK_DURATION: number;
        OBSTACLE_SPAWN_RATE_MIN: number;
        OBSTACLE_SPAWN_RATE_MAX: number;
        OBSTACLE_SPEED_START: number;
        OBSTACLE_SPEED_INCREMENT: number;
        OBSTACLE_SPEED_MAX: number;
        POINTS_PER_OBSTACLE: number;
        POINTS_PER_SECOND: number;
        SNOWFLAKE_SPAWN_CHANCE: number;
        BULLET_TIME_DURATION: number;
        BULLET_TIME_SPEED_MULTIPLIER: number;
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
    },
    REINDEER_RUN: {
        GROUND_SPEED: 6,
        JUMP_FORCE: -10, // Reduced from -12 for more reasonable jump height
        DUCK_DURATION: 400,
        OBSTACLE_SPAWN_RATE_MIN: 1200,
        OBSTACLE_SPAWN_RATE_MAX: 2000,
        OBSTACLE_SPEED_START: 6,
        OBSTACLE_SPEED_INCREMENT: 0.005,
        OBSTACLE_SPEED_MAX: 9, // Reduced from 12 to prevent collision tunneling at high speeds
        POINTS_PER_OBSTACLE: 10,
        POINTS_PER_SECOND: 5,
        SNOWFLAKE_SPAWN_CHANCE: 0.15,
        BULLET_TIME_DURATION: 3000,
        BULLET_TIME_SPEED_MULTIPLIER: 0.3,
    }
};
