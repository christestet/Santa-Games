import { useState, useEffect, useRef, useCallback } from 'react'

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

interface Chimney {
    id: number;
    x: number;
    speed: number;
    width: number;
}

interface Obstacle {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    type: 'cloud' | 'plane';
}

interface GiftTossProps {
    onGameOver: (score: number, joke: string) => void;
}

export default function GiftToss({ onGameOver }: GiftTossProps) {
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(60)
    const [gifts, setGifts] = useState<Gift[]>([])
    const [chimneys, setChimneys] = useState<Chimney[]>([])
    const [obstacles, setObstacles] = useState<Obstacle[]>([])
    const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number; text: string; color: string }[]>([])

    // Santa State
    const santaRef = useRef({ x: window.innerWidth / 2, speed: 3 })
    const [santaX, setSantaX] = useState(window.innerWidth / 2)

    const nextId = useRef(0)
    const requestRef = useRef<number>(0)
    const lastTimeRef = useRef<number>(0)

    // Game constants
    const GRAVITY = 0.4
    const GIFT_SIZE = 40
    const CHIMNEY_HEIGHT = 80
    const COOLDOWN = 400 // Faster cooldown for tapping
    const lastThrowTime = useRef(0)

    const addFloatingText = (x: number, y: number, text: string, color: string = 'white') => {
        const id = Math.random()
        setFloatingTexts(prev => [...prev, { id, x, y, text, color }])
        setTimeout(() => {
            setFloatingTexts(prev => prev.filter(t => t.id !== id))
        }, 800)
    }

    const spawnChimney = useCallback(() => {
        const id = nextId.current++
        const width = 80 + Math.random() * 40
        const x = window.innerWidth
        const speed = -1.5 - Math.random() * 1.5;
        const newChimney = { id, x, speed, width }
        setChimneys(prev => [...prev, newChimney])
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

    // Game Loop Setup
    useEffect(() => {
        const chimneyInterval = setInterval(spawnChimney, 2500)
        // Reduced frequency from 1800 to 3500 to make it easier
        const obstacleInterval = setInterval(spawnObstacle, 3500)

        const timerInterval = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    onGameOver(score, "Danke für deine Hilfe, Santa!")
                    return 0
                }
                return t - 1
            })
        }, 1000)

        spawnChimney()
        spawnObstacle()

        return () => {
            clearInterval(chimneyInterval)
            clearInterval(obstacleInterval)
            clearInterval(timerInterval)
        }
    }, [spawnChimney, spawnObstacle, onGameOver, score])

    // Physics Loop
    const update = (time: number) => {
        if (lastTimeRef.current !== undefined) {

            // 1. Update Santa
            const s = santaRef.current;
            s.x += s.speed;
            // Bounce Santa off walls
            if (s.x > window.innerWidth - 80 || s.x < 80) {
                s.speed *= -1;
            }
            setSantaX(s.x);

            // 2. Update Gifts
            setGifts(prev => prev.map(gift => {
                if (!gift.active || gift.landed) return gift

                const nextY = gift.y + gift.vy
                const nextX = gift.x + gift.vx
                const nextVy = gift.vy + GRAVITY

                // Obstacle Collision
                const hitObstacle = obstacles.find(obs =>
                    nextX + GIFT_SIZE > obs.x &&
                    nextX < obs.x + obs.width &&
                    nextY + GIFT_SIZE > obs.y &&
                    nextY < obs.y + obs.height
                );

                if (hitObstacle) {
                    addFloatingText(nextX, nextY, "POOF!", "#fff");
                    return { ...gift, active: false };
                }

                // Chimney Collision
                const chimneyY = window.innerHeight - CHIMNEY_HEIGHT;

                if (nextY >= chimneyY && gift.y < chimneyY) {
                    const hitChimney = chimneys.find(c =>
                        nextX + GIFT_SIZE / 2 > c.x &&
                        nextX + GIFT_SIZE / 2 < c.x + c.width
                    );

                    if (hitChimney) {
                        let pts = gift.type === 'coal' ? -50 : 100
                        if (gift.type === 'blue') pts = 200
                        setScore(s => Math.max(0, s + pts))
                        addFloatingText(nextX, nextY, pts > 0 ? `PERFECT +${pts}` : "OH NO!", pts > 0 ? '#4caf50' : '#555')
                        if (navigator.vibrate) navigator.vibrate(20);
                        return { ...gift, landed: true, active: false }
                    }
                }

                // Ground Collision
                if (nextY > window.innerHeight - 20) {
                    if (!gift.landed) {
                        addFloatingText(nextX, nextY, "Miss", "#aaa");
                    }
                    return { ...gift, landed: true, active: false }
                }

                if (nextX < -100 || nextX > window.innerWidth + 100) {
                    return { ...gift, active: false }
                }

                return { ...gift, x: nextX, y: nextY, vy: nextVy }
            }).filter(g => g.active))

            // 3. Move Entities
            setChimneys(prev => prev.map(c => ({
                ...c,
                x: c.x + c.speed
            })).filter(c => c.x > -200 && c.x < window.innerWidth + 200))

            setObstacles(prev => prev.map(o => ({
                ...o,
                x: o.x + o.speed
            })).filter(o => o.x > -200 && o.x < window.innerWidth + 200))
        }
        lastTimeRef.current = time
        requestRef.current = requestAnimationFrame(update)
    }

    useEffect(() => {
        requestRef.current = requestAnimationFrame(update)
        return () => cancelAnimationFrame(requestRef.current!)
    }, [chimneys, obstacles])


    // Handlers
    const handleTap = (e: React.PointerEvent) => {
        if (Date.now() - lastThrowTime.current < COOLDOWN) return

        lastThrowTime.current = Date.now()

        const rand = Math.random()
        const type = rand > 0.9 ? 'blue' : (rand > 0.8 ? 'coal' : 'red')

        // Inherit Velocity (Inertia)
        // Add a slight boost to make it feel like a "throw"
        const initialVx = santaRef.current.speed * 0.8;

        const newGift: Gift = {
            id: nextId.current++,
            x: santaRef.current.x,
            y: 80, // Start from Santa
            vx: initialVx,
            vy: 4, // Stronger initial downward throw
            type,
            active: true,
            landed: false
        }

        setGifts(prev => [...prev, newGift])
    }

    return (
        <div
            className="game-area gift-toss"
            onPointerDown={handleTap}
            style={{ cursor: 'pointer' }}
        >
            <div className="score-display">Punkte: {score}</div>
            <div className={`timer-display ${timeLeft < 10 ? 'timer-pulse' : ''}`}>
                ⏳ {timeLeft}
            </div>

            {/* Santa at Top (Moving) */}
            <div
                className="santa-hand-top"
                style={{ left: santaX }}
            >
                🎅
            </div>

            {/* Obstacles */}
            {obstacles.map(o => (
                <div
                    key={o.id}
                    className="obstacle"
                    style={{
                        left: o.x,
                        top: o.y,
                        width: o.width,
                        height: o.height,
                        // Visual box removed
                    }}
                >
                    <span style={{ fontSize: o.type === 'cloud' ? '5rem' : '4rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
                        {o.type === 'cloud' ? '☁️' : '✈️'}
                    </span>
                </div>
            ))}

            {/* Gifts */}
            {gifts.map(g => (
                <div
                    key={g.id}
                    className={`gift-item ${g.type}`}
                    style={{ left: g.x, top: g.y, width: GIFT_SIZE, height: GIFT_SIZE }}
                >
                    {g.type === 'red' && '🎁'}
                    {g.type === 'blue' && '📦'}
                    {g.type === 'coal' && '🌑'}
                </div>
            ))}

            {/* Chimneys at Bottom */}
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
                <div
                    key={t.id}
                    className="floating-text"
                    style={{ left: t.x, top: t.y, color: t.color, fontSize: '2rem' }}
                >
                    {t.text}
                </div>
            ))}
        </div>
    )
}
