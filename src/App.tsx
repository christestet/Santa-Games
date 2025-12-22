import { useState, useCallback, useEffect } from 'react'
import Snow from './components/Snow'
import SnowballHunt from './components/SnowballHunt'
import GiftToss from './components/GiftToss'
import GameSettings from './components/GameSettings'
import GameCard from './components/GameCard'
import Leaderboard from './components/Leaderboard'
import { GAME_CONFIG } from './constants/gameConfig'
import { useHighScores } from './hooks/useHighScores'

type GameType = 'snowball' | 'gift-toss' | 'none';

function App() {
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'name-entry' | 'gameover'>('menu')
    const [currentGame, setCurrentGame] = useState<GameType>('none')
    const [score, setScore] = useState(0)
    const [currentJoke, setCurrentJoke] = useState("")
    const [playerName, setPlayerName] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [settings, setSettings] = useState(GAME_CONFIG)
    const [showSettings, setShowSettings] = useState(false)

    const { highScores, isLoading, error, fetchScores, submitScore: apiSubmitScore } = useHighScores();

    const handleGameOver = useCallback((finalScore: number, joke: string) => {
        setScore(finalScore)
        setCurrentJoke(joke)
        setGameState('name-entry')
    }, [])

    const submitScore = async () => {
        if (!playerName.trim() || isSubmitting) return;
        setIsSubmitting(true);
        const success = await apiSubmitScore(playerName, score);
        if (success) {
            setGameState('gameover');
        }
        setIsSubmitting(false);
    };

    const startGame = useCallback((game: GameType) => {
        setCurrentGame(game)
        setScore(0)
        setPlayerName("")
        setGameState('playing')
    }, [])

    return (
        <div className="game-container">
            <Snow />

            {gameState === 'menu' && (
                <div style={{ textAlign: 'center', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90%' }}>
                    <h1>Fröhliche Spiele 🎅</h1>

                    <div className="game-selection">
                        <GameCard
                            title="Schneeball-Jagd"
                            icon="❄️"
                            instructions="Tippe auf Geschenke und Sterne, um Punkte zu sammeln. Vermeide die Kohle! Nutze Eis für einen Freeze oder Uhren für mehr Zeit."
                            onPlay={() => startGame('snowball')}
                        />
                        <GameCard
                            title="Geschenke Weitwurf"
                            icon="🎁"
                            instructions="Tippe, um Geschenke abzuwerfen. Ziele genau in die Schornsteine! Achte auf Hindernisse wie Flugzeuge und Wolken."
                            onPlay={() => startGame('gift-toss')}
                        />
                    </div>

                    <button className="btn-small" onClick={() => setShowSettings(true)} style={{ marginTop: '1rem' }}>
                        ⚙️ EINSTELLUNGEN
                    </button>

                    {showSettings && (
                        <GameSettings
                            settings={settings}
                            onUpdate={setSettings}
                            onClose={() => setShowSettings(false)}
                        />
                    )}

                    <div style={{ marginTop: '2rem' }}>
                        <Leaderboard
                            scores={highScores}
                            isLoading={isLoading}
                            error={error}
                            onRetry={fetchScores}
                        />
                    </div>
                </div>
            )}

            {gameState === 'playing' && (
                <>
                    {currentGame === 'snowball' && (
                        <SnowballHunt onGameOver={handleGameOver} highScores={highScores} settings={settings} />
                    )}
                    {currentGame === 'gift-toss' && (
                        <GiftToss onGameOver={handleGameOver} settings={settings} />
                    )}
                </>
            )}

            {gameState === 'name-entry' && (
                <div style={{ textAlign: 'center', zIndex: 10, width: '90%' }}>
                    <h1 className="glow-text">NEUER HIGHSCORE! 🎮</h1>
                    <p style={{ fontSize: '1.5rem' }}>Dein Score: {score}</p>
                    {error && (
                        <div style={{
                            background: 'rgba(255, 107, 107, 0.2)',
                            border: '2px solid #ff6b6b',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '1rem',
                            color: '#ff6b6b'
                        }}>
                            {error}
                        </div>
                    )}
                    <input
                        className="arcade-input"
                        maxLength={10}
                        placeholder="NAME EINGEBEN"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                        autoFocus
                        disabled={isSubmitting}
                    />
                    <br />
                    <button
                        className="btn-start"
                        onPointerDown={submitScore}
                        disabled={!playerName.trim() || isSubmitting}
                        style={{ opacity: isSubmitting ? 0.6 : 1 }}
                    >
                        {isSubmitting ? 'WIRD GESPEICHERT...' : 'EINTRAGEN'}
                    </button>
                </div>
            )}

            {gameState === 'gameover' && (
                <div style={{ textAlign: 'center', zIndex: 10, padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <h1 style={{ fontSize: window.innerWidth < 768 ? '3rem' : '4rem', marginBottom: '0.5rem' }}>FERTIG! 🎁</h1>

                    <Leaderboard
                        scores={highScores}
                        isLoading={isLoading}
                    />

                    <div className="joke-card frost-card">
                        <h2 style={{ fontFamily: 'var(--font-festive)', color: 'var(--warm-gold)', margin: '0', fontSize: '1.5rem' }}>Weihnachtswitz:</h2>
                        <p style={{ fontSize: '1rem', fontStyle: 'italic' }}>"{currentJoke}"</p>
                    </div>

                    <button className="btn-start" onPointerDown={() => setGameState('menu')}>ZUM HAUPTMENÜ</button>
                </div>
            )}
        </div>
    )
}

export default App
