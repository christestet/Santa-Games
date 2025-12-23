import { useState, useEffect, useRef, useCallback } from 'react'
import { GAME_CONFIG } from '../constants/gameConfig'
import { HUD } from './ui/HUD'
import { useLanguage } from './LanguageContext';
import { useSound } from './SoundContext';
import GameIcon from './GameIcon';

// --- Audio Manager ---
class SoundManager {
    ctx: AudioContext | null = null;
    muted: boolean = false;

    constructor() {
        try {
            // @ts-ignore
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        } catch (e) {
            console.error("Web Audio API not supported", e);
        }
    }

    playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
        if (!this.ctx || this.muted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playThrow() {
        if (!this.ctx || this.muted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    playHit() {
        this.playTone(400, 'sine', 0.1, 0.1);
    }

    playPoof() {
        this.playTone(80, 'sawtooth', 0.1, 0.1);
    }
}

interface Gift {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    type: 'red' | 'blue' | 'coal' | 'parcel';
    active: boolean;
    landed: boolean;
}

interface Chimney { id: number; x: number; speed: number; width: number; }
interface Obstacle { id: number; x: number; y: number; width: number; height: number; speed: number; type: 'cloud' | 'plane'; }
interface FloatingText { id: number; x: number; y: number; text: string; color: string; expiry: number; }

interface GiftTossProps {
    onGameOver: (score: number, joke: string) => void;
    settings: typeof GAME_CONFIG;
    isPaused: boolean;
    onPause: () => void;
}

export default function GiftToss({ onGameOver, settings, isPaused, onPause }: GiftTossProps) {
    const { t, getJoke, getSpruch, getParcelText } = useLanguage();


    const { isMuted } = useSound();
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(settings.TIMER)
    const [gifts, setGifts] = useState<Gift[]>([])
    const [chimneys, setChimneys] = useState<Chimney[]>([])
    const [obstacles, setObstacles] = useState<Obstacle[]>([])
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])
    const [santaX, setSantaX] = useState(window.innerWidth / 2)

    const santaRef = useRef({ x: window.innerWidth / 2, speed: 3 })
    const soundManager = useRef<SoundManager | null>(null)
    const nextId = useRef(0)
    const requestRef = useRef<number>(0)
    const lastTimeRef = useRef<number>(0)
    const lastThrowTime = useRef(0)
    const velocityTracker = useRef({
        lastX: 0,
        lastTime: 0,
        velocityX: 0
    })

    // Physics constants
    const GRAVITY = settings.PHYSICS.GRAVITY
    const GIFT_SIZE = settings.GIFT_TOSS.GIFT_SIZE
    const CHIMNEY_HEIGHT = settings.GIFT_TOSS.CHIMNEY_HEIGHT
    const COOLDOWN = settings.GIFT_TOSS.COOLDOWN

    const stateRef = useRef({
        gifts: [] as Gift[],
        chimneys: [] as Chimney[],
        obstacles: [] as Obstacle[],
        score: 0,
        isPlaying: true,
        isPaused: false
    })

    // Track pressed keys
    const keysPressed = useRef<{ [key: string]: boolean }>({});

    // Handle Keyboard Input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Escape' || e.code === 'KeyP') {
                if (stateRef.current.isPlaying && !stateRef.current.isPaused) {
                    onPause();
                }
                return;
            }

            keysPressed.current[e.code] = true;
            if (e.code === 'Space') {
                handleThrow();
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            keysPressed.current[e.code] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [onPause]); // Added onPause dependency

    // Sync refs for collision detection
    useEffect(() => { stateRef.current.gifts = gifts }, [gifts])
    useEffect(() => { stateRef.current.chimneys = chimneys }, [chimneys])
    useEffect(() => { stateRef.current.obstacles = obstacles }, [obstacles])
    useEffect(() => { stateRef.current.score = score }, [score])
    useEffect(() => { stateRef.current.isPaused = isPaused }, [isPaused])

    useEffect(() => {
        soundManager.current = new SoundManager();
        const resumeAudio = () => {
            soundManager.current?.ctx?.resume();
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

    const addFloatingText = useCallback((x: number, y: number, text: string, color: string = 'white') => {
        const now = Date.now();
        const id = nextId.current++
        setFloatingTexts(prev => [...prev.filter(t => t.expiry > now), { id, x, y, text, color, expiry: now + 2000 }])
    }, [])

    const spawnChimney = useCallback(() => {
        if (!stateRef.current.isPlaying || stateRef.current.isPaused) return;
        const id = nextId.current++
        const width = 80 + Math.random() * 40
        const speed = -1.5 - Math.random() * 1.5;
        setChimneys(prev => [...prev, { id, x: window.innerWidth, speed, width }])
    }, [])

    const spawnObstacle = useCallback(() => {
        if (!stateRef.current.isPlaying || stateRef.current.isPaused) return;
        const id = nextId.current++
        const type = Math.random() > 0.7 ? 'plane' : 'cloud'
        const width = type === 'cloud' ? 120 : 60
        const height = type === 'cloud' ? 60 : 30
        const y = 150 + Math.random() * (window.innerHeight - 350)
        const fromLeft = Math.random() > 0.5;
        const x = fromLeft ? -width : window.innerWidth;
        const speed = (1 + Math.random() * 2) * (fromLeft ? 1 : -1);
        setObstacles(prev => [...prev, { id, x, y, width, height, speed, type }])
    }, [])

    const update = useCallback((time: number) => {
        if (!stateRef.current.isPlaying) return;

        if (stateRef.current.isPaused) {
            lastTimeRef.current = time;
            requestRef.current = requestAnimationFrame(update);
            return;
        }

        lastTimeRef.current = time;

        // 1. Update Santa Movement (Manual)
        const s = santaRef.current;
        // Increase speed for manual control to make it feel responsive
        const manualSpeed = 8;

        if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA']) {
            s.x -= manualSpeed;
        }
        if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD']) {
            s.x += manualSpeed;
        }

        // Clamp position
        if (s.x < 20) s.x = 20;
        if (s.x > window.innerWidth - 60) s.x = window.innerWidth - 60;

        setSantaX(s.x);

        // 2. Update Entities
        setChimneys(prev => prev.map(c => ({ ...c, x: c.x + c.speed })).filter(c => c.x > -200 && c.x < window.innerWidth + 200));
        setObstacles(prev => prev.map(o => ({ ...o, x: o.x + o.speed })).filter(o => o.x > -200 && o.x < window.innerWidth + 200));

        // 3. Update Gifts (Physics & Collision)
        const currentGifts = stateRef.current.gifts; // Use ref as source of truth for calculations
        const currentObstacles = stateRef.current.obstacles;
        const currentChimneys = stateRef.current.chimneys;
        const chimneyY = window.innerHeight - CHIMNEY_HEIGHT;

        const nextGifts: Gift[] = [];
        const hits: { type: 'obstacle' | 'chimney' | 'ground' | 'miss', subtype?: 'cloud' | 'plane', giftType: Gift['type'], x: number, y: number, pts?: number }[] = [];

        currentGifts.forEach(gift => {
            if (!gift.active || gift.landed) {
                if (gift.active || gift.landed) nextGifts.push(gift); // Keep inactive/landed gifts until cleaned up? Actually logic filters active
                return;
            }

            const nextX = gift.x + gift.vx;
            const nextY = gift.y + gift.vy;
            const nextVy = gift.vy + GRAVITY;

            // Obstacle Collision
            const hitObstacle = currentObstacles.find(obs =>
                nextX + GIFT_SIZE > obs.x && nextX < obs.x + obs.width &&
                nextY + GIFT_SIZE > obs.y && nextY < obs.y + obs.height
            );

            if (hitObstacle) {
                hits.push({ type: 'obstacle', subtype: hitObstacle.type, giftType: gift.type, x: nextX, y: nextY });
                nextGifts.push({ ...gift, active: false });
                return;
            }

            // Chimney Collision
            if (nextY >= chimneyY && gift.y < chimneyY) {
                const hitChimney = currentChimneys.find(c =>
                    nextX + GIFT_SIZE / 2 > c.x && nextX + GIFT_SIZE / 2 < c.x + c.width
                );

                if (hitChimney) {
                    const pts = Math.max(10, Math.floor(50 - Math.abs(nextX - hitChimney.x) / 2));
                    hits.push({ type: 'chimney', giftType: gift.type, x: nextX, y: nextY, pts });
                    nextGifts.push({ ...gift, landed: true, active: false });
                } else {
                    hits.push({ type: 'miss', giftType: gift.type, x: nextX, y: nextY });
                    nextGifts.push({ ...gift, landed: true, active: false });
                }
                return;
            }

            // Ground Collision
            if (nextY > window.innerHeight - 20) {
                hits.push({ type: 'ground', giftType: gift.type, x: nextX, y: nextY });
                nextGifts.push({ ...gift, landed: true, active: false });
                return;
            }

            // Out of Bounds
            if (nextX < -100 || nextX > window.innerWidth + 100) {
                nextGifts.push({ ...gift, active: false });
                return;
            }

            nextGifts.push({ ...gift, x: nextX, y: nextY, vy: nextVy });
        });

        // Apply State updates once
        const activeGifts = nextGifts.filter(g => g.active);
        setGifts(activeGifts); // This might replace the stateRef syncing if we trust our calc
        // Sync ref immediately for next frame consistency
        // stateRef.current.gifts = activeGifts; // Effect already does this? No, effect is lagged.

        // Process Side Effects
        hits.forEach(hit => {
            if (hit.type === 'obstacle') {
                soundManager.current?.playPoof();

                if (hit.subtype === 'plane') {
                    const penalty = settings.POINTS.COAL;
                    const newScore = Math.max(0, stateRef.current.score + penalty);
                    stateRef.current.score = newScore;
                    setScore(newScore);
                    addFloatingText(hit.x, hit.y, getSpruch(), "#ff6b6b");
                } else {
                    // Cloud - just poof, no score change
                    addFloatingText(hit.x, hit.y, t("game.poof"), "#fff");
                }

            } else if (hit.type === 'chimney') {
                soundManager.current?.playHit();
                const pts = hit.pts || 10;
                const newScore = stateRef.current.score + pts;
                stateRef.current.score = newScore;
                setScore(newScore);

                if (hit.giftType === 'parcel') {
                    addFloatingText(hit.x, hit.y, getParcelText(), "#8D6E63");
                } else {
                    addFloatingText(hit.x, hit.y, pts > 40 ? `${t("game.perfect")} +${pts}` : `+${pts}`, pts > 40 ? '#4caf50' : '#ffd700');
                }

                if (navigator.vibrate) navigator.vibrate(20);
            } else if (hit.type === 'miss' || hit.type === 'ground') {
                addFloatingText(hit.x, hit.y, t("game.miss"), "#aaa");
            }
        });

        // Cleanup UI elements
        const now = Date.now();
        setFloatingTexts(prev => prev.some(t => t.expiry <= now) ? prev.filter(t => t.expiry > now) : prev);

        requestRef.current = requestAnimationFrame(update);
    }, [addFloatingText, settings.POINTS, t, getSpruch]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(update);
        const chimneyInterval = setInterval(spawnChimney, settings.GIFT_TOSS.SPAWN_RATE_CHIMNEY);
        const obstacleInterval = setInterval(spawnObstacle, settings.GIFT_TOSS.SPAWN_RATE_OBSTACLE);
        const timerInterval = setInterval(() => {
            if (!stateRef.current.isPaused && stateRef.current.isPlaying) {
                setTimeLeft(t => {
                    if (t <= 1) {
                        stateRef.current.isPlaying = false;
                        onGameOver(stateRef.current.score, getJoke());
                        return 0;
                    }
                    return t - 1;
                });
            }
        }, 1000);

        spawnChimney();
        spawnObstacle();

        return () => {
            cancelAnimationFrame(requestRef.current);
            clearInterval(chimneyInterval);
            clearInterval(obstacleInterval);
            clearInterval(timerInterval);
        }
    }, [update, spawnChimney, spawnObstacle, onGameOver]);



    // ... existing code ...

    const handleThrow = () => {
        if (!stateRef.current.isPlaying || stateRef.current.isPaused) return;
        if (Date.now() - lastThrowTime.current < COOLDOWN) return;
        soundManager.current?.playThrow();
        lastThrowTime.current = Date.now();

        const rand = Math.random();
        let type: Gift['type'];

        // Approx 1 in 8 throws is a parcel (12.5%)
        if (rand > 0.875) type = 'parcel';
        else if (rand > 0.75) type = 'coal';
        else type = Math.random() > 0.5 ? 'blue' : 'red';

        // Give the gift a little horizontal momentum based on Santa's movement
        let momentum = 0;

        // Keyboard momentum
        if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA']) momentum = -2;
        if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD']) momentum = 2;

        // Touch velocity momentum (convert from px/ms to game units)
        const touchMomentum = velocityTracker.current.velocityX * 5; // Scale factor
        momentum = Math.max(-5, Math.min(5, momentum + touchMomentum)); // Clamp

        // Reset velocity after throw
        velocityTracker.current.velocityX = 0;

        const newGift: Gift = {
            id: nextId.current++,
            x: santaRef.current.x,
            y: 80,
            vx: momentum,
            vy: settings.PHYSICS.THROW_VELOCITY,
            type,
            active: true,
            landed: false
        };

        setGifts(prev => [...prev, newGift]);
    };

    const handleTap = (e: React.PointerEvent) => {
        // Reset velocity tracker on new touch
        velocityTracker.current = {
            lastX: e.clientX,
            lastTime: performance.now(),
            velocityX: 0
        };
        handleThrow();
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!stateRef.current.isPlaying || stateRef.current.isPaused) return;

        const now = performance.now();
        const dt = now - velocityTracker.current.lastTime;

        if (dt > 0) {
            // Calculate velocity in pixels per millisecond
            const dx = e.clientX - velocityTracker.current.lastX;
            velocityTracker.current.velocityX = dx / dt;
        }

        velocityTracker.current.lastX = e.clientX;
        velocityTracker.current.lastTime = now;

        // Directly update ref for smoother performance
        santaRef.current.x = e.clientX;
        setSantaX(e.clientX);
    };

    return (
        <div
            className="game-area gift-toss"
            onPointerDown={handleTap}
            onPointerMove={handlePointerMove}
            style={{ cursor: 'none', outline: 'none', touchAction: 'none' }}
            tabIndex={0}
        >
            <HUD score={score} timeLeft={timeLeft} onPause={onPause} />
            <div className="santa-hand-top" style={{ left: santaX }}>
                <GameIcon name="santa" size={40} />
            </div>

            {obstacles.map(o => (
                <div key={o.id} className="obstacle" style={{ left: o.x, top: o.y, width: o.width, height: o.height }}>
                    <div style={{ fontSize: o.type === 'cloud' ? '5rem' : '4rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
                        {o.type === 'cloud' ? <GameIcon name="cloud" size={80} /> : <GameIcon name="plane" size={60} />}
                    </div>
                </div>
            ))}

            {gifts.map(g => (
                <div key={g.id} className={`gift-item ${g.type}`} style={{ left: g.x, top: g.y, width: GIFT_SIZE, height: GIFT_SIZE }}>
                    {g.type === 'red' && <GameIcon name="gift" size={GIFT_SIZE} />}
                    {g.type === 'blue' && <GameIcon name="gift" size={GIFT_SIZE} style={{ filter: 'hue-rotate(220deg)' }} />}
                    {g.type === 'coal' && <GameIcon name="coal" size={GIFT_SIZE} />}
                    {g.type === 'parcel' && <GameIcon name="parcel" size={GIFT_SIZE} />}
                </div>
            ))}

            {chimneys.map(c => (
                <div
                    key={c.id}
                    style={{
                        position: 'absolute',
                        left: c.x,
                        width: c.width,
                        height: CHIMNEY_HEIGHT,
                        bottom: 0,
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center'
                    }}
                >
                    <GameIcon
                        name="chimney"
                        size={CHIMNEY_HEIGHT}
                        style={{
                            width: '100%',
                            height: '100%',
                            filter: 'drop-shadow(4px 4px 0 rgba(0,0,0,0.5))'
                        }}
                    />
                    <div className="chimney-smoke" style={{ bottom: CHIMNEY_HEIGHT - 20, top: 'auto' }}></div>
                </div>
            ))}

            {floatingTexts.map(t => (
                <div key={t.id} className="floating-text" style={{ left: t.x, top: t.y, color: t.color, fontSize: '2rem' }}>
                    {t.text}
                </div>
            ))}
        </div>
    );
}
