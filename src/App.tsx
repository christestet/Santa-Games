import Snow from '@components/Snow'
import SnowballHunt from '@components/SnowballHunt'
import GiftToss from '@components/GiftToss'
import ReindeerRun from '@components/ReindeerRun'
import GameSettings from '@components/GameSettings'
import GameCard from '@components/GameCard'
import Leaderboard from '@components/Leaderboard'
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
        startGame,
        endGame,
        pauseGame,
        resumeGame,
        restartGame,
        quitGame,
        updateSettings,
        toggleSettings,
        setPlayerName,
        submitScore,
        fetchScores
    } = useGame()

    const gamesPlayable = isGamePlayable()

    return (
        <div className="game-container">
            <Snow />

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

                    <h1>
                        {theme === 'grinch' ? (
                            <>
                                {t('menu.grinchTitle')}
                            </>
                        ) : t('menu.title')}
                    </h1>

                    <div className="game-selection">
                        <GameCard
                            title={t('menu.snowballTitle')}
                            icon={<GameIcon name="snowflake" size={64} />}
                            instructions={t('menu.snowballDesc')}
                            onPlay={() => startGame('snowball')}
                            disabled={!gamesPlayable}
                        />
                        <GameCard
                            title={t('menu.giftTitle')}
                            icon={<GameIcon name="gift" size={64} />}
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
                        <GameSettings
                            settings={settings}
                            onUpdate={updateSettings}
                            onClose={() => toggleSettings(false)}
                        />
                    )}

                    <div style={{
                        marginTop: '2rem',
                        width: '100%'
                    }}>
                        <Leaderboard
                            scores={highScores}
                            isLoading={isLoadingScores}
                            error={scoreError}
                            onRetry={fetchScores}
                            defaultTime={lastPlayedTime}
                        />
                    </div>

                    <div className="flex flex-col gap-4 items-center mt-8 mb-4">
                        <div className="version-tag" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.4rem 0.6rem'
                        }}>
                            <span>v{pkg.version}</span>
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
                                <GameIcon name="github" size={16} />
                            </a>
                        </div>
                        <Countdown targetDate={GAME_DEADLINE} />
                    </div>
                </div>
            )}

            {gameState === 'playing' && (
                <>
                    {currentGame === 'snowball' && (
                        <SnowballHunt
                            onGameOver={endGame}
                            highScores={highScores}
                            settings={settings}
                            isPaused={isPaused}
                            onPause={pauseGame}
                        />
                    )}
                    {currentGame === 'gift-toss' && (
                        <GiftToss
                            onGameOver={endGame}
                            settings={settings}
                            isPaused={isPaused}
                            onPause={pauseGame}
                        />
                    )}
                    {currentGame === 'reindeer-run' && (
                        <ReindeerRun
                            onGameOver={endGame}
                            settings={settings}
                            isPaused={isPaused}
                            onPause={pauseGame}
                        />
                    )}

                    {isPaused && (
                        <Modal isOpen={true} title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{t('common.pause')} <GameIcon name="timer" size={24} /></div>}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', alignItems: 'center' }}>
                                <Button onClick={resumeGame} style={{ width: '100%' }}>{t('common.continue')}</Button>
                                <Button variant="secondary" onClick={restartGame} style={{ width: '100%' }}>{t('common.restart')}</Button>
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
                        <Leaderboard
                            scores={highScores}
                            isLoading={isLoadingScores}
                            defaultTime={lastPlayedTime}
                        />

                        <Card className="joke-card" style={{ width: '100%' }}>
                            <h2 style={{ fontFamily: 'var(--font-retro)', color: 'var(--primary-color)', margin: '0', fontSize: '1.5rem' }}>{t('game.jokeTitle')}</h2>
                            <p style={{ fontSize: '1rem', fontStyle: 'italic' }}>"{currentJoke}"</p>
                        </Card>

                        <Button onPointerDown={quitGame}>{t('game.toMenu')}</Button>
                    </div>
                </Modal>
            )}
        </div>
    )
}

export default App
