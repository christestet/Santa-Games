import React from 'react';

// Wir definieren die Namen der Icons als Union Type für perfektes Autocomplete
export type GameIconName =
    | 'santa'
    | 'grinch'
    | 'reindeer'
    | 'tree'
    | 'gift'
    | 'snowflake'
    | 'chimney'
    | 'plane'
    | 'cloud'
    | 'timer'
    | 'coal'
    | 'star'
    | 'flag_us'
    | 'flag_de'
    | 'sound_on'
    | 'sound_off'
    | 'settings'
    | 'trophy'
    | 'parcel'
    | 'pause'
    | 'snowman'
    | 'rock'
    | 'branch';

interface GameIconProps {
    name: GameIconName;
    size?: number;
    className?: string;
    style?: React.CSSProperties;
}

// Typdefinition für das interne Mapping
type SpriteDefinition = {
    content: React.ReactNode;
};

const SPRITES: Record<GameIconName, SpriteDefinition> = {
    santa: {
        content: (
            <>
                <rect x="7" y="0" width="2" height="2" fill="white" />
                <rect x="4" y="1" width="4" height="3" fill="#D32F2F" />
                <rect x="8" y="2" width="3" height="2" fill="#D32F2F" />
                <rect x="3" y="4" width="10" height="2" fill="white" />
                <rect x="4" y="6" width="8" height="3" fill="#FFCCBC" />
                <rect x="5" y="7" width="1" height="1" fill="#2196F3" />
                <rect x="10" y="7" width="1" height="1" fill="#2196F3" />
                <rect x="7" y="8" width="2" height="1" fill="#FFAB91" />
                <rect x="3" y="9" width="10" height="2" fill="white" />
                <rect x="4" y="11" width="8" height="2" fill="white" />
                <rect x="5" y="13" width="6" height="1" fill="white" />
                <rect x="2" y="14" width="12" height="2" fill="#D32F2F" />
            </>
        )
    },
    grinch: {
        content: (
            <>
                {/* Base Head Shape & Skin (Lime Green) */}
                <rect x="5" y="2" width="6" height="11" fill="#76FF03" />
                <rect x="4" y="3" width="8" height="9" fill="#76FF03" />
                <rect x="3" y="5" width="10" height="6" fill="#76FF03" />

                {/* Texture/Fur shading (Darker Green) */}
                <rect x="7" y="1" width="2" height="2" fill="#76FF03" /> {/* Top tuft base */}
                <rect x="7" y="0" width="1" height="1" fill="#64DD17" /> {/* Tip */}

                <rect x="3" y="7" width="1" height="2" fill="#33691E" opacity="0.3" /> {/* Left cheek shadow */}
                <rect x="12" y="7" width="1" height="2" fill="#33691E" opacity="0.3" /> {/* Right cheek shadow */}
                <rect x="5" y="13" width="6" height="1" fill="#33691E" opacity="0.5" /> {/* Chin shadow */}

                {/* Facial Features */}
                {/* Eyes: Yellow with pupils */}
                <rect x="4" y="5" width="3" height="2" fill="#FFEB3B" />
                <rect x="9" y="5" width="3" height="2" fill="#FFEB3B" />
                <rect x="5" y="6" width="1" height="1" fill="#1B5E20" /> {/* Dark pupil */}
                <rect x="10" y="6" width="1" height="1" fill="#1B5E20" />

                {/* Eyebrows: Angry/Mischievous */}
                <rect x="4" y="4" width="3" height="1" fill="#33691E" />
                <rect x="9" y="4" width="3" height="1" fill="#33691E" />
                <rect x="7" y="5" width="2" height="1" fill="#33691E" opacity="0.7" /> {/* Scowl */}

                {/* Nose */}
                <rect x="7" y="8" width="2" height="1" fill="#33691E" />

                {/* Grin: Wide */}
                <rect x="4" y="10" width="1" height="1" fill="#33691E" />
                <rect x="5" y="11" width="6" height="1" fill="#33691E" />
                <rect x="11" y="10" width="1" height="1" fill="#33691E" />

                {/* Smile lines */}
                <rect x="3" y="9" width="1" height="1" fill="#33691E" opacity="0.6" />
                <rect x="12" y="9" width="1" height="1" fill="#33691E" opacity="0.6" />
            </>
        )
    },
    reindeer: {
        content: (
            <>
                <rect x="2" y="1" width="1" height="2" fill="#8D6E63" />
                <rect x="13" y="1" width="1" height="2" fill="#8D6E63" />
                <rect x="1" y="2" width="3" height="1" fill="#8D6E63" />
                <rect x="12" y="2" width="3" height="1" fill="#8D6E63" />
                <rect x="3" y="3" width="1" height="2" fill="#8D6E63" />
                <rect x="12" y="3" width="1" height="2" fill="#8D6E63" />
                <rect x="4" y="4" width="2" height="1" fill="#8D6E63" />
                <rect x="10" y="4" width="2" height="1" fill="#8D6E63" />
                <rect x="5" y="6" width="6" height="7" fill="#A1887F" />
                <rect x="3" y="7" width="2" height="3" fill="#A1887F" />
                <rect x="11" y="7" width="2" height="3" fill="#A1887F" />
                <rect x="6" y="8" width="1" height="1" fill="black" />
                <rect x="9" y="8" width="1" height="1" fill="black" />
                <rect x="6" y="11" width="4" height="3" fill="#D32F2F" />
                <rect x="7" y="12" width="2" height="1" fill="#FF5252" />
            </>
        )
    },
    tree: {
        content: (
            <>
                <rect x="7" y="0" width="2" height="1" fill="#FFC107" />
                <rect x="6" y="1" width="4" height="2" fill="#FFEB3B" />
                <rect x="7" y="3" width="2" height="1" fill="#388E3C" />
                <rect x="6" y="4" width="4" height="2" fill="#2E7D32" />
                <rect x="5" y="6" width="6" height="1" fill="#388E3C" />
                <rect x="4" y="7" width="8" height="2" fill="#2E7D32" />
                <rect x="3" y="9" width="10" height="1" fill="#388E3C" />
                <rect x="2" y="10" width="12" height="3" fill="#2E7D32" />
                <rect x="6" y="13" width="4" height="3" fill="#795548" />
                <rect x="5" y="5" width="1" height="1" fill="#F44336" />
                <rect x="9" y="8" width="1" height="1" fill="#2196F3" />
                <rect x="4" y="11" width="1" height="1" fill="#FFEB3B" />
                <rect x="11" y="10" width="1" height="1" fill="#E91E63" />
            </>
        )
    },
    gift: {
        content: (
            <>
                <rect x="6" y="1" width="4" height="2" fill="#F44336" />
                <rect x="4" y="2" width="2" height="2" fill="#F44336" />
                <rect x="10" y="2" width="2" height="2" fill="#F44336" />
                <rect x="7" y="3" width="2" height="1" fill="#D32F2F" />
                <rect x="2" y="4" width="12" height="11" fill="#4CAF50" />
                <rect x="13" y="5" width="1" height="10" fill="#388E3C" />
                <rect x="2" y="14" width="11" height="1" fill="#388E3C" />
                <rect x="7" y="4" width="2" height="11" fill="#F44336" />
                <rect x="2" y="8" width="12" height="2" fill="#F44336" />
            </>
        )
    },
    snowflake: {
        content: (
            <>
                <rect x="7" y="1" width="2" height="14" fill="#B3E5FC" />
                <rect x="1" y="7" width="14" height="2" fill="#B3E5FC" />
                <rect x="4" y="4" width="2" height="2" fill="#B3E5FC" />
                <rect x="10" y="4" width="2" height="2" fill="#B3E5FC" />
                <rect x="4" y="10" width="2" height="2" fill="#B3E5FC" />
                <rect x="10" y="10" width="2" height="2" fill="#B3E5FC" />
                <rect x="3" y="3" width="1" height="1" fill="#81D4FA" />
                <rect x="12" y="3" width="1" height="1" fill="#81D4FA" />
                <rect x="3" y="12" width="1" height="1" fill="#81D4FA" />
                <rect x="12" y="12" width="1" height="1" fill="#81D4FA" />
            </>
        )
    },
    chimney: {
        content: (
            <>
                <rect x="1" y="2" width="14" height="2" fill="#FFFFFF" />
                <rect x="2" y="4" width="12" height="1" fill="#BCAAA4" />
                <rect x="3" y="5" width="10" height="11" fill="#A52A2A" />
                <rect x="4" y="6" width="3" height="2" fill="#795548" />
                <rect x="9" y="6" width="3" height="2" fill="#795548" />
                <rect x="3" y="9" width="2" height="2" fill="#795548" />
                <rect x="6" y="9" width="4" height="2" fill="#795548" />
                <rect x="11" y="9" width="2" height="2" fill="#795548" />
                <rect x="4" y="12" width="3" height="2" fill="#795548" />
                <rect x="9" y="12" width="3" height="2" fill="#795548" />
                <rect x="3" y="1" width="10" height="2" fill="#3E2723" />
            </>
        )
    },
    plane: {
        content: (
            <>
                <rect x="4" y="6" width="10" height="4" fill="#D32F2F" />
                <rect x="5" y="10" width="8" height="1" fill="#B71C1C" />
                <rect x="2" y="4" width="3" height="3" fill="#D32F2F" />
                <rect x="7" y="3" width="4" height="10" fill="#2E7D32" />
                <rect x="8" y="2" width="2" height="12" fill="#388E3C" />
                <rect x="14" y="7" width="1" height="2" fill="#555" />
                <rect x="15" y="5" width="1" height="6" fill="#999" opacity="0.8" />
                <rect x="11" y="7" width="2" height="2" fill="#81D4FA" />
            </>
        )
    },
    timer: {
        content: (
            <>
                <rect x="3" y="1" width="10" height="2" fill="#795548" />
                <rect x="3" y="13" width="10" height="2" fill="#795548" />
                <rect x="4" y="3" width="8" height="10" fill="#E3F2FD" />
                <rect x="5" y="4" width="6" height="8" fill="#BBDEFB" />
                <rect x="6" y="4" width="4" height="3" fill="#FFC107" />
                <rect x="7" y="7" width="2" height="3" fill="#FFC107" />
                <rect x="5" y="10" width="6" height="2" fill="#FFC107" />
            </>
        )
    },
    coal: {
        content: (
            <>
                <rect x="4" y="6" width="8" height="7" fill="#212121" />
                <rect x="2" y="8" width="12" height="6" fill="#212121" />
                <rect x="5" y="7" width="3" height="2" fill="#424242" />
                <rect x="10" y="9" width="3" height="3" fill="#424242" />
                <rect x="3" y="10" width="2" height="3" fill="#424242" />
                <rect x="8" y="8" width="2" height="2" fill="black" />
                <rect x="6" y="11" width="3" height="1" fill="black" />
            </>
        )
    },
    star: {
        content: (
            <>
                {/* Main star body - base layer */}
                <rect x="7" y="1" width="2" height="14" fill="#FFEB3B" />
                <rect x="1" y="7" width="14" height="2" fill="#FFEB3B" />
                <rect x="3" y="3" width="10" height="10" fill="#FFEB3B" />
                <rect x="5" y="2" width="6" height="12" fill="#FFEB3B" />
                <rect x="2" y="5" width="12" height="6" fill="#FFEB3B" />

                {/* Inner glow - brighter center */}
                <rect x="6" y="6" width="4" height="4" fill="#FFF176" />
                <rect x="7" y="7" width="2" height="2" fill="#FFFDE7" />

                {/* Highlights - top left quadrant (light source) */}
                <rect x="6" y="2" width="2" height="1" fill="#FFF9C4" opacity="0.8" />
                <rect x="5" y="3" width="2" height="2" fill="#FFF176" opacity="0.6" />
                <rect x="2" y="6" width="2" height="1" fill="#FFF9C4" opacity="0.7" />
                <rect x="3" y="5" width="1" height="2" fill="#FFF176" opacity="0.5" />

                {/* Shadows - bottom right quadrant (depth) */}
                <rect x="9" y="13" width="2" height="1" fill="#F9A825" opacity="0.6" />
                <rect x="10" y="10" width="2" height="2" fill="#FBC02D" opacity="0.5" />
                <rect x="13" y="9" width="1" height="2" fill="#F9A825" opacity="0.7" />
                <rect x="11" y="12" width="1" height="1" fill="#F57F17" opacity="0.4" />

                {/* Edge definition - darker tips */}
                <rect x="7" y="0" width="2" height="1" fill="#FBC02D" />
                <rect x="1" y="6" width="1" height="4" fill="#FBC02D" />
                <rect x="14" y="6" width="1" height="4" fill="#FBC02D" />
                <rect x="7" y="15" width="2" height="1" fill="#FBC02D" />

                {/* Diagonal tip shading */}
                <rect x="3" y="3" width="1" height="1" fill="#F9A825" />
                <rect x="12" y="3" width="1" height="1" fill="#F9A825" />
                <rect x="3" y="12" width="1" height="1" fill="#F57F17" />
                <rect x="12" y="12" width="1" height="1" fill="#F57F17" />

                {/* Sparkle effects - small bright spots */}
                <rect x="5" y="5" width="1" height="1" fill="#FFFFFF" opacity="0.9" />
                <rect x="10" y="6" width="1" height="1" fill="#FFFFFF" opacity="0.8" />
                <rect x="6" y="9" width="1" height="1" fill="#FFFFFF" opacity="0.7" />

                {/* Subtle glow lines for dimension */}
                <rect x="7" y="4" width="2" height="1" fill="#FFF9C4" opacity="0.5" />
                <rect x="7" y="11" width="2" height="1" fill="#FBC02D" opacity="0.4" />
                <rect x="4" y="7" width="1" height="2" fill="#FFF9C4" opacity="0.5" />
                <rect x="11" y="7" width="1" height="2" fill="#FBC02D" opacity="0.4" />
            </>
        )
    },
    flag_us: {
        content: (
            <>
                <rect x="1" y="2" width="14" height="12" fill="white" />
                <rect x="1" y="2" width="14" height="1" fill="#B71C1C" />
                <rect x="1" y="4" width="14" height="1" fill="#B71C1C" />
                <rect x="1" y="6" width="14" height="1" fill="#B71C1C" />
                <rect x="1" y="8" width="14" height="1" fill="#B71C1C" />
                <rect x="1" y="10" width="14" height="1" fill="#B71C1C" />
                <rect x="1" y="12" width="14" height="1" fill="#B71C1C" />
                <rect x="1" y="2" width="6" height="5" fill="#0D47A1" />
                <rect x="2" y="3" width="1" height="1" fill="white" />
                <rect x="4" y="3" width="1" height="1" fill="white" />
                <rect x="3" y="5" width="1" height="1" fill="white" />
                <rect x="5" y="5" width="1" height="1" fill="white" />
            </>
        )
    },
    flag_de: {
        content: (
            <>
                <rect x="1" y="3" width="14" height="3" fill="#212121" />
                <rect x="1" y="6" width="14" height="4" fill="#D50000" />
                <rect x="1" y="10" width="14" height="3" fill="#FFC107" />
            </>
        )
    },
    sound_on: {
        content: (
            <>
                {/* Speaker cone - dark outline */}
                <rect x="1" y="5" width="1" height="6" fill="#212121" />
                <rect x="2" y="5" width="3" height="1" fill="#212121" />
                <rect x="2" y="10" width="3" height="1" fill="#212121" />
                <rect x="5" y="3" width="3" height="1" fill="#212121" />
                <rect x="5" y="12" width="3" height="1" fill="#212121" />
                <rect x="8" y="4" width="1" height="8" fill="#212121" />

                {/* Speaker cone - main body */}
                <rect x="2" y="6" width="3" height="4" fill="#757575" />
                <rect x="5" y="4" width="3" height="8" fill="#757575" />

                {/* Speaker cone - highlights for depth */}
                <rect x="2" y="6" width="1" height="2" fill="#9E9E9E" opacity="0.8" />
                <rect x="5" y="4" width="1" height="3" fill="#9E9E9E" opacity="0.6" />

                {/* Speaker cone - shadows */}
                <rect x="4" y="8" width="1" height="2" fill="#424242" opacity="0.6" />
                <rect x="7" y="9" width="1" height="3" fill="#424242" opacity="0.5" />

                {/* Sound wave 1 - outline */}
                <rect x="9" y="4" width="1" height="1" fill="#212121" />
                <rect x="9" y="11" width="1" height="1" fill="#212121" />
                <rect x="10" y="5" width="1" height="6" fill="#212121" />

                {/* Sound wave 1 - fill */}
                <rect x="9" y="5" width="1" height="6" fill="#757575" />

                {/* Sound wave 2 - outline */}
                <rect x="11" y="2" width="1" height="1" fill="#212121" />
                <rect x="11" y="13" width="1" height="1" fill="#212121" />
                <rect x="12" y="3" width="1" height="10" fill="#212121" />

                {/* Sound wave 2 - fill */}
                <rect x="11" y="3" width="1" height="10" fill="#757575" />

                {/* Sound wave 3 - outline */}
                <rect x="13" y="0" width="1" height="1" fill="#212121" />
                <rect x="13" y="15" width="1" height="1" fill="#212121" />
                <rect x="14" y="1" width="1" height="14" fill="#212121" />

                {/* Sound wave 3 - fill */}
                <rect x="13" y="1" width="1" height="14" fill="#757575" />

                {/* Wave highlights for dimension */}
                <rect x="9" y="5" width="1" height="2" fill="#9E9E9E" opacity="0.7" />
                <rect x="11" y="3" width="1" height="3" fill="#9E9E9E" opacity="0.6" />
                <rect x="13" y="1" width="1" height="4" fill="#9E9E9E" opacity="0.5" />
            </>
        )
    },
    sound_off: {
        content: (
            <>
                {/* Speaker cone - dark outline */}
                <rect x="1" y="5" width="1" height="6" fill="#212121" />
                <rect x="2" y="5" width="3" height="1" fill="#212121" />
                <rect x="2" y="10" width="3" height="1" fill="#212121" />
                <rect x="5" y="3" width="3" height="1" fill="#212121" />
                <rect x="5" y="12" width="3" height="1" fill="#212121" />
                <rect x="8" y="4" width="1" height="8" fill="#212121" />

                {/* Speaker cone - main body (muted grey) */}
                <rect x="2" y="6" width="3" height="4" fill="#9E9E9E" />
                <rect x="5" y="4" width="3" height="8" fill="#9E9E9E" />

                {/* Speaker cone - highlights */}
                <rect x="2" y="6" width="1" height="2" fill="#BDBDBD" opacity="0.7" />
                <rect x="5" y="4" width="1" height="3" fill="#BDBDBD" opacity="0.5" />

                {/* Speaker cone - shadows */}
                <rect x="4" y="8" width="1" height="2" fill="#616161" opacity="0.6" />
                <rect x="7" y="9" width="1" height="3" fill="#616161" opacity="0.5" />

                {/* X mark - black outline for crisp definition */}
                <rect x="9" y="4" width="1" height="1" fill="#000000" />
                <rect x="10" y="5" width="1" height="1" fill="#000000" />
                <rect x="11" y="6" width="1" height="1" fill="#000000" />
                <rect x="12" y="7" width="1" height="1" fill="#000000" />
                <rect x="13" y="8" width="1" height="1" fill="#000000" />
                <rect x="12" y="9" width="1" height="1" fill="#000000" />
                <rect x="11" y="10" width="1" height="1" fill="#000000" />
                <rect x="10" y="11" width="1" height="1" fill="#000000" />
                <rect x="9" y="12" width="1" height="1" fill="#000000" />

                <rect x="13" y="4" width="1" height="1" fill="#000000" />
                <rect x="12" y="5" width="1" height="1" fill="#000000" />
                <rect x="11" y="6" width="1" height="1" fill="#000000" />
                <rect x="10" y="7" width="1" height="1" fill="#000000" />
                <rect x="9" y="8" width="1" height="1" fill="#000000" />
                <rect x="10" y="9" width="1" height="1" fill="#000000" />
                <rect x="11" y="10" width="1" height="1" fill="#000000" />
                <rect x="12" y="11" width="1" height="1" fill="#000000" />
                <rect x="13" y="12" width="1" height="1" fill="#000000" />

                {/* X mark - red fill (slightly inset from outline) */}
                <rect x="10" y="5" width="1" height="1" fill="#D32F2F" />
                <rect x="11" y="6" width="1" height="1" fill="#D32F2F" />
                <rect x="12" y="7" width="1" height="1" fill="#D32F2F" />
                <rect x="11" y="8" width="1" height="1" fill="#D32F2F" />
                <rect x="12" y="9" width="1" height="1" fill="#D32F2F" />
                <rect x="11" y="10" width="1" height="1" fill="#D32F2F" />
                <rect x="10" y="11" width="1" height="1" fill="#D32F2F" />

                <rect x="12" y="5" width="1" height="1" fill="#D32F2F" />
                <rect x="11" y="6" width="1" height="1" fill="#D32F2F" />
                <rect x="10" y="7" width="1" height="1" fill="#D32F2F" />
                <rect x="11" y="8" width="1" height="1" fill="#D32F2F" />
                <rect x="10" y="9" width="1" height="1" fill="#D32F2F" />
                <rect x="11" y="10" width="1" height="1" fill="#D32F2F" />
                <rect x="12" y="11" width="1" height="1" fill="#D32F2F" />

                {/* X mark - highlights for shine */}
                <rect x="10" y="5" width="1" height="1" fill="#EF5350" opacity="0.8" />
                <rect x="12" y="5" width="1" height="1" fill="#EF5350" opacity="0.8" />
                <rect x="11" y="6" width="1" height="1" fill="#EF5350" opacity="0.6" />
            </>
        )
    },
    settings: {
        content: (
            <>
                {/* Main Gear Body (Dark Grey) */}
                <rect x="5" y="4" width="6" height="8" fill="#757575" />
                <rect x="4" y="5" width="8" height="6" fill="#757575" />

                {/* Teeth (Lighter/Metal Grey) - Cardinal Directions */}
                <rect x="6" y="1" width="4" height="2" fill="#9E9E9E" /> {/* Top */}
                <rect x="6" y="13" width="4" height="2" fill="#9E9E9E" /> {/* Bottom */}
                <rect x="1" y="6" width="2" height="4" fill="#9E9E9E" /> {/* Left */}
                <rect x="13" y="6" width="2" height="4" fill="#9E9E9E" /> {/* Right */}

                {/* Teeth - Diagonals */}
                <rect x="3" y="3" width="2" height="2" fill="#9E9E9E" />
                <rect x="11" y="3" width="2" height="2" fill="#9E9E9E" />
                <rect x="3" y="11" width="2" height="2" fill="#9E9E9E" />
                <rect x="11" y="11" width="2" height="2" fill="#9E9E9E" />

                {/* Inner Ring/Depression (Darker) */}
                <rect x="6" y="6" width="4" height="4" fill="#616161" />

                {/* Center Hole (Very Dark/Black) */}
                <rect x="7" y="7" width="2" height="2" fill="#212121" />

                {/* Highlights for metallic feel */}
                <rect x="6" y="1" width="4" height="1" fill="#E0E0E0" opacity="0.5" />
                <rect x="3" y="3" width="1" height="1" fill="#E0E0E0" opacity="0.5" />

                {/* Shadows for depth */}
                <rect x="6" y="14" width="4" height="1" fill="#424242" opacity="0.5" />
                <rect x="7" y="10" width="2" height="1" fill="#424242" opacity="0.5" />
            </>
        )
    },
    trophy: {
        content: (
            <>
                <rect x="4" y="2" width="8" height="6" fill="#FFC107" />
                <rect x="3" y="2" width="10" height="2" fill="#FFD54F" />
                <rect x="6" y="8" width="4" height="3" fill="#FFC107" />
                <rect x="5" y="11" width="6" height="2" fill="#FFA000" />
                <rect x="2" y="3" width="2" height="3" fill="#FFD54F" />
                <rect x="12" y="3" width="2" height="3" fill="#FFD54F" />
            </>
        )
    },
    cloud: {
        content: (
            <>
                <rect x="4" y="6" width="8" height="6" fill="white" />
                <rect x="2" y="8" width="12" height="4" fill="white" />
                <rect x="5" y="5" width="4" height="2" fill="white" />
            </>
        )
    },
    parcel: {
        content: (
            <>
                <rect x="3" y="4" width="10" height="9" fill="#8D6E63" />
                <rect x="3" y="4" width="10" height="2" fill="#A1887F" />
                <rect x="2" y="5" width="12" height="2" fill="#5D4037" opacity="0.2" />
                <path d="M 5 9 C 6 11 10 11 11 9" stroke="#0859e5ff" strokeWidth="1" fill="none" />
                <rect x="7" y="4" width="2" height="9" fill="#4E342E" opacity="0.3" />
            </>
        )
    },
    pause: {
        content: (
            <>
                <rect x="5" y="4" width="2" height="8" fill="white" />
                <rect x="9" y="4" width="2" height="8" fill="white" />
            </>
        )
    },
    snowman: {
        content: (
            <>
                {/* Bottom snowball */}
                <rect x="5" y="10" width="6" height="5" fill="#F5F5F5" />
                <rect x="4" y="11" width="8" height="3" fill="#F5F5F5" />

                {/* Middle snowball */}
                <rect x="6" y="7" width="4" height="4" fill="#F5F5F5" />
                <rect x="5" y="8" width="6" height="2" fill="#F5F5F5" />

                {/* Head */}
                <rect x="6" y="4" width="4" height="4" fill="#F5F5F5" />
                <rect x="7" y="3" width="2" height="1" fill="#F5F5F5" />

                {/* Eyes */}
                <rect x="7" y="5" width="1" height="1" fill="#212121" />
                <rect x="8" y="5" width="1" height="1" fill="#212121" />

                {/* Carrot nose */}
                <rect x="7" y="6" width="2" height="1" fill="#FF6F00" />

                {/* Buttons */}
                <rect x="7" y="8" width="2" height="1" fill="#212121" />
                <rect x="7" y="11" width="2" height="1" fill="#212121" />

                {/* Hat */}
                <rect x="5" y="2" width="6" height="1" fill="#212121" />
                <rect x="6" y="0" width="4" height="3" fill="#212121" />

                {/* Arms (sticks) */}
                <rect x="4" y="8" width="1" height="1" fill="#795548" />
                <rect x="3" y="7" width="1" height="1" fill="#795548" />
                <rect x="11" y="8" width="1" height="1" fill="#795548" />
                <rect x="12" y="7" width="1" height="1" fill="#795548" />
            </>
        )
    },
    rock: {
        content: (
            <>
                {/* Main rock body */}
                <rect x="4" y="9" width="8" height="6" fill="#757575" />
                <rect x="3" y="10" width="10" height="4" fill="#757575" />
                <rect x="5" y="8" width="6" height="2" fill="#757575" />

                {/* Highlights (lighter grey) */}
                <rect x="5" y="8" width="2" height="1" fill="#9E9E9E" />
                <rect x="4" y="10" width="3" height="2" fill="#9E9E9E" />
                <rect x="6" y="9" width="2" height="1" fill="#BDBDBD" />

                {/* Shadows (darker grey) */}
                <rect x="9" y="12" width="3" height="2" fill="#616161" />
                <rect x="10" y="10" width="2" height="2" fill="#616161" />
                <rect x="5" y="14" width="6" height="1" fill="#424242" />

                {/* Cracks/texture */}
                <rect x="7" y="11" width="1" height="2" fill="#424242" opacity="0.5" />
                <rect x="9" y="9" width="1" height="1" fill="#424242" opacity="0.3" />
            </>
        )
    },
    branch: {
        content: (
            <>
                {/* Main horizontal branch */}
                <rect x="0" y="7" width="16" height="2" fill="#795548" />
                <rect x="0" y="8" width="16" height="1" fill="#5D4037" />

                {/* Small twigs sticking out */}
                <rect x="3" y="6" width="1" height="1" fill="#795548" />
                <rect x="2" y="5" width="1" height="1" fill="#795548" />

                <rect x="7" y="6" width="1" height="1" fill="#795548" />
                <rect x="6" y="5" width="1" height="1" fill="#795548" />

                <rect x="11" y="6" width="1" height="1" fill="#795548" />
                <rect x="12" y="5" width="1" height="1" fill="#795548" />

                <rect x="4" y="9" width="1" height="1" fill="#795548" />
                <rect x="3" y="10" width="1" height="1" fill="#795548" />

                <rect x="9" y="9" width="1" height="1" fill="#795548" />
                <rect x="10" y="10" width="1" height="1" fill="#795548" />

                <rect x="13" y="9" width="1" height="1" fill="#795548" />
                <rect x="14" y="10" width="1" height="1" fill="#795548" />

                {/* Snow on top */}
                <rect x="1" y="6" width="2" height="1" fill="#FFFFFF" />
                <rect x="5" y="6" width="3" height="1" fill="#FFFFFF" />
                <rect x="10" y="6" width="2" height="1" fill="#FFFFFF" />
                <rect x="13" y="6" width="2" height="1" fill="#FFFFFF" />
            </>
        )
    }
};

const GameIcon: React.FC<GameIconProps> = ({
    name,
    size = 40,
    className = "",
    style
}) => {
    const sprite = SPRITES[name];

    if (!sprite) return null;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            shapeRendering="crispEdges"
            className={className}
            style={{
                display: 'inline-block',
                verticalAlign: 'middle',
                ...style
            }}
        >
            {sprite.content}
        </svg>
    );
};

export default GameIcon;