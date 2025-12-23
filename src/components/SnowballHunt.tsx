import { useState, useEffect, useCallback, useRef } from 'react'
import { GAME_CONFIG } from '../constants/gameConfig'
import { WEIHNACHTS_WITZE, SPRUECHE } from '../constants/gameTexts'
import { HUD } from './ui/HUD'
import { useLanguage } from './LanguageContext'
import { useSound } from './SoundContext'
import GameIcon from './GameIcon'

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
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playHit(type: 'gift' | 'coal' | 'gold' | 'time' | 'ice' | 'parcel') {
        switch (type) {
            case 'gift':
            case 'parcel':
                this.playTone(600, 'sine', 0.1, 0.1); break;
            case 'gold': this.playTone(800, 'square', 0.2, 0.1); break;
            case 'coal': this.playTone(100, 'sawtooth', 0.3, 0.1); break;
            case 'time': this.playTone(1000, 'sine', 0.1, 0.05); break;
            case 'ice': this.playTone(1200, 'triangle', 0.3, 0.1); break;
        }
    }

    playSplat() {
        this.playTone(100, 'triangle', 0.1, 0.05);
    }
}

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

export default function SnowballHunt({ onGameOver, settings, isPaused, onPause }: SnowballHuntProps) {
    const { t, getJoke, getSpruch } = useLanguage();
    const { isMuted } = useSound();
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(settings.TIMER)
    const [targets, setTargets] = useState<Target[]>([])
    const [projectiles, setProjectiles] = useState<Projectile[]>([])
    const [splats, setSplats] = useState<Splat[]>([])
    const [combo, setCombo] = useState(0)
    const [shake, setShake] = useState(false)
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])
    const [particles, setParticles] = useState<Particle[]>([])
    const [targetSize, setTargetSize] = useState(100)
    const [frozen, setFrozen] = useState(false)

    const stateRef = useRef({
        targets: [] as Target[],
        projectiles: [] as Projectile[],
        score: 0,
        frozen: false,
        timeLeft: settings.TIMER,
        isPlaying: true,
        combo: 0,
        isPaused: false
    })

    const processedHits = useRef(new Set<number>()); // Track hit IDs to prevent double-processing

    const soundManager = useRef<SoundManager | null>(null)
    const nextId = useRef(0)
    const requestRef = useRef<number>(0)
    const lastTimeRef = useRef<number>(0)

    useEffect(() => {
        soundManager.current = new SoundManager();
        const updateSize = () => setTargetSize(window.innerWidth < 768 ? 70 : 100);
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

    // Sync refs for physics logic and timers
    useEffect(() => { stateRef.current.score = score }, [score])
    useEffect(() => { stateRef.current.frozen = frozen }, [frozen])
    useEffect(() => { stateRef.current.timeLeft = timeLeft }, [timeLeft])
    useEffect(() => { stateRef.current.targets = targets }, [targets])
    useEffect(() => { stateRef.current.projectiles = projectiles }, [projectiles])
    useEffect(() => { stateRef.current.combo = combo }, [combo])
    useEffect(() => { stateRef.current.isPaused = isPaused }, [isPaused])

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
        setParticles(prev => [...prev.filter(p => p.expiry > now), ...newParticles])
    }, [])

    const addFloatingText = useCallback((x: number, y: number, text: string, color: string = 'white') => {
        const now = Date.now();
        const id = nextId.current++
        setFloatingTexts(prev => [...prev.filter(t => t.expiry > now), { id, x, y, text, color, expiry: now + 2000 }])
    }, [])

    const spawnTarget = useCallback(() => {
        if (!stateRef.current.isPlaying || stateRef.current.isPaused) return;

        const padding = 50
        const x = Math.random() * (window.innerWidth - targetSize - padding * 2) + padding
        const y = Math.random() * (window.innerHeight - targetSize - padding * 2) + padding

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

        setTargets(prev => [...prev, newTarget])
    }, [targetSize])

    const handleHitSuccess = useCallback((id: number, type: 'gift' | 'coal' | 'gold' | 'time' | 'ice' | 'parcel', x: number, y: number) => {
        if (processedHits.current.has(id)) return;
        processedHits.current.add(id);

        soundManager.current?.playHit(type);
        setTargets(prev => prev.filter(t => t.id !== id));
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
            case 'parcel':
                points = settings.POINTS.REGULAR
                text = `+${points}`
                color = '#ff4d4d'
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
    }, [settings.POINTS, spawnParticles, addFloatingText, getSpruch, t]);

    const handleHitMiss = useCallback((x: number, y: number) => {
        soundManager.current?.playSplat();
        const now = Date.now();
        const splatId = nextId.current++;
        setSplats(prev => [...prev.filter(s => s.expiry > now), { id: splatId, x, y, expiry: now + 1000 }]);
    }, []);

    const handleProjectileImpact = useCallback((p: Projectile) => {
        const { targetX, targetY } = p;
        const hitRadius = targetSize / 2;
        const currentTargets = stateRef.current.targets;

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
        // Don't update lastTimeRef if paused to prevent huge dt jumps

        if (stateRef.current.isPaused) {
            lastTimeRef.current = time; // Keep updating time to avoid jumps on resume
            requestRef.current = requestAnimationFrame(animate);
            return;
        }

        lastTimeRef.current = time;

        if (!stateRef.current.isPlaying) return;

        // Update Projectiles
        setProjectiles(prev => {
            const nextProjs: Projectile[] = [];
            prev.forEach(p => {
                const newProgress = p.progress + settings.PHYSICS.PROJECTILE_SPEED;
                if (newProgress >= 1) handleProjectileImpact(p);
                else nextProjs.push({ ...p, progress: newProgress });
            });
            return nextProjs;
        });

        // Update Targets
        setTargets(prev => {
            const now = Date.now();
            const difficultyMod = Math.min(settings.SNOWBALL_HUNT.TARGET_MAX_AGE_BASE - settings.SNOWBALL_HUNT.TARGET_MAX_AGE_MIN, stateRef.current.score * 5);
            const maxAge = Math.max(settings.SNOWBALL_HUNT.TARGET_MAX_AGE_MIN, settings.SNOWBALL_HUNT.TARGET_MAX_AGE_BASE - difficultyMod);

            return prev.filter(t => {
                const age = now - t.createdAt;
                if (age > maxAge) {
                    processedHits.current.delete(t.id); // Cleanup
                    return false;
                }
                t.x += t.vx;
                t.y += t.vy;
                if (t.x < 0 || t.x > window.innerWidth - targetSize) t.vx *= -1;
                if (t.y < 0 || t.y > window.innerHeight - targetSize) t.vy *= -1;
                return true;
            });
        });

        // Cleanup expired UI elements (floating text, particles, splats)
        const now = Date.now();
        setFloatingTexts(prev => prev.some(t => t.expiry <= now) ? prev.filter(t => t.expiry > now) : prev);
        setParticles(prev => prev.some(p => p.expiry <= now) ? prev.filter(p => p.expiry > now) : prev);
        setSplats(prev => prev.some(s => s.expiry <= now) ? prev.filter(s => s.expiry > now) : prev);

        requestRef.current = requestAnimationFrame(animate);
    }, [targetSize, handleProjectileImpact, settings.PHYSICS.PROJECTILE_SPEED, settings.SNOWBALL_HUNT.TARGET_MAX_AGE_BASE, settings.SNOWBALL_HUNT.TARGET_MAX_AGE_MIN]);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (!stateRef.current.isPlaying || stateRef.current.isPaused) return;
        soundManager.current?.playThrow();
        const startX = window.innerWidth / 2;
        const startY = window.innerHeight;
        setProjectiles(prev => [...prev, {
            id: nextId.current++,
            x: startX,
            y: startY,
            targetX: e.clientX,
            targetY: e.clientY,
            progress: 0
        }]);
    };

    useEffect(() => {
        // ... (spawn interval logic) ...
        const difficultyMod = Math.min(settings.SNOWBALL_HUNT.SPAWN_RATE_BASE - settings.SNOWBALL_HUNT.SPAWN_RATE_MIN, Math.floor(score / 5));
        const spawnRate = Math.max(settings.SNOWBALL_HUNT.SPAWN_RATE_MIN, settings.SNOWBALL_HUNT.SPAWN_RATE_BASE - difficultyMod);
        const spawnInterval = setInterval(spawnTarget, spawnRate);
        return () => clearInterval(spawnInterval);
    }, [spawnTarget, score, settings.SNOWBALL_HUNT.SPAWN_RATE_BASE, settings.SNOWBALL_HUNT.SPAWN_RATE_MIN]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        const timerInterval = setInterval(() => {
            if (!stateRef.current.frozen && stateRef.current.isPlaying && !stateRef.current.isPaused) {
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

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            clearInterval(timerInterval);
        }
    }, [animate, onGameOver, getJoke]);


    return (
        <div className={`game-area cursor-crosshair ${shake ? 'shake' : ''}`} onPointerDown={handlePointerDown}>
            {frozen && <div className="frozen-overlay"></div>}

            {splats.map(s => (
                <div key={s.id} className="splat" style={{ left: s.x - 20, top: s.y - 20 }}></div>
            ))}

            {particles.map(p => (
                <div
                    key={p.id}
                    className={`particle ${p.type}`}
                    style={{ left: p.x, top: p.y, '--tx': p.tx, '--ty': p.ty } as any}
                ></div>
            ))}

            {floatingTexts.map(t => (
                <div
                    key={t.id}
                    className="floating-text"
                    style={{ left: t.x, top: t.y, color: t.color, fontSize: window.innerWidth < 768 ? '1.5rem' : '3rem' }}
                >
                    {t.text}
                </div>
            ))}

            <HUD score={score} timeLeft={timeLeft} frozen={frozen} combo={combo} onPause={onPause} />

            {targets.map(target => (
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

            {projectiles.map(p => {
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

