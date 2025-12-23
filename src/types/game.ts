
export type GameType = 'snowball' | 'gift-toss' | 'none';
export type GameState = 'menu' | 'playing' | 'name-entry' | 'gameover';

export interface GameSettings {
    duration: number;
    spawnInterval: number;
    [key: string]: any;
}
