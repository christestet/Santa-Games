import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'icon';
    size?: 'small' | 'large';
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'large',
    className = '',
    children,
    ...props
}) => {
    let baseClass = 'btn-start';

    if (variant === 'icon' || size === 'small') {
        baseClass = 'btn-small';
    }

    // Merge custom classNames if provided
    return (
        <button className={`${baseClass} ${className}`} {...props}>
            {children}
        </button>
    );
};
