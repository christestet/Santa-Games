import { useState, useEffect, useCallback, useRef, useReducer } from 'react'
import { GAME_CONFIG } from '../constants/gameConfig'
import { WEIHNACHTS_WITZE, SPRUECHE } from '../constants/gameTexts'
import { HUD } from './ui/HUD'
import { useLanguage } from './LanguageContext'
import { useSound } from './SoundContext'
import GameIcon from './GameIcon'
import { SoundManager } from '@/utils/SoundManager'
import { getGameBoundaries, type GameBoundaries } from '@/utils/gameBoundaries'

interface SnowballHuntProps {
    onGameOver: (score: number, joke: string) => void;
    highScores: { name: string; score: number }[];
    settings: typeof GAME_CONFIG;
    isPaused: boolean;
    onPause: () => void;
}

interface Target {
    id: number;
    x: number;
    y: number;
    type: 'gift' | 'coal' | 'gold' | 'time' | 'ice' | 'parcel';
    vx: number;
    vy: number;
    createdAt: number;
}

interface Projectile {
    id: number;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    progress: number;
}

interface Splat { id: number; x: number; y: number; expiry: number; }
interface FloatingText { id: number; x: number; y: number; text: string; color: string; expiry: number; }
interface Particle { id: number; x: number; y: number; tx: string; ty: string; type: string; expiry: number; }
interface TapRipple { id: number; x: number; y: number; expiry: number; }
interface BottomMessage { text: string; color: string; }

export default function SnowballHunt({ onGameOver, settings, isPaused, onPause }: SnowballHuntProps) {
    const { t, getJoke, getSpruch, getParcelText } = useLanguage();
    const { isMuted } = useSound();

    // UI-critical state only (minimal re-renders)
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(settings.TIMER)
    const [combo, setCombo] = useState(0)
    const [shake, setShake] = useState(false)
    const [targetSize, setTargetSize] = useState(100)
    const [frozen, setFrozen] = useState(false)
    const [bottomMessage, setBottomMessage] = useState<BottomMessage | null>(null)

    // Force update for rendering animation frames without state updates
    const [, forceUpdate] = useReducer(x => x + 1, 0)

    // Animation data in refs (no re-renders on updates)
    const targetsRef = useRef<Target[]>([])
    const projectilesRef = useRef<Projectile[]>([])
    const splatsRef = useRef<Splat[]>([])
    const particlesRef = useRef<Particle[]>([])
    const tapRipplesRef = useRef<TapRipple[]>([])

    const stateRef = useRef({
        score: 0,
        frozen: false,
        timeLeft: settings.TIMER,
        isPlaying: true,
        combo: 0,
        isPaused: false
    })

    const processedHits = useRef(new Set<number>()); // Track hit IDs to prevent double-processing

    const soundManager = useRef<SoundManager | null>(null)
    const boundariesRef = useRef<GameBoundaries>(getGameBoundaries())
    const nextId = useRef(0)
    const requestRef = useRef<number>(0)
    const lastTimeRef = useRef<number>(0)
    const lastRenderRef = useRef<number>(0)

    useEffect(() => {
        soundManager.current = new SoundManager();
        const updateSize = () => {
            setTargetSize(window.innerWidth < 768 ? 70 : 100);
            boundariesRef.current = getGameBoundaries(); // Update boundaries on resize
        };
        updateSize();
        window.addEventListener('resize', updateSize);

        const resumeAudio = () => {
            soundManager.current?.ctx?.resume();
            window.removeEventListener('pointerdown', resumeAudio);
        }
        window.addEventListener('pointerdown', resumeAudio);

        return () => {
            window.removeEventListener('resize', updateSize);
            window.removeEventListener('pointerdown', resumeAudio);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
    }, [])

    // Keyboard Pause
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Escape' || e.code === 'KeyP') {
                if (stateRef.current.isPlaying && !stateRef.current.isPaused) {
                    onPause();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onPause]);

    // Sync critical state to refs (optimized - no separate effects)
    stateRef.current.score = score
    stateRef.current.frozen = frozen
    stateRef.current.timeLeft = timeLeft
    stateRef.current.combo = combo
    stateRef.current.isPaused = isPaused

    useEffect(() => {
        if (soundManager.current) {
            soundManager.current.muted = isMuted;
        }
    }, [isMuted]);

    const triggerShake = () => {
        setShake(true)
        setTimeout(() => setShake(false), 400)
    }

    const spawnParticles = useCallback((x: number, y: number, type: string) => {
        const now = Date.now();
        const newParticles: Particle[] = []
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * 360
            const dist = 50 + Math.random() * 50
            const tx = `${Math.cos(angle) * dist}px`
            const ty = `${Math.sin(angle) * dist}px`
            newParticles.push({ id: nextId.current++, x, y, tx, ty, type, expiry: now + 600 })
        }
        // Update ref directly, no state update
        particlesRef.current = [...particlesRef.current.filter(p => p.expiry > now), ...newParticles]
    }, [])

    const addFloatingText = useCallback((x: number, y: number, text: string, color: string = 'white') => {
        // Update bottom message instead of floating text
        setBottomMessage({ text, color });
    }, [])

    const spawnTarget = useCallback(() => {
        if (!stateRef.current.isPlaying || stateRef.current.isPaused) return;

        const boundaries = boundariesRef.current;
        const padding = 20; // Reduced padding, boundaries already account for HUD

        // Spawn within safe boundaries (excludes HUD, score, timer, bottom message areas)
        const minX = boundaries.left + padding;
        const maxX = boundaries.right - targetSize - padding;
        const minY = boundaries.top + padding;
        const maxY = boundaries.bottom - targetSize - padding;

        const x = minX + Math.random() * (maxX - minX);
        const y = minY + Math.random() * (maxY - minY);

        const rand = Math.random()
        let type: 'gift' | 'coal' | 'gold' | 'time' | 'ice' | 'parcel' = 'gift'

        // Adjusted probabilities to include parcel
        if (rand > 0.97) type = 'ice'
        else if (rand > 0.95) type = 'time'
        else if (rand > 0.85) type = 'gold'
        else if (rand > 0.70) type = 'coal'
        else if (rand > 0.55 && rand <= 0.70) type = 'parcel' // ~15% chance for parcel
        // Remaining 55% is gift

        const vx = (Math.random() - 0.5) * 1.5;
        const vy = (Math.random() - 0.5) * 1.5;

        const newTarget: Target = {
            id: nextId.current++,
            x, y,
            type,
            vx, vy,
            createdAt: Date.now()
        }

        // Update ref directly, no state update
        targetsRef.current = [...targetsRef.current, newTarget]
    }, [targetSize])

    const handleHitSuccess = useCallback((id: number, type: 'gift' | 'coal' | 'gold' | 'time' | 'ice' | 'parcel', x: number, y: number) => {
        if (processedHits.current.has(id)) return;
        processedHits.current.add(id);

        soundManager.current?.playHit(type);

        // Update ref directly, no state update
        targetsRef.current = targetsRef.current.filter(t => t.id !== id);

        // Use gift particles for parcel too? Or generic? Let's stick to particle-gift for consistency or type
        spawnParticles(x, y, `particle-${type === 'parcel' ? 'gift' : type}`);

        let points = 0;
        let text = "";
        let color = "#fff";
        let newCombo = stateRef.current.combo;

        if (type === 'coal') {
            newCombo = 0;
            points = settings.POINTS.COAL;
            text = getSpruch();
            color = "#cccccc";
            triggerShake();
            if (navigator.vibrate) navigator.vibrate(200);
        } else {
            newCombo += 1;
        }
        setCombo(newCombo);

        switch (type) {
            case 'gift':
                points = settings.POINTS.REGULAR
                text = `+${points}`
                color = '#ff4d4d'
                break
            case 'parcel':
                points = settings.POINTS.REGULAR
                text = getParcelText()
                color = '#8D6E63'
                break
            case 'gold':
                points = settings.POINTS.BONUS
                text = `MEGA +${points}!`
                color = 'var(--accent-color)'
                break
            case 'time':
                setTimeLeft(t => t + 5)
                text = "+5s!"
                color = '#4caf50'
                break
            case 'ice':
                setFrozen(true)
                text = t('game.freeze_text');
                color = '#a5f2f3'
                setTimeout(() => setFrozen(false), settings.SNOWBALL_HUNT.FREEZE_DURATION)
                break
        }

        if (points !== 0) setScore(s => Math.max(0, s + points));
        addFloatingText(x, y, text, color);
    }, [settings.POINTS, settings.SNOWBALL_HUNT.FREEZE_DURATION, spawnParticles, addFloatingText, getSpruch, getParcelText, t]);

    const handleHitMiss = useCallback((x: number, y: number) => {
        soundManager.current?.playSplat();
        const now = Date.now();
        const splatId = nextId.current++;
        // Update ref directly, no state update
        splatsRef.current = [...splatsRef.current.filter(s => s.expiry > now), { id: splatId, x, y, expiry: now + 1000 }];
    }, []);

    const handleProjectileImpact = useCallback((p: Projectile) => {
        const { targetX, targetY } = p;
        const hitRadius = window.innerWidth < 768 ? targetSize / 1.5 : targetSize / 2;
        const currentTargets = targetsRef.current;

        let hitId = -1;
        let hitType: any = null;

        for (const t of currentTargets) {
            const cx = t.x + targetSize / 2;
            const cy = t.y + targetSize / 2;
            const dx = cx - targetX;
            const dy = cy - targetY;
            if (Math.sqrt(dx * dx + dy * dy) < hitRadius) {
                hitId = t.id;
                hitType = t.type;
                break;
            }
        }

        if (hitId !== -1) handleHitSuccess(hitId, hitType, targetX, targetY);
        else handleHitMiss(targetX, targetY);
    }, [targetSize, handleHitSuccess, handleHitMiss]);

    const animate = useCallback((time: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = time;

        if (stateRef.current.isPaused) {
            lastTimeRef.current = time; // Keep updating time to avoid jumps on resume
            requestRef.current = requestAnimationFrame(animate);
            return;
        }

        lastTimeRef.current = time;

        if (!stateRef.current.isPlaying) return;

        // Update Projectiles (in ref, no state update)
        const nextProjs: Projectile[] = [];
        projectilesRef.current.forEach(p => {
            const newProgress = p.progress + settings.PHYSICS.PROJECTILE_SPEED;
            if (newProgress >= 1) handleProjectileImpact(p);
            else nextProjs.push({ ...p, progress: newProgress });
        });
        projectilesRef.current = nextProjs;

        // Update Targets (in ref, no state update)
        const now = Date.now();
        const difficultyMod = Math.min(settings.SNOWBALL_HUNT.TARGET_MAX_AGE_BASE - settings.SNOWBALL_HUNT.TARGET_MAX_AGE_MIN, stateRef.current.score * 5);
        const maxAge = Math.max(settings.SNOWBALL_HUNT.TARGET_MAX_AGE_MIN, settings.SNOWBALL_HUNT.TARGET_MAX_AGE_BASE - difficultyMod);

        const boundaries = boundariesRef.current;
        targetsRef.current = targetsRef.current.filter(t => {
            const age = now - t.createdAt;
            if (age > maxAge) {
                processedHits.current.delete(t.id); // Cleanup
                return false;
            }
            t.x += t.vx;
            t.y += t.vy;

            // Bounce off safe boundaries (keep targets within playable area, away from HUD)
            if (t.x < boundaries.left || t.x > boundaries.right - targetSize) {
                t.vx *= -1;
                t.x = Math.max(boundaries.left, Math.min(t.x, boundaries.right - targetSize));
            }
            if (t.y < boundaries.top || t.y > boundaries.bottom - targetSize) {
                t.vy *= -1;
                t.y = Math.max(boundaries.top, Math.min(t.y, boundaries.bottom - targetSize));
            }
            return true;
        });

        // Cleanup expired UI elements (in refs, no state updates)
        particlesRef.current = particlesRef.current.some(p => p.expiry <= now)
            ? particlesRef.current.filter(p => p.expiry > now)
            : particlesRef.current;
        splatsRef.current = splatsRef.current.some(s => s.expiry <= now)
            ? splatsRef.current.filter(s => s.expiry > now)
            : splatsRef.current;
        tapRipplesRef.current = tapRipplesRef.current.some(r => r.expiry <= now)
            ? tapRipplesRef.current.filter(r => r.expiry > now)
            : tapRipplesRef.current;

        // Throttled re-render for smooth animation (max ~30fps for rendering)
        if (time - lastRenderRef.current > 33) {
            lastRenderRef.current = time;
            forceUpdate();
        }

        requestRef.current = requestAnimationFrame(animate);
    }, [targetSize, handleProjectileImpact, settings.PHYSICS.PROJECTILE_SPEED, settings.SNOWBALL_HUNT.TARGET_MAX_AGE_BASE, settings.SNOWBALL_HUNT.TARGET_MAX_AGE_MIN, forceUpdate]);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (!stateRef.current.isPlaying || stateRef.current.isPaused) return;

        // Add tap ripple feedback (in ref, no state update)
        const now = Date.now();
        const rippleId = nextId.current++;
        tapRipplesRef.current = [
            ...tapRipplesRef.current.filter(r => r.expiry > now),
            { id: rippleId, x: e.clientX, y: e.clientY, expiry: now + 500 }
        ];

        soundManager.current?.playThrow();
        const startX = window.innerWidth / 2;
        const startY = window.innerHeight;

        // Update ref directly, no state update
        projectilesRef.current = [...projectilesRef.current, {
            id: nextId.current++,
            x: startX,
            y: startY,
            targetX: e.clientX,
            targetY: e.clientY,
            progress: 0
        }];
    };

    useEffect(() => {
        // ... (spawn interval logic) ...
        const difficultyMod = Math.min(settings.SNOWBALL_HUNT.SPAWN_RATE_BASE - settings.SNOWBALL_HUNT.SPAWN_RATE_MIN, Math.floor(score / 5));
        const spawnRate = Math.max(settings.SNOWBALL_HUNT.SPAWN_RATE_MIN, settings.SNOWBALL_HUNT.SPAWN_RATE_BASE - difficultyMod);
        const spawnInterval = setInterval(spawnTarget, spawnRate);
        return () => clearInterval(spawnInterval);
    }, [spawnTarget, score, settings.SNOWBALL_HUNT.SPAWN_RATE_BASE, settings.SNOWBALL_HUNT.SPAWN_RATE_MIN]);

    // Trigger game over when time runs out
    useEffect(() => {
        if (timeLeft <= 0 && stateRef.current.isPlaying) {
            stateRef.current.isPlaying = false;
            onGameOver(stateRef.current.score, getJoke());
        }
    }, [timeLeft, onGameOver, getJoke]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        const timerInterval = setInterval(() => {
            if (!stateRef.current.frozen && stateRef.current.isPlaying && !stateRef.current.isPaused) {
                setTimeLeft(t => {
                    if (t <= 1) {
                        return 0;
                    }
                    return t - 1;
                });
            }
        }, 1000);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            clearInterval(timerInterval);
        }
    }, [animate]);


    return (
        <div className={`game-area cursor-crosshair ${shake ? 'shake' : ''}`} onPointerDown={handlePointerDown}>
            {frozen && <div className="frozen-overlay"></div>}

            {splatsRef.current.map(s => (
                <div key={s.id} className="splat" style={{ left: s.x - 20, top: s.y - 20 }}></div>
            ))}

            {tapRipplesRef.current.map(r => (
                <div
                    key={r.id}
                    className="tap-ripple"
                    style={{
                        left: r.x - 25,
                        top: r.y - 25,
                        position: 'absolute',
                        width: '50px',
                        height: '50px',
                        border: '3px solid var(--primary-color)',
                        borderRadius: '50%',
                        pointerEvents: 'none',
                        animation: 'tap-ripple-expand 0.5s ease-out forwards',
                        zIndex: 15
                    }}
                />
            ))}

            {particlesRef.current.map(p => (
                <div
                    key={p.id}
                    className={`particle ${p.type}`}
                    style={{ left: p.x, top: p.y, '--tx': p.tx, '--ty': p.ty } as any}
                ></div>
            ))}

            {bottomMessage && (
                <div
                    className="bottom-hit-message"
                    style={{
                        color: bottomMessage.color,
                    }}
                >
                    {bottomMessage.text}
                </div>
            )}

            <HUD score={score} timeLeft={timeLeft} frozen={frozen} combo={combo} onPause={onPause} />

            {targetsRef.current.map(target => (
                <div
                    key={target.id}
                    className={`target target-moving target-${target.type}`}
                    style={{
                        left: target.x,
                        top: target.y,
                        width: targetSize,
                        height: targetSize,
                        pointerEvents: 'none'
                    }}
                >
                    <div className="target-inner">
                        {target.type === 'gift' && <GameIcon name="gift" size={targetSize * 0.8} />}
                        {target.type === 'parcel' && <GameIcon name="parcel" size={targetSize * 0.8} />}
                        {target.type === 'coal' && <GameIcon name="coal" size={targetSize * 0.8} />}
                        {target.type === 'gold' && <GameIcon name="star" size={targetSize * 0.8} />}
                        {target.type === 'time' && <GameIcon name="timer" size={targetSize * 0.8} />}
                        {target.type === 'ice' && <GameIcon name="snowflake" size={targetSize * 0.8} />}
                    </div>
                </div>
            ))}

            {projectilesRef.current.map(p => {
                const cx = p.x + (p.targetX - p.x) * p.progress;
                const cy = p.y + (p.targetY - p.y) * p.progress;
                const scale = 0.5 + Math.sin(p.progress * Math.PI) * 0.5;
                return (
                    <div
                        key={p.id}
                        className="snowball"
                        style={{ left: cx - 10, top: cy - 10, transform: `scale(${scale})` }}
                    ></div>
                )
            })}
        </div>
    )
}

