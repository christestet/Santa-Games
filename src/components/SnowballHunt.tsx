import { useState, useEffect, useCallback, useRef } from 'react'

const API_URL = 'http://localhost:3001/api/scores';

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

interface SnowballHuntProps {
    onGameOver: (score: number, joke: string) => void;
    highScores: { name: string; score: number }[];
}

export default function SnowballHunt({ onGameOver, highScores }: SnowballHuntProps) {
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(30)
    const [targets, setTargets] = useState<{ id: number; x: number; y: number; type: 'gift' | 'coal' | 'gold' | 'time' | 'ice' }[]>([])
    const [combo, setCombo] = useState(0)
    const [shake, setShake] = useState(false)
    const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number; text: string; color: string }[]>([])
    const [particles, setParticles] = useState<{ id: number; x: number; y: number; tx: string; ty: string; type: string }[]>([])
    const [targetSize, setTargetSize] = useState(100)
    const [frozen, setFrozen] = useState(false)

    const nextTargetId = useRef(0)
    const nextTextId = useRef(0)
    const nextParticleId = useRef(0)
    const lastHitTime = useRef(0)

    useEffect(() => {
        const updateSize = () => {
            setTargetSize(window.innerWidth < 768 ? 70 : 100)
        }
        updateSize()
        window.addEventListener('resize', updateSize)
        return () => window.removeEventListener('resize', updateSize)
    }, [])

    const triggerShake = () => {
        setShake(true)
        setTimeout(() => setShake(false), 400)
    }

    const spawnParticles = (x: number, y: number) => {
        const newParticles: { id: number; x: number; y: number; tx: string; ty: string }[] = []
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * 360
            const dist = 50 + Math.random() * 50
            const tx = `${Math.cos(angle) * dist}px`
            const ty = `${Math.sin(angle) * dist}px`
            newParticles.push({ id: nextParticleId.current++, x, y, tx, ty })
        }
        setParticles(prev => [...prev, ...newParticles])
        setTimeout(() => {
            setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)))
        }, 600)
    }

    const addFloatingText = (x: number, y: number, text: string, color: string = 'white') => {
        const id = nextTextId.current++
        setFloatingTexts(prev => [...prev, { id, x, y, text, color }])
        setTimeout(() => {
            setFloatingTexts(prev => prev.filter(t => t.id !== id))
        }, 800)
    }

    const spawnTarget = useCallback(() => {
        const padding = 20
        const x = Math.random() * (window.innerWidth - targetSize - padding * 2) + padding
        const y = Math.random() * (window.innerHeight - targetSize - padding * 2) + padding

        const rand = Math.random()
        let type: 'gift' | 'coal' | 'gold' | 'time' | 'ice' = 'gift'

        // Spawn rates
        if (rand > 0.96) type = 'ice'
        else if (rand > 0.92) type = 'time'
        else if (rand > 0.85) type = 'gold'
        else if (rand > 0.70) type = 'coal'

        const newTarget = { id: nextTargetId.current++, x, y, type }
        setTargets(prev => [...prev, newTarget])

        const difficultyMod = Math.min(600, score)
        const timeout = Math.max(600, (1600 - difficultyMod) - (30 - timeLeft) * 10)

        setTimeout(() => {
            setTargets(prev => prev.filter(t => t.id !== newTarget.id))
        }, timeout)
    }, [timeLeft, targetSize, score])

    useEffect(() => {
        const difficultyMod = Math.min(300, Math.floor(score / 5))
        const spawnRate = Math.max(350, 600 - difficultyMod)

        const spawnInterval = setInterval(spawnTarget, spawnRate)

        const timerInterval = setInterval(() => {
            if (!frozen) {
                setTimeLeft(t => {
                    if (t <= 1) {
                        const joke = WEIHNACHTS_WITZE[Math.floor(Math.random() * WEIHNACHTS_WITZE.length)]
                        onGameOver(score, joke)
                        return 0
                    }
                    return t - 1
                })
            }
        }, 1000)

        return () => {
            clearInterval(spawnInterval)
            clearInterval(timerInterval)
        }
    }, [spawnTarget, frozen, score, onGameOver])

    const handleHit = (id: number, type: 'gift' | 'coal' | 'gold' | 'time' | 'ice', x: number, y: number) => {
        if (navigator.vibrate) navigator.vibrate(10);

        const now = Date.now()
        spawnParticles(x, y)

        const diff = now - lastHitTime.current
        lastHitTime.current = now

        let newCombo = combo
        if (type !== 'coal') {
            if (diff < 1000) {
                newCombo += 1
            } else {
                newCombo = 1
            }
        } else {
            newCombo = 0
            if (navigator.vibrate) navigator.vibrate(200);
        }
        setCombo(newCombo)

        let points = 0
        let color = '#fff'
        let text = ""

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
                if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
                break
            case 'coal':
                points = -30
                text = SPRUECHE[Math.floor(Math.random() * SPRUECHE.length)]
                color = '#555'
                triggerShake()
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
            setScore(s => Math.max(0, s + points))
        }

        addFloatingText(x, y, text, color)
        setTargets(prev => prev.filter(t => t.id !== id))
    }

    return (
        <div className={`game-area ${shake ? 'shake' : ''}`}>
            {frozen && <div className="frozen-overlay"></div>}

            {particles.map(p => (
                <div
                    key={p.id}
                    className="particle"
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

            <div className="score-display">Punkte: {score}</div>
            <div className={`timer-display ${timeLeft < 10 ? 'timer-pulse' : ''}`}>
                {frozen ? '❄️' : '⏳'} {timeLeft}
            </div>
            {combo > 1 && <div className={`combo-display ${combo > 5 ? 'combo-shake' : ''}`}>COMBO x{combo} 🔥</div>}

            {targets.map(target => (
                <div
                    key={target.id}
                    className="target"
                    style={{
                        left: target.x,
                        top: target.y,
                        width: targetSize,
                        height: targetSize,
                    }}
                    onPointerDown={(e) => handleHit(target.id, target.type, e.clientX, e.clientY)}
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
        </div>
    )
}
