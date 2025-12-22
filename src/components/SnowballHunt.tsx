import { useState, useEffect, useCallback, useRef } from 'react'

const WEIHNACHTS_WITZE = [
    "Warum hat der Schneemann keine Beine? Weil er sonst weglaufen würde, wenn er gelbe Flecken sieht!",
    "Was ist das Lieblingsessen von Rentieren? Rentier-Gulasch... oh warte, nein!",
    "Was sagt der Nikolaus, wenn er in den Schornstein guckt? 'Hier zieht's!'",
    "Warum ist der Weihnachtsmann so gut gelernt? Er hat viel 'Präsenz-Unterricht'!",
    "Was bekommt ein artiges Kind zu Weihnachten? Ein Tablet. Und ein unartiges? Eine Tablette!",
    "Wer klopft an die Tür und ist ganz weiß? Der Klopfsalat... nein, der Schneemann!",
    "Wie nennt man einen alten Schneemann? Eine Pfütze!",
    "Warum hat der Weihnachtsmann einen Sack? Damit er nicht alles einzeln tragen muss!",
    "Was ist rot und sitzt im Wald? Eine Weihnachtskirsche!",
    "Warum kommt der Weihnachtsmann durch den Schornstein? Weil es ihm 'rußt'!",
]

const SPRUECHE = [
    "Putz dir die Nase!",
    "Das war knapp!",
    "Hoppla!",
    "Oha!",
    "Hast du Tomaten auf den Augen?",
    "Meine Oma klickt schneller!",
    "Oje, oje!",
]

// --- Audio Manager ---
class SoundManager {
    ctx: AudioContext | null = null;

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
        if (!this.ctx) return;
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
        if (!this.ctx) return;
        // White noise burst or quick slide
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

    playHit(type: 'gift' | 'coal' | 'gold' | 'time' | 'ice') {
        switch (type) {
            case 'gift': this.playTone(600, 'sine', 0.1, 0.1); break;
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
}

interface Target {
    id: number;
    x: number;
    y: number;
    type: 'gift' | 'coal' | 'gold' | 'time' | 'ice';
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
    progress: number; // 0 to 1
}

interface Splat {
    id: number;
    x: number;
    y: number;
}

export default function SnowballHunt({ onGameOver, highScores }: SnowballHuntProps) {
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(30)
    const [targets, setTargets] = useState<Target[]>([])
    const [projectiles, setProjectiles] = useState<Projectile[]>([])
    const [splats, setSplats] = useState<Splat[]>([])
    const [combo, setCombo] = useState(0)
    const [shake, setShake] = useState(false)
    const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number; text: string; color: string }[]>([])
    const [particles, setParticles] = useState<{ id: number; x: number; y: number; tx: string; ty: string; type: string }[]>([])
    const [targetSize, setTargetSize] = useState(100)
    const [frozen, setFrozen] = useState(false)

    // Refs for game loop state to avoid closure staleness
    const stateRef = useRef({
        targets: [] as Target[],
        projectiles: [] as Projectile[],
        score: 0,
        frozen: false,
        timeLeft: 30,
        isPlaying: true
    })

    const soundManager = useRef<SoundManager | null>(null)
    const nextId = useRef(0)
    const requestRef = useRef<number>(0)
    const lastTimeRef = useRef<number>(0)

    // Init Logic
    useEffect(() => {
        soundManager.current = new SoundManager();
        const updateSize = () => {
            setTargetSize(window.innerWidth < 768 ? 70 : 100)
        }
        updateSize()
        window.addEventListener('resize', updateSize)

        // Resume Audio Context on interaction
        const resumeAudio = () => {
            soundManager.current?.ctx?.resume();
            window.removeEventListener('pointerdown', resumeAudio);
        }
        window.addEventListener('pointerdown', resumeAudio);

        return () => {
            window.removeEventListener('resize', updateSize)
            window.removeEventListener('pointerdown', resumeAudio);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
    }, [])

    // Sync refs
    useEffect(() => { stateRef.current.score = score }, [score])
    useEffect(() => { stateRef.current.frozen = frozen }, [frozen])
    useEffect(() => { stateRef.current.timeLeft = timeLeft }, [timeLeft])
    useEffect(() => { stateRef.current.targets = targets }, [targets])
    useEffect(() => { stateRef.current.projectiles = projectiles }, [projectiles])

    const triggerShake = () => {
        setShake(true)
        setTimeout(() => setShake(false), 400)
    }

    const spawnParticles = (x: number, y: number, type: string) => {
        const newParticles: { id: number; x: number; y: number; tx: string; ty: string; type: string }[] = []
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * 360
            const dist = 50 + Math.random() * 50
            const tx = `${Math.cos(angle) * dist}px`
            const ty = `${Math.sin(angle) * dist}px`
            newParticles.push({ id: nextId.current++, x, y, tx, ty, type })
        }
        setParticles(prev => [...prev, ...newParticles])
        setTimeout(() => {
            setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)))
        }, 600)
    }

    const addFloatingText = (x: number, y: number, text: string, color: string = 'white') => {
        const id = nextId.current++
        setFloatingTexts(prev => [...prev, { id, x, y, text, color }])
        setTimeout(() => {
            setFloatingTexts(prev => prev.filter(t => t.id !== id))
        }, 800)
    }

    // --- Game Logic ---

    const spawnTarget = useCallback(() => {
        if (!stateRef.current.isPlaying) return;

        const padding = 50
        const x = Math.random() * (window.innerWidth - targetSize - padding * 2) + padding
        const y = Math.random() * (window.innerHeight - targetSize - padding * 2) + padding

        const rand = Math.random()
        let type: 'gift' | 'coal' | 'gold' | 'time' | 'ice' = 'gift'

        if (rand > 0.97) type = 'ice'
        else if (rand > 0.95) type = 'time'
        else if (rand > 0.85) type = 'gold'
        else if (rand > 0.70) type = 'coal'

        // Slight movement
        const vx = (Math.random() - 0.5) * 1;
        const vy = (Math.random() - 0.5) * 1;

        const newTarget: Target = {
            id: nextId.current++,
            x, y,
            type,
            vx, vy,
            createdAt: Date.now()
        }

        setTargets(prev => [...prev, newTarget])
    }, [targetSize])

    // Main Loop
    const animate = useCallback((time: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = time;
        // const delta = time - lastTimeRef.current;
        lastTimeRef.current = time;

        if (!stateRef.current.isPlaying) return;

        // 1. Update Projectiles
        setProjectiles(prev => {
            const nextProjs: Projectile[] = [];
            const idsToRemove: number[] = [];

            prev.forEach(p => {
                const newProgress = p.progress + 0.08; // Speed of snowball
                if (newProgress >= 1) {
                    // Impact!
                    handleProjectileImpact(p);
                    idsToRemove.push(p.id);
                } else {
                    nextProjs.push({ ...p, progress: newProgress });
                }
            });
            return nextProjs;
        });

        // 2. Update Targets (Movement & Expiry)
        setTargets(prev => {
            const now = Date.now();
            const difficultyMod = Math.min(2000, stateRef.current.score * 5); // Score increases longevity reduction
            const maxAge = Math.max(1500, 3000 - difficultyMod);

            return prev.filter(t => {
                const age = now - t.createdAt;
                if (age > maxAge) return false; // Expire

                // Movement
                t.x += t.vx;
                t.y += t.vy;

                // Bounce off walls
                if (t.x < 0 || t.x > window.innerWidth - targetSize) t.vx *= -1;
                if (t.y < 0 || t.y > window.innerHeight - targetSize) t.vy *= -1;

                return true;
            });
        });

        requestRef.current = requestAnimationFrame(animate);
    }, [targetSize]); // Deps

    // Projectile Impact Logic
    const handleProjectileImpact = (p: Projectile) => {
        const { targetX, targetY } = p;
        const hitRadius = targetSize / 2;

        // Check collisions against current targets
        // Note: checking against stateRef might be slightly stale for precise hit but ok for this game
        // Better to use functional update but we need to trigger side effects (score). 
        // We will do a check on the *currently rendered* targets in the next render cycle effectively
        // Actually, we need to know NOW.

        let hitId = -1;
        let hitType: any = null;

        // We check against the LATEST targets from the ref to be accurate
        const currentTargets = stateRef.current.targets;

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

        if (hitId !== -1) {
            // HIT
            handleHitSuccess(hitId, hitType, targetX, targetY);
        } else {
            // MISS
            handleHitMiss(targetX, targetY);
        }
    };

    const handleHitSuccess = (id: number, type: 'gift' | 'coal' | 'gold' | 'time' | 'ice', x: number, y: number) => {
        soundManager.current?.playHit(type);
        setTargets(prev => prev.filter(t => t.id !== id));
        spawnParticles(x, y, `particle-${type}`);

        let points = 0;
        let text = "";
        let color = "#fff";
        let newCombo = combo;

        if (type === 'coal') {
            newCombo = 0;
            points = -50;
            text = SPRUECHE[Math.floor(Math.random() * SPRUECHE.length)];
            color = "#555";
            triggerShake();
            if (navigator.vibrate) navigator.vibrate(200);
        } else {
            newCombo += 1;
        }
        setCombo(newCombo);

        switch (type) {
            case 'gift':
                points = 10 * (Math.floor(newCombo / 5) + 1)
                text = `+${points}`
                color = '#ff4d4d'
                break
            case 'gold':
                points = 50 * (Math.floor(newCombo / 5) + 1)
                text = `MEGA +${points}!`
                color = 'var(--christmas-gold)'
                break
            case 'time':
                setTimeLeft(t => t + 5)
                text = "+5s!"
                color = '#4caf50'
                break
            case 'ice':
                setFrozen(true)
                text = "❄️ FREEZE! ❄️"
                color = '#a5f2f3'
                setTimeout(() => setFrozen(false), 3000)
                break
        }

        if (points !== 0) {
            setScore(s => Math.max(0, s + points));
        }

        addFloatingText(x, y, text, color);
    };

    const handleHitMiss = (x: number, y: number) => {
        soundManager.current?.playSplat();
        // Create splat
        const splatId = nextId.current++;
        setSplats(prev => [...prev, { id: splatId, x, y }]);
        setTimeout(() => {
            setSplats(prev => prev.filter(s => s.id !== splatId));
        }, 1000); // clear after animation

        // Reset combo? Maybe compassionate: misses don't break combo, only coal does.
    };


    const handlePointerDown = (e: React.PointerEvent) => {
        if (!stateRef.current.isPlaying) return;
        const x = e.clientX;
        const y = e.clientY;

        soundManager.current?.playThrow();

        // Spawn Projectile
        const startX = window.innerWidth / 2;
        const startY = window.innerHeight; // comes from bottom
        setProjectiles(prev => [...prev, {
            id: nextId.current++,
            x: startX,
            y: startY,
            targetX: x,
            targetY: y,
            progress: 0
        }]);
    };


    // Start intervals
    useEffect(() => {
        // Game Loop
        requestRef.current = requestAnimationFrame(animate);

        // Spawner
        const difficultyMod = Math.min(300, Math.floor(score / 5))
        const spawnRate = Math.max(400, 700 - difficultyMod)
        const spawnInterval = setInterval(spawnTarget, spawnRate)

        // Timer
        const timerInterval = setInterval(() => {
            if (!stateRef.current.frozen && stateRef.current.isPlaying) {
                setTimeLeft(t => {
                    if (t <= 1) {
                        stateRef.current.isPlaying = false;
                        const joke = WEIHNACHTS_WITZE[Math.floor(Math.random() * WEIHNACHTS_WITZE.length)]
                        onGameOver(stateRef.current.score, joke)
                        return 0
                    }
                    return t - 1
                })
            }
        }, 1000)

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            clearInterval(spawnInterval);
            clearInterval(timerInterval);
        }
    }, [animate, spawnTarget, score, onGameOver]);


    return (
        <div
            className={`game-area cursor-crosshair ${shake ? 'shake' : ''}`}
            onPointerDown={handlePointerDown}
        >
            {frozen && <div className="frozen-overlay"></div>}

            {/* Splats (Background layer) */}
            {splats.map(s => (
                <div key={s.id} className="splat" style={{ left: s.x - 20, top: s.y - 20 }}></div>
            ))}

            {particles.map(p => (
                <div
                    key={p.id}
                    className={`particle ${p.type}`} // Use specific particle classes
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

            {/* UI Layer */}
            <div className="score-display">Punkte: {score}</div>
            <div className={`timer-display ${timeLeft < 10 ? 'timer-pulse' : ''}`}>
                {frozen ? '❄️' : '⏳'} {timeLeft}
            </div>
            {combo > 1 && <div className={`combo-display ${combo > 5 ? 'combo-shake' : ''}`}>COMBO x{combo} 🔥</div>}


            {/* Targets */}
            {targets.map(target => (
                <div
                    key={target.id}
                    className="target target-moving"
                    style={{
                        left: target.x,
                        top: target.y,
                        width: targetSize,
                        height: targetSize,
                        pointerEvents: 'none' // Click handled by game area -> projectile
                    }}
                >
                    <div className="target-inner">
                        {target.type === 'gift' && '🎁'}
                        {target.type === 'coal' && '🌑'}
                        {target.type === 'gold' && '⭐'}
                        {target.type === 'time' && '⏱️'}
                        {target.type === 'ice' && '❄️'}
                    </div>
                </div>
            ))}

            {/* Projectiles */}
            {projectiles.map(p => {
                // Lerp position
                const cx = p.x + (p.targetX - p.x) * p.progress;
                const cy = p.y + (p.targetY - p.y) * p.progress;
                // Scale based on progress to simulate depth/arc
                const scale = 0.5 + Math.sin(p.progress * Math.PI) * 0.5;

                return (
                    <div
                        key={p.id}
                        className="snowball"
                        style={{
                            left: cx - 10,
                            top: cy - 10,
                            transform: `scale(${scale})`
                        }}
                    ></div>
                )
            })}
        </div>
    )
}

