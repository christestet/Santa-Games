import { useState, useEffect } from 'react'
import Snow from './components/Snow'
import SnowballHunt from './components/SnowballHunt'
import GiftToss from './components/GiftToss'
import { config } from './config';

type GameType = 'snowball' | 'gift-toss' | 'none';

function App() {
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'name-entry' | 'gameover'>('menu')
    const [currentGame, setCurrentGame] = useState<GameType>('none')
    const [score, setScore] = useState(0)
    const [currentJoke, setCurrentJoke] = useState("")
    const [highScores, setHighScores] = useState<{ name: string; score: number }[]>([])
    const [playerName, setPlayerName] = useState("")
    const [isLoadingScores, setIsLoadingScores] = useState(false)
    const [apiError, setApiError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchScores = async () => {
        setIsLoadingScores(true);
        setApiError(null);
        try {
            const res = await fetch(config.apiUrl);
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setHighScores(data);
            } else {
                setHighScores([]);
            }
        } catch (e) {
            console.error("Failed to fetch scores", e);
            setApiError("Bestenliste konnte nicht geladen werden");
            setHighScores([]);
        } finally {
            setIsLoadingScores(false);
        }
    };

    useEffect(() => {
        fetchScores();
    }, []);

    const handleGameOver = (finalScore: number, joke: string) => {
        setScore(finalScore)
        setCurrentJoke(joke)
        setGameState('name-entry')
    }

    const submitScore = async () => {
        if (!playerName.trim() || isSubmitting) return;
        setIsSubmitting(true);
        setApiError(null);
        try {
            const res = await fetch(config.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: playerName, score })
            });
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            await fetchScores();
            setGameState('gameover');
        } catch (e) {
            console.error("Submission failed", e);
            setApiError("Score konnte nicht gespeichert werden. Versuche es erneut.");
            setIsSubmitting(false);
            return;
        }
        setIsSubmitting(false);
    };

    const startGame = (game: GameType) => {
        setCurrentGame(game)
        setScore(0)
        setPlayerName("")
        setGameState('playing')
    }

    return (
        <div className="game-container">
            <Snow />

            {gameState === 'menu' && (
                <div style={{ textAlign: 'center', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90%' }}>
                    <h1>Fröhliche Spiele 🎅</h1>

                    <div className="game-selection">
                        <div className="game-card frost-card" onClick={() => startGame('snowball')}>
                            <span className="game-icon">❄️</span>
                            <h3>Schneeball-Jagd</h3>
                            <button className="btn-small">SPIELEN</button>
                        </div>
                        <div className="game-card frost-card" onClick={() => startGame('gift-toss')}>
                            <span className="game-icon">🎁</span>
                            <h3>Geschenke Weitwurf</h3>
                            <button className="btn-small">SPIELEN</button>
                        </div>
                    </div>

                    <div className="leaderboard frost-card" style={{ marginTop: '2rem' }}>
                        <h2>🏆 Bestenliste</h2>
                        {isLoadingScores ? (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>
                                <div className="spinner">⏳</div>
                                <p>Laden...</p>
                            </div>
                        ) : apiError ? (
                            <div style={{ padding: '1rem', color: '#ff6b6b' }}>
                                <p>{apiError}</p>
                                <button className="btn-small" onClick={fetchScores} style={{ marginTop: '0.5rem' }}>
                                    Erneut versuchen
                                </button>
                            </div>
                        ) : highScores.length === 0 ? (
                            <p style={{ padding: '1rem', opacity: 0.7 }}>Noch keine Scores</p>
                        ) : (
                            highScores.slice(0, 5).map((s, i) => (
                                <div key={i} className="score-row">
                                    <span>{i + 1}. {s.name}</span>
                                    <span style={{ color: 'var(--christmas-gold)' }}>{s.score}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {gameState === 'playing' && (
                <>
                    {currentGame === 'snowball' && (
                        <SnowballHunt onGameOver={handleGameOver} highScores={highScores} />
                    )}
                    {currentGame === 'gift-toss' && (
                        <GiftToss onGameOver={handleGameOver} />
                    )}
                </>
            )}

            {gameState === 'name-entry' && (
                <div style={{ textAlign: 'center', zIndex: 10, width: '90%' }}>
                    <h1 className="glow-text">NEUER HIGHSCORE! 🎮</h1>
                    <p style={{ fontSize: '1.5rem' }}>Dein Score: {score}</p>
                    {apiError && (
                        <div style={{
                            background: 'rgba(255, 107, 107, 0.2)',
                            border: '2px solid #ff6b6b',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '1rem',
                            color: '#ff6b6b'
                        }}>
                            {apiError}
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

                    <div className="leaderboard frost-card">
                        <h2>🏆 Bestenliste</h2>
                        {isLoadingScores ? (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>
                                <div className="spinner">⏳</div>
                                <p>Laden...</p>
                            </div>
                        ) : highScores.length === 0 ? (
                            <p style={{ padding: '1rem', opacity: 0.7 }}>Noch keine Scores</p>
                        ) : (
                            highScores.slice(0, 5).map((s, i) => (
                                <div key={i} className="score-row">
                                    <span>{i + 1}. {s.name}</span>
                                    <span style={{ color: 'var(--christmas-gold)' }}>{s.score}</span>
                                </div>
                            ))
                        )}
                    </div>

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
