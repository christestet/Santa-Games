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
            <div className="text-center text-xs opacity-70">
                {t('game.gameEnded')}
            </div>
        )
    }

    const pad = (num: number) => String(num).padStart(2, '0')

    // Check if we're in endgame phase (less than 2 days remaining)
    const isEndgame = timeRemaining.days < 2

    return (
        <div className={`flex flex-col gap-1 text-center text-xs ${isEndgame ? 'opacity-100' : 'opacity-70'}`}>
            <div>{t('game.playableUntil')}</div>
            <div className={`font-mono text-sm tracking-wider ${isEndgame ? 'text-[#ff0000] countdown-pulse' : ''}`}>
                {timeRemaining.days}d {pad(timeRemaining.hours)}h {pad(timeRemaining.minutes)}m {pad(timeRemaining.seconds)}s
            </div>
        </div>
    )
}

export default Countdown
