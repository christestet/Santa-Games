import { GAME_CONFIG } from '../constants/gameConfig'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { useLanguage } from './LanguageContext'
import { useSound } from './SoundContext'
import { useTheme } from './ThemeContext'
import GameIcon from './GameIcon'

interface GameSettingsProps {
    settings: typeof GAME_CONFIG;
    onUpdate: (newSettings: typeof GAME_CONFIG) => void;
    onClose: () => void;
}

export default function GameSettings({ settings, onUpdate, onClose }: GameSettingsProps) {
    const { t } = useLanguage();
    const { isMuted, toggleMute } = useSound();
    const { theme, toggleTheme } = useTheme();
    const handleTimerChange = (val: number) => {
        onUpdate({
            ...settings,
            TIMER: Math.max(10, Math.min(300, val))
        });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')} ${t('settings.min')}` : `${secs} ${t('settings.sec')}`;
    };

    const presets = [30, 60, 90, 120];

    return (
        <Modal isOpen={true} onClose={onClose} title={<div className="flex items-center gap-2">{t('settings.title')} <GameIcon name="settings" size={24} /></div>}>
            <div className="flex flex-col gap-2 items-center w-full">
                <label className="text-xl font-bold">
                    {t('settings.duration')}: <span className="text-[var(--primary-color)] text-2xl">{formatTime(settings.TIMER)}</span>
                </label>

                <input
                    type="range"
                    min="10"
                    max="300"
                    step="10"
                    value={settings.TIMER}
                    onChange={(e) => handleTimerChange(parseInt(e.target.value))}
                    className="w-full"
                />

                <div className="preset-container">
                    {presets.map(p => (
                        <Button
                            key={p}
                            variant="secondary"
                            size="small"
                            onClick={() => handleTimerChange(p)}
                            className={`${settings.TIMER === p ? 'opacity-100 border-4 border-[var(--primary-color)]' : 'opacity-60 border-[length:var(--border-width)] border-[var(--card-border)]'}`}
                        >
                            {p}s
                        </Button>
                    ))}
                </div>

                <div className="w-full h-1 bg-[var(--card-border)] opacity-30 my-4" />

                <div className="settings-row">
                    <label className="settings-label">{t('settings.sound')}</label>
                    <div className="settings-btn-group">
                        <Button
                            variant={isMuted ? 'secondary' : 'primary'}
                            size="small"
                            onClick={toggleMute}
                            className="min-w-[100px]"
                        >
                            {isMuted ? <> <GameIcon name="sound_off" size={16} /> {t('settings.soundOff')} </> : <> <GameIcon name="sound_on" size={16} /> {t('settings.soundOn')} </>}
                        </Button>
                    </div>
                </div>

                <div className="settings-row">
                    <label className="settings-label">{t('settings.theme')}</label>
                    <div className="settings-btn-group">
                        <Button
                            variant="secondary"
                            size="small"
                            onClick={toggleTheme}
                            className="min-w-[140px]"
                        >
                            {theme === 'classic' ? <> <GameIcon name="santa" size={16} /> {t('settings.themeClassic')} </> : <> <GameIcon name="grinch" size={16} /> {t('settings.themeGrinch')} </>}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex justify-center gap-4 mt-4">
                <Button onClick={onClose} size="small">
                    {t('common.done')}
                </Button>
            </div>
        </Modal>
    );
}
