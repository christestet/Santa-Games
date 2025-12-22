import { GAME_CONFIG } from '../constants/gameConfig'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { useLanguage } from './LanguageContext'
import { useSound } from './SoundContext'

interface GameSettingsProps {
    settings: typeof GAME_CONFIG;
    onUpdate: (newSettings: typeof GAME_CONFIG) => void;
    onClose: () => void;
}

export default function GameSettings({ settings, onUpdate, onClose }: GameSettingsProps) {
    const { t } = useLanguage();
    const { isMuted, toggleMute } = useSound();
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
        <Modal isOpen={true} onClose={onClose} title={t('settings.title')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
                <label style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {t('settings.duration')}: <span style={{ color: 'var(--warm-gold)', fontSize: '1.4rem' }}>{formatTime(settings.TIMER)}</span>
                </label>

                <input
                    type="range"
                    min="10"
                    max="300"
                    step="10"
                    value={settings.TIMER}
                    onChange={(e) => handleTimerChange(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                />

                <div className="preset-container">
                    {presets.map(p => (
                        <Button
                            key={p}
                            variant="secondary"
                            size="small"
                            onClick={() => handleTimerChange(p)}
                            style={{
                                opacity: settings.TIMER === p ? 1 : 0.6,
                                border: settings.TIMER === p ? '2px solid var(--warm-gold)' : '1px solid var(--antique-gold)'
                            }}
                        >
                            {p}s
                        </Button>
                    ))}
                </div>

                <div style={{ width: '100%', height: '1px', background: 'var(--antique-gold)', opacity: 0.3, margin: '1rem 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 1rem' }}>
                    <label style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{t('settings.sound')}</label>
                    <Button
                        variant={isMuted ? 'secondary' : 'primary'}
                        size="small"
                        onClick={toggleMute}
                        style={{ minWidth: '100px' }}
                    >
                        {isMuted ? `🔇 ${t('settings.soundOff')}` : `🔊 ${t('settings.soundOn')}`}
                    </Button>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                <Button onClick={onClose} size="small">
                    {t('common.done')}
                </Button>
            </div>
        </Modal>
    );
}
