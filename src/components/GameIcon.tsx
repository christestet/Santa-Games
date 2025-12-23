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
    | 'trophy';

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
                <rect x="6" y="1" width="4" height="1" fill="#76FF03" />
                <rect x="4" y="2" width="8" height="2" fill="#76FF03" />
                <rect x="2" y="4" width="12" height="6" fill="#76FF03" />
                <rect x="3" y="10" width="10" height="3" fill="#76FF03" />
                <rect x="5" y="13" width="6" height="2" fill="#76FF03" />
                <rect x="4" y="5" width="3" height="2" fill="#FFEB3B" />
                <rect x="9" y="5" width="3" height="2" fill="#FFEB3B" />
                <rect x="5" y="6" width="1" height="1" fill="black" />
                <rect x="10" y="6" width="1" height="1" fill="black" />
                <rect x="4" y="4" width="3" height="1" fill="#33691E" />
                <rect x="9" y="4" width="3" height="1" fill="#33691E" />
                <rect x="7" y="8" width="2" height="1" fill="#33691E" />
                <rect x="3" y="11" width="1" height="1" fill="#33691E" />
                <rect x="4" y="12" width="2" height="1" fill="#33691E" />
                <rect x="6" y="11" width="4" height="1" fill="#33691E" />
                <rect x="10" y="12" width="2" height="1" fill="#33691E" />
                <rect x="12" y="11" width="1" height="1" fill="#33691E" />
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
                <rect x="7" y="1" width="2" height="14" fill="#FFEB3B" />
                <rect x="1" y="7" width="14" height="2" fill="#FFEB3B" />
                <rect x="3" y="3" width="10" height="10" fill="#FFEB3B" />
                <rect x="5" y="2" width="6" height="12" fill="#FFEB3B" />
                <rect x="2" y="5" width="12" height="6" fill="#FFEB3B" />
                <rect x="6" y="6" width="4" height="4" fill="#FFF176" />
                <rect x="7" y="0" width="2" height="1" fill="#FBC02D" />
                <rect x="1" y="6" width="1" height="4" fill="#FBC02D" />
                <rect x="14" y="6" width="1" height="4" fill="#FBC02D" />
                <rect x="7" y="15" width="2" height="1" fill="#FBC02D" />
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
                <rect x="2" y="6" width="3" height="4" fill="#757575" />
                <rect x="5" y="4" width="3" height="8" fill="#757575" />
                <rect x="9" y="5" width="1" height="6" fill="#757575" />
                <rect x="11" y="3" width="1" height="10" fill="#757575" />
                <rect x="13" y="1" width="1" height="14" fill="#757575" />
            </>
        )
    },
    sound_off: {
        content: (
            <>
                <rect x="2" y="6" width="3" height="4" fill="#9E9E9E" />
                <rect x="5" y="4" width="3" height="8" fill="#9E9E9E" />
                <rect x="10" y="5" width="1" height="6" fill="#D32F2F" transform="rotate(45 10.5 8)" />
                <rect x="10" y="5" width="1" height="6" fill="#D32F2F" transform="rotate(-45 10.5 8)" />
                <path d="M 9 5 L 14 11 M 14 5 L 9 11" stroke="#D32F2F" strokeWidth="1.5" />
            </>
        )
    },
    settings: {
        content: (
            <>
                <rect x="6" y="2" width="4" height="12" fill="#616161" />
                <rect x="2" y="6" width="12" height="4" fill="#616161" />
                <rect x="4" y="4" width="8" height="8" fill="#757575" />
                <rect x="7" y="7" width="2" height="2" fill="#212121" />
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