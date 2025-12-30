import { memo, useMemo } from 'react'
import { useTheme } from './ThemeContext'
import { GAME_DEADLINE } from '@constants/gameConstants'

// Generate particles once outside component to avoid recalculation
// This leverages React 19.2's improved rendering performance
const generateParticles = (isEndgame: boolean, isGrinch: boolean) => {
    const colors = isGrinch
        ? ['#33ff33', '#00ff00', '#00cc00', '#00aa00']
        : ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']

    return Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        // Use negative delay to start the animation at a random point in its cycle
        delay: `-${Math.random() * 5}s`,
        duration: `${Math.random() * 3 + 4}s`,
        size: `${Math.random() * 1 + 0.5}rem`,
        opacity: Math.random(),
        color: isEndgame ? colors[Math.floor(Math.random() * colors.length)] : undefined,
        char: isEndgame && isGrinch ? String.fromCharCode(33 + Math.floor(Math.random() * 94)) : undefined,
    }))
}

const Snow = memo(() => {
    const { theme } = useTheme()
    const isGrinch = theme === 'grinch'

    // Check if we're in endgame phase (less than 2 days remaining)
    const now = new Date().getTime()
    const deadline = GAME_DEADLINE.getTime()
    const daysRemaining = Math.floor((deadline - now) / (1000 * 60 * 60 * 24))
    const isEndgame = daysRemaining < 2

    // Memoize particles array - recalculate when theme or endgame status changes
    // React 19.2's improved memoization handles this efficiently
    const particles = useMemo(() => generateParticles(isEndgame, isGrinch), [isEndgame, isGrinch])

    return (
        <div className="snow-overlay">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="snowflake"
                    style={{
                        left: particle.left,
                        animationDelay: particle.delay,
                        animationDuration: particle.duration,
                        fontSize: particle.size,
                        opacity: particle.opacity,
                        color: particle.color,
                    }}
                >
                    {isEndgame ? (isGrinch ? particle.char : '🎉') : '❄'}
                </div>
            ))}
        </div>
    )
})

// Add display name for React DevTools
Snow.displayName = 'Snow'

export default Snow
