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
    const [timeLeft, setTimeLeft] = useState(60) // More time for strategy
    const [gifts, setGifts] = useState<Gift[]>([])
    const [chimneys, setChimneys] = useState<Chimney[]>([])
    const [obstacles, setObstacles] = useState<Obstacle[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [dragCurrent, setDragCurrent] = useState({ x: 0, y: 0 })
    const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number; text: string; color: string }[]>([])

    const nextId = useRef(0)
    const requestRef = useRef<number>(0)
    const lastTimeRef = useRef<number>(0)

    // Game constants
    const GRAVITY = 0.4
    const GIFT_SIZE = 40
    const CHIMNEY_HEIGHT = 80 // Reduced height since they are targets now
    const COOLDOWN = 600
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
        // Spawn from right
        const x = window.innerWidth
        const speed = -1.5 - Math.random() * 1.5; // Move left
        const newChimney = { id, x, speed, width }
        setChimneys(prev => [...prev, newChimney])
    }, [])

    const spawnObstacle = useCallback(() => {
        const id = nextId.current++
        const type = Math.random() > 0.7 ? 'plane' : 'cloud'
        const width = type === 'cloud' ? 120 : 60
        const height = type === 'cloud' ? 60 : 30
        const y = 150 + Math.random() * (window.innerHeight - 350) // Middle area

        // Random direction
        const fromLeft = Math.random() > 0.5;
        const x = fromLeft ? -width : window.innerWidth;
        const speed = (1 + Math.random() * 2) * (fromLeft ? 1 : -1);

        setObstacles(prev => [...prev, { id, x, y, width, height, speed, type }])
    }, [])

    // Game Loop Setup
    useEffect(() => {
        const chimneyInterval = setInterval(spawnChimney, 2500)
        const obstacleInterval = setInterval(spawnObstacle, 1800)

        const timerInterval = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    onGameOver(score, "Danke für deine Hilfe, Santa!")
                    return 0
                }
                return t - 1
            })
        }, 1000)

        // Initial Entities
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

            setGifts(prev => prev.map(gift => {
                if (!gift.active || gift.landed) return gift

                const nextY = gift.y + gift.vy
                const nextX = gift.x + gift.vx
                const nextVy = gift.vy + GRAVITY

                // 1. Check Obstacle Collision
                const hitObstacle = obstacles.find(obs =>
                    nextX + GIFT_SIZE > obs.x &&
                    nextX < obs.x + obs.width &&
                    nextY + GIFT_SIZE > obs.y &&
                    nextY < obs.y + obs.height
                );

                if (hitObstacle) {
                    // Poof!
                    addFloatingText(nextX, nextY, "POOF!", "#fff");
                    return { ...gift, active: false };
                }

                // 2. Check Chimney Collision (Target)
                // Chimneys are at BOTTOM. y coordinate is window.innerHeight - CHIMNEY_HEIGHT
                const chimneyY = window.innerHeight - CHIMNEY_HEIGHT;

                // If gift passes the top of the chimney AND is within X bounds
                if (nextY >= chimneyY && gift.y < chimneyY) { // Just crossed the threshold
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

                // 3. Ground Collision (Miss)
                if (nextY > window.innerHeight - 20) {
                    // Missed chimney, hit ground
                    if (!gift.landed) {
                        // SoundManager.playSplat() // if we had it here
                        addFloatingText(nextX, nextY, "Miss", "#aaa");
                    }
                    return { ...gift, landed: true, active: false }
                }

                // Remove if out of bounds (only X now, Y handled above)
                if (nextX < -100 || nextX > window.innerWidth + 100) {
                    return { ...gift, active: false }
                }

                return { ...gift, x: nextX, y: nextY, vy: nextVy }
            }).filter(g => g.active))

            // Move Entities
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
    const handlePointerDown = (e: React.PointerEvent) => {
        if (Date.now() - lastThrowTime.current < COOLDOWN) return
        setIsDragging(true)
        setDragStart({ x: e.clientX, y: e.clientY })
        setDragCurrent({ x: e.clientX, y: e.clientY })
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return
        setDragCurrent({ x: e.clientX, y: e.clientY })
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!isDragging) return
        setIsDragging(false)

        // Vector calculated from START to END (drag down to throw down? Or drag back like slingshot?)
        // Standard slingshot: Pull BACK (Up) to shoot FORWARD (Down).
        // Let's assume Drag UP = Throw DOWN.
        const dx = dragStart.x - e.clientX // Pulling left shoots right
        const dy = dragStart.y - e.clientY // Pulling up shoots down

        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return

        const vx = dx * 0.15
        const vy = dy * 0.15 // Positive Y is down

        // Enforce downward velocity for intuition if user drags wrong way? 
        // No, let physics allow upward throws (gravity will pull them down).

        const rand = Math.random()
        const type = rand > 0.9 ? 'blue' : (rand > 0.8 ? 'coal' : 'red')

        const newGift: Gift = {
            id: nextId.current++,
            x: window.innerWidth / 2 - GIFT_SIZE / 2,
            y: 80, // Start from Santa's hand at TOP
            vx,
            vy,
            type,
            active: true,
            landed: false
        }

        setGifts(prev => [...prev, newGift])
        lastThrowTime.current = Date.now()
    }

    return (
        <div
            className="game-area gift-toss"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            <div className="score-display">Punkte: {score}</div>
            <div className={`timer-display ${timeLeft < 10 ? 'timer-pulse' : ''}`}>
                ⏳ {timeLeft}
            </div>

            {/* Santa at Top */}
            <div className="santa-hand-top">🎅</div>

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

            {/* Sling Guide (Attached to Santa) */}
            {isDragging && (
                <svg className="sling-guide">
                    <line
                        x1={window.innerWidth / 2}
                        y1={100} // Start at Santa
                        x2={window.innerWidth / 2 + (dragStart.x - dragCurrent.x)}
                        y2={100 + (dragStart.y - dragCurrent.y)}
                        stroke="var(--warm-gold)"
                        strokeWidth="4"
                        strokeDasharray="5,5"
                    />
                </svg>
            )}
        </div>
    )
}

