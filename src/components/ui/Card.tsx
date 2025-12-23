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
                <h2 style={{
                    fontFamily: 'var(--font-retro)',
                    color: 'var(--primary-color)',
                    margin: '0 0 1rem 0',
                    fontSize: '2rem',
                    textAlign: 'center',
                    borderBottom: '4px solid var(--card-border)',
                    paddingBottom: '0.5rem'
                }}>
                    {title}
                </h2>
            )}
            {children}
        </div>
    );
};
