import { useState, useEffect, useRef, useCallback } from 'react'
import { GAME_CONFIG } from '@constants/gameConfig'
import { HUD } from './ui/HUD'
import { useLanguage } from './LanguageContext'
import { useSound } from './SoundContext'
import GameIcon from './GameIcon'
import { SoundManager } from '@/utils/SoundManager'
import { checkAABBCollision } from '@/utils/collision'

type ObstacleType = 'snowman' | 'rock' | 'tree' | 'branch';

interface Obstacle {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    type: ObstacleType;
    scored: boolean;
}

interface Cloud {
    id: number;
    x: number;
    y: number;
    speed: number;
}

interface Snowflake {
    id: number;
    x: number;
    y: number;
    collected: boolean;
}

interface ReindeerRunProps {
    onGameOver: (score: number, joke: string) => void;
    settings: typeof GAME_CONFIG;
    isPaused: boolean;
    onPause: () => void;
}

export default function ReindeerRun({ onGameOver, settings, isPaused, onPause }: ReindeerRunProps) {
    const { t, getJoke } = useLanguage();
    const { isMuted } = useSound();

    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(settings.TIMER);
    const [obstacles, setObstacles] = useState<Obstacle[]>([]);
    const [clouds, setClouds] = useState<Cloud[]>([]);
    const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
    const [isBulletTime, setIsBulletTime] = useState(false);
    const [bulletTimeEndTime, setBulletTimeEndTime] = useState(0);

    const soundManager = useRef<SoundManager | null>(null);
    const nextId = useRef(0);
    const requestRef = useRef<number>(0);
    const lastSpawnTime = useRef(0);
    const gameSpeed = useRef(settings.REINDEER_RUN.OBSTACLE_SPEED_START);
    const lastScoreTime = useRef(0);

    // Player state
    const GROUND_Y = window.innerHeight - 120;
    const PLAYER_X = 100;
    const PLAYER_WIDTH = 50;
    const PLAYER_HEIGHT = 50;

    const playerRef = useRef({
        y: GROUND_Y,
        vy: 0,
        isJumping: false,
        isDucking: false,
        duckEndTime: 0
    });

    const stateRef = useRef({
        obstacles: [] as Obstacle[],
        snowflakes: [] as Snowflake[],
        score: 0,
        isPlaying: true,
        isPaused: false,
        isBulletTime: false
    });

    const keysPressed = useRef<{ [key: string]: boolean }>({});
    const touchStartY = useRef(0);

    // Sync refs for collision detection
    useEffect(() => { stateRef.current.obstacles = obstacles }, [obstacles]);
    useEffect(() => { stateRef.current.snowflakes = snowflakes }, [snowflakes]);
    useEffect(() => { stateRef.current.score = score }, [score]);
    useEffect(() => { stateRef.current.isPaused = isPaused }, [isPaused]);
    useEffect(() => { stateRef.current.isBulletTime = isBulletTime }, [isBulletTime]);

    useEffect(() => {
        soundManager.current = new SoundManager();
        const resumeAudio = () => {
            soundManager.current?.resume();
            window.removeEventListener('pointerdown', resumeAudio);
        }
        window.addEventListener('pointerdown', resumeAudio);
        return () => window.removeEventListener('pointerdown', resumeAudio);
    }, []);

    useEffect(() => {
        if (soundManager.current) {
            soundManager.current.muted = isMuted;
        }
    }, [isMuted]);

    const jump = useCallback(() => {
        const p = playerRef.current;
        if (!p.isJumping && !p.isDucking && stateRef.current.isPlaying && !stateRef.current.isPaused) {
            p.vy = settings.REINDEER_RUN.JUMP_FORCE;
            p.isJumping = true;
            soundManager.current?.playJump();
        }
    }, [settings.REINDEER_RUN.JUMP_FORCE]);

    const duck = useCallback(() => {
        const p = playerRef.current;
        if (!p.isDucking && !p.isJumping && stateRef.current.isPlaying && !stateRef.current.isPaused) {
            p.isDucking = true;
            p.duckEndTime = Date.now() + settings.REINDEER_RUN.DUCK_DURATION;
        }
    }, [settings.REINDEER_RUN.DUCK_DURATION]);

    // Handle Keyboard & Touch Input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Escape' || e.code === 'KeyP') {
                if (stateRef.current.isPlaying && !stateRef.current.isPaused) {
                    onPause();
                }
                return;
            }

            keysPressed.current[e.code] = true;
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                jump();
            }
            if (e.code === 'ArrowDown') {
                e.preventDefault();
                duck();
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            keysPressed.current[e.code] = false;
        };

        const handleTouchStart = (e: TouchEvent) => {
            touchStartY.current = e.touches[0].clientY;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            const touchEndY = e.changedTouches[0].clientY;
            const deltaY = touchEndY - touchStartY.current;

            if (deltaY > 50) {
                // Swipe down = duck
                duck();
            } else {
                // Tap = jump
                jump();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [onPause, jump, duck]);

    const spawnObstacle = useCallback(() => {
        if (!stateRef.current.isPlaying || stateRef.current.isPaused) return;

        const now = Date.now();
        const minInterval = settings.REINDEER_RUN.OBSTACLE_SPAWN_RATE_MIN;
        const maxInterval = settings.REINDEER_RUN.OBSTACLE_SPAWN_RATE_MAX;

        if (now - lastSpawnTime.current < minInterval) return;

        // Random chance to spawn
        const spawnChance = (now - lastSpawnTime.current) / maxInterval;
        if (Math.random() > spawnChance) return;

        const id = nextId.current++;

        // Sometimes spawn a snowflake instead of obstacle
        if (Math.random() < settings.REINDEER_RUN.SNOWFLAKE_SPAWN_CHANCE) {
            setSnowflakes(prev => [...prev, {
                id,
                x: window.innerWidth,
                y: GROUND_Y - 100 - Math.random() * 80,
                collected: false
            }]);
        } else {
            const types: ObstacleType[] = ['snowman', 'rock', 'tree', 'branch'];
            const type = types[Math.floor(Math.random() * types.length)];

            let width = 50;
            let height = 50;
            let y = GROUND_Y;

            if (type === 'branch') {
                // Head-height obstacle - must duck under it
                width = 80;
                height = 30;
                y = GROUND_Y - 20; // At head height - requires ducking
            } else if (type === 'tree') {
                height = 70;
                y = GROUND_Y - 20;
            } else if (type === 'snowman') {
                height = 60;
                y = GROUND_Y - 10;
            }

            setObstacles(prev => [...prev, {
                id,
                x: window.innerWidth,
                y,
                width,
                height,
                type,
                scored: false
            }]);
        }

        lastSpawnTime.current = now;
    }, [settings.REINDEER_RUN.OBSTACLE_SPAWN_RATE_MIN, settings.REINDEER_RUN.OBSTACLE_SPAWN_RATE_MAX, settings.REINDEER_RUN.SNOWFLAKE_SPAWN_CHANCE, GROUND_Y]);

    const spawnCloud = useCallback(() => {
        const id = nextId.current++;
        const y = 50 + Math.random() * 150;
        const speed = 0.5 + Math.random() * 1;
        setClouds(prev => [...prev, { id, x: window.innerWidth, y, speed }]);
    }, []);

    const checkCollision = useCallback((obstacle: Obstacle): boolean => {
        const p = playerRef.current;
        const playerHeight = p.isDucking ? PLAYER_HEIGHT / 2 : PLAYER_HEIGHT;
        // When ducking, shift Y down so feet stay on ground (head goes down)
        const playerY = p.isDucking ? p.y + (PLAYER_HEIGHT / 2) : p.y;

        return checkAABBCollision(
            { x: PLAYER_X, y: playerY, width: PLAYER_WIDTH, height: playerHeight },
            { x: obstacle.x, y: obstacle.y, width: obstacle.width, height: obstacle.height }
        );
    }, [PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_X]);

    const update = useCallback((time: number) => {
        if (!stateRef.current.isPlaying) return;

        if (stateRef.current.isPaused) {
            requestRef.current = requestAnimationFrame(update);
            return;
        }

        const p = playerRef.current;
        const now = Date.now();

        // Check bullet time status
        if (stateRef.current.isBulletTime && now >= bulletTimeEndTime) {
            setIsBulletTime(false);
        }

        // Speed multiplier during bullet time
        const speedMultiplier = stateRef.current.isBulletTime
            ? settings.REINDEER_RUN.BULLET_TIME_SPEED_MULTIPLIER
            : 1.0;

        // Update ducking
        if (p.isDucking && now >= p.duckEndTime) {
            p.isDucking = false;
        }

        // Update player physics
        if (p.isJumping || p.y < GROUND_Y) {
            p.vy += settings.PHYSICS.GRAVITY;
            p.y += p.vy;

            if (p.y >= GROUND_Y) {
                p.y = GROUND_Y;
                p.vy = 0;
                p.isJumping = false;
            }
        }

        // Increase game speed gradually (slower during bullet time)
        gameSpeed.current = Math.min(
            settings.REINDEER_RUN.OBSTACLE_SPEED_MAX,
            gameSpeed.current + settings.REINDEER_RUN.OBSTACLE_SPEED_INCREMENT * speedMultiplier
        );

        // Update obstacles
        const currentObstacles = stateRef.current.obstacles;
        const updatedObstacles: Obstacle[] = [];
        let collision = false;

        currentObstacles.forEach(obs => {
            const newX = obs.x - (gameSpeed.current * speedMultiplier);

            // Check collision
            const updatedObs = { ...obs, x: newX };
            if (checkCollision(updatedObs)) {
                collision = true;
                return;
            }

            // Score points for passing obstacle
            if (!obs.scored && newX + obs.width < PLAYER_X) {
                const newScore = stateRef.current.score + settings.REINDEER_RUN.POINTS_PER_OBSTACLE;
                stateRef.current.score = newScore;
                setScore(newScore);
                soundManager.current?.playScore();
                updatedObs.scored = true;
            }

            // Keep obstacle if still on screen
            if (newX > -obs.width - 100) {
                updatedObstacles.push(updatedObs);
            }
        });

        if (collision) {
            stateRef.current.isPlaying = false;
            soundManager.current?.playGameOver();
            onGameOver(stateRef.current.score, getJoke());
            return;
        }

        setObstacles(updatedObstacles);

        // Update and check snowflakes
        const currentSnowflakes = stateRef.current.snowflakes;
        const updatedSnowflakes: Snowflake[] = [];

        currentSnowflakes.forEach(sf => {
            if (sf.collected) return;

            const newX = sf.x - (gameSpeed.current * speedMultiplier);
            const playerHeight = p.isDucking ? PLAYER_HEIGHT / 2 : PLAYER_HEIGHT;
            const playerY = p.isDucking ? p.y + (PLAYER_HEIGHT / 2) : p.y;
            const sfSize = 40;

            // Check collision with player
            if (checkAABBCollision(
                { x: PLAYER_X, y: playerY, width: PLAYER_WIDTH, height: playerHeight },
                { x: newX, y: sf.y, width: sfSize, height: sfSize }
            )) {
                // Snowflake collected!
                soundManager.current?.playSnowflake();
                setIsBulletTime(true);
                setBulletTimeEndTime(now + settings.REINDEER_RUN.BULLET_TIME_DURATION);
                if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
                return; // Don't add to updated list
            }

            // Keep snowflake if still on screen
            if (newX > -100) {
                updatedSnowflakes.push({ ...sf, x: newX });
            }
        });

        setSnowflakes(updatedSnowflakes);

        // Update clouds
        setClouds(prev => prev.map(c => ({ ...c, x: c.x - (c.speed * speedMultiplier) })).filter(c => c.x > -150));

        // Add points over time
        if (now - lastScoreTime.current >= 1000) {
            const newScore = stateRef.current.score + settings.REINDEER_RUN.POINTS_PER_SECOND;
            stateRef.current.score = newScore;
            setScore(newScore);
            lastScoreTime.current = now;
        }

        // Spawn obstacles
        spawnObstacle();

        requestRef.current = requestAnimationFrame(update);
    }, [settings, checkCollision, spawnObstacle, onGameOver, getJoke, GROUND_Y, PLAYER_X, PLAYER_WIDTH, PLAYER_HEIGHT, bulletTimeEndTime]);

    // Trigger game over when time runs out
    useEffect(() => {
        if (timeLeft <= 0 && stateRef.current.isPlaying) {
            stateRef.current.isPlaying = false;
            onGameOver(stateRef.current.score, getJoke());
        }
    }, [timeLeft, onGameOver, getJoke]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(update);

        const cloudInterval = setInterval(() => {
            if (!stateRef.current.isPaused && stateRef.current.isPlaying) {
                spawnCloud();
            }
        }, 3000);

        const timerInterval = setInterval(() => {
            if (!stateRef.current.isPaused && stateRef.current.isPlaying) {
                setTimeLeft(t => {
                    if (t <= 1) {
                        return 0;
                    }
                    return t - 1;
                });
            }
        }, 1000);

        // Initial clouds
        spawnCloud();
        spawnCloud();

        return () => {
            cancelAnimationFrame(requestRef.current);
            clearInterval(cloudInterval);
            clearInterval(timerInterval);
        }
    }, [update, spawnCloud]);

    const p = playerRef.current;
    const playerHeight = p.isDucking ? PLAYER_HEIGHT / 2 : PLAYER_HEIGHT;
    const playerY = p.isDucking ? p.y + (PLAYER_HEIGHT / 2) : p.y;

    return (
        <div
            className="game-area reindeer-run"
            style={{
                cursor: 'none',
                outline: 'none',
                touchAction: 'none',
                overflow: 'hidden',
                position: 'relative'
            }}
            tabIndex={0}
        >
            <HUD score={score} timeLeft={timeLeft} onPause={onPause} />

            {/* Ground line */}
            <div style={{
                position: 'absolute',
                bottom: 100,
                left: 0,
                right: 0,
                height: 4,
                background: 'var(--primary-color)',
                opacity: 0.3
            }} />

            {/* Background clouds */}
            {clouds.map(c => (
                <div key={c.id} style={{
                    position: 'absolute',
                    left: c.x,
                    top: c.y,
                    opacity: 0.3,
                    pointerEvents: 'none'
                }}>
                    <GameIcon name="cloud" size={80} />
                </div>
            ))}

            {/* Player (Reindeer) */}
            <div style={{
                position: 'absolute',
                left: PLAYER_X,
                top: playerY,
                width: PLAYER_WIDTH,
                height: playerHeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: p.isDucking ? 'height 0.1s, top 0.1s' : 'none'
            }}>
                <GameIcon name="reindeer" size={PLAYER_WIDTH} />
            </div>

            {/* Obstacles */}
            {obstacles.map(obs => (
                <div key={obs.id} style={{
                    position: 'absolute',
                    left: obs.x,
                    top: obs.y,
                    width: obs.width,
                    height: obs.height,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center'
                }}>
                    <GameIcon name={obs.type} size={obs.type === 'branch' ? obs.width : obs.height} />
                </div>
            ))}

            {/* Snowflakes (Powerups) */}
            {snowflakes.map(sf => (
                <div key={sf.id} style={{
                    position: 'absolute',
                    left: sf.x,
                    top: sf.y,
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: isBulletTime ? 'none' : 'snowflakeFloat 2s ease-in-out infinite',
                    filter: 'drop-shadow(0 0 8px rgba(100, 200, 255, 0.8))'
                }}>
                    <GameIcon name="snowflake" size={40} />
                </div>
            ))}

            {/* Instructions overlay (fades after 3 seconds) */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                fontSize: '1.5rem',
                color: 'var(--primary-color)',
                pointerEvents: 'none',
                opacity: timeLeft > 57 ? 1 : 0,
                transition: 'opacity 1s',
                background: 'rgba(0,0,0,0.7)',
                padding: '1rem 2rem',
                borderRadius: '8px'
            }}>
                <div>{t('game.runner.tapToJump')}</div>
                <div style={{ fontSize: '1rem', marginTop: '0.5rem' }}>
                    {t('game.runner.swipeDown')}
                </div>
            </div>

            {/* Bullet Time Visual Effect */}
            {isBulletTime && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle, rgba(100, 200, 255, 0.2) 0%, rgba(100, 200, 255, 0.05) 100%)',
                    pointerEvents: 'none',
                    animation: 'bulletTimePulse 1s ease-in-out infinite',
                    border: '4px solid rgba(100, 200, 255, 0.4)',
                    boxShadow: 'inset 0 0 50px rgba(100, 200, 255, 0.3)'
                }} />
            )}

            <style>{`
                @keyframes snowflakeFloat {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(180deg); }
                }
                @keyframes bulletTimePulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
            `}</style>
        </div>
    );
}
