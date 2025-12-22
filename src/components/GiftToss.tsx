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

interface GiftTossProps {
    onGameOver: (score: number, joke: string) => void;
}

export default function GiftToss({ onGameOver }: GiftTossProps) {
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(30)
    const [gifts, setGifts] = useState<Gift[]>([])
    const [chimneys, setChimneys] = useState<Chimney[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [dragCurrent, setDragCurrent] = useState({ x: 0, y: 0 })
    const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number; text: string; color: string }[]>([])

    const nextId = useRef(0)
    const requestRef = useRef<number | null>(null)
    const lastTimeRef = useRef<number | null>(null)

    // Game constants
    const GRAVITY = 0.5
    const GIFT_SIZE = 50
    const CHIMNEY_HEIGHT = 100
    const COOLDOWN = 500
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
        const x = Math.random() > 0.5 ? -width : window.innerWidth
        const speed = (2 + Math.random() * 3) * (x < 0 ? 1 : -1)

        const newChimney = { id, x, speed, width }
        setChimneys(prev => [...prev, newChimney])
    }, [])

    useEffect(() => {
        const chimneyInterval = setInterval(spawnChimney, 2000)
        const timerInterval = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    onGameOver(score, "Super Wurf! Du hast fast alle Schornsteine getroffen!")
                    return 0
                }
                return t - 1
            })
        }, 1000)

        // Initial chimney
        spawnChimney()

        return () => {
            clearInterval(chimneyInterval)
            clearInterval(timerInterval)
        }
    }, [spawnChimney, onGameOver, score])

    const update = (time: number) => {
        if (lastTimeRef.current !== undefined) {
            const dt = 1 // Simplified delta

            setGifts(prev => prev.map(gift => {
                if (!gift.active || gift.landed) return gift

                const nextY = gift.y + gift.vy
                const nextX = gift.x + gift.vx
                const nextVy = gift.vy + GRAVITY

                // Check collision with chimneys
                const hitChimney = chimneys.find(c =>
                    nextY < CHIMNEY_HEIGHT + 20 &&
                    gift.y >= CHIMNEY_HEIGHT + 20 &&
                    nextX + GIFT_SIZE / 2 > c.x &&
                    nextX + GIFT_SIZE / 2 < c.x + c.width
                )

                if (hitChimney) {
                    let pts = gift.type === 'coal' ? -20 : 15
                    if (gift.type === 'blue') pts = 30
                    setScore(s => Math.max(0, s + pts))
                    addFloatingText(nextX, nextY, pts > 0 ? `+${pts}` : pts.toString(), pts > 0 ? 'var(--warm-gold)' : '#555')
                    if (navigator.vibrate) navigator.vibrate(20);
                    return { ...gift, landed: true, active: false }
                }

                // Remove if out of bounds
                if (nextY > window.innerHeight || nextX < -100 || nextX > window.innerWidth + 100) {
                    return { ...gift, active: false }
                }

                return { ...gift, x: nextX, y: nextY, vy: nextVy }
            }).filter(g => g.active))

            setChimneys(prev => prev.map(c => ({
                ...c,
                x: c.x + c.speed
            })).filter(c => c.x > -200 && c.x < window.innerWidth + 200))
        }
        lastTimeRef.current = time
        requestRef.current = requestAnimationFrame(update)
    }

    useEffect(() => {
        requestRef.current = requestAnimationFrame(update)
        return () => cancelAnimationFrame(requestRef.current!)
    }, [chimneys])

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

        const dx = dragStart.x - e.clientX
        const dy = dragStart.y - e.clientY

        // Only throw if there's enough pull
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return

        const vx = dx * 0.15
        const vy = dy * 0.15

        const rand = Math.random()
        const type = rand > 0.9 ? 'blue' : (rand > 0.7 ? 'coal' : 'red')

        const newGift: Gift = {
            id: nextId.current++,
            x: window.innerWidth / 2 - GIFT_SIZE / 2,
            y: window.innerHeight - 100,
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

            {/* Chimneys */}
            {chimneys.map(c => (
                <div
                    key={c.id}
                    className="chimney"
                    style={{ left: c.x, width: c.width, height: CHIMNEY_HEIGHT }}
                >
                    <div className="chimney-top"></div>
                    <div className="chimney-smoke"></div>
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

            {floatingTexts.map(t => (
                <div
                    key={t.id}
                    className="floating-text"
                    style={{ left: t.x, top: t.y, color: t.color, fontSize: '2rem' }}
                >
                    {t.text}
                </div>
            ))}

            {/* Sling Guide */}
            {isDragging && (
                <svg className="sling-guide">
                    <line
                        x1={window.innerWidth / 2}
                        y1={window.innerHeight - 80}
                        x2={window.innerWidth / 2 + (dragStart.x - dragCurrent.x)}
                        y2={window.innerHeight - 80 + (dragStart.y - dragCurrent.y)}
                        stroke="var(--warm-gold)"
                        strokeWidth="4"
                        strokeDasharray="5,5"
                    />
                </svg>
            )}

            <div className="santa-hand">🎅</div>
        </div>
    )
}
