import { memo, useMemo } from 'react'

// Generate snowflakes once outside component to avoid recalculation
// This leverages React 19.2's improved rendering performance
const generateSnowflakes = () =>
    Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        // Use negative delay to start the animation at a random point in its cycle
        delay: `-${Math.random() * 5}s`,
        duration: `${Math.random() * 3 + 4}s`,
        size: `${Math.random() * 1 + 0.5}rem`,
        opacity: Math.random(),
    }))

const Snow = memo(() => {
    // Memoize snowflakes array - only calculate once per component instance
    // React 19.2's improved memoization handles this efficiently
    const snowflakes = useMemo(() => generateSnowflakes(), [])

    return (
        <div className="snow-overlay">
            {snowflakes.map((flake) => (
                <div
                    key={flake.id}
                    className="snowflake"
                    style={{
                        left: flake.left,
                        animationDelay: flake.delay,
                        animationDuration: flake.duration,
                        fontSize: flake.size,
                        opacity: flake.opacity,
                    }}
                >
                    ❄
                </div>
            ))}
        </div>
    )
})

// Add display name for React DevTools
Snow.displayName = 'Snow'

export default Snow
