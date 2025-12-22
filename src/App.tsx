import { useState, useCallback, useEffect } from 'react'
import Snow from './components/Snow'
import SnowballHunt from './components/SnowballHunt'
import GiftToss from './components/GiftToss'
import GameSettings from './components/GameSettings'
import GameCard from './components/GameCard'
import Leaderboard from './components/Leaderboard'
import { Button } from './components/ui/Button'
import { Modal } from './components/ui/Modal'
import { Card } from './components/ui/Card'
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

    const [isPaused, setIsPaused] = useState(false)

    const handleGameOver = useCallback((finalScore: number, joke: string) => {
        setScore(finalScore)
        setCurrentJoke(joke)
        setGameState('name-entry')
        setIsPaused(false)
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
        setIsPaused(false)
    }, [])

    const handlePause = useCallback(() => setIsPaused(true), [])
    const handleResume = useCallback(() => setIsPaused(false), [])
    const handleQuit = useCallback(() => {
        setIsPaused(false)
        setGameState('menu')
    }, [])
    const handleRestart = useCallback(() => {
        setIsPaused(false)
        startGame(currentGame)
    }, [currentGame, startGame])

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

                    <Button variant="icon" onClick={() => setShowSettings(true)} style={{ marginTop: '1rem' }}>
                        ⚙️ EINSTELLUNGEN
                    </Button>

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
                        <SnowballHunt
                            onGameOver={handleGameOver}
                            highScores={highScores}
                            settings={settings}
                            isPaused={isPaused}
                            onPause={handlePause}
                        />
                    )}
                    {currentGame === 'gift-toss' && (
                        <GiftToss
                            onGameOver={handleGameOver}
                            settings={settings}
                            isPaused={isPaused}
                            onPause={handlePause}
                        />
                    )}

                    {isPaused && (
                        <Modal isOpen={true} title="PAUSE ⏸️">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', alignItems: 'center' }}>
                                <Button onClick={handleResume} style={{ width: '100%' }}>WEITER</Button>
                                <Button variant="secondary" onClick={handleRestart} style={{ width: '100%' }}>NEUSTART</Button>
                                <Button variant="secondary" onClick={handleQuit} style={{ width: '100%', border: '2px solid #ff6b6b', color: '#ff6b6b' }}>BEENDEN</Button>
                            </div>
                        </Modal>
                    )}
                </>
            )}

            {gameState === 'name-entry' && (
                <Modal isOpen={true} title="NEUER HIGHSCORE! 🎮">
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <p style={{ fontSize: '1.5rem', margin: '1rem 0' }}>Dein Score: {score}</p>
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
                            maxLength={15}
                            placeholder="NAME EINGEBEN"
                            value={playerName}
                            onChange={(e) => {
                                const val = e.target.value.toUpperCase().replace(/[^A-Z0-9\s._-]/g, "");
                                setPlayerName(val);
                            }}
                            autoFocus
                            disabled={isSubmitting}
                        />
                        <br />
                        <Button
                            onPointerDown={submitScore}
                            disabled={!playerName.trim() || isSubmitting}
                            style={{ opacity: isSubmitting ? 0.6 : 1, marginTop: '1rem' }}
                        >
                            {isSubmitting ? 'WIRD GESPEICHERT...' : 'EINTRAGEN'}
                        </Button>
                    </div>
                </Modal>
            )}

            {gameState === 'gameover' && (
                <Modal isOpen={true} title="FERTIG! 🎁">
                    <div style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <Leaderboard
                            scores={highScores}
                            isLoading={isLoading}
                        />

                        <Card className="joke-card" style={{ width: '100%' }}>
                            <h2 style={{ fontFamily: 'var(--font-festive)', color: 'var(--warm-gold)', margin: '0', fontSize: '1.5rem' }}>Weihnachtswitz:</h2>
                            <p style={{ fontSize: '1rem', fontStyle: 'italic' }}>"{currentJoke}"</p>
                        </Card>

                        <Button onPointerDown={() => setGameState('menu')}>ZUM HAUPTMENÜ</Button>
                    </div>
                </Modal>
            )}
        </div>
    )
}

export default App
