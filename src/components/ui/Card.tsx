import React from 'react';

interface CardProps {
    title?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ title, className = '', children, style }) => {
    return (
        <div className={`frost-card ${className}`} style={style}>
            {title && (
                <h2 className="font-[var(--font-retro)] text-[var(--primary-color)] m-0 mb-4 text-[2rem] text-center border-b-4 border-[var(--card-border)] pb-2">
                    {title}
                </h2>
            )}
            {children}
        </div>
    );
};
