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
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm ${
                window.innerWidth <= 375 ? 'p-4' : 'p-6'
            }`}
            style={style}
            onClick={(e) => {
                if (e.target === e.currentTarget && onClose) {
                    onClose();
                }
            }}
        >
            <Card title={title} className="modal-content">
                {children}
            </Card>
        </div>
    );
};
