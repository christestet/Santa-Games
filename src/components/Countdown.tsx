import { useState, useEffect } from 'react'
import { useLanguage } from './LanguageContext'

interface CountdownProps {
    targetDate: Date
}

interface TimeRemaining {
    days: number
    hours: number
    minutes: number
    seconds: number
    total: number
}

const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
    const { t } = useLanguage()

    const calculateTimeRemaining = (): TimeRemaining => {
        const now = new Date().getTime()
        const target = targetDate.getTime()
        const total = target - now

        if (total <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
        }

        const seconds = Math.floor((total / 1000) % 60)
        const minutes = Math.floor((total / 1000 / 60) % 60)
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
        const days = Math.floor(total / (1000 * 60 * 60 * 24))

        return { days, hours, minutes, seconds, total }
    }

    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(calculateTimeRemaining())

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(calculateTimeRemaining())
        }, 1000)

        return () => clearInterval(timer)
    }, [targetDate])

    if (timeRemaining.total <= 0) {
        return (
            <div className="text-center" style={{
                fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                opacity: 0.8,
                fontWeight: 'bold'
            }}>
                {t('game.gameEnded')}
            </div>
        )
    }

    const pad = (num: number) => String(num).padStart(2, '0')

    // Check if we're in endgame phase (less than 2 days remaining)
    const isEndgame = timeRemaining.days < 2

    return (
        <div className={`flex flex-col gap-2 text-center ${isEndgame ? 'opacity-100' : 'opacity-90'}`} style={{
            padding: 'clamp(0.75rem, 2vw, 1rem)',
            borderRadius: '8px',
            background: isEndgame ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
            border: isEndgame ? '2px solid rgba(255, 0, 0, 0.3)' : '2px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '500px',
            margin: '0 auto'
        }}>
            <div style={{
                fontSize: 'clamp(1rem, 3vw, 1.3rem)',
                fontWeight: 'bold',
                fontFamily: 'var(--font-retro)',
                color: isEndgame ? '#ff0000' : 'var(--text-main)'
            }}>
                {t('game.playableUntil')}
            </div>
            <div className={`font-mono tracking-wider ${isEndgame ? 'countdown-pulse' : ''}`} style={{
                fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
                fontWeight: 'bold',
                color: isEndgame ? '#ff0000' : 'var(--accent-color)',
                letterSpacing: '0.1em'
            }}>
                {timeRemaining.days}d {pad(timeRemaining.hours)}h {pad(timeRemaining.minutes)}m {pad(timeRemaining.seconds)}s
            </div>
        </div>
    )
}

export default Countdown
