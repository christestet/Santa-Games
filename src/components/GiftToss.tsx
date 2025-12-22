import { useState, useEffect, useRef, useCallback } from 'react'
import { GAME_CONFIG } from '../constants/gameConfig'

interface Gift {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    type: 'red' | 'blue' | 'coal';
    active: boolean;
    landed: boolean;
}

interface Chimney { id: number; x: number; speed: number; width: number; }
interface Obstacle { id: number; x: number; y: number; width: number; height: number; speed: number; type: 'cloud' | 'plane'; }
interface FloatingText { id: number; x: number; y: number; text: string; color: string; expiry: number; }

interface GiftTossProps {
    onGameOver: (score: number, joke: string) => void;
    settings: typeof GAME_CONFIG;
}

export default function GiftToss({ onGameOver, settings }: GiftTossProps) {
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(settings.TIMER)
    const [gifts, setGifts] = useState<Gift[]>([])
    const [chimneys, setChimneys] = useState<Chimney[]>([])
    const [obstacles, setObstacles] = useState<Obstacle[]>([])
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])
    const [santaX, setSantaX] = useState(window.innerWidth / 2)

    const santaRef = useRef({ x: window.innerWidth / 2, speed: 3 })
    const nextId = useRef(0)
    const requestRef = useRef<number>(0)
    const lastTimeRef = useRef<number>(0)
    const lastThrowTime = useRef(0)

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
        isPlaying: true
    })

    // Sync refs for collision detection
    useEffect(() => { stateRef.current.gifts = gifts }, [gifts])
    useEffect(() => { stateRef.current.chimneys = chimneys }, [chimneys])
    useEffect(() => { stateRef.current.obstacles = obstacles }, [obstacles])
    useEffect(() => { stateRef.current.score = score }, [score])

    const addFloatingText = useCallback((x: number, y: number, text: string, color: string = 'white') => {
        const now = Date.now();
        const id = nextId.current++
        setFloatingTexts(prev => [...prev.filter(t => t.expiry > now), { id, x, y, text, color, expiry: now + 800 }])
    }, [])

    const spawnChimney = useCallback(() => {
        const id = nextId.current++
        const width = 80 + Math.random() * 40
        const speed = -1.5 - Math.random() * 1.5;
        setChimneys(prev => [...prev, { id, x: window.innerWidth, speed, width }])
    }, [])

    const spawnObstacle = useCallback(() => {
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
        lastTimeRef.current = time;

        // 1. Update Santa
        const s = santaRef.current;
        s.x += s.speed;
        if (s.x > window.innerWidth - 80 || s.x < 80) s.speed *= -1;
        setSantaX(s.x);

        // 2. Update Entities
        setChimneys(prev => prev.map(c => ({ ...c, x: c.x + c.speed })).filter(c => c.x > -200 && c.x < window.innerWidth + 200));
        setObstacles(prev => prev.map(o => ({ ...o, x: o.x + o.speed })).filter(o => o.x > -200 && o.x < window.innerWidth + 200));

        // 3. Update Gifts (Physics & Collision)
        setGifts(prev => {
            const currentObstacles = stateRef.current.obstacles;
            const currentChimneys = stateRef.current.chimneys;
            const chimneyY = window.innerHeight - CHIMNEY_HEIGHT;

            return prev.map(gift => {
                if (!gift.active || gift.landed) return gift;

                const nextX = gift.x + gift.vx;
                const nextY = gift.y + gift.vy;
                const nextVy = gift.vy + GRAVITY;

                // Obstacle Collision
                const hitObstacle = currentObstacles.find(obs =>
                    nextX + GIFT_SIZE > obs.x && nextX < obs.x + obs.width &&
                    nextY + GIFT_SIZE > obs.y && nextY < obs.y + obs.height
                );

                if (hitObstacle) {
                    addFloatingText(nextX, nextY, "POOF!", "#fff");
                    return { ...gift, active: false };
                }

                // Chimney Collision
                if (nextY >= chimneyY && gift.y < chimneyY) {
                    const hitChimney = currentChimneys.find(c =>
                        nextX + GIFT_SIZE / 2 > c.x && nextX + GIFT_SIZE / 2 < c.x + c.width
                    );

                    if (hitChimney) {
                        let pts = gift.type === 'coal' ? settings.POINTS.COAL : (gift.type === 'blue' ? settings.POINTS.BONUS : settings.POINTS.REGULAR);
                        setScore(s => Math.max(0, s + pts));
                        addFloatingText(nextX, nextY, pts > 0 ? `PERFECT +${pts}` : "OH NO!", pts > 0 ? '#4caf50' : '#555');
                        if (navigator.vibrate) navigator.vibrate(20);
                        return { ...gift, landed: true, active: false };
                    }
                }

                // Ground Collision
                if (nextY > window.innerHeight - 20) {
                    addFloatingText(nextX, nextY, "Miss", "#aaa");
                    return { ...gift, landed: true, active: false };
                }

                // Out of Bounds
                if (nextX < -100 || nextX > window.innerWidth + 100) return { ...gift, active: false };

                return { ...gift, x: nextX, y: nextY, vy: nextVy };
            }).filter(g => g.active);
        });

        // Cleanup UI elements
        const now = Date.now();
        setFloatingTexts(prev => prev.some(t => t.expiry <= now) ? prev.filter(t => t.expiry > now) : prev);

        requestRef.current = requestAnimationFrame(update);
    }, [addFloatingText, settings.POINTS]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(update);
        const chimneyInterval = setInterval(spawnChimney, settings.GIFT_TOSS.SPAWN_RATE_CHIMNEY);
        const obstacleInterval = setInterval(spawnObstacle, settings.GIFT_TOSS.SPAWN_RATE_OBSTACLE);
        const timerInterval = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    stateRef.current.isPlaying = false;
                    onGameOver(stateRef.current.score, "Danke für deine Hilfe, Santa!");
                    return 0;
                }
                return t - 1;
            });
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

    const handleTap = (e: React.PointerEvent) => {
        if (Date.now() - lastThrowTime.current < COOLDOWN) return;
        lastThrowTime.current = Date.now();

        const rand = Math.random();
        const type = rand > 0.9 ? 'blue' : (rand > 0.8 ? 'coal' : 'red');
        const initialVx = santaRef.current.speed * 0.8;

        const newGift: Gift = {
            id: nextId.current++,
            x: santaRef.current.x,
            y: 80,
            vx: initialVx,
            vy: settings.PHYSICS.THROW_VELOCITY,
            type,
            active: true,
            landed: false
        };

        setGifts(prev => [...prev, newGift]);
    };

    return (
        <div className="game-area gift-toss" onPointerDown={handleTap} style={{ cursor: 'pointer' }}>
            <div className="score-display">Punkte: {score}</div>
            <div className={`timer-display ${timeLeft < 10 ? 'timer-pulse' : ''}`}>⏳ {timeLeft}</div>

            <div className="santa-hand-top" style={{ left: santaX }}>🎅</div>

            {obstacles.map(o => (
                <div key={o.id} className="obstacle" style={{ left: o.x, top: o.y, width: o.width, height: o.height }}>
                    <span style={{ fontSize: o.type === 'cloud' ? '5rem' : '4rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
                        {o.type === 'cloud' ? '☁️' : '✈️'}
                    </span>
                </div>
            ))}

            {gifts.map(g => (
                <div key={g.id} className={`gift-item ${g.type}`} style={{ left: g.x, top: g.y, width: GIFT_SIZE, height: GIFT_SIZE }}>
                    {g.type === 'red' && '🎁'}
                    {g.type === 'blue' && '📦'}
                    {g.type === 'coal' && '🌑'}
                </div>
            ))}

            {chimneys.map(c => (
                <div
                    key={c.id}
                    className="chimney"
                    style={{ left: c.x, width: c.width, height: CHIMNEY_HEIGHT, bottom: 0, top: 'auto', borderTop: '4px solid #331a1a', borderBottom: 'none' }}
                >
                    <div className="chimney-smoke"></div>
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
