import React from 'react';
import { Card } from './Card';

interface ModalProps {
    isOpen: boolean;
    onClose?: () => void; // Optional if we don't want it closable by background click
    title?: React.ReactNode;
    children: React.ReactNode;
    style?: React.CSSProperties; // Pass through style for specific overrides
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, style }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            padding: window.innerWidth <= 375 ? '1rem' : '1.5rem',
            ...style
        }} onClick={(e) => {
            if (e.target === e.currentTarget && onClose) {
                onClose();
            }
        }}>
            <Card title={title} className="modal-content">
                {children}
            </Card>
        </div>
    );
};
