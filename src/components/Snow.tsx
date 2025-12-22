import { useEffect, useState } from 'react'

const Snow = () => {
    const [snowflakes, setSnowflakes] = useState<any[]>([])

    useEffect(() => {
        const flakes = Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 5}s`,
            duration: `${Math.random() * 3 + 4}s`,
            size: `${Math.random() * 1 + 0.5}rem`,
            opacity: Math.random(),
        }))
        setSnowflakes(flakes)
    }, [])

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
}

export default Snow
