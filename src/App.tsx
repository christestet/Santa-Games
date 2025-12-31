import { lazy, Suspense } from 'react'
import Snow from '@components/Snow'
import GameCard from '@components/GameCard'
import Countdown from '@components/Countdown'
import { Button } from '@components/ui/Button'
import { Modal } from '@components/ui/Modal'
import { Card } from '@components/ui/Card'
import { useLanguage } from '@components/LanguageContext'
import { useTheme } from '@components/ThemeContext'
import { useGame } from '@/context/GameContext'
import GameIcon from '@components/GameIcon'
import { GAME_DEADLINE, isGamePlayable } from '@constants/gameConstants'
import pkg from '@/../package.json'

// Lazy load game components for code-splitting
const SnowballHunt = lazy(() => import('@components/SnowballHunt'))
const GiftToss = lazy(() => import('@components/GiftToss'))
const ReindeerRun = lazy(() => import('@components/ReindeerRun'))
const GameSettings = lazy(() => import('@components/GameSettings'))
const Leaderboard = lazy(() => import('@components/Leaderboard'))

const App: React.FC = () => {
    const { t, language, setLanguage } = useLanguage()
    const { theme, toggleTheme } = useTheme()

    const {
        gameState,
        currentGame,
        score,
        currentJoke,
        playerName,
        isPaused,
        settings,
        showSettings,
        highScores,
        isLoadingScores,
        scoreError,
        isSubmittingScore,
        lastPlayedTime,
        gameKey,
        startGame,
        endGame,
        pauseGame,
        resumeGame,
        quitGame,
        updateSettings,
        toggleSettings,
        setPlayerName,
        submitScore,
        fetchScores
    } = useGame()

    const gamesPlayable = isGamePlayable()

    // Check if we're in endgame phase (less than 2 days remaining)
    const now = new Date().getTime()
    const deadline = GAME_DEADLINE.getTime()
    const daysRemaining = Math.floor((deadline - now) / (1000 * 60 * 60 * 24))
    const isEndgame = daysRemaining < 2 && gamesPlayable

    return (
        <div className="game-container">
            {/* Snow animation only in menu for festive effect, removed during gameplay for performance */}
            {gameState === 'menu' && <Snow />}

            {gameState === 'menu' && (
                <div className="menu-container">
                    <div className="top-bar">
                        <Button
                            variant="icon"
                            onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
                        >
                            {language === 'de' ? <GameIcon name="flag_us" size={24} /> : <GameIcon name="flag_de" size={24} />}
                        </Button>
                        <Button
                            variant="icon"
                            onClick={() => toggleSettings(true)}
                        >
                            <GameIcon name="settings" size={24} />
                        </Button>
                        <Button
                            variant="icon"
                            onClick={toggleTheme}
                        >
                            {theme === 'classic' ? <GameIcon name="santa" size={24} /> : <GameIcon name="grinch" size={24} />}
                        </Button>
                    </div>

                    <div className="w-full flex justify-center">
                        <h1 className="text-center relative inline-block">
                            {theme === 'grinch' ? (
                                <>
                                    {t('menu.grinchTitle')}
                                </>
                            ) : t('menu.title')}
                            {isEndgame && (
                                <span className="finale-badge">
                                    {t('menu.finaleBadge')}
                                </span>
                            )}
                        </h1>
                    </div>

                    {gamesPlayable && (
                        <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                            <Countdown targetDate={GAME_DEADLINE} />
                        </div>
                    )}

                    {!gamesPlayable && (
                        <Card className="frost-card" style={{
                            maxWidth: '600px',
                            margin: '0 auto 2rem',
                            textAlign: 'center',
                            padding: '1.5rem'
                        }}>
                            <h2 style={{
                                fontFamily: 'var(--font-retro)',
                                color: 'var(--primary-color)',
                                marginBottom: '1rem',
                                fontSize: 'clamp(1.2rem, 4vw, 1.8rem)'
                            }}>
                                {t('game.gameEndedTitle')}
                            </h2>
                            <p style={{
                                fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                                lineHeight: '1.6',
                                opacity: 0.9
                            }}>
                                {t('game.gameEndedMessage')}
                            </p>
                        </Card>
                    )}

                    <div className="game-selection">
                        <GameCard
                            title={t('menu.snowballTitle')}
                            icon={<GameIcon name={gamesPlayable ? "snowflake" : "melting_snowflake"} size={64} />}
                            instructions={t('menu.snowballDesc')}
                            onPlay={() => startGame('snowball')}
                            disabled={!gamesPlayable}
                        />
                        <GameCard
                            title={t('menu.giftTitle')}
                            icon={<GameIcon name={gamesPlayable ? "gift" : "return_parcel"} size={64} />}
                            instructions={t('menu.giftDesc')}
                            onPlay={() => startGame('gift-toss')}
                            disabled={!gamesPlayable}
                        />
                        {/* Reindeer Run - temporarily hidden (not ready yet) */}
                        {/* <GameCard
                            title={t('menu.runnerTitle')}
                            icon={<GameIcon name="reindeer" size={64} />}
                            instructions={t('menu.runnerDesc')}
                            onPlay={() => startGame('reindeer-run')}
                            disabled={!gamesPlayable}
                        /> */}
                    </div>



                    {showSettings && (
                        <Suspense fallback={<div className="loading-settings">{t('common.loading') || 'Loading...'}</div>}>
                            <GameSettings
                                settings={settings}
                                onUpdate={updateSettings}
                                onClose={() => toggleSettings(false)}
                            />
                        </Suspense>
                    )}

                    <div style={{
                        marginTop: '2rem',
                        width: '100%'
                    }}>
                        <Suspense fallback={<div className="loading-leaderboard">{t('common.loading') || 'Loading...'}</div>}>
                            <Leaderboard
                                scores={highScores}
                                isLoading={isLoadingScores}
                                error={scoreError}
                                onRetry={fetchScores}
                                defaultTime={lastPlayedTime}
                            />
                        </Suspense>
                    </div>

                    <div className="flex flex-col gap-4 items-center mt-8 mb-4">
                        <span style={{ fontSize: '0.875rem' }}>{t('menu.githubHelp')}</span>
                        <span style={{ fontSize: '0.875rem' }}>{t('menu.githubVisit')}</span>
                        <div className="version-tag" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.4rem 0.6rem'
                        }}>
                            <a
                                href="https://github.com/christestet/Santa-Games"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="github-link"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0.8,
                                    transition: 'opacity 0.2s, transform 0.1s',
                                    cursor: 'pointer',
                                    lineHeight: 0,
                                    minWidth: '24px',
                                    minHeight: '24px',
                                    padding: '2px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                                onPointerDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                                onPointerUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                <span className="github-version">v{pkg.version}</span>
                                <GameIcon name="github" size={16} />
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {gameState === 'playing' && (
                <>
                    <Suspense fallback={<div className="loading-game">{t('common.loading') || 'Loading...'}</div>}>
                        {currentGame === 'snowball' && (
                            <SnowballHunt
                                key={gameKey}
                                onGameOver={endGame}
                                highScores={highScores}
                                settings={settings}
                                isPaused={isPaused}
                                onPause={pauseGame}
                                isEndgame={isEndgame}
                            />
                        )}
                        {currentGame === 'gift-toss' && (
                            <GiftToss
                                key={gameKey}
                                onGameOver={endGame}
                                settings={settings}
                                isPaused={isPaused}
                                onPause={pauseGame}
                                isEndgame={isEndgame}
                            />
                        )}
                        {currentGame === 'reindeer-run' && (
                            <ReindeerRun
                                key={gameKey}
                                onGameOver={endGame}
                                settings={settings}
                                isPaused={isPaused}
                                onPause={pauseGame}
                            />
                        )}
                    </Suspense>

                    {isPaused && (
                        <Modal isOpen={true} title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{t('common.pause')} <GameIcon name="timer" size={24} /></div>}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', alignItems: 'center' }}>
                                <Button onClick={resumeGame} style={{ width: '100%' }}>{t('common.continue')}</Button>
                                <Button variant="secondary" onClick={quitGame} style={{ width: '100%', border: '2px solid #ff6b6b', color: '#ff6b6b' }}>{t('common.exit')}</Button>
                            </div>
                        </Modal>
                    )}
                </>
            )}

            {gameState === 'name-entry' && (
                <Modal isOpen={true} title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{t('game.newHighScore')} <GameIcon name="trophy" size={24} /></div>}>
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <p style={{ fontSize: '1.5rem', margin: '1rem 0' }}>{t('game.yourScore')}: {score}</p>
                        {scoreError && (
                            <div style={{
                                background: 'rgba(255, 107, 107, 0.2)',
                                border: '2px solid #ff6b6b',
                                borderRadius: '8px',
                                padding: '1rem',
                                marginBottom: '1rem',
                                color: '#ff6b6b'
                            }}>
                                {scoreError === 'submit' ? t('hooks.submitError') : t('hooks.fetchError')}
                            </div>
                        )}
                        <input
                            className="arcade-input"
                            maxLength={15}
                            placeholder={t('game.enterName')}
                            value={playerName}
                            onChange={(e) => {
                                const val = e.target.value.toUpperCase().replace(/[^A-Z0-9\s._-]/g, "");
                                setPlayerName(val);
                            }}
                            autoFocus
                            disabled={isSubmittingScore}
                            style={{
                                fontSize: '2rem'
                            }}
                        />
                        <br />
                        <Button
                            onPointerDown={submitScore}
                            disabled={!playerName.trim() || isSubmittingScore}
                            style={{ opacity: isSubmittingScore ? 0.6 : 1, marginTop: '1rem' }}
                        >
                            {isSubmittingScore ? t('common.saving') : t('common.submit')}
                        </Button>
                    </div>
                </Modal>
            )}

            {gameState === 'gameover' && (
                <Modal isOpen={true} title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{t('game.finished')} <GameIcon name="gift" size={24} /></div>}>
                    <div style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <Card className="joke-card" style={{ width: '100%' }}>
                            <h2 style={{ fontFamily: 'var(--font-retro)', color: 'var(--primary-color)', margin: '0', fontSize: '1.5rem' }}>{t('game.jokeTitle')}</h2>
                            <p style={{ fontSize: '1rem', fontStyle: 'italic' }}>"{currentJoke}"</p>
                        </Card>

                        <Button
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                quitGame();
                            }}
                        >
                            {t('game.toMenu')}
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    )
}

export default App
